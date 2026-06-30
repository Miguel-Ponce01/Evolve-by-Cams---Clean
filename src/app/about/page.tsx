'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden font-sans">
      
      {/* Page Header */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px]">
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase leading-none text-black">
          ABOUT US
        </h1>
      </section>

      {/* Grid Layout Section */}
      <section className="container mx-auto px-6 pb-20 max-w-[1240px] grid md:grid-cols-2 gap-0 border-t border-zinc-200">
        
        {/* Row 1 Left: Vision Statement (Blue Block) */}
        <div className="bg-[#7c8cf2] text-white p-8 sm:p-12 flex flex-col justify-between min-h-[350px]">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
            TAP INTO YOUR EVOLVE POWER. FORGE A STRONGER YOU.
          </h2>
          <div className="space-y-2 mt-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#e8ebfc] block">Our Vision</span>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#e8ebfc]">
              Evolve is committed to delivering a training experience rooted in raw strength, functional fitness, and unwavering community support. We empower our members to tap into their Evolve power, achieve their goals, and live a life of strength, resilience, and unwavering determination.
            </p>
          </div>
        </div>

        {/* Row 1 Right: Fist Bump Image */}
        <div className="relative min-h-[350px] bg-zinc-100">
          <img 
            src="/images/aerial_single.jpg" 
            alt="Aerial yoga single pose"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Row 2 Left: Barbell Lift Image */}
        <div className="relative min-h-[350px] bg-zinc-100">
          <img 
            src="/images/aerial_group.png" 
            alt="Aerial yoga group class"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Row 2 Right: Dynamic Open Gym Text Card */}
        <div className="bg-[#EEF2FF] text-black p-8 sm:p-12 flex flex-col justify-between min-h-[350px]">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight uppercase">
            DYNAMIC OPEN GYM
          </h2>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-zinc-600 mt-8">
            At Evolve, we strip away the fluff and focus on the fundamentals. Our expert coaches guide you through intense, functional workouts designed to build raw strength, resilience, and a body capable of anything.
          </p>
        </div>
      </section>

      {/* Full Width Overhead Lift Section */}
      <section className="relative w-full h-[55vh] min-h-[400px] flex items-end bg-black">
        <img 
          src="/images/studio_room.png" 
          alt="Evolve studio space"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        {/* Floating Text block bottom-left */}
        <div className="relative container mx-auto px-6 py-12 max-w-[1240px] z-10">
          <h2 className="text-white text-3xl sm:text-5xl font-black tracking-tight uppercase max-w-2xl leading-tight">
            WE'VE CREATED A SPACE WHERE YOU CAN RECONNECT WITH YOUR EVOLVE SELF.
          </h2>
        </div>
      </section>

      {/* Call to Action Block */}
      <section className="bg-[#7c8cf2] text-white py-24 px-6 text-center space-y-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#e8ebfc] block">What We Believe In</span>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
          JOIN THE EVOLVE TRIBE TODAY!
        </h2>
        <div className="pt-4">
          <Link 
            href="/book" 
            className="inline-block bg-white text-[#7c8cf2] hover:bg-zinc-100 px-8 py-3.5 rounded-md font-black text-xs uppercase tracking-widest transition-all duration-300"
          >
            Reserve Your Spot
          </Link>
        </div>
      </section>

      {/* Dark Slate Footer from Mockup */}
      <footer className="bg-[#1d1e2c] border-t border-zinc-800 py-16 px-6 text-zinc-400">
        <div className="container mx-auto max-w-[1240px] space-y-12">
          
          {/* Logo row */}
          <div className="flex flex-col items-start gap-1 select-none">
            <span className="text-3xl font-light tracking-[0.25em] font-serif text-white uppercase leading-none">
              EVOLVE
            </span>
          </div>

          {/* Grid details */}
          <div className="grid sm:grid-cols-3 gap-8 pt-8 border-t border-zinc-800 text-xs font-semibold">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Contact</span>
              <p className="text-zinc-300">Email: hello@figma.com</p>
              <p className="text-zinc-300">Phone: (203) 555-5555</p>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Opening Hours</span>
              <div className="space-y-1 text-zinc-300">
                <p>MON - FRI: &nbsp; &nbsp; &nbsp; 5:00 - 23:00</p>
                <p>SATURDAYS: &nbsp; &nbsp; 8:00 - 16:00</p>
                <p>SUNDAYS: &nbsp; &nbsp; &nbsp; 8:00 - 13:00</p>
                <p>HOLIDAYS: &nbsp; &nbsp; &nbsp;8:00 - 16:00</p>
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7c8cf2] block">Social</span>
              <div className="flex flex-col gap-1.5 text-zinc-300">
                <a href="#" className="hover:underline hover:text-white">Instagram</a>
                <a href="#" className="hover:underline hover:text-white">X</a>
                <a href="#" className="hover:underline hover:text-white">LinkedIn</a>
                <a href="#" className="hover:underline hover:text-white">Spotify</a>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
