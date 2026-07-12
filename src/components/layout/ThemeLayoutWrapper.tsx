'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { 
  Sliders, 
  Calendar, 
  Sparkles, 
  Users, 
  Activity, 
  DollarSign, 
  UserCheck, 
  Tv, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Set dark mode styling classes
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

  // Cybersecurity blocking actions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleContextMenu = (e: MouseEvent) => {
      // e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        // e.preventDefault();
      }
    };

    const consoleInterval = setInterval(() => {
      // console.clear();
    }, 1000);

    // document.addEventListener('contextmenu', handleContextMenu);
    // document.addEventListener('keydown', handleKeyDown);

    return () => {
      // document.removeEventListener('contextmenu', handleContextMenu);
      // document.removeEventListener('keydown', handleKeyDown);
      clearInterval(consoleInterval);
    };
  }, []);

  // Determine layout routing paths
  const isLoginPage = pathname === '/admin';
  const isAdminPage = pathname.startsWith('/portal') ||
                      pathname.startsWith('/schedule') ||
                      pathname.startsWith('/roster') ||
                      pathname.startsWith('/analytics') ||
                      pathname.startsWith('/wallet') ||
                      pathname.startsWith('/profile') ||
                      pathname.startsWith('/dashboard');

  const adminMenuItems = [
    { label: 'Staff Control Console', href: '/portal', icon: Sliders },
    { label: 'Class Schedule Builder', href: '/schedule', icon: Calendar },
    { label: 'Events Calendar Builder', href: '/portal/events', icon: Sparkles },
    { label: 'Roster Analytics', href: '/roster', icon: Users },
    { label: 'Occupancy & Reports', href: '/analytics', icon: Activity },
    { label: 'Wallet Ledger', href: '/wallet', icon: DollarSign },
    { label: 'Client Registry', href: '/profile', icon: UserCheck },
    { label: 'Client Dashboard', href: '/dashboard', icon: Tv },
  ];

  // 1. LOGIN PAGE LAYOUT (Pure full-page card, no headers/bars)
  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 selection:bg-[#C9A961] selection:text-black">
        {children}
      </main>
    );
  }

  // 2. ADMIN PAGES LAYOUT (Premium Sidebar Layout)
  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] font-sans flex flex-col md:flex-row selection:bg-[#C9A961] selection:text-black">
        
        {/* Mobile Header Bar */}
        <header className="md:hidden h-16 bg-[#111111] border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-40">
          <Link href="/portal" className="flex items-center gap-2">
            <span className="text-xl font-light tracking-[0.25em] font-serif text-white uppercase">EVOLVE</span>
            <span className="text-[7px] font-mono font-black tracking-widest text-[#C9A961] uppercase mt-0.5">STAFF</span>
          </Link>
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 border border-zinc-800 rounded-lg text-[#C9A961] transition-transform active:scale-[0.96]"
            aria-label="Toggle navigation drawer"
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {/* Sidebar Container (Responsive) */}
        <aside className={cn(
          "w-64 bg-[#111111] border-r border-zinc-900 flex flex-col justify-between fixed md:sticky top-16 md:top-0 h-[calc(100vh-64px)] md:h-screen z-30 transition-transform duration-300 md:translate-x-0 overflow-y-auto",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          {/* Top Brand Logo / Staff Section */}
          <div>
            <div className="hidden md:flex flex-col p-6 border-b border-zinc-900 leading-none">
              <span className="text-2xl font-light tracking-[0.2em] font-serif text-white uppercase">
                EVOLVE
              </span>
              <span className="text-[8px] font-mono font-black tracking-widest text-[#C9A961] uppercase mt-1 inline-flex items-center gap-1">
                <ShieldAlert size={10} /> Staff Portal
              </span>
            </div>

            {/* Navigation Lists */}
            <nav className="p-4 space-y-1.5">
              <p className="text-[8px] uppercase tracking-widest text-zinc-550 font-black px-3 mb-2 select-none">
                System Administration
              </p>
              {adminMenuItems.map((item) => {
                const isItemActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-[0.98]",
                      isItemActive 
                        ? "bg-[#C9A961] text-black" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={14} className={isItemActive ? "text-black" : "text-zinc-500"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom logout exit bridge */}
          <div className="p-4 border-t border-zinc-900">
            <Link
              href="/"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-400 hover:bg-red-950/10 font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.96]"
            >
              <span>Exit Portal</span>
              <LogOut size={12} />
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[calc(100vh-64px)] md:min-h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // 3. STANDARD CLIENT WEBSITE LAYOUT (Navbar, AnimatedBackground, BottomNav)
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0 relative z-10">{children}</main>
      <BottomNav />
    </>
  );
}
