// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { stripe, getAppUrl, getStripePriceId, type BillingInterval } from "@/lib/stripe";

type CheckoutRequestBody = {
  interval?: BillingInterval;
};

function getBillingInterval(body: CheckoutRequestBody | null | undefined): BillingInterval {
  return body?.interval === "yearly" ? "yearly" : "monthly";
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as CheckoutRequestBody | null;
    const interval = getBillingInterval(body);

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? undefined;

    const appUrl = getAppUrl();
    const priceId = getStripePriceId(interval);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/app?checkout=success`,
      cancel_url: `${appUrl}/app?checkout=cancelled`,
      client_reference_id: userId,
      customer_email: email,
      metadata: {
        clerkUserId: userId,
        billingInterval: interval,
      },
      subscription_data: {
        metadata: {
          clerkUserId: userId,
          billingInterval: interval,
        },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}