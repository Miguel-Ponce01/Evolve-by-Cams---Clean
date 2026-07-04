'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function FAQPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Can I join even if I'm not strong or \"fit\" yet?",
      a: "Absolutely. You don't need a certain body type or fitness level to start. Every journey begins somewhere, and our classes are designed to help you build strength gradually - not just physically, but mentally too. With consistent practice and guidance, you'll grow in confidence, resilience, and self-belief."
    },
    {
      q: "Is pole and aerial training safe?",
      a: "Yes. Safety is a top priority at Evolve. All classes are guided by certified instructors who emphasize proper technique, controlled progress, and safe conditioning to help prevent injuries while supporting steady growth."
    },
    {
      q: "What should I wear to class?",
      a: "For pole classes, fitted shorts and a tank top or sports bra are recommended for better grip and movement. For aerial classes, leggings and a snug top work best. Comfort and mobility are key."
    },
    {
      q: "What is the late entry policy?",
      a: "We strictly enforce a 5-minute late arrival cutoff limit. If you are more than 5 minutes late for your scheduled class, entry is blocked for your own safety (missing structural warmup stretches increases injury risks) and to avoid disrupting class flow."
    },
    {
      q: "What is the cancellation window for booking credits?",
      a: "To receive a full credit refund, you must cancel your booking at least 12 hours before class starts. Cancellations made inside the 12-hour window or no-shows forfeit the booking credit."
    },
    {
      q: "Do you offer private 1-on-1 coaching sessions?",
      a: "Yes, we offer private classes for both Pole Fitness and Aerial Arts. These sessions provide personalized training, faster progress, and customized pacing to help you achieve your specific fitness goals."
    },
    {
      q: "How do class packs and memberships work?",
      a: "You can purchase class packs or membership tiers which credit your account. You then use these credits to book sessions. Packs have expiration timelines (e.g. 30, 60, or 90 days) visible during purchase."
    },
    {
      q: "Where are your branches located?",
      a: "Our studio is located at 3F Sunscor Bldg., corner Arroyo St., along R Castillo highway, Davao City, Philippines, 8000."
    },
    {
      q: "Why is the studio closed on Tuesdays?",
      a: "We implement a Tuesday operating lockout. The studio is closed all day on Tuesdays for deep sanitization, equipment rigging safety safety alignment, and instructor training."
    },
    {
      q: "Are the class bookings open to all genders?",
      a: "Yes! Evolve is an inclusive space welcoming students of all genders, backgrounds, sizes, and fitness levels to express themselves through vertical and aerial movement."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24 space-y-12">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors" aria-label="Go back to Home">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Frequently Asked Questions</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">FAQ Center</h1>
          </div>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4 pt-6 text-left">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="border-b border-zinc-900 pb-4">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full flex justify-between items-center text-left py-4 font-serif font-semibold text-sm sm:text-base text-white focus:outline-none hover:text-[#C9A961] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="flex gap-2">
                    <span className="text-[#C9A961] font-mono text-xs mt-1">{i + 1} |</span>
                    <span>{faq.q}</span>
                  </span>
                  <span className="text-[#C9A961] ml-4 font-mono font-bold text-lg select-none">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[300px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-medium pb-2">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <Footer />
    </div>
  );
}
