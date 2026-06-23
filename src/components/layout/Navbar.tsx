'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { Zap, DollarSign, Users } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'POS Console' },
  { href: '/wallet', label: 'Sales Ledger' },
  { href: '/memberships', label: 'Package Desk' },
  { href: '/profile', label: 'Client Registry' },
  { href: '/instructors', label: 'Coaches Roster' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useBooking();

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full items-center justify-between px-8 py-4 border-b border-hairline bg-white/90 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight text-ink">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap size={16} className="text-on-primary fill-current" />
        </div>
        <span className="font-semibold">Evolve <span className="text-primary font-bold">by Cams</span></span>
      </Link>

      <nav className="flex items-center gap-2 bg-canvas-lavender/50 p-1.5 rounded-pill border border-hairline">
        {navLinks.map(link => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-pill transition-all ${
                active 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-ink-mute hover:text-ink hover:bg-white/50'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-canvas-cream text-xs font-bold uppercase tracking-widest text-ink border border-hairline">
          👑 Admin Console
        </div>
      </div>
    </header>
  );
}
