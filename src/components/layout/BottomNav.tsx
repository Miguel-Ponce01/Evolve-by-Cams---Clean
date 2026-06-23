'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, CreditCard, User, ShoppingBag } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Console', icon: Calendar },
  { href: '/wallet', label: 'Ledger', icon: CreditCard },
  { href: '/memberships', label: 'Packages', icon: ShoppingBag },
  { href: '/profile', label: 'Clients', icon: User },
  { href: '/instructors', label: 'Coaches', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-hairline safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl transition-all ${
                active ? 'text-primary font-bold bg-canvas-lavender' : 'text-ink-mute hover:text-ink'
              }`}
            >
              <Icon size={20} className={active ? 'stroke-primary text-primary' : ''} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
