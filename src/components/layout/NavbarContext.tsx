'use client';

import React, { createContext, useContext, useState } from 'react';

interface NavbarContextType {
  isNavExpanded: boolean;
  setIsNavExpanded: (value: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType>({
  isNavExpanded: false,
  setIsNavExpanded: () => {},
});

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  return (
    <NavbarContext.Provider value={{ isNavExpanded, setIsNavExpanded }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavExpanded() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavExpanded must be used within a NavbarProvider');
  }
  return context;
} 