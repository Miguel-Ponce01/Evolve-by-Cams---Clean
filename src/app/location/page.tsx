'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Compass, HelpCircle } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function LocationPage() {
  const [activeBranch] = useState<'davao'>('davao');

  const branches = {
    davao: {
      name: "Davao North Branch",
      address: "3F Sunscor Bldg., corner Arroyo St., along R Castillo highway, Davao City, 8000",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.0433284589255!2d125.622345!3d7.098432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f96e456789abcd%3A0xfedcba9876543210!2sR.%20Castillo%20St%2C%20Davao%20City!5e0!3m2!1sen!2sph!4v1700000000001!5m2!1sen!2sph",
      phone: "+63 915 183 3369",
      email: "tweetiebullecer@gmail.com",
      directions: "Located along R. Castillo Highway. Landmarks: Sunscor building corner Arroyo street. Dedicated client parking is available directly in front of the building.",
    }
  };

  const activeData = branches[activeBranch];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans relative z-10">
      <div className="max-w-[1240px] mx-auto px-6 py-16 md:py-24 space-y-12">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-8">
          <Link 
            href="/" 
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-[#C9A961] hover:text-black transition-transform active:scale-[0.96] cursor-pointer" 
            aria-label="Go back to Home"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Find Evolve Studio</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-wide uppercase text-white">Studio Location</h1>
          </div>
        </div>

        {/* Map view wrapper */}
        <div className="w-full aspect-[21/9] min-h-[350px] sm:min-h-[450px] rounded-lg overflow-hidden border border-zinc-900 bg-[#121212] relative group shadow-2xl">
          {/* Hardware accelerated premium dark-glitch Google maps filter */}
          <iframe 
            src={activeData.mapEmbedUrl}
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(100%) contrast(120%)' }} 
            allowFullScreen={false} 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${activeData.name} Map Location`}
          />
        </div>

        {/* Location Information Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          <div className="bg-[#121212] border border-zinc-900 p-6 rounded-xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] flex items-center gap-1.5">
              <MapPin size={14} /> Address Details
            </span>
            <p className="text-sm text-white font-semibold leading-relaxed">
              {activeData.name}
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {activeData.address}
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-900 p-6 rounded-xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] flex items-center gap-1.5">
              <Compass size={14} /> Getting Here
            </span>
            <p className="text-xs text-zinc-405 leading-relaxed">
              {activeData.directions}
            </p>
          </div>

          <div className="bg-[#121212] border border-zinc-900 p-6 rounded-xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A961] flex items-center gap-1.5">
              <Phone size={14} /> Studio Contact
            </span>
            <div className="space-y-1 text-xs text-zinc-400">
              <p className="flex items-center gap-2">
                <span className="text-zinc-500 font-mono">TEL:</span>
                <span className="text-white font-semibold">{activeData.phone}</span>
              </p>
              <p className="flex items-center gap-2 pt-1">
                <span className="text-zinc-500 font-mono">MAIL:</span>
                <span className="text-white font-semibold">{activeData.email}</span>
              </p>
            </div>
          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
