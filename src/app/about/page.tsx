'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, Sparkles, Shield, Heart } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

function TiltCard({ src, alt }: { src: string; alt: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 10;
    const angleY = (x - xc) / 10;
    
    setStyle({
      transform: `perspective(600px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className="aspect-[4/3] w-full overflow-hidden rounded-sm border border-zinc-900 bg-zinc-950 shadow-lg cursor-pointer transition-shadow hover:shadow-[#C9A961]/10"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover filter grayscale contrast-110 hover:grayscale-0 transition-all duration-700 pointer-events-none outline outline-1 outline-white/10"
      />
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans relative z-10">
      
      {/* ── Page Header ── */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px] border-b border-zinc-900/60">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-transform active:scale-[0.96] cursor-pointer" 
            aria-label="Go back to Home"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Our Story</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">About Evolve</h1>
          </div>
        </div>
      </section>

      {/* ── Split Screen Content ── */}
      <section className="container mx-auto px-6 py-20 max-w-[1240px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Stacked 3D Tilt Showcases */}
          <div className="lg:col-span-5 space-y-8">
            <TiltCard 
              src="/images/class_pole_group.png" 
              alt="Evolve fitness training sanctuary" 
            />
            
            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#121212] border border-zinc-900 p-6 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">ESTABLISHED</span>
                <p className="text-2xl font-serif font-semibold text-[#C9A961] tabular-nums">2016</p>
                <p className="text-[10px] text-zinc-400">10 Years in Davao City</p>
              </div>
              <div className="bg-[#121212] border border-zinc-900 p-6 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">STANDARDIZED</span>
                <p className="text-2xl font-serif font-semibold text-white">100%</p>
                <p className="text-[10px] text-zinc-400">Certified Coaching Curriculums</p>
              </div>
            </div>

            <TiltCard 
              src="/images/class_private.png" 
              alt="Private studio training space" 
            />
          </div>

          {/* Right Column: Editorial Styled Content */}
          <div className="lg:col-span-7 space-y-10 text-left">
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white leading-tight uppercase text-balance">
              Discover The Art <br />
              Of <span className="text-[#C9A961]">Pole &amp; Aerial Fitness</span>
            </h2>
            
            <div className="w-20 h-0.5 bg-[#C9A961]" />

            <div className="space-y-8 text-sm leading-relaxed text-zinc-400 text-pretty">
              {/* Paragraph 1 with editorial drop-cap styling */}
              <p className="first-letter:text-6xl first-letter:font-serif first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:text-[#C9A961] first-letter:leading-none">
                Evolve Pole Fitness and Aerial Arts Studio was founded in May 2016 in Davao City by Ervy “Tweetie” Bullecer. 
                What began as a small and humble pole fitness studio was built on a powerful belief that pole fitness can be 
                empowering, joyful, and artistic, and that women of all ages, shapes, and sizes deserve a safe space to grow 
                stronger and more confident through movement.
              </p>
              
              <p>
                From the beginning, Evolve was intentionally created as more than a fitness studio. It became a supportive 
                and empowering community rooted in empathy, respect, acceptance, and encouragement. Over time, this 
                environment naturally grew into what many students lovingly call their Happy Place.
              </p>

              <p>
                In its early years, Evolve focused on developing structured pole fitness programs that prioritized proper 
                technique, safety, and sustainable progression. As the studio continued to grow, it expanded into aerial 
                arts including silks, sling, and lyra hoop, while refining its teaching methods through hands-on experience 
                and close student engagement.
              </p>

              <p>
                To maintain consistency and safety across all classes, Evolve developed its own standardized instructor 
                training, certification, and ranking systems, tested and strengthened through years of real-world studio operations.
              </p>

              <p>
                Evolve’s journey included both growth and challenge, reinforcing its commitment to safety, structure, 
                empathy, and empowerment. Today, Evolve stands on a decade of lived experience and proven systems. 
                Through franchising, its mission continues by bringing safe and high-quality pole fitness and aerial arts 
                programs to new communities while preserving the heart and integrity of the Evolve experience.
              </p>
            </div>

            {/* Core Values Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-900/60">
              <div className="space-y-2">
                <div className="text-[#C9A961]"><Award size={20} /></div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Empowerment</h4>
                <p className="text-[10px] text-zinc-500 leading-normal">Fostering mental resilience and body confidence in vertical movement.</p>
              </div>
              <div className="space-y-2">
                <div className="text-[#C9A961]"><Shield size={20} /></div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Safety First</h4>
                <p className="text-[10px] text-zinc-500 leading-normal">Rigid safety alignment, certifications, and standardized conditioning.</p>
              </div>
              <div className="space-y-2">
                <div className="text-[#C9A961]"><Sparkles size={20} /></div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest">Artistry</h4>
                <p className="text-[10px] text-zinc-500 leading-normal">Blending physical fitness with creative choreography and expression.</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Bottom visual showcase (Dignity, Expertise, Passion) ── */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px] text-center border-t border-zinc-900/60">
        <div className="space-y-8">
          <h3 className="text-xl sm:text-2xl font-serif font-light tracking-[0.2em] uppercase text-[#C9A961]">
            Dedication &middot; Expertise &middot; Passion
          </h3>
          <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-sm border border-zinc-900/60 shadow-2xl">
            <img 
              src="/images/coaches_group.png" 
              alt="Evolve coaches team photo grid showcase" 
              className="w-full h-auto object-cover filter grayscale contrast-110 hover:grayscale-0 transition-all duration-700 pointer-events-none"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
