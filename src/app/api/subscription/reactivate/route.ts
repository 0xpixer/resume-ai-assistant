import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key', {
  apiVersion: '2022-11-15' as any,
});

/**
 * 恢复已取消的订阅
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
    
    // 在演示模式下，我们使用测试账号模拟恢复订阅
    if (user.email === 'arrow7440@gmail.com') {
      // 为测试账号模拟恢复订阅
      // 实际上，测试账号的订阅状态在Cookie中保持不变
      // 在生产环境中，你应该调用Stripe API恢复订阅
      return NextResponse.json({
        success: true,
        message: 'Subscription reactivated successfully',
      });
    }
    
    // 在实际环境中，以下是使用Stripe API恢复订阅的代码
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
    
    // 获取用户的已取消订阅
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });
    
    if (!subscriptions.data.length) {
      return NextResponse.json(
        { success: false, error: 'No subscription found to reactivate' },
        { status: 404 }
      );
    }
    
    const subscriptionId = subscriptions.data[0].id;
    
    // 检查订阅是否已设置为周期结束时取消
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { success: false, error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }
    
    // 恢复订阅 - 设置 cancel_at_period_end 为 false
    const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });
    
    return NextResponse.json({
      success: true,
      subscription: reactivatedSubscription,
      message: 'Subscription reactivated successfully',
    });
    */
    
    // 对于普通账户，模拟成功恢复的响应
    // 在真实环境中，应该更新订阅数据库记录或与支付处理商交互
    
    // 获取订阅信息
    const subscriptionCookie = req.cookies.get('subscription');
    let subscription = null;
    
    if (subscriptionCookie) {
      try {
        subscription = JSON.parse(subscriptionCookie.value);
      } catch (e) {
        console.error('Error parsing subscription cookie:', e);
      }
    }
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }
    
    // 更新订阅状态（在真实环境中，这应该持久化到数据库）
    subscription.cancelAtPeriodEnd = false;
    
    // 创建响应并更新cookie
    const response = NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription reactivated successfully',
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
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
} 