import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord,
  cancelBasicSubscription,
  upsertSubscriptionSchedule
} from '@/utils/supabase/admin';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'subscription_schedule.created',
  'subscription_schedule.updated',
  'subscription_schedule.canceled',
  'subscription_schedule.released',
  'subscription_schedule.completed'
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response('Webhook secret not found.', { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'customer.subscription.created':
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          const customerData = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          if (customerData.metadata?.supabaseUUID) {
            await cancelBasicSubscription(customerData.metadata.supabaseUUID);
          }
          
          await manageSubscriptionStatusChange(
            subscription.id,
            customerId,
            true
          );
          break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscriptionUpdated = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscriptionUpdated.id,
            subscriptionUpdated.customer as string,
            false
          );
          
          // Log the status for debugging
          console.log('Subscription status:', subscriptionUpdated.status);
          console.log('Cancel at period end:', subscriptionUpdated.cancel_at_period_end);
          console.log('Cancel at:', subscriptionUpdated.cancel_at);
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        case 'subscription_schedule.created':
        case 'subscription_schedule.updated':
        case 'subscription_schedule.canceled':
        case 'subscription_schedule.released':
        case 'subscription_schedule.completed':
          const schedule = event.data.object as Stripe.SubscriptionSchedule;
          await upsertSubscriptionSchedule(schedule);
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
