'use client';

import { useAuth } from '../auth/AuthContext';
import { t } from '@/lib/i18n-utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserAttributes {
  name?: string;
  email?: string;
}

interface AuthUser {
  username: string;
  attributes?: UserAttributes;
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const authUser = user as unknown as AuthUser;

  // 当组件未挂载时返回初始视图，避免hydration不匹配
  if (!isMounted) {
    return (
      <nav className="bg-[#fbfbfb] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">{t('app.title', 'Resume AI Assistant')}</span>
              </div>
            </div>
            <div className="flex items-center">
              {/* 空白占位，确保服务器和客户端结构一致 */}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[#fbfbfb] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                {t('app.title', 'Resume AI Assistant')}
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="ml-4 flex items-center space-x-4">
                <span className="text-slate-600">{authUser.attributes?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {t('app.signOut', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {t('app.signIn', 'Sign In')}
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {t('app.signUp', 'Sign Up')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 