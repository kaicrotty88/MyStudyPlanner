// lib/stripe.ts
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY.");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2025-08-27.basil",
});

export type BillingInterval = "monthly" | "yearly";

export function getStripePriceId(interval: BillingInterval) {
  const priceId =
    interval === "yearly"
      ? process.env.STRIPE_PRICE_PREMIUM_ANNUALLY_ID
      : process.env.STRIPE_PRICE_PREMIUM_MONTHLY_ID;

  if (!priceId) {
    throw new Error(
      interval === "yearly"
        ? "Missing STRIPE_PRICE_PREMIUM_ANNUALLY_ID."
        : "Missing STRIPE_PRICE_PREMIUM_MONTHLY_ID."
    );
  }

  return priceId;
}

export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL.");
  }

  return appUrl;
}