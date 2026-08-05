'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatDate, parseClassDateTime } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/custom-select';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Search, CheckCircle2, XCircle, Clock,
  Users, ChevronDown, Printer, AlertTriangle,
  UserCheck, ArrowUpCircle, ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FitnessClass } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  if (status === 'attended') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-950/20 text-emerald-400 border border-emerald-900/30">
      <CheckCircle2 size={9} /> Attended
    </span>
  );
  if (status === 'cancelled') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-950/20 text-red-400 border border-red-900/30">
      <XCircle size={9} /> Cancelled
    </span>
  );
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-950/20 text-amber-400 border border-amber-900/30">
      <Clock size={9} /> Pending Approval
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-950/20 text-sky-400 border border-sky-900/30">
      <Clock size={9} /> Upcoming
    </span>
  );
}

function PaymentPill({ method }: { method: string }) {
  const cfg: Record<string, string> = {
    cash:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    card:   'bg-sky-500/10 text-sky-400 border-sky-500/20',
    credit: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border', cfg[method] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700')}>
      {method}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function RosterPage() {
  const {
    classes, bookings, waitlist,
    checkInBooking, cancelBooking,
    promoteFromWaitlist,
    confirmBooking,
  } = useBooking();

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedClassId,    setSelectedClassId]    = useState<string>('');
  const [searchQuery,        setSearchQuery]        = useState('');
  const [toastMsg,           setToastMsg]           = useState('');
  const [toastType,          setToastType]          = useState<'success' | 'error'>('success');
  const [promotingEmail,     setPromotingEmail]     = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // BUILD CLASS SELECTOR (sorted by date then time, today first)
  // ─────────────────────────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().split('T')[0];

  const sortedClasses = useMemo(() =>
    [...classes].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    }),
  [classes]);

  const classOptions = useMemo(() => {
    const today   = sortedClasses.filter(c => c.date === todayStr);
    const future  = sortedClasses.filter(c => c.date > todayStr);
    const past    = sortedClasses.filter(c => c.date < todayStr);

    const makeOpt = (c: FitnessClass) => ({
      value: c.id,
      label: `${c.date === todayStr ? '📍 TODAY' : c.date < todayStr ? '⏪' : '📅'} ${formatDate(c.date)} · ${c.time} — ${c.title} (${c.instructor.name})`,
    });

    return [
      ...today.map(makeOpt),
      ...future.map(makeOpt),
      ...past.map(makeOpt),
    ];
  }, [sortedClasses, todayStr]);

  // ─────────────────────────────────────────────────────────────────────────
  // SELECTED CLASS DATA
  // ─────────────────────────────────────────────────────────────────────────

  const selectedClass = useMemo(
    () => classes.find(c => c.id === selectedClassId) ?? null,
    [classes, selectedClassId],
  );

  const rosterBookings = useMemo(() => {
    if (!selectedClassId) return [];
    return bookings
      .filter(b => b.classId === selectedClassId)
      .filter(b => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.spotNumber - b.spotNumber);
  }, [bookings, selectedClassId, searchQuery]);

  const waitlistEntries = useMemo(() => {
    if (!selectedClassId) return [];
    return waitlist.filter(w => w.classId === selectedClassId);
  }, [waitlist, selectedClassId]);

  const activeBookings   = rosterBookings.filter(b => b.status !== 'cancelled');
  const attendedCount    = rosterBookings.filter(b => b.status === 'attended').length;
  const upcomingCount    = rosterBookings.filter(b => b.status === 'upcoming').length;
  const cancelledCount   = rosterBookings.filter(b => b.status === 'cancelled').length;
  const occupancyPct     = selectedClass && selectedClass.totalSpots > 0
    ? Math.round((activeBookings.length / selectedClass.totalSpots) * 100)
    : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 4000);
  }

  function handleCheckIn(bookingId: string, name: string) {
    const result = checkInBooking(bookingId);
    if (result.success) {
      showToast(`✓ ${name} checked in successfully.`);
    } else {
      showToast(result.message, 'error');
    }
  }

  function handleMarkAllAttended() {
    let count = 0;
    rosterBookings.forEach(b => {
      if (b.status === 'upcoming') {
        checkInBooking(b.id);
        count++;
      }
    });
    showToast(`✓ Marked ${count} client(s) as attended.`);
  }

  function handlePromote(customerEmail: string, customerName: string) {
    setPromotingEmail(customerEmail);
    const result = promoteFromWaitlist(selectedClassId, customerEmail, 'credit');
    if (result.success) {
      showToast(`✓ ${customerName} promoted from waitlist and booked.`);
    } else {
      showToast(result.message, 'error');
    }
    setPromotingEmail(null);
  }

  function handlePrintRoster() {
    const printContent = document.getElementById('printable-roster')?.innerHTML;
    if (!printContent || !selectedClass) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Class Roster — ${selectedClass.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; color: #111; }
            h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; }
            .meta { color: #666; font-size: 11px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f4f4f4; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
            td { padding: 8px; border-bottom: 1px solid #eee; vertical-align: top; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; text-transform: uppercase; border: 1px solid #ddd; }
            .attended { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
            .upcoming { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
            .cancelled { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] py-12 px-6 sm:px-8 font-sans selection:bg-[#C9A961] selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
        <Link 
          href="/" 
          className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <span className="text-xs uppercase font-mono tracking-widest text-[#C9A961] font-bold">POS Administration</span>
          <h1 className="text-3xl font-serif font-light tracking-[0.1em] text-white">
            CLASS <span className="text-[#C9A961] font-bold">ROSTER &amp; CHECK-IN</span>
          </h1>
        </div>
      </div>

      {/* ── Toast ── */}
      {toastMsg && (
        <div className={cn(
          'p-3.5 rounded-xl border text-xs font-semibold animate-slide-up leading-relaxed',
          toastType === 'success'
            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
            : 'bg-red-950/20 border-red-900/30 text-red-400'
        )}>
          {toastMsg}
        </div>
      )}

      {/* ── Class Selector ── */}
      <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 shadow-xl">
        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3.5">
          Select a Class
        </label>
        <CustomSelect
          value={selectedClassId}
          onChange={setSelectedClassId}
          options={classOptions}
          placeholder="— Choose a class to view its roster —"
        />
      </div>

      {/* ── No class selected ── */}
      {!selectedClass && (
        <div className="bg-[#121212] border border-zinc-900 rounded-2xl text-center py-24 shadow-xl flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900/50 border border-zinc-850 flex items-center justify-center mb-4">
            <ClipboardList size={22} className="text-zinc-500" />
          </div>
          <p className="font-serif font-light text-lg uppercase tracking-wider text-white">No Class Selected</p>
          <p className="text-xs text-zinc-500 mt-2.5 max-w-xs leading-relaxed">
            Pick a class from the dropdown above to view the roster, check in clients, and manage the waitlist.
          </p>
        </div>
      )}

      {/* ── Class selected ── */}
      {selectedClass && (
        <>
          {/* Class Summary Card */}
          <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedClass.instructor.avatar}</span>
                  <div>
                    <h2 className="font-serif font-light text-xl uppercase tracking-wider text-white">{selectedClass.title}</h2>
                    <p className="text-xs text-zinc-500 font-medium">{selectedClass.instructor.name} · {selectedClass.type}</p>
                  </div>
                </div>
                <p className="text-[10px] text-[#C9A961] font-mono mt-2 uppercase tracking-wide">
                  📅 {formatDate(selectedClass.date)} · ⏰ {selectedClass.time} · ⏱ {selectedClass.duration} min
                </p>
              </div>

              {/* KPI pills */}
              <div className="flex flex-wrap gap-2.5">
                <div className="text-center px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-zinc-800">
                  <p className="font-black text-lg text-white tabular-nums">{attendedCount}</p>
                  <p className="text-[8px] uppercase font-bold text-emerald-400 tracking-wider mt-0.5">Attended</p>
                </div>
                <div className="text-center px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-zinc-800">
                  <p className="font-black text-lg text-white tabular-nums">{upcomingCount}</p>
                  <p className="text-[8px] uppercase font-bold text-sky-400 tracking-wider mt-0.5">Upcoming</p>
                </div>
                <div className="text-center px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-zinc-800">
                  <p className="font-black text-lg text-white tabular-nums">{cancelledCount}</p>
                  <p className="text-[8px] uppercase font-bold text-red-400 tracking-wider mt-0.5">Cancelled</p>
                </div>
                <div className="text-center px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-zinc-800">
                  <p className="font-black text-lg text-white tabular-nums">{waitlistEntries.length}</p>
                  <p className="text-[8px] uppercase font-bold text-amber-400 tracking-wider mt-0.5">Waitlist</p>
                </div>
              </div>
            </div>

            {/* Occupancy bar */}
            <div className="pt-2 border-t border-zinc-900/50">
              <div className="flex items-center justify-between text-[10px] mb-2 font-mono uppercase tracking-wider">
                <span className="text-zinc-500 font-bold">Occupancy Level</span>
                <span className="font-bold text-white">{activeBookings.length} / {selectedClass.totalSpots} ({occupancyPct}%)</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', occupancyPct >= 90 ? 'bg-red-500' : occupancyPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Roster Controls ── */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search client name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-xs bg-[#1C1C1C] border border-zinc-800 rounded-xl focus:outline-none focus:border-[#C9A961] text-white w-64 font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              {upcomingCount > 0 && (
                <button
                  onClick={handleMarkAllAttended}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black uppercase tracking-wider rounded-full active:scale-[0.98] transition-all cursor-pointer shadow-lg"
                >
                  <UserCheck size={13} /> Mark All Attended
                </button>
              )}
              <button
                onClick={handlePrintRoster}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-[10px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer"
              >
                <Printer size={13} /> Print Roster
              </button>
            </div>
          </div>

          {/* ── Printable Roster Table ── */}
          <div id="printable-roster">
            {/* Print header (visible only in print) */}
            <div className="hidden print:block mb-4">
              <h1 className="font-black text-xl uppercase">{selectedClass.title}</h1>
              <p className="text-sm text-gray-500">
                {selectedClass.instructor.name} · {formatDate(selectedClass.date)} · {selectedClass.time} · {selectedClass.duration}min
              </p>
            </div>

            <div className="bg-[#121212] border border-zinc-900 rounded-2xl overflow-hidden mb-6 overflow-x-auto shadow-xl">
              {rosterBookings.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-850 flex items-center justify-center mb-3">
                    <Users size={18} className="text-zinc-500" />
                  </div>
                  <p className="font-serif font-light text-base uppercase tracking-wider text-white">No Bookings Yet</p>
                  <p className="text-xs text-zinc-500 mt-1.5">No clients have booked this class.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/40 border-b border-zinc-900 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                      <th className="p-3 pl-5">Spot</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-center">Payment</th>
                      <th className="p-3 text-center">Amount</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {rosterBookings.map(b => (
                      <tr
                        key={b.id}
                        className={cn(
                          'transition-colors',
                          b.status === 'attended'  ? 'bg-emerald-950/5 hover:bg-emerald-950/10' :
                          b.status === 'cancelled' ? 'opacity-40' :
                          'hover:bg-zinc-900/40'
                        )}
                      >
                        {/* Spot */}
                        <td className="p-3 pl-5">
                          <span className="w-7 h-7 rounded-full bg-[#C9A961]/10 text-[#C9A961] font-black text-xs flex items-center justify-center">
                            {b.spotNumber}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="p-3">
                          <p className="font-bold text-white">{b.customerName}</p>
                          {b.discountCode && (
                            <span className="text-[9px] font-mono text-violet-400 bg-violet-950/20 px-1.5 py-0.5 rounded">
                              Promo: {b.discountCode}
                            </span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="p-3">
                          <p className="text-zinc-500 font-medium">{b.customerEmail}</p>
                          {b.customerPhone && (
                            <p className="text-zinc-600 font-mono text-[10px] mt-0.5">{b.customerPhone}</p>
                          )}
                        </td>

                        {/* Payment */}
                        <td className="p-3 text-center">
                          <PaymentPill method={b.paymentMethod} />
                        </td>

                        {/* Amount */}
                        <td className="p-3 text-center font-mono font-bold text-white">
                          {b.paymentMethod === 'credit' ? (
                            <span className="text-violet-400">1 credit</span>
                          ) : (
                            `₱${b.amountPaid}`
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center">
                          <StatusPill status={b.status} />
                        </td>

                        {/* Check-in button */}
                        <td className="p-3 text-center print:hidden">
                          {b.status === 'upcoming' && (
                            <button
                              onClick={() => handleCheckIn(b.id, b.customerName)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-pill hover:bg-emerald-600 active:scale-[0.98] transition-all cursor-pointer mx-auto whitespace-nowrap"
                            >
                              <CheckCircle2 size={11} /> Check In
                            </button>
                          )}
                          {b.status === 'pending' && (
                            <button
                              onClick={() => {
                                const res = confirmBooking(b.id);
                                if (res.success) {
                                  showToast(res.message);
                                } else {
                                  showToast(res.message, 'error');
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#C9A961] text-black text-[10px] font-bold uppercase rounded-pill hover:bg-[#b09352] active:scale-[0.98] transition-all cursor-pointer mx-auto whitespace-nowrap animate-pulse"
                            >
                              Confirm
                            </button>
                          )}
                          {b.status === 'attended' && (
                            <span className="text-emerald-600 text-[10px] font-bold flex items-center justify-center gap-0.5">
                              <CheckCircle2 size={11} /> Done
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Waitlist Section ── */}
            {waitlistEntries.length > 0 && (
              <div className="bg-[#121212] border border-amber-900/20 rounded-2xl overflow-hidden shadow-xl mb-6">
                <div className="px-5 py-3.5 bg-amber-950/10 border-b border-amber-900/20">
                  <h3 className="font-serif font-light text-sm uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" /> Waitlist Queue ({waitlistEntries.length})
                  </h3>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-950/5 border-b border-amber-900/10 font-mono text-[9px] uppercase tracking-widest text-amber-500/80">
                      <th className="p-3 pl-5">#</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-center">Credit Hold</th>
                      <th className="p-3 text-center print:hidden">Promote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10">
                    {waitlistEntries.map((w, idx) => (
                      <tr key={`${w.classId}-${w.customerEmail}`} className="hover:bg-amber-950/5 transition-colors">
                        <td className="p-3 pl-5">
                          <span className="w-6 h-6 rounded-full bg-amber-950/30 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-900/20">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white">{w.customerName}</td>
                        <td className="p-3 text-zinc-500">
                          <p className="font-medium">{w.customerEmail}</p>
                          {w.customerPhone && <p className="font-mono text-[10px] mt-0.5">{w.customerPhone}</p>}
                        </td>
                        <td className="p-3 text-center">
                          {w.holdCredit ? (
                            <span className="text-violet-400 text-[10px] font-bold">1 credit held</span>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center print:hidden">
                          <button
                            onClick={() => handlePromote(w.customerEmail, w.customerName)}
                            disabled={promotingEmail === w.customerEmail || activeBookings.length >= selectedClass.totalSpots}
                            className={cn(
                              'flex items-center gap-1 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer mx-auto whitespace-nowrap border',
                              activeBookings.length >= selectedClass.totalSpots
                                ? 'bg-zinc-900 border-zinc-850 text-zinc-600 cursor-not-allowed'
                                : 'bg-[#C9A961] border-[#C9A961] text-black hover:bg-[#b09352] active:scale-[0.98] shadow-md'
                            )}
                            title={activeBookings.length >= selectedClass.totalSpots ? 'Class is full' : 'Promote to booked'}
                          >
                            <ArrowUpCircle size={11} /> Promote
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
