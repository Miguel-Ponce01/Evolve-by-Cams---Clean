'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Quote, ThumbsUp, MessageSquare } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function TestimonialsPage() {
  const stories = [
    {
      name: "Kim Maureen C. Macas",
      title: "Over a Year of Safe & Structured Progress",
      discipline: "Pole Fitness & Aerial Arts",
      period: "1+ Year at Evolve Davao North",
      story: "Love this community! Huge space where artists can play and the conditioning room is large. Over a year of safe progress, the poles are kept extremely clean, and the hoops and rigging are top notch. The coaches are so supportive and help you build your strength properly step by step.",
      before: "Lacking a proper aerial environment and structured training",
      after: "1+ year of consistent, safe vertical fitness progress"
    },
    {
      name: "Gentelian Alopog",
      title: "Highly Organized & Safe Training Space",
      discipline: "Pole & Aerial Hoop",
      period: "Verified Facebook Recommendation",
      story: "A nice and clean studio for training. Very organized and a safe space. The coaches are always ready to help and prioritize correct alignment so you do not get injured. Highly recommend Evolve to anyone starting out!",
      before: "Looking for a safe, structured environment to train safely",
      after: "Confidence on the pole and supportive coaching feedback"
    }
  ];

  const shortQuotes = [
    {
      name: "Vanessa Golda Montero",
      quote: "Much more enjoyable fitness routines than standard gym workouts!",
      rating: 5
    },
    {
      name: "Devi Insight",
      quote: "Super encouraging environment where everyone supports your personal growth.",
      rating: 5
    },
    {
      name: "Nino Mulao",
      quote: "An incredible community that values safety, alignment, and artistic expression.",
      rating: 5
    },
    {
      name: "Sheleena Serrant Ann",
      quote: "The best coaches and a gorgeous, massive studio space for practicing aerial arts.",
      rating: 5
    },
    {
      name: "Aiko Banasor",
      quote: "A clean, safe, and highly structured studio. Perfect for building core strength.",
      rating: 5
    },
    {
      name: "SendyLeanny F. Garcia",
      quote: "Absolutely empowering! Every class pushes you to discover what your body is truly capable of.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      <div className="max-w-[1240px] mx-auto px-6 py-16 md:py-24 space-y-16">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4 text-left">
            <Link href="/" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors" aria-label="Go back to Home">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Empowered Community</span>
              <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">Student Stories</h1>
            </div>
          </div>

          {/* Facebook Rating Badge */}
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 text-left shadow-lg max-w-sm">
            <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] shrink-0 text-xl font-bold">
              f
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <ThumbsUp size={14} className="text-[#C9A961]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">100% Recommended</span>
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold block mt-0.5">
                Based on 350+ Facebook Reviews
              </span>
            </div>
          </div>
        </div>

        {/* Long Form Transformations */}
        <div className="space-y-12">
          <h2 className="text-2xl font-serif font-semibold uppercase tracking-wider text-[#C9A961] border-b border-zinc-900 pb-4 text-left">
            Transformation Cases
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
            {stories.map((s, idx) => (
              <div key={idx} className="bg-[#121212] border border-zinc-800 rounded-xl p-8 space-y-6 flex flex-col justify-between shadow-lg">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-serif text-white leading-snug">{s.title}</h3>
                      <p className="text-[11px] text-[#C9A961] uppercase tracking-wider font-mono font-bold mt-1">
                        {s.discipline} &middot; {s.period}
                      </p>
                    </div>
                    <Quote size={28} className="text-zinc-800 shrink-0" />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                    &ldquo;{s.story}&rdquo;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900/60 text-xs mt-6">
                  <div className="space-y-1 bg-black/40 p-3 rounded-lg border border-zinc-900">
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Before joining</span>
                    <p className="text-zinc-400 font-medium">{s.before}</p>
                  </div>
                  <div className="space-y-1 bg-[#C9A961]/5 p-3 rounded-lg border border-[#C9A961]/10">
                    <span className="text-[9px] uppercase tracking-wider text-[#C9A961] font-bold">Today</span>
                    <p className="text-white font-semibold">{s.after}</p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white font-serif">{s.name}</span>
                  <div className="flex gap-0.5 text-[#C9A961]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm">&#9733;</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Short Quote Wall */}
        <div className="space-y-8">
          <h2 className="text-2xl font-serif font-semibold uppercase tracking-wider text-[#C9A961] border-b border-zinc-900 pb-4 text-left">
            Voices of the Tribe
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {shortQuotes.map((q, idx) => (
              <div key={idx} className="bg-[#141414] border border-[#232323] p-8 rounded-xl flex flex-col justify-between shadow-md">
                <p className="text-xs sm:text-sm italic leading-relaxed text-zinc-400">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4 text-xs">
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide font-serif">{q.name}</h4>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Verified Recommendation</span>
                  </div>
                  <div className="flex gap-0.5 text-[#C9A961]">
                    {[...Array(q.rating)].map((_, i) => (
                      <span key={i} className="text-xs">&#9733;</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
