import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not properly configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: subscription, error: subscriptionError } = await supabase
      .from('users_subscriptions')
      .select('stripe_customer_id, subscription_id, status')
      .eq('user_id', userId)
      .single();

    if (subscriptionError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch subscription data', 
          details: subscriptionError.message,
          code: subscriptionError.code
        },
        { status: 500 }
      );
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription record found' },
        { status: 404 }
      );
    }

    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found in your subscription record' },
        { status: 404 }
      );
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
      });

      return NextResponse.json({ url: session.url });
      
    } catch (stripeError: unknown) {
      const error = stripeError as { type?: string; code?: string; message?: string };
      if (error.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { 
            error: 'Invalid Stripe customer ID', 
            details: error.message,
            code: error.code
          },
          { status: 400 }
        );
      }
      
      throw stripeError;
    }
    
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    const errorMessage = err?.message || 'Failed to create portal session';
    const errorCode = err?.code || 'unknown_error';
    
    return NextResponse.json(
      { 
        error: 'Failed to create portal session', 
        details: errorMessage,
        code: errorCode
      },
      { status: 500 }
    );
  }
} 