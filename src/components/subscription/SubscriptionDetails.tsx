'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiDownload, FiCreditCard, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import { formatPrice } from '@/lib/stripe';

// 定义接口来处理Stripe返回的数据结构
interface StripeSubscription {
  id: string;
  status: string;
  current_period_end: string;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
        recurring: { interval: string };
        product: {
          name: string;
          metadata: { features?: string };
        };
      };
    }>;
  };
  default_payment_method?: {
    card?: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
  };
}

interface StripeInvoice {
  id: string;
  number: string;
  amount_paid: number;
  status: string;
  hosted_invoice_url: string;
  created: number;
  period_start: number;
  period_end: number;
}

interface SubscriptionDetailsProps {
  onOpenCancelModal: () => void;
}

export default function SubscriptionDetails({ onOpenCancelModal }: SubscriptionDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  
  useEffect(() => {
    async function fetchSubscriptionData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // 使用新的API端点获取Stripe订阅数据
        const response = await fetch('/api/stripe/subscription');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load subscription data');
        }
        
        setSubscription(data.subscription);
        setInvoices(data.invoices || []);
      } catch (err: any) {
        console.error('Error loading subscription data:', err);
        setError(err.message || 'Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSubscriptionData();
  }, []);
  
  // 获取当前订阅的计划名称
  const getPlanName = () => {
    if (!subscription || !subscription.items.data[0]) {
      return 'Free Plan';
    }
    
    const priceData = subscription.items.data[0].price;
    return priceData.product.name || `${priceData.recurring.interval.charAt(0).toUpperCase() + priceData.recurring.interval.slice(1)} Plan`;
  };
  
  // 获取当前订阅的下一个付款日期
  const getNextBillingDate = () => {
    if (!subscription || !subscription.current_period_end) {
      return 'N/A';
    }
    
    return new Date(subscription.current_period_end).toLocaleDateString();
  };
  
  // 获取当前订阅的支付方式信息
  const getPaymentMethodInfo = () => {
    if (!subscription || !subscription.default_payment_method || !subscription.default_payment_method.card) {
      return 'None';
    }
    
    const card = subscription.default_payment_method.card;
    return `${card.brand.toUpperCase()} **** ${card.last4}`;
  };
  
  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#eb3d24] border-r-transparent"></div>
        <p className="ml-3 text-gray-600">Loading subscription information...</p>
      </div>
    );
  }
  
  // 显示错误状态
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-start">
          <FiAlertCircle className="text-red-500 mt-0.5 mr-3" size={18} />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Error loading subscription</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-red-700 text-sm underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 如果用户没有订阅，显示一个提示信息
  if (!subscription) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-4">
        <div className="flex items-start">
          <FiAlertCircle className="text-yellow-500 mt-0.5 mr-3" size={20} />
          <div>
            <h3 className="text-yellow-800 font-medium mb-2">No active subscription</h3>
            <p className="text-yellow-700 mb-4">You currently don't have an active subscription. Upgrade to a premium plan to access all features.</p>
            <Link 
              href="/subscription" 
              className="px-4 py-2 bg-[#eb3d24] text-white rounded-md hover:bg-[#d02e17] transition-colors inline-block"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      <div className="bg-[#fbfbfb] p-6 rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#020202]">Current Subscription</h2>
            <p className="text-sm text-gray-500">Manage your current subscription plan</p>
          </div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
            subscription.status === 'trialing' ? 'bg-blue-100 text-blue-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {subscription.status === 'active' ? 'Active' : 
             subscription.status === 'trialing' ? 'Trial' : 
             subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </div>
        </div>
        
        <div className="border-t border-b py-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="font-medium">{getPlanName()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Next Billing Date</p>
              <p className="font-medium flex items-center">
                <FiCalendar className="mr-1 text-gray-400" size={14} />
                {getNextBillingDate()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium flex items-center">
                <FiCreditCard className="mr-1 text-gray-400" size={14} />
                {getPaymentMethodInfo()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            className="px-4 py-2 border border-[#eb3d24] text-[#eb3d24] rounded-md hover:bg-red-50 transition-colors"
            onClick={onOpenCancelModal}
          >
            Cancel Subscription
          </button>
          <button className="px-4 py-2 border border-gray-300 text-[#020202] rounded-md hover:bg-gray-100 transition-colors">
            Update Payment Method
          </button>
        </div>
      </div>
      
      {/* Subscription Features */}
      <div className="bg-[#fbfbfb] p-6 rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-[#020202] mb-4">Your Benefits</h2>
        
        <ul className="space-y-3">
          <li className="flex items-start">
            <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
            <span className="text-sm">Unlimited resumes and cover letters</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
            <span className="text-sm">Pro resume templates</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
            <span className="text-sm">AI writing assistant</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
            <span className="text-sm">No watermark exports</span>
          </li>
          <li className="flex items-start">
            <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
            <span className="text-sm">Priority support</span>
          </li>
        </ul>
        
        <div className="mt-6">
          <Link 
            href="/subscription"
            className="text-sm text-[#eb3d24] hover:text-[#d02e17] font-medium"
          >
            View all subscription plans →
          </Link>
        </div>
      </div>
      
      {/* Billing History */}
      {invoices.length > 0 && (
        <div className="bg-[#fbfbfb] p-6 rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold text-[#020202] mb-6">Billing History</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium text-gray-500">Date</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Invoice</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Amount</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                  <th className="text-right pb-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="py-4">{formatDate(invoice.created)}</td>
                    <td className="py-4">{invoice.number}</td>
                    <td className="py-4">{formatPrice(invoice.amount_paid)}</td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <a 
                        href={invoice.hosted_invoice_url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#eb3d24] hover:text-[#d02e17]"
                      >
                        <FiDownload className="mr-1" size={14} />
                        <span>Download</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 