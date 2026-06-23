'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme, Theme } from '@/context/ThemeContext';
import { 
  Calendar, 
  Users, 
  Wallet, 
  CreditCard, 
  UserCheck, 
  Palette, 
  ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Scheduler', path: '/', icon: Calendar },
    { name: 'Customers', path: '/profile', icon: Users },
    { name: 'Ledger', path: '/wallet', icon: Wallet },
    { name: 'Packages', path: '/memberships', icon: CreditCard },
    { name: 'Coaches', path: '/instructors', icon: UserCheck },
  ];

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'aesthetic', label: 'Evolve Classic (Aesthetic)', icon: '🔮' },
    { id: 'neutral', label: 'Slate Console (Neutral)', icon: '💻' },
    { id: 'pastel', label: 'Spring Bloom (Pastel)', icon: '🌸' },
    { id: 'minimalist', label: 'Pure Flat (Minimalist)', icon: '🏁' },
  ];

  const activeTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <>
      {/* ── DESKTOP NAVIGATION BAR (TOP-BAR) ── */}
      <header className="hidden lg:flex w-full sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-[1240px]">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <span className="text-2xl font-black font-display tracking-widest text-primary uppercase">EVOLVE</span>
            <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm">POS</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1.5 h-full">
            {navItems.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-bold uppercase tracking-wider transition-all cursor-pointer",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  )}
                >
                  <item.icon size={15} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Dropdown Widget */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2 border border-border bg-card hover:bg-secondary/50 rounded-pill text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <Palette size={14} className="text-primary" />
              <span>{activeTheme.label.split(' (')[0]}</span>
              <ChevronDown size={12} className={cn("transition-transform duration-200", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-60 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-border/60 animate-in fade-in slide-in-from-top-1 duration-150">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between hover:bg-secondary/40 cursor-pointer transition-colors",
                        theme === t.id ? "text-primary bg-primary/5" : "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </span>
                      {theme === t.id && <span className="text-primary text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── TABLET/MOBILE HEADER (TOP TITLE + THEME TOGGLE ONLY) ── */}
      <header className="lg:hidden w-full sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between transition-colors">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-lg font-black font-display tracking-widest text-primary uppercase">EVOLVE</span>
        </Link>

        {/* Compact Theme Trigger */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center cursor-pointer"
          >
            <Palette size={14} className="text-primary" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-border/60">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-secondary/40 cursor-pointer",
                      theme === t.id ? "text-primary bg-primary/5" : "text-muted-foreground"
                    )}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label.split(' (')[0]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── TABLET/MOBILE FOOTER TAB NAVIGATION BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 border-t border-border flex justify-around items-center h-16 px-2 pb-safe transition-colors">
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 cursor-pointer transition-all",
                isActive 
                  ? "text-primary font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all",
                isActive && "bg-primary/10"
              )}>
                <item.icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
