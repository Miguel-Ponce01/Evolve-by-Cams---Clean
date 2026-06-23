'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Calendar, ChevronRight } from 'lucide-react';

// Confetti particle
function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#3B82F6'][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 8,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

// Fake QR Code SVG
function QRCode() {
  const cells = Array.from({ length: 100 }, (_, i) => Math.random() > 0.5);
  return (
    <div className="inline-flex flex-col gap-0.5 p-2 bg-white rounded-xl">
      {Array.from({ length: 10 }, (_, row) => (
        <div key={row} className="flex gap-0.5">
          {Array.from({ length: 10 }, (_, col) => (
            <div
              key={col}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: cells[row * 10 + col] ? '#09090B' : '#FFFFFF' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Success Content
function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { bookings, getClassById } = useBooking();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const booking = bookings.find(b => b.id === bookingId);
  const cls = booking ? getClassById(booking.classId) : null;

  if (!booking || !cls) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🤔</p>
        <h2 className="text-xl font-bold mb-2">Booking not found</h2>
        <Link href="/" className="text-primary hover:underline text-sm">← Back to Schedule</Link>
      </div>
    );
  }

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cls.title + ' — Evolve by Cams')}&dates=${cls.date.replace(/-/g, '')}T${cls.time.replace(':', '').replace(' AM', '00').replace(' PM', '00')}00/${cls.date.replace(/-/g, '')}T${cls.time.replace(':', '').replace(' AM', '00').replace(' PM', '00')}00&details=Spot+${booking.spotNumber}+with+${cls.instructor.name}`;

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="max-w-sm mx-auto px-4 py-10 flex flex-col items-center">
        {/* Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 animate-slide-up">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>

        <h1 className="text-2xl font-display font-black tracking-tight text-ink mb-1 uppercase animate-slide-up" style={{ animationDelay: '0.1s' }}>You&apos;re booked!</h1>
        <p className="text-ink-mute text-sm mb-8 animate-slide-up font-medium" style={{ animationDelay: '0.15s' }}>
          Your spot is locked. See you in class. 🔥
        </p>

        {/* Ticket */}
        <div className="w-full animate-slide-up animate-delay-150" style={{ animationDelay: '0.2s' }}>
          <div className="relative rounded-xl border border-hairline bg-white overflow-hidden shadow-xl">
            {/* Ticket Header */}
            <div className="bg-primary px-6 pt-6 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-on-aubergine-mute text-xs font-bold uppercase tracking-widest mb-1">Evolve by Cams</p>
                  <h2 className="text-on-primary font-display font-black text-xl leading-tight uppercase tracking-tight">{cls.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-on-aubergine-mute text-xs font-bold uppercase tracking-wider">Spot</p>
                  <p className="text-on-primary font-display font-black text-3xl">#{booking.spotNumber}</p>
                </div>
              </div>
            </div>

            {/* Ticket Tear */}
            <div className="relative flex items-center -mt-4">
              <div className="w-6 h-8 rounded-r-full bg-[#fcf9f5] border-r border-t border-b border-hairline -ml-0" />
              <div className="flex-1 border-t-2 border-dashed border-hairline mx-1" />
              <div className="w-6 h-8 rounded-l-full bg-[#fcf9f5] border-l border-t border-b border-hairline -mr-0" />
            </div>

            {/* Ticket Body */}
            <div className="px-6 pb-6 pt-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider mb-0.5">Instructor</p>
                  <p className="font-semibold text-sm text-ink">{cls.instructor.avatar} {cls.instructor.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider mb-0.5">Date</p>
                  <p className="font-semibold text-sm text-ink">{formatDate(cls.date)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider mb-0.5">Time</p>
                  <p className="font-semibold text-sm text-ink">{cls.time}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider mb-0.5">Duration</p>
                  <p className="font-semibold text-sm text-ink">{cls.duration} min</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center pt-2">
                <QRCode />
                <p className="text-[10px] text-ink-mute font-bold uppercase tracking-wider mt-2">Scan at entrance</p>
                <p className="text-[9px] text-ink-mute/50 font-mono mt-0.5">{booking.id.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3 mt-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-pill w-full flex items-center justify-center gap-2 border border-hairline bg-white"
          >
            <Calendar size={16} />
            Add to Calendar
          </a>

          <Link
            href="/"
            className="btn-primary-pill w-full flex items-center justify-center gap-2"
          >
            Back to Schedule <ChevronRight size={16} />
          </Link>

          <Link href="/profile" className="block text-center text-xs text-ink-mute font-bold uppercase tracking-wider hover:text-ink transition-colors mt-2">
            View all my bookings →
          </Link>
        </div>
      </div>
    </>
  );
}

export default function SuccessPageContent() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
