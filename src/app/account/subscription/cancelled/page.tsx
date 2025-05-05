'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function SubscriptionCancelledPage() {
  const router = useRouter();
  
  // Mock subscription data
  const expiryDate = '2024-06-21';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <FiCheckCircle className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[#020202] mb-4">Subscription Cancelled</h1>
          <p className="text-lg text-gray-600 mb-6">
            Your subscription has been successfully cancelled. Thank you for using our service.
          </p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
            <h3 className="font-medium text-blue-800 mb-2">Subscription Details</h3>
            <p className="text-sm text-blue-700 mb-1">
              Your account will remain active until the end of your current billing cycle: <span className="font-medium">{expiryDate}</span>
            </p>
            <p className="text-sm text-blue-700">
              After this date, your account will automatically downgrade to the free plan.
            </p>
          </div>
          
          <div className="mb-8">
            <h3 className="font-medium text-[#020202] mb-2">What Happens Next?</h3>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>Your premium features will remain available until {expiryDate}</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>You will not be charged any further fees</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>After expiration, you can still access your content with limited features</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>You can re-subscribe at any time to restore full functionality</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/subscription')}
              className="px-6 py-3 bg-[#eb3d24] text-white rounded-md flex items-center justify-center hover:bg-[#d02e17] transition-colors w-full sm:w-auto"
            >
              Re-subscribe
              <FiArrowRight className="ml-2" />
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-[#020202] rounded-md hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
              Return to Dashboard
            </button>
          </div>
          
          <p className="mt-8 text-sm text-gray-500">
            If you have any questions, please contact our customer support team.
          </p>
        </div>
      </main>
    </div>
  );
} 