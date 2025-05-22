'use client';

import { useContext, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { NavbarContext } from '@/context/NavbarContext';
import Link from 'next/link';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import PageContainer from '@/components/layout/PageContainer';

// 包含useSearchParams的组件
function HomeContent() {
  const router = useRouter();
  const { isNavExpanded } = useContext(NavbarContext);
  const searchParams = useSearchParams();
  const [showDeletedMessage, setShowDeletedMessage] = useState(false);
  
  useEffect(() => {
    // Check if the account was just deleted
    if (searchParams.get('deleted') === 'true') {
      setShowDeletedMessage(true);
      
      // Clear the URL parameter after showing the message
      const url = new URL(window.location.href);
      url.searchParams.delete('deleted');
      window.history.replaceState({}, '', url);
      
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowDeletedMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);
  
  return (
    <PageContainer>
      <Navbar />
      
      {/* Account deleted success message */}
      {showDeletedMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-md flex items-center">
          <FiCheckCircle className="mr-2 h-5 w-5 text-green-500" />
          <span>Your account has been successfully deleted.</span>
          <button 
            onClick={() => setShowDeletedMessage(false)}
            className="ml-4 text-green-500 hover:text-green-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#020202] mb-4">Resume AI Assistant</h1>
          <p className="text-[#020202] text-lg">Professional AI-powered resume creation and optimization platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Create Resume Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-[#020202] mb-3">Create Resume</h2>
            <p className="text-gray-600 mb-4">Use AI to generate professional resumes quickly and efficiently</p>
            <Link href="/resume/build" className="block text-center py-2 px-4 bg-[#eb3d24] text-white rounded-md hover:bg-[#d02e17] transition-colors">
              Get Started
            </Link>
          </div>
          
          {/* Super Account Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-[#eb3d24]">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold text-[#020202]">Super Account</h2>
              <span className="bg-[#eb3d24] text-white text-xs px-2 py-1 rounded-full">Recommended</span>
            </div>
            <p className="text-gray-600 mb-4">Log in to access premium features including ATS Check and AI Resume Feedback</p>
            <Link href="/login" className="block text-center py-2 px-4 bg-[#eb3d24] text-white rounded-md hover:bg-[#d02e17] transition-colors">
              Login Now
            </Link>
          </div>
          
          {/* Subscription Features Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-[#020202] mb-3">Subscription Plans</h2>
            <p className="text-gray-600 mb-4">Explore our premium features and subscription plans to boost your job search</p>
            <Link href="/subscription" className="block text-center py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// 导出包含Suspense的主页组件
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
