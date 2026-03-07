/**
 * lib/payments/stripeClient.ts
 * Singleton Stripe client + price/product config for CORE and VIP tiers.
 *
 * Pricing IDs must be created in your Stripe dashboard and set in .env:
 *   STRIPE_PRICE_CORE_MONTHLY  — CORE plan monthly price ID (e.g. price_xxx)
 *   STRIPE_PRICE_VIP_QUARTERLY — VIP plan quarterly price ID (e.g. price_xxx)
 */

import Stripe from "stripe";

// Lazy singleton — only instantiated when STRIPE_SECRET_KEY is present.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  return _stripe;
}

export const STRIPE_PRICES = {
  CORE: process.env.STRIPE_PRICE_CORE_MONTHLY ?? "",
  VIP: process.env.STRIPE_PRICE_VIP_QUARTERLY ?? "",
} as const;

export const TIER_LABELS = {
  CORE: { name: "Core", price: "$9.99", interval: "/ month" },
  VIP: { name: "VIP", price: "$149", interval: "/ quarter" },
} as const;
