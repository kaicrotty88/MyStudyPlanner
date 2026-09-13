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

const getCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) => (typeof customer === "string" ? customer : customer?.id ?? null);

const normaliseEmail = (value: string) => value.trim().toLowerCase();

async function findActiveSubscriptionForEmail(email: string) {
  const normalisedEmail = normaliseEmail(email);
  const customers = await stripe.customers.list({ email, limit: 100 });

  for (const customer of customers.data) {
    if (!customer.email || normaliseEmail(customer.email) !== normalisedEmail) continue;

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 100,
    });

    const activeSubscription = subscriptions.data
      .filter((subscription) => isPremiumStatus(subscription.status))
      .sort((a, b) => b.created - a.created)[0];

    if (activeSubscription) {
      return { customer, subscription: activeSubscription };
    }
  }

  // Secondary recovery path for older purchases where the Stripe customer record
  // was not populated as expected. This is bounded to recent checkout sessions and
  // still requires an exact email match to the signed-in Clerk account.
  const sessions = await stripe.checkout.sessions.list({ limit: 100 });

  for (const session of sessions.data) {
    if (session.mode !== "subscription" || session.status !== "complete") continue;

    const sessionEmail = session.customer_details?.email ?? session.customer_email;
    if (!sessionEmail || normaliseEmail(sessionEmail) !== normalisedEmail) continue;

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;

    if (!subscriptionId) continue;

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (!isPremiumStatus(subscription.status)) continue;

      const customerId = getCustomerId(subscription.customer);
      if (!customerId) continue;

      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) continue;

      return { customer, subscription };
    } catch (error) {
      console.warn("Could not inspect checkout subscription during recovery:", error);
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
    let recovered = false;

    if (body?.sessionId) {
      const session = await stripe.checkout.sessions.retrieve(body.sessionId);
      const sessionUserId =
        session.metadata?.clerkUserId ?? session.client_reference_id ?? null;

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
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const subscriptionUserId = subscription.metadata?.clerkUserId ?? null;
        if (subscriptionUserId && subscriptionUserId !== userId) {
          // Do not fail the whole sync here. The saved ID may belong to an older
          // Clerk account or stale environment. Email recovery below can safely
          // repair the link for the currently authenticated account.
          subscription = null;
          subscriptionId = null;
        }
      } catch (error) {
        console.warn("Saved Stripe subscription could not be retrieved:", error);
        subscription = null;
        subscriptionId = null;
      }
    }

    if (!subscription || !isPremiumStatus(subscription.status)) {
      const user = await currentUser();
      const primaryEmail =
        user?.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
          ?.emailAddress ??
        user?.emailAddresses.find((item) => item.verification?.status === "verified")
          ?.emailAddress ??
        user?.emailAddresses[0]?.emailAddress ??
        null;

      if (primaryEmail) {
        const recoveredSubscription = await findActiveSubscriptionForEmail(primaryEmail);

        if (recoveredSubscription) {
          recovered = true;
          customerId = recoveredSubscription.customer.id;
          subscription = recoveredSubscription.subscription;
          subscriptionId = recoveredSubscription.subscription.id;

          if (subscription.metadata?.clerkUserId !== userId) {
            subscription = await stripe.subscriptions.update(subscription.id, {
              metadata: {
                ...subscription.metadata,
                clerkUserId: userId,
              },
            });
          }

          if (recoveredSubscription.customer.metadata?.clerkUserId !== userId) {
            await stripe.customers.update(recoveredSubscription.customer.id, {
              metadata: {
                ...recoveredSubscription.customer.metadata,
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
      recovered,
      stripeCustomerLinked: Boolean(resolvedCustomerId),
    });
  } catch (error) {
    console.error("Stripe status sync error:", error);
    return NextResponse.json(
      { error: "Could not sync billing status." },
      { status: 500 }
    );
  }
}