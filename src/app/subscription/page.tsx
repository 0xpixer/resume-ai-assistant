'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import FeaturesList from '@/components/subscription/FeaturesList';
import PlanSelector, { SubscriptionPlan, defaultPlans } from '@/components/subscription/PlanSelector';
import PaymentForm, { PaymentFormData } from '@/components/subscription/PaymentForm';
import PaymentSecurity from '@/components/subscription/PaymentSecurity';
import PaymentSteps from '@/components/subscription/PaymentSteps';
import { FiLock, FiCheck } from 'react-icons/fi';
import { NavbarContext } from '@/context/NavbarContext';
import { resetStripe } from '@/lib/stripe';

const steps = [
  { id: 1, label: 'Select Plan' },
  { id: 2, label: 'Payment' },
];

export default function SubscriptionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState('quarterly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const router = useRouter();
  const { isNavExpanded } = useContext(NavbarContext);

  // 页面加载时重置Stripe实例，确保使用最新的API密钥
  useEffect(() => {
    // 重置并初始化Stripe
    resetStripe();
  }, []);

  const selectedPlan = defaultPlans.find(plan => plan.id === selectedPlanId) || defaultPlans[0];
  const features = [
    'Professional Resume Templates',
    'Unlimited Resumes and Cover Letters',
    'No Watermark Export',
    'Unlimited Resume Entries'
  ];

  const handleSubmitPayment = async (formData: PaymentFormData) => {
    try {
      setIsSubmitting(true);
      setPaymentError(null);
      
      if (!formData.paymentMethod) {
        throw new Error('Payment method is invalid');
      }
      
      // 使用Stripe API创建客户端和订阅
      console.log('Processing payment:', { plan: selectedPlan, paymentMethodId: formData.paymentMethod });
      
      // 调用后端API处理订阅
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          paymentMethodId: formData.paymentMethod,
          customerName: formData.cardHolder,
          saveCard: formData.saveCard
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Subscription processing failed');
      }
      
      // 订阅成功，重定向到成功页面
      router.push('/subscription/success');
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setPaymentError(error.message || 'Payment processing failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar />
      
      <main className={`flex-1 transition-all duration-300 ${isNavExpanded ? 'ml-64' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#020202] mb-2">
              <span className="inline-block mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#00C853"/>
                  <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="#00C853"/>
                </svg>
              </span>
              Invest in Your Career Growth
            </h1>
            <p className="text-lg text-gray-600 mb-4">One plan, unlimited possibilities</p>
          </div>
          
          {paymentError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <p>{paymentError}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <PaymentSteps currentStep={2} steps={steps} />
              
              <div className="bg-[#fbfbfb] p-6 rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] mb-6">
                <h2 className="text-2xl font-semibold text-[#020202] mb-4">Choose Your Subscription Plan</h2>
                <FeaturesList features={features} />
                <PlanSelector
                  selectedPlanId={selectedPlanId}
                  onSelectPlan={setSelectedPlanId}
                />
              </div>
              
              <PaymentSecurity />
            </div>
            
            <div>
              <PaymentForm
                selectedPlan={selectedPlan}
                onSubmit={handleSubmitPayment}
                isSubmitting={isSubmitting}
              />
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => router.push('/subscription/success')}
                  className="text-sm text-[#eb3d24] hover:text-[#d02e17] flex items-center"
                >
                  <FiLock className="mr-1" />
                  <span>Test Account? Click Here to View Success Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}