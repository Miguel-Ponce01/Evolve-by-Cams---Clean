'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans pb-16 lg:pb-0">
      
      {/* ── Page Header ── */}
      <section className="container mx-auto px-6 py-16 max-w-[1240px] text-center">
        <h1 className="text-5xl sm:text-7xl font-semibold tracking-[0.1em] font-serif uppercase text-black leading-none">
          About Us
        </h1>
        <div className="w-20 h-[1px] bg-zinc-300 mx-auto mt-6" />
      </section>

      {/* ── Intro Quote Section ── */}
      <section className="container mx-auto px-6 pb-12 max-w-[1000px] text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-semibold font-serif text-[#7c8cf2] leading-snug">
          Discover the Art of Pole and Aerial Fitness
        </h2>
        <p className="text-zinc-605 font-medium text-sm sm:text-base leading-relaxed">
          Evolve Pole Fitness and Aerial Arts Studio was founded in May 2016 in Davao City by Ervy “Tweetie” Bullecer. 
          What began as a small and humble pole fitness studio was built on a powerful belief that pole fitness can be 
          empowering, joyful, and artistic, and that women of all ages, shapes, and sizes deserve a safe space to grow 
          stronger and more confident through movement.
        </p>
      </section>

      {/* ── Alternating Grid Sections ── */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px] space-y-16">
        
        {/* Row 1: The Happy Place */}
        <div className="grid md:grid-cols-2 gap-12 items-center border-t border-zinc-150 pt-16">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Our Core Identity</span>
            <h3 className="text-3xl font-semibold font-serif text-black uppercase tracking-wide">
              Your Happy Place
            </h3>
            <p className="text-zinc-600 font-medium text-sm leading-relaxed">
              From the beginning, Evolve was intentionally created as more than a fitness studio. It became a supportive 
              and empowering community rooted in empathy, respect, acceptance, and encouragement. Over time, this 
              environment naturally grew into what many students lovingly call their Happy Place.
            </p>
          </div>
          <div className="relative h-[350px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <img 
              src="/images/aerial_single.jpg" 
              alt="Happy place training"
              className="w-full h-full object-cover filter grayscale contrast-110"
            />
          </div>
        </div>

        {/* Row 2: Standardized Excellence */}
        <div className="grid md:grid-cols-2 gap-12 items-center border-t border-zinc-150 pt-16">
          <div className="relative h-[350px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 md:order-2">
            <img 
              src="/images/aerial_group.png" 
              alt="Standardized instructor training"
              className="w-full h-full object-cover filter grayscale contrast-110"
            />
          </div>
          <div className="space-y-6 md:order-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Structure &amp; Safety</span>
            <h3 className="text-3xl font-semibold font-serif text-black uppercase tracking-wide">
              Technique &amp; Sustainable Progression
            </h3>
            <p className="text-zinc-600 font-medium text-sm leading-relaxed">
              In its early years, Evolve focused on developing structured pole fitness programs that prioritized proper 
              technique, safety, and sustainable progression. As the studio continued to grow, it expanded into aerial 
              arts including silks, sling, and lyra hoop, while refining its teaching methods through hands-on experience 
              and close student engagement.
            </p>
            <p className="text-zinc-600 font-medium text-sm leading-relaxed">
              To maintain consistency and safety across all classes, Evolve developed its own standardized instructor 
              training, certification, and ranking systems, tested and strengthened through years of real-world studio operations.
            </p>
          </div>
        </div>

        {/* Row 3: A Decade of Empowerment */}
        <div className="grid md:grid-cols-2 gap-12 items-center border-t border-zinc-150 pt-16">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Expanding Our Mission</span>
            <h3 className="text-3xl font-semibold font-serif text-black uppercase tracking-wide">
              Preserving the Heart of Evolve
            </h3>
            <p className="text-zinc-600 font-medium text-sm leading-relaxed">
              Evolve’s journey included both growth and challenge, reinforcing its commitment to safety, structure, 
              empathy, and empowerment. Today, Evolve stands on a decade of lived experience and proven systems. 
              Through franchising, its mission continues by bringing safe and high-quality pole fitness and aerial arts 
              programs to new communities while preserving the heart and integrity of the Evolve experience.
            </p>
          </div>
          <div className="relative h-[350px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <img 
              src="/images/pole_stretch.png" 
              alt="Franchising and expansion"
              className="w-full h-full object-cover filter grayscale contrast-110"
            />
          </div>
        </div>

      </section>

      {/* ── Full Width Overhead Section ── */}
      <section className="relative w-full h-[50vh] min-h-[350px] flex items-center justify-center bg-black border-y border-zinc-950 mt-16">
        <img 
          src="/images/studio_room.png" 
          alt="Evolve studio room space"
          className="absolute inset-0 w-full h-full object-cover opacity-30 filter grayscale"
        />
        <div className="relative z-10 text-center space-y-6 px-6 max-w-3xl">
          <h2 className="text-white text-3xl sm:text-5xl font-semibold font-serif uppercase tracking-wider leading-tight">
            Dedication. Expertise. Passion.
          </h2>
          <p className="text-[#7c8cf2] tracking-[0.2em] uppercase font-bold text-xs">
            We are Evolve Pole Fitness &amp; Aerial Arts
          </p>
        </div>
      </section>

      {/* ── Call to Action Block ── */}
      <section className="bg-[#EEF2FF] border-y border-zinc-200 py-24 px-6 text-center space-y-8 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Join Our Family</span>
        <h2 className="text-4xl sm:text-5xl font-semibold font-serif uppercase text-black">
          Join the Evolve Tribe Today!
        </h2>
        <div className="pt-4">
          <Link 
            href="/book" 
            className="inline-block bg-[#7c8cf2] hover:bg-[#6c7ef0] text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md"
          >
            Reserve Your Spot
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
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
