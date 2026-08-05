'use client';

import React from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  MapPin,
  Dumbbell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  CreditCard,
  Building2,
  Sparkles
} from 'lucide-react';

interface ExecutiveDashboardProps {
  customersCount: number;
  classesCount: number;
  bookingsCount: number;
  totalRevenue: number;
}

export default function ExecutiveDashboard({
  customersCount,
  classesCount,
  bookingsCount,
  totalRevenue
}: ExecutiveDashboardProps) {
  const formatPHP = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="space-[#1a1a1a] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#C9A961]" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961]">
              System Operations Hub
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Executive Studio Overview</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time operational measurements across Davao outlets, equipment utilization, and finances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700/60 text-right">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">System Status</p>
            <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              100% Operational
            </p>
          </div>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-[#141416] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{formatPHP(totalRevenue || 188500)}</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-medium">
            <TrendingUp size={14} />
            <span>+14.2% from last month</span>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-[#141416] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Members</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{customersCount || 128} Clients</p>
          <p className="text-xs text-zinc-500 mt-2 font-mono">94% Active Retention Rate</p>
        </div>

        {/* Bookings & Capacity */}
        <div className="bg-[#141416] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{bookingsCount || 342} Sessions</p>
          <p className="text-xs text-purple-400 mt-2 font-mono">88% Reformer Bed Occupancy</p>
        </div>

        {/* Active Classes */}
        <div className="bg-[#141416] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all shadow-md">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Classes</span>
            <div className="w-9 h-9 rounded-xl bg-[#C9A961]/10 border border-[#C9A961]/20 flex items-center justify-center text-[#C9A961]">
              <Activity size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">{classesCount || 24} Weekly Slots</p>
          <p className="text-xs text-zinc-500 mt-2 font-mono">4 Core Instructors</p>
        </div>
      </div>

      {/* Operational Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outlets & Reformer Equipment Status */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#C9A961]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Outlets & Equipment</h3>
            </div>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded">Davao Main</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <Dumbbell size={16} className="text-emerald-400" />
                <div>
                  <p className="font-semibold text-white">Allegro Reformers (12 Units)</p>
                  <p className="text-[10px] text-zinc-400">Main Reformer Studio</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">10 In-Use</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <Dumbbell size={16} className="text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Cadillac & Wunda Chairs</p>
                  <p className="text-[10px] text-zinc-400">Private Suite</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">4 Ready</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#C9A961]" />
                <div>
                  <p className="font-semibold text-white">Next Maintenance Window</p>
                  <p className="text-[10px] text-zinc-400">Sanitization & Spring checks</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-400">Aug 15, 2026</span>
            </div>
          </div>
        </div>

        {/* Studio Holidays & Appointment Availability */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Holidays & Slots</h3>
            </div>
            <span className="text-[10px] bg-purple-500/10 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-500/20">Schedule Sync</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Ninoy Aquino Day (Holiday)</p>
                <p className="text-[10px] text-zinc-400">Aug 21, 2026 • Studio Closed</p>
              </div>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Upcoming</span>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">National Heroes Day</p>
                <p className="text-[10px] text-zinc-400">Aug 31, 2026 • Reduced Hours</p>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">Special Time</span>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Prime Private Slots Left</p>
                <p className="text-[10px] text-zinc-400">This Week Available</p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">6 Slots</span>
            </div>
          </div>
        </div>

        {/* Active Price Plans & Client Tiers */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Price Plans</h3>
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-500/20">4 Active Tiers</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
              <div>
                <p className="font-semibold text-white">88 Session Intensive Pack</p>
                <p className="text-[10px] text-zinc-400">₱8,800 • Best Seller</p>
              </div>
              <span className="font-mono text-zinc-300 font-bold">42 Subscribed</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
              <div>
                <p className="font-semibold text-white">Davao Group Class Pass</p>
                <p className="text-[10px] text-zinc-400">₱1,000 / Session</p>
              </div>
              <span className="font-mono text-zinc-300 font-bold">58 Subscribed</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
              <div>
                <p className="font-semibold text-white">Annual VIP Membership</p>
                <p className="text-[10px] text-zinc-400">₱1,500 Registration</p>
              </div>
              <span className="font-mono text-zinc-300 font-bold">28 Subscribed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
