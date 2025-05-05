import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionStatus } from '@/lib/subscription';

/**
 * Create new subscription
 */
export async function POST(req: NextRequest) {
  try {
    // In a real project, this would connect to the Stripe API
    const body = await req.json();
    const { planId, paymentMethod, status = 'active' } = body;

    console.log('Creating subscription:', { planId, paymentMethod });
    
    // Create subscription object
    const subscription = {
      id: 'sub_' + Math.random().toString(36).substring(2, 15),
      planId,
      status: status as SubscriptionStatus,
      currentPeriodEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      subscription
    });
    
    // Store subscription info in cookies for demo and simulation
    // In production, this would typically be stored in a database
    response.cookies.set({
      name: 'subscription',
      value: JSON.stringify(subscription),
      path: '/',
      maxAge: 90 * 24 * 60 * 60, // 90 days
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    
    return response;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating subscription' },
      { status: 500 }
    );
  }
}

/**
 * Get user's subscription information
 */
export async function GET(req: NextRequest) {
  try {
    // Check if subscription info is in cookies
    const subscriptionCookie = req.cookies.get('subscription');
    
    if (subscriptionCookie) {
      try {
        const subscriptionData = JSON.parse(subscriptionCookie.value);
        
        return NextResponse.json({
          success: true,
          subscription: subscriptionData
        });
      } catch (e) {
        console.error('Error parsing subscription cookie:', e);
      }
    }
    
    // If no valid subscription cookie found, return mock subscription data
    // In production, this would typically be fetched from a database
    return NextResponse.json({
      success: true,
      subscription: {
        id: '',
        planId: '',
        status: 'none' as SubscriptionStatus,
        currentPeriodEnd: '',
      }
    });
  } catch (error) {
    console.error('Error fetching subscription information:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching subscription information' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to get the current user's subscription status
 * GET /api/subscription
 */
export async function GET_current_user_subscription(req: Request) {
  try {
    // In a real application, this would check the database for the user's subscription
    // using authentication to identify the current user
    
    // For demo purposes, we'll return a mock subscription
    // In production, replace this with actual database lookups
    
    // Check if a subscription status is stored in a cookie
    const cookies = req.headers.get('cookie') || '';
    const subscriptionCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('subscription='));
    
    if (subscriptionCookie) {
      try {
        const subscriptionData = JSON.parse(
          decodeURIComponent(subscriptionCookie.split('=')[1])
        );
        
        return NextResponse.json({
          success: true,
          subscription: subscriptionData
        });
      } catch (e) {
        console.error('Error parsing subscription cookie:', e);
      }
    }
    
    // If no valid subscription cookie is found, return a default 'none' status
    return NextResponse.json({
      success: true,
      subscription: {
        id: '',
        status: 'none' as SubscriptionStatus,
        planId: '',
        currentPeriodEnd: '',
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to set a mock subscription status (for demo purposes only)
 * This would be replaced with proper Stripe webhook handlers in production
 * POST /api/subscription
 */
export async function POST_mock_subscription(req: Request) {
  try {
    const body = await req.json();
    const { status = 'active', planId = 'premium_monthly' } = body;
    
    // Create a mock subscription
    const subscription = {
      id: `sub_${Math.random().toString(36).substring(2, 15)}`,
      status: status as SubscriptionStatus,
      planId,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    // Set a cookie with the subscription data
    // In production, this would be handled by authentication and database storage
    const response = NextResponse.json({
      success: true,
      subscription
    });
    
    // Set cookie to expire in 30 days
    response.cookies.set({
      name: 'subscription',
      value: JSON.stringify(subscription),
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    
    return response;
  } catch (error) {
    console.error('Error setting subscription status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set subscription status' },
      { status: 500 }
    );
  }
}