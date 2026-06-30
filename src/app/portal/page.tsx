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
  UserPlus
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { AICopilotDrawer } from '@/components/layout/AICopilotDrawer';

export default function AdminPortal() {
  const {
    customers,
    transactions,
    bookings,
    classes,
    addTransaction
  } = useBooking();

  // Selected client for manual balance override
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [creditAdjustment, setCreditAdjustment] = useState<number>(1);
  const [overrideDescription, setOverrideDescription] = useState<string>('Staff credit override');
  
  // Real-time terminal status (Sync simulator)
  const [onlineTerminals, setOnlineTerminals] = useState<Array<{ name: string; status: 'online' | 'offline'; ip: string }>>([
    { name: 'Front Desk Kiosk iPad', status: 'online', ip: '192.168.1.102' },
    { name: 'Instructor Roster View (Sarah)', status: 'online', ip: '192.168.1.144' },
    { name: 'Admin Portal (This session)', status: 'online', ip: '192.168.1.100' },
    { name: 'Studio Booking Tablet', status: 'offline', ip: '192.168.1.105' }
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
    <div className="min-h-screen bg-white text-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#7c8cf2] flex items-center gap-2">
              ADMIN CONTROL CENTER
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Evolve Pilates POS system-wide audit, overrides, and live terminal synchronization.</p>
          </div>
          <Badge className="bg-[#7c8cf2]/10 border border-[#7c8cf2]/20 text-[#7c8cf2] text-[10px] font-black uppercase flex items-center gap-1.5 px-3 py-1 bg-white">
            <ShieldAlert size={12} /> System Administrator Mode
          </Badge>
        </div>

        {/* Dashboard Grid split */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left Column (Overrides / Calculator) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Manual Balance Override */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-[#7c8cf2]">
                <Sliders size={18} />
                MANUAL CREDIT OVERRIDE
              </h3>
              
              <div className="space-y-4">
                {/* Select Customer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Client</label>
                  <select 
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7c8cf2] text-zinc-800 font-semibold"
                  >
                    <option value="">-- Choose Client Profile --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email}) — Balance: {c.credits} Credits
                      </option>
                    ))}
                  </select>
                </div>

                {activeCustomer && (
                  <div className="bg-[#EEF2FF] border border-zinc-200 p-4 rounded-2xl flex justify-between items-center animate-fade-in">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Client Name</span>
                      <p className="text-sm font-black text-black">{activeCustomer.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Current Wallet</span>
                      <p className="text-sm font-black text-[#7c8cf2] text-right">{activeCustomer.credits} Credits</p>
                    </div>
                  </div>
                )}

                {/* Adjustments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Credit Count</label>
                    <input 
                      type="number"
                      min={1}
                      value={creditAdjustment}
                      onChange={(e) => setCreditAdjustment(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7c8cf2] text-black font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Log Description</label>
                    <input 
                      type="text"
                      value={overrideDescription}
                      onChange={(e) => setOverrideDescription(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7c8cf2] text-zinc-700 font-semibold"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => handleAdjustBalance('add')}
                    disabled={!selectedCustomerId}
                    className="py-3 px-4 rounded-xl bg-[#7c8cf2] hover:bg-[#6c7ef0] disabled:opacity-30 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <PlusCircle size={14} /> Add Credits
                  </button>
                  <button
                    onClick={() => handleAdjustBalance('deduct')}
                    disabled={!selectedCustomerId || (activeCustomer ? activeCustomer.credits < creditAdjustment : true)}
                    className="py-3 px-4 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-30 text-red-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                  >
                    <MinusCircle size={14} /> Deduct Credits
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#EEF2FF] border border-zinc-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Clients</span>
                <p className="text-xl font-black text-[#7c8cf2]">{customers.length}</p>
              </div>
              <div className="bg-[#EEF2FF] border border-zinc-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Total Bookings</span>
                <p className="text-xl font-black text-[#7c8cf2]">{bookings.length}</p>
              </div>
              <div className="bg-[#EEF2FF] border border-zinc-200 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Live Classes</span>
                <p className="text-xl font-black text-[#7c8cf2]">{classes.length}</p>
              </div>
            </div>

          </div>

          {/* Right Column (Presence & Live Ticker) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Terminal Realtime Presence */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-zinc-800">
                <Tv size={18} className="text-[#7c8cf2]" />
                LIVE TERMINALS
              </h3>

              <div className="space-y-4">
                {onlineTerminals.map((terminal, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-center p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-800 leading-relaxed">{terminal.name}</p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{terminal.ip}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        terminal.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"
                      )} />
                      <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">
                        {terminal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Ticker */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2 text-zinc-800">
                <Activity size={18} className="text-[#7c8cf2]" />
                ACTIVITY TICKER
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {liveTickerActivities.map((act) => (
                  <div 
                    key={act.id}
                    className="border-b border-zinc-100 pb-3.5 last:border-b-0 last:pb-0 space-y-1 animate-fade-in"
                  >
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>{formatDate(act.time)}</span>
                      <span className="uppercase text-[#7c8cf2] font-bold">{act.type}</span>
                    </div>
                    <p className="text-xs text-zinc-700 font-semibold leading-relaxed">
                      {act.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
      <AICopilotDrawer />
    </div>
  );
}
