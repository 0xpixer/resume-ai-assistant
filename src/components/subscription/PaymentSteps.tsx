'use client';

import React from 'react';

interface PaymentStepsProps {
  currentStep: number;
  steps: { id: number; label: string }[];
}

const PaymentSteps: React.FC<PaymentStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center relative">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Connection line */}
            {index > 0 && (
              <div 
                className={`flex-1 h-1 ${
                  step.id <= currentStep ? 'bg-[#eb3d24]' : 'bg-gray-300'
                }`}
              />
            )}
            
            {/* Step circle */}
            <div className="relative flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.id < currentStep 
                    ? 'bg-[#eb3d24] border-[#eb3d24] text-white' 
                    : step.id === currentStep
                      ? 'bg-white border-[#eb3d24] text-[#eb3d24]' 
                      : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <span className="text-sm">{step.id}</span>
                )}
              </div>
              <div 
                className={`absolute -bottom-6 w-max text-xs font-medium ${
                  step.id === currentStep ? 'text-[#eb3d24]' : 'text-gray-500'
                }`}
              >
                {step.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="h-6"></div> {/* Space for labels */}
    </div>
  );
};

export default PaymentSteps; 