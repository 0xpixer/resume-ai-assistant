'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { FiCreditCard, FiLoader, FiCheck } from 'react-icons/fi';
import { useNavExpanded } from '@/components/layout/NavbarContext';

export default function MyPlanPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { isNavExpanded } = useNavExpanded();

  // 获取订阅状态
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/customer', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription status');
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : '') || 'Failed to access billing portal');
      }
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to get portal URL');
      }
    } catch (error: any) {
      console.error('Error accessing billing portal:', error);
      alert(error.message || 'Failed to access billing portal. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 如果用户未登录，重定向到登录页面
  if (!user && !loading) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <div className={`transition-all duration-300 ${
        isNavExpanded ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="bg-white shadow rounded-lg p-8">
                <div className="flex justify-center items-center">
                  <FiLoader className="animate-spin h-8 w-8 text-gray-400" />
                </div>
              </div>
            ) : subscription?.status === 'active' ? (
              // 已订阅用户看到的界面
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b">
                  <h2 className="font-bold text-xl">Subscription Management</h2>
                  <p className="text-gray-600 text-sm mt-1">Manage your subscription and billing details</p>
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <FiCheck className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Active Subscription</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You have an active subscription. You can manage your subscription settings, update payment methods, or view billing history.
                    </p>
                    <button
                      onClick={handleManageSubscription}
                      disabled={loading}
                      className="mt-6 w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb3d24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                          Loading...
                        </>
                      ) : (
                        'Manage Subscription'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // 未订阅用户看到的界面
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b">
                  <h2 className="font-bold text-xl">Choose Your Plan</h2>
                  <p className="text-gray-600 text-sm mt-1">Select a subscription plan to access premium features</p>
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <FiCreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Subscription</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Subscribe to access premium features including unlimited resumes, AI assistance, and professional templates.
                    </p>
                    <button
                      onClick={() => router.push('/subscription')}
                      className="mt-6 w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#eb3d24] hover:bg-[#d02e17] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb3d24] transition-colors flex items-center justify-center"
                    >
                      View Plans & Pricing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 