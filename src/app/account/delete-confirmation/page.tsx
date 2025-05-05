'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { FiAlertTriangle, FiChevronLeft } from 'react-icons/fi';

export default function DeleteConfirmationPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  
  const handleDeleteAccount = async () => {
    setError('');
    setIsDeleting(true);
    
    try {
      // Call backend API to delete account
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sign out
      await signOut();
      
      // Redirect to home page with a message
      router.push('/?deleted=true');
    } catch (error) {
      setError('Account deletion failed, please try again later');
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#eb3d24] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="mb-6">
            <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-[#eb3d24]">
              <FiChevronLeft className="mr-2" /> Back to Profile
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <FiAlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Delete Your Account</h1>
            <p className="text-gray-600">This action cannot be undone.</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">What happens when you delete your account:</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• All your resume data will be permanently deleted</li>
              <li>• Your personal information will be removed from our system</li>
              <li>• Your subscription will be cancelled</li>
              <li>• You will lose access to all resume templates and premium features</li>
            </ul>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/profile"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              Cancel
            </Link>
            
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              {isDeleting ? 'Deleting Account...' : 'Yes, Delete My Account'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 