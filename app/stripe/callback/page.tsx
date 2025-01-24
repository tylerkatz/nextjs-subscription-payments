'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSubscription } from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/client';

export default function StripeCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const checkSubscription = async () => {
      const maxAttempts = 10;
      let attempts = 0;

      while (attempts < maxAttempts) {
        const subscription = await getSubscription(supabase);
        if (subscription?.status === 'active') {
          router.push('/account');
          return;
        }
        
        // Wait 1 second before trying again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      // If we get here, something went wrong
      console.error('Subscription not found after maximum attempts');
      router.push('/account?error=subscription_pending');
    };

    // Check if there was an error
    const error = searchParams.get('error');
    if (error) {
      router.push(`/account?error=${error}`);
      return;
    }

    checkSubscription();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">Processing your subscription...</div>
    </div>
  );
} 