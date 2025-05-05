'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 非常简单的页面组件
function BasicResumeContent() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">创建新简历</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="mb-4">这是一个简化版的简历创建页面，用于测试路由问题。</p>
          
          <div className="flex space-x-4 mt-4">
            <Link 
              href="/resumes"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              返回简历列表
            </Link>
            
            <button 
              onClick={() => alert('功能暂时禁用')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              创建简历
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 包裹在Suspense中的导出组件
export default function BasicResumePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BasicResumeContent />
    </Suspense>
  );
} 