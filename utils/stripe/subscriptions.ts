import { Tables } from '@/utils/supabase/types_db';

// Domain Types
export type Product = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  prices: Price[];
  metadata?: {
    tier?: 'basic' | 'pro';
    [key: string]: any;
  };
};

export type Price = {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  active: boolean;
  product: Product | null;
  trial_period_days?: number | null;
  metadata?: {
    tier?: 'basic' | 'pro';
    [key: string]: any;
  };
};

export type SchedulePhase = {
  startDate: number;
  endDate: number | null;
  priceId: string;
  position: 'current' | 'next' | 'future';
};

export type Schedule = {
  id: string;
  currentPhase: number;
  phases: SchedulePhase[];
  status: 'active' | 'not_started' | 'completed' | 'released' | 'canceled';
};

export type Subscription = {
  id: string;
  userId: string;
  status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  canceledAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  endedAt: string | null;
  prices: Price[];
  schedule?: Schedule;
};

// Error types
export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

type RawPrice = Tables<'prices'> & {
  products: Tables<'products'> | null;
};

export function parseSubscription(raw: any): Subscription | null {
  if (!raw) return null;
  
  const prices: Price[] = (Array.isArray(raw.prices) ? raw.prices : [raw.prices]).map((p: RawPrice) => ({
    id: p.id,
    productId: p.product_id,
    amount: p.unit_amount,
    currency: p.currency,
    interval: p.interval,
    active: p.active,
    product: p.products ? {
      id: p.products.id,
      name: p.products.name,
      description: p.products.description,
      active: p.products.active,
      metadata: p.products.metadata
    } : null,
    metadata: p.metadata
  }));

  const schedule = raw.subscription_schedules?.[0]?.phases ? {
    id: raw.subscription_schedules[0].id,
    currentPhase: 0,
    phases: raw.subscription_schedules[0].phases.map((phase: any, index: number) => ({
      startDate: phase.start_date,
      endDate: phase.end_date,
      priceId: phase.items[0].price,
      position: index === 0 ? 'current' : index === 1 ? 'next' : 'future'
    })),
    status: 'active' as const
  } : undefined;

  return {
    id: raw.id,
    userId: raw.user_id,
    status: raw.status,
    cancelAtPeriodEnd: raw.cancel_at_period_end,
    cancelAt: raw.cancel_at,
    canceledAt: raw.canceled_at,
    currentPeriodStart: raw.current_period_start,
    currentPeriodEnd: raw.current_period_end,
    createdAt: raw.created,
    endedAt: raw.ended_at,
    prices,
    schedule
  };
}
