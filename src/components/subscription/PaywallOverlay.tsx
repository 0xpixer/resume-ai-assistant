'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaLock } from 'react-icons/fa';

interface PaywallOverlayProps {
  title: string;
  issueCount: number;
  type: 'feedback' | 'ats';
}

/**
 * Paywall component that shows limited content for non-subscribed users
 * Displays the number of issues found and encourages subscription
 */
const PaywallOverlay: React.FC<PaywallOverlayProps> = ({ title, issueCount, type }) => {
  const router = useRouter();

  const navigateToSubscription = () => {
    router.push('/subscription');
  };

  // Create sample categorized issues based on the type
  const getCategorizedIssues = () => {
    if (type === 'feedback') {
      return [
        { category: 'Structure', count: Math.ceil(issueCount * 0.3) },
        { category: 'Content', count: Math.ceil(issueCount * 0.4) },
        { category: 'Formatting', count: Math.ceil(issueCount * 0.2) },
        { category: 'Grammar', count: Math.ceil(issueCount * 0.1) }
      ];
    } else {
      return [
        { category: 'Missing Keywords', count: Math.ceil(issueCount * 0.5) },
        { category: 'Format Issues', count: Math.ceil(issueCount * 0.3) },
        { category: 'Compatibility', count: Math.ceil(issueCount * 0.2) }
      ];
    }
  };

  const categorizedIssues = getCategorizedIssues();

  return (
    <div className="bg-[#fbfbfb] p-4">
      {/* Summary of issues */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-base font-medium whitespace-nowrap">Found {issueCount} issues to fix</span>
          {issueCount > 0 && (
            <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-sm text-xs font-medium">
              Needs Improvement
            </span>
          )}
        </div>
        <p className="text-gray-700 mb-3">
          {type === 'feedback' 
            ? 'Our AI analysis found issues that may affect your resume\'s success rate.' 
            : 'Our ATS analysis found issues that may cause your resume to be filtered out.'}
        </p>
        
        {/* Simplified issues by category */}
        <div className="flex flex-wrap gap-2 mb-3">
          {categorizedIssues.map((issue, index) => (
            <div key={index} className="bg-red-50 text-red-500 px-2 py-1 rounded-sm text-xs font-medium">
              {issue.category}: {issue.count}
            </div>
          ))}
        </div>
      </div>
      
      {/* Paywall CTA moved higher */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-[#eb3d24]">
            <FaLock size={16} />
          </div>
          <div>
            <h4 className="text-base font-semibold">Upgrade to Premium</h4>
            <p className="text-sm text-gray-600">Get detailed analysis and recommendations</p>
          </div>
        </div>
        <button
          onClick={navigateToSubscription}
          className="w-full py-2 px-4 bg-[#eb3d24] hover:bg-[#d02e17] text-white font-semibold rounded-md transition-colors duration-200"
        >
          Upgrade Now
        </button>
      </div>
      
      {/* Placeholder content below CTA */}
      <div className="opacity-50 pointer-events-none">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
};

export default PaywallOverlay; 