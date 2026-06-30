'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden font-sans">
      
      {/* Hero Banner Title */}
      <section className="container mx-auto px-6 pt-12 pb-6 max-w-[1240px]">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-none text-black animate-fade-in">
          TRAIN HARD. <span className="text-[#7c8cf2]">LIVE BETTER</span>
        </h1>
      </section>

      {/* Hero Split Layout Grid */}
      <section className="container mx-auto px-6 pb-12 max-w-[1240px] grid md:grid-cols-12 gap-0 border-t border-zinc-200 animate-fade-in">
        
        {/* Left Column: Squats Image */}
        <div className="md:col-span-8 relative min-h-[350px] md:min-h-[500px] bg-zinc-100 border-r border-zinc-200">
          <img 
            src="/images/reformer_plank.png" 
            alt="Reformer side planks"
            className="w-full h-full object-cover animate-image-reveal"
          />
          {/* Overlay text in photo */}
          <div className="absolute top-8 right-8 text-right select-none opacity-80 pointer-events-none">
            <span className="text-6xl sm:text-8xl font-black tracking-tighter text-zinc-100/30 uppercase leading-none block">RAISE</span>
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-red-500 uppercase leading-none block mt-1">THE</span>
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-zinc-150 uppercase leading-none block">BAR</span>
          </div>
        </div>

        {/* Right Column: For the Committed Text Block */}
        <div className="md:col-span-4 bg-[#EEF2FF] p-8 sm:p-12 flex flex-col justify-between min-h-[350px] md:min-h-[500px]">
          <div className="space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-tight leading-none text-black">
              FOR THE COMMITTED
            </h2>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-zinc-600">
              Train like an athlete with top-tier equipment and expert programming. Whether you're building muscle or breaking PRs, we help you push past limits.
            </p>
          </div>
          <div className="pt-8">
            <Link 
              href="/about" 
              className="text-xs font-black uppercase tracking-widest text-[#7c8cf2] hover:text-[#6c7ef0] border-b-2 border-[#7c8cf2] hover:border-[#6c7ef0] pb-1 transition-all"
            >
              About Us
            </Link>
          </div>
        </div>

      </section>

      {/* Three Column Grid Details Section */}
      <section className="container mx-auto px-6 pb-20 max-w-[1240px] grid md:grid-cols-3 gap-0 border-y border-zinc-200">
        
        {/* Card 1: Guided by Experts */}
        <div className="border-r border-zinc-200 last:border-r-0 p-8 sm:p-12 flex flex-col justify-between min-h-[320px] bg-white">
          <h3 className="text-3xl font-black uppercase tracking-tight leading-none text-black">
            GUIDED BY EXPERTS
          </h3>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-zinc-600 mt-8">
            We believe in creating a positive environment where you can thrive. We're here to help you achieve your goals and unlock your full potential.
          </p>
        </div>

        {/* Card 2: Dynamic Open Gym */}
        <div className="border-r border-zinc-200 last:border-r-0 p-8 sm:p-12 flex flex-col justify-between min-h-[320px] bg-[#EEF2FF]">
          <h3 className="text-3xl font-black uppercase tracking-tight leading-none text-black">
            DYNAMIC OPEN GYM
          </h3>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-zinc-600 mt-8">
            Our facility is the optimal environment for strength training and performance, fully equipped with top-of-the-line tools, ample training areas, and a focus on functional movement.
          </p>
        </div>

        {/* Card 3: Coach Image */}
        <div className="relative min-h-[320px] bg-zinc-100">
          <img 
            src="/images/pole_stretch.png" 
            alt="Pole stretching session"
            className="w-full h-full object-cover"
          />
        </div>

      </section>

      {/* Headline Block: Join the Community */}
      <section className="container mx-auto px-6 py-12 max-w-[1240px]">
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-none text-black">
          JOIN THE <span className="text-[#7c8cf2]">COMMUNITY</span>
        </h2>
      </section>

      {/* Discover & Grayscale Image Section */}
      <section className="container mx-auto px-6 pb-20 max-w-[1240px] grid md:grid-cols-2 gap-0 border-t border-zinc-200">
        
        {/* Left Column: Highlight items */}
        <div className="bg-[#EEF2FF] border-r border-zinc-200 p-8 sm:p-12 flex flex-col justify-between min-h-[450px]">
          <div className="space-y-8">
            <h3 className="text-3xl font-black uppercase tracking-tight text-black">
              DISCOVER YOUR POTENTIAL
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7c8cf2]">Expert Coaching</h4>
                <p className="text-xs font-semibold text-zinc-500">Trainers who are passionate about your progress.</p>
              </div>
              <div className="space-y-1 border-t border-zinc-150 pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7c8cf2]">Results-Driven Programs</h4>
                <p className="text-xs font-semibold text-zinc-500">Workouts that deliver tangible, measurable results.</p>
              </div>
              <div className="space-y-1 border-t border-zinc-150 pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#7c8cf2]">A Supportive Tribe</h4>
                <p className="text-xs font-semibold text-zinc-500">A community that pushes you to be your best.</p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <Link 
              href="/book" 
              className="text-xs font-black uppercase tracking-widest text-[#7c8cf2] hover:text-[#6c7ef0] border-b-2 border-[#7c8cf2] hover:border-[#6c7ef0] pb-1 transition-all"
            >
              View Classes
            </Link>
          </div>
        </div>

        {/* Right Column: Grayscale image */}
        <div className="relative min-h-[450px] bg-zinc-800">
          <img 
            src="/images/dance_class.png" 
            alt="Dance class group"
            className="w-full h-full object-cover"
          />
        </div>

      </section>

      {/* Periwinkle CTA Banner from Mockup */}
      <section className="bg-[#7c8cf2] text-white py-24 px-6 text-center space-y-6 animate-fade-in">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#e8ebfc] block">What We Believe In</span>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase leading-none">
          JOIN THE EVOLVE TRIBE TODAY!
        </h2>
        <div className="pt-4">
          <Link 
            href="/book" 
            className="inline-block bg-white text-[#7c8cf2] hover:bg-zinc-100 px-8 py-3.5 rounded-md font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md"
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
              <div className="flex flex-col gap-1.5 text-zinc-300 animate-fade-in">
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
