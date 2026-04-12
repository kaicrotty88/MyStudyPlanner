// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  return secret;
}

async function upsertSubscriptionState(params: {
  clerkUserId: string;
  plan: "free" | "premium";
  subscriptionStatus: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: params.clerkUserId,
      plan: params.plan,
      subscription_status: params.subscriptionStatus,
      stripe_customer_id: params.stripeCustomerId ?? null,
      stripe_subscription_id: params.stripeSubscriptionId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

function getClerkUserIdFromSubscription(subscription: Stripe.Subscription) {
  const fromMetadata = subscription.metadata?.clerkUserId;
  if (fromMetadata) return fromMetadata;

  return null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") break;

        const clerkUserId =
          session.metadata?.clerkUserId ??
          session.client_reference_id ??
          null;

        if (!clerkUserId) break;

        await upsertSubscriptionState({
          clerkUserId,
          plan: "premium",
          subscriptionStatus: "active",
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserId = getClerkUserIdFromSubscription(subscription);

        if (!clerkUserId) break;

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        await upsertSubscriptionState({
          clerkUserId,
          plan: isActive ? "premium" : "free",
          subscriptionStatus: subscription.status,
          stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clerkUserId = getClerkUserIdFromSubscription(subscription);

        if (!clerkUserId) break;

        await upsertSubscriptionState({
          clerkUserId,
          plan: "free",
          subscriptionStatus: subscription.status,
          stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
        });

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}