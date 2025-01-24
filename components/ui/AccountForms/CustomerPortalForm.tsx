'use client';

import Button from '@/components/ui/Button';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import { showErrorToast } from '@/components/ui/Toasts/use-toast';
import { SubscriptionDetails } from './SubscriptionDetails';
import { SubscriptionMessage } from './SubscriptionMessage';
import type { Subscription } from '@/utils/stripe/subscriptions';
import type { Product } from '@/utils/stripe/subscriptions';

interface Props {
  subscription: Subscription | null;
  createPortal: (returnUrl: string) => Promise<string>;
  products: Product[];
}

export default function CustomerPortalForm({ subscription, createPortal, products }: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStripePortalRequest = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const url = await createPortal(currentPath);
      if (url) {
        await router.push(url);
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      setIsSubmitting(false);
      showErrorToast(
        'Unable to access customer portal',
        'Please try again later or contact a system administrator.'
      );
    }
  };

  return (
    <Card
      title="Your Plan"
      description={
        subscription ? (
          <SubscriptionDetails onPortalRequest={handleStripePortalRequest}>
            <SubscriptionMessage 
              subscription={subscription} 
              products={products}
              onPortalRequest={handleStripePortalRequest}
            />
          </SubscriptionDetails>
        ) : (
          'You are not currently subscribed to any plan.'
        )
      }
      footerClassName={subscription?.prices.find(p => p.active)?.product?.name === 'Platform Basic' ? 'text-zinc-100' : 'text-zinc-500'}
      footer={
        subscription?.prices.find(p => p.active)?.product?.name === 'Platform Basic' ? (
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <p className="pb-4 sm:pb-0 font-semibold">Upgrade to Pro for additional features</p>
            <Button variant="slim" onClick={() => router.push('/pricing')}>
              View pricing
            </Button>
          </div>
        ) : subscription ? (
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <p className="pb-4 sm:pb-0">Manage your subscription on Stripe.</p>
            <Button
              type="button"
              variant="slim"
              disabled={isSubmitting}
              loading={isSubmitting}
              onClick={handleStripePortalRequest}
            >
              Open customer portal
            </Button>
          </div>
        ) : null}
    >
      <div></div>
    </Card>
  );
}
