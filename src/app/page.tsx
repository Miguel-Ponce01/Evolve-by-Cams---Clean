'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { useBooking } from '@/context/BookingContext';

function useIntersectionObserver() {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
      }
    }, { threshold: 0.05 });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting] as const;
}

function TiltCard({ src, alt }: { src: string; alt: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 10; // degrees of rotation
    const angleY = (x - xc) / 10; // degrees of rotation
    
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

export default function HomePage() {
  const { testimonials } = useBooking();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [historyRef, historyVisible] = useIntersectionObserver();
  const [usRef, usVisible] = useIntersectionObserver();
  const [testimonialsRef, testimonialsVisible] = useIntersectionObserver();

  // Auto-advance hero carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const classesList = [
    {
      title: 'Pole Fitness - Group Class',
      desc: 'GROUP CLASS. ALL LEVELS.',
      price: '₱1,000',
      link: '/book/class-001',
      image: '/images/class_pole_group.png'
    },
    {
      title: 'Aerial - Group Class',
      desc: 'GROUP CLASS. ALL LEVELS.',
      price: '₱1,000',
      link: '/book/class-002',
      image: '/images/class_aerial_group.png'
    },
    {
      title: 'Pole - Private Class',
      desc: 'PERSONALIZED TRAINING. FASTER PROGRESS. STRONGER YOU.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-003',
      image: '/images/class_private.png'
    },
    {
      title: 'Aerial - Private Class',
      desc: 'GRACE IN THE AIR, STRENGTH IN YOUR BODY, CONFIDENCE IN MOTION.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-004',
      image: '/images/class_private.png'
    },
    {
      title: 'Exole (Exotic Pole)',
      desc: 'MOVE BOLDLY. EXPRESS FREELY.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-003',
      image: '/images/class_exole.png'
    },
    {
      title: 'Acro Chair',
      desc: 'STRENGTH, CONTROL, AND POWERFUL MOVEMENT.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-005',
      image: '/images/class_chair.png'
    },
    {
      title: 'Sexy Chair',
      desc: 'CONFIDENCE, FLOW, AND FIERCE MOVEMENT.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-005',
      image: '/images/class_chair.png'
    }
  ];

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
      q: "What other important things should I know before attending?",
      a: "We strictly allow a maximum of 5 minutes late entry to ensure everyone's safety and class flow. Warming up and stretching are a must, and dedicated time is allotted for proper preparation before every session. Please avoid using lotions or oils before class as they affect grip and safety. Always inform your instructor of any injuries or health concerns so we can adjust your training accordingly."
    }
  ];

  const themeBg = isDarkMode ? "bg-[#0A0A0A] text-[#F5F5F3]" : "bg-[#FFFFFF] text-[#111111]";
  const themeCardBg = isDarkMode ? "bg-[#141414] border-[#232323]" : "bg-[#F9F9F9] border-[#E5E5E5]";
  const themeTextMuted = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const themeHeaderColor = isDarkMode ? "text-white" : "text-black";
  const themeBorderColor = isDarkMode ? "border-zinc-800" : "border-zinc-200";

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden relative pb-16 lg:pb-0 ${themeBg}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600&display=swap');
        .display { font-family: 'Big Shoulders Display', sans-serif; text-transform: uppercase; letter-spacing: 0.01em; }
        .body-font { font-family: 'Space Grotesk', sans-serif; }
        .hero-carousel { position: relative; overflow: hidden; }
        .hero-carousel .slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease-in-out; pointer-events: none; }
        .hero-carousel .slide.active { opacity: 1; pointer-events: auto; }
        .hero-carousel .slide img { width: 100%; height: 100%; object-fit: cover; }
        .hero-dot { width: 8px; height: 8px; border-radius: 50%; transition: all 0.3s; cursor: pointer; }
        .hero-dot.active { width: 28px; border-radius: 9999px; }
      `}</style>


      
      {/* ── WELCOME HERO (Mockup-style with Parallax Scroll React Reactivity) ── */}
      <section className="relative w-full py-20 px-6 text-center bg-[#0C0C0C] border-b border-zinc-900 overflow-hidden select-none">
        
        {/* Subtle diagonal silver/gray glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/30 via-[#0C0C0C] to-black opacity-80 pointer-events-none" />
        
        <div className="max-w-[1240px] mx-auto space-y-12 relative z-10">
          {/* Header Typography */}
          <div 
            className="space-y-4 max-w-4xl mx-auto transition-all duration-75 ease-out"
            style={{ 
              opacity: Math.max(0, 1 - scrollY / 380), 
              transform: `translateY(${scrollY * 0.15}px)` 
            }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-[0.12em] uppercase text-white leading-tight text-balance">
              Evolve Pole Fitness<br />
              <span className="text-[#C9A961]">&amp; Aerial Arts</span>
            </h1>
            <div className="w-full max-w-[500px] h-[1px] bg-zinc-800 mx-auto my-4" />
            <p className="text-xs sm:text-sm tracking-[0.2em] text-zinc-400 font-bold uppercase text-balance">
              Move with Purpose. Evolve with Confidence.
            </p>
          </div>

          {/* 3 landscape grayscale images side-by-side (Goes away/fades on scroll) */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto transition-all duration-75 ease-out"
            style={{ 
              opacity: Math.max(0, 1 - scrollY / 450), 
              transform: `translateY(${scrollY * 0.3}px) scale(${Math.max(0.88, 1 - scrollY * 0.00035)})` 
            }}
          >
            {[
              { src: '/images/class_pole_group.png', alt: 'Pole group class training' },
              { src: '/images/class_aerial_group.png', alt: 'Aerial silks session' },
              { src: '/images/class_private.png', alt: 'One-on-one personal class' }
            ].map((img, idx) => (
              <TiltCard key={idx} src={img.src} alt={img.alt} />
            ))}
          </div>
        </div>
      </section>

      {/* ── "WE ARE EVOLVE" HISTORY SECTION (Split-screen with fade up) ── */}
      <section ref={historyRef} className="py-20 md:py-28 border-b border-zinc-900 bg-black text-left overflow-hidden">
        <div className={cn(
          "max-w-[1240px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-1000 transform ease-out",
          historyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        )}>
          
          {/* Left Column: Big Grayscale Coaches Group Image with 3D Tilt */}
          <div className="lg:col-span-6">
            <TiltCard src="/images/coaches_group.png" alt="Evolve coaches team photo" />
          </div>

          {/* Right Column: Copy text block */}
          <div className="lg:col-span-6 space-y-8 flex flex-col justify-center">
            
            {/* Squiggly inline logo */}
            <div className="flex justify-start">
              <img 
                src="/images/evolve_logo.png" 
                alt="Evolve logo mark" 
                className="h-16 md:h-20 w-auto object-contain opacity-90"
              />
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-light uppercase tracking-wider text-white leading-tight text-balance">
              We Are Evolve
            </h2>

            <div className="space-y-4 text-xs sm:text-sm font-medium leading-relaxed text-zinc-400 max-w-xl text-pretty">
              <p>
                Proudly home-grown in Davao City, Evolve has spent a decade nurturing a vibrant community where fitness, artistry, and women's empowerment come together.
              </p>
              <p>
                Our programs are thoughtfully designed to support beginners, challenge more advanced students, and encourage every participant to grow at their own pace, all while fostering a sense of community and empowerment.
              </p>
            </div>

            <div className="pt-4">
              <Link 
                href="/about" 
                className="inline-block py-2.5 px-8 rounded-sm bg-zinc-900 hover:bg-[#C9A961] hover:text-black text-xs font-black uppercase tracking-widest text-zinc-300 transition-transform active:scale-[0.96]"
              >
                Read More
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── "EVOLVE WITH US" SECTION (3D Tilt Landscape Cards with fade up) ── */}
      <section ref={usRef} className="py-20 md:py-28 border-b border-zinc-900 bg-[#0C0C0C] overflow-hidden">
        <div className={cn(
          "max-w-[1240px] mx-auto px-6 space-y-12 transition-all duration-1000 transform ease-out",
          usVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        )}>
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-light uppercase tracking-wider text-white text-balance">
              Evolve With Us
            </h2>
            <p className="text-[#C9A961] tracking-widest text-xs uppercase font-bold text-balance">Explore Our Premium Fitness Spaces</p>
          </div>

          {/* Big Photos of Fitness Areas with 3D Animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-6">
            {[
              { src: '/images/class_pole_group.png', label: 'Pole Fitness Studio' },
              { src: '/images/class_aerial_group.png', label: 'Aerial Arts Sanctuary' },
              { src: '/images/class_private.png', label: 'Private Training Space' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-4 group">
                <TiltCard src={item.src} alt={item.label} />
                <div className="text-center">
                  <h4 className="text-sm font-serif font-light uppercase tracking-wider text-white group-hover:text-[#C9A961] transition-colors text-balance">
                    {item.label}
                  </h4>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-mono mt-1">Evolve Experience</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED TESTIMONIALS STRIP (Testimonials with fade up) ── */}
      <section ref={testimonialsRef} className={`py-16 md:py-24 border-b ${themeBorderColor} ${isDarkMode ? "bg-[#0A0A0A]" : "bg-white"} overflow-hidden`}>
        <div className={cn(
          "max-w-[1240px] mx-auto px-6 space-y-12 transition-all duration-1000 transform ease-out",
          testimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
        )}>
          <div className="text-center space-y-3">
            <h2 className={`text-3xl md:text-5xl font-semibold font-serif uppercase tracking-wide ${themeHeaderColor}`}>
              Testimonials
            </h2>
            <p className="text-[#C9A961] tracking-widest text-xs uppercase font-bold">
              Hear From Our Empowered Community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((t, idx) => (
              <div key={idx} className={`p-8 rounded-xl border flex flex-col justify-between ${themeCardBg}`}>
                <p className={`text-sm italic leading-relaxed ${themeTextMuted}`}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-800/10 pt-4">
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wide font-serif ${themeHeaderColor}`}>{t.name}</h4>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">{t.role}</span>
                  </div>
                  <div className="flex gap-0.5 text-[#C9A961]">
                    {[...Array(t.rating)].map((_, i) => (
                      <span key={i} className="text-sm">&#9733;</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pt-4">
            <Link 
              href="/testimonials" 
              className="inline-block text-xs font-black uppercase tracking-widest text-[#C9A961] hover:text-[#b09352] hover:underline"
            >
              Read More Student Transformations &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── FLOATING CHAT WIDGET ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => alert("Welcome to Evolve Studio! Our assistant is ready to help.")}
          className="w-14 h-14 rounded-full bg-[#C9A961] text-black shadow-lg shadow-[#C9A961]/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border border-[#C9A961]"
          aria-label="Open support chat"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        </button>
      </div>

      {/* ── FOOTER ── */}
      <Footer />

    </div>
  );
}
