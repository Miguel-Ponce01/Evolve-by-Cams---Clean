'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function GalleryPage() {
  const [filter, setFilter] = useState<'all' | 'pole' | 'silks' | 'hoop'>('all');

  const galleryItems = [
    { id: 1, discipline: 'pole', src: '/images/hero_pole_back.png', alt: 'Advanced pole posture hold' },
    { id: 2, discipline: 'silks', src: '/images/hero_aerial_silks.png', alt: 'Aerial silks wrap climb' },
    { id: 3, discipline: 'pole', src: '/images/hero_pole_invert.png', alt: 'Inverted split pole position' },
    { id: 4, discipline: 'hoop', src: '/images/hero_aerial_sling.png', alt: 'Aerial hoop mount inversion' },
    { id: 5, discipline: 'pole', src: '/images/hero_boots.png', alt: 'Studio boots training collection' },
    { id: 6, discipline: 'silks', src: '/images/studio_aerial.jpg', alt: 'Aerial silks draping setup' },
    { id: 7, discipline: 'hoop', src: '/images/studio_poles.jpg', alt: 'Aerial hoop rigging view' },
    { id: 8, discipline: 'pole', src: '/images/studio_reception.jpg', alt: 'Studio training poles and floors' },
  ];

  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.discipline === filter);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      <div className="max-w-[1240px] mx-auto px-6 py-16 md:py-24 space-y-12">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors" aria-label="Go back to Home">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Studio Aesthetics</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">Visual Gallery</h1>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 border-b border-zinc-900 pb-6">
          {(['all', 'pole', 'silks', 'hoop'] as const).map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`py-2 px-5 rounded-full text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                filter === d
                  ? 'bg-[#C9A961] text-black border-[#C9A961]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {d === 'all' ? 'All Disciplines' : d === 'pole' ? 'Pole Fitness' : d === 'silks' ? 'Aerial Silks' : 'Aerial Hoop'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="relative aspect-[3/4] overflow-hidden rounded-xl border border-zinc-900 group shadow-lg"
            >
              <img 
                src={item.src} 
                alt={item.alt}
                className="w-full h-full object-cover filter grayscale contrast-110 hover:grayscale-0 hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#C9A961]">
                  {item.discipline} &middot; Evolve Studio
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <Footer />
    </div>
  );
}
