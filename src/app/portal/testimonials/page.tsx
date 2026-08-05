'use client';

import { useState, useMemo } from 'react';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Check, X, ShieldAlert, Star, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestimonialsModerationPage() {
  const { testimonials, updateTestimonial } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = q === '' || 
                          t.name.toLowerCase().includes(q) || 
                          t.quote.toLowerCase().includes(q) || 
                          t.discipline.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [testimonials, searchQuery, statusFilter]);

  const handleStatusChange = (id: string, status: 'approved' | 'pending') => {
    updateTestimonial(id, status);
    triggerToast(`Testimonial status updated to: ${status.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] py-12 px-6 sm:px-8 font-sans relative z-10 selection:bg-[#C9A961] selection:text-black text-left animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-zinc-900 pb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Client Reviews &amp; Feedback</span>
            <h1 className="text-3xl font-serif font-light tracking-[0.1em] text-white">
              TESTIMONIALS MANAGER
            </h1>
            <p className="text-xs text-zinc-550">Review and approve public client testimonial cards displayed on the main home strip.</p>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <Check size={14} /> {toastMsg}
          </div>
        )}

        {/* Toolbar filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#121212] border border-zinc-900 p-4 rounded-2xl">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search reviewer or review text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white pl-8 pr-4 py-2.5 focus:outline-none focus:border-[#C9A961] rounded-xl"
            />
            <Search size={12} className="absolute left-3 top-3.5 text-zinc-500" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Status Mode</span>
            <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-850 gap-1">
              {(['all', 'approved', 'pending'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "px-3 py-1 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                    statusFilter === f ? "bg-[#C9A961] text-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review list cards */}
        <div className="space-y-4">
          {filteredTestimonials.map(t => (
            <div
              key={t.id}
              className={cn(
                "p-5 rounded-3xl border text-left flex justify-between items-start gap-4 transition-all bg-[#121212]",
                t.status === 'approved' ? "border-zinc-900" : "border-zinc-800 bg-[#121212]/50"
              )}
            >
              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-bold text-white block">{t.name}</span>
                  <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[8px] font-black uppercase tracking-wider font-mono">
                    {t.discipline}
                  </Badge>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={10} fill="#C9A961" stroke="none" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-zinc-350 italic leading-relaxed">
                  "{t.quote}"
                </p>

                <span className="text-[9px] font-mono text-zinc-550 uppercase font-black block">Status: {t.status}</span>
              </div>

              {/* Status change actions */}
              <div className="flex gap-2 shrink-0">
                {t.status === 'pending' ? (
                  <button
                    onClick={() => handleStatusChange(t.id, 'approved')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(t.id, 'pending')}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 font-bold uppercase text-[9px] tracking-wider transition-colors cursor-pointer"
                  >
                    Reject / Pend
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredTestimonials.length === 0 && (
            <p className="text-center py-12 border border-zinc-900 rounded-3xl text-zinc-550 italic bg-black/10">No testimonials match your current search filters.</p>
          )}
        </div>

      </div>
    </div>
  );
}
