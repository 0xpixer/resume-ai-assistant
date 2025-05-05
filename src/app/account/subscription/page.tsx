'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { FiCreditCard, FiAlertCircle, FiCalendar, FiDownload, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { getSubscription, Subscription } from '@/lib/subscription';
import { useAuth } from '@/components/auth/AuthContext';

// Example billing history interface
interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'processing' | 'failed';
  url: string;
}

export default function SubscriptionManagementPage() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Load subscription data
  useEffect(() => {
    async function loadSubscriptionData() {
      if (loading) return;
      
      // If user is not logged in, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        setIsLoading(true);
        const subscriptionData = await getSubscription();
        
        // If no active subscription, redirect to subscription page
        if (!subscriptionData || !['active', 'trialing'].includes(subscriptionData.status)) {
          router.push('/subscription');
          return;
        }
        
        setSubscription(subscriptionData);
        
        // Fetch billing history (in a real app, this would be a separate API call)
        // For now we'll just use mock data
        setBillingHistory([
          {
            id: 'inv_1234',
            date: '2024-03-21',
            amount: 69.99,
            status: 'paid',
            url: '#'
          }
        ]);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSubscriptionData();
  }, [user, loading, router]);

  const handleCancelSubscription = async () => {
    try {
      setIsSubmitting(true);
      
      // Call the cancel API
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      // Redirect to cancellation confirmation page
      router.push('/account/subscription/cancelled');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format plan name for display
  const getPlanName = () => {
    if (!subscription) return '';
    
    switch(subscription.planId) {
      case 'monthly':
        return 'Monthly Plan';
      case 'quarterly':
        return 'Quarterly Plan';
      case 'yearly':
        return 'Annual Plan';
      default:
        return subscription.planId;
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#eb3d24] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="ml-16 lg:ml-64 p-8">
        <h1 className="text-3xl font-bold text-[#020202] mb-8">Subscription Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Status Card */}
          <div className="lg:col-span-2">
            <div className="bg-[#fbfbfb] p-6 rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#020202]">Current Subscription</h2>
                  <p className="text-sm text-gray-500">Manage your current subscription plan</p>
                </div>
                <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {subscription?.status === 'active' ? 'Active' : subscription?.status === 'trialing' ? 'Trial' : 'Inactive'}
                </div>
              </div>
              
              <div className="border-t border-b py-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-medium">{getPlanName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Billing Date</p>
                    <p className="font-medium">
                      {subscription?.currentPeriodEnd ? 
                        new Date(subscription.currentPeriodEnd).toLocaleDateString() : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">
                      VISA **** 4242
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="px-4 py-2 border border-[#eb3d24] text-[#eb3d24] rounded-md hover:bg-red-50 transition-colors"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Subscription
                </button>
                <button className="px-4 py-2 border border-gray-300 text-[#020202] rounded-md hover:bg-gray-100 transition-colors">
                  Update Payment Method
                </button>
              </div>
            </div>
          </div>
          
          {/* Subscription Features Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#fbfbfb] p-6 rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
              <h2 className="text-xl font-semibold text-[#020202] mb-4">Your Benefits</h2>
              
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">Unlimited resumes and cover letters</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">Pro resume templates</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">AI writing assistant</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">No watermark exports</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mt-1 mr-2 flex-shrink-0" />
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
          </div>
          
          {/* Billing History */}
          <div className="lg:col-span-3">
            <div className="bg-[#fbfbfb] p-6 rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)]">
              <h2 className="text-xl font-semibold text-[#020202] mb-6">Billing History</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-3 font-medium text-gray-500">Date</th>
                      <th className="text-left pb-3 font-medium text-gray-500">Invoice ID</th>
                      <th className="text-left pb-3 font-medium text-gray-500">Amount</th>
                      <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                      <th className="text-right pb-3 font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((bill) => (
                      <tr key={bill.id} className="border-b">
                        <td className="py-4">{bill.date}</td>
                        <td className="py-4">{bill.id}</td>
                        <td className="py-4">${bill.amount.toFixed(2)}</td>
                        <td className="py-4">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {bill.status === 'paid' ? 'Paid' : 'Processing'}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <a 
                            href={bill.url} 
                            className="inline-flex items-center text-[#eb3d24] hover:text-[#d02e17]"
                          >
                            <FiDownload className="mr-1" size={14} />
                            <span>Download</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                    {billingHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-500">
                          No billing records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-[#020202] mb-4">Cancel Subscription</h3>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded p-4 mb-4">
              <div className="flex items-start">
                <FiAlertCircle className="text-yellow-500 mt-0.5 mr-2" />
                <p className="text-sm text-yellow-700">
                  After cancellation, your account will remain active until the end of the current billing cycle 
                  {subscription?.currentPeriodEnd ? 
                    ` (${new Date(subscription.currentPeriodEnd).toLocaleDateString()})` : 
                    ''
                  }. After that, your account will automatically downgrade to the free plan.
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-1">
                Why are you cancelling? (Optional)
              </label>
              <select
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#eb3d24] focus:border-[#eb3d24]"
              >
                <option value="">Please select a reason</option>
                <option value="too_expensive">Too expensive</option>
                <option value="not_useful">Doesn't meet my needs</option>
                <option value="switching">Switching to another service</option>
                <option value="features">Missing required features</option>
                <option value="temporary">Temporarily don't need it</option>
                <option value="other">Other reason</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 text-[#020202] rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Subscription
              </button>
              
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCancelSubscription}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 