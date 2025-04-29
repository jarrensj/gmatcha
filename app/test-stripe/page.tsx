'use client';

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PricingSection from "@/components/PricingSection";
import { ChangeEvent } from "react";

export default function TestStripePage() {
  const { user } = useUser();
  const [priceId, setPriceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleCreateCheckoutSession = async () => {
    try {
      setIsLoading(true);
      setStatus('Creating checkout session...');

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

      setStatus('Redirecting to checkout...');
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to test Stripe integration</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Stripe Integration Test Page</h1>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Checkout Session</CardTitle>
            <CardDescription>
              Create a checkout session with a specific price ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ID</label>
              <Input 
                value={priceId} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPriceId(e.target.value)} 
                placeholder="price_1234..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a Stripe Price ID to test the checkout flow
              </p>
            </div>
            {status && (
              <div className={`p-2 rounded text-sm ${status.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {status}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateCheckoutSession} 
              disabled={!priceId || isLoading}
            >
              {isLoading ? 'Loading...' : 'Create Checkout Session'}
            </Button>
          </CardFooter>
        </Card>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Pricing Component Test</h2>
          <PricingSection />
        </div>
      </div>
    </div>
  );
} 