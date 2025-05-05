'use client';

import React, { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  nextBillingDate?: string;
}

export default function CancelSubscriptionModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  nextBillingDate = 'the end of your current billing period'
}: CancelSubscriptionModalProps) {
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(cancelReason);
      // 关闭模态框在onConfirm完成后由父组件处理
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-[#020202] mb-4">Cancel Subscription</h3>
        
        <div className="bg-yellow-50 border border-yellow-100 rounded p-4 mb-4">
          <div className="flex items-start">
            <FiAlertCircle className="text-yellow-500 mt-0.5 mr-2" />
            <p className="text-sm text-yellow-700">
              After cancellation, your account will remain active until {nextBillingDate}. After that, your account will automatically downgrade to the free plan.
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
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Subscription
          </button>
          
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
} 