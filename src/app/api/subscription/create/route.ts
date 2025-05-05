import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/services/stripe';

/**
 * 创建订阅API端点
 * 接收支付方式ID和计划ID，创建Stripe订阅
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, paymentMethodId, customerName, saveCard } = body;

    // 验证所需参数
    if (!planId || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 在实际项目中，这里需要:
    // 1. 获取或创建Stripe客户ID (从用户会话或数据库)
    // 2. 将支付方式附加到客户
    // 3. 创建订阅
    const mockCustomerId = 'cus_' + Math.random().toString(36).substring(2, 15);
    
    console.log('创建订阅:', {
      customerId: mockCustomerId,
      planId,
      paymentMethodId,
      customerName,
      saveCard
    });

    // 调用Stripe服务创建订阅
    const subscription = await createSubscription(mockCustomerId, planId, paymentMethodId);

    // 在实际项目中，您还需要在此处更新用户的订阅状态

    return NextResponse.json({
      success: true,
      subscription
    });
  } catch (error: any) {
    console.error('创建订阅时出错:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建订阅时发生错误' },
      { status: 500 }
    );
  }
} 