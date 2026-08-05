'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#090909] border-t border-zinc-900/60 py-20 text-zinc-400 relative z-10 text-left">
      <div className="max-w-[1240px] mx-auto px-6 space-y-16">

        {/* Top Brand Logo Row */}
        <div className="flex flex-col items-start gap-2 select-none border-b border-zinc-900/40 pb-8">
          <span className="text-3xl font-serif font-light tracking-[0.3em] text-white uppercase leading-none">
            EVOLVE
          </span>
          <span className="text-[10px] text-[#C9A961] tracking-widest uppercase font-mono font-bold">
            Pole Fitness &amp; Aerial Arts
          </span>
        </div>

        {/* Content Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-xs leading-relaxed font-semibold">

          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Branch &amp; Contact</span>
            <div className="space-y-3 text-zinc-300">
              <p className="hover:text-white transition-colors duration-200">
                <strong className="text-zinc-500 font-mono text-[10px] block mb-1">DAVAO STUDIO</strong>
                3F Sunscor Bldg., corner Arroyo St., along R Castillo highway, Davao City, 8000
              </p>
              <p className="pt-2 text-zinc-400">
                <span className="block">Phone: +63 987 654 3210</span>
                <span className="block">Email: evolvepole@yahoo.com</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Opening Hours</span>
            <div className="space-y-2 text-zinc-355 font-mono">
              <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                <span>MON - FRI (Closed Tue):</span>
                <span className="text-white">9:00 AM - 9:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                <span>SATURDAY:</span>
                <span className="text-white">9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                <span>SUNDAY:</span>
                <span className="text-red-500 font-bold">CLOSED</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Connect With Us</span>
            <p className="text-zinc-400 text-pretty">Follow our social channels to join the community, view student highlights, and track upcoming studio sessions.</p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com/evolvepolefitness"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#C9A961] hover:border-[#C9A961] transition-all active:scale-[0.96] duration-300"
                aria-label="Follow Evolve Pole Fitness on Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/EvolvePoleFitness/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-[#C9A961] hover:border-[#C9A961] transition-all active:scale-[0.96] duration-300"
                aria-label="Follow Evolve Pole Fitness on Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-10 border-t border-zinc-900/60 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} Evolve Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms &amp; Conditions</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
