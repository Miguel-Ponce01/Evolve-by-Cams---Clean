'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ThemeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isClientApp = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/wallet') || 
                          pathname.startsWith('/profile') || 
                          pathname.startsWith('/memberships');

      const root = document.documentElement;
      if (isClientApp) {
        root.classList.add('dark-mode-override');
      } else {
        root.classList.remove('dark-mode-override');
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    };

    // 3. Clear console periodically
    const consoleInterval = setInterval(() => {
      console.clear();
    }, 1000);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(consoleInterval);
    };
  }, []);

  return <>{children}</>;
}
