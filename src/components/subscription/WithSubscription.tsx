'use client';

import React, { useState, useEffect } from 'react';
import { canAccessFeature } from '@/lib/subscription';
import PaywallOverlay from './PaywallOverlay';

interface WithSubscriptionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureKey: 'feedback' | 'ats' | 'premium_templates';
  title: string;
  issueCount?: number;
  loading?: boolean;
}

/**
 * Higher Order Component that wraps a feature with subscription check
 * Shows paywall if user doesn't have access to the feature
 */
const WithSubscription: React.FC<WithSubscriptionProps> = ({
  children,
  fallback,
  featureKey,
  title,
  issueCount = 0,
  loading = false
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setChecking(true);
        const access = await canAccessFeature(featureKey);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [featureKey]);

  // Show loading state
  if (checking || loading) {
    return (
      <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] p-4 h-full">
        <div className="animate-pulse flex flex-col h-full">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // If user has access, show the actual component
  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, show it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise, show paywall
  return (
    <PaywallOverlay
      title={title}
      issueCount={issueCount}
      type={featureKey === 'feedback' ? 'feedback' : 'ats'}
    />
  );
};

export default WithSubscription; 