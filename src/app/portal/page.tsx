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
  Edit3,
  QrCode,
  Search
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import POSOverrideBridge from '@/components/admin/POSOverrideBridge';

export default function AdminPortal() {
  const {
    customers,
    transactions,
    bookings,
    classes,
    addTransaction,
    addOrUpdateCustomer,
    bookSpot,
    testimonials,
    updateTestimonial,
    confirmBooking,
    checkInBooking
  } = useBooking();

  // Selected client for manual balance override
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [creditAdjustment, setCreditAdjustment] = useState<number>(1);
  const [overrideDescription, setOverrideDescription] = useState<string>('Staff credit override');

  // Walk-in Quick Booking Form State
  const [walkInClassId, setWalkInClassId] = useState<string>('');
  const [walkInClientName, setWalkInClientName] = useState<string>('');
  const [walkInClientEmail, setWalkInClientEmail] = useState<string>('');
  const [walkInClientPhone, setWalkInClientPhone] = useState<string>('');
  const [walkInPaymentMethod, setWalkInPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [walkInSpotNumber, setWalkInSpotNumber] = useState<number>(1);

  const availableSpotsForSelectedClass = useMemo(() => {
    const cls = classes.find(c => c.id === walkInClassId);
    if (!cls) return [];
    const spots = [];
    for (let s = 1; s <= cls.totalSpots; s++) {
      if (!cls.bookedSpots.includes(s)) {
        spots.push(s);
      }
    }
    return spots;
  }, [classes, walkInClassId]);

  const handleWalkInBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInClassId || !walkInClientName || !walkInClientEmail) {
      alert("Please fill in the class, client name, and email.");
      return;
    }

    const res = bookSpot(
      walkInClassId,
      walkInSpotNumber,
      walkInPaymentMethod,
      walkInClientName,
      walkInClientEmail,
      walkInClientPhone || undefined,
      undefined,
      'Staff Walk-in Console'
    );

    if (res.success) {
      alert(`Walk-in request logged as PENDING for Spot #${walkInSpotNumber}.`);
      // Reset form
      setWalkInClientName('');
      setWalkInClientEmail('');
      setWalkInClientPhone('');
      setWalkInClassId('');
    } else {
      alert(`Booking failed: ${res.message}`);
    }
  };
  
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

  const handleSocialMediaOverride = (data: {
    clientName: string;
    email: string;
    paymentChannel: string;
    refNum: string;
    classId: string;
    screenshotUrl?: string;
  }) => {
    let client = customers.find(c => c.email.toLowerCase() === data.email.toLowerCase());
    if (!client) {
      client = addOrUpdateCustomer({
        name: data.clientName,
        email: data.email,
        credits: 1,
        membershipTier: 'Single Session',
        tags: ['Social Media Intake']
      });
    } else {
      addOrUpdateCustomer({
        ...client,
        credits: Math.max(client.credits, 1)
      });
    }

    const targetClass = classes.find(c => c.id === data.classId);
    const spotNumber = targetClass ? (targetClass.bookedSpots?.length || 0) + 1 : 1;

    const bookingResult = bookSpot(
      data.classId,
      spotNumber,
      'cash',
      data.clientName,
      data.email,
      client.phone || '',
      undefined,
      'Social Media Intake Override',
      0
    );

    if (bookingResult.success) {
      addTransaction({
        customerName: data.clientName,
        customerEmail: data.email,
        customerPhone: client.phone || '',
        type: 'membership',
        description: `Social Media Override: Spot #${spotNumber} in ${targetClass?.title || 'Class'} (${data.paymentChannel} Ref: ${data.refNum})`,
        paymentMethod: 'credit',
        amount: 0,
        status: 'paid',
        handledBy: 'Cams Rivera'
      });
    } else {
      alert(`Override Booking Failed: ${bookingResult.message}`);
    }
  };

  // QR Scan Check-In state
  const [qrScanInput, setQrScanInput] = useState<string>('');
  const [qrScanError, setQrScanError] = useState<string>('');
  const [qrScanSuccess, setQrScanSuccess] = useState<string>('');

  const handleQrScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQrScanError('');
    setQrScanSuccess('');

    if (!qrScanInput) return;

    const res = checkInBooking(qrScanInput);
    if (res.success) {
      setQrScanSuccess(res.message);
      setQrScanInput('');
      // Clear alerts after a few seconds
      setTimeout(() => setQrScanSuccess(''), 4000);
    } else {
      setQrScanError(res.message);
      setTimeout(() => setQrScanError(''), 4000);
    }
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

            {/* Social Media Intake Bridge / Override */}
            <POSOverrideBridge classes={classes} onConfirmOverride={handleSocialMediaOverride} />

            {/* Booking Requests Manager */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-[#C9A961]">
                  <Activity size={18} />
                  BOOKING REQUESTS MANAGER
                </h3>
                <Badge className="bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] text-[10px] font-bold">
                  {bookings.filter(b => b.status === 'pending').length} PENDING
                </Badge>
              </div>

              {/* Pending Bookings List */}
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'pending').length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono text-center py-4">NO PENDING BOOKING REQUESTS</p>
                ) : (
                  bookings.filter(b => b.status === 'pending').map(b => {
                    const cls = classes.find(c => c.id === b.classId);
                    return (
                      <div key={b.id} className="p-4 bg-[#1C1C1C] border border-zinc-850 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                              {b.paymentMethod === 'credit' ? 'CREDIT' : b.paymentMethod.toUpperCase()}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-2">{b.customerName}</h4>
                            <p className="text-xs text-zinc-500 font-mono">{b.customerEmail}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#C9A961] font-mono block">Spot #{b.spotNumber}</span>
                            <span className="text-xs font-bold text-white font-mono">
                              {b.paymentMethod === 'credit' ? '1 Credit' : `₱${b.amountPaid}`}
                            </span>
                          </div>
                        </div>

                        {cls && (
                          <div className="p-2.5 bg-zinc-900/50 rounded-lg text-xs space-y-1">
                            <p className="font-bold text-zinc-300">{cls.title}</p>
                            <p className="text-zinc-500 font-mono text-[10px]">{formatDate(cls.date)} &bull; {cls.time} ({cls.instructor.name})</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              const res = confirmBooking(b.id);
                              if (res.success) {
                                alert(res.message);
                              } else {
                                alert(res.message);
                              }
                            }}
                            className="flex-1 py-2 bg-[#C9A961] hover:bg-[#b09352] text-black text-[10px] font-black uppercase tracking-widest rounded-sm transition-all"
                          >
                            Confirm Booking &amp; Payment
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Walk-in Registration form */}
              <div className="border-t border-zinc-900 pt-6 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-white">Create Walk-in Booking Request</h4>
                <form onSubmit={handleWalkInBooking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">Select Class</label>
                      <select
                        value={walkInClassId}
                        onChange={(e) => {
                          setWalkInClassId(e.target.value);
                          setWalkInSpotNumber(1);
                        }}
                        className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white px-3 py-2.5 focus:outline-none focus:border-[#C9A961] rounded-sm"
                      >
                        <option value="">-- Choose Class --</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.time} &bull; {formatDate(c.date)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">Rig/Mat Spot</label>
                      <select
                        value={walkInSpotNumber}
                        onChange={(e) => setWalkInSpotNumber(parseInt(e.target.value) || 1)}
                        className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white px-3 py-2.5 focus:outline-none focus:border-[#C9A961] rounded-sm"
                        disabled={!walkInClassId}
                      >
                        {availableSpotsForSelectedClass.length === 0 ? (
                          <option value="">No spots available</option>
                        ) : (
                          availableSpotsForSelectedClass.map(s => (
                            <option key={s} value={s}>Spot #{s}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">Client Name</label>
                      <input
                        type="text"
                        required
                        value={walkInClientName}
                        onChange={(e) => setWalkInClientName(e.target.value)}
                        placeholder="e.g. Juan dela Cruz"
                        className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">Client Email</label>
                      <input
                        type="email"
                        required
                        value={walkInClientEmail}
                        onChange={(e) => setWalkInClientEmail(e.target.value)}
                        placeholder="e.g. juan@gmail.com"
                        className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">Payment Method</label>
                      <select
                        value={walkInPaymentMethod}
                        onChange={(e) => setWalkInPaymentMethod(e.target.value as any)}
                        className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white px-3 py-2 focus:outline-none focus:border-[#C9A961] rounded-sm"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="credit">Credit Balance</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-sm transition-all"
                  >
                    Submit Pending Walk-in Request
                  </button>
                </form>
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
            
            {/* Entrance Gate QR Scanner Console */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-[#C9A961]">
                  <QrCode size={18} />
                  ENTRANCE QR SCANNER
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Gate Attendance</span>
              </div>

              <p className="text-[10px] text-zinc-500">
                Scan client booking tickets or enter a Booking ID manually to instantly authorize attendance and log their check-in.
              </p>

              {/* ID Manual Entry Form */}
              <form onSubmit={handleQrScanSubmit} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Scan or Enter Booking ID (e.g. bk-1)..."
                    value={qrScanInput}
                    onChange={(e) => setQrScanInput(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#C9A961] rounded-sm font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C9A961] hover:bg-[#b09352] text-black text-[10px] font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer"
                >
                  Verify Ticket &amp; Check In
                </button>
              </form>

              {/* Feedbacks */}
              {qrScanError && (
                <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-[10px] leading-normal">
                  ⚠️ {qrScanError}
                </div>
              )}

              {qrScanSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-lg text-[10px] leading-normal">
                  ✓ {qrScanSuccess}
                </div>
              )}

              {/* Quick Scan Roster List */}
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Scan Simulator (Today's Roster)</h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {bookings.filter(b => b.status === 'upcoming' || b.status === 'booked').length === 0 ? (
                    <p className="text-[10px] text-zinc-600 font-mono text-center py-2">NO UNCLAIMED BOOKINGS TODAY</p>
                  ) : (
                    bookings.filter(b => b.status === 'upcoming' || b.status === 'booked').map(b => {
                      const cls = classes.find(c => c.id === b.classId);
                      return (
                        <div key={b.id} className="flex justify-between items-center p-2.5 bg-[#1C1C1C] border border-zinc-850 rounded-lg text-[10px]">
                          <div>
                            <p className="font-bold text-white">{b.customerName}</p>
                            <p className="text-zinc-500 font-mono text-[8px] mt-0.5">{cls?.title || 'Class'} (Spot #{b.spotNumber})</p>
                          </div>
                          <button
                            onClick={() => {
                              setQrScanInput(b.id);
                              // Trigger auto-submit simulation
                              setTimeout(() => {
                                const res = checkInBooking(b.id);
                                if (res.success) {
                                  setQrScanSuccess(res.message);
                                  setQrScanInput('');
                                  setTimeout(() => setQrScanSuccess(''), 4000);
                                } else {
                                  setQrScanError(res.message);
                                  setTimeout(() => setQrScanError(''), 4000);
                                }
                              }, 100);
                            }}
                            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-[#C9A961] border border-zinc-800 rounded font-black uppercase tracking-wider text-[8px] cursor-pointer"
                          >
                            Simulate Scan
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

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
