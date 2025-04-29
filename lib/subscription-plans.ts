
export const SUBSCRIPTION_PLANS = {
  PREMIUM: {
    name: 'Premium Membership',
    prices: {
      monthly: {
        price_id: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_1RIzr0HKgZwbTaTph7A9f1LX',
        amount: 3.99,
        interval: 'month'
      },
      yearly: {
        price_id: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_1RIzr0HKgZwbTaTpD6vTigHv',
        amount: 39.99,
        interval: 'year'
      }
    },
    features: ['Voice Recording', 'AI Analysis', 'Unlimited Updates']
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS; 