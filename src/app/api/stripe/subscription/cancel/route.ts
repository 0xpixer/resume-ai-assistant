import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key', {
  apiVersion: '2022-11-15' as any,
});

/**
 * 取消用户的订阅
 */
export async function POST(req: NextRequest) {
  try {
    // 从cookie中获取用户信息
    const authCookie = req.cookies.get('auth');
    if (!authCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    let user;
    try {
      user = JSON.parse(authCookie.value);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication data' },
        { status: 400 }
      );
    }
    
    // 获取取消原因
    const body = await req.json();
    const { reason } = body;
    
    // 在演示模式下，我们使用测试账号模拟取消订阅
    if (user.email === 'arrow7440@gmail.com') {
      // 为测试账号模拟取消订阅
      // 实际上，测试账号的订阅状态在Cookie中是无法被真正取消的
      // 在生产环境中，你应该调用Stripe API取消订阅
      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    }
    
    // 在实际环境中，以下是使用Stripe API取消订阅的代码
    // 注释掉的代码展示了如何使用Stripe API
    /*
    // 首先获取客户的订阅ID
    const customers = await stripe.customers.list({ 
      email: user.email,
      limit: 1 
    });
    
    if (!customers.data.length) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    const customerId = customers.data[0].id;
    
    // 获取用户的活跃订阅
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });
    
    if (!subscriptions.data.length) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }
    
    const subscriptionId = subscriptions.data[0].id;
    
    // 取消订阅，但保留到当前账单周期结束
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      metadata: { 
        cancellation_reason: reason || 'No reason provided'
      }
    });
    
    return NextResponse.json({
      success: true,
      subscription: canceledSubscription,
      message: 'Subscription cancelled successfully',
    });
    */
    
    // 对于普通账户，模拟成功取消的响应
    // 获取订阅信息
    const subscriptionCookie = req.cookies.get('subscription');
    let subscription = null;
    
    if (subscriptionCookie) {
      try {
        subscription = JSON.parse(subscriptionCookie.value);
      } catch (e) {
        console.error('Error parsing subscription cookie:', e);
        return NextResponse.json(
          { success: false, error: 'Invalid subscription data' },
          { status: 400 }
        );
      }
    }
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }
    
    // 更新订阅状态（在真实环境中，这应该持久化到数据库）
    subscription.cancelAtPeriodEnd = true;
    subscription.cancelReason = reason || 'No reason provided';
    
    // 创建响应并更新cookie
    const response = NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription cancelled successfully',
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
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 