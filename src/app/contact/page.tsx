'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Facebook, Instagram } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

const EvolveMap = dynamic(() => import('@/components/map/EvolveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
      <span className="text-zinc-650 text-xs font-mono uppercase tracking-widest animate-pulse">Loading Map…</span>
    </div>
  ),
});

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] font-sans flex flex-col justify-between">
      
      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full flex-1">
        
        {/* Left Column: Dark Panel (Studio Details) */}
        <div className="lg:col-span-4 bg-black border-r border-zinc-900 p-8 sm:p-12 flex flex-col justify-between text-left space-y-12">
          
          {/* Back button */}
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-zinc-900 hover:bg-[#C9A961] hover:text-black text-xs font-semibold text-zinc-300 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Davao Branch */}
          <div className="space-y-4">
            <div className="flex gap-3 text-zinc-400">
              <a href="https://www.facebook.com/EvolvePoleFitness/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A961] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A961] transition-colors">
                <Instagram size={20} />
              </a>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Davao Branch</h4>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-sm">
                3F Sunscor Bldg, corner Arroyo along R. Castillo Highway, Davao City, Davao Del Sur, Philippines
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Light Panel (Form) */}
        <div className="lg:col-span-8 bg-white text-zinc-900 p-8 sm:p-16 flex flex-col justify-center text-left">
          <div className="max-w-[600px] mx-auto w-full space-y-8">
            <h2 className="text-3xl sm:text-4xl font-serif font-light tracking-wide uppercase text-zinc-900 leading-tight">
              Get in touch with us!
            </h2>

            {formSubmitted ? (
              <div className="space-y-4 py-8">
                <span className="text-4xl text-emerald-600">✓</span>
                <h4 className="text-lg font-bold uppercase font-serif text-zinc-900">Message Sent</h4>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Thank you for reaching out! One of our team members will get back to you shortly.
                </p>
                <button 
                  onClick={() => {
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setMessage('');
                    setFormSubmitted(false);
                  }}
                  className="py-2.5 px-6 rounded-none bg-zinc-650 text-white hover:bg-zinc-800 text-xs font-black uppercase tracking-wider transition-colors mt-4"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">First Name</label>
                    <input 
                      required 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Maria"
                      className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-zinc-900 text-zinc-800 font-medium rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">Last Name</label>
                    <input 
                      required 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Santos"
                      className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-zinc-900 text-zinc-800 font-medium rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">Email *</label>
                  <input 
                    required 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. maria@gmail.com"
                    className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-zinc-900 text-zinc-800 font-medium rounded-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">Message</label>
                  <textarea 
                    required 
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter the details of your inquiry here..."
                    className="w-full bg-white border border-zinc-300 p-3 text-sm focus:outline-none focus:border-zinc-900 text-zinc-800 font-medium rounded-none"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="px-8 py-3.5 bg-zinc-500 hover:bg-black text-white font-black uppercase tracking-widest text-xs transition-colors rounded-none cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Interactive Map Component Below */}
      <div className="w-full border-t border-zinc-900 py-12 px-6 max-w-[1240px] mx-auto space-y-6">
        <div className="text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold block mb-1">Interactive Locator</span>
          <h3 className="text-xl font-serif uppercase tracking-wider text-white">Find Our Studios</h3>
        </div>
        <EvolveMap />
      </div>

      <Footer />
    </div>
  );
}
