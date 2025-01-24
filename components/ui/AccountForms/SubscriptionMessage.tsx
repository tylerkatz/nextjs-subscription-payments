import { Product, Subscription } from '@/utils/stripe/subscriptions';

const formatDate = (date: string | number) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function SubscriptionMessage({ 
  subscription,
  products,
  onPortalRequest
}: { 
  subscription: Subscription;
  products: Product[];
  onPortalRequest: () => void;
}) {
  const messages = [];
  const currentPrice = subscription?.prices?.find(price => price.active);
  
  // Format price
  const subscriptionPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currentPrice?.currency!,
    minimumFractionDigits: 0
  }).format((currentPrice?.amount || 0) / 100);
  
  messages.push(
    <span key="status">
      You are currently on the <strong>{currentPrice?.product?.name}</strong> plan.
    </span>
  );
  
  messages.push(
    <div key="price" className="text-xl font-semibold mt-2 mb-4">
      {`${subscriptionPrice}/${currentPrice?.interval}`}
    </div>
  );
  
  if (subscription.cancelAtPeriodEnd) {
    messages.push(
      <span key="cancel-status" className="mt-4 block text-xs">
        Your plan will be cancelled on {formatDate(subscription.cancelAt!)}.
      </span>
    );
  }
  
  messages.push(
    <p key="billing" className="text-sm text-zinc-400">
      Last charge: {formatDate(subscription.currentPeriodStart)}
    </p>
  );

  const schedulePhaseNext = subscription.schedule?.phases.find(s => s.position === 'next');
  if (schedulePhaseNext) {
    const nextPrice = products
      .flatMap(p => p.prices)
      .find(price => price.id === schedulePhaseNext.priceId);
    
    if (nextPrice) {
      const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: nextPrice.currency,
        minimumFractionDigits: 0
      }).format(nextPrice.amount / 100);

      messages.push(
        <p key="schedule" className="text-sm">
          Your plan will change to <span className="font-semibold">{nextPrice.product?.name} ({formattedPrice}/{nextPrice.interval})</span> on {formatDate(schedulePhaseNext.startDate * 1000)}.{' '}
          <button 
            onClick={onPortalRequest}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Manage this change in the customer portal
          </button>
        </p>
      );
    }
  } else {
    messages.push(
      <p key="next-charge" className="text-sm text-zinc-400">
        Next charge: {formatDate(subscription.currentPeriodEnd)}
      </p>
    );
  }
  
  return <div className="mt-2 min-h-[160px]">{messages}</div>;
} 