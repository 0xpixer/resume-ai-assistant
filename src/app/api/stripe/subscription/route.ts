import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key', {
  apiVersion: '2022-11-15' as any,
});

/**
 * 获取当前用户的Stripe订阅信息
 */
export async function GET(req: NextRequest) {
  try {
    // 从cookie中获取用户信息
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth');
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
    
    // 在实际应用中，你需要从数据库中获取用户的Stripe客户ID
    // 这里我们假设email是一种映射方式（实际中不要这样做，应该用唯一ID）
    const customerEmail = user.email;
    
    // 在演示模式下，我们使用测试账号直接返回模拟数据
    if (user.email === 'arrow7440@gmail.com') {
      // 为测试账号返回高级订阅数据
      return NextResponse.json({
        success: true,
        subscription: {
          id: 'sub_premium_test',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: {
            data: [
              {
                price: {
                  id: 'price_yearly_premium',
                  unit_amount: 9999,
                  recurring: { interval: 'year' },
                  product: {
                    name: 'Premium Yearly Plan',
                    metadata: { features: 'all' }
                  }
                }
              }
            ]
          },
          default_payment_method: {
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025
            }
          }
        },
        invoices: [
          {
            id: 'in_test1',
            number: 'INV-001',
            amount_paid: 9999,
            status: 'paid',
            hosted_invoice_url: '#',
            created: Date.now() - 60 * 24 * 60 * 60 * 1000,
            period_start: Date.now() - 60 * 24 * 60 * 60 * 1000,
            period_end: Date.now() + 305 * 24 * 60 * 60 * 1000
          }
        ]
      });
    }
    
    // 在实际环境中，以下是使用Stripe API获取真实数据的代码
    // 注释掉的代码展示了如何使用Stripe API
    /*
    // 查找客户ID
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    const customer = customers.data[0];
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // 获取客户的订阅信息
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      expand: ['data.default_payment_method', 'data.items.data.price.product']
    });
    
    // 获取发票历史
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 5,
    });
    
    return NextResponse.json({
      success: true,
      subscription: subscriptions.data[0] || null,
      invoices: invoices.data
    });
    */
    
    // 对于非测试账户，返回模拟的基本/免费用户数据
    return NextResponse.json({
      success: true,
      subscription: null, // 没有活跃订阅
      invoices: []
    });
    
  } catch (error: any) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
} 