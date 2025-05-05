/**
 * Stripe客户端工具
 * 用于前端加载Stripe JS
 */
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe公钥，在实际环境中应该从环境变量获取
// 注意：使用公钥是安全的，它只用于客户端表单和身份验证
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || 'pk_test_51R4D1vEQPmVHlFdYLCrku5bShixdkORYDCYYJ1REOEMtjWtgjzKkfNiry5GWb5tShSqyESgIxvUBWQS7hmF1eh3H00FdP8Nhma';

// 加载Stripe客户端实例（单例模式）
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * 获取Stripe客户端实例
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

/**
 * 重置Stripe客户端实例
 * 在需要刷新API密钥时使用
 */
export const resetStripe = () => {
  stripePromise = null;
  return getStripe();
};

/**
 * 默认的Stripe Element配置
 */
export const defaultStripeElementsOptions = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#eb3d24',
    }
  },
  // 配置支持的支付方式 - 注意我们使用普通数组而不是只读数组
  paymentMethodOrder: ['apple_pay', 'google_pay', 'card'] as string[],
};

/**
 * Stripe产品和价格ID配置
 * 在实际环境中，这些值应该从数据库或环境变量获取
 */
export const stripePriceIds = {
  monthly: 'price_monthly_id',
  quarterly: 'price_quarterly_id',
  yearly: 'price_yearly_id',
};

/**
 * 获取格式化的价格展示
 * @param priceId Stripe价格ID
 * @param amount 金额（美分）
 * @param interval 订阅间隔
 */
export const formatPrice = (amount: number, interval: string = 'month') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });
  
  const price = amount / 100; // 将美分转换为美元
  return formatter.format(price);
}; 