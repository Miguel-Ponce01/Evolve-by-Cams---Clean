'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  ArrowLeft, Mail, ShieldAlert, CheckCircle, Chrome, Key, Eye, EyeOff, User, X 
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const supabase = createClient();
  const modalRef = useRef<HTMLDivElement>(null);

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'sent' | 'reset'>('login');
  const [loginMethod, setLoginMethod] = useState<'magic_link' | 'sms_otp' | 'password'>('magic_link');
  const [studentType, setStudentType] = useState<'new' | 'existing' | 'session'>('new');
  
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

  // Reset inputs when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpSent(false);
      setName('');
      setEmail('');
      setPhone('');
      setOtpToken('');
      setPassword('');
      setConfirmPassword('');
      setAgreeTerms(false);
      setAuthMode('login');
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otpToken,
      type: 'sms',
    });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Successfully authenticated!');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Bypassing / Simulation for test credentials
    if (email.trim() === 'admin@crtl.com' && password === 'admin123') {
      document.cookie = 'evolve-admin-session=true; path=/; max-age=86400';
      document.cookie = 'evolve-staff-session=true; path=/; max-age=86400';
      localStorage.setItem('evolve-admin-session', 'true');
      localStorage.setItem('evolve-staff-session', 'true');
      setSuccessMsg('Admin session authenticated! Redirecting to Portal...');
      setLoading(false);
      setTimeout(() => {
        onClose();
        window.location.href = '/portal';
      }, 800);
      return;
    }

    if (email.trim() === 'teststudent@evolve.studio' && password === 'password123') {
      localStorage.setItem('evolve_mock_user', JSON.stringify({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'teststudent@evolve.studio',
        user_metadata: {
          full_name: 'Test Student'
        }
      }));
      setSuccessMsg('Successfully authenticated!');
      setLoading(false);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Successfully authenticated!');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1000);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Connection error. Please try logging in with admin@crtl.com / admin123.');
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
      setPassword('');
    }
  };

  const handleAdminSimulation = () => {
    document.cookie = "evolve-staff-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem('evolve-staff-session');

    document.cookie = "evolve-admin-session=true; path=/; max-age=3600";
    localStorage.setItem('evolve-admin-session', 'true');

    setSuccessMsg('Logged in as Administrator!');
    setTimeout(() => {
      onClose();
      window.location.replace('/portal');
    }, 1000);
  };

  const handleStaffSimulation = () => {
    document.cookie = "evolve-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem('evolve-admin-session');

    document.cookie = "evolve-staff-session=true; path=/; max-age=3600";
    localStorage.setItem('evolve-staff-session', 'true');

    setSuccessMsg('Logged in as Staff member!');
    setTimeout(() => {
      onClose();
      window.location.replace('/portal');
    }, 1000);
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

  const switchMode = (mode: typeof authMode) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAuthMode(mode);
    setOtpSent(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Centered Modal Card */}
      <div 
        ref={modalRef}
        className="w-full max-w-[460px] bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left text-white"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-805 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X size={15} />
        </button>

        {/* Glow effects inside card */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF5E62]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#C9A961]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Form Header */}
        <div className="space-y-2 text-center mb-6 pr-4">
          <h2 className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#C9A961]">
            Welcome to the Tribe
          </h2>
          <h1 className="text-xl font-serif tracking-[0.06em] text-white leading-tight uppercase">
            Evolve Studio Auth
          </h1>
          <p className="text-[9px] text-zinc-500 font-medium leading-relaxed max-w-[280px] mx-auto">
            Authenticate to manage bookings, purchases, and track sessions.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/20 border border-red-900/40 flex items-start gap-2 text-red-200 text-[11px]">
            <ShieldAlert size={14} className="text-red-400 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex flex-col gap-2 text-emerald-200 text-[11px]">
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {/* OAuth Buttons - rendered on Login & Signup */}
        {(authMode === 'login' || authMode === 'signup') && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-850 bg-[#1C1C1C] hover:bg-zinc-900 hover:border-zinc-700 transition-all flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-wider cursor-pointer text-white"
            >
              <Chrome size={11} className="text-[#C9A961]" /> Sign In with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-zinc-900" />
              <span className="text-[8px] uppercase tracking-widest font-black text-zinc-650">OR</span>
              <div className="flex-1 h-[1px] bg-zinc-900" />
            </div>
          </div>
        )}

        {/* Form Content depending on mode */}
        {authMode === 'login' && (
          <div className="space-y-3">
            {/* Login Tab Selector */}
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-850 gap-1 mt-2 mb-2">
              {['magic_link', 'sms_otp', 'password'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => { setLoginMethod(method as any); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-1.5 text-[8px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer ${
                    loginMethod === method ? 'bg-[#C9A961] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {method === 'magic_link' ? 'Email Link' : method === 'sms_otp' ? 'SMS OTP' : 'Password'}
                </button>
              ))}
            </div>

            {loginMethod === 'magic_link' && (
              <form onSubmit={handleMagicLinkSignIn} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="maria@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-3 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Sending link...' : 'Send Magic Link'}
                </button>
              </form>
            )}

            {loginMethod === 'sms_otp' && !otpSent && (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+639151833369"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-3 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Sending code...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {loginMethod === 'sms_otp' && otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider text-center block">Enter 6-Digit Code</label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all text-center tracking-widest text-lg font-bold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-3 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Verifying...' : 'Verify & Log In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpToken(''); setErrorMsg(null); setSuccessMsg(null); }}
                  className="w-full text-center text-[8px] uppercase font-bold text-zinc-550 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Change Phone Number
                </button>
              </form>
            )}

            {loginMethod === 'password' && (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="maria@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Password</label>
                    <button 
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[8px] uppercase font-bold text-[#C9A961] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-zinc-550 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Logging in...' : 'Continue'}
                </button>
              </form>
            )}

            <p className="text-center text-[9px] text-zinc-400 mt-3">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => switchMode('signup')}
                className="text-[#C9A961] font-bold hover:underline uppercase cursor-pointer"
              >
                Sign Up
              </button>
            </p>

            <div className="h-[1px] bg-zinc-900/80 my-4" />
            <div className="space-y-2">
              <span className="text-[8px] uppercase tracking-widest font-mono text-zinc-550 font-bold block text-center">Staff & Admin Access</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdminSimulation}
                  className="flex-1 py-2 rounded-xl border border-zinc-800 hover:border-[#C9A961]/40 hover:text-[#C9A961] text-zinc-400 font-bold uppercase text-[8px] tracking-wider transition-all cursor-pointer text-center"
                >
                  Admin Portal
                </button>
                <button
                  type="button"
                  onClick={handleStaffSimulation}
                  className="flex-1 py-2 rounded-xl border border-zinc-800 hover:border-[#C9A961]/40 hover:text-[#C9A961] text-zinc-400 font-bold uppercase text-[8px] tracking-wider transition-all cursor-pointer text-center"
                >
                  Staff Portal
                </button>
              </div>
            </div>
          </div>
        )}

        {authMode === 'signup' && (
          <div className="space-y-3 mt-2">
            {/* Student Type tab selector */}
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-850 gap-1 mb-1">
              {['new', 'existing', 'session'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStudentType(t as any)}
                  className={`flex-1 py-1.5 text-[8px] uppercase font-black tracking-wider rounded-lg transition-all cursor-pointer ${
                    studentType === t ? 'bg-[#C9A961] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t === 'new' ? 'New Student' : t === 'existing' ? 'Existing' : 'Session'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="Juan dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                  <User size={13} className="absolute right-3 top-3 text-zinc-550" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="juan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Enter Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-550 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1 select-none">
                <input
                  required
                  id="modal-agree-checkbox"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 accent-[#C9A961] cursor-pointer"
                />
                <label htmlFor="modal-agree-checkbox" className="text-[9px] text-zinc-400 leading-relaxed cursor-pointer">
                  I agree to the <Link href="/terms" onClick={onClose} className="text-[#C9A961] hover:underline">Terms</Link> and <Link href="/privacy" onClick={onClose} className="text-[#C9A961] hover:underline">Privacy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </button>
            </form>
            <p className="text-center text-[9px] text-zinc-400 mt-3">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => switchMode('login')}
                className="text-[#C9A961] font-bold hover:underline uppercase cursor-pointer"
              >
                Login
              </button>
            </p>
          </div>
        )}

        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-2">
            <p className="text-[11px] text-zinc-450 leading-relaxed text-center">
              We'll send you a link to reset your password.
            </p>

            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-zinc-450 tracking-wider">Enter Your Email</label>
              <input
                required
                type="email"
                placeholder="juan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C9A961] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest transition-all cursor-pointer shadow-md"
            >
              {loading ? 'Sending link...' : 'Email Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-center text-[9px] uppercase font-bold text-zinc-550 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={10} /> Back to Login
            </button>
          </form>
        )}

        {authMode === 'sent' && (
          <div className="space-y-4 mt-2 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-serif">Reset Link Sent</h3>
              <p className="text-[11px] text-zinc-450 leading-relaxed max-w-[240px] mx-auto">
                Check your email for the password reset link.
              </p>
            </div>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full text-center text-[9px] uppercase font-bold text-[#C9A961] hover:underline transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
