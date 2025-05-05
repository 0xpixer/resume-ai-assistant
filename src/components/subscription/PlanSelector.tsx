'use client';

import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

// 订阅计划定义
export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  billingFrequency: 'monthly' | 'quarterly' | 'biannually';
  billedAmount: number;
  isPopular?: boolean;
  features: string[];
}

export const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    monthlyPrice: 23.33,
    billingFrequency: 'quarterly',
    billedAmount: 69.99,
    isPopular: true,
    features: [
      'Professional Resume Templates',
      'Unlimited Resumes & Cover Letters',
      'No Watermark Export',
      'Unlimited Resume Entries'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    monthlyPrice: 39.99,
    billingFrequency: 'monthly',
    billedAmount: 39.99,
    features: [
      'Professional Resume Templates',
      'Unlimited Resumes & Cover Letters',
      'No Watermark Export',
      'Unlimited Resume Entries'
    ]
  },
  {
    id: 'biannually',
    name: 'Biannual Plan',
    monthlyPrice: 16.66,
    billingFrequency: 'biannually',
    billedAmount: 99.99,
    features: [
      'Professional Resume Templates',
      'Unlimited Resumes & Cover Letters',
      'No Watermark Export',
      'Unlimited Resume Entries'
    ]
  }
];

// 将计费频率转换为显示文本
const frequencyToText = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  biannually: 'Every 6 months'
};

interface PlanSelectorProps {
  plans?: SubscriptionPlan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans = defaultPlans,
  selectedPlanId,
  onSelectPlan
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#020202]">Choose Payment Option</h3>
      
      <div className="space-y-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              selectedPlanId === plan.id 
                ? 'border-[#eb3d24] bg-white' 
                : 'border-gray-200 bg-[#fbfbfb] hover:border-gray-300'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-2.5 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                Most Popular
              </div>
            )}
            
            <div className="flex items-start">
              <div 
                className={`w-5 h-5 rounded-full border flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center ${
                  selectedPlanId === plan.id 
                    ? 'border-[#eb3d24] bg-[#eb3d24]' 
                    : 'border-gray-300'
                }`}
                onClick={() => onSelectPlan(plan.id)}
              >
                {selectedPlanId === plan.id && <FiCheck className="text-white" size={12} />}
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-[#020202]">
                      <span className="text-2xl font-bold">${plan.monthlyPrice}</span>/month
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {frequencyToText[plan.billingFrequency]} payment ${plan.billedAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSelector; 