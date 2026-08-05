'use client';

import { useState, useEffect } from 'react';
import { Settings, Type, Sparkles, Save, Check, Monitor, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

import { applyStoredSettings } from '@/lib/themeSettings';

export default function SettingsPage() {
  const [theme,            setTheme]            = useState<'dark' | 'light' | 'minimalist'>('dark');
  const [fontSize,         setFontSize]         = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [bookingWidgetMode, setBookingWidgetMode] = useState<'button' | 'frame'>('button');
  const [showSavedToast,   setShowSavedToast]   = useState(false);

  // Load saved settings and immediately apply them
  useEffect(() => {
    const savedTheme  = (localStorage.getItem('evolve_settings_theme')        || 'dark')   as typeof theme;
    const savedFont   = (localStorage.getItem('evolve_settings_font')         || 'normal') as typeof fontSize;
    const savedMode   = (localStorage.getItem('evolve_settings_booking_mode') || 'button') as typeof bookingWidgetMode;
    setTheme(savedTheme);
    setFontSize(savedFont);
    setBookingWidgetMode(savedMode);
    applyStoredSettings();
  }, []);

  const handleSave = () => {
    localStorage.setItem('evolve_settings_theme',        theme);
    localStorage.setItem('evolve_settings_font',         fontSize);
    localStorage.setItem('evolve_settings_booking_mode', bookingWidgetMode);
    applyStoredSettings();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const handleReset = () => {
    localStorage.removeItem('evolve_settings_theme');
    localStorage.removeItem('evolve_settings_font');
    localStorage.removeItem('evolve_settings_booking_mode');
    setTheme('dark');
    setFontSize('normal');
    setBookingWidgetMode('button');
    applyStoredSettings();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] py-12 px-6 sm:px-8 font-sans relative z-10 selection:bg-[#C9A961] selection:text-black text-left animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Header */}
        <div className="border-b border-zinc-900 pb-8 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Preferences &amp; Customization</span>
            <h1 className="text-3xl font-serif font-light tracking-[0.1em] text-white mt-1">
              SYSTEM SETTINGS
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Adjust font readability scale, colors, and layout theme customization presets.</p>
          </div>
          <Settings size={28} className="text-[#C9A961] animate-spin-slow shrink-0" />
        </div>

        <div className="space-y-8">

          {/* Theme Preset */}
          <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <Sparkles size={16} className="text-[#C9A961]" />
                Color Theme Preset
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Choose the color palette for your admin panel and portal consoles.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { id: 'dark',       title: 'Premium Dark',    desc: 'Classic Evolve sleek layout (Gold & Black)',       preview: 'bg-zinc-950 border-zinc-800' },
                { id: 'light',      title: 'Aesthetic Light', desc: 'Soft whites, gray accents, and dark fonts',        preview: 'bg-white border-zinc-300' },
                { id: 'minimalist', title: 'Minimalist Gray', desc: 'Monochrome slate layout with high clarity',        preview: 'bg-zinc-700 border-zinc-500' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'p-5 rounded-2xl border text-left flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.98]',
                    theme === t.id
                      ? 'bg-[#C9A961]/10 border-[#C9A961] text-[#C9A961]'
                      : 'bg-black/20 border-zinc-900 text-zinc-400 hover:border-zinc-700'
                  )}
                >
                  {/* Colour swatch preview */}
                  <span className={cn('w-full h-6 rounded-lg border', t.preview)} />
                  <span className="text-xs font-black uppercase tracking-wider block">{t.title}</span>
                  <span className="text-[10px] leading-relaxed text-zinc-500">{t.desc}</span>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-zinc-600 font-mono italic">
              * Theme changes apply to the admin sidebar and surface backgrounds. Click Save to activate.
            </p>
          </div>

          {/* Font Scale */}
          <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <Type size={16} className="text-[#C9A961]" />
                Typography &amp; Font Size
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Upscale the base font scale for better reading. Helpful for users with visual difficulties.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { id: 'normal', title: 'Standard (100%)', scale: '16px base size' },
                { id: 'large',  title: 'Large (112.5%)',  scale: '18px base size' },
                { id: 'xlarge', title: 'Extra Large (125%)', scale: '20px base size' },
              ] as const).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFontSize(f.id)}
                  className={cn(
                    'p-5 rounded-2xl border text-left flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.98]',
                    fontSize === f.id
                      ? 'bg-[#C9A961]/10 border-[#C9A961] text-[#C9A961]'
                      : 'bg-black/20 border-zinc-900 text-zinc-400 hover:border-zinc-700'
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-wider block">{f.title}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{f.scale}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Booking Widget Mode */}
          <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <Monitor size={16} className="text-[#C9A961]" />
                Booking Widget Integration Mode
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Choose how the booking system integrates on the public Book Calendar page.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { id: 'button', title: 'Button Trigger Modal',   desc: 'Shows class card with a "Book Now" action that triggers a modal overlay' },
                { id: 'frame',  title: 'Embedded Layout Frame',  desc: 'Renders the interactive booking flow directly inline as a page component' },
              ] as const).map(m => (
                <button
                  key={m.id}
                  onClick={() => setBookingWidgetMode(m.id)}
                  className={cn(
                    'p-5 rounded-2xl border text-left flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.98]',
                    bookingWidgetMode === m.id
                      ? 'bg-[#C9A961]/10 border-[#C9A961] text-[#C9A961]'
                      : 'bg-black/20 border-zinc-900 text-zinc-400 hover:border-zinc-700'
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-wider block">{m.title}</span>
                  <span className="text-[10px] leading-relaxed text-zinc-500">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              id="btn-save-settings"
              onClick={handleSave}
              className="px-8 py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 cursor-pointer shadow-md transition-colors active:scale-95"
            >
              <Save size={12} /> Save Settings
            </button>

            <button
              id="btn-reset-settings"
              onClick={handleReset}
              className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold uppercase text-[9px] tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
            >
              <RefreshCw size={12} /> Reset to Defaults
            </button>

            {showSavedToast && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold animate-in fade-in duration-300">
                <Check size={14} /> Settings applied!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
