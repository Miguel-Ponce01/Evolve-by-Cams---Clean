'use client';

import { useMemo } from 'react';
import { useBooking } from '@/context/BookingContext';
import { INSTRUCTORS } from '@/lib/seedData';
import {
  TrendingUp, DollarSign, Users, Star,
  BarChart3, CalendarDays, Award, Activity,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatPct(n: number) {
  return `${Math.round(n)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  trend?: string;
}

function KpiCard({ label, value, sub, icon, accent = 'bg-primary/10 text-primary', trend }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius)] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', accent)}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-foreground leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
          <ArrowUpRight size={11} />
          {trend}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG BAR CHART
// ─────────────────────────────────────────────────────────────────────────────

function RevenueBarChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  const W = 720;
  const H = 180;
  const PAD_L = 48;
  const PAD_B = 36;
  const PAD_T = 12;
  const chartW = W - PAD_L - 8;
  const chartH = H - PAD_B - PAD_T;
  const barW = Math.max(2, Math.floor((chartW / data.length) * 0.65));
  const gap = chartW / data.length;

  // Y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: PAD_T + chartH * (1 - f),
    label: formatPHP(max * f),
  }));

  // Show every Nth date label to avoid crowding
  const labelEvery = Math.ceil(data.length / 8);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 200 }}
      aria-label="Revenue last 30 days bar chart"
    >
      {/* Y-axis gridlines */}
      {ticks.map(t => (
        <g key={t.label}>
          <line
            x1={PAD_L} y1={t.y} x2={W - 8} y2={t.y}
            stroke="var(--border)" strokeWidth={1} strokeDasharray="3,3"
          />
          <text
            x={PAD_L - 6} y={t.y + 4}
            fontSize={8} fill="var(--muted-foreground)"
            textAnchor="end" fontFamily="Inter, sans-serif" fontWeight={600}
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max(2, (d.revenue / max) * chartH);
        const x = PAD_L + i * gap + (gap - barW) / 2;
        const y = PAD_T + chartH - barH;
        const showLabel = i % labelEvery === 0;
        const shortDate = d.date.slice(5); // MM-DD
        return (
          <g key={d.date}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={3}
              fill={d.revenue > 0 ? 'var(--primary)' : 'var(--border)'}
              opacity={0.85}
            >
              <title>{d.date}: {formatPHP(d.revenue)}</title>
            </rect>
            {showLabel && (
              <text
                x={x + barW / 2}
                y={H - 6}
                fontSize={7.5} fill="var(--muted-foreground)"
                textAnchor="middle" fontFamily="Inter, sans-serif"
              >
                {shortDate}
              </text>
            )}
          </g>
        );
      })}

      {/* X-axis baseline */}
      <line
        x1={PAD_L} y1={PAD_T + chartH} x2={W - 8} y2={PAD_T + chartH}
        stroke="var(--border)" strokeWidth={1}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OCCUPANCY HEATMAP
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['7 AM', '9 AM', '12 PM', '5 PM', '7 PM'];

function pctToColor(pct: number): string {
  if (pct === 0) return 'var(--secondary)';
  if (pct < 30) return '#e9d5ff'; // violet-200
  if (pct < 60) return '#a78bfa'; // violet-400
  if (pct < 85) return '#7c3aed'; // violet-600
  return 'var(--primary)';
}

interface HeatCell {
  pct: number;
  label: string;
}

function OccupancyHeatmap({ grid }: { grid: HeatCell[][] }) {
  // grid[slotIndex][dayIndex]
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-separate border-spacing-1" role="grid" aria-label="Class occupancy heatmap">
        <thead>
          <tr>
            <th className="text-muted-foreground text-[9px] font-black uppercase tracking-widest text-left pr-2 pb-1 w-14"></th>
            {DAYS.map(d => (
              <th key={d} className="text-muted-foreground text-[9px] font-black uppercase tracking-widest text-center pb-1">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot, si) => (
            <tr key={slot}>
              <td className="text-muted-foreground text-[9px] font-bold pr-2 text-right whitespace-nowrap">{slot}</td>
              {DAYS.map((_, di) => {
                const cell = grid[si][di];
                return (
                  <td key={di} className="relative group">
                    <div
                      className="h-8 rounded-md transition-all cursor-default flex items-center justify-center"
                      style={{ backgroundColor: pctToColor(cell.pct) }}
                      title={cell.label || 'No class'}
                    >
                      {cell.pct > 0 && (
                        <span className="text-[8px] font-black text-white drop-shadow-sm">{formatPct(cell.pct)}</span>
                      )}
                    </div>
                    {/* Tooltip */}
                    {cell.label && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 hidden group-hover:block pointer-events-none">
                        <div className="bg-foreground text-background text-[9px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                          {cell.label}<br />
                          <span className="font-normal">{formatPct(cell.pct)} filled</span>
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 justify-end">
        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Fill rate:</span>
        {[
          { color: 'var(--secondary)', label: '0%' },
          { color: '#e9d5ff', label: '<30%' },
          { color: '#a78bfa', label: '30–60%' },
          { color: '#7c3aed', label: '60–85%' },
          { color: 'var(--primary)', label: '85–100%' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-4 h-3 rounded-sm border border-border/40" style={{ backgroundColor: l.color }} />
            <span className="text-[9px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RETENTION RING
// ─────────────────────────────────────────────────────────────────────────────

function RetentionRing({ returning, newClients }: { returning: number; newClients: number }) {
  const total = returning + newClients;
  const pct = total === 0 ? 0 : Math.round((returning / total) * 100);
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative flex-shrink-0">
        <svg width={120} height={120} viewBox="0 0 120 120" aria-label={`Retention ring: ${pct}% returning`}>
          <circle cx={60} cy={60} r={r} fill="none" stroke="var(--secondary)" strokeWidth={14} />
          <circle
            cx={60} cy={60} r={r}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={14}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-foreground leading-none">{pct}%</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Return</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
          <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-foreground">{returning}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Returning Clients</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
          <div className="w-3 h-3 rounded-full bg-violet-300 flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-foreground">{newClients}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">New Clients This Month</p>
          </div>
        </div>
        {total === 0 && (
          <p className="text-[10px] text-muted-foreground italic">No bookings recorded this month yet.</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-[var(--radius)] p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { transactions, bookings, classes, customers } = useBooking();

  // ── Date helpers ──────────────────────────────────────────────────────────
  const now = new Date();
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 30-day window
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  // ── Derived analytics ─────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const paidTx = transactions.filter(t => t.status === 'paid');
    const activeBookings = bookings.filter(b => b.status !== 'cancelled');

    // KPI — total revenue
    const totalRevenue = paidTx.reduce((s, t) => s + t.amount, 0);

    // KPI — this month revenue
    const monthRevenue = paidTx
      .filter(t => t.timestamp.startsWith(thisMonthStr))
      .reduce((s, t) => s + t.amount, 0);

    // KPI — most popular class (by booking count)
    const classBookingCount: Record<string, number> = {};
    activeBookings.forEach(b => {
      classBookingCount[b.classId] = (classBookingCount[b.classId] || 0) + 1;
    });
    const popularClassId = Object.entries(classBookingCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const popularClass = classes.find(c => c.id === popularClassId);

    // KPI — avg occupancy
    const avgOccupancy = classes.length === 0 ? 0
      : classes.reduce((s, c) => s + (c.bookedSpots.length / c.totalSpots) * 100, 0) / classes.length;

    // KPI — top instructor (most classes)
    const instructorClassCount: Record<string, number> = {};
    classes.forEach(c => {
      instructorClassCount[c.instructor.id] = (instructorClassCount[c.instructor.id] || 0) + 1;
    });
    const topInstructorId = Object.entries(instructorClassCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topInstructor = INSTRUCTORS.find(i => i.id === topInstructorId);

    // ── Revenue by day (last 30 days) ─────────────────────────────────────
    const dayMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      dayMap[d.toISOString().split('T')[0]] = 0;
    }
    paidTx.forEach(t => {
      const day = t.timestamp.split('T')[0];
      if (day >= thirtyDaysAgoStr) {
        dayMap[day] = (dayMap[day] || 0) + t.amount;
      }
    });
    const revenueByDay = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    // ── Occupancy heatmap ─────────────────────────────────────────────────
    // Map day name → JS getDay index (Mon=1…Sun=0)
    const DAY_JS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
    const TIME_HOUR: Record<string, number> = {
      '7 AM': 7, '9 AM': 9, '12 PM': 12, '5 PM': 17, '7 PM': 19,
    };

    // For each slot × day, find matching classes and compute avg occupancy
    const grid: { pct: number; label: string }[][] = TIME_SLOTS.map(slot => {
      return DAYS.map(day => {
        const targetHour = TIME_HOUR[slot];
        const targetDay = DAY_JS[day];
        const matched = classes.filter(c => {
          const d = new Date(c.date + 'T00:00:00');
          if (d.getDay() !== targetDay) return false;
          // parse class hour
          const [tp, mod] = c.time.split(' ');
          let [h] = tp.split(':').map(Number);
          if (mod === 'PM' && h !== 12) h += 12;
          if (mod === 'AM' && h === 12) h = 0;
          return Math.abs(h - targetHour) <= 1;
        });
        if (matched.length === 0) return { pct: 0, label: '' };
        const avgPct = matched.reduce((s, c) => s + (c.bookedSpots.length / c.totalSpots) * 100, 0) / matched.length;
        const label = matched.length === 1 ? matched[0].title : `${matched.length} classes`;
        return { pct: Math.round(avgPct), label };
      });
    });

    // ── Top 5 LTV ─────────────────────────────────────────────────────────
    const ltv: Record<string, { name: string; email: string; total: number; tier: string; classesAttended: number }> = {};
    paidTx.forEach(t => {
      if (!ltv[t.customerEmail]) {
        const cust = customers.find(c => c.email.toLowerCase() === t.customerEmail.toLowerCase());
        ltv[t.customerEmail] = {
          name: t.customerName,
          email: t.customerEmail,
          total: 0,
          tier: cust?.membershipTier ?? '—',
          classesAttended: cust?.totalClassesAttended ?? 0,
        };
      }
      ltv[t.customerEmail].total += t.amount;
    });
    const top5LTV = Object.values(ltv)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // ── Instructor performance ─────────────────────────────────────────────
    const instructorPerf = INSTRUCTORS.map(inst => {
      const instClasses = classes.filter(c => c.instructor.id === inst.id);
      const classCount = instClasses.length;
      const avgOcc = classCount === 0 ? 0
        : instClasses.reduce((s, c) => s + (c.bookedSpots.length / c.totalSpots) * 100, 0) / classCount;

      // Revenue = sum of paid bookings for this instructor's classes
      const instClassIds = new Set(instClasses.map(c => c.id));
      const instRevenue = paidTx
        .filter(t => {
          const bk = bookings.find(b => b.id === t.bookingId);
          return bk && instClassIds.has(bk.classId);
        })
        .reduce((s, t) => s + t.amount, 0);

      return {
        id: inst.id,
        name: inst.name,
        avatar: inst.avatar,
        classCount,
        avgOcc: Math.round(avgOcc),
        revenue: instRevenue,
        rating: inst.rating,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // ── Client retention ──────────────────────────────────────────────────
    const thisMonthBookingEmails = new Set(
      activeBookings
        .filter(b => b.bookedAt.startsWith(thisMonthStr))
        .map(b => b.customerEmail.toLowerCase())
    );
    const prevMonthBookingEmails = new Set(
      activeBookings
        .filter(b => !b.bookedAt.startsWith(thisMonthStr))
        .map(b => b.customerEmail.toLowerCase())
    );
    let returningCount = 0;
    let newCount = 0;
    thisMonthBookingEmails.forEach(email => {
      if (prevMonthBookingEmails.has(email)) returningCount++;
      else newCount++;
    });

    return {
      totalRevenue,
      monthRevenue,
      popularClass,
      avgOccupancy,
      topInstructor,
      revenueByDay,
      grid,
      top5LTV,
      instructorPerf,
      returningCount,
      newCount,
      activeClients: customers.length,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, bookings, classes, customers]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-10">
      {/* Page Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="container mx-auto px-6 max-w-[1240px] py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest text-foreground">Analytics</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
              Business Intelligence — All Time
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <Activity size={10} className="text-primary" />
            Live Data
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-[1240px] py-8 space-y-8">

        {/* ── KPI CARDS ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            label="Total Revenue"
            value={formatPHP(analytics.totalRevenue)}
            sub="All-time paid"
            icon={<DollarSign size={15} />}
            accent="bg-emerald-500/10 text-emerald-600"
          />
          <KpiCard
            label="This Month"
            value={formatPHP(analytics.monthRevenue)}
            sub="Paid transactions"
            icon={<TrendingUp size={15} />}
            accent="bg-sky-500/10 text-sky-600"
          />
          <KpiCard
            label="Most Popular"
            value={analytics.popularClass?.title ?? '—'}
            sub={analytics.popularClass ? `${analytics.popularClass.bookedSpots.length} bookings` : 'No data'}
            icon={<Star size={15} />}
            accent="bg-amber-500/10 text-amber-600"
          />
          <KpiCard
            label="Top Instructor"
            value={analytics.topInstructor?.name.split(' ')[0] ?? '—'}
            sub={analytics.topInstructor?.name ?? '—'}
            icon={<Award size={15} />}
            accent="bg-violet-500/10 text-violet-600"
          />
          <KpiCard
            label="Active Clients"
            value={String(analytics.activeClients)}
            sub="Registered"
            icon={<Users size={15} />}
            accent="bg-rose-500/10 text-rose-600"
          />
          <KpiCard
            label="Avg Occupancy"
            value={formatPct(analytics.avgOccupancy)}
            sub="Across all classes"
            icon={<BarChart3 size={15} />}
            accent="bg-primary/10 text-primary"
          />
        </div>

        {/* ── REVENUE BAR CHART ──────────────────────────────────────── */}
        <Section title="Revenue — Last 30 Days" icon={<TrendingUp size={14} />}>
          {analytics.revenueByDay.every(d => d.revenue === 0) ? (
            <p className="text-sm text-muted-foreground italic text-center py-8">No paid transactions in the last 30 days.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
                <RevenueBarChart data={analytics.revenueByDay} />
              </div>
            </div>
          )}
        </Section>

        {/* ── OCCUPANCY HEATMAP ─────────────────────────────────────── */}
        <Section title="Class Occupancy Heatmap" icon={<CalendarDays size={14} />}>
          <p className="text-[10px] text-muted-foreground mb-4 font-medium">
            Average fill rate by day-of-week × time slot, across all scheduled classes.
          </p>
          <OccupancyHeatmap grid={analytics.grid} />
        </Section>

        {/* ── TWO-COLUMN: LTV + RETENTION ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top 5 LTV */}
          <Section title="Top 5 Clients by LTV" icon={<Star size={14} />}>
            {analytics.top5LTV.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-8">No transaction data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs" aria-label="Top 5 clients by lifetime value">
                  <thead>
                    <tr className="border-b border-border">
                      {['#', 'Client', 'Tier', 'Spent', 'Classes'].map(h => (
                        <th key={h} className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground pb-2 pr-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {analytics.top5LTV.map((c, i) => (
                      <tr key={c.email} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 pr-3">
                          <span className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black',
                            i === 0 ? 'bg-amber-100 text-amber-700' :
                            i === 1 ? 'bg-zinc-100 text-zinc-600' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-secondary text-muted-foreground'
                          )}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <p className="font-bold text-foreground text-[11px]">{c.name}</p>
                          <p className="text-muted-foreground text-[9px]">{c.email}</p>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">
                            {c.tier}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 font-black text-foreground text-[11px]">{formatPHP(c.total)}</td>
                        <td className="py-2.5 text-muted-foreground text-[11px] font-bold">{c.classesAttended}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Client Retention */}
          <Section title="Client Retention — This Month" icon={<Activity size={14} />}>
            <RetentionRing
              returning={analytics.returningCount}
              newClients={analytics.newCount}
            />
          </Section>
        </div>

        {/* ── INSTRUCTOR PERFORMANCE ────────────────────────────────── */}
        <Section title="Instructor Performance" icon={<Award size={14} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Instructor performance table">
              <thead>
                <tr className="border-b border-border">
                  {['Coach', 'Classes Taught', 'Avg Occupancy', 'Revenue Generated', 'Rating'].map(h => (
                    <th key={h} className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {analytics.instructorPerf.map(inst => (
                  <tr key={inst.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{inst.avatar}</span>
                        <span className="font-black text-foreground text-[11px]">{inst.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-bold text-foreground">{inst.classCount}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${inst.avgOcc}%` }}
                          />
                        </div>
                        <span className="font-bold text-foreground">{formatPct(inst.avgOcc)}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-black text-foreground">{formatPHP(inst.revenue)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 text-[10px]">★</span>
                        <span className="font-bold text-foreground">{inst.rating.toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </div>
    </div>
  );
}
