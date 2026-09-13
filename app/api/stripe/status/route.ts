import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type StatusRequestBody = {
  sessionId?: string;
};

const isPremiumStatus = (status: Stripe.Subscription.Status) =>
  status === "active" || status === "trialing";

const getCustomerId = (customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) =>
  typeof customer === "string" ? customer : customer?.id ?? null;

async function findActiveSubscriptionForEmail(email: string, userId: string) {
  const customers = await stripe.customers.list({ email, limit: 100 });

  for (const customer of customers.data) {
    if (customer.email?.trim().toLowerCase() !== email.trim().toLowerCase()) continue;

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 100,
    });

    const activeSubscription = subscriptions.data
      .filter((subscription) => {
        const linkedUserId = subscription.metadata?.clerkUserId;
        return isPremiumStatus(subscription.status) && (!linkedUserId || linkedUserId === userId);
      })
      .sort((a, b) => b.created - a.created)[0];

    if (activeSubscription) {
      return { customer, subscription: activeSubscription };
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as StatusRequestBody | null;
    const supabase = getSupabaseAdmin();

    let customerId: string | null = null;
    let subscriptionId: string | null = null;

    if (body?.sessionId) {
      const session = await stripe.checkout.sessions.retrieve(body.sessionId);
      const sessionUserId = session.metadata?.clerkUserId ?? session.client_reference_id ?? null;

      if (sessionUserId !== userId) {
        return NextResponse.json(
          { error: "Checkout session does not belong to this account." },
          { status: 403 }
        );
      }

      if (session.mode !== "subscription") {
        return NextResponse.json(
          { error: "Checkout session is not a subscription." },
          { status: 400 }
        );
      }

      customerId = getCustomerId(session.customer);
      subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .select("stripe_customer_id, stripe_subscription_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      customerId = data?.stripe_customer_id ?? null;
      subscriptionId = data?.stripe_subscription_id ?? null;
    }

    let subscription: Stripe.Subscription | null = null;

    if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const subscriptionUserId = subscription.metadata?.clerkUserId ?? null;
      if (subscriptionUserId && subscriptionUserId !== userId) {
        return NextResponse.json(
          { error: "Subscription does not belong to this account." },
          { status: 403 }
        );
      }
    }

    // Recovery path for purchases that succeeded in Stripe but were never linked
    // back to the Supabase profile (for example if the webhook was missed).
    if (!subscription || !isPremiumStatus(subscription.status)) {
      const user = await currentUser();
      const primaryEmail =
        user?.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress ??
        user?.emailAddresses[0]?.emailAddress ??
        null;

      if (primaryEmail) {
        const recovered = await findActiveSubscriptionForEmail(primaryEmail, userId);

        if (recovered) {
          customerId = recovered.customer.id;
          subscription = recovered.subscription;
          subscriptionId = recovered.subscription.id;

          if (subscription.metadata?.clerkUserId !== userId) {
            subscription = await stripe.subscriptions.update(subscription.id, {
              metadata: {
                ...subscription.metadata,
                clerkUserId: userId,
              },
            });
          }

          if (recovered.customer.metadata?.clerkUserId !== userId) {
            await stripe.customers.update(recovered.customer.id, {
              metadata: {
                ...recovered.customer.metadata,
                clerkUserId: userId,
              },
            });
          }
        }
      }
    }

    if (!subscription) {
      return NextResponse.json({
        plan: "free",
        subscriptionStatus: "inactive",
        recovered: false,
      });
    }

    const premium = isPremiumStatus(subscription.status);
    const resolvedCustomerId = getCustomerId(subscription.customer) ?? customerId;

    const { error: updateError } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        plan: premium ? "premium" : "free",
        subscription_status: subscription.status,
        stripe_customer_id: resolvedCustomerId,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (updateError) throw updateError;

    return NextResponse.json({
      plan: premium ? "premium" : "free",
      subscriptionStatus: subscription.status,
      recovered: premium && !body?.sessionId,
    });
  } catch (error) {
    console.error("Stripe status sync error:", error);
    return NextResponse.json({ error: "Could not sync billing status." }, { status: 500 });
  }
}