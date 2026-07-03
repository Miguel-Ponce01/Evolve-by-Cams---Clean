'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sun, Moon, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const themeBg = isDarkMode ? "bg-[#0A0A0A] text-[#F5F5F3]" : "bg-[#FFFFFF] text-[#111111]";
  const themeTextMuted = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const themeHeaderColor = isDarkMode ? "text-white" : "text-black";
  const themeBorderColor = isDarkMode ? "border-zinc-800" : "border-zinc-200";

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden font-sans pb-16 lg:pb-0 ${themeBg}`}>
      
      {/* ── THEME CONFIG SWITCHER ── */}
      <div className={`w-full py-3 px-6 flex justify-between items-center border-b ${themeBorderColor}`}>
        <div className="flex items-center gap-3">
          <Link href="/" className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-100 text-black hover:bg-zinc-200"}`}>
            <ArrowLeft size={16} />
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">About Us Info Desk</span>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            isDarkMode 
              ? "bg-[#1F1F1F] border-zinc-700 text-white hover:bg-zinc-800" 
              : "bg-[#F3F4F6] border-zinc-300 text-black hover:bg-zinc-200"
          }`}
        >
          {isDarkMode ? <Sun size={14} className="text-[#C9A961]" /> : <Moon size={14} />}
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      {/* ── Page Header ── */}
      <section className="container mx-auto px-6 py-16 max-w-[1240px] text-center">
        <h1 className={`text-5xl sm:text-7xl font-semibold tracking-[0.1em] font-serif uppercase leading-none ${themeHeaderColor}`}>
          About Us
        </h1>
        <div className="w-20 h-[1px] bg-zinc-500 mx-auto mt-6" />
      </section>

      {/* ── Intro Quote Section ── */}
      <section className="container mx-auto px-6 pb-12 max-w-[1000px] text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-semibold font-serif text-[#C9A961] leading-snug uppercase tracking-wide">
          Discover the Art of Pole and Aerial Fitness
        </h2>
        <p className={`font-medium text-sm sm:text-base leading-relaxed ${themeTextMuted}`}>
          Evolve Pole Fitness and Aerial Arts Studio was founded in May 2016 in Davao City by Ervy “Tweetie” Bullecer. 
          What began as a small and humble pole fitness studio was built on a powerful belief that pole fitness can be 
          empowering, joyful, and artistic, and that women of all ages, shapes, and sizes deserve a safe space to grow 
          stronger and more confident through movement.
        </p>
      </section>

      {/* ── Alternating Grid Sections ── */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px] space-y-16">
        
        {/* Row 1: The Happy Place */}
        <div className={`grid md:grid-cols-2 gap-12 items-center border-t pt-16 ${themeBorderColor}`}>
          <div className="space-y-6 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Our Core Identity</span>
            <h3 className={`text-3xl font-semibold font-serif uppercase tracking-wide ${themeHeaderColor}`}>
              Your Happy Place
            </h3>
            <p className={`font-medium text-sm leading-relaxed ${themeTextMuted}`}>
              From the beginning, Evolve was intentionally created as more than a fitness studio. It became a supportive 
              and empowering community rooted in empathy, respect, acceptance, and encouragement. Over time, this 
              environment naturally grew into what many students lovingly call their Happy Place.
            </p>
          </div>
          <div className={`relative h-[350px] overflow-hidden rounded-xl border bg-zinc-50 ${themeBorderColor}`}>
            <img 
              src="/images/aerial_single.jpg" 
              alt="Happy place training"
              className="w-full h-full object-cover filter grayscale contrast-110"
            />
          </div>
        </div>

        {/* Row 2: Standardized Excellence */}
        <div className={`grid md:grid-cols-2 gap-12 items-center border-t pt-16 ${themeBorderColor}`}>
          <div className={`relative h-[350px] overflow-hidden rounded-xl border bg-zinc-50 md:order-2 ${themeBorderColor}`}>
            <img 
              src="/images/aerial_group.png" 
              alt="Standardized instructor training"
              className="w-full h-full object-cover filter grayscale contrast-110"
            />
          </div>
          <div className="space-y-6 md:order-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Structure &amp; Safety</span>
            <h3 className={`text-3xl font-semibold font-serif uppercase tracking-wide ${themeHeaderColor}`}>
              Technique &amp; Sustainable Progression
            </h3>
            <p className={`font-medium text-sm leading-relaxed ${themeTextMuted}`}>
              In its early years, Evolve focused on developing structured pole fitness programs that prioritized proper 
              technique, safety, and sustainable progression. As the studio continued to grow, it expanded into aerial 
              arts including silks, sling, and lyra hoop, while refining its teaching methods through hands-on experience 
              and close student engagement.
            </p>
            <p className={`font-medium text-sm leading-relaxed ${themeTextMuted}`}>
              To maintain consistency and safety across all classes, Evolve developed its own standardized instructor 
              training, certification, and ranking systems, tested and strengthened through years of real-world studio operations.
            </p>
          </div>
        </div>

        {/* Row 3: A Decade of Empowerment */}
        <div className={`grid md:grid-cols-2 gap-12 items-center border-t pt-16 ${themeBorderColor}`}>
          <div className="space-y-6 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Expanding Our Mission</span>
            <h3 className={`text-3xl font-semibold font-serif uppercase tracking-wide ${themeHeaderColor}`}>
              Preserving the Heart of Evolve
            </h3>
            <p className={`font-medium text-sm leading-relaxed ${themeTextMuted}`}>
              Evolve’s journey included both growth and challenge, reinforcing its commitment to safety, structure, 
              empathy, and empowerment. Today, Evolve stands on a decade of lived experience and proven systems. 
              Through franchising, its mission continues by bringing safe and high-quality pole fitness and aerial arts 
              programs to new communities while preserving the heart and integrity of the Evolve experience.
            </p>
          </div>
          <div className={`relative h-[350px] overflow-hidden rounded-xl border bg-zinc-50 ${themeBorderColor}`}>
            <img 
              src="/images/pole_stretch.png" 
              alt="Franchising and expansion"
              className="w-full h-full object-cover filter grayscale contrast-110"
            />
          </div>
        </div>

      </section>

      {/* ── Full Width Overhead Section ── */}
      <section className={`relative w-full h-[50vh] min-h-[350px] flex items-center justify-center bg-black border-y mt-16 ${themeBorderColor}`}>
        <img 
          src="/images/studio_room.png" 
          alt="Evolve studio room space"
          className="absolute inset-0 w-full h-full object-cover opacity-30 filter grayscale"
        />
        <div className="relative z-10 text-center space-y-6 px-6 max-w-3xl">
          <h2 className="text-white text-3xl sm:text-5xl font-semibold font-serif uppercase tracking-wider leading-tight">
            Dedication. Expertise. Passion.
          </h2>
          <p className="text-[#C9A961] tracking-[0.2em] uppercase font-bold text-xs">
            We are Evolve Pole Fitness &amp; Aerial Arts
          </p>
        </div>
      </section>

      {/* ── Call to Action Block ── */}
      <section className={`border-y py-24 px-6 text-center space-y-8 relative z-10 ${isDarkMode ? "bg-[#111111]" : "bg-zinc-50"}`} style={{ borderColor: isDarkMode ? "#1f1f1f" : "#e5e7eb" }}>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] block">Join Our Family</span>
        <h2 className={`text-4xl sm:text-5xl font-semibold font-serif uppercase ${themeHeaderColor}`}>
          Join the Evolve Tribe Today!
        </h2>
        <div className="pt-4">
          <Link 
            href="/book" 
            className={`inline-block px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md ${
              isDarkMode 
                ? "bg-[#C9A961] hover:bg-[#b09352] text-black" 
                : "bg-black hover:bg-zinc-800 text-white"
            }`}
          >
            Reserve Your Spot
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#121212] border-t border-zinc-900 py-16 px-6 text-zinc-400 relative z-10 text-left">
        <div className="max-w-[1240px] mx-auto space-y-12">
          
          {/* Logo row */}
          <div className="flex flex-col items-start gap-1 select-none">
            <span className="text-3xl font-light tracking-[0.25em] font-serif text-white uppercase leading-none">
              EVOLVE
            </span>
            <span className="text-[9px] text-[#C9A961] tracking-widest uppercase font-mono font-bold mt-1">
              Pole Fitness &amp; Aerial Arts Studio
            </span>
          </div>

          {/* Grid details */}
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
