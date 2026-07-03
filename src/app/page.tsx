'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const classesList = [
    {
      title: 'Pole Fitness - Group Class',
      desc: 'GROUP CLASS. ALL LEVELS.',
      price: '₱1,000',
      link: '/book/class-001',
      image: '/images/pole_stretch.png'
    },
    {
      title: 'Aerial - Group Class',
      desc: 'GROUP CLASS. ALL LEVELS.',
      price: '₱1,000',
      link: '/book/class-002',
      image: '/images/aerial_single.jpg'
    },
    {
      title: 'Pole - Private Class',
      desc: 'PERSONALIZED TRAINING. FASTER PROGRESS. STRONGER YOU.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-003',
      image: '/images/dance_back.png'
    },
    {
      title: 'Aerial - Private Class',
      desc: 'GRACE IN THE AIR, STRENGTH IN YOUR BODY, CONFIDENCE IN MOTION.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-004',
      image: '/images/aerial_group.png'
    },
    {
      title: 'Exole (Exotic Pole)',
      desc: 'MOVE BOLDLY. EXPRESS FREELY.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-003',
      image: '/images/dance_back.png'
    },
    {
      title: 'Acro Chair',
      desc: 'STRENGTH, CONTROL, AND POWERFUL MOVEMENT.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-005',
      image: '/images/reformer_plank.png'
    },
    {
      title: 'Sexy Chair',
      desc: 'CONFIDENCE, FLOW, AND FIERCE MOVEMENT.',
      price: '₱1,800',
      duration: '1 HR',
      link: '/book/class-005',
      image: '/images/dance_class.png'
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
      `}</style>


      
      {/* ── HERO BANNER SECTION ── */}
      <section className="relative w-full py-24 md:py-36 flex flex-col items-center justify-center text-center px-6">
        
        {/* Soft layout background */}
        <div className={`absolute inset-0 pointer-events-none ${isDarkMode ? "bg-gradient-to-b from-black via-[#0A0A0A] to-[#0A0A0A]" : "bg-gradient-to-b from-zinc-50 via-white to-white"}`} />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          <h1 className={`text-4xl sm:text-6xl md:text-8xl font-semibold tracking-[0.05em] font-serif uppercase leading-tight ${themeHeaderColor}`}>
            EVOLVE POLE FITNESS <br/>
            <span className="text-[#C9A961]">&amp; AERIAL ARTS</span>
          </h1>
          
          <div className="w-24 h-[1px] bg-zinc-500 mx-auto my-4" />

          <p className={`text-lg sm:text-xl font-medium tracking-widest uppercase ${themeTextMuted}`}>
            Move with Purpose. Evolve with Confidence.
          </p>
        </div>

        {/* ── THREE COLUMN HORIZONTAL GALLERY — Real Studio Photos ── */}
        <div className="w-full max-w-[1240px] mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className={`group relative h-[380px] overflow-hidden border rounded-lg ${themeBorderColor}`}>
            <img 
              src="/images/studio_poles.jpg" 
              alt="Evolve pole studio room"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          <div className={`group relative h-[380px] overflow-hidden border rounded-lg ${themeBorderColor}`}>
            <img 
              src="/images/studio_aerial.jpg" 
              alt="Aerial arts room with hoop and silks"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>

          <div className={`group relative h-[380px] overflow-hidden border rounded-lg ${themeBorderColor}`}>
            <img 
              src="/images/studio_neon.jpg" 
              alt="Evolve neon logo sign"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        </div>

      </section>

      {/* ── WELCOME BANNER & WALK-IN DETAILS ── */}
      <section className={`py-16 px-6 border-y ${themeBorderColor} ${isDarkMode ? "bg-[#111111]" : "bg-zinc-50"}`}>
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-wider font-serif uppercase text-[#C9A961]">
            Welcome to Evolve Studio
          </h2>
          <p className={`text-sm leading-relaxed font-medium ${themeTextMuted}`}>
            We are thrilled to welcome you to Evolve Pole Fitness and Aerial Arts Studio. Whether you are stepping onto the mat for the first time or a seasoned enthusiast, we provide a safe, structured, and inspiring place for your wellness journey.
          </p>
          <div className={`p-6 rounded-xl border text-left space-y-3 ${isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200"}`}>
            <span className="text-[10px] font-mono font-black text-[#C9A961] uppercase tracking-wider block">Walk-In Bookings & Settling Payments</span>
            <p className={`text-xs leading-relaxed font-medium ${themeTextMuted}`}>
              We welcome walk-ins! You can book your sessions directly via **Facebook Messenger** or **Instagram**. Payments can be settled via **Cash**, **Bank Transfer**, or **GCash manual recording**, which our staff will log instantly in our POS system.
            </p>
          </div>
        </div>
      </section>

      {/* ── "WE ARE EVOLVE" HISTORY SECTION ── */}
      <section className={`py-20 px-6 ${isDarkMode ? "bg-[#0F0F0F]/60" : "bg-zinc-50/60"}`}>
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Photo — Real reception desk */}
          <div className={`md:col-span-6 relative h-[450px] overflow-hidden rounded-xl border shadow-lg ${themeBorderColor}`}>
            <img 
              src="/images/studio_reception.jpg" 
              alt="Evolve front desk and reception area"
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Right Column: History */}
          <div className="md:col-span-6 space-y-8 flex flex-col justify-center text-left">
            <div className="flex items-center gap-1 font-serif select-none">
              <span className={`text-4xl font-light tracking-[0.25em] ${themeHeaderColor}`}>EVO</span>
              <svg className="w-12 h-12 text-[#C9A961] animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M30,85 C45,65 55,35 60,15 C65,30 50,75 75,60 C80,55 70,80 50,85" strokeLinecap="round" />
                <circle cx="60" cy="15" r="3" fill="currentColor" />
              </svg>
              <span className={`text-4xl font-light tracking-[0.25em] -ml-2 ${themeHeaderColor}`}>LVE</span>
            </div>

            <h2 className={`text-3xl md:text-5xl font-semibold font-serif tracking-wide uppercase ${themeHeaderColor}`}>
              Discover the Art of Pole &amp; Aerial Fitness
            </h2>

            <div className={`space-y-4 font-medium text-sm sm:text-base leading-relaxed ${themeTextMuted}`}>
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
                className="inline-block py-3 px-8 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95"
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
            <h2 className={`text-3xl md:text-5xl font-semibold font-serif uppercase tracking-wide ${themeHeaderColor}`}>
              Evolve With Us
            </h2>
            <p className="text-[#C9A961] tracking-widest text-xs uppercase font-bold">
              Explore Our Core Offerings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classesList.map((cls, idx) => (
              <div 
                key={idx} 
                className={`group flex flex-col justify-between h-[440px] rounded-xl overflow-hidden border transition-all duration-300 hover:border-[#C9A961]/60 hover:shadow-lg ${themeCardBg}`}
              >
                
                {/* Class Card Image Header */}
                <div className={`h-44 overflow-hidden bg-zinc-50 border-b ${themeBorderColor}`}>
                  <img 
                    src={cls.image} 
                    alt={cls.title} 
                    className="w-full h-full object-cover filter grayscale contrast-105 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Class Details */}
                <div className="p-6 flex-1 flex flex-col justify-between text-left">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-xl font-bold group-hover:text-[#C9A961] transition-colors font-serif leading-tight ${themeHeaderColor}`}>
                        {cls.title}
                      </h3>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-[#C9A961] tracking-wider block">
                          {cls.price}
                        </span>
                        {cls.duration && (
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">{cls.duration}</span>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs font-semibold leading-relaxed ${themeTextMuted}`}>
                      {cls.desc}
                    </p>
                  </div>

                  <div className="pt-6">
                    <Link 
                      href={cls.link} 
                      className={`block text-center py-2 px-6 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                        isDarkMode 
                          ? "bg-zinc-900 border-zinc-800 text-white hover:bg-[#C9A961] hover:text-black hover:border-[#C9A961]" 
                          : "bg-black border-black text-white hover:bg-[#C9A961] hover:text-black hover:border-[#C9A961]"
                      }`}
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
      <section className={`py-20 px-6 border-t text-left ${isDarkMode ? "bg-black border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="md:col-span-5 space-y-4">
            <h2 className={`text-3xl md:text-5xl font-semibold font-serif uppercase tracking-wide ${themeHeaderColor}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xs font-semibold leading-relaxed ${themeTextMuted}`}>
              Have more questions? We're happy to help! If anything isn't covered here, feel free to send us a message, Facebook, or Instagram.
            </p>
          </div>
          
          {/* Right Column */}
          <div className={`md:col-span-7 space-y-8 text-xs font-semibold ${themeTextMuted}`}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#C9A961] uppercase tracking-wider block">1 | Can I join even if I'm not strong or &ldquo;fit&rdquo; yet?</span>
              <p className="leading-relaxed font-medium">
                Absolutely. You don't need a certain body type or fitness level to start. Every journey begins somewhere, and our classes are designed to help you build strength gradually - not just physically, but mentally too. With consistent practice and guidance, you'll grow in confidence, resilience, and self-belief.
              </p>
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#C9A961] uppercase tracking-wider block">2 | Is pole and aerial training safe?</span>
              <p className="leading-relaxed font-medium">
                Yes. Safety is a top priority at Evolve. All classes are guided by certified instructors who emphasize proper technique, controlled progress, and safe conditioning to help prevent injuries while supporting steady growth.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#C9A961] uppercase tracking-wider block">3 | What should I wear to class?</span>
              <p className="leading-relaxed font-medium">
                For pole classes, fitted shorts and a tank top or sports bra are recommended for better grip and movement. For aerial classes, leggings and a snug top work best. Comfort and mobility are key.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-[#C9A961] uppercase tracking-wider block">4 | What other important things should I know before attending?</span>
              <p className="leading-relaxed font-medium">
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
          className="w-14 h-14 rounded-full bg-[#C9A961] text-black shadow-lg shadow-[#C9A961]/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border border-[#C9A961]"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
          </svg>
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#121212] border-t border-zinc-900 py-16 px-6 text-zinc-400 relative z-10 text-left">
        <div className="max-w-[1240px] mx-auto space-y-12">
          <div className="flex flex-col items-start gap-1 select-none">
            <span className="text-3xl font-light tracking-[0.25em] font-serif text-white uppercase leading-none">
              EVOLVE
            </span>
            <span className="text-[9px] text-[#C9A961] tracking-widest uppercase font-mono font-bold mt-1">
              Pole Fitness &amp; Aerial Arts
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 pt-8 border-t border-zinc-900 text-xs font-semibold">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Branches &amp; Contact</span>
              <p className="text-zinc-300">Davao Studio: 2F, Mabini Commercial Complex, Mabini St, Davao City</p>
              <p className="text-zinc-300">Cagayan de Oro Studio: 3F, Corner Capistrano-Gomez Sts, CDO</p>
              <p className="text-zinc-300">Email: info@evolvepolefitness.com</p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Opening Hours</span>
              <div className="space-y-1 text-zinc-300">
                <p>MON - FRI: &nbsp; &nbsp; &nbsp; 7:00 - 21:00</p>
                <p>SATURDAYS: &nbsp; &nbsp; 8:00 - 18:00</p>
                <p>SUNDAYS: &nbsp; &nbsp; &nbsp; CLOSED</p>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Social</span>
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
