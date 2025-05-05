/**
 * Stripe Service
 * 
 * Note: This is a mock implementation. In a real project, you would need to install the Stripe SDK and configure actual API keys.
 * npm install stripe
 */

// In a real project, you would need to import the Stripe SDK
// import Stripe from 'stripe';

// Mock API key, should use environment variables in a real project
// const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
// const stripe = new Stripe(stripeSecretKey as string, { apiVersion: '2023-10-16' });

// Mock price ID mapping
const PRICE_IDS = {
  monthly: 'price_monthly_123456',
  quarterly: 'price_quarterly_123456',
  biannually: 'price_biannually_123456',
};

/**
 * Create a client payment intent
 * @param customerId Customer ID
 * @param planId Plan ID
 */
export async function createPaymentIntent(customerId: string, planId: string) {
  // In a real project, use the Stripe SDK to create a payment intent
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: getPlanAmount(planId),
  //   currency: 'usd',
  //   customer: customerId,
  //   payment_method_types: ['card'],
  //   metadata: {
  //     planId
  //   }
  // });
  
  // Mock response
  return {
    id: 'pi_' + Math.random().toString(36).substring(2, 15),
    client_secret: 'pi_' + Math.random().toString(36).substring(2, 15) + '_secret',
    amount: getPlanAmount(planId),
    currency: 'usd',
  };
}

/**
 * Create a subscription
 * @param customerId Customer ID
 * @param planId Plan ID
 * @param paymentMethodId Payment method ID
 */
export async function createSubscription(
  customerId: string,
  planId: string,
  paymentMethodId: string
) {
  // In a real project, use the Stripe SDK to create a subscription
  // const subscription = await stripe.subscriptions.create({
  //   customer: customerId,
  //   items: [{ price: PRICE_IDS[planId] }],
  //   default_payment_method: paymentMethodId,
  //   payment_behavior: 'default_incomplete',
  //   expand: ['latest_invoice.payment_intent'],
  // });
  
  // Mock response
  return {
    id: 'sub_' + Math.random().toString(36).substring(2, 15),
    status: 'active',
    current_period_end: Math.floor(Date.now() / 1000) + getPlanDuration(planId),
    items: {
      data: [{
        price: {
          id: PRICE_IDS[planId as keyof typeof PRICE_IDS],
          product: 'prod_resume_premium',
        }
      }]
    }
  };
}

/**
 * Cancel a subscription
 * @param subscriptionId Subscription ID
 */
export async function cancelSubscription(subscriptionId: string) {
  // In a real project, use the Stripe SDK to cancel the subscription
  // const subscription = await stripe.subscriptions.update(subscriptionId, {
  //   cancel_at_period_end: true
  // });
  
  // Mock response
  return {
    id: subscriptionId,
    status: 'active',
    cancel_at_period_end: true,
    cancel_at: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days later
    current_period_end: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
  };
}

/**
 * Get plan amount (in cents)
 */
function getPlanAmount(planId: string): number {
  switch (planId) {
    case 'monthly':
      return 3999; // $39.99
    case 'quarterly':
      return 6999; // $69.99
    case 'biannually':
      return 9999; // $99.99
    default:
      return 6999; // Default to quarterly
  }
}

/**
 * Get plan duration (in seconds)
 */
function getPlanDuration(planId: string): number {
  switch (planId) {
    case 'monthly':
      return 30 * 24 * 60 * 60; // 30 days
    case 'quarterly':
      return 90 * 24 * 60 * 60; // 90 days
    case 'biannually':
      return 180 * 24 * 60 * 60; // 180 days
    default:
      return 90 * 24 * 60 * 60; // Default 90 days
  }
} 