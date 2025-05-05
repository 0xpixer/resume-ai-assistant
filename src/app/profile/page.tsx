'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  
  // User information form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  // Password form
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // Toggle password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Error messages
  const [formError, setFormError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Success messages
  const [formSuccess, setFormSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Initialize form data when user is loaded
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("User not authenticated, redirecting to login page");
        // If user is not logged in, redirect to login page
        router.push('/login');
      } else {
        console.log("User authenticated:", user);
        // If user is logged in, set form data
        const nameParts = (user.name || '').split(' ');
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || ''
        });
      }
    }
  }, [user, loading, router]);
  
  // Client-side only check for authentication - this ensures redirection works properly
  useEffect(() => {
    // Get auth cookie directly
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const authCookie = getCookie('auth');
    if (!authCookie && !loading) {
      console.log("No auth cookie found, redirecting");
      router.push('/login');
    }
  }, [router, loading]);
  
  // Handle member information form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save member information
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!formData.firstName || !formData.lastName) {
      setFormError('Please enter your complete name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Call backend API to update user information
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setFormSuccess('Profile information successfully updated');
    } catch (error) {
      setFormError('Save failed, please try again later');
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please complete all password fields');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Call backend API to change password
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPasswordSuccess('Password successfully changed');
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError('Password change failed, please try again later');
      console.error('Error changing password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Delete account
  const handleDeleteAccount = async () => {
    // Remove window.confirm since we now have a dedicated confirmation page
    // if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    //   return;
    // }
    
    setDeleteError('');
    setIsDeleting(true);
    
    try {
      // Call backend API to delete account
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sign out
      await signOut();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      setDeleteError('Account deletion failed, please try again later');
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#eb3d24] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If user is not logged in, show a loading screen while redirecting
  // This avoids flashing content before redirection happens
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#eb3d24] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button className="px-6 py-3 border-b-2 border-[#eb3d24] text-[#eb3d24] font-medium">
            My Account
          </button>
          <Link href="/my-plan" className="px-6 py-3 text-gray-600 hover:text-gray-900">
            My Plan
          </Link>
        </div>
        
        {/* Member Information */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#eb3d24] mb-6">Member Information</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#eb3d24] focus:border-[#eb3d24]"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#eb3d24] focus:border-[#eb3d24]"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#eb3d24] focus:border-[#eb3d24]"
              />
            </div>
            
            {formError && (
              <p className="text-red-600">{formError}</p>
            )}
            
            {formSuccess && (
              <p className="text-green-600">{formSuccess}</p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#eb3d24] text-white rounded-md hover:bg-[#d02e17] transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </form>
        </section>
        
        {/* Change Password */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-[#eb3d24] mb-6">Change Password</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#eb3d24] focus:border-[#eb3d24]"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#eb3d24] focus:border-[#eb3d24]"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            
            {passwordError && (
              <p className="text-red-600">{passwordError}</p>
            )}
            
            {passwordSuccess && (
              <p className="text-green-600">{passwordSuccess}</p>
            )}
            
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-3 bg-[#eb3d24] text-white rounded-md hover:bg-[#d02e17] transition-colors"
            >
              {isChangingPassword ? 'Saving...' : 'Save'}
            </button>
          </form>
        </section>
        
        {/* Delete Account */}
        <section className="mb-10 mt-16 border-t pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-600 mb-2">Account Deletion</h2>
            
            <Link 
              href="/account/delete-confirmation" 
              className="text-gray-500 hover:text-red-600 text-sm underline transition-colors"
            >
              Delete my account
            </Link>
          </div>
          
          <p className="text-gray-500 text-sm">
            If you delete your account, all your personal data and resume information will be permanently removed.
          </p>
        </section>
      </main>
    </div>
  );
} 