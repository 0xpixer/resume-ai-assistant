import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionStatus } from '@/lib/subscription';

/**
 * Simple login API endpoint for testing subscription features
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Simple validation for development environment only
    // In production, this should use a proper authentication system
    if (email && password) {
      // Create user state
      const user = {
        email,
        name: email === 'arrow7440@gmail.com' ? 'Test Premium User' : 'Regular User',
        isAuthenticated: true,
        createdAt: new Date().toISOString()
      };

      // Create subscription object
      // Only the test account gets premium status automatically
      const subscription = {
        id: 'sub_' + Math.random().toString(36).substring(2, 15),
        planId: email === 'arrow7440@gmail.com' ? 'premium_monthly' : 'free',
        status: email === 'arrow7440@gmail.com' ? 'active' : 'none' as SubscriptionStatus,
        currentPeriodEnd: email === 'arrow7440@gmail.com' ? 
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : '',
        createdAt: new Date().toISOString()
      };

      // Create response
      const response = NextResponse.json({
        success: true,
        user,
        subscription
      });
      
      // Set user and subscription cookies
      response.cookies.set({
        name: 'auth',
        value: JSON.stringify(user),
        path: '/',
        maxAge: 90 * 24 * 60 * 60, // 90 days
        sameSite: 'lax',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
      });
      
      response.cookies.set({
        name: 'subscription',
        value: JSON.stringify(subscription),
        path: '/',
        maxAge: 90 * 24 * 60 * 60, // 90 days
        sameSite: 'lax',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed, please try again later' },
      { status: 500 }
    );
  }
} 