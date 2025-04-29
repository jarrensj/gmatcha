'use client';

import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | null;

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  priceId: string;
  currentPeriodEnd: Date;
  isActive: boolean;
}

export function useSubscription() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isUserLoaded || !user) {
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_KEY!
        );

        const { data, error } = await supabase
          .from('users_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setSubscription(null);
          } else {
            throw error;
          }
        } else if (data) {
          setSubscription({
            id: data.subscription_id,
            status: data.status as SubscriptionStatus,
            priceId: data.stripe_price_id,
            currentPeriodEnd: new Date(data.current_period_end),
            isActive: ['active', 'trialing'].includes(data.status),
          });
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user, isUserLoaded]);

  return {
    subscription,
    isLoading,
    error,
    isSubscribed: !!subscription?.isActive,
    hasFeature: (featureName: string) => {
      if (!subscription?.isActive) return false;
      
      return true;
    }
  };
} 