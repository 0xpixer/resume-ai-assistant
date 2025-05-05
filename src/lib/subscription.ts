/**
 * Subscription utilities
 * Used to check if user has an active subscription
 */

/**
 * Subscription status types
 */
export type SubscriptionStatus = 'active' | 'cancelled' | 'incomplete' | 'trialing' | 'past_due' | 'unpaid' | 'none';

/**
 * Subscription plan interface
 */
export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planId: string;
  currentPeriodEnd: string;
  cancelAt?: string | null;
}

/**
 * Check if user has an active subscription
 * @returns Promise<boolean>
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const response = await fetch('/api/subscription', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch subscription status');
      return false;
    }

    const data = await response.json();
    
    if (!data.success || !data.subscription) {
      return false;
    }

    // Check if subscription status is active or trialing
    return ['active', 'trialing'].includes(data.subscription.status);
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Get subscription details
 * @returns Promise<Subscription | null>
 */
export async function getSubscription(): Promise<Subscription | null> {
  try {
    const response = await fetch('/api/subscription', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch subscription');
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.subscription) {
      return null;
    }

    return data.subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Check if feature is available based on subscription status
 * @param featureKey The feature to check access for
 * @returns Promise<boolean>
 */
export async function canAccessFeature(featureKey: 'feedback' | 'ats' | 'premium_templates'): Promise<boolean> {
  // Free features available to all users
  const freeFeatures: Array<string> = [
    // Add free features here
  ];
  
  // Check if feature is freely available
  if (freeFeatures.includes(featureKey)) {
    return true;
  }
  
  // If not free, check if user has an active subscription
  return await hasActiveSubscription();
}

/**
 * Get the appropriate path for redirecting users based on their subscription status
 * @returns Promise<string> The path to redirect to
 */
export async function getSubscriptionRedirectPath(): Promise<string> {
  const subscription = await getSubscription();
  
  // If user has no subscription or inactive subscription, redirect to the subscription page
  if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
    return '/subscription';
  }
  
  // Otherwise, redirect to the my-plan page where they can manage their subscription
  return '/my-plan';
} 