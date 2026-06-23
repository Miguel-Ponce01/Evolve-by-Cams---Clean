'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INSTRUCTORS } from '@/lib/seedData';
import { useBooking } from '@/context/BookingContext';
import { ArrowLeft, Star, Users, Music, ChevronRight, Instagram } from 'lucide-react';

export default function InstructorsPage() {
  const { classes } = useBooking();
  const router = useRouter();

  const getInstructorClasses = (instructorName: string) => {
    return classes.filter(c => c.instructor.name === instructorName).length;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Coaches & Team</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Our Coaches Roster</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INSTRUCTORS.map((instructor, i) => (
          <div
            key={instructor.id}
            className="flex flex-col bg-white border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all h-full animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {/* Header Band */}
            <div className="relative h-28 overflow-hidden flex items-center justify-center"
              style={{
                background: i === 0
                  ? 'linear-gradient(135deg, #7C3AED, #F59E0B)'
                  : i === 1
                  ? 'linear-gradient(135deg, #10B981, #3B82F6)'
                  : 'linear-gradient(135deg, #EF4444, #EC4899)',
              }}
            >
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
              <span className="text-6xl z-10 filter drop-shadow-md select-none">{instructor.avatar}</span>
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-sm text-white text-xs font-bold font-mono">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                {instructor.rating.toFixed(2)}
              </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 p-5 flex flex-col justify-between bg-card text-card-foreground">
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-heading font-black text-lg text-foreground uppercase tracking-wide">{instructor.name}</h2>
                    <span className="text-xs font-mono font-bold text-primary">{instructor.specialty}</span>
                  </div>
                  <a
                    href={`https://instagram.com/${instructor.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-primary font-bold text-[10px] hover:bg-primary hover:text-on-primary transition-all shadow-sm shrink-0"
                  >
                    <Instagram size={11} /> {instructor.instagram}
                  </a>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{instructor.bio}</p>

                {/* Rating stars & Students count row */}
                <div className="flex items-center justify-between border-t border-b border-border/45 py-3 my-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Coach Rating</span>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, index) => {
                          const ratingFloor = Math.floor(instructor.rating);
                          const isFilled = index < ratingFloor;
                          return (
                            <Star key={index} size={10} className={isFilled ? "fill-amber-400 text-amber-400" : "text-border"} />
                          );
                        })}
                      </div>
                      <span className="text-[10px] font-bold font-mono">{instructor.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground block">Active Students</span>
                    <span className="text-[11px] font-black text-foreground font-mono">{instructor.totalStudents.toLocaleString()}</span>
                  </div>
                </div>

                {/* Stats & Schedule */}
                <div className="grid grid-cols-2 gap-2 text-muted-foreground border-b border-border/45 pb-3 mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <Users size={12} className="text-primary" />
                    <span>{instructor.totalStudents.toLocaleString()} total</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span>📅</span>
                    <span>{getInstructorClasses(instructor.name)} this week</span>
                  </div>
                </div>

                {/* Custom Playlist Badge */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#edf7e7]/30 border border-[#edf7e7]/60 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Music size={14} className="text-emerald-500 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Playlist vibe · {instructor.musicStyle}</p>
                    <p className="text-xs font-bold text-ink truncate">{instructor.playlist}</p>
                  </div>
                </div>
              </div>

              {/* View Classes CTA */}
              <button
                onClick={() => router.push(`/?instructor=${instructor.name.split(' ')[0]}`)}
                className="w-full py-3.5 mt-2 rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                View {instructor.name.split(' ')[0]}&apos;s Classes <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
