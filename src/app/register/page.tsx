'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { useBooking } from '@/context/BookingContext';

export default function RegisterPage() {
  const { addOrUpdateCustomer } = useBooking();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [hasMembership, setHasMembership] = useState(false);
  const [prevMemberDate, setPrevMemberDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add customer to mock store
    addOrUpdateCustomer({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      membershipTier: hasMembership ? 'Annual Member' : 'None',
      credits: 0,
      address,
      birthday: `${birthYear}-${birthMonth}-${birthDay}`
    });

    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#111111] overflow-x-hidden font-sans flex flex-col justify-between">
      
      {/* Navbar back-button container */}
      <div className="max-w-[1240px] mx-auto w-full px-6 pt-6 flex justify-start">
        <Link 
          href="/" 
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-[#C9A961] hover:text-black transition-colors" 
          aria-label="Go back to Home"
        >
          <ArrowLeft size={16} />
        </Link>
      </div>

      {/* Centered Registration Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[500px] bg-white rounded-sm shadow-2xl p-8 sm:p-12 text-left space-y-8 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-light uppercase tracking-wide text-zinc-900 leading-tight">
              Student<br />
              Registration<br />
              Form
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Please fill out all required information to complete your registration.
            </p>
          </div>

          {formSubmitted ? (
            <div className="space-y-6 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-wider font-serif">Registration Successful</h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Welcome to Evolve Pole Fitness &amp; Aerial Arts Tribe! Your student profile has been created successfully. You can now purchase class packs and book classes.
              </p>
              <Link 
                href="/book" 
                className="inline-block py-3 px-8 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors rounded-sm"
              >
                Go to Book Classes
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* First & Last Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">* First name</label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Maria"
                    className="w-full bg-white border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black text-zinc-800 font-medium rounded-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">* Last name</label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Santos"
                    className="w-full bg-white border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black text-zinc-800 font-medium rounded-none"
                  />
                </div>
              </div>

              {/* Phone & Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">* Phone</label>
                  <div className="flex border border-zinc-300 focus-within:border-black">
                    <select className="bg-zinc-50 border-r border-zinc-300 text-xs px-2 focus:outline-none text-zinc-600 font-semibold cursor-pointer">
                      <option>🇵🇭 +63</option>
                      <option>🇺🇸 +1</option>
                      <option>🇸🇬 +65</option>
                    </select>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="917 123 4567"
                      className="w-full bg-white px-3 py-2.5 text-sm focus:outline-none text-zinc-800 font-medium rounded-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">* Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. maria@gmail.com"
                    className="w-full bg-white border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black text-zinc-800 font-medium rounded-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">* Address</label>
                <input
                  required
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Barangay, City, Province"
                  className="w-full bg-white border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:border-black text-zinc-800 font-medium rounded-none"
                />
              </div>

              {/* Birthday Month, Day, Year row */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">* Birthday</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    required
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="bg-white border border-zinc-300 px-2 py-2.5 text-xs focus:outline-none focus:border-black text-zinc-700 font-medium rounded-none cursor-pointer"
                  >
                    <option value="">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    required
                    type="text"
                    maxLength={2}
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    placeholder="Day"
                    className="w-full bg-white border border-zinc-300 px-3 py-2.5 text-xs focus:outline-none focus:border-black text-zinc-800 font-medium text-center rounded-none"
                  />
                  <input
                    required
                    type="text"
                    maxLength={4}
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="Year"
                    className="w-full bg-white border border-zinc-300 px-3 py-2.5 text-xs focus:outline-none focus:border-black text-zinc-800 font-medium text-center rounded-none"
                  />
                </div>
              </div>

              {/* Annual Membership checkbox fee */}
              <div className="space-y-4 pt-2 border-t border-zinc-100">
                <span className="text-[10px] text-zinc-400 font-semibold block leading-relaxed">
                  Please tick the box if you're registering as a new member
                </span>
                
                <label className="flex items-start gap-3.5 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={hasMembership}
                    onChange={(e) => setHasMembership(e.target.checked)}
                    className="w-4.5 h-4.5 mt-0.5 accent-black border-zinc-300 rounded-sm cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 uppercase block">Annual Membership Fee</span>
                    <span className="text-xs font-black text-[#C9A961] block mt-0.5">₱1,500</span>
                  </div>
                </label>

                {/* Expiry indicator / Previous Member Date */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-zinc-400 font-semibold block leading-relaxed">
                    If your membership has not expired, you may disregard this fee and indicate the date you previously became a member.
                  </span>
                  
                  <div className="flex border border-zinc-300 focus-within:border-black bg-white rounded-none">
                    <span className="w-10 flex items-center justify-center text-zinc-400 border-r border-zinc-200">
                      <Calendar size={14} />
                    </span>
                    <input
                      type="date"
                      value={prevMemberDate}
                      onChange={(e) => setPrevMemberDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs focus:outline-none text-zinc-700 font-medium bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-zinc-500 hover:bg-black text-white text-xs font-black uppercase tracking-widest transition-all rounded-none cursor-pointer"
                >
                  Next
                </button>
              </div>

            </form>
          )}

          {/* Bottom Branding watermark */}
          <div className="text-center pt-4 border-t border-zinc-100">
            <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono font-bold">
              Evolve Pole Fitness &amp; Aerial Arts Studio
            </span>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
