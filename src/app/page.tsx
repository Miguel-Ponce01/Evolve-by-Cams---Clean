'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Users,
  DollarSign,
  Flame,
  Clock,
  Filter,
  Search,
  ClipboardList,
  TrendingUp,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Occupancy Ring SVG
// ─────────────────────────────────────────────────────────────────────────────
function OccupancyRing({ pct }: { pct: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" className="-rotate-90">
      <circle cx={22} cy={22} r={r} fill="none" stroke="#e6e6e6" strokeWidth={4} />
      <circle
        cx={22} cy={22} r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === 'cancelled') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-50 text-red-500 border border-red-200">
      <XCircle size={9} /> Cancelled
    </span>
  );
  if (status === 'attended') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
      <CheckCircle2 size={9} /> Attended
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-50 text-sky-600 border border-sky-200">
      <Clock size={9} /> Upcoming
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Method badge helper
// ─────────────────────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: string }) {
  const cfg: Record<string, string> = {
    cash:   'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    card:   'bg-sky-500/10 text-sky-700 border-sky-500/20',
    credit: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black uppercase border', cfg[method] ?? '')}>
      {method}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function POSDashboard() {
  const {
    classes, bookings, customers, waitlist,
    checkInBooking, releaseExpiredHolds, getClassById,
  } = useBooking();

  // Release stale waitlist holds on mount
  useEffect(() => { releaseExpiredHolds(); }, [releaseExpiredHolds]);

  // ── 7-day date swiper ───────────────────────────────────────────────────
  const dates = useMemo(() => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        day:     days[d.getDay()],
        dateNum: d.getDate().toString(),
        dateStr,
        label:   i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
      });
    }
    return list;
  }, []);

  const [selectedDate,       setSelectedDate]       = useState<string>(dates[0].dateStr);
  const [selectedType,       setSelectedType]       = useState<string>('All');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('All');
  const [showAvailableOnly,  setShowAvailableOnly]  = useState<boolean>(false);
  const [searchQuery,        setSearchQuery]        = useState<string>('');
  const [viewMode,           setViewMode]           = useState<'timeline' | 'calendar'>('timeline');
  const [nowTop,             setNowTop]             = useState<number>(0);
  const [checkInMsg,         setCheckInMsg]         = useState<string>('');
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  // Live current-time indicator
  useEffect(() => {
    const updateNow = () => {
      const now       = new Date();
      const startHour = 7;
      const hourH     = 80;
      const mins      = (now.getHours() - startHour) * 60 + now.getMinutes();
      setNowTop(Math.max(0, (mins / 60) * hourH));
    };
    updateNow();
    const t = setInterval(updateNow, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (viewMode === 'calendar' && calendarScrollRef.current) {
      calendarScrollRef.current.scrollTo({ top: Math.max(0, nowTop - 120), behavior: 'smooth' });
    }
  }, [viewMode, nowTop]);

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const todayStr      = dates[0].dateStr;
    const todayClasses  = classes.filter(c => c.date === todayStr);
    const totalSpots    = todayClasses.reduce((a, c) => a + c.totalSpots, 0);
    const takenSpots    = todayClasses.reduce((a, c) => a + c.bookedSpots.length, 0);
    const occupancyRate = totalSpots > 0 ? Math.round((takenSpots / totalSpots) * 100) : 0;

    const todayBookings = bookings.filter(
      b => b.bookedAt.split('T')[0] === todayStr && b.status !== 'cancelled'
    );
    const todayRevenue = todayBookings
      .filter(b => b.paymentMethod !== 'credit')
      .reduce((a, b) => a + b.amountPaid, 0);

    return { occupancyRate, todayBookingsCount: todayBookings.length, activeCustomers: customers.length, todayRevenue };
  }, [classes, bookings, customers, dates]);

  // ── Filtered classes ────────────────────────────────────────────────────
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const dateMatch       = cls.date === selectedDate;
      const typeMatch       = selectedType === 'All' || cls.type === selectedType;
      const instrMatch      = selectedInstructor === 'All' || cls.instructor.id === selectedInstructor;
      const availMatch      = !showAvailableOnly || cls.bookedSpots.length < cls.totalSpots;
      const searchMatch     = !searchQuery ||
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
      return dateMatch && typeMatch && instrMatch && availMatch && searchMatch;
    });
  }, [classes, selectedDate, selectedType, selectedInstructor, showAvailableOnly, searchQuery]);

  const weeklyFilteredClasses = useMemo(() => {
    const datesSet = new Set(dates.map(d => d.dateStr));
    return classes.filter(cls => {
      const dateMatch   = datesSet.has(cls.date);
      const typeMatch   = selectedType === 'All' || cls.type === selectedType;
      const instrMatch  = selectedInstructor === 'All' || cls.instructor.id === selectedInstructor;
      const availMatch  = !showAvailableOnly || cls.bookedSpots.length < cls.totalSpots;
      const searchMatch = !searchQuery ||
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
      return dateMatch && typeMatch && instrMatch && availMatch && searchMatch;
    });
  }, [classes, dates, selectedType, selectedInstructor, showAvailableOnly, searchQuery]);

  // ── Calendar position ────────────────────────────────────────────────────
  const getPositionStyles = (timeStr: string, duration: number) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes]   = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const startHour    = 7;
    const totalMinutes = (hours - startHour) * 60 + minutes;
    const hourHeight   = 80;
    return { top: `${(totalMinutes / 60) * hourHeight}px`, height: `${(duration / 60) * hourHeight}px` };
  };

  // ── Recent transactions (last 15, newest first) ──────────────────────────
  const recentTransactions = useMemo(() => {
    return [...bookings]
      .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))
      .slice(0, 15);
  }, [bookings]);

  // ── Check-in handler ─────────────────────────────────────────────────────
  const handleCheckIn = useCallback((bookingId: string) => {
    const res = checkInBooking(bookingId);
    setCheckInMsg(res.message);
    setTimeout(() => setCheckInMsg(''), 3000);
  }, [checkInBooking]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-[1240px] animate-slide-up">
      {/* ── POS Terminal Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-extrabold font-display">Front Desk Operations</span>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-ink mt-1 uppercase">POS Terminal Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="btn-secondary-pill flex items-center justify-center gap-1.5 border border-hairline bg-white">
            <Users size={16} /> Customers Registry
          </Link>
          <Link href="/wallet" className="btn-primary-pill flex items-center justify-center gap-1.5">
            <DollarSign size={16} /> Sales Ledger
          </Link>
        </div>
      </div>

      {/* ── 4-Column Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Occupancy */}
        <div className="bg-white border border-hairline rounded-xl p-5 transition-all hover:scale-[1.01] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-mute font-bold uppercase tracking-wider">Today's Occupancy</p>
              <h3 className="text-3xl font-display font-black text-primary mt-1">{stats.occupancyRate}%</h3>
            </div>
            <OccupancyRing pct={stats.occupancyRate} />
          </div>
          <div className="w-full h-1.5 bg-hairline rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700',
                stats.occupancyRate >= 90 ? 'bg-red-500' : stats.occupancyRate >= 70 ? 'bg-amber-400' : 'bg-emerald-500'
              )}
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Bookings Logged */}
        <div className="bg-white border border-hairline rounded-xl p-5 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-mute font-bold uppercase tracking-wider">Bookings Logged</p>
              <h3 className="text-3xl font-display font-black text-primary mt-2">{stats.todayBookingsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-canvas-lavender flex items-center justify-center text-primary">
              <ClipboardList size={20} />
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white border border-hairline rounded-xl p-5 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-mute font-bold uppercase tracking-wider">Active Customers</p>
              <h3 className="text-3xl font-display font-black text-primary mt-2">{stats.activeCustomers}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-canvas-lavender flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-surface-aubergine text-on-primary rounded-xl p-5 transition-all hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-on-aubergine-mute font-bold uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-3xl font-display font-black text-on-primary mt-2">
                ${stats.todayRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-press flex items-center justify-center text-on-primary">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Date Swiper ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink-mute font-display">Select Booking Date</h2>
          <div className="flex border border-border rounded-xl p-1 bg-white shadow-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={cn('px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer',
                viewMode === 'timeline' ? 'bg-primary text-white' : 'text-ink-mute hover:text-foreground'
              )}
            >Timeline List</button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn('px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer',
                viewMode === 'calendar' ? 'bg-primary text-white' : 'text-ink-mute hover:text-foreground'
              )}
            >Weekly Grid</button>
          </div>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-3 p-1">
            {dates.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(d.dateStr)}
                className={cn(
                  'flex flex-col items-center justify-center w-20 h-22 rounded-xl border transition-all cursor-pointer',
                  selectedDate === d.dateStr
                    ? 'bg-primary text-on-primary border-primary shadow-md'
                    : 'bg-white text-ink-mute border-hairline hover:border-primary/50 hover:bg-canvas-lavender/30'
                )}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider">{d.label}</span>
                <span className="text-2xl font-display font-black mt-1">{d.dateNum}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      {/* ── Filters ── */}
      <div className="bg-canvas-cream border border-hairline rounded-xl p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute w-4 h-4" />
            <input
              type="text"
              placeholder="Search classes or coaches..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-hairline rounded-sm focus:outline-none focus:border-primary text-ink"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-mute font-bold uppercase tracking-wider">Type:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-white border border-hairline rounded-sm focus:outline-none focus:border-primary text-ink"
            >
              <option value="All">All Types</option>
              <option value="Reformer">Reformer</option>
              <option value="Mat Pilates">Mat Pilates</option>
              <option value="HIIT">HIIT</option>
              <option value="Yoga">Yoga</option>
              <option value="Sculpt">Sculpt</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-mute font-bold uppercase tracking-wider">Coach:</span>
            <select
              value={selectedInstructor}
              onChange={e => setSelectedInstructor(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-white border border-hairline rounded-sm focus:outline-none focus:border-primary text-ink"
            >
              <option value="All">All Coaches</option>
              <option value="cams">Cams Rivera</option>
              <option value="sarah">Sarah Lee</option>
              <option value="alex">Alex Tran</option>
            </select>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-ink-mute font-bold uppercase tracking-wider ml-2">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={e => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 accent-primary rounded border-hairline"
            />
            Show Open Slots Only
          </label>
        </div>
      </div>

      {/* ── Schedule (Timeline / Calendar) ── */}
      <div className="space-y-4 mb-12">
        {viewMode === 'timeline' && filteredClasses.length > 0 && (
          <div className="flex items-center justify-between px-1 mb-1">
            <p className="text-xs text-ink-mute font-bold uppercase tracking-widest">
              <span className="text-primary font-black">{filteredClasses.length}</span> session{filteredClasses.length !== 1 ? 's' : ''} scheduled
            </p>
            <button
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
            >
              <LayoutGrid size={12} /> Switch to Weekly Grid
            </button>
          </div>
        )}

        {viewMode === 'calendar' ? (
          /* ── Weekly Calendar Grid ── */
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-md animate-in fade-in duration-300">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border bg-secondary/35 text-center text-xs font-mono font-bold text-ink-mute">
              <div className="p-4 border-r border-border flex items-center justify-center text-[10px]">TIME</div>
              {dates.map((d, idx) => {
                const isToday    = idx === 0;
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={cn('p-3.5 border-r border-border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer last:border-r-0 hover:bg-canvas-lavender/40',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-extrabold">{d.label}</span>
                    <span className={cn('text-sm font-black font-display w-7 h-7 flex items-center justify-center rounded-full',
                      isToday ? 'bg-primary text-white' : isSelected ? 'bg-secondary text-primary' : 'text-ink'
                    )}>{d.dateNum}</span>
                  </button>
                );
              })}
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[680px]" ref={calendarScrollRef}>
              <div className="min-w-[800px] relative grid grid-cols-[80px_repeat(7,1fr)] select-none" style={{ height: '1040px' }}>
                <div className="absolute inset-0 pointer-events-none flex flex-col">
                  {Array.from({ length: 13 }).map((_, hi) => (
                    <div key={hi} className="w-full border-b border-border/40 border-dashed" style={{ height: '80px' }} />
                  ))}
                </div>
                <div className="border-r border-border bg-secondary/10 flex flex-col">
                  {Array.from({ length: 13 }).map((_, hi) => {
                    const hv  = hi + 7;
                    const lbl = hv === 12 ? '12 PM' : hv > 12 ? `${hv - 12} PM` : `${hv} AM`;
                    return (
                      <div key={hi} className="text-[9px] font-mono font-bold text-ink-mute pr-3.5 pt-2 text-right border-b border-border/10" style={{ height: '80px' }}>
                        {lbl}
                      </div>
                    );
                  })}
                </div>
                {nowTop > 0 && nowTop < 1040 && (
                  <div className="absolute left-[80px] right-0 z-20 pointer-events-none" style={{ top: `${nowTop}px` }}>
                    <div className="relative flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 -ml-1.5" />
                      <div className="flex-1 h-px bg-red-500/70" />
                    </div>
                  </div>
                )}
                {dates.map((d, colIdx) => {
                  const dayClasses = weeklyFilteredClasses.filter(c => c.date === d.dateStr);
                  return (
                    <div key={colIdx} className={cn('relative border-r border-border h-full last:border-r-0',
                      selectedDate === d.dateStr && 'bg-primary/[0.03]',
                      colIdx === 0 && 'bg-amber-50/30'
                    )}>
                      {dayClasses.map(cls => {
                        const bookedCount  = cls.bookedSpots.length;
                        const isFull       = bookedCount >= cls.totalSpots;
                        const pos          = getPositionStyles(cls.time, cls.duration);
                        const occupancyPct = Math.round((bookedCount / cls.totalSpots) * 100);
                        const typeConfig: Record<string, { bg: string; border: string; text: string; dot: string; hoverBg: string }> = {
                          'Reformer':    { bg: 'bg-[#f9f0ff]', border: 'border-primary/20',    text: 'text-primary',     dot: 'bg-primary',     hoverBg: 'hover:bg-[#ead8ff]' },
                          'HIIT':        { bg: 'bg-[#edf7e7]', border: 'border-emerald-500/20', text: 'text-emerald-700', dot: 'bg-emerald-500', hoverBg: 'hover:bg-[#d6f0cb]' },
                          'Sculpt':      { bg: 'bg-[#fff5f0]', border: 'border-orange-400/20',  text: 'text-orange-700',  dot: 'bg-orange-400',  hoverBg: 'hover:bg-[#ffe0d0]' },
                          'Yoga':        { bg: 'bg-[#f0f9ff]', border: 'border-sky-400/20',     text: 'text-sky-700',     dot: 'bg-sky-400',     hoverBg: 'hover:bg-[#d0edff]' },
                          'Mat Pilates': { bg: 'bg-[#fff9f0]', border: 'border-amber-400/20',   text: 'text-amber-700',   dot: 'bg-amber-400',   hoverBg: 'hover:bg-[#ffecd0]' },
                        };
                        const theme    = typeConfig[cls.type] ?? { bg: 'bg-secondary', border: 'border-border', text: 'text-foreground', dot: 'bg-ink-mute', hoverBg: '' };
                        const cardH    = parseInt(pos.height);
                        const isTall   = cardH >= 80;
                        const isMedium = cardH >= 50;
                        return (
                          <Link
                            key={cls.id}
                            href={`/book/${cls.id}`}
                            className={cn('absolute left-1 right-1 rounded-xl border p-1.5 flex flex-col transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer overflow-hidden group',
                              theme.bg, theme.border, theme.text, theme.hoverBg,
                              isFull && 'opacity-70'
                            )}
                            style={{ top: pos.top, height: pos.height }}
                          >
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', theme.dot)} />
                              <span className="text-[7px] font-bold font-mono tracking-tight truncate flex-1">{cls.time}</span>
                              {isFull && <span className="text-[6px] font-black bg-red-100 text-red-600 px-1 rounded shrink-0">FULL</span>}
                            </div>
                            {isMedium && <h4 className="text-[9px] font-black uppercase tracking-tight truncate leading-tight mt-0.5 shrink-0">{cls.title}</h4>}
                            {isTall && <p className="text-[8px] font-semibold truncate opacity-80 shrink-0">{cls.instructor.avatar} {cls.instructor.name.split(' ')[0]} · {cls.duration}m</p>}
                            <div className="mt-auto pt-0.5 shrink-0">
                              <div className="flex items-center gap-0.5">
                                <div className="flex-1 h-0.5 bg-black/10 rounded-full overflow-hidden">
                                  <div className={cn('h-full rounded-full', theme.dot)} style={{ width: `${occupancyPct}%` }} />
                                </div>
                                <span className="text-[7px] font-bold font-mono shrink-0 opacity-70">{bookedCount}/{cls.totalSpots}</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-hairline rounded-xl bg-white/50">
            <p className="text-4xl mb-3">🗓️</p>
            <p className="text-ink-mute font-semibold uppercase tracking-wider text-sm">No sessions scheduled matching the active filters.</p>
          </div>
        ) : (
          filteredClasses.map(cls => {
            const bookedCount  = cls.bookedSpots.length;
            const isFull       = bookedCount >= cls.totalSpots;
            const classWaitlist = waitlist.filter(w => w.classId === cls.id);
            const occupancyPct = cls.totalSpots > 0 ? Math.round((bookedCount / cls.totalSpots) * 100) : 0;
            const barColor     = occupancyPct >= 90 ? 'bg-red-500' : occupancyPct >= 70 ? 'bg-amber-400' : 'bg-emerald-500';

            return (
              <div key={cls.id} className="overflow-hidden border border-hairline bg-white rounded-xl hover:border-primary/50 transition-all hover:scale-[1.005] shadow-sm">
                {/* Occupancy progress bar */}
                <div className="w-full h-1 bg-hairline">
                  <div className={cn('h-full transition-all duration-700', barColor)} style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-6">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-primary flex items-center gap-1.5"><Clock className="w-4 h-4" /> {cls.time}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-canvas-lavender text-primary border border-primary/20">{cls.type}</span>
                        <span className="text-xs text-ink-mute font-medium">({cls.level})</span>
                      </div>
                      <h3 className="text-xl font-display font-black tracking-tight text-ink uppercase">{cls.title}</h3>
                      <p className="text-sm text-ink-mute mt-1">Duration: {cls.duration} min · Coach: <span className="font-semibold text-ink">{cls.instructor.avatar} {cls.instructor.name}</span></p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-ink-mute font-bold uppercase tracking-wider text-[10px]">Occupancy:</span>
                      <span className="font-semibold text-ink">{bookedCount} / {cls.totalSpots} spots taken</span>
                      {bookedCount > 0 && (
                        <div className="flex -space-x-1.5 ml-2">
                          {cls.bookedSpots.map((spot, idx) => {
                            const b = bookings.find(x => x.classId === cls.id && x.spotNumber === spot && x.status !== 'cancelled');
                            return b ? (
                              <div key={idx} title={`Spot #${spot}: ${b.customerName}`}
                                className="w-5 h-5 rounded-full bg-canvas-lavender border border-primary/20 text-[9px] flex items-center justify-center font-bold text-primary">
                                {spot}
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                      {classWaitlist.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20 ml-2">
                          Waitlist: {classWaitlist.length} clients
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex lg:flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
                    <div className="hidden lg:flex flex-col items-end">
                      {isFull ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-destructive/15 text-destructive border border-destructive/25">Class Full</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
                          {cls.totalSpots - bookedCount} Slots Open
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/book/${cls.id}`}
                      className={cn(isFull ? 'btn-secondary-pill' : 'btn-primary-pill', 'flex-1 lg:flex-none text-center text-xs uppercase tracking-widest font-black')}
                    >
                      {isFull ? 'Manage Waitlist' : 'Book Spot Terminal'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Recent Transactions Table ── */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-extrabold font-display">Live Feed</span>
            <h2 className="text-xl font-display font-black tracking-tight text-ink uppercase">Recent Transactions</h2>
          </div>
          <Link href="/wallet" className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:underline">
            Full Sales Ledger <ArrowRight size={13} />
          </Link>
        </div>

        {checkInMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-600 font-semibold animate-slide-up">
            ✓ {checkInMsg}
          </div>
        )}

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-hairline rounded-xl bg-white/50">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-ink-mute font-semibold uppercase tracking-wider text-sm">No transactions recorded yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white border border-hairline rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/50 border-b border-hairline text-ink-mute uppercase tracking-widest text-[9px] font-bold font-mono">
                    <th className="p-3.5 pl-5">Booking ID</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Class Session</th>
                    <th className="p-3.5 text-center">Spot</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5 font-mono">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Check-In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {recentTransactions.map(b => {
                    const cls = getClassById(b.classId);
                    return (
                      <tr key={b.id} className="hover:bg-canvas-lavender/20 transition-colors">
                        <td className="p-3.5 pl-5">
                          <Link href={`/book/${b.classId}/success/${b.id}`} className="text-primary font-bold font-mono hover:underline text-[10px]">
                            {b.id.replace('booking-', '#')}
                          </Link>
                        </td>
                        <td className="p-3.5 font-semibold text-ink">{b.customerName}</td>
                        <td className="p-3.5 text-ink-mute">
                          {cls ? <span>{cls.title} <span className="text-[9px]">({cls.time})</span></span> : '—'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="w-6 h-6 rounded-full bg-canvas-lavender border border-primary/20 text-[9px] font-bold text-primary inline-flex items-center justify-center">
                            {b.spotNumber}
                          </span>
                        </td>
                        <td className="p-3.5"><MethodBadge method={b.paymentMethod} /></td>
                        <td className="p-3.5 font-mono font-semibold text-ink">
                          {b.paymentMethod === 'credit' ? <span className="text-amber-600">1 Credit</span> : `$${b.amountPaid.toFixed(2)}`}
                        </td>
                        <td className="p-3.5"><StatusBadge status={b.status} /></td>
                        <td className="p-3.5 text-center">
                          {b.status === 'upcoming' ? (
                            <button
                              onClick={() => handleCheckIn(b.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all cursor-pointer"
                            >
                              <UserCheck size={10} /> Check In
                            </button>
                          ) : (
                            <span className="text-[9px] text-ink-mute">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block md:hidden space-y-3">
              {recentTransactions.map(b => {
                const cls = getClassById(b.classId);
                return (
                  <div key={b.id} className="bg-white border border-hairline rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Link href={`/book/${b.classId}/success/${b.id}`} className="text-primary font-bold font-mono text-[10px] hover:underline">
                        {b.id.replace('booking-', '#')}
                      </Link>
                      <StatusBadge status={b.status} />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm">{b.customerName}</p>
                      <p className="text-[11px] text-ink-mute">{cls?.title} · Spot #{b.spotNumber} · {cls?.time}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-hairline pt-2">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={b.paymentMethod} />
                        <span className="font-mono font-semibold text-xs text-ink">
                          {b.paymentMethod === 'credit' ? '1 Credit' : `$${b.amountPaid.toFixed(2)}`}
                        </span>
                      </div>
                      {b.status === 'upcoming' && (
                        <button
                          onClick={() => handleCheckIn(b.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          <UserCheck size={10} /> Check In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
