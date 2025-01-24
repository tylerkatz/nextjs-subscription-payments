'use client';

import Button from '@/components/ui/Button';
import LogoCloud from '@/components/ui/LogoCloud';
import type { Product, Price, Subscription } from '@/utils/stripe/subscriptions';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe, createStripePortal } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { showErrorToast } from '@/components/ui/Toasts/use-toast';

interface Props {
  user: User | null | undefined;
  products: (Product & { prices: Price[] })[];
  subscription: Subscription | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const router = useRouter();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  if (!products.length) {
    return <PricingNotFound />;
  }

  // Find Basic and Pro products
  const basicProduct = products.find(p => (p.metadata as any)?.tier === 'basic');
  const proProduct = products.find(p => (p.metadata as any)?.tier === 'pro');

  // Get all unique intervals from all products' prices
  const intervals = Array.from(
    new Set(
      products.flatMap(product => 
        product.prices.map(price => price.interval)
      )
    )
  );

  const tiers = [
    {
      name: 'Basic',
      description: 'Basic platform access',
      product: basicProduct,
      priceMonthly: basicProduct?.prices.find(
        p => p.interval === 'month'
      )
    },
    {
      name: 'Pro',
      description: 'Advanced features and access',
      product: proProduct,
      priceMonthly: proProduct?.prices.find(
        p => p.interval === 'month'
      ),
      priceYearly: proProduct?.prices.find(
        p => p.interval === 'year'
      )
    }
  ];

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    try {
      if (!user) {
        return router.push('/signin/signup');
      }

      // For existing Stripe subscriptions, redirect to portal
      if (subscription && !subscription.id.startsWith('free_')) {
        const portalUrl = await createStripePortal(currentPath);
        return router.push(typeof portalUrl === 'string' ? portalUrl : portalUrl);
      }

      // For basic (free) to paid upgrade
      const response = await checkoutWithStripe(price, currentPath);
      
      if (response.errorRedirect) {
        return router.push(response.errorRedirect);
      }

      if (!response.sessionId) {
        throw new Error('Missing Stripe session ID');
      }

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId: response.sessionId });

    } catch (error) {
      showErrorToast('Error during checkout', error instanceof Error ? error.message : 'Please try again');
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unexpected error occurred.',
          'Please try again later.'
        )
      );
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  return (
    <section className="bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Pricing Plans
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Start building for free, then add a site plan to go live. Account
            plans unlock additional features.
          </p>
          <div className="relative self-center mt-6 bg-zinc-900 rounded-lg p-0.5 flex sm:mt-8 border border-zinc-800">
            {intervals.includes('month') && (
              <button
                onClick={() => setBillingInterval('month')}
                type="button"
                className={`${billingInterval === 'month'
                    ? 'relative w-1/2 bg-zinc-700 border-zinc-800 shadow-sm text-white'
                    : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-400'
                  } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8`}
              >
                Monthly billing
              </button>
            )}
            {intervals.includes('year') && (
              <button
                onClick={() => setBillingInterval('year')}
                type="button"
                className={`${billingInterval === 'year'
                    ? 'relative w-1/2 bg-zinc-700 border-zinc-800 shadow-sm text-white'
                    : 'ml-0.5 relative w-1/2 border border-transparent text-zinc-400'
                  } rounded-md m-1 py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:z-10 sm:w-auto sm:px-8`}
              >
                Yearly billing
              </button>
            )}
          </div>
        </div>
        <div className="mt-12 space-y-0 sm:mt-16 flex flex-wrap justify-center gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {tiers.map((tier) => {
            // Get the price for the current interval, don't fallback to monthly
            const price = billingInterval === 'year' 
              ? tier.priceYearly 
              : tier.priceMonthly;

            // Skip rendering if no price exists for this interval
            if (!price) return null;

            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency!,
              minimumFractionDigits: 0
            }).format((price?.amount || 0) / 100);

            return (
              <div
                key={tier.name}
                className={cn(
                  'flex flex-col rounded-lg shadow-sm divide-y divide-zinc-600 bg-zinc-900',
                  {
                    'border border-pink-500': tier.name === 'Pro'
                  },
                  'flex-1',
                  'basis-1/3',
                  'max-w-xs'
                )}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold leading-6 text-white">
                    {tier.name}
                  </h2>
                  <p className="mt-4 text-zinc-300">{tier.description}</p>
                  <p className="mt-8">
                    <span className="text-5xl font-extrabold white">
                      {priceString}
                    </span>
                    <span className="text-base font-medium text-zinc-100">
                      /{billingInterval}
                    </span>
                  </p>
                  <Button
                    variant="slim"
                    type="button"
                    disabled={!!user && (
                      subscription?.id === price.id ||
                      (subscription?.prices.find(p => p.active)?.amount ?? 0) >= (price.amount ?? 0)
                    )}
                    loading={priceIdLoading === price.id}
                    onClick={() => handleStripeCheckout(price)}
                    className="block w-full py-2 mt-8 text-sm font-semibold text-center text-white rounded-md hover:bg-zinc-900"
                  >
                    {'Subscribe'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <LogoCloud />
      </div>
    </section>
  );
}

function PricingNotFound() {
  return (
    <section className="bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center"></div>
        <p className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
          No subscription pricing plans found. Create them in your{' '}
          <a
            className="text-pink-500 underline"
            href="https://dashboard.stripe.com/products"
            rel="noopener noreferrer"
            target="_blank"
          >
            Stripe Dashboard
          </a>
          .
        </p>
      </div>
      <LogoCloud />
    </section>
  );
}
