import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

function safelyConvertTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return new Date().toISOString();
  
  try {
    return new Date(timestamp * 1000).toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;
        const customerId = session.customer;
        
        if (!subscriptionId) {
          return NextResponse.json({ error: 'Missing subscriptionId' }, { status: 400 });
        }
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        let finalUserId = userId;
        
        if (!finalUserId && subscription.metadata?.userId) {
          finalUserId = subscription.metadata.userId;
        }
        
        if (!finalUserId && customerId) {
          try {
            const { data: existingSubscription } = await supabase
              .from('users_subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', customerId)
              .single();
              
            if (existingSubscription?.user_id) {
              finalUserId = existingSubscription.user_id;
            }
          } catch (error) {
          }
        }
        
        if (finalUserId) {
          try {
            const { data: existingSubscriptions } = await supabase
              .from('users_subscriptions')
              .select('*')
              .eq('user_id', finalUserId);
            
            if (existingSubscriptions && existingSubscriptions.length > 0) {
              const { error } = await supabase
                .from('users_subscriptions')
                .update({
                  stripe_customer_id: subscription.customer as string,
                  subscription_id: subscription.id,
                  status: subscription.status,
                  stripe_price_id: subscription.items.data[0].price.id,
                  current_period_start: safelyConvertTimestamp((subscription as any).current_period_start),
                  current_period_end: safelyConvertTimestamp((subscription as any).current_period_end),
                  cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', finalUserId);
                
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('users_subscriptions')
                .insert({
                  user_id: finalUserId,
                  stripe_customer_id: subscription.customer as string,
                  subscription_id: subscription.id,
                  status: subscription.status,
                  stripe_price_id: subscription.items.data[0].price.id,
                  current_period_start: safelyConvertTimestamp((subscription as any).current_period_start),
                  current_period_end: safelyConvertTimestamp((subscription as any).current_period_end),
                  cancel_at_period_end: (subscription as any).cancel_at_period_end || false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                
              if (error) throw error;
            }
          } catch (error) {
            throw error;
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        let userId = subscription.metadata?.userId;
        
        if (!userId) {
          try {
            const { data: existingSubscription } = await supabase
              .from('users_subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', subscription.customer)
              .single();
              
            if (existingSubscription?.user_id) {
              userId = existingSubscription.user_id;
            }
          } catch (error) {
          }
        }
        
        if (!userId) {
          return NextResponse.json({ error: 'No userId found' }, { status: 200 });
        }

        let dbStatus = subscription.status;
        
        if (subscription.status === 'active' && subscription.cancel_at_period_end) {
          dbStatus = 'canceling';
        }

        try {
          const { data: existingSubscription } = await supabase
            .from('users_subscriptions')
            .select('*')
            .eq('subscription_id', subscription.id);
            
          if (existingSubscription && existingSubscription.length > 0) {
            const { error } = await supabase
              .from('users_subscriptions')
              .update({
                status: dbStatus,
                stripe_price_id: subscription.items.data[0].price.id,
                current_period_start: safelyConvertTimestamp(subscription.current_period_start),
                current_period_end: safelyConvertTimestamp(subscription.current_period_end),
                cancel_at_period_end: subscription.cancel_at_period_end || false,
                updated_at: new Date().toISOString(),
              })
              .eq('subscription_id', subscription.id);
              
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('users_subscriptions')
              .insert({
                user_id: userId,
                stripe_customer_id: subscription.customer as string,
                subscription_id: subscription.id,
                status: dbStatus,
                stripe_price_id: subscription.items.data[0].price.id,
                current_period_start: safelyConvertTimestamp(subscription.current_period_start),
                current_period_end: safelyConvertTimestamp(subscription.current_period_end),
                cancel_at_period_end: subscription.cancel_at_period_end || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              
            if (error) throw error;
          }
        } catch (error) {
          throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;
        
        const { error } = await supabase
          .from('users_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
            ended_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscriptionId);
          
        if (error) throw error;
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          let userIdFromSub = (sub as any).metadata?.userId;
          
          if (!userIdFromSub) {
            try {
              const { data: existingSubscription } = await supabase
                .from('users_subscriptions')
                .select('user_id')
                .eq('subscription_id', invoice.subscription)
                .single();
                
              if (existingSubscription?.user_id) {
                userIdFromSub = existingSubscription.user_id;
              }
            } catch (error) {
            }
          }
          
          if (userIdFromSub) {
            try {
              const { data: subscriptionExists } = await supabase
                .from('users_subscriptions')
                .select('subscription_id')
                .eq('subscription_id', invoice.subscription)
                .maybeSingle();
                
              const insertData: any = {
                user_id: userIdFromSub,
                stripe_payment_intent_id: invoice.payment_intent as string || 'unknown',
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: 'succeeded'
              };
              
              if (subscriptionExists?.subscription_id) {
                insertData.subscription_id = invoice.subscription;
              }
              
              const { error } = await supabase
                .from('payment_history')
                .insert(insertData);
                
              if (error) throw error;
            } catch (error) {
              console.error('Payment history record failed:', error);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as any;
        
        if (failedInvoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(failedInvoice.subscription as string);
          let userIdFromSub = (sub as any).metadata?.userId;
          
          if (!userIdFromSub) {
            try {
              const { data: existingSubscription } = await supabase
                .from('users_subscriptions')
                .select('user_id')
                .eq('subscription_id', failedInvoice.subscription)
                .single();
                
              if (existingSubscription?.user_id) {
                userIdFromSub = existingSubscription.user_id;
              }
            } catch (error) {
            }
          }
          
          if (userIdFromSub) {
            try {
              const { data: subscriptionExists } = await supabase
                .from('users_subscriptions')
                .select('subscription_id')
                .eq('subscription_id', failedInvoice.subscription)
                .maybeSingle();
                
              const insertData: any = {
                user_id: userIdFromSub,
                stripe_payment_intent_id: failedInvoice.payment_intent as string || 'unknown',
                amount: failedInvoice.amount_due,
                currency: failedInvoice.currency,
                status: 'failed'
              };
              
              if (subscriptionExists?.subscription_id) {
                insertData.subscription_id = failedInvoice.subscription;
              }
              
              const { error: paymentError } = await supabase
                .from('payment_history')
                .insert(insertData);
                
              if (paymentError) {
                console.error('Payment record failed:', paymentError);
              }
              
              const { error } = await supabase
                .from('users_subscriptions')
                .update({
                  status: 'past_due',
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', userIdFromSub);
                
              if (error) throw error;
            } catch (error) {
              console.error('Failed payment processing error:', error);
            }
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 