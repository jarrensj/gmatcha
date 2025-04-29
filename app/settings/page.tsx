import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SubscriptionManager from "@/components/SubscriptionManager";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function SettingsPage(props: any) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const searchParams = props.searchParams || {};
  const showSuccessMessage = searchParams?.success === 'true';
  const showCanceledMessage = searchParams?.canceled === 'true';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      {showSuccessMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <div className="flex">
            <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
            <div>
              <AlertTitle>Subscription successful!</AlertTitle>
              <AlertDescription>
                Your subscription has been processed successfully. You now have access to premium features.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {showCanceledMessage && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <div className="flex">
            <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
            <div>
              <AlertTitle>Checkout canceled</AlertTitle>
              <AlertDescription>
                You&apos;ve canceled the checkout process. No changes were made to your subscription.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Subscription</h2>
          <SubscriptionManager />
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Premium Features</h2>
          <div className="grid gap-4">
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold mb-2">Voice Recording</h3>
              <p className="text-sm text-muted-foreground">
                Record your standup updates with your voice instead of typing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}