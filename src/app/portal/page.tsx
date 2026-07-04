'use client';

import { useState, useMemo, useEffect } from 'react';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ShieldAlert,
  Sliders,
  DollarSign,
  Tv,
  PlusCircle,
  MinusCircle,
  Activity,
  UserCheck,
  TrendingUp,
  UserPlus,
  Edit3
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminPortal() {
  const {
    customers,
    transactions,
    bookings,
    classes,
    addTransaction,
    testimonials,
    updateTestimonial
  } = useBooking();

  // Selected client for manual balance override
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [creditAdjustment, setCreditAdjustment] = useState<number>(1);
  const [overrideDescription, setOverrideDescription] = useState<string>('Staff credit override');
  
  // Real-time terminal status (Sync simulator)
  const [onlineTerminals, setOnlineTerminals] = useState<Array<{ name: string; status: 'online' | 'offline'; ip: string }>>([
    { name: 'Front Desk CDO iPad', status: 'online', ip: '192.168.1.102' },
    { name: 'Instructor Roster CDO (Tweety)', status: 'online', ip: '192.168.1.144' },
    { name: 'Admin Portal cd (This session)', status: 'online', ip: '192.168.1.100' },
    { name: 'CDO Booking Tablet', status: 'offline', ip: '192.168.1.105' }
  ]);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const handleAdjustBalance = (type: 'add' | 'deduct') => {
    if (!activeCustomer) return;

    const amount = creditAdjustment;
    const finalAmount = type === 'add' ? amount : -amount;
    
    // Perform update
    activeCustomer.credits = Math.max(0, activeCustomer.credits + finalAmount);

    addTransaction({
      customerName: activeCustomer.name,
      customerEmail: activeCustomer.email,
      customerPhone: activeCustomer.phone || '',
      type: 'membership',
      description: `${overrideDescription} (${type === 'add' ? '+' : '-'}${amount} Credits)`,
      paymentMethod: 'credit',
      amount: 0, // Staff override is free
      status: 'paid',
      handledBy: 'Cams Rivera'
    });

    setOverrideDescription('Staff credit override');
    setCreditAdjustment(1);
  };

  // Simulate active check-in logs and booking streams
  const liveTickerActivities = useMemo(() => {
    const list = transactions.slice(0, 10).map(t => ({
      id: t.id,
      time: t.timestamp,
      message: `${t.customerName} - ${t.description}`,
      type: t.type
    }));
    return list;
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] py-12 px-6 sm:px-8 font-sans relative z-10 selection:bg-[#C9A961] selection:text-black">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-light tracking-[0.1em] text-white flex items-center gap-3">
              EVOLVE <span className="text-[#C9A961] font-bold">CONTROL PANEL</span>
            </h1>
            <p className="text-xs text-zinc-500">System-wide admin POS audit, credits override, live synchronization, and testimonials management.</p>
          </div>
          <Badge className="bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5">
            <ShieldAlert size={12} /> System Administrator Mode
          </Badge>
        </div>

        {/* Dashboard Grid split */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left Column (Overrides / Calculator / Testimonials) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Manual Balance Override */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-[#C9A961]">
                <Sliders size={18} />
                MANUAL CREDIT OVERRIDE
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">Select Member</label>
                  <select 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-sm text-white px-3 py-2.5 focus:outline-none focus:border-[#C9A961] rounded-sm"
                  >
                    <option value="" className="bg-[#121212]">-- Choose Client --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#121212]">
                        {c.name} ({c.credits} cr)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">Credits Adjust Amount</label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={creditAdjustment} 
                    onChange={(e) => setCreditAdjustment(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-sm text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">Override Reason / Log Note</label>
                <input 
                  type="text" 
                  value={overrideDescription} 
                  onChange={(e) => setOverrideDescription(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-zinc-800 text-sm text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm"
                />
              </div>

              {activeCustomer && (
                <div className="p-4 bg-[#1C1C1C] border border-zinc-800 rounded-lg space-y-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Target Client Info</span>
                  <p className="text-sm font-bold text-white">{activeCustomer.name}</p>
                  <p className="text-xs text-[#C9A961]">Current: <span className="tabular-nums font-mono">{activeCustomer.credits}</span> Class Credits | Tier: {activeCustomer.membershipTier}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  disabled={!selectedCustomerId}
                  onClick={() => handleAdjustBalance('add')}
                  className="w-full py-3 bg-[#C9A961] hover:bg-[#b09352] disabled:opacity-30 disabled:hover:bg-[#C9A961] text-black text-xs font-black uppercase tracking-widest rounded-sm transition-transform active:scale-[0.96] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={14} /> Add Credits
                </button>
                <button
                  disabled={!selectedCustomerId}
                  onClick={() => handleAdjustBalance('deduct')}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 disabled:opacity-30 text-white text-xs font-black uppercase tracking-widest rounded-sm transition-transform active:scale-[0.96] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MinusCircle size={14} /> Deduct Credits
                </button>
              </div>
            </div>

            {/* Testimonials Management Console */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-[#C9A961]">
                  <Edit3 size={18} />
                  EDIT TESTIMONIALS
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Live Sync</span>
              </div>

              <div className="space-y-6">
                {testimonials.map((t, idx) => (
                  <div key={idx} className="p-4 bg-[#1C1C1C] border border-zinc-850 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-[#C9A961] tracking-widest font-mono">Testimonial Slot #{idx + 1}</span>
                      <div className="flex gap-0.5 text-[#C9A961]">
                        {[...Array(t.rating)].map((_, i) => (
                          <span key={i} className="text-xs">&#9733;</span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase tracking-wider block">Author Name</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => updateTestimonial(idx, { name: e.target.value })}
                          className="w-full bg-[#121212] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-500 uppercase tracking-wider block">Role / Membership</label>
                        <input
                          type="text"
                          value={t.role}
                          onChange={(e) => updateTestimonial(idx, { role: e.target.value })}
                          className="w-full bg-[#121212] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wider block">Testimonial Text</label>
                      <textarea
                        value={t.text}
                        rows={2}
                        onChange={(e) => updateTestimonial(idx, { text: e.target.value })}
                        className="w-full bg-[#121212] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Clients</span>
                <p className="text-xl font-black text-white tabular-nums">{customers.length}</p>
              </div>
              <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Bookings</span>
                <p className="text-xl font-black text-[#C9A961] tabular-nums">{bookings.length}</p>
              </div>
              <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Live Classes</span>
                <p className="text-xl font-black text-white tabular-nums">{classes.length}</p>
              </div>
            </div>

          </div>

          {/* Right Column (Presence & Live Ticker) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Terminal Realtime Presence */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <Tv size={18} className="text-[#C9A961]" />
                LIVE CDO TERMINALS
              </h3>

              <div className="space-y-4">
                {onlineTerminals.map((terminal, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-center p-3.5 bg-[#1C1C1C] border border-zinc-800 rounded-xl"
                  >
                    <div>
                      <p className="text-xs font-bold text-white leading-relaxed">{terminal.name}</p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{terminal.ip}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        terminal.status === 'online' ? "bg-[#C9A961] animate-pulse" : "bg-zinc-700"
                      )} />
                      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                        {terminal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Ticker */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <Activity size={18} className="text-[#C9A961]" />
                LIVE AUDIT TICKER
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {liveTickerActivities.map((act) => (
                  <div 
                    key={act.id}
                    className="border-b border-zinc-900 pb-3.5 last:border-b-0 last:pb-0 space-y-1"
                  >
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>{formatDate(act.time)}</span>
                      <span className="uppercase text-[#C9A961] font-bold">{act.type}</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
                      {act.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
