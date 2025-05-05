'use client';

import React, { useState, useEffect } from 'react';
import { FiLock, FiUser } from 'react-icons/fi';
import { SubscriptionPlan } from './PlanSelector';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';

interface PaymentFormProps {
  selectedPlan: SubscriptionPlan;
  onSubmit: (formData: PaymentFormData) => void;
  isSubmitting: boolean;
}

export interface PaymentFormData {
  cardHolder: string;
  saveCard: boolean;
  paymentMethod?: string;
}

// 包装组件，提供Stripe Elements
const PaymentFormWrapper: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={getStripe()} options={{
      mode: 'setup',
      currency: 'usd',
      paymentMethodCreation: 'manual',
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#eb3d24',
        }
      }
    }}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

// 实际的支付表单组件
const StripePaymentForm: React.FC<PaymentFormProps> = ({
  selectedPlan,
  onSubmit,
  isSubmitting
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    cardHolder: '',
    saveCard: true,
  });
  
  const [paymentError, setPaymentError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet, prevent form submission
      return;
    }
    
    try {
      // First submit Elements form for validation
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setPaymentError(submitError.message || 'Payment information validation error. Please check your payment details.');
        return;
      }
      
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: formData.cardHolder,
          },
        },
      });
      
      if (error) {
        setPaymentError(error.message || 'Payment processing error. Please check your payment information.');
        return;
      }
      
      if (paymentMethod) {
        // Pass payment method ID to parent component
        onSubmit({
          ...formData,
          paymentMethod: paymentMethod.id,
        });
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setPaymentError('An error occurred while processing payment. Please try again later.');
    }
  };

  return (
    <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-[#020202]">Payment Details</h3>
        <div className="flex items-center text-green-600 text-sm">
          <FiLock className="mr-1" />
          <span>Secure Payment</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="cardHolder"
                name="cardHolder"
                value={formData.cardHolder}
                onChange={handleChange}
                placeholder="Full Name"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#eb3d24] focus:border-[#eb3d24]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="payment-element" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="border border-gray-300 rounded-md p-3 focus-within:ring-1 focus-within:ring-[#eb3d24] focus-within:border-[#eb3d24]">
              <PaymentElement
                id="payment-element"
                options={{
                  fields: {
                    billingDetails: {
                      name: 'never',  // We already collect the name above
                    }
                  },
                  paymentMethodOrder: ['card', 'alipay', 'wechat_pay']
                }}
              />
            </div>
            {paymentError && (
              <p className="mt-1 text-sm text-red-600">{paymentError}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveCard"
              name="saveCard"
              checked={formData.saveCard}
              onChange={handleChange}
              className="h-4 w-4 text-[#eb3d24] focus:ring-[#eb3d24] border-gray-300 rounded"
            />
            <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
              Save this payment method for future payments
            </label>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting || !stripe || !elements}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb3d24] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay $${selectedPlan.billedAmount}`
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-2">
            You can cancel your subscription at any time
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentFormWrapper; 