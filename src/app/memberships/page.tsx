'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageItem {
  id: string;
  title: string;
  price: number;
  credits: number;
  perClass: string;
  desc: string;
  popular?: boolean;
}

const PACKAGES: PackageItem[] = [
  {
    id: 'single',
    title: 'Single Class Pass (Group Class)',
    price: 700,
    credits: 1,
    perClass: '₱700/class',
    desc: 'Valid for all Pole Group Classes (All Levels). Perfect for walk-ins and trial sessions.',
  },
  {
    id: 'five',
    title: 'Davao Group Class Pass Pack',
    price: 1000,
    credits: 1,
    perClass: '₱1,000/class',
    desc: 'Evolve Davao Studio Group Class pass (Pole/Aerial Group Class All Levels).',
    popular: true,
  },
  {
    id: 'ten',
    title: 'Private Class (Pole / Aerial / Exole / Acro / Sexy Chair)',
    price: 1800,
    credits: 1,
    perClass: '₱1,800/hour',
    desc: 'Personalized training, faster progress, and a stronger you. Gracious in the air or bold on the floor.',
  },
  {
    id: 'unlimited',
    title: 'Annual Membership Fee',
    price: 1500,
    credits: 0,
    perClass: '₱1,500/year',
    desc: 'Annual Membership registration fee to access packages and premium features.',
  },
];

export default function PublicPackagesPage() {
  const [isDarkMode] = useState(true);

  const themeBg = isDarkMode ? "bg-[#0A0A0A] text-[#F5F5F3]" : "bg-[#FFFFFF] text-[#111111]";
  const themeCardBg = isDarkMode ? "bg-[#141414] border-[#232323]" : "bg-[#F9F9F9] border-[#E5E5E5]";
  const themeTextMuted = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const themeBorderColor = isDarkMode ? "border-zinc-800" : "border-zinc-200";

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-16 relative text-left ${themeBg}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600&display=swap');
        .display { font-family: 'Big Shoulders Display', sans-serif; text-transform: uppercase; letter-spacing: 0.01em; }
        .body-font { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* ── BLANK HERO SECTION ── */}
      <section className="relative py-24 text-center bg-[#0C0C0C] border-b border-zinc-900 overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6 space-y-4 relative z-10">
          <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-[0.1em] uppercase text-white leading-none text-balance">
            Our <span className="text-[#C9A961]">Packages</span>
          </h1>
          <div className="w-16 h-[1px] bg-zinc-800 mx-auto my-4" />
          <p className="text-xs sm:text-sm tracking-[0.15em] text-zinc-400 font-bold uppercase">
            Choose a plan that fits your practice and goals.
          </p>
        </div>
      </section>

      {/* ── PACKAGE STATIC PRESENTATION AREA ── */}
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "border rounded-3xl transition-shadow duration-200 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md",
                themeCardBg,
                pkg.id === 'unlimited' ? "border-[#C9A961]" : ""
              )}
            >
              {/* Popular / Premium Badge */}
              {pkg.id === 'unlimited' ? (
                <div className="absolute top-0 right-0 z-10">
                  <span className="bg-[#C9A961] text-black rounded-none rounded-bl-2xl font-sans text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm inline-flex items-center gap-1">
                    <Sparkles size={11} /> Premium
                  </span>
                </div>
              ) : pkg.popular ? (
                <div className="absolute top-0 right-0 z-10">
                  <span className="bg-[#C9A961] text-black rounded-none rounded-bl-2xl font-sans text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm inline-block">
                    Best Seller
                  </span>
                </div>
              ) : null}

              {/* Package Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-heading font-black text-lg uppercase tracking-wide text-balance">
                      {pkg.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${themeTextMuted}`}>{pkg.desc}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl font-black text-white font-mono tabular-nums">
                      ₱{pkg.price.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">
                      {pkg.perClass}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-900">
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-[#C9A961] shrink-0" />
                      <span>Professional coaching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-[#C9A961] shrink-0" />
                      <span>Premium training equipment</span>
                    </li>
                  </ul>

                  <Link
                    href="/book"
                    className="w-full text-center uppercase tracking-widest py-3 font-bold rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black text-xs block transition-transform duration-200 active:scale-[0.96]"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── REGISTERED BUSINESS NAME ON BOTTOM ── */}
      <section className={`py-12 border-t text-center ${isDarkMode ? "bg-black border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black font-sans">
          Evolve Pole Fitness &amp; Aerial Arts Studio
        </div>
      </section>
    </div>
  );
}
