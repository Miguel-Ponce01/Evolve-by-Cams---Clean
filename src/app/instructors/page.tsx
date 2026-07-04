'use client';

import React from 'react';
import Link from 'next/link';
import { INSTRUCTORS } from '@/lib/seedData';
import { useBooking } from '@/context/BookingContext';
import { ArrowLeft, Star, Music, ChevronRight, Instagram } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function InstructorsPage() {
  const { classes } = useBooking();

  const themeBg = "bg-[#0A0A0A] text-[#F5F5F3]";
  const themeCardBg = "bg-[#141414] border-[#232323]";
  const themeTextMuted = "text-zinc-400";
  const themeHeaderColor = "text-white";
  const themeBorderColor = "border-zinc-800";

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${themeBg}`}>
      
      {/* Roster content */}
      <div className="max-w-[1240px] mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors" aria-label="Go back to Home">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Studio Coaches &amp; Leadership</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">Our Coaches Roster</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INSTRUCTORS.map((instructor, i) => (
            <div
              key={instructor.id}
              className={`flex flex-col rounded-xl overflow-hidden border shadow-lg transition-all duration-300 hover:border-[#C9A961]/40 hover:shadow-xl ${themeCardBg} animate-slide-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Header Band */}
              <div className="relative h-32 overflow-hidden flex items-center justify-center bg-zinc-950 border-b border-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black/20" />
                <span className="text-6xl z-10 filter drop-shadow-md select-none">{instructor.avatar}</span>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 border border-zinc-800 text-white text-xs font-bold font-mono">
                  <Star size={11} className="fill-[#C9A961] text-[#C9A961]" />
                  {instructor.rating.toFixed(2)}
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 p-6 flex flex-col justify-between text-left">
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-serif font-semibold text-xl text-white uppercase tracking-wide leading-tight">{instructor.name}</h2>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block mt-0.5">
                        Certified Instructor
                      </span>
                      <span className="text-xs font-mono font-bold text-[#C9A961] block mt-1">{instructor.specialty}</span>
                    </div>
                    <a
                      href={`https://instagram.com/${instructor.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 hover:bg-[#C9A961] hover:text-black border border-zinc-800 text-zinc-400 font-bold text-[9px] transition-all shrink-0"
                      aria-label={`${instructor.name} Instagram Profile`}
                    >
                      <Instagram size={10} /> {instructor.instagram}
                    </a>
                  </div>

                  <p className={`text-xs leading-relaxed font-medium flex-1 ${themeTextMuted}`}>{instructor.bio}</p>

                  {/* Rating & Students count row */}
                  <div className="flex items-center justify-between border-y border-zinc-900 py-3 my-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Specialties</span>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 text-[#C9A961]">
                          {[...Array(5)].map((_, index) => {
                            const ratingFloor = Math.floor(instructor.rating);
                            const isFilled = index < ratingFloor;
                            return (
                              <Star key={index} size={10} className={isFilled ? "fill-[#C9A961] text-[#C9A961]" : "text-zinc-800"} />
                            );
                          })}
                        </div>
                        <span className="text-[10px] font-bold font-mono text-zinc-400">{instructor.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block">Experience Level</span>
                      <span className="text-[10px] font-mono font-bold text-white uppercase">{instructor.id === 'cams' ? 'Founder / Master' : instructor.id === 'tweetie' ? 'Senior Coach' : 'Lead Coach'}</span>
                    </div>
                  </div>

                  {/* Course / Class Collection */}
                  <div className="space-y-1 bg-black/40 p-3.5 rounded-xl border border-zinc-900 text-left">
                    <span className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Specialty Disciplines</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-300">Pole Fitness</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-300">Aerial Sling</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-300">Exole (Exotic)</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-bold text-zinc-300">Sexy Chair</span>
                    </div>
                  </div>

                  {/* Playlist vibe */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-900 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Music size={14} className="text-emerald-500 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Playlist vibe · {instructor.musicStyle}</p>
                      <p className="text-xs font-bold text-zinc-300 truncate">{instructor.playlist}</p>
                    </div>
                  </div>
                </div>

                {/* View Classes CTA */}
                <Link
                  href={`/instructors/${instructor.id}`}
                  className="w-full py-3 mt-4 rounded-full bg-zinc-900 hover:bg-[#C9A961] hover:text-black border border-zinc-800 text-zinc-300 hover:border-[#C9A961] text-xs font-bold uppercase tracking-widest active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  View Profile <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
