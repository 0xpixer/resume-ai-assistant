import { useState } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
  visible: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      visible: true,
      duration: 5000,
      variant: 'default',
      ...options
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prev) => 
        prev.map((t) => t.id === id ? { ...t, visible: false } : t)
      );
      
      // Remove from state after animation completes
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, newToast.duration);

    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => 
      prev.map((t) => t.id === id ? { ...t, visible: false } : t)
    );
    
    // Remove from state after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  return {
    toast,
    dismiss,
    toasts
  };
} 