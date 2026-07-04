'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

const classOfferings = [
  {
    title: 'Pole Fitness - Group Class',
    subtitle: 'Group Class. All Levels.',
    description:
      'Build strength, flexibility, and confidence through guided pole fitness training. Our group classes welcome all body types and skill levels — from first-timers to advanced students. Each session emphasizes proper technique, safe progression, and creative expression on the pole.',
    price: '₱1,000',
    duration: '1 HR',
    link: '/book/class-001',
    image: '/images/class_pole_group.png',
    branch: 'both'
  },
  {
    title: 'Aerial - Group Class',
    subtitle: 'Group Class. All Levels.',
    description:
      'Explore the art of aerial silks, sling, and hammock in a supportive group setting. Develop upper body strength, spatial awareness, and graceful movement while learning wraps, drops, and dynamic sequences under certified instructor guidance.',
    price: '₱1,000',
    duration: '1 HR',
    link: '/book/class-002',
    image: '/images/class_aerial_group.png',
    branch: 'both'
  },
  {
    title: 'Pole - Private Class',
    subtitle: 'Personalized Training. Faster Progress. Stronger You.',
    description:
      'One-on-one sessions tailored to your goals, pace, and skill level. Private pole classes offer focused attention, customized choreography, and accelerated progression — ideal for students who want dedicated coaching time with their instructor.',
    price: '₱1,800',
    duration: '1 HR',
    link: '/book/class-003',
    image: '/images/class_private.png',
    branch: 'both'
  },
  {
    title: 'Aerial - Private Class',
    subtitle: 'Grace in the Air. Strength in Your Body. Confidence in Motion.',
    description:
      'Personalized aerial training sessions designed to refine your technique, build trust in your apparatus, and push your creative boundaries at your own pace. Perfect for skill-specific goals or performance preparation.',
    price: '₱1,800',
    duration: '1 HR',
    link: '/book/class-004',
    image: '/images/class_private.png',
    branch: 'both'
  },
  {
    title: 'Exole (Exotic Pole)',
    subtitle: 'Move Boldly. Express Freely.',
    description:
      'A sensual, high-energy fusion of pole dance and floor work set to expressive music. Exole celebrates movement freedom, body confidence, and artistic storytelling through choreography that empowers you to own every transition.',
    price: '₱1,800',
    duration: '1 HR',
    link: '/book/class-003',
    image: '/images/class_exole.png',
    branch: 'davao'
  },
  {
    title: 'Acro Chair',
    subtitle: 'Strength, Control, and Powerful Movement.',
    description:
      'A dynamic class combining acrobatic chair work with strength conditioning. Learn gravity-defying balances, controlled inversions, and power moves that build functional strength and body control using nothing but a chair.',
    price: '₱1,800',
    duration: '1 HR',
    link: '/book/class-005',
    image: '/images/class_chair.png',
    branch: 'davao'
  },
  {
    title: 'Sexy Chair',
    subtitle: 'Confidence, Flow, and Fierce Movement.',
    description:
      'A choreography-driven class blending sultry floorwork with chair dance technique. Channel your inner performer through fluid transitions, sharp isolations, and bold expression — all in a safe, judgment-free space.',
    price: '₱1,800',
    duration: '1 HR',
    link: '/book/class-005',
    image: '/images/class_chair.png',
    branch: 'davao'
  },
];

export default function ClassesPage() {
  const [activeBranch] = useState<'davao'>('davao');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filteredOfferings = classOfferings.filter(
    (cls) => cls.branch === 'both' || cls.branch === activeBranch
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans">
      <div className="max-w-[960px] mx-auto px-6 py-16 md:py-24 space-y-16">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-colors" aria-label="Go back to Home">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Our Offerings</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">Classes</h1>
          </div>
        </div>

        {/* Class Cards */}
        <div className="space-y-16">
          {filteredOfferings.map((cls, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start group"
            >
              {/* Left: Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-zinc-900">
                <Image
                  src={cls.image}
                  alt={cls.title}
                  fill
                  className="object-cover filter grayscale contrast-[1.1] group-hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Right: Details */}
              <div className="space-y-4 pt-2 text-left">
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold uppercase tracking-wide text-white leading-tight">
                  {cls.title}
                </h2>

                <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#C9A961]">
                  {cls.subtitle}
                </p>

                <button
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="text-xs text-zinc-300 underline underline-offset-4 decoration-zinc-600 hover:text-white hover:decoration-[#C9A961] transition-colors cursor-pointer font-semibold uppercase tracking-wider"
                >
                  {expandedIdx === idx ? 'Show Less' : 'Read More'}
                </button>

                {expandedIdx === idx && (
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                    {cls.description}
                  </p>
                )}

                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-bold text-white font-mono">{cls.price}</span>
                  {cls.duration && (
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">/ {cls.duration}</span>
                  )}
                </div>

                <Link
                  href={cls.link}
                  className="inline-block px-8 py-2.5 border border-zinc-600 text-xs font-black uppercase tracking-[0.15em] text-zinc-300 hover:border-[#C9A961] hover:text-[#C9A961] transition-all duration-300 rounded-sm mt-2"
                >
                  Book Now
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
