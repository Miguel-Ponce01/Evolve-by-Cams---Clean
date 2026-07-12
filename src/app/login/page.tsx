'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Mail, ShieldAlert, CheckCircle, Smartphone, Chrome } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpMode, setOtpMode] = useState<'email' | 'sms'>('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const redirectUrl = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Magic link successfully dispatched to your email! Please check your inbox.');
      setOtpSent(true);
    }
  };

  const handleSmsOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Format phone: ensuring +63 prefix
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+63' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+63' + formattedPhone;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(`OTP verification code dispatched to ${formattedPhone}.`);
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    let verifyParams;
    if (otpMode === 'email') {
      verifyParams = { email, token: otpToken, type: 'email' as const };
    } else {
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+63' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+63' + formattedPhone;
      }
      verifyParams = { phone: formattedPhone, token: otpToken, type: 'sms' as const };
    }

    const { error, data } = await supabase.auth.verifyOtp(verifyParams);

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Login authenticated! Redirecting to dashboard...');
      window.location.href = '/dashboard';
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FF5E62]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#C9A961]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Nav Back button */}
      <div className="max-w-[1240px] mx-auto w-full px-6 pt-6 flex justify-start z-10">
        <Link 
          href="/" 
          className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#C9A961] transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
      </div>

      {/* Centered Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-[450px] bg-zinc-950/80 border border-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-3xl font-serif tracking-[0.15em] text-white uppercase">
              STUDENT <span className="text-[#C9A961]">LOGIN</span>
            </h1>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              Evolve Pole Fitness &amp; Aerial Arts Tribe
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-3 text-red-200 text-xs">
              <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-3 text-emerald-200 text-xs">
              <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Render OTP Token Entry Input if verification is active */}
          {otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 text-center">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-widest block">
                  Enter One-Time Verification Token
                </label>
                <input
                  required
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 text-center text-lg tracking-[0.5em] text-[#C9A961] font-bold rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-lg shadow-[#C9A961]/10 flex items-center justify-center gap-1.5"
              >
                {loading ? 'Authenticating...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Back to credentials
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              
              {/* Tab Selector */}
              <div className="flex bg-zinc-900/60 rounded-full p-1 border border-zinc-900">
                <button
                  type="button"
                  onClick={() => { setOtpMode('email'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    otpMode === 'email' ? 'bg-[#C9A961] text-black shadow-sm' : 'text-zinc-450 hover:text-white'
                  }`}
                >
                  <Mail size={12} /> Email Code
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpMode('sms'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    otpMode === 'sms' ? 'bg-[#C9A961] text-black shadow-sm' : 'text-zinc-450 hover:text-white'
                  }`}
                >
                  <Smartphone size={12} /> SMS OTP
                </button>
              </div>

              {/* Email Form */}
              {otpMode === 'email' && (
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="maria@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md"
                  >
                    {loading ? 'Sending Code...' : 'Request Verification Code'}
                  </button>
                </form>
              )}

              {/* SMS Form */}
              {otpMode === 'sms' && (
                <form onSubmit={handleSmsOtpSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Phone Number</label>
                    <div className="flex border border-zinc-800 rounded-xl overflow-hidden focus-within:border-[#C9A961]">
                      <span className="bg-zinc-900/60 border-r border-zinc-800 text-xs px-3.5 flex items-center text-zinc-400 font-bold">
                        +63
                      </span>
                      <input
                        required
                        type="tel"
                        placeholder="917 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-900/40 px-4 py-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md"
                  >
                    {loading ? 'Sending SMS...' : 'Request SMS OTP'}
                  </button>
                </form>
              )}

              {/* Social Login Separator */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-[1px] bg-zinc-900" />
                <span className="text-[8px] uppercase tracking-widest font-black text-zinc-650">OR CONNECT WITH</span>
                <div className="flex-1 h-[1px] bg-zinc-900" />
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('google')}
                  className="py-3 px-4 rounded-xl border border-zinc-850 bg-zinc-900/20 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-wider cursor-pointer"
                >
                  <Chrome size={12} className="text-zinc-400" /> Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('apple')}
                  className="py-3 px-4 rounded-xl border border-zinc-850 bg-zinc-900/20 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-wider cursor-pointer"
                >
                  <svg className="w-3 h-3 fill-zinc-400" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
                  </svg>
                  Apple
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
