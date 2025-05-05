'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface NavbarContextType {
  isNavExpanded: boolean;
  toggleNavExpansion: () => void;
  setNavExpanded: (expanded: boolean) => void;
}

export const NavbarContext = createContext<NavbarContextType>({
  isNavExpanded: false,
  toggleNavExpansion: () => {},
  setNavExpanded: () => {},
});

interface NavbarProviderProps {
  children: ReactNode;
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // 在localStorage中存储导航栏的展开状态
  useEffect(() => {
    // 加载上次存储的状态
    const storedExpanded = localStorage.getItem('navExpanded');
    if (storedExpanded) {
      setIsNavExpanded(storedExpanded === 'true');
    }
    
    // 监听窗口大小变化，在小屏幕上自动折叠
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsNavExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleNavExpansion = () => {
    const newState = !isNavExpanded;
    setIsNavExpanded(newState);
    localStorage.setItem('navExpanded', String(newState));
  };
  
  const setNavExpanded = (expanded: boolean) => {
    setIsNavExpanded(expanded);
    localStorage.setItem('navExpanded', String(expanded));
  };

  return (
    <NavbarContext.Provider value={{ isNavExpanded, toggleNavExpansion, setNavExpanded }}>
      {children}
    </NavbarContext.Provider>
  );
}; 