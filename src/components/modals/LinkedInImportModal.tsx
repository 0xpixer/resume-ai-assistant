'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { ParsedResume } from '@/types/resume';

// LinkedIn API相关配置，需要从环境变量获取
const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '';
const LINKEDIN_REDIRECT_URI = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || '';

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (resumeData: ParsedResume) => void;
}

const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 生成LinkedIn授权URL
  const generateAuthUrl = () => {
    const scope = 'r_liteprofile r_emailaddress';
    const state = Math.random().toString(36).substring(2, 15);
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    return authUrl;
  };

  // 处理LinkedIn授权
  const handleLinkedInAuth = () => {
    setIsLoading(true);
    setError(null);
    
    // 打开LinkedIn授权页面
    window.location.href = generateAuthUrl();
  };

  // 在URL中检查授权码
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const errorParam = urlParams.get('error');
      
      if (errorParam) {
        setError('LinkedIn授权失败: ' + errorParam);
        setIsLoading(false);
        // 清除URL参数
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      if (code) {
        // 有授权码，调用API获取用户数据
        fetchLinkedInProfile(code);
        // 清除URL参数
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isOpen, router]);

  // 获取LinkedIn个人资料
  const fetchLinkedInProfile = async (code: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/resume/linkedin-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          profileUrl: 'https://www.linkedin.com/in/user', // 这里只是一个标识符，实际数据通过API获取
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '导入失败');
      }
      
      const data = await response.json();
      
      // 调用回调函数处理导入的数据
      onImport(data);
      onClose();
    } catch (err) {
      console.error('获取LinkedIn个人资料失败:', err);
      setError(err instanceof Error ? err.message : '导入失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 如果模态框关闭，则返回null，但不要在hooks前使用条件返回
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#fbfbfb] rounded-lg shadow-[1px_0_5px_rgba(0,0,0,0.05)] w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">从LinkedIn导入</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4">通过LinkedIn账号授权，我们可以获取您的个人资料信息来创建简历。</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 mb-4">
              {error}
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              className="flex items-center space-x-2 px-4 py-2 border border-[#0077b5] text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-colors rounded"
              onClick={handleLinkedInAuth}
              disabled={isLoading}
            >
              <FaLinkedin size={20} />
              <span>{isLoading ? '正在处理...' : '使用LinkedIn账号授权'}</span>
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            我们只会请求基本资料和电子邮件信息的权限，不会发布任何内容到您的LinkedIn账号。
          </p>
        </div>
        
        <div className="flex justify-end p-6 border-t">
          <button
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInImportModal; 