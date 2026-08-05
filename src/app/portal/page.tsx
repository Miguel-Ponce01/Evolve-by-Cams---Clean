'use client';

import { useState, useMemo, Suspense } from 'react';
import { useBooking } from '@/context/BookingContext';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Sliders,
  DollarSign,
  Tv,
  PlusCircle,
  MinusCircle,
  Activity,
  UserCheck,
  Edit3,
  QrCode,
  Search,
  ShoppingCart,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import POSOverrideBridge from '@/components/admin/POSOverrideBridge';

// Custom operations tabs
import ExecutiveDashboard from '@/components/admin/ExecutiveDashboard';
import ClientDirectoryTable from '@/components/admin/ClientDirectoryTable';
import CustomerProgressCard from '@/components/admin/CustomerProgressCard';
import OnlineStoreManager from '@/components/admin/OnlineStoreManager';
import ReportsSuite from '@/components/admin/ReportsSuite';
import MarketingInvites from '@/components/admin/MarketingInvites';

import type { FitnessClass } from '@/types';

function PortalContent() {
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
    checkInBooking
  } = useBooking();

  const searchParams = useSearchParams();
  const portalTab = (searchParams.get('tab') || 'overview') as
    | 'overview'
    | 'directory'
    | 'progress'
    | 'store'
    | 'reports'
    | 'marketing'
    | 'console'
    | 'timetable';

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
  const [onlineTerminals] = useState<Array<{ name: string; status: 'online' | 'offline'; ip: string }>>([
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

    addOrUpdateCustomer({
      ...activeCustomer,
      credits: Math.max(0, activeCustomer.credits + finalAmount)
    });

    addTransaction({
      customerName: activeCustomer.name,
      customerEmail: activeCustomer.email,
      customerPhone: activeCustomer.phone || '',
      type: 'membership',
      description: `${overrideDescription} (${type === 'add' ? '+' : '-'}${amount} Credits)`,
      paymentMethod: 'credit',
      amount: 0,
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
      setTimeout(() => setQrScanSuccess(''), 4000);
    } else {
      setQrScanError(res.message);
      setTimeout(() => setQrScanError(''), 4000);
    }
  };

  const liveTickerActivities = useMemo(() => {
    return transactions.slice(0, 10).map(t => ({
      id: t.id,
      time: t.timestamp,
      message: `${t.customerName} - ${t.description}`,
      type: t.type
    }));
  }, [transactions]);

  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F3] font-sans flex-1 min-w-0 p-6 sm:p-8 space-y-8 overflow-y-auto">
      {portalTab === 'overview' && (
        <ExecutiveDashboard
          customersCount={customers.length}
          classesCount={classes.length}
          bookingsCount={bookings.length}
          totalRevenue={totalRevenue}
        />
      )}

      {portalTab === 'directory' && (
        <ClientDirectoryTable
          customers={customers}
          onAdjustCredits={(id, delta, note) => {
            const cust = customers.find(c => c.id === id);
            if (cust) {
              addOrUpdateCustomer({
                ...cust,
                credits: Math.max(0, cust.credits + delta)
              });
            }
          }}
        />
      )}

      {portalTab === 'progress' && <CustomerProgressCard customers={customers} />}

      {portalTab === 'store' && <OnlineStoreManager />}

      {portalTab === 'reports' && <ReportsSuite />}

      {portalTab === 'marketing' && <MarketingInvites />}

      {/* POS Console Tab */}
      {portalTab === 'console' && (
        <div className="grid lg:grid-cols-12 gap-8 text-left">
          {/* POS Cart & Items selection (Col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Walk-in Form */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-[#C9A961]">
                  <Calendar size={18} />
                  WALK-IN QUICK BOOKING FORM
                </h3>
                <span className="text-[10px] text-zinc-550 font-mono">12% VAT Applied</span>
              </div>

              <form onSubmit={handleWalkInBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">Choose Class</label>
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

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Total Clients</span>
                <p className="text-xl font-black text-white tabular-nums">{customers.length}</p>
              </div>
              <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Total Bookings</span>
                <p className="text-xl font-black text-[#C9A961] tabular-nums">{bookings.length}</p>
              </div>
              <div className="bg-[#121212] border border-zinc-900 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-550 uppercase tracking-wider font-bold">Live Classes</span>
                <p className="text-xl font-black text-white tabular-nums">{classes.length}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            {/* Entrance Scanner */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-[#C9A961]">
                  <QrCode size={18} />
                  ENTRANCE QR SCANNER
                </h3>
              </div>

              <form onSubmit={handleQrScanSubmit} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Scan or Enter Booking ID..."
                    value={qrScanInput}
                    onChange={(e) => setQrScanInput(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#C9A961] rounded-sm font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C9A961] hover:bg-[#b09352] text-black text-[10px] font-black uppercase tracking-widest rounded-sm transition-all"
                >
                  Verify Ticket &amp; Check In
                </button>
              </form>

              {qrScanError && <div className="p-3 bg-red-950/20 text-red-400 rounded-lg text-[10px]">⚠️ {qrScanError}</div>}
              {qrScanSuccess && <div className="p-3 bg-emerald-950/20 text-emerald-400 rounded-lg text-[10px]">✓ {qrScanSuccess}</div>}
            </div>

            {/* Live Terminals */}
            <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2 text-white">
                <Tv size={18} className="text-[#C9A961]" />
                LIVE CDO TERMINALS
              </h3>
              <div className="space-y-4">
                {onlineTerminals.map((terminal, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-[#1C1C1C] border border-zinc-800 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-white">{terminal.name}</p>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{terminal.ip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", terminal.status === 'online' ? "bg-[#C9A961] animate-pulse" : "bg-zinc-700")} />
                      <span className="text-[10px] uppercase font-black text-zinc-400">{terminal.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS Override / Roster Fallback (Timetable Grid placeholder) */}
      {portalTab === 'timetable' && (
        <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 space-y-6 text-left">
          <h3 className="text-base font-black uppercase tracking-widest text-[#C9A961]">
            TIMETABLE &amp; SCHEDULER MATRIX
          </h3>
          <POSOverrideBridge 
            classes={classes} 
            onConfirmOverride={handleSocialMediaOverride} 
          />
        </div>
      )}
    </div>
  );
}

export default function AdminPortal() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading portal operations...</div>}>
      <PortalContent />
    </Suspense>
  );
}
