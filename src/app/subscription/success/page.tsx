'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[#020202] mb-4">Subscription Successful!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for subscribing to our service. You can now use all premium features to create the perfect resume.
          </p>
          
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-800 mb-2">Subscription Details</h3>
            <p className="text-sm text-green-700 mb-1">Plan: Quarterly Premium</p>
            <p className="text-sm text-green-700 mb-1">Price: $23.33/month (quarterly charge $69.99)</p>
            <p className="text-sm text-green-700">Next payment date: June 21, 2024</p>
          </div>
          
          <div className="mb-8">
            <h3 className="font-medium text-[#020202] mb-2">You now have access to the following features:</h3>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>Create and save unlimited resumes and cover letters</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>Access to professional templates and customization options</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>AI-assisted writing and optimization suggestions</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                <span>ATS optimization check to ensure your resume passes screening systems</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="primary"
              onClick={() => router.push('/cvmaker/build')}
              className="w-full md:w-auto text-lg"
            >
              Create Resume
              <FiArrowRight className="ml-2" />
            </Button>
            
            <button
              onClick={() => router.push('/account/subscription')}
              className="px-6 py-3 border border-gray-300 text-[#020202] rounded-md hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 