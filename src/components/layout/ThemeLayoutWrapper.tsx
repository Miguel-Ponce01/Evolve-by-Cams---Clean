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

  return <>{children}</>;
}
