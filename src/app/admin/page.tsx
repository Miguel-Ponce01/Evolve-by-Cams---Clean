'use client';

import { useState, useEffect } from 'react';
import AdminPortal from '../portal/page';
import { Shield, Key, Loader2, AlertCircle } from 'lucide-react';

import { notFound } from 'next/navigation';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Trigger Next.js 404 if accessed via the public root domain
      const isSub = hostname.startsWith('pos.') || hostname.startsWith('admin.');
      if (!isSub) {
        notFound();
        return;
      }

      const isAuth = document.cookie.includes('evolve-admin-session=true') || 
                     localStorage.getItem('evolve-admin-session') === 'true';
      setIsAuthenticated(isAuth);
      setHydrated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate authentication
    setTimeout(() => {
      if (email === 'admin@crtl.com' && password === 'admin123') {
        document.cookie = "evolve-admin-session=true; path=/; max-age=3600";
        localStorage.setItem('evolve-admin-session', 'true');
        setIsAuthenticated(true);
      } else {
        setError('Invalid admin credentials. Access Denied.');
      }
      setLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    document.cookie = "evolve-admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    localStorage.removeItem('evolve-admin-session');
    setIsAuthenticated(false);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A961]" size={32} />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="relative">
        {/* Logout header banner */}
        <div className="bg-[#111111] border-b border-zinc-800 px-6 py-3 flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-mono">SESSION: ACTIVE ADMIN CONTROL MODE</span>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-all cursor-pointer"
          >
            Exit Portal
          </button>
        </div>
        <AdminPortal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center px-4 font-sans relative">
      {/* Sunset gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-[#FF5E62]/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#C9A961]/15 flex items-center justify-center border border-[#C9A961]/30 mb-4">
            <Shield size={22} className="text-[#C9A961]" />
          </div>
          <h1 className="text-xl font-light tracking-[0.25em] font-serif text-white uppercase">
            EVOLVE CONSOLE
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#C9A961] font-mono mt-1">
            System Control Center
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@crtl.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ color: '#ffffff' }}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
              Security Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ color: '#ffffff' }}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] transition-all"
              />
              <Key size={14} className="absolute right-4 top-3.5 text-zinc-600" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C9A961] hover:bg-[#b09352] disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#C9A961]/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Access Control</span>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-zinc-900 pt-6 text-center">
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-mono">
            SECURE AUDIT CONTROL ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}
