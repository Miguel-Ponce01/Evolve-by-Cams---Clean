'use client';

import React, { useState } from 'react';
import {
  Award,
  Star,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  User,
  Sparkles,
  Printer,
  ChevronRight
} from 'lucide-react';
import type { Customer } from '@/types';

interface ActivityItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  stars: number; // 0 to 3
}

interface LevelModule {
  level: 'Basics' | 'Intermediate' | 'Professional';
  title: string;
  unlocked: boolean;
  requiredStars: number;
  activities: ActivityItem[];
}

interface CustomerProgressCardProps {
  customers: Customer[];
}

export default function CustomerProgressCard({ customers }: CustomerProgressCardProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  
  // Progress tracker state per level
  const [modules, setModules] = useState<LevelModule[]>([
    {
      level: 'Basics',
      title: 'Level 1: Foundational Reformer & Alignment',
      unlocked: true,
      requiredStars: 0,
      activities: [
        { id: 'b1', name: 'Footwork Series (V-Position, Arches, Heels)', category: 'Reformer Fundamentals', completed: true, stars: 3 },
        { id: 'b2', name: 'Pelvic Bridging & Core Stabilization', category: 'Reformer Fundamentals', completed: true, stars: 3 },
        { id: 'b3', name: 'Mid-Back Arm Straps Flow', category: 'Upper Body Alignment', completed: true, stars: 3 },
      ]
    },
    {
      level: 'Intermediate',
      title: 'Level 2: Dynamic Strength & Control',
      unlocked: true, // unlocked because Level 1 has 3 stars on all activities
      requiredStars: 9,
      activities: [
        { id: 'i1', name: 'Short Box Series (Flat Back, Round Back, Tree)', category: 'Core & Flexion', completed: true, stars: 2 },
        { id: 'i2', name: 'Long Stretch & Elephant', category: 'Full Body Control', completed: false, stars: 1 },
        { id: 'i3', name: 'Plank & Kneeling Abdominal Series', category: 'Core Endurance', completed: false, stars: 0 },
      ]
    },
    {
      level: 'Professional',
      title: 'Level 3: Advanced Athletic Reformer Flow',
      unlocked: false, // Locked until Level 2 reaches 9 stars total
      requiredStars: 9,
      activities: [
        { id: 'p1', name: 'Teaser on Reformer Carriage', category: 'Mastery Balance', completed: false, stars: 0 },
        { id: 'p2', name: 'Snake & Twist Series', category: 'Rotational Strength', completed: false, stars: 0 },
        { id: 'p3', name: 'Full Inversion Cadillac Walkover', category: 'High-Level Athletics', completed: false, stars: 0 },
      ]
    }
  ]);

  const selectedClient = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleToggleActivity = (levelIndex: number, actId: string) => {
    setModules(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as LevelModule[];
      const mod = next[levelIndex];
      const act = mod.activities.find(a => a.id === actId);
      if (act) {
        act.completed = !act.completed;
        if (!act.completed) {
          act.stars = 0;
        } else if (act.stars === 0) {
          act.stars = 1;
        }
      }

      // Check level 2 unlock condition (level 1 stars total >= 9)
      const lvl1Stars = next[0].activities.reduce((acc, curr) => acc + curr.stars, 0);
      next[1].unlocked = lvl1Stars >= 9;

      // Check level 3 unlock condition (level 2 stars total >= 9)
      const lvl2Stars = next[1].activities.reduce((acc, curr) => acc + curr.stars, 0);
      next[2].unlocked = lvl2Stars >= 9;

      return next;
    });
  };

  const handleSetStars = (levelIndex: number, actId: string, starsCount: number) => {
    setModules(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as LevelModule[];
      const mod = next[levelIndex];
      const act = mod.activities.find(a => a.id === actId);
      if (act) {
        act.stars = starsCount;
        act.completed = starsCount > 0;
      }

      // Re-evaluate unlock states
      const lvl1Stars = next[0].activities.reduce((acc, curr) => acc + curr.stars, 0);
      next[1].unlocked = lvl1Stars >= 9;

      const lvl2Stars = next[1].activities.reduce((acc, curr) => acc + curr.stars, 0);
      next[2].unlocked = lvl2Stars >= 9;

      return next;
    });
  };

  const calculateTotalStars = () => {
    return modules.reduce(
      (acc, mod) => acc + mod.activities.reduce((a, act) => a + act.stars, 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141416] p-6 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#C9A961]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A961]">
              Member Progress & Report Card
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Customer Centricity & Skill Tracker</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Track reformer exercise checklists, rate performance stars, and auto-unlock advanced modules.
          </p>
        </div>

        {/* Member selector */}
        <div className="flex items-center gap-3">
          <User size={16} className="text-zinc-400" />
          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C9A961] font-semibold"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Report Summary Banner */}
      {selectedClient && (
        <div className="bg-gradient-to-r from-zinc-900 via-[#18181b] to-black p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A961]/15 border border-[#C9A961]/30 flex items-center justify-center text-[#C9A961] font-black text-xl font-serif">
              {selectedClient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{selectedClient.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30">
                  {selectedClient.membershipTier || 'Standard'} Member
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedClient.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-zinc-900/90 px-4 py-2.5 rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-mono">Total Stars Earned</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-base font-bold text-white font-mono">{calculateTotalStars()} / 27</span>
              </div>
            </div>

            <div className="bg-zinc-900/90 px-4 py-2.5 rounded-xl border border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-mono">Highest Unlocked Level</p>
              <p className="text-xs font-bold text-emerald-400 font-mono mt-1">
                {modules[2].unlocked ? 'Professional' : modules[1].unlocked ? 'Intermediate' : 'Basics'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-6">
        {modules.map((mod, modIdx) => (
          <div
            key={mod.level}
            className={`p-6 rounded-2xl border transition-all ${
              mod.unlocked
                ? 'bg-[#141416] border-zinc-800 shadow-md'
                : 'bg-zinc-950/60 border-zinc-900 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    mod.unlocked
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  }`}
                >
                  {mod.unlocked ? <Unlock size={18} /> : <Lock size={18} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{mod.title}</span>
                    {!mod.unlocked && (
                      <span className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                        Requires 9 Stars on previous level to unlock
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Progress: {mod.activities.filter(a => a.completed).length} / {mod.activities.length} Activities Completed
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Checklists */}
            <div className="space-y-3">
              {mod.activities.map(act => (
                <div
                  key={act.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    mod.unlocked ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-900/20 border-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      disabled={!mod.unlocked}
                      onClick={() => handleToggleActivity(modIdx, act.id)}
                      className="text-zinc-400 hover:text-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      {act.completed ? (
                        <CheckSquare size={20} className="text-emerald-400" />
                      ) : (
                        <Square size={20} className="text-zinc-600" />
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold ${act.completed ? 'text-white' : 'text-zinc-400'}`}>
                        {act.name}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono">{act.category}</span>
                    </div>
                  </div>

                  {/* Interactive Star Rating */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono">Proficiency:</span>
                    <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800">
                      {[1, 2, 3].map(starNum => (
                        <button
                          key={starNum}
                          disabled={!mod.unlocked}
                          onClick={() => handleSetStars(modIdx, act.id, starNum)}
                          className="cursor-pointer disabled:cursor-not-allowed transition-transform hover:scale-110"
                        >
                          <Star
                            size={16}
                            className={
                              starNum <= act.stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-700'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
