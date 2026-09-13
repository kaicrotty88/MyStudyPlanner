import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Plan = "free" | "premium";

type StatusRequestBody = {
  sessionId?: string;
};

type ProfileRow = {
  user_id: string;
  plan: Plan;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  has_completed_onboarding: boolean;
  onboarding_completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

const PROFILE_SELECT =
  "user_id, plan, subscription_status, stripe_customer_id, stripe_subscription_id, has_completed_onboarding, onboarding_completed_at, created_at, updated_at";

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

  return null;
}

async function readOrCreateProfile(userId: string): Promise<ProfileRow> {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing as ProfileRow;

  const now = new Date().toISOString();
  const { data: created, error: createError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        plan: "free",
        subscription_status: "inactive",
        has_completed_onboarding: true,
        onboarding_completed_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" }
    )
    .select(PROFILE_SELECT)
    .single();

  if (createError) throw createError;
  return created as ProfileRow;
}

async function saveSubscriptionProfile(params: {
  userId: string;
  plan: Plan;
  subscriptionStatus: string;
  customerId: string | null;
  subscriptionId: string | null;
}) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: params.userId,
        plan: params.plan,
        subscription_status: params.subscriptionStatus,
        stripe_customer_id: params.customerId,
        stripe_subscription_id: params.subscriptionId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select(PROFILE_SELECT)
    .single();

  if (error) throw error;
  return data as ProfileRow;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as StatusRequestBody | null;
    let profile = await readOrCreateProfile(userId);

    // If Supabase already knows this account is Premium and active, trust that
    // immediately. This avoids making a Stripe request on every normal app load.
    if (
      !body?.sessionId &&
      profile.plan === "premium" &&
      (profile.subscription_status === "active" ||
        profile.subscription_status === "trialing")
    ) {
      return NextResponse.json({
        plan: "premium" as const,
        subscriptionStatus: profile.subscription_status,
        profile,
        recovered: false,
      });
    }

    let customerId = profile.stripe_customer_id;
    let subscriptionId = profile.stripe_subscription_id;
    let subscription: Stripe.Subscription | null = null;
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
    }

    if (subscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      } catch (error) {
        console.warn("Saved Stripe subscription could not be retrieved:", error);
        subscription = null;
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
          subscriptionId = subscription.id;

          if (subscription.metadata?.clerkUserId !== userId) {
            subscription = await stripe.subscriptions.update(subscription.id, {
              metadata: { ...subscription.metadata, clerkUserId: userId },
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
      // No Stripe subscription was found. Keep the existing server-side profile
      // instead of trying to create/read it from the browser.
      return NextResponse.json({
        plan: profile.plan,
        subscriptionStatus: profile.subscription_status,
        profile,
        recovered: false,
      });
    }

    const premium = isPremiumStatus(subscription.status);
    customerId = getCustomerId(subscription.customer) ?? customerId;

    profile = await saveSubscriptionProfile({
      userId,
      plan: premium ? "premium" : "free",
      subscriptionStatus: subscription.status,
      customerId,
      subscriptionId: subscription.id,
    });

    return NextResponse.json({
      plan: profile.plan,
      subscriptionStatus: profile.subscription_status,
      profile,
      recovered,
    });
  } catch (error) {
    console.error("Stripe/profile status error:", error);
    return NextResponse.json(
      { error: "Could not load account status." },
      { status: 500 }
    );
  }
}