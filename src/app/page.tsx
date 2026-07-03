'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const classesList = [
    {
      title: 'Pole Fitness',
      desc: 'Group Class. All Levels.',
      price: '₱600',
      link: '/booking-calendar/pole-fitness',
      image: '/images/pole_stretch.png'
    },
    {
      title: 'Aerial Sling',
      desc: 'Group Class. All Levels.',
      price: '₱600',
      link: '/booking-calendar/aerial-sling',
      image: '/images/aerial_single.jpg'
    },
    {
      title: 'Exole (Exotic Pole)',
      desc: 'Move Boldly. Express Freely.',
      price: '₱600',
      link: '/booking-calendar/exole-exotic-pole-1',
      image: '/images/dance_back.png'
    },
    {
      title: 'Sexy Chair',
      desc: 'Confidence, Flow, and Fierce Movement.',
      price: '₱600',
      link: '/booking-calendar/sexy-chair',
      image: '/images/dance_class.png'
    },
    {
      title: 'Yoga',
      desc: 'Strength, balance, and mindfulness in every flow.',
      price: '₱550',
      link: '/booking-calendar/yoga',
      image: '/images/reformer_plank.png'
    },
    {
      title: 'Aerial Sling Kids',
      desc: 'Little Bodies, Fearless Spirits.',
      price: '₱600',
      link: '/booking-calendar/aerial-sling-kids',
      image: '/images/aerial_group.png'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative pb-16 lg:pb-0">
      
      {/* ── HERO BANNER SECTION ── */}
      <section className="relative w-full py-24 md:py-36 flex flex-col items-center justify-center text-center px-6">
        
        {/* Soft periwinkle shimmery lighting background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#EEF2FF] via-white to-white pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-semibold tracking-[0.05em] font-serif uppercase text-black leading-tight">
            EVOLVE POLE FITNESS <br/>
            <span className="text-[#7c8cf2]">&amp; AERIAL ARTS</span>
          </h1>
          
          <div className="w-24 h-[1px] bg-zinc-300 mx-auto my-4" />

          <p className="text-lg sm:text-xl font-medium tracking-widest text-zinc-550 uppercase">
            Move with Purpose. Evolve with Confidence.
          </p>
        </div>

        {/* ── THREE COLUMN HORIZONTAL GALLERY ── */}
        <div className="w-full max-w-[1240px] mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          
          <div className="group relative h-[380px] overflow-hidden border border-zinc-200 rounded-lg bg-zinc-50">
            <img 
              src="/images/aerial_single.jpg" 
              alt="Aerial yoga single pose"
              className="w-full h-full object-cover filter grayscale contrast-110 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="group relative h-[380px] overflow-hidden border border-zinc-200 rounded-lg bg-zinc-50">
            <img 
              src="/images/pole_stretch.png" 
              alt="Pole stretching session"
              className="w-full h-full object-cover filter grayscale contrast-110 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="group relative h-[380px] overflow-hidden border border-zinc-200 rounded-lg bg-zinc-50">
            <img 
              src="/images/dance_class.png" 
              alt="Dance class group"
              className="w-full h-full object-cover filter grayscale contrast-110 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
          </div>

        </div>

      </section>

      {/* ── "WE ARE EVOLVE" SPLIT SECTION ── */}
      <section className="border-y border-zinc-100 bg-[#EEF2FF]/60 py-20 px-6 animate-fade-in">
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium Photo */}
          <div className="md:col-span-6 relative h-[450px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-lg">
            <img 
              src="/images/dance_class.png" 
              alt="Evolve studio performance"
              className="w-full h-full object-cover filter grayscale contrast-105 transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>

          {/* Right Column: Evolve Description & Script Logo */}
          <div className="md:col-span-6 space-y-8 flex flex-col justify-center">
            
            {/* Signature Logo SVG */}
            <div className="flex items-center gap-1 font-serif select-none">
              <span className="text-4xl font-light tracking-[0.25em] text-black">EVO</span>
              <svg className="w-12 h-12 text-[#7c8cf2] animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M30,85 C45,65 55,35 60,15 C65,30 50,75 75,60 C80,55 70,80 50,85" strokeLinecap="round" />
                <circle cx="60" cy="15" r="3" fill="currentColor" />
              </svg>
              <span className="text-4xl font-light tracking-[0.25em] text-black -ml-2">LVE</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-semibold font-serif text-black tracking-wide uppercase">
              Discover the Art of Pole &amp; Aerial Fitness
            </h2>

            <div className="space-y-4 text-zinc-650 font-medium text-sm sm:text-base leading-relaxed text-left">
              <p>
                Evolve Pole Fitness and Aerial Arts Studio was founded in May 2016 in Davao City by Ervy &ldquo;Tweetie&rdquo; Bullecer. What began as a small and humble pole fitness studio was built on a powerful belief that pole fitness can be empowering, joyful, and artistic, and that women of all ages, shapes, and sizes deserve a safe space to grow stronger and more confident through movement.
              </p>
              <p>
                From the beginning, Evolve was intentionally created as more than a fitness studio. It became a supportive and empowering community rooted in empathy, respect, acceptance, and encouragement. Over time, this environment naturally grew into what many students lovingly call their Happy Place.
              </p>
              <p>
                In its early years, Evolve focused on developing structured pole fitness programs that prioritized proper technique, safety, and sustainable progression. As the studio continued to grow, it expanded into aerial arts including silks, sling, and lyra hoop, while refining its teaching methods through hands-on experience and close student engagement.
              </p>
              <p>
                To maintain consistency and safety across all classes, Evolve developed its own standardized instructor training, certification, and ranking systems. These systems were tested and strengthened through years of real-world studio operations.
              </p>
              <p>
                Evolve&rsquo;s journey included both growth and challenge, reinforcing its commitment to safety, structure, empathy, and empowerment. Today, Evolve stands on a decade of lived experience and proven systems. Through franchising, its mission continues by bringing safe and high-quality pole fitness and aerial arts programs to new communities while preserving the heart and integrity of the Evolve experience.
              </p>
            </div>

            <div className="pt-4">
              <Link 
                href="/about" 
                className="inline-block py-3 px-8 rounded-full bg-[#7c8cf2] hover:bg-[#6c7ef0] text-white font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95"
              >
                Read Our Story
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ── "EVOLVE WITH US" CLASSES PREVIEW GRID ── */}
      <section className="py-20 px-6">
        <div className="max-w-[1240px] mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-semibold font-serif text-black uppercase tracking-wide">
              Evolve With Us
            </h2>
            <p className="text-[#7c8cf2] tracking-widest text-xs uppercase font-bold">
              Explore Our Core Offerings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classesList.map((cls, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col justify-between h-[420px] rounded-xl overflow-hidden border border-zinc-200 bg-white transition-all duration-300 hover:border-[#7c8cf2]/60 hover:shadow-lg hover:shadow-[#7c8cf2]/5"
              >
                
                {/* Class Card Image Header */}
                <div className="h-44 overflow-hidden bg-zinc-50 border-b border-zinc-200">
                  <img 
                    src={cls.image} 
                    alt={cls.title} 
                    className="w-full h-full object-cover filter grayscale contrast-105 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Class Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-black group-hover:text-[#7c8cf2] transition-colors font-serif">
                        {cls.title}
                      </h3>
                      <span className="text-sm font-black text-[#7c8cf2] tracking-wider">
                        {cls.price}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                      {cls.desc}
                    </p>
                  </div>

                  <div className="pt-6">
                    <Link 
                      href="/book" 
                      className="block text-center py-2 px-6 rounded-full bg-zinc-900 border border-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 group-hover:bg-[#7c8cf2] group-hover:border-[#7c8cf2]"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS SECTION ── */}
      <section className="py-20 px-6 bg-zinc-50 border-t border-zinc-100 animate-fade-in text-left">
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-3xl md:text-5xl font-semibold font-serif text-black uppercase tracking-wide">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
              Have more questions? We're happy to help! If anything isn't covered here, feel free to send us a message through the form below, Facebook, or Instagram.
            </p>
          </div>
          
          {/* Right Column */}
          <div className="md:col-span-7 space-y-8 text-xs font-semibold">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#7c8cf2] uppercase tracking-wider block">1 | Can I join even if I'm not strong or &ldquo;fit&rdquo; yet?</span>
              <p className="text-zinc-650 leading-relaxed font-medium">
                Absolutely. You don't need a certain body type or fitness level to start. Every journey begins somewhere, and our classes are designed to help you build strength gradually - not just physically, but mentally too. With consistent practice and guidance, you'll grow in confidence, resilience, and self-belief.
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#7c8cf2] uppercase tracking-wider block">2 | Is pole and aerial training safe?</span>
              <p className="text-zinc-650 leading-relaxed font-medium">
                Yes. Safety is a top priority at Evolve. All classes are guided by certified instructors who emphasize proper technique, controlled progress, and safe conditioning to help prevent injuries while supporting steady growth.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#7c8cf2] uppercase tracking-wider block">3 | What should I wear to class?</span>
              <p className="text-zinc-650 leading-relaxed font-medium">
                For pole classes, fitted shorts and a tank top or sports bra are recommended for better grip and movement. For aerial classes, leggings and a snug top work best. Comfort and mobility are key.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#7c8cf2] uppercase tracking-wider block">4 | What other important things should I know before attending?</span>
              <p className="text-zinc-650 leading-relaxed font-medium">
                We strictly allow a maximum of 5 minutes late entry to ensure everyone's safety and class flow. Warming up and stretching are a must, and dedicated time is allotted for proper preparation before every session. Please avoid using lotions or oils before class as they affect grip and safety. Always inform your instructor of any injuries or health concerns so we can adjust your training accordingly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOATING CHAT WIDGET ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => alert("Welcome to Evolve Studio! Our assistant is ready to help.")}
          className="w-14 h-14 rounded-full bg-[#7c8cf2] text-white shadow-lg shadow-[#7c8cf2]/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#121212] border-t border-zinc-900 py-16 px-6 text-zinc-400 relative z-10">
        <div className="max-w-[1240px] mx-auto space-y-12">
          
          {/* Logo row */}
          <div className="flex flex-col items-start gap-1 select-none">
            <span className="text-3xl font-light tracking-[0.25em] font-serif text-white uppercase leading-none">
              EVOLVE
            </span>
            <span className="text-[9px] text-[#7c8cf2] tracking-widest uppercase font-mono font-bold mt-1">
              Pole Fitness &amp; Aerial Arts
            </span>
          </div>

          {/* Grid details */}
          <div className="grid sm:grid-cols-3 gap-8 pt-8 border-t border-zinc-900 text-xs font-semibold">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Branches &amp; Contact</span>
              <p className="text-zinc-300">Davao Studio: 2F, Mabini Commercial Complex, Mabini St, Davao City</p>
              <p className="text-zinc-300">Cagayan de Oro Studio: 3F, Corner Capistrano-Gomez Sts, CDO</p>
              <p className="text-zinc-300">Email: info@evolvepolefitness.com</p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Opening Hours</span>
              <div className="space-y-1 text-zinc-300">
                <p>MON - FRI: &nbsp; &nbsp; &nbsp; 7:00 - 21:00</p>
                <p>SATURDAYS: &nbsp; &nbsp; 8:00 - 18:00</p>
                <p>SUNDAYS: &nbsp; &nbsp; &nbsp; CLOSED</p>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Social</span>
              <div className="flex flex-col gap-1.5 text-zinc-300">
                <a href="https://instagram.com/evolvepolefitness" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white">Instagram</a>
                <a href="https://facebook.com/evolvepolefitness" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white">Facebook</a>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
