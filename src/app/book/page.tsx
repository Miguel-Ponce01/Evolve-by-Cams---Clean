'use client';

import { useEffect } from 'react';

export default function BookingCalendarRedirect() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/events#book-class');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <span className="text-sm font-mono tracking-widest text-[#C9A961] uppercase font-bold animate-pulse">Redirecting...</span>
        <p className="text-xs text-zinc-550">We are taking you to our consolidated Book Calendar page.</p>
      </div>
    </div>
  );
}
