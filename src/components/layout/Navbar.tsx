'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiFileText, FiLayers, FiUser, FiSettings, FiHelpCircle, FiChevronRight, FiMenu, FiCreditCard, FiLogIn, FiLogOut, FiUserPlus } from 'react-icons/fi';
import { useNavExpanded } from '@/components/layout/NavbarContext';
import { useAuth } from '@/components/auth/AuthContext';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isNavExpanded, setIsNavExpanded } = useNavExpanded();
  const { user, signOut } = useAuth();
  
  const toggleNavExpansion = () => {
    setIsNavExpanded(!isNavExpanded);
  };
  
  const isActive = (path: string) => {
    return pathname === path ? 
      isNavExpanded ? 'bg-[#eb3d24] text-[#F7F7F7]' : 'border-l-4 border-[#eb3d24] bg-[#202020] text-[#F7F7F7]' 
      : isNavExpanded ? 'text-[#020202] hover:bg-[#202020] hover:text-[#F7F7F7] group' : 'text-[#020202] hover:bg-[#202020] hover:text-[#F7F7F7] group';
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleProfileClick = (e: React.MouseEvent) => {
    // If user is not logged in, redirect to login page
    if (!user) {
      e.preventDefault();
      router.push('/login');
    }
  };
  
  return (
    <>
      {/* Top-right Authentication Buttons */}
      <div className="fixed top-4 right-8 z-20 flex space-x-3">
        {!user ? (
          <>
            <Link 
              href="/signup" 
              className="flex items-center py-1 px-4 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors font-medium"
            >
              <FiUserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Link>
            <Link 
              href="/login" 
              className="flex items-center py-1 px-4 bg-[#eb3d24] text-white rounded-md hover:bg-[#d02e17] transition-colors font-medium"
            >
              <FiLogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </>
        ) : null}
      </div>
      
      <div 
        className={`bg-[#fbfbfb] fixed left-0 top-0 h-screen flex flex-col z-10 transition-all duration-300 shadow-[1px_0_5px_rgba(0,0,0,0.05)] ${
          isNavExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Toggle Button */}
        <button 
          className="absolute -right-3 top-20 bg-[#eb3d24] text-[#F7F7F7] rounded-full p-1 shadow-md hover:bg-[#d02e17] z-20"
          onClick={toggleNavExpansion}
        >
          <FiChevronRight className={`h-4 w-4 transition-transform duration-300 ${isNavExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Logo */}
        <div className={`p-4 border-b border-[#202020] flex items-center ${isNavExpanded ? 'justify-start' : 'justify-center'}`}>
          {isNavExpanded ? (
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-[#020202] text-xl font-semibold">Resume AI</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center justify-center">
              <FiFileText className="h-6 w-6 text-[#020202]" />
            </Link>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 pt-4 overflow-y-auto">
          {isNavExpanded && (
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-[#eb3d24] uppercase tracking-wider">Main</h3>
            </div>
          )}
          <ul className="mt-2 space-y-1 px-2">
            <li>
              <Link 
                href="/" 
                className={`flex items-center py-2 rounded-md transition-colors duration-200 ${isActive('/')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
                title={!isNavExpanded ? "Home" : ""}
              >
                <FiHome className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 transition-colors duration-200 ${!pathname.startsWith('/') || pathname === '/' ? '' : 'text-[#020202] group-hover:text-[#F7F7F7]'}`} />
                {isNavExpanded && <span className={`transition-colors duration-200 ${!pathname.startsWith('/') || pathname === '/' ? '' : 'text-[#020202] group-hover:text-[#F7F7F7]'}`}>Home</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/resumes" 
                className={`flex items-center py-2 rounded-md transition-colors duration-200 ${isActive('/resumes')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
                title={!isNavExpanded ? "My Resumes" : ""}
              >
                <FiLayers className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 transition-colors duration-200 ${!pathname.startsWith('/resumes') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`} />
                {isNavExpanded && <span className={`transition-colors duration-200 ${!pathname.startsWith('/resumes') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`}>My Resumes</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/resume/create" 
                className={`flex items-center py-2 rounded-md transition-colors duration-200 ${isActive('/resume/create')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
                title={!isNavExpanded ? "Create Resume" : ""}
              >
                <FiFileText className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 transition-colors duration-200 ${!pathname.startsWith('/resume/create') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`} />
                {isNavExpanded && <span className={`transition-colors duration-200 ${!pathname.startsWith('/resume/create') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`}>Create Resume</span>}
              </Link>
            </li>
          </ul>
          
          {isNavExpanded && (
            <div className="px-4 mb-6 mt-6">
              <h3 className="text-xs font-semibold text-[#eb3d24] uppercase tracking-wider">Account</h3>
            </div>
          )}
          <ul className="mt-2 space-y-1 px-2">
            <li>
              <Link 
                href="/profile" 
                className={`flex items-center py-2 rounded-md transition-colors duration-200 ${isActive('/profile')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
                title={!isNavExpanded ? "Profile" : ""}
                onClick={handleProfileClick}
              >
                <FiUser className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 transition-colors duration-200 ${!pathname.startsWith('/profile') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`} />
                {isNavExpanded && <span className={`transition-colors duration-200 ${!pathname.startsWith('/profile') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`}>Profile</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/my-plan" 
                className={`flex items-center py-2 rounded-md transition-colors duration-200 ${isActive('/my-plan')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
                title={!isNavExpanded ? "My Plan" : ""}
              >
                <FiCreditCard className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 transition-colors duration-200 ${!pathname.startsWith('/my-plan') && !pathname.startsWith('/account/subscription') && !pathname.startsWith('/subscription') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`} />
                {isNavExpanded && <span className={`transition-colors duration-200 ${!pathname.startsWith('/my-plan') && !pathname.startsWith('/account/subscription') && !pathname.startsWith('/subscription') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`}>My Plan</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/settings" 
                className={`flex items-center py-2 rounded-md transition-colors duration-200 ${isActive('/settings')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
                title={!isNavExpanded ? "Settings" : ""}
              >
                <FiSettings className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 transition-colors duration-200 ${!pathname.startsWith('/settings') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`} />
                {isNavExpanded && <span className={`transition-colors duration-200 ${!pathname.startsWith('/settings') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`}>Settings</span>}
              </Link>
            </li>
          </ul>
          
          {isNavExpanded && (
            <div className="px-4 mb-6 mt-6">
              <h3 className="text-xs font-semibold text-[#eb3d24] uppercase tracking-wider">Support</h3>
            </div>
          )}
          <ul className="mt-2 space-y-1 px-2">
            <li>
              <Link 
                href="/help" 
                className={`flex items-center py-2 rounded-md transition-colors duration-200 ${isActive('/help')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
                title={!isNavExpanded ? "Help & FAQ" : ""}
              >
                <FiHelpCircle className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 transition-colors duration-200 ${!pathname.startsWith('/help') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`} />
                {isNavExpanded && <span className={`transition-colors duration-200 ${!pathname.startsWith('/help') ? 'text-[#020202] group-hover:text-[#F7F7F7]' : ''}`}>Help & FAQ</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Login and Signup buttons at bottom - only for non-logged-in users */}
        {!user && (
          <div className="mt-auto mb-4 px-2 space-y-1">
            <Link 
              href="/login" 
              className={`flex items-center py-2 rounded-md ${isActive('/login')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
              title={!isNavExpanded ? "Login" : ""}
            >
              <FiLogIn className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 ${!pathname.startsWith('/login') ? 'text-[#020202]' : ''}`} />
              {isNavExpanded && <span className={!pathname.startsWith('/login') ? 'text-[#020202]' : ''}>Login</span>}
            </Link>
            
            <Link 
              href="/signup" 
              className={`flex items-center py-2 rounded-md ${isActive('/signup')} ${isNavExpanded ? 'px-3' : 'justify-center'}`}
              title={!isNavExpanded ? "Sign Up" : ""}
            >
              <FiUserPlus className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 ${!pathname.startsWith('/signup') ? 'text-[#020202]' : ''}`} />
              {isNavExpanded && <span className={!pathname.startsWith('/signup') ? 'text-[#020202]' : ''}>Sign Up</span>}
            </Link>
          </div>
        )}
        
        {/* Logout button for logged-in users */}
        {user && (
          <div className="mt-auto mb-4 px-2">
            <button 
              onClick={handleSignOut}
              className={`flex items-center py-2 rounded-md w-full ${isNavExpanded ? 'px-3 justify-start' : 'justify-center'}`}
              title={!isNavExpanded ? "Logout" : ""}
            >
              <FiLogOut className={`${isNavExpanded ? 'mr-3' : ''} h-5 w-5 text-[#020202]`} />
              {isNavExpanded && <span className="text-[#020202]">Logout</span>}
            </button>
          </div>
        )}
        
        {/* Footer */}
        {isNavExpanded && (
          <div className="p-4 border-t border-[#202020]">
            <div className="text-xs text-[#020202]">
              &copy; 2024 Resume AI
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar; 