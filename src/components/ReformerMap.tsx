'use client';

import React, { useState } from 'react';
import { useTerminalSync } from '@/hooks/useTerminalSync';

interface Reformer {
  id: string;
  name: string;
  isOccupied: boolean;
}

export default function ReformerMap({ classId }: { classId: string }) {
  // Mock internal state representing 6 physical Pilates reformers
  const [reformers, setReformers] = useState<Reformer[]>([
    { id: 'ref-1', name: 'Reformer 1', isOccupied: false },
    { id: 'ref-2', name: 'Reformer 2', isOccupied: true },
    { id: 'ref-3', name: 'Reformer 3', isOccupied: false },
    { id: 'ref-4', name: 'Reformer 4', isOccupied: false },
    { id: 'ref-5', name: 'Reformer 5', isOccupied: true },
    { id: 'ref-6', name: 'Reformer 6', isOccupied: false },
  ]);

  // Wire up cross-tab synchronization listener
  const { broadcastChange } = useTerminalSync((incomingData) => {
    if (incomingData.payload.classId !== classId) return;

    setReformers((prev) =>
      prev.map((ref) => {
        if (ref.id === incomingData.payload.reformerId) {
          return { ...ref, isOccupied: incomingData.type === 'REFORMER_BOOKED' };
        }
        return ref;
      })
    );
  });

  const toggleReformer = (id: string, currentlyOccupied: boolean) => {
    const nextState = !currentlyOccupied;
    
    // Update Local UI State
    setReformers((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, isOccupied: nextState } : ref))
    );

    // Broadcast change across tabs instantly
    broadcastChange(
      nextState ? 'REFORMER_BOOKED' : 'REFORMER_RELEASED',
      classId,
      id
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-[#f4ede4] rounded-2xl shadow-xs">
      <h2 className="text-xl md:text-2xl font-bold text-[#4a154b] tracking-tight mb-4 text-center">
        Live Reformer Occupancy Map
      </h2>

      {/* Tailwind v4 Fluid Grid Layout matching Slacc theme */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
        {reformers.map((reformer) => (
          <button
            key={reformer.id}
            onClick={() => toggleReformer(reformer.id, reformer.isOccupied)}
            type="button"
            /* 
              Meets 48x48px touch-target rule (min-h-[72px]) 
              Ensures zero breaking layout constraints via fluid flex tracking
            */
            className={`
              min-h-[72px] p-4 flex flex-col items-center justify-center 
              font-semibold transition-all duration-200 cursor-pointer select-none
              rounded-2xl border-2 active:scale-[0.98]
              ${
                reformer.isOccupied
                  ? 'bg-[#4a154b] text-[#f9f0ff] border-[#4a154b]'
                  : 'bg-white text-[#4a154b] border-[#4a154b]/20 hover:border-[#4a154b]'
              }
            `}
          >
            <span className="text-sm tracking-wide">{reformer.name}</span>
            <span className={`text-xs mt-1 font-medium opacity-80`}>
              {reformer.isOccupied ? 'Occupied (Tap to Release)' : 'Available (Tap to Book)'}
            </span>
          </button>
        ))}
      </div>

      {/* Slacc Custom Pill Call-to-Action conforming to touch boundaries */}
      <div className="mt-8 flex justify-center">
        <button className="px-8 py-3 bg-[#1264a3] text-white font-semibold rounded-full shadow-md hover:bg-[#1264a3]/90 transition-all active:scale-[0.97] min-h-[48px]">
          Proceed with Selection
        </button>
      </div>
    </div>
  );
}
