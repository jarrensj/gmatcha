import Stripe from 'stripe';

// Server components or API routes only
if (typeof window !== 'undefined') {
  throw new Error('This file should only be imported in server components or API routes');
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil',
});

export const SUBSCRIPTION_PLANS = {
  PREMIUM: {
    name: 'Premium Membership',
    prices: {
      monthly: {
        price_id: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        amount: 3.99,
        interval: 'month'
      },
      yearly: {
        price_id: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
        amount: 39.99,
        interval: 'year'
      }
    },
    features: ['Voice Recording', 'AI Analysis', 'Unlimited Updates']
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

  const { data } = await supabase
    .from('users_subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return !!data;
}

export async function createCheckoutSession(userId: string, priceId: string) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = isDevelopment 
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://gmatcha.com');
    
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/settings?success=true`,
    cancel_url: `${baseUrl}/settings?canceled=true`,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });
} 