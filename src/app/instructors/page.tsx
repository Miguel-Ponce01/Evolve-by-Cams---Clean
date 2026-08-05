'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INSTRUCTORS } from '@/lib/seedData';
import { useBooking } from '@/context/BookingContext';
import { 
  ArrowLeft, 
  Star, 
  Instagram, 
  Edit3, 
  Check, 
  Grid, 
  Calendar, 
  Heart, 
  BookOpen, 
  Users, 
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

export default function InstructorsPage() {
  const { classes } = useBooking();
  const [isAdmin, setIsAdmin] = useState(false);
  const [instructorsList, setInstructorsList] = useState(INSTRUCTORS);
  const [selectedInst, setSelectedInst] = useState<any>(INSTRUCTORS[0]);
  const [activeTab, setActiveTab] = useState<'posts' | 'availability' | 'bio'>('posts');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = document.cookie.includes('evolve-admin-session=true') || 
                     localStorage.getItem('evolve-admin-session') === 'true';
      setIsAdmin(isAuth);
      
      const cached = localStorage.getItem('evolve_instructors_custom');
      if (cached) {
        setInstructorsList(JSON.parse(cached));
        setSelectedInst(JSON.parse(cached)[0]);
      }
    }
  }, []);

  // Filter classes taught by selected instructor
  const instructorClasses = classes.filter(
    (cls) => cls.instructor.name.toLowerCase() === selectedInst.name.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans pb-16">
      
      {/* Top Banner & Header */}
      <div className="max-w-[935px] mx-auto px-4 pt-12 pb-6 border-b border-zinc-900">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/portal" 
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors shrink-0"
            aria-label="Go back to Console"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Studio Team Roster</span>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold tracking-wide uppercase text-white">Coaches &amp; Bios</h1>
          </div>
        </div>

        {/* Coach Profiles Carousel Selector */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 mb-10 border-b border-zinc-900/55">
          {instructorsList.map((inst) => {
            const isSel = selectedInst.id === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => {
                  setSelectedInst(inst);
                  setActiveTab('posts');
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-1.5 rounded-2xl transition-all cursor-pointer outline-none shrink-0",
                  isSel ? "scale-105" : "opacity-50 hover:opacity-85"
                )}
              >
                {/* Instagram Circle Story Ring */}
                <div className={cn(
                  "w-16 h-16 rounded-full p-[3px] flex items-center justify-center transition-all",
                  isSel ? "bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600" : "bg-zinc-800"
                )}>
                  <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center text-3xl font-bold select-none">
                    {inst.avatar}
                  </div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                  {inst.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── INSTAGRAM PROFILE HEADER GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12">
          
          {/* Avatar Section */}
          <div className="flex justify-center md:justify-end md:pr-10 shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-[4px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center shadow-2xl relative">
              <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center text-6xl select-none">
                {selectedInst.avatar}
              </div>
            </div>
          </div>

          {/* Profile Details & Bio */}
          <div className="col-span-2 text-left space-y-5">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">
                {selectedInst.name.replace(/\s+/g, '').toLowerCase()}
              </h2>
              
              <a
                href={`https://instagram.com/${selectedInst.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-[#C9A961] hover:text-black font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Instagram size={14} />
                <span>Follow</span>
              </a>
            </div>

            {/* Profile Statistics Tally */}
            <div className="flex items-center gap-6 sm:gap-10 border-y border-zinc-900 py-3 text-sm">
              <div>
                <span className="font-bold text-white font-mono">{instructorClasses.length}</span>{' '}
                <span className="text-zinc-500 text-xs">active classes</span>
              </div>
              <div>
                <span className="font-bold text-white font-mono">{selectedInst.totalStudents || '1.2k'}</span>{' '}
                <span className="text-zinc-500 text-xs">students</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={13} className="fill-[#C9A961] text-[#C9A961]" />
                <span className="font-bold text-white font-mono">{selectedInst.rating}</span>
                <span className="text-zinc-500 text-xs">rating</span>
              </div>
            </div>

            {/* Description / Bio */}
            <div className="space-y-1">
              <div className="font-bold text-white text-sm uppercase tracking-wide">
                {selectedInst.name}
              </div>
              <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest font-bold">
                {selectedInst.specialty}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed pt-2 font-medium max-w-lg">
                {selectedInst.bio}
              </p>
              
              {/* Music / Vibe Info */}
              <div className="flex items-center gap-4 pt-3 text-[10px] text-zinc-500 font-mono font-bold uppercase">
                <span>🎵 Vibe: {selectedInst.musicStyle || 'Deep House & R&B'}</span>
                <span>&bull;</span>
                <span>🎧 Playlist: {selectedInst.playlist || 'Instructor Set'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── IG FEED TAB NAVIGATION ── */}
        <div className="flex justify-center border-t border-zinc-900 text-xs font-black uppercase tracking-widest">
          <div className="flex gap-12 -mt-[1px]">
            <button
              onClick={() => setActiveTab('posts')}
              className={cn(
                "flex items-center gap-2 py-4 border-t-2 transition-all cursor-pointer",
                activeTab === 'posts' ? "border-[#C9A961] text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Grid size={14} />
              <span>Classes (Grid)</span>
            </button>

            <button
              onClick={() => setActiveTab('availability')}
              className={cn(
                "flex items-center gap-2 py-4 border-t-2 transition-all cursor-pointer",
                activeTab === 'availability' ? "border-[#C9A961] text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Calendar size={14} />
              <span>Availability</span>
            </button>

            <button
              onClick={() => setActiveTab('bio')}
              className={cn(
                "flex items-center gap-2 py-4 border-t-2 transition-all cursor-pointer",
                activeTab === 'bio' ? "border-[#C9A961] text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              <BookOpen size={14} />
              <span>Credentials</span>
            </button>
          </div>
        </div>

        {/* ── TABS CONTENTS AREA ── */}
        <div className="py-8">
          
          {/* TAB 1: CLASSES GRID FEED */}
          {activeTab === 'posts' && (
            <>
              {instructorClasses.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 space-y-2">
                  <Heart size={32} className="mx-auto text-zinc-700" />
                  <p className="text-xs uppercase tracking-widest font-mono font-bold">No active classes listed this week</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {instructorClasses.map((cls) => (
                    <div 
                      key={cls.id}
                      className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden group hover:border-[#C9A961]/45 transition-colors shadow-lg flex flex-col justify-between"
                    >
                      <div className="p-5 text-left space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A961] font-bold">
                            {cls.type}
                          </span>
                          <span className="text-[9px] bg-zinc-900 text-white font-mono uppercase px-2.5 py-0.5 rounded border border-zinc-800">
                            {cls.level}
                          </span>
                        </div>
                        <h4 className="text-lg font-serif font-bold text-white uppercase tracking-wide">
                          {cls.title}
                        </h4>
                        <p className="text-xs text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                          {cls.description}
                        </p>
                      </div>

                      <div className="p-5 pt-0 border-t border-zinc-900 mt-4 flex items-center justify-between text-xs font-mono">
                        <div className="text-white font-bold">{cls.time}</div>
                        <Link
                          href={`/book/${cls.id}`}
                          className="px-4 py-1.5 rounded-lg bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-[10px] uppercase tracking-wider"
                        >
                          Book Class
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: WEEKLY AVAILABILITY CALENDAR */}
          {activeTab === 'availability' && (
            <div className="max-w-md mx-auto space-y-3">
              {(selectedInst.availability || [
                'Mon 9:00 AM - 12:00 PM',
                'Wed 5:00 PM - 8:00 PM',
                'Sat 10:00 AM - 2:00 PM'
              ]).map((slot: string, idx: number) => (
                <div 
                  key={idx}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex items-center justify-between font-mono text-xs text-zinc-300 shadow-sm"
                >
                  <span className="text-zinc-500 font-bold uppercase">Weekly Shift {idx + 1}</span>
                  <span className="text-white font-bold">{slot}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CREDENTIALS & SPECIALTIES */}
          {activeTab === 'bio' && (
            <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-left space-y-6 shadow-xl">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9A961] mb-2">Qualifications</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  All Evolve Studio instructors are internationally certified in safety rigging, anatomical movement, and advanced apparatus mechanics.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9A961]">Assigned Focus Disciplines</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedInst.specialty.split(',').map((spec: string) => (
                    <span 
                      key={spec}
                      className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-white"
                    >
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
}
