'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'aesthetic' | 'neutral' | 'pastel' | 'minimalist';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('aesthetic');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('evolve_theme') as Theme;
      if (savedTheme && ['aesthetic', 'neutral', 'pastel', 'minimalist'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
      setHydrated(true);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('evolve_theme', newTheme);
    }
  };

  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      const root = document.documentElement;
      // Remove all theme classes
      root.classList.remove('theme-aesthetic', 'theme-neutral', 'theme-pastel', 'theme-minimalist');
      // Add active theme class
      root.classList.add(`theme-${theme}`);
    }
  }, [theme, hydrated]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
