'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateResumePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/resume/build');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-4 bg-white rounded shadow-md">
        <h1 className="text-lg font-medium">重定向中...</h1>
        <p>正在前往简历创建页面</p>
      </div>
    </div>
  );
} 