'use client';

import React, { useState } from 'react';
import {
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter,
  PieChart
} from 'lucide-react';

export default function ReportsSuite() {
  const [activeReportTab, setActiveReportTab] = useState<'financial' | 'managerial' | 'bookings' | 'clients'>('financial');
  const [timePeriod, setTimePeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');

  const formatPHP = (val: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  return (
    <div className="space-y-6">
      {/* Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141416] p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText size={20} className="text-purple-400" />
            <span>Executive Studio Reports Suite</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Financial analytics, managerial audits, booking metrics, and retention reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <select
            value={timePeriod}
            onChange={e => setTimePeriod(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#C9A961] font-mono"
          >
            <option value="monthly">Monthly Breakdown</option>
            <option value="quarterly">Quarterly Breakdown (Q1 - Q4)</option>
            <option value="annual">Annual Summary (2026)</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs for Reports */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveReportTab('financial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'financial'
              ? 'bg-[#C9A961] text-black shadow-lg shadow-[#C9A961]/10'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Financial Report
        </button>

        <button
          onClick={() => setActiveReportTab('managerial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'managerial'
              ? 'bg-[#C9A961] text-black shadow-lg shadow-[#C9A961]/10'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Managerial Report
        </button>

        <button
          onClick={() => setActiveReportTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'bookings'
              ? 'bg-[#C9A961] text-black shadow-lg shadow-[#C9A961]/10'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Bookings & QR Audit
        </button>

        <button
          onClick={() => setActiveReportTab('clients')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'clients'
              ? 'bg-[#C9A961] text-black shadow-lg shadow-[#C9A961]/10'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          Client Retention Report
        </button>
      </div>

      {/* Tab Content: Financial */}
      {activeReportTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#141416] p-5 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase font-mono">Gross Class Revenues</p>
              <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{formatPHP(485000)}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Class passes & session bundles</p>
            </div>
            <div className="bg-[#141416] p-5 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase font-mono">Merchandise & Retail Sales</p>
              <p className="text-2xl font-black text-blue-400 mt-1 font-mono">{formatPHP(64200)}</p>
              <p className="text-[10px] text-zinc-500 mt-1">Grip socks, chalk, towels & mats</p>
            </div>
            <div className="bg-[#141416] p-5 rounded-2xl border border-zinc-800">
              <p className="text-xs text-zinc-400 uppercase font-mono">Estimated VAT (12%)</p>
              <p className="text-2xl font-black text-purple-400 mt-1 font-mono">{formatPHP(65904)}</p>
              <p className="text-[10px] text-zinc-500 mt-1">PayMongo & Cash integrated</p>
            </div>
          </div>

          <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quarterly Revenue Breakdown (2026)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-300 font-bold">Q1 2026 (Jan - Mar)</span>
                <span className="text-emerald-400 font-bold">₱142,500</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-300 font-bold">Q2 2026 (Apr - Jun)</span>
                <span className="text-emerald-400 font-bold">₱188,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                <span className="text-zinc-300 font-bold">Q3 2026 (Jul - Sep)</span>
                <span className="text-emerald-400 font-bold">₱218,700 (Projected)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Managerial */}
      {activeReportTab === 'managerial' && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Instructor Utilization & Efficiency</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Camille Santos (Lead Instructor)</p>
                <p className="text-[10px] text-zinc-400">18 Sessions Conducted • 96% Fill Rate</p>
              </div>
              <span className="text-emerald-400 font-mono font-bold">High Performing</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Mark Rivera (Reformer Specialist)</p>
                <p className="text-[10px] text-zinc-400">14 Sessions Conducted • 90% Fill Rate</p>
              </div>
              <span className="text-blue-400 font-mono font-bold">Optimal</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Bookings */}
      {activeReportTab === 'bookings' && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bookings & Attendance Audit</h3>
          <p className="text-xs text-zinc-400">
            Total Completed Bookings: <strong className="text-white">312</strong> | Cancellations: <strong className="text-red-400">14</strong> | No-Shows: <strong className="text-amber-400">4</strong>
          </p>
        </div>
      )}

      {/* Tab Content: Clients */}
      {activeReportTab === 'clients' && (
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Client Retention & Acquisition</h3>
          <p className="text-xs text-zinc-400">
            Monthly New Client Sign-ups: <strong className="text-emerald-400">+28 Members</strong> | Repeat Pass Renewals: <strong className="text-purple-400">82%</strong>
          </p>
        </div>
      )}
    </div>
  );
}
