import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { parseSubscription } from '@/utils/stripe/subscriptions';
import type { Product, Subscription } from '@/utils/stripe/subscriptions';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient): Promise<Subscription | null> => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*)), subscription_schedules(*)')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (!subscription) return null;
  
  try {
    const parsed = parseSubscription(subscription);
    return parsed;
  } catch (e) {
    console.error('Error parsing subscription:', e);
    throw e; // Let's see the actual error
  }
});

export const getProducts = cache(async (supabase: SupabaseClient): Promise<Product[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  if (!products) return [];

  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    active: p.active,
    metadata: p.metadata,
    prices: p.prices.map((price: any) => ({
      id: price.id,
      productId: price.product_id,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.interval,
      active: price.active,
      product: {
        id: p.id,
        name: p.name,
        description: p.description,
        active: p.active,
        metadata: p.metadata
      }
    }))
  }));
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

export const getPriceWithProduct = cache(async (supabase: SupabaseClient, priceId: string) => {
  const { data: price } = await supabase
    .from('prices')
    .select('*, products(*)')
    .eq('id', priceId)
    .single();

  return price;
});
