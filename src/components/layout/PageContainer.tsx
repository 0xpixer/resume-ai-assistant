import { useContext } from 'react';
import { NavbarContext } from '@/context/NavbarContext';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  const { isNavExpanded } = useContext(NavbarContext);

  return (
    <div className={`min-h-screen bg-[#F7F7F7] flex flex-col ${className}`}>
      <div className={`flex-1 transition-all duration-300 ${
        isNavExpanded ? 'ml-64' : 'ml-16'
      }`}>
        {children}
      </div>
    </div>
  );
} 