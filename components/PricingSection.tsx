'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { useUser } from '@clerk/nextjs';
import { Check } from 'lucide-react';

export default function PricingSection() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    try {
      setIsLoading(priceId);
      
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
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground">Choose the plan that works best for you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Monthly Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>Perfect for trying out our premium features</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-6">
              ${SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.amount}
              <span className="text-base font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2">
              {SUBSCRIPTION_PLANS.PREMIUM.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.price_id!)}
              disabled={!user || isLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.price_id}
            >
              {isLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.monthly.price_id ? 'Loading...' : 'Subscribe Monthly'}
            </Button>
          </CardFooter>
        </Card>

        {/* Yearly Plan */}
        <Card className="flex flex-col border-2 border-primary">
          <CardHeader>
            <CardTitle>Yearly</CardTitle>
            <CardDescription>Save 17% with annual billing</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-6">
              ${SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.amount}
              <span className="text-base font-normal text-muted-foreground">/year</span>
            </div>
            <ul className="space-y-2">
              {SUBSCRIPTION_PLANS.PREMIUM.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe(SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.price_id!)}
              disabled={!user || isLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.price_id}
            >
              {isLoading === SUBSCRIPTION_PLANS.PREMIUM.prices.yearly.price_id ? 'Loading...' : 'Subscribe Yearly'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 