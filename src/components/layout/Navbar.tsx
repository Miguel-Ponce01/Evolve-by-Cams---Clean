'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current routing scope
  const isAdmin = pathname.startsWith('/portal') || 
                  pathname.startsWith('/roster') || 
                  pathname.startsWith('/schedule') || 
                  pathname.startsWith('/analytics');

  const isClient = pathname.startsWith('/dashboard') || 
                   pathname.startsWith('/wallet') || 
                   pathname.startsWith('/profile') || 
                   pathname.startsWith('/memberships');

  // Define nav links based on layout mode
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: 'Console', path: '/portal' },
        { name: 'Roster', path: '/roster' },
        { name: 'Schedule', path: '/schedule' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Coaches', path: '/instructors' },
      ];
    }
    if (isClient) {
      return [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Wallet', path: '/wallet' },
        { name: 'Profile', path: '/profile' },
        { name: 'Memberships', path: '/memberships' },
      ];
    }
    // Public layout items
    return [
      { name: 'Home', path: '/' },
      { name: 'Classes', path: '/book' },
      { name: 'Coaches', path: '/instructors' },
      { name: 'Packages', path: '/memberships' },
      { name: 'About', path: '/about' },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* ── DESKTOP NAVIGATION BAR (TOP-BAR) ── */}
      <header 
        className={cn(
          "hidden lg:flex w-full sticky top-0 z-40 transition-all border-b",
          isAdmin
            ? "bg-white border-zinc-200 text-black"
            : isClient
            ? "bg-white border-zinc-200 text-black"
            : "bg-white/70 backdrop-blur-md border-zinc-200 text-black"
        )}
      >
        <div className="container mx-auto px-6 h-24 flex items-center justify-between max-w-[1240px]">
          
          {/* Brand Logo Header */}
          <Link href="/" className="flex items-center gap-1.5 select-none cursor-pointer">
            {isAdmin ? (
              <span className="text-3xl font-light tracking-[0.25em] font-serif text-black uppercase leading-none">
                EVOLVE
                <span className="text-[#7c8cf2] font-mono text-[9px] font-black tracking-widest bg-[#7c8cf2]/10 border border-[#7c8cf2]/20 px-2 py-0.5 rounded ml-2 align-middle">
                  STAFF
                </span>
              </span>
            ) : isClient ? (
              <span className="text-3xl font-light tracking-[0.25em] font-serif text-black uppercase leading-none">
                EVOLVE
                <span className="text-[#7c8cf2] font-mono text-[9px] font-black tracking-widest bg-[#7c8cf2]/10 border border-[#7c8cf2]/20 px-2 py-0.5 rounded ml-2 align-middle">
                  CLIENT
                </span>
              </span>
            ) : (
              <span className="text-3xl font-light tracking-[0.25em] font-serif text-black uppercase leading-none transition-colors hover:text-[#7c8cf2]">
                EVOLVE
              </span>
            )}
          </Link>

          {/* Navigation Links and CTA */}
          <div className="flex items-center gap-8 h-full">
            <nav className="flex items-center space-x-8 h-full">
              {navItems.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path + item.name}
                    href={item.path}
                    className={cn(
                      "text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                      isActive 
                        ? (isAdmin ? "text-[#7c8cf2]" : isClient ? "text-[#7c8cf2]" : "text-[#7c8cf2]")
                        : (isAdmin ? "text-zinc-550 hover:text-black" : isClient ? "text-zinc-500 hover:text-black" : "text-zinc-500 hover:text-black")
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Action CTA Button depending on scope */}
            {isAdmin ? (
              <Link
                href="/"
                className="py-3 px-5 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5"
              >
                <span>Exit Portal</span>
                <LogOut size={12} />
              </Link>
            ) : isClient ? (
              <Link
                href="/book"
                className="py-3 px-6 rounded-md bg-[#7c8cf2] hover:bg-[#6c7ef0] text-white font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm shadow-[#7c8cf2]/10"
              >
                Book Session
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  href="/book"
                  className="py-2.5 px-6 rounded-full bg-[#7c8cf2] hover:bg-[#6c7ef0] text-white font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm shadow-[#7c8cf2]/10"
                >
                  Book a Class
                </Link>
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="text-zinc-550 hover:text-[#7c8cf2] transition-colors p-1.5 flex items-center justify-center cursor-pointer rounded-full hover:bg-zinc-50"
                    aria-label="Features and Profile Settings"
                    aria-expanded={isMenuOpen}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl p-4 z-50 animate-scale-up text-left">
                      <div className="space-y-4 text-xs font-semibold text-zinc-800">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-black mb-2 select-none">Client Services</p>
                          <div className="flex flex-col gap-2">
                            <Link href="/book" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">Class Booking</Link>
                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">Client Dashboard</Link>
                            <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">My Profile Settings</Link>
                            <Link href="/memberships" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">Memberships &amp; Packs</Link>
                          </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-3">
                          <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-black mb-2 select-none">Staff &amp; Admin Panel</p>
                          <div className="flex flex-col gap-2">
                            <Link href="/portal" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors font-bold text-zinc-900">Staff Control Console</Link>
                            <Link href="/schedule" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">Class Schedule Builder</Link>
                            <Link href="/roster" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">Roster Analytics</Link>
                            <Link href="/wallet" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">Wallet Transactions</Link>
                            <Link href="/analytics" onClick={() => setIsMenuOpen(false)} className="hover:text-[#7c8cf2] transition-colors">Occupancy &amp; Reports</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── TABLET/MOBILE HEADER ── */}
      <header 
        className={cn(
          "lg:hidden w-full sticky top-0 z-40 px-4 py-4 flex items-center justify-between transition-colors border-b",
          isAdmin
            ? "bg-white border-zinc-200 text-black"
            : isClient
            ? "bg-white border-zinc-200 text-black"
            : "bg-white border-zinc-200 text-black"
        )}
      >
        <Link href="/" className="flex items-center select-none cursor-pointer">
          {isAdmin ? (
            <span className="text-xl font-light tracking-[0.2em] font-serif text-black uppercase leading-none">
              EVOLVE <span className="text-[#7c8cf2] font-mono text-[8px] font-bold">STAFF</span>
            </span>
          ) : isClient ? (
            <span className="text-xl font-light tracking-[0.2em] font-serif text-black uppercase leading-none">
              EVOLVE <span className="text-[#7c8cf2] font-mono text-[8px] font-bold">CLIENT</span>
            </span>
          ) : (
            <span className="text-xl font-light tracking-[0.2em] font-serif text-black uppercase leading-none">
              EVOLVE
            </span>
          )}
        </Link>

        {isAdmin ? (
          <Link
            href="/"
            className="py-2 px-3 rounded-md bg-white border border-zinc-200 text-zinc-700 font-black text-[9px] uppercase tracking-wider"
          >
            Exit
          </Link>
        ) : isClient ? (
          <Link
            href="/book"
            className="py-1.5 px-4 rounded-full bg-[#7c8cf2] text-white font-black text-[10px] uppercase tracking-wider"
          >
            Book
          </Link>
        ) : (
          <Link
            href="/book"
            className="py-1.5 px-4 rounded-full bg-[#7c8cf2] text-white font-black text-[10px] uppercase tracking-wider transition-colors"
          >
            Book
          </Link>
        )}
      </header>

      {/* ── TABLET/MOBILE FOOTER TAB NAVIGATION BAR ── */}
      <nav 
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex justify-around items-center h-16 px-2 pb-safe transition-colors",
          isAdmin
            ? "bg-white border-zinc-200 text-zinc-500"
            : isClient
            ? "bg-white border-zinc-200 text-zinc-500"
            : "bg-white border-zinc-200 text-zinc-500"
        )}
      >
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path + item.name}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 cursor-pointer transition-all",
                isActive 
                  ? (isAdmin ? "text-[#7c8cf2] font-black" : isClient ? "text-[#7c8cf2] font-black" : "text-[#7c8cf2] font-black")
                  : (isAdmin ? "text-zinc-550 hover:text-black" : isClient ? "text-zinc-500 hover:text-black" : "text-zinc-500 hover:text-black")
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
