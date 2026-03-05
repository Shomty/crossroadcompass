/**
 * lib/payments/mockPaymentService.ts
 *
 * Development-only mock payment layer.
 * Any card number, expiry, and CVC will succeed.
 * Use card number "0000 0000 0000 0000" to simulate a declined payment for
 * testing error flows.
 *
 * TODO (task #11): replace this entire file with real Stripe integration:
 *   - npm install stripe
 *   - lib/payments/stripeService.ts  →  createCheckoutSession, handleWebhook
 *   - Stripe webhook handler at app/api/webhooks/stripe/route.ts
 *   - Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in env
 *   - Remove this file
 */

import { SubscriptionTier } from "@prisma/client";

export interface CardInput {
  number: string;   // any value accepted in mock
  expiry: string;   // MM/YY
  cvc: string;      // any value
  name: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  error?: string;
}

const DECLINE_CARD = "0000000000000000";

/**
 * Simulates a payment charge. Always succeeds unless card number is all zeros.
 */
export async function mockCharge(
  card: CardInput,
  amountCents: number,
  tier: SubscriptionTier
): Promise<PaymentResult> {
  const normalized = card.number.replace(/\s/g, "");

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 400));

  if (normalized === DECLINE_CARD) {
    return {
      success: false,
      transactionId: "",
      error: "Your card was declined.",
    };
  }

  const transactionId = `mock_${tier}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;

  console.log(
    `[MockPayment] Charged ${amountCents / 100} for tier=${tier} txn=${transactionId}`
  );

  return { success: true, transactionId };
}

/** Price table — replace with real Stripe price IDs in task #11 */
export const TIER_PRICES: Record<
  Exclude<SubscriptionTier, "FREE">,
  { amountCents: number; label: string }
> = {
  CORE: { amountCents: 2900, label: "$29 / month" },
  VIP: { amountCents: 49700, label: "$497 / quarter" },
};
