'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  // Determine current routing scope
  const isAdmin = pathname.startsWith('/portal') || 
                  pathname.startsWith('/roster') || 
                  pathname.startsWith('/schedule') || 
                  pathname.startsWith('/analytics') || 
                  pathname.startsWith('/instructors');

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
            ? "bg-[#161616] border-[#2a2a2a] text-white"
            : "bg-white border-zinc-200 text-black"
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
              <span className="text-3xl font-light tracking-[0.25em] font-serif text-white uppercase leading-none">
                EVOLVE
                <span className="text-[#FF9966] font-mono text-[9px] font-black tracking-widest bg-[#FF9966]/10 border border-[#FF9966]/20 px-2 py-0.5 rounded ml-2 align-middle">
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
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                      isActive 
                        ? (isAdmin ? "text-[#7c8cf2]" : isClient ? "text-[#FF5E62]" : "text-[#7c8cf2]")
                        : (isAdmin ? "text-zinc-550 hover:text-black" : isClient ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-black")
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
                className="py-3 px-6 rounded-md bg-gradient-to-r from-[#FF5E62] to-[#FF9966] text-white font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm shadow-[#FF5E62]/10 hover:brightness-110"
              >
                Book Session
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/portal"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                  Staff Portal
                </Link>
                <Link
                  href="/book"
                  className="py-3 px-6 rounded-md bg-[#7c8cf2] hover:bg-[#6c7ef0] text-white font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm shadow-[#7c8cf2]/10"
                >
                  Reserve Your Spot
                </Link>
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
            ? "bg-[#161616] border-[#2a2a2a] text-white"
            : "bg-white border-zinc-200 text-black"
        )}
      >
        <Link href="/" className="flex items-center select-none cursor-pointer">
          {isAdmin ? (
            <span className="text-xl font-light tracking-[0.2em] font-serif text-black uppercase leading-none">
              EVOLVE <span className="text-[#7c8cf2] font-mono text-[8px] font-bold">STAFF</span>
            </span>
          ) : isClient ? (
            <span className="text-xl font-light tracking-[0.2em] font-serif text-white uppercase leading-none">
              EVOLVE <span className="text-[#FF9966] font-mono text-[8px] font-bold">CLIENT</span>
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
            className="py-2 px-3.5 rounded-md bg-gradient-to-r from-[#FF5E62] to-[#FF9966] text-white font-black text-[10px] uppercase tracking-wider"
          >
            Book
          </Link>
        ) : (
          <Link
            href="/book"
            className="py-2 px-3.5 rounded-md bg-[#7c8cf2] text-white font-black text-[10px] uppercase tracking-wider"
          >
            Reserve
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
            ? "bg-[#161616] border-[#2a2a2a] text-zinc-400"
            : "bg-white border-zinc-200 text-zinc-500"
        )}
      >
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 cursor-pointer transition-all",
                isActive 
                  ? (isAdmin ? "text-[#7c8cf2] font-black" : isClient ? "text-[#FF5E62] font-black" : "text-[#7c8cf2] font-black")
                  : (isAdmin ? "text-zinc-500 hover:text-black" : isClient ? "text-zinc-400 hover:text-white" : "text-zinc-400 hover:text-zinc-800")
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
