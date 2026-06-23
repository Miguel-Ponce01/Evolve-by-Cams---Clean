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
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-bold text-xl">Our Coaches</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 ml-12">Meet the team behind the sweat.</p>

      <div className="space-y-4">
        {INSTRUCTORS.map((instructor, i) => (
          <div
            key={instructor.id}
            className="rounded-2xl bg-card border border-border overflow-hidden animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {/* Header Band */}
            <div className="relative h-24 overflow-hidden"
              style={{
                background: i === 0
                  ? 'linear-gradient(135deg, #7C3AED, #F59E0B)'
                  : i === 1
                  ? 'linear-gradient(135deg, #10B981, #3B82F6)'
                  : 'linear-gradient(135deg, #EF4444, #EC4899)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-60">
                {instructor.avatar}
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                {instructor.rating}
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="font-bold text-base">{instructor.name}</h2>
                  <p className="text-xs text-primary">{instructor.specialty}</p>
                </div>
                <a
                  href={`https://instagram.com/${instructor.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
                >
                  <Instagram size={14} />
                </a>
              </div>

              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{instructor.bio}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users size={12} />
                  <span>{instructor.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>📅</span>
                  <span>{getInstructorClasses(instructor.name)} classes this week</span>
                </div>
              </div>

              {/* Music Badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary border border-border mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Music size={12} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Playlist Vibe</p>
                  <p className="text-xs font-semibold">{instructor.musicStyle}</p>
                </div>
                <div className="ml-auto text-[10px] text-muted-foreground">{instructor.playlist}</div>
              </div>

              {/* View Classes CTA */}
              <button
                onClick={() => router.push(`/?instructor=${instructor.name.split(' ')[0]}`)}
                className="w-full py-2.5 rounded-pill bg-primary/10 border border-primary/30 text-primary text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
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
