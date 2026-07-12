'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut, ChevronDown } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsSubdomain(hostname.startsWith('pos.') || hostname.startsWith('admin.'));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                  pathname.startsWith('/analytics') ||
                  pathname.startsWith('/wallet') ||
                  pathname.startsWith('/profile') ||
                  pathname.startsWith('/dashboard');

  const isClient = pathname.startsWith('/memberships');

  // Define nav links based on layout mode
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: 'Console', path: '/portal' },
        { name: 'Roster', path: '/roster' },
        { name: 'Schedule', path: '/schedule' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Coaches', path: '/instructors' },
        { name: 'Wallet', path: '/wallet' },
        { name: 'Profile', path: '/profile' },
        { name: 'Dashboard', path: '/dashboard' },
      ];
    }
    if (isClient) {
      return [
        { name: 'Memberships', path: '/memberships' },
      ];
    }
    // Public layout items
    return [
      { name: 'Home', path: '/' },
      { name: 'Classes', path: '/classes' },
      { name: 'Packages', path: '/memberships' },
      { name: 'Events', path: '/events' },
      { name: 'Location', path: '/location' },
      { name: 'About', path: '/about' },
      { name: 'More', path: '/faq' },
    ];
  };

  const navItems = getNavItems();

  // Gold accent color used consistently across all themes
  const GOLD = '#C9A961';

  return (
    <>
      {/* ── DESKTOP NAVIGATION BAR ── */}
      <header
        className={cn(
          'hidden lg:flex w-full sticky top-0 z-40 transition-all duration-300 border-b',
          scrolled
            ? 'bg-black/90 backdrop-blur-md border-zinc-800 py-1 shadow-md shadow-black/40 text-white'
            : 'bg-[#0A0A0A] border-zinc-900 py-3 text-white'
        )}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-[1240px]">

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 select-none cursor-pointer group">
            <div className="flex flex-col leading-none">
              <span className="text-3xl font-light tracking-[0.25em] font-serif text-white uppercase group-hover:text-[#C9A961] transition-colors duration-300">
                EVOLVE
              </span>
              {isAdmin ? (
                <span className="text-[8px] font-mono font-black tracking-widest text-[#C9A961] uppercase mt-0.5">
                  Staff Portal
                </span>
              ) : isClient ? (
                <span className="text-[8px] font-mono font-black tracking-widest text-[#C9A961] uppercase mt-0.5">
                  Client Dashboard
                </span>
              ) : (
                <span className="text-[8px] font-mono font-black tracking-widest text-zinc-550 uppercase mt-0.5">
                  Pole Fitness &amp; Aerial Arts
                </span>
              )}
            </div>
          </Link>

          {/* Navigation Links and CTA */}
          <div className="flex items-center gap-8 h-full">
            <nav className="flex items-center space-x-8 h-full">
              {navItems.map(item => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path + item.name}
                    href={item.path}
                    className={cn(
                      'relative text-[11px] font-black uppercase tracking-widest transition-colors duration-200 cursor-pointer py-1',
                      'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:rounded-full after:transition-all after:duration-300',
                      isActive
                        ? `text-[#C9A961] after:w-full after:bg-[#C9A961]`
                        : `text-zinc-400 hover:text-white after:w-0 hover:after:w-full after:bg-[#C9A961]`
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Action CTA Button */}
            {isAdmin ? (
              <Link
                href="/"
                className="py-2.5 px-5 rounded-full border border-zinc-700 hover:border-[#C9A961] text-zinc-300 hover:text-[#C9A961] font-black text-xs uppercase tracking-widest transition-transform duration-200 active:scale-[0.96] flex items-center gap-1.5"
              >
                <span>Exit Portal</span>
                <LogOut size={12} />
              </Link>
            ) : isClient ? (
              <Link
                href="/book"
                className="py-2.5 px-6 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-transform duration-200 active:scale-[0.96] shadow-md shadow-[#C9A961]/10"
              >
                Book Session
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/book"
                  className="py-2.5 px-6 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-transform duration-200 active:scale-[0.96] shadow-md shadow-[#C9A961]/20"
                >
                  Book a Class
                </Link>

                {/* Log In button */}
                <Link
                  href="/login"
                  className="py-2.5 px-5 rounded-full border border-zinc-700 hover:border-[#C9A961] text-zinc-300 hover:text-[#C9A961] font-black text-xs uppercase tracking-widest transition-transform duration-200 active:scale-[0.96] flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Log In
                </Link>
                {isSubdomain && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className={cn(
                        'flex items-center gap-1.5 py-2 px-3 rounded-full border text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200',
                        isMenuOpen
                          ? 'border-[#C9A961] text-[#C9A961] bg-[#C9A961]/5'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                      )}
                      aria-label="App navigation menu"
                      aria-expanded={isMenuOpen}
                    >
                      <svg className="w-3.5 h-3.5 text-[#C9A961]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                      <span className="text-[10px]">App Menu</span>
                      <ChevronDown size={11} className={cn('transition-transform duration-200', isMenuOpen ? 'rotate-180' : '')} />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-3 w-68 bg-[#111111] border border-zinc-800 rounded-2xl shadow-2xl shadow-black/60 p-4 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Client Services */}
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-black mb-2 select-none px-2">
                            Client Services
                          </p>
                          {[
                            { label: 'Class Booking', href: '/book' },
                            { label: 'Client Dashboard', href: '/dashboard' },
                            { label: 'My Profile', href: '/profile' },
                            { label: 'Memberships & Packs', href: '/memberships' },
                            { label: 'Wallet & Transactions', href: '/wallet' },
                          ].map(link => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-3 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-150"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                        
                        <div className="border-t border-zinc-800 mt-3 pt-3 space-y-1">
                          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-black mb-2 select-none px-2">
                            Staff &amp; Admin
                          </p>
                          {[
                            { label: 'Staff Control Console', href: '/portal' },
                            { label: 'Class Schedule Builder', href: '/schedule' },
                            { label: 'Events Calendar Builder', href: '/portal/events' },
                            { label: 'Roster Analytics', href: '/roster' },
                            { label: 'Occupancy & Reports', href: '/analytics' },
                            { label: 'Wallet Ledger', href: '/wallet' },
                            { label: 'Client Registry', href: '/profile' },
                            { label: 'Client Dashboard', href: '/dashboard' },
                          ].map(link => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-[#C9A961] hover:bg-[#C9A961]/5 transition-all duration-150"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MOBILE / TABLET HEADER ── */}
      <header
        className={cn(
          'lg:hidden w-full sticky top-0 z-40 px-4 py-3 flex items-center justify-between transition-colors border-b',
          'bg-[#0A0A0A] border-zinc-800 text-white'
        )}
      >
        <Link href="/" className="flex flex-col select-none cursor-pointer">
          <span className="text-xl font-light tracking-[0.25em] font-serif text-white uppercase leading-none">
            EVOLVE
          </span>
          {isAdmin && (
            <span className="text-[7px] text-[#C9A961] tracking-widest font-mono font-black uppercase mt-0.5">Staff Portal</span>
          )}
          {isClient && (
            <span className="text-[7px] text-[#C9A961] tracking-widest font-mono font-black uppercase mt-0.5">Client</span>
          )}
        </Link>

        {isAdmin ? (
          <Link
            href="/"
            className="py-1.5 px-3 rounded-full border border-zinc-700 text-zinc-400 font-black text-[9px] uppercase tracking-wider hover:border-[#C9A961] hover:text-[#C9A961] transition-all"
          >
            Exit
          </Link>
        ) : (
          <Link
            href="/book"
            className="py-1.5 px-4 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-[10px] uppercase tracking-wider transition-colors active:scale-95"
          >
            Book
          </Link>
        )}
      </header>

      {/* ── MOBILE BOTTOM TAB NAV ── */}
      <nav
        className={cn(
          'lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex justify-around items-center h-16 px-2',
          'bg-[#0A0A0A] border-zinc-800 text-zinc-500'
        )}
      >
        {navItems.map(item => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.path + item.name}
              href={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 cursor-pointer transition-all',
                isActive ? 'text-[#C9A961]' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">{item.name}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#C9A961] mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
