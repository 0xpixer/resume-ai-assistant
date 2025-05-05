import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

// 生产环境中需要通过环境变量设置Stripe密钥
// 仅在开发环境使用默认值
const isDev = process.env.NODE_ENV === 'development';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || (isDev ? 'sk_test_placeholder' : '');

// 创建stripe客户端（有条件的）
let stripe: Stripe | null = null;
try {
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
    });
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

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
    
    // 检查Stripe是否已正确初始化
    if (!stripe) {
      console.error('Stripe client is not configured. Please add STRIPE_SECRET_KEY to environment variables.');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment service is not configured', 
          details: 'Please configure STRIPE_SECRET_KEY in environment variables'
        },
        { status: 503 }  // Service Unavailable
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
      // 查找或创建客户
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
      
      // 创建客户门户会话
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