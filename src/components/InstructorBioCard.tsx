'use client';

import React from 'react';
import { Star, Instagram, Music, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface Instructor {
  id: string;
  name: string;
  avatarUrl?: string; // High-res image asset support
  initials: string;   // Fallback text initials for layout stability (CLS reduction)
  bio: string;
  specialty: string;
  musicStyle: string;
  playlist: string;
  instagram: string;
  totalStudents: number;
  rating: number;
}

interface InstructorBioCardProps {
  instructor: Instructor;
  onBookSession?: (instructorId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHILD COMPONENT: PlaylistVibeBanner
// Extensible child banner containing the music preferences/playlist links
// ─────────────────────────────────────────────────────────────────────────────

interface PlaylistVibeBannerProps {
  musicStyle: string;
  playlist: string;
}

export function PlaylistVibeBanner({ musicStyle, playlist }: PlaylistVibeBannerProps) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f9f0ff] border border-[#4a154b]/5 transition-all">
      <div className="w-9 h-9 rounded-xl bg-[#4a154b]/5 flex items-center justify-center shrink-0">
        <Music size={14} className="text-[#4a154b] animate-pulse" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] text-[#4a154b]/60 uppercase tracking-widest font-black leading-none mb-1">
          Playlist Vibe · {musicStyle}
        </p>
        <p className="text-xs font-bold text-zinc-900 truncate leading-none">
          {playlist}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT: InstructorBioCard
// Refactored to align strictly with the Slacc Design System
// ─────────────────────────────────────────────────────────────────────────────

export default function InstructorBioCard({
  instructor,
  onBookSession
}: InstructorBioCardProps) {
  return (
    <div className="flex flex-col bg-white border border-[#e8e8e8] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-full w-full max-w-sm">
      
      {/* ── Top Header Band (Aubergine Gradient & Avatar Placement) ── */}
      <div className="relative h-28 bg-gradient-to-br from-[#4a154b] to-[#3c113e] flex items-end justify-start px-6 pb-4">
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/5" />

        {/* Rating Pill (Repositioned to bottom-right of header band for stable flow) */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-black font-mono">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {instructor.rating.toFixed(2)}
        </div>

        {/* Avatar Container (Graceful fallback to text initials, CLS optimized) */}
        <div className="relative translate-y-8 z-10 w-16 h-16 rounded-2xl border-4 border-white bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm aspect-square">
          {instructor.avatarUrl ? (
            <img 
              src={instructor.avatarUrl} 
              alt={instructor.name} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-lg font-black text-[#4a154b] select-none font-mono">
              {instructor.initials}
            </span>
          )}
        </div>

      </div>

      {/* ── Card Body (Whitespace & Slacc Grid Alignment) ── */}
      <div className="flex-1 pt-12 p-6 flex flex-col justify-between">
        
        <div className="space-y-4 flex-1 flex flex-col">
          
          {/* Header Metadata */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black tracking-tight text-zinc-900 uppercase font-serif">
                {instructor.name}
              </h3>
              <p className="text-[10px] font-bold text-[#4a154b] tracking-wider uppercase font-mono mt-0.5">
                {instructor.specialty}
              </p>
            </div>
            
            {/* Instagram handle structured inline */}
            <a
              href={`https://instagram.com/${instructor.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#f9f0ff] hover:bg-[#4a154b] text-[#4a154b] hover:text-white font-bold text-[10px] transition-all shrink-0"
            >
              <Instagram size={11} />
              <span className="font-mono">{instructor.instagram}</span>
            </a>
          </div>

          {/* Biography Text block */}
          <p className="text-xs text-zinc-600 leading-relaxed font-semibold flex-1">
            {instructor.bio}
          </p>

          {/* Internal Analytics Statistics */}
          <div className="flex items-center justify-between border-t border-b border-zinc-100 py-3 my-2 text-xs font-semibold">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-bold">Coach Rating</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-zinc-800">{instructor.rating}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-widest text-zinc-550 block font-bold">Active Classes</span>
              <span className="font-bold text-zinc-800 mt-0.5 block">{instructor.totalStudents.toLocaleString()}</span>
            </div>
          </div>

          {/* Extensible Playlist child block */}
          <PlaylistVibeBanner 
            musicStyle={instructor.musicStyle} 
            playlist={instructor.playlist} 
          />

        </div>

        {/* ── Book Session CTA (Slacc .btn-primary-pill complying to touch-target sizes) ── */}
        <div className="pt-6">
          <button
            onClick={() => onBookSession?.(instructor.id)}
            className="w-full min-h-[48px] inline-flex items-center justify-center rounded-full bg-[#4a154b] hover:bg-[#3c113e] text-white text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <span>Book Session</span>
            <ChevronRight size={14} className="ml-1" />
          </button>
        </div>

      </div>

    </div>
  );
}
