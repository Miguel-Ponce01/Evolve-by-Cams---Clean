'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Sliders, Settings, Plus, Play, RefreshCw, FileText, Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageModule {
  id: string;
  name: string;
  isActive: boolean;
  statusText: string;
  route: string;
  description: string;
}

export default function PageManagementOverview() {
  const [modules, setModules] = useState<PageModule[]>([
    {
      id: 'mod-book',
      name: 'Book Calendar Page',
      isActive: true,
      statusText: 'Active & Seeding',
      route: '/events',
      description: 'Public client scheduler showing upcoming group sessions, private classes, and booking widgets.'
    },
    {
      id: 'mod-test',
      name: 'Client Testimonials Panel',
      isActive: true,
      statusText: 'Active Mod',
      route: '/testimonials',
      description: 'Review stream detailing verified student ratings, discipline tags, and quotes.'
    },
    {
      id: 'mod-class',
      name: 'Classes Directory Grid',
      isActive: true,
      statusText: 'Online',
      route: '/classes',
      description: 'Responsive catalog showing training prices, duration details, and instructor lists.'
    },
    {
      id: 'mod-about',
      name: 'About Studio Story',
      isActive: false,
      statusText: 'Offline',
      route: '/about',
      description: 'Static history block detailing the co-founders, certifications, and studio history.'
    }
  ]);

  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleModule = (id: string) => {
    setModules(modules.map(m => {
      if (m.id === id) {
        const nextState = !m.isActive;
        triggerToast(`Module "${m.name}" ${nextState ? 'enabled' : 'disabled'}`);
        return { 
          ...m, 
          isActive: nextState,
          statusText: nextState ? 'Active' : 'Offline'
        };
      }
      return m;
    }));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] py-12 px-6 sm:px-8 font-sans relative z-10 selection:bg-[#C9A961] selection:text-black text-left animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-zinc-900 pb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Web Modules Registry</span>
            <h1 className="text-3xl font-serif font-light tracking-[0.1em] text-white">
              PAGE OVERVIEW &amp; CONTROLS
            </h1>
            <p className="text-xs text-zinc-550">Activate modules, inspect layouts, and supervise system interfaces in real-time.</p>
          </div>
          <button
            onClick={() => triggerToast('✓ Registered new module schema.')}
            className="px-6 py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus size={12} /> New Module
          </button>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
            <Check size={14} /> {toastMsg}
          </div>
        )}

        {/* Modules Table - Structured exactly like user screenshot */}
        <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Active Site Modules</h3>
            <span className="text-[9px] font-mono text-zinc-550 uppercase font-bold">4 Modules Listed</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-black/20">
            <table className="w-full text-xs" aria-label="Website Page modules and controls list">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 uppercase tracking-widest text-[9px] font-black">
                  <th className="text-left py-4 px-6">Name</th>
                  <th className="text-right py-4 px-6">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {modules.map(mod => (
                  <tr key={mod.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-6 text-left flex items-center gap-3">
                      {/* Active indicator dot */}
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full inline-block shrink-0",
                        mod.isActive ? "bg-emerald-500 shadow-sm shadow-emerald-500/20" : "bg-zinc-700"
                      )} />
                      <div>
                        <p className="font-bold text-white text-sm">{mod.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{mod.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 flex-wrap">
                        {/* Control 1: Use (Calendar icon) */}
                        <button
                          onClick={() => triggerToast(`Navigating to inspect: ${mod.route}`)}
                          className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-450 hover:text-white border border-zinc-900 hover:border-zinc-800 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Calendar size={12} className="text-[#C9A961]" />
                          Use
                        </button>
                        
                        {/* Control 2: Supervise (Sliders icon) */}
                        <button
                          onClick={() => handleToggleModule(mod.id)}
                          className={cn(
                            "px-3.5 py-2 border rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95",
                            mod.isActive 
                              ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                              : "bg-zinc-950/20 border-zinc-850 text-zinc-500 hover:text-zinc-400"
                          )}
                        >
                          <Sliders size={12} />
                          Supervise
                        </button>
                        
                        {/* Control 3: Configure (Settings icon) */}
                        <button
                          onClick={() => triggerToast(`Opening configuration for ${mod.name}`)}
                          className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-450 hover:text-white border border-zinc-900 hover:border-zinc-800 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Settings size={12} className="text-zinc-500" />
                          Configure
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
