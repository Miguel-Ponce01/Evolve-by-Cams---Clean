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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 size={9} /> Attended
    </span>
  );
  if (status === 'cancelled') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-50 text-red-600 border border-red-200">
      <XCircle size={9} /> Cancelled
    </span>
  );
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
      <Clock size={9} /> Pending Approval
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-50 text-sky-600 border border-sky-200">
      <Clock size={9} /> Upcoming
    </span>
  );
}

function PaymentPill({ method }: { method: string }) {
  const cfg: Record<string, string> = {
    cash:   'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    card:   'bg-sky-500/10 text-sky-700 border-sky-500/20',
    credit: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border', cfg[method] ?? 'bg-secondary text-muted-foreground border-border')}>
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
    <div className="container mx-auto px-4 py-6 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors text-foreground">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Administration</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Class Roster & Check-in</h1>
        </div>
      </div>

      {/* ── Toast ── */}
      {toastMsg && (
        <div className={cn(
          'mb-5 p-3 rounded-xl border text-sm font-semibold animate-slide-up',
          toastType === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
            : 'bg-red-500/10 border-red-500/30 text-red-700'
        )}>
          {toastMsg}
        </div>
      )}

      {/* ── Class Selector ── */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-5 shadow-sm">
        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2">
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
        <div className="bg-white border border-border/50 rounded-3xl text-center py-20">
          <ClipboardList size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-heading font-black text-xl uppercase">No Class Selected</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            Pick a class from the dropdown above to view the roster, check in clients, and manage the waitlist.
          </p>
        </div>
      )}

      {/* ── Class selected ── */}
      {selectedClass && (
        <>
          {/* Class Summary Card */}
          <div className="bg-white border border-border rounded-2xl p-5 mb-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{selectedClass.instructor.avatar}</span>
                  <div>
                    <h2 className="font-heading font-black text-xl uppercase leading-tight">{selectedClass.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedClass.instructor.name} · {selectedClass.type}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  📅 {formatDate(selectedClass.date)} · ⏰ {selectedClass.time} · ⏱ {selectedClass.duration}min
                </p>
              </div>

              {/* KPI pills */}
              <div className="flex flex-wrap gap-2">
                <div className="text-center px-4 py-2 rounded-2xl bg-secondary border border-border">
                  <p className="font-black text-lg">{attendedCount}</p>
                  <p className="text-[9px] uppercase font-bold text-emerald-600 tracking-wide">Attended</p>
                </div>
                <div className="text-center px-4 py-2 rounded-2xl bg-secondary border border-border">
                  <p className="font-black text-lg">{upcomingCount}</p>
                  <p className="text-[9px] uppercase font-bold text-sky-600 tracking-wide">Upcoming</p>
                </div>
                <div className="text-center px-4 py-2 rounded-2xl bg-secondary border border-border">
                  <p className="font-black text-lg">{cancelledCount}</p>
                  <p className="text-[9px] uppercase font-bold text-red-500 tracking-wide">Cancelled</p>
                </div>
                <div className="text-center px-4 py-2 rounded-2xl bg-secondary border border-border">
                  <p className="font-black text-lg">{waitlistEntries.length}</p>
                  <p className="text-[9px] uppercase font-bold text-amber-600 tracking-wide">Waitlist</p>
                </div>
              </div>
            </div>

            {/* Occupancy bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-semibold">Occupancy</span>
                <span className="font-bold font-mono text-foreground">{activeBookings.length}/{selectedClass.totalSpots} ({occupancyPct}%)</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', occupancyPct >= 90 ? 'bg-red-500' : occupancyPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Roster Controls ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search client name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-primary text-foreground w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              {upcomingCount > 0 && (
                <button
                  onClick={handleMarkAllAttended}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-emerald-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  <UserCheck size={13} /> Mark All Attended
                </button>
              )}
              <button
                onClick={handlePrintRoster}
                className="flex items-center gap-1.5 px-4 py-2 bg-secondary border border-border text-foreground text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
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

            <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm mb-5 overflow-x-auto">
              {rosterBookings.length === 0 ? (
                <div className="text-center py-14">
                  <Users size={36} className="mx-auto text-muted-foreground mb-3" />
                  <p className="font-heading font-black text-lg uppercase">No Bookings Yet</p>
                  <p className="text-sm text-muted-foreground mt-1">No clients have booked this class.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      <th className="p-3 pl-5">Spot</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-center">Payment</th>
                      <th className="p-3 text-center">Amount</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {rosterBookings.map(b => (
                      <tr
                        key={b.id}
                        className={cn(
                          'transition-colors',
                          b.status === 'attended'  ? 'bg-emerald-500/3 hover:bg-emerald-500/5' :
                          b.status === 'cancelled' ? 'opacity-50' :
                          'hover:bg-secondary/20'
                        )}
                      >
                        {/* Spot */}
                        <td className="p-3 pl-5">
                          <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                            {b.spotNumber}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="p-3">
                          <p className="font-bold text-foreground">{b.customerName}</p>
                          {b.discountCode && (
                            <span className="text-[9px] font-mono text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded">
                              Promo: {b.discountCode}
                            </span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="p-3">
                          <p className="text-muted-foreground">{b.customerEmail}</p>
                          {b.customerPhone && (
                            <p className="text-muted-foreground font-mono text-[10px]">{b.customerPhone}</p>
                          )}
                        </td>

                        {/* Payment */}
                        <td className="p-3 text-center">
                          <PaymentPill method={b.paymentMethod} />
                        </td>

                        {/* Amount */}
                        <td className="p-3 text-center font-mono font-bold text-foreground">
                          {b.paymentMethod === 'credit' ? (
                            <span className="text-violet-600">1 credit</span>
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
              <div className="bg-white border border-amber-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 bg-amber-50 border-b border-amber-200">
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Waitlist ({waitlistEntries.length})
                  </h3>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-50/60 border-b border-amber-100 font-mono text-[9px] uppercase tracking-widest text-amber-600">
                      <th className="p-3 pl-5">#</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3 text-center">Credit Hold</th>
                      <th className="p-3 text-center print:hidden">Promote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/60">
                    {waitlistEntries.map((w, idx) => (
                      <tr key={`${w.classId}-${w.customerEmail}`} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3 pl-5">
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-foreground">{w.customerName}</td>
                        <td className="p-3 text-muted-foreground">
                          <p>{w.customerEmail}</p>
                          {w.customerPhone && <p className="font-mono text-[10px]">{w.customerPhone}</p>}
                        </td>
                        <td className="p-3 text-center">
                          {w.holdCredit ? (
                            <span className="text-violet-600 text-[10px] font-bold">1 credit held</span>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center print:hidden">
                          <button
                            onClick={() => handlePromote(w.customerEmail, w.customerName)}
                            disabled={promotingEmail === w.customerEmail || activeBookings.length >= selectedClass.totalSpots}
                            className={cn(
                              'flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase rounded-pill transition-all cursor-pointer mx-auto whitespace-nowrap',
                              activeBookings.length >= selectedClass.totalSpots
                                ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-sm'
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
  );
}
