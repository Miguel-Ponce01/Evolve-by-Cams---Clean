'use client';

import { useState, useMemo } from 'react';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  Calendar,
  CreditCard,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  PlusCircle
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import ProgressBar from '@/components/ui/ProgressBar';

export default function ClientDashboard() {
  const { 
    bookings, 
    transactions, 
    customers, 
    cancelBooking,
    addTransaction
  } = useBooking();

  const [demoStep, setDemoStep] = useState<number>(1);

  // Mock logged-in customer for demonstration purposes 
  // (In production, this is sourced from Supabase Auth state)
  const currentCustomer = useMemo(() => {
    return customers[0] || {
      id: 'cust-default',
      name: 'Maria Santos',
      email: 'maria.santos@gmail.com',
      phone: '0917-123-4567',
      credits: 12,
      tier: 'Premium Elite',
      tags: ['Regular', 'Yoga Fanatic']
    };
  }, [customers]);

  const customerBookings = useMemo(() => {
    return bookings.filter(b => b.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase());
  }, [bookings, currentCustomer]);

  const customerTransactions = useMemo(() => {
    return transactions.filter(t => t.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase());
  }, [transactions, currentCustomer]);

  // Top up modal/panel state
  const [topUpAmount, setTopUpAmount] = useState<number>(5);
  const [isProcessingTopUp, setIsProcessingTopUp] = useState<boolean>(false);
  const [topUpSuccess, setTopUpSuccess] = useState<boolean>(false);

  const handleTopUp = () => {
    setIsProcessingTopUp(true);
    setTopUpSuccess(false);

    // Call PayMongo endpoint (Simulated here)
    setTimeout(() => {
      setIsProcessingTopUp(false);
      setTopUpSuccess(true);
      
      // Mutate wallet state atomically on transaction completion
      currentCustomer.credits += topUpAmount;
      
      addTransaction({
        customerName: currentCustomer.name,
        customerEmail: currentCustomer.email,
        customerPhone: currentCustomer.phone,
        type: 'membership',
        description: `Wallet top-up (+${topUpAmount} Credits)`,
        paymentMethod: 'card',
        amount: topUpAmount * 250, // 250 PHP per credit
        status: 'paid',
        handledBy: 'PayMongo Gateway'
      });

      setTimeout(() => setTopUpSuccess(false), 4000);
    }, 1500);
  };

  const initials = currentCustomer.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const creditBundles = [
    { credits: 5,  label: 'Starter' },
    { credits: 10, label: 'Popular' },
    { credits: 20, label: 'Value' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-foreground">
      {/* ─── Top accent stripe ─────────────────────────────── */}
      <div className="h-[3px] bg-gradient-to-r from-[#7c8cf2] via-[#a78bfa] to-[#60a5fa]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Profile Hero ─────────────────────────────────── */}
        <div
          className="relative bg-white rounded-3xl overflow-hidden"
          style={{ border: '1px solid #E8EAF0', boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 24px rgba(124,140,242,0.07)' }}
        >
          {/* Decorative blob */}
          <div
            className="absolute top-0 right-0 w-80 h-56 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(124,140,242,0.1) 0%, transparent 65%)' }}
          />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 select-none"
                style={{
                  background: 'linear-gradient(135deg, #7c8cf2 0%, #a78bfa 100%)',
                  boxShadow: '0 4px 16px rgba(124,140,242,0.35)',
                }}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-[#111827]">
                  {currentCustomer.name}
                </h2>
                <p className="text-[13px] text-[#6B7280] mt-0.5">{currentCustomer.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                    style={{ background: 'rgba(124,140,242,0.1)', color: '#7c8cf2', border: '1px solid rgba(124,140,242,0.2)' }}
                  >
                    ✦ Premium Tier
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] font-medium">· Evolve Studio Member</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance chip */}
            <div
              className="flex items-center gap-4 rounded-2xl px-5 py-4 w-full md:w-auto"
              style={{ background: 'rgba(124,140,242,0.06)', border: '1px solid rgba(124,140,242,0.16)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,140,242,0.12)', color: '#7c8cf2' }}
              >
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] leading-none mb-1.5">
                  Wallet Balance
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-3xl font-black text-[#111827] leading-none"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {currentCustomer.credits}
                  </span>
                  <span className="text-sm font-bold text-[#7c8cf2]">Credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Grid ─────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Left col: Bookings Ledger ───────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,140,242,0.1)', color: '#7c8cf2' }}
                >
                  <Calendar size={14} />
                </div>
                <h3 className="text-[12px] font-black tracking-widest uppercase text-[#111827]">
                  My Booking Ledger
                </h3>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#F3F4F6', color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}
              >
                {customerBookings.length} Bookings
              </span>
            </div>

            {/* Empty state */}
            {customerBookings.length === 0 ? (
              <div
                className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                style={{ border: '1px solid #E8EAF0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: '#F3F4F6' }}
                >
                  <Clock size={24} className="text-[#D1D5DB]" />
                </div>
                <p className="text-[14px] font-bold text-[#374151]">No bookings yet</p>
                <p className="text-[12px] text-[#9CA3AF] mt-1 max-w-[200px]">
                  Book your first Pilates class on the Evolve calendar.
                </p>
                <a
                  href="/book"
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all duration-150 active:scale-[0.96]"
                  style={{
                    background: 'linear-gradient(135deg, #7c8cf2 0%, #a78bfa 100%)',
                    boxShadow: '0 2px 12px rgba(124,140,242,0.3)',
                  }}
                >
                  <Calendar size={13} />
                  Browse Classes
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {customerBookings.map((booking) => {
                  const isUpcoming  = booking.status === 'upcoming';
                  const isCancelled = booking.status === 'cancelled';
                  const isAttended  = booking.status === 'attended';

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200 hover:shadow-md group"
                      style={{ border: '1px solid #E8EAF0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ background: isAttended ? '#10B981' : isCancelled ? '#EF4444' : '#7c8cf2' }}
                        />
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[#111827] text-[14px] leading-none">Class Booking</span>
                            <span className="text-[11px] text-[#9CA3AF]">Spot #{booking.spotNumber}</span>
                          </div>
                          <div className="text-[11px] text-[#6B7280] space-y-0.5">
                            <p><span className="font-semibold text-[#374151]">ID:</span> <span className="font-mono">{booking.id}</span></p>
                            <p><span className="font-semibold text-[#374151]">Reserved:</span> {formatDate(booking.bookedAt)}</p>
                            <p><span className="font-semibold text-[#374151]">Payment:</span> <span className="uppercase font-bold text-[#7c8cf2]">{booking.paymentMethod}</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                            <XCircle size={10} /> Cancelled
                          </span>
                        )}
                        {isAttended && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                            style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                            <CheckCircle2 size={10} /> Attended
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                            style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                            <Clock size={10} /> Upcoming
                          </span>
                        )}
                        {isUpcoming && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-[0.96]"
                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right col: Top-up + Activity ─────────────────── */}
          <div className="space-y-5">

            {/* Top-up Panel */}
            <div
              className="bg-white rounded-3xl p-6 space-y-5"
              style={{ border: '1px solid #E8EAF0', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 24px rgba(124,140,242,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(124,140,242,0.1)', color: '#7c8cf2' }}
                >
                  <CreditCard size={14} />
                </div>
                <h3 className="text-[12px] font-black tracking-widest uppercase text-[#111827]">
                  Top Up Wallet
                </h3>
              </div>

              {/* Bundle selector */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Select Credit Bundle</p>
                <div className="grid grid-cols-3 gap-2">
                  {creditBundles.map(({ credits, label }) => {
                    const isSelected = topUpAmount === credits;
                    return (
                      <button
                        key={credits}
                        onClick={() => setTopUpAmount(credits)}
                        className="relative flex flex-col items-center py-3 px-2 rounded-2xl text-center transition-all duration-150 active:scale-[0.96]"
                        style={{
                          background: isSelected ? 'rgba(124,140,242,0.08)' : '#F9FAFB',
                          border: isSelected ? '1.5px solid rgba(124,140,242,0.5)' : '1.5px solid #E5E7EB',
                          boxShadow: isSelected ? '0 0 0 3px rgba(124,140,242,0.1)' : 'none',
                        }}
                      >
                        {label === 'Popular' && (
                          <span
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white whitespace-nowrap"
                            style={{ background: '#7c8cf2' }}
                          >
                            Popular
                          </span>
                        )}
                        <span
                          className="text-[15px] font-black"
                          style={{ color: isSelected ? '#7c8cf2' : '#111827', fontVariantNumeric: 'tabular-nums' }}
                        >
                          +{credits}
                        </span>
                        <span className="text-[10px] font-semibold mt-0.5" style={{ color: isSelected ? '#7c8cf2' : '#9CA3AF' }}>
                          Credits
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price summary card */}
              <div
                className="rounded-2xl p-4 text-center space-y-0.5"
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Total Amount Due</p>
                <p
                  className="text-3xl font-black text-[#111827]"
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}
                >
                  ₱{(topUpAmount * 250).toLocaleString()}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">₱250 per credit · via PayMongo</p>
              </div>

              {/* CTA */}
              <button
                onClick={handleTopUp}
                disabled={isProcessingTopUp}
                className="w-full py-3.5 rounded-2xl text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.96] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isProcessingTopUp
                    ? '#9CA3AF'
                    : 'linear-gradient(135deg, #7c8cf2 0%, #a78bfa 100%)',
                  boxShadow: isProcessingTopUp ? 'none' : '0 4px 16px rgba(124,140,242,0.35)',
                }}
              >
                {isProcessingTopUp ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <PlusCircle size={14} />
                    Buy Credits Now
                  </>
                )}
              </button>

              {topUpSuccess && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-[12px] font-semibold"
                  style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
                >
                  <CheckCircle2 size={14} />
                  Wallet top-up successful! Credits synced.
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div
              className="bg-white rounded-3xl p-6 space-y-4"
              style={{ border: '1px solid #E8EAF0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: '#F3F4F6', color: '#6B7280' }}
                >
                  <History size={14} />
                </div>
                <h3 className="text-[12px] font-black tracking-widest uppercase text-[#111827]">
                  Recent Activity
                </h3>
              </div>

              {customerTransactions.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: '#F3F4F6' }}
                  >
                    <History size={16} className="text-[#D1D5DB]" />
                  </div>
                  <p className="text-[12px] font-semibold text-[#6B7280]">No transactions yet</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">Your financial logs will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {customerTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-start gap-3 pb-3 border-b border-[#F3F4F6] last:border-0 last:pb-0"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: '#F0F0FF', color: '#7c8cf2' }}
                      >
                        <CreditCard size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-[12px] font-semibold text-[#374151] leading-snug">{tx.description}</p>
                          <span
                            className="text-[12px] font-black text-[#111827] whitespace-nowrap"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            ₱{tx.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-[#9CA3AF]">{formatDate(tx.timestamp)}</span>
                          <span
                            className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(124,140,242,0.08)', color: '#7c8cf2' }}
                          >
                            {tx.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ─── Stepper & Progress Showcase ────────────────── */}
        <div 
          className="bg-zinc-950 text-white rounded-3xl p-6 md:p-8 space-y-6 border border-zinc-800"
          style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9966] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF9966]">
                Evolve Studio Premium Design Library
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Interactive Stepper & Progress Library</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Here is a demonstration of the 4 dynamic progress bar styles implemented for the Evolve booking system. Click on the steps to see real-time state changes and transitions.
            </p>
          </div>

          {/* Controls to cycle step */}
          <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850 justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              Simulate Progress Steps (Current Index: <span className="font-mono text-[#FF9966] font-bold">{demoStep + 1} / 4</span>)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDemoStep(prev => Math.max(0, prev - 1))}
                disabled={demoStep === 0}
                className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-850 border border-zinc-700/60 rounded-xl text-[11px] font-bold uppercase transition-all select-none cursor-pointer"
              >
                Previous Step
              </button>
              <button
                type="button"
                onClick={() => setDemoStep(prev => Math.min(3, prev + 1))}
                disabled={demoStep === 3}
                className="px-3 py-1.5 bg-[#FF9966] hover:bg-[#FF8855] text-black disabled:opacity-40 disabled:hover:bg-[#FF9966] rounded-xl text-[11px] font-bold uppercase transition-all select-none cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* The variants grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Style 1: Dots / Circles Connect (Teal) */}
            <div className="space-y-2 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-900">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                <span>1. Dots Stepper</span>
                <span className="text-[#02C39A]">Teal Theme</span>
              </div>
              <ProgressBar
                steps={['Schedule', 'Details', 'Payment', 'Confirmed']}
                currentStep={demoStep}
                variant="dots"
                theme="teal"
                onStepClick={(_, idx) => setDemoStep(idx)}
              />
            </div>

            {/* Style 2: Capsule Blocks (Sunset) */}
            <div className="space-y-2 bg-zinc-900/40 p-5 rounded-2xl border border-[#222] flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2">
                <span>2. Connected Capsules</span>
                <span className="text-[#FF9966]">Sunset Theme</span>
              </div>
              <ProgressBar
                steps={['Cart', 'Shipping', 'Confirm']}
                currentStep={demoStep % 3}
                variant="capsules"
                theme="sunset"
                onStepClick={(_, idx) => setDemoStep(idx)}
              />
            </div>

            {/* Style 3: Percentage Progress Bar (Gold) */}
            <div className="space-y-2 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-900">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2">
                <span>3. Linear Percent Load</span>
                <span className="text-[#C9A961]">Gold Theme</span>
              </div>
              <ProgressBar
                steps={['Select Rig', 'Enter Info', 'Process Pay', 'Finished']}
                currentStep={demoStep}
                variant="percent"
                theme="gold"
              />
            </div>

            {/* Style 4: Circular Stepper Ring (Silver) */}
            <div className="space-y-2 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-900">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2">
                <span>4. Circular Ring</span>
                <span className="text-zinc-400">Silver Theme</span>
              </div>
              <ProgressBar
                steps={['Class Pick', 'Waiver Check', 'Secure Checkout', 'Completed']}
                currentStep={demoStep}
                variant="circle"
                theme="silver"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
