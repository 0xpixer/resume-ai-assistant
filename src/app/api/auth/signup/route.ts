import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionStatus } from '@/lib/subscription';

/**
 * Simple signup API endpoint for user registration
 * In production, this would be replaced with AWS Cognito user registration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // In a real application with AWS Cognito, we would call:
    // const signUpResult = await Auth.signUp({
    //   username: email,
    //   password,
    //   attributes: {
    //     name,
    //     email
    //   }
    // });

    // Create user state (for demo purposes)
    const user = {
      email,
      name,
      isAuthenticated: true,
      createdAt: new Date().toISOString()
    };

    // Create subscription with NONE status for new users
    // New users need to subscribe to get premium features
    const subscription = {
      id: 'sub_' + Math.random().toString(36).substring(2, 15),
      planId: 'free',
      status: 'none' as SubscriptionStatus,
      currentPeriodEnd: '',
      createdAt: new Date().toISOString()
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
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
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed, please try again later' },
      { status: 500 }
    );
  }
} 