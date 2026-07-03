'use client';

import React, { useState } from 'react';
import { Anchor } from 'lucide-react';

interface RosterRig {
  id: number;
  label: string;
  coords: string; // Spatial coordinates relative to floor grid
  status: 'AVAILABLE' | 'HELD' | 'CONFIRMED' | 'WAITLISTED';
  bookedByName?: string;
}

export default function RiggingMapRoster() {
  const [selectedRig, setSelectedRig] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Davao studio 5 fixed rigging points coordinates layout mapper
  const [rigs] = useState<RosterRig[]>([
    { id: 1, label: 'Hook A (Front Left)', coords: 'col-start-1 row-start-1', status: 'AVAILABLE' },
    { id: 2, label: 'Hook B (Front Right)', coords: 'col-start-3 row-start-1', status: 'CONFIRMED', bookedByName: 'Aimee S.' },
    { id: 3, label: 'Hook C (Center Center)', coords: 'col-start-2 row-start-2', status: 'AVAILABLE' },
    { id: 4, label: 'Hook D (Back Left)', coords: 'col-start-1 row-start-3', status: 'HELD' },
    { id: 5, label: 'Hook E (Back Right)', coords: 'col-start-3 row-start-3', status: 'CONFIRMED', bookedByName: 'Chloe M.' },
  ]);

  const handleSelectRig = (id: number) => {
    const rig = rigs.find(r => r.id === id);
    if (rig?.status === 'CONFIRMED' || rig?.status === 'HELD') return;
    setSelectedRig(id);
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto rounded-3xl border transition-colors ${
      isDarkMode ? 'bg-[#121212] border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
    }`}>
      
      {/* Header controls */}
      <div className="flex justify-between items-center border-b pb-4 mb-6 border-zinc-200 dark:border-zinc-850">
        <div>
          <span className="text-[9px] uppercase tracking-widest font-black text-zinc-400">Fixed Point Rig Roster</span>
          <h2 className="text-xl font-black font-serif uppercase tracking-tight">Evolve Davao Studio Floor</h2>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
        >
          {isDarkMode ? 'Light UI' : 'Dark UI'}
        </button>
      </div>

      {/* ── Floor Map Grid (Desktop / Spatial view) ── */}
      <div className="hidden md:block border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 p-8 rounded-2xl relative h-[400px] w-full">
        <div className="grid grid-cols-3 grid-rows-3 gap-12 w-full h-full max-w-2xl mx-auto">
          {rigs.map(rig => {
            const isHeld = rig.status === 'HELD';
            const isConfirmed = rig.status === 'CONFIRMED';
            const isSelected = selectedRig === rig.id;

            return (
              <button
                key={rig.id}
                onClick={() => handleSelectRig(rig.id)}
                disabled={isConfirmed || isHeld}
                type="button"
                className={`
                  ${rig.coords} min-h-[80px] p-4 flex flex-col items-center justify-center 
                  rounded-2xl border-2 transition-all cursor-pointer font-bold relative active:scale-[0.97]
                  ${
                    isConfirmed 
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-800'
                      : isHeld 
                      ? 'bg-zinc-100 text-zinc-400 border-zinc-250 border-dashed cursor-not-allowed dark:bg-zinc-900 dark:border-zinc-800'
                      : isSelected
                      ? 'bg-[#1264a3] text-white border-[#1264a3]'
                      : 'bg-white text-zinc-800 border-zinc-350 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                  }
                `}
              >
                <div className="absolute top-2 left-2 text-[9px] font-mono tracking-widest uppercase">Rig #{rig.id}</div>
                <Anchor size={18} className="mt-1" />
                <span className="text-[10px] mt-1.5 uppercase font-mono tracking-wider">
                  {isConfirmed ? rig.bookedByName : isHeld ? 'HELD' : 'AVAILABLE'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile Fallback list (Mobile Touch compliant targets min-h-[48px]) ── */}
      <div className="md:hidden space-y-3">
        {rigs.map(rig => {
          const isHeld = rig.status === 'HELD';
          const isConfirmed = rig.status === 'CONFIRMED';
          const isSelected = selectedRig === rig.id;

          return (
            <button
              key={rig.id}
              onClick={() => handleSelectRig(rig.id)}
              disabled={isConfirmed || isHeld}
              className={`
                w-full min-h-[56px] px-5 py-3 rounded-2xl border flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer
                ${
                  isConfirmed
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                    : isHeld
                    ? 'bg-zinc-50 border-dashed border-zinc-200 dark:bg-zinc-900/50 text-zinc-400'
                    : isSelected
                    ? 'bg-[#1264a3] border-[#1264a3] text-white'
                    : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-850 dark:text-zinc-100 hover:border-black'
                }
              `}
            >
              <div className="flex items-center gap-3 font-semibold">
                <Anchor size={16} />
                <div>
                  <p className="text-xs uppercase font-mono font-black">Rigging Point #{rig.id}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-medium">{rig.label}</p>
                </div>
              </div>

              <span className="text-[10px] uppercase font-black tracking-widest">
                {isConfirmed ? `Booked by ${rig.bookedByName}` : isHeld ? 'HOLD (Intake)' : isSelected ? 'Selected' : 'Select Spot'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Footer (48px Touch compliant Slacc pill CTA) */}
      <div className="mt-8 flex items-center justify-between border-t pt-4 border-zinc-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-400">
          Selected Rig: <span className="text-black dark:text-white font-black">{selectedRig ? `#${selectedRig}` : 'None'}</span>
        </p>
        <button
          disabled={!selectedRig}
          className="min-h-[48px] px-8 py-3 bg-[#1264a3] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-all active:scale-[0.97] hover:brightness-105 cursor-pointer disabled:cursor-not-allowed shadow-md"
        >
          Confirm Rig Assignment
        </button>
      </div>

    </div>
  );
}
