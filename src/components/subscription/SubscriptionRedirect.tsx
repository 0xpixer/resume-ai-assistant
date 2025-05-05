'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSubscriptionRedirectPath } from '@/lib/subscription';
import { useAuth } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';

export default function SubscriptionRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  useEffect(() => {
    async function checkSubscriptionAndRedirect() {
      if (loading) return;
      
      if (!user) {
        // 未登录用户重定向到登录页面
        router.push('/login');
        return;
      }
      
      try {
        // 获取合适的重定向路径
        const redirectPath = await getSubscriptionRedirectPath();
        router.push(redirectPath);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // 发生错误时默认重定向到订阅页面
        router.push('/subscription');
      }
    }
    
    checkSubscriptionAndRedirect();
  }, [user, loading, router]);
  
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