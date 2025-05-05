'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const t = useTranslations();
  const [year, setYear] = useState(2023); // 使用静态年份作为初始值
  const [isMounted, setIsMounted] = useState(false);

  // 客户端挂载后更新年份
  useEffect(() => {
    setYear(new Date().getFullYear());
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#fbfbfb] shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('app.title')}
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              {/* Language switcher will go here */}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-[#fbfbfb] border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            © {year} AI Resume Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}