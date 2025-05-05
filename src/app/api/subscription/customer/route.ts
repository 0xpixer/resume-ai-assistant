import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

// Initialize Stripe with test mode flag
const isTestMode = process.env.NODE_ENV === 'development';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as const,
});

/**
 * Get all Stripe subscription information for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get user information from cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth')?.value;
    
    if (!authCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    let user;
    try {
      user = JSON.parse(authCookie);
    } catch (error) {
      console.error('Failed to parse auth cookie:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication data' },
        { status: 401 }
      );
    }
    
    const customerEmail = user.email;
    
    if (!customerEmail) {
      return NextResponse.json({
        success: true,
        subscription: null,
        invoices: []
      });
    }
    
    // In development/test mode, return mock data
    if (isTestMode) {
      return NextResponse.json({
        success: true,
        subscription: {
          id: 'sub_test',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: {
            data: [{
              price: {
                id: 'price_test',
                product: {
                  name: 'Premium Plan (Test)',
                },
                unit_amount: 999,
                currency: 'usd',
              }
            }]
          }
        },
        invoices: []
      });
    }
    
    try {
      // Find customer ID
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      const customer = customers.data[0];
      
      if (!customer) {
        return NextResponse.json({
          success: true,
          subscription: null,
          invoices: []
        });
      }
      
      // Get customer's subscription information
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        expand: ['data.default_payment_method', 'data.items.data.price.product']
      });
      
      // Get invoice history
      const invoices = await stripe.invoices.list({
        customer: customer.id,
        limit: 5,
      });
      
      return NextResponse.json({
        success: true,
        subscription: subscriptions.data[0] || null,
        invoices: invoices.data
      });
      
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { success: false, error: 'Payment service error', details: stripeError.message },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error in subscription API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 