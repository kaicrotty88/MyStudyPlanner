import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type StatusRequestBody = {
  sessionId?: string;
};

const isPremiumStatus = (status: Stripe.Subscription.Status) =>
  status === "active" || status === "trialing";

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
        return NextResponse.json({ error: "Checkout session does not belong to this account." }, { status: 403 });
      }

      if (session.mode !== "subscription") {
        return NextResponse.json({ error: "Checkout session is not a subscription." }, { status: 400 });
      }

      customerId = typeof session.customer === "string" ? session.customer : null;
      subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
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

    if (!subscriptionId) {
      return NextResponse.json({ error: "No subscription found for this account." }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionUserId = subscription.metadata?.clerkUserId ?? null;

    if (subscriptionUserId && subscriptionUserId !== userId) {
      return NextResponse.json({ error: "Subscription does not belong to this account." }, { status: 403 });
    }

    const premium = isPremiumStatus(subscription.status);
    const resolvedCustomerId =
      typeof subscription.customer === "string" ? subscription.customer : customerId;

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
    });
  } catch (error) {
    console.error("Stripe status sync error:", error);
    return NextResponse.json({ error: "Could not sync billing status." }, { status: 500 });
  }
}