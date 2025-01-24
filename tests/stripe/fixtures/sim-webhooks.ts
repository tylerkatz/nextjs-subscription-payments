import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { fixtures } from './stripe-fixtures.json';

config({ path: resolve(__dirname, '../../../.env.local') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16'
});

const baseUrl = 'http://localhost:3000/api/webhooks';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

async function simulateWebhooks() {
  // First, fetch all products and prices from Stripe
  const stripeProducts = await stripe.products.list();
  const stripePrices = await stripe.prices.list();

  // Create map of product names to Stripe IDs
  const productMap = new Map(
    stripeProducts.data.map(p => [p.name, p.id])
  );

  // Create products
  for (const fixture of fixtures) {
    if (fixture.name.startsWith('prod_')) {
      const stripeId = productMap.get(fixture.params.name!);
      if (!stripeId) {
        console.warn(`No Stripe product found for ${fixture.params.name}`);
        continue;
      }

      const payload = JSON.stringify({
        type: 'product.created',
        data: {
          object: {
            id: stripeId,
            name: fixture.params.name,
            description: fixture.params.description,
            active: true,
            metadata: fixture.params.metadata
          }
        }
      });

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = stripe.webhooks.generateTestHeaderString({
        timestamp,
        payload,
        secret: webhookSecret!
      });

      console.log(`Creating product: ${fixture.name}`);
      await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': signature
        },
        body: payload
      });
      
      // Add a small delay to ensure product is created
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Wait for products to be created
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create prices
  for (const fixture of fixtures) {
    if (fixture.name.startsWith('price_')) {
      // Get the product fixture name without the ${} wrapper
      const productFixtureName = fixture.params?.product?.replace(/\${(.+?):id}/, '$1');
      const productName = fixtures.find(f => f.name === productFixtureName)?.params.name;
      const productId = productMap.get(productName || '');
      
      if (!productId) {
        console.warn(`No Stripe product found for price ${fixture.name}, product name: ${productName}`);
        continue;
      }

      const matchingPrice = stripePrices.data.find(p => 
        p.product === productId && 
        p.unit_amount === fixture.params.unit_amount &&
        p.recurring?.interval === fixture.params.recurring.interval
      );

      if (!matchingPrice) {
        console.warn(`No matching Stripe price found for ${fixture.name}`);
        continue;
      }

      const payload = JSON.stringify({
        type: 'price.created',
        data: {
          object: {
            id: matchingPrice.id,
            product: productId,
            active: true,
            currency: fixture.params.currency,
            type: 'recurring',
            unit_amount: fixture.params.unit_amount,
            recurring: fixture.params.recurring,
            metadata: {
              ...fixture.params.metadata
            }
          }
        }
      });

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = stripe.webhooks.generateTestHeaderString({
        timestamp,
        payload,
        secret: webhookSecret!
      });

      console.log(`Creating price: ${fixture.name}`);
      await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': signature
        },
        body: payload
      });
    }
  }
}

simulateWebhooks().catch(console.error);
