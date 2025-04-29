'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { ExternalLink, Settings, Beaker, Check } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SubscriptionManager() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('You don\'t have an active subscription yet. Please subscribe first.');
        } else {
          const errorMessage = data.details || data.error || 'Failed to create portal session';
          throw new Error(`${errorMessage} (Code: ${data.code || response.status})`);
        }
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      const err = error as Error;
      setError(err.message || 'Failed to open subscription management. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSubscribe = async (priceId: string) => {
    try {
      setCheckoutLoading(priceId);
      setError(null);
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      const err = error as Error;
      setError(err.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Need to upgrade? Visit our pricing page:</p>
              <Button
                variant="link"
                className="px-0"
                onClick={() => window.open(process.env.NEXT_PUBLIC_MARKETING_URL, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Pricing Options
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDevelopment && (
        <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Beaker className="h-5 w-5 text-yellow-500" />
              <CardTitle>Test Mode Pricing</CardTitle>
            </div>
            <CardDescription>Test subscription flow in development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Monthly</h3>
                <div className="text-2xl font-bold mb-4">
                  ${SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.amount}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {SUBSCRIPTION_PLANS.PREMIUM.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => handleTestSubscribe(SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.price_id)}
                  disabled={!user || checkoutLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.price_id}
                >
                  {checkoutLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.price_id 
                    ? 'Loading...' 
                    : 'Test Monthly Subscription'}
                </Button>
              </div>

              <div className="border-2 border-primary rounded-lg p-4">
                <h3 className="font-semibold mb-2">Yearly</h3>
                <div className="text-2xl font-bold mb-4">
                  ${SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.amount}
                  <span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {SUBSCRIPTION_PLANS.PREMIUM.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => handleTestSubscribe(SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.price_id)}
                  disabled={!user || checkoutLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.price_id}
                >
                  {checkoutLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.price_id 
                    ? 'Loading...' 
                    : 'Test Yearly Subscription'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 