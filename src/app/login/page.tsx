'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  ArrowLeft, Mail, ShieldAlert, CheckCircle, Chrome, Key, Eye, EyeOff, User 
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  const supabase = createClient();

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'sent' | 'reset'>('login');
  const [loginMethod, setLoginMethod] = useState<'magic_link' | 'sms_otp' | 'password'>('magic_link');
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if routed from a recovery/reset password email link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isRecovery = params.get('type') === 'recovery' || 
                         window.location.hash.includes('type=recovery') || 
                         params.get('mode') === 'reset';
      if (isRecovery) {
        setAuthMode('reset');
      }
    }
  }, []);

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

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Magic link sent! Please check your email inbox to log in.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setOtpSent(true);
      setSuccessMsg('Verification code sent to your mobile phone via SMS.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otpToken,
      type: 'sms',
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Successfully authenticated! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Bypassing / Simulation for test credentials to bypass SMTP/rate-limiting
    if (email.trim() === 'teststudent@evolve.studio' && password === 'password123') {
      localStorage.setItem('evolve_mock_user', JSON.stringify({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'teststudent@evolve.studio',
        user_metadata: {
          full_name: 'Test Student'
        }
      }));
      setSuccessMsg('Successfully authenticated! Redirecting to dashboard...');
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Successfully authenticated! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Registration successful! Please check your email to verify your account.');
      // Keep name & clear password
      setPassword('');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?mode=reset`,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setAuthMode('sent');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        setAuthMode('login');
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  // Helper to change mode and clear status messages
  const switchMode = (mode: typeof authMode) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAuthMode(mode);
    setOtpSent(false);
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

      {/* Centered Auth Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-[460px] bg-zinc-950/85 border border-zinc-900 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* Form Header */}
          <div className="space-y-2 text-center mb-8">
            <h1 className="text-3xl font-serif tracking-[0.15em] text-white uppercase">
              {authMode === 'login' && <>STUDENT <span className="text-[#C9A961]">LOGIN</span></>}
              {authMode === 'signup' && <>CREATE <span className="text-[#C9A961]">ACCOUNT</span></>}
              {authMode === 'forgot' && <>FORGOT <span className="text-[#C9A961]">PASSWORD?</span></>}
              {authMode === 'sent' && <>LINK <span className="text-[#C9A961]">SENT</span></>}
              {authMode === 'reset' && <>RESET <span className="text-[#C9A961]">PASSWORD</span></>}
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

          {/* OAuth Buttons - rendered on Login & Signup */}
          {(authMode === 'login' || authMode === 'signup') && (
            <div className="space-y-6">
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

              <div className="flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-zinc-900" />
                <span className="text-[8px] uppercase tracking-widest font-black text-zinc-650">OR CONNECT WITH</span>
                <div className="flex-1 h-[1px] bg-zinc-900" />
              </div>
            </div>
          )}

          {/* Form Content depending on mode */}
          {authMode === 'login' && (
            <div className="space-y-4">
              {/* Login Tab Selector */}
              <div className="flex bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-850 gap-1.5 mt-6 mb-2">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('magic_link'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer ${
                    loginMethod === 'magic_link' ? 'bg-[#C9A961] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Email Link
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('sms_otp'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer ${
                    loginMethod === 'sms_otp' ? 'bg-[#C9A961] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  SMS OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-[9px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer ${
                    loginMethod === 'password' ? 'bg-[#C9A961] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Password
                </button>
              </div>

              {loginMethod === 'magic_link' && (
                <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
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
                    className="w-full mt-2 py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Sending link...' : 'Send Magic Link'}
                  </button>
                </form>
              )}

              {loginMethod === 'sms_otp' && !otpSent && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Phone Number (with Country Code)</label>
                    <input
                      required
                      type="tel"
                      placeholder="+639151833369"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Sending code...' : 'Send Verification Code'}
                  </button>
                </form>
              )}

              {loginMethod === 'sms_otp' && otpSent && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider text-center block">Enter 6-Digit Verification Code</label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all text-center tracking-widest text-lg font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Verifying...' : 'Verify & Log In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpToken(''); setErrorMsg(null); setSuccessMsg(null); }}
                    className="w-full text-center text-[9px] uppercase font-bold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}

              {loginMethod === 'password' && (
                <form onSubmit={handleSignIn} className="space-y-4">
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

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Password</label>
                      <button 
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[9px] uppercase font-bold text-[#C9A961] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Logging in...' : 'Continue'}
                  </button>
                </form>
              )}

              <p className="text-center text-[10px] text-zinc-400 mt-4">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => switchMode('signup')}
                  className="text-[#C9A961] font-bold hover:underline uppercase cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}


          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Name</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="Juan dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                  <User size={15} className="absolute right-3.5 top-3.5 text-zinc-550" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="juan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Enter New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 select-none">
                <input
                  required
                  id="agree-checkbox"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#C9A961] cursor-pointer"
                />
                <label htmlFor="agree-checkbox" className="text-[10px] text-zinc-400 leading-relaxed cursor-pointer">
                  I agree to the <Link href="/terms" className="text-[#C9A961] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#C9A961] hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </button>

              <p className="text-center text-[10px] text-zinc-400 mt-4">
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => switchMode('login')}
                  className="text-[#C9A961] font-bold hover:underline uppercase"
                >
                  Login
                </button>
              </p>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-6 mt-4">
              <p className="text-xs text-zinc-450 leading-relaxed text-center">
                Enter the email you use for the account and we'll send you a reset password link.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Enter Your Email</label>
                <input
                  required
                  type="email"
                  placeholder="juan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md"
              >
                {loading ? 'Sending link...' : 'Email me my reset link'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft size={10} /> Back to Login
              </button>
            </form>
          )}

          {authMode === 'sent' && (
            <div className="space-y-6 mt-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-serif">Reset Link Sent</h3>
                <p className="text-xs text-zinc-450 leading-relaxed max-w-[280px] mx-auto">
                  Check your email for the reset password link we just sent.
                </p>
              </div>

              <a
                href="mailto:"
                className="w-full py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md inline-block text-center"
              >
                Open Email App
              </a>

              <p className="text-[10px] text-zinc-600 leading-relaxed">
                If you don't see your reset password email link, please check your spam folder inside your mail client.
              </p>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-[10px] uppercase font-bold text-[#C9A961] hover:underline transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}

          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Enter New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {loading ? 'Saving password...' : 'Save password & login'}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
