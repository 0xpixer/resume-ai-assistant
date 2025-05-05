import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

// Initialize Stripe with test mode flag
const isTestMode = process.env.NODE_ENV === 'development';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
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
    
    // Check if Stripe is properly initialized
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key is not configured');
      return NextResponse.json(
        { success: false, error: 'Payment service is not configured' },
        { status: 500 }
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
      return NextResponse.json(
        { success: false, error: 'User email not found' },
        { status: 400 }
      );
    }

    console.log('Creating portal session for:', customerEmail);
    
    try {
      // Find or create customer
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });
      
      let customer = customers.data[0];
      
      if (!customer) {
        console.log('Creating new customer for:', customerEmail);
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            userId: user.id || 'unknown'
          }
        });
      }

      console.log('Customer found/created:', customer.id);
      
      // Create customer portal session without specifying configuration
      // This will use the default configuration
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${req.headers.get('origin')}/my-plan`,
      });

      console.log('Portal session created:', session.url);
      
      return NextResponse.json({ success: true, url: session.url });
      
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment service error', 
          details: stripeError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error in portal API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 