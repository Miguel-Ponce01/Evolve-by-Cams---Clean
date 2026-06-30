'use client';

import { useMemo, useState, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  Search,
  Download,
  Sparkles,
  XCircle,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// 7-day Revenue Sparkline
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w   = 140;
  const h   = 36;
  const pad = 4;
  const step = (w - pad * 2) / (data.length - 1);
  const pts  = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v / max) * (h - pad * 2));
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area     = `${pad},${h - pad} ${polyline} ${pad + (data.length - 1) * step},${h - pad}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#spark-grad)" />
      <polyline points={polyline} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={pad + i * step} cy={h - pad - ((v / max) * (h - pad * 2))} r={i === data.length - 1 ? 3 : 2} fill="var(--primary)" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV Export helper
// ─────────────────────────────────────────────────────────────────────────────
function exportToCSV(rows: Array<Record<string, string | number>>, filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const val = String(r[h] ?? '').replace(/"/g, '""');
        return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Method badge
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
type DateFilter = 'today' | 'week' | 'all';

export default function SalesLedgerPage() {
  const { transactions, bookings, getClassById, customers, checkInBooking } = useBooking();
  const [searchQuery,   setSearchQuery]   = useState('');
  const [methodFilter,  setMethodFilter]  = useState<'all' | 'cash' | 'card' | 'credit'>('all');
  const [dateFilter,    setDateFilter]    = useState<DateFilter>('all');
  const [checkInMsg,    setCheckInMsg]    = useState('');
  const [expandedTxId,  setExpandedTxId]  = useState<string | null>(null);

  // ── Date boundary helpers ────────────────────────────────────────────────
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  }, []);

  // ── Revenue summary ──────────────────────────────────────────────────────
  const summary = useMemo(() => {
    let gross = 0, cash = 0, card = 0, creditsCount = 0, refundCount = 0, pendingCount = 0;
    transactions.forEach(t => {
      if (t.status === 'cancelled') { refundCount++; return; }
      if (t.status === 'pending') { pendingCount++; return; }
      if (t.status === 'paid') {
        if (t.paymentMethod === 'cash')   { cash += t.amount; gross += t.amount; }
        else if (t.paymentMethod === 'card')   { card += t.amount; gross += t.amount; }
        else if (t.paymentMethod === 'credit') { creditsCount++; }
      }
    });
    return { gross, cash, card, creditsCount, refundCount, pendingCount };
  }, [transactions]);

  // ── 7-day daily revenue sparkline data ──────────────────────────────────
  const sparklineData = useMemo(() => {
    const result: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d    = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const rev  = transactions
        .filter(t => t.timestamp.split('T')[0] === dStr && t.status === 'paid' && t.paymentMethod !== 'credit')
        .reduce((a, t) => a + t.amount, 0);
      result.push(rev);
    }
    return result;
  }, [transactions]);

  // ── Filtered transactions ─────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = t.timestamp.split('T')[0];
      const matchDate =
        dateFilter === 'all'   ? true :
        dateFilter === 'today' ? tDate === todayStr :
        tDate >= weekStart;

      const matchQuery  = !searchQuery ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
      return matchDate && matchQuery && matchMethod;
    }).sort((x, y) => y.timestamp.localeCompare(x.timestamp));
  }, [transactions, searchQuery, methodFilter, dateFilter, todayStr, weekStart]);

  // ── CSV export ─────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const rows = filteredTransactions.map(t => {
      const b = t.bookingId ? bookings.find(x => x.id === t.bookingId) : undefined;
      const cls = b ? getClassById(b.classId) : undefined;
      const cust = customers.find(c => c.email.toLowerCase() === t.customerEmail.toLowerCase());
      return {
        'Transaction ID':   t.id,
        'Type':             t.type,
        'Timestamp':        t.timestamp,
        'Client Name':      t.customerName,
        'Client Email':     t.customerEmail,
        'Client Phone':     t.customerPhone || '',
        'Item/Description': t.description,
        'Class':            cls?.title || '',
        'Spot #':           b?.spotNumber || '',
        'Payment Method':   t.paymentMethod,
        'Amount':           t.paymentMethod === 'credit' ? '1 credit' : `₱${t.amount.toFixed(2)}`,
        'Status':           t.status,
        'Booking Status':   b ? b.status : '',
        'Streak':           cust?.streak ?? 0,
        'Total Attended':   cust?.totalClassesAttended ?? 0,
      };
    });
    exportToCSV(rows, `evolve-ledger-${todayStr}.csv`);
  }, [filteredTransactions, bookings, getClassById, customers, todayStr]);

  // ── Check-in ──────────────────────────────────────────────────────────────
  const handleCheckIn = useCallback((bookingId: string) => {
    const res = checkInBooking(bookingId);
    setCheckInMsg(res.message);
    setTimeout(() => setCheckInMsg(''), 3000);
  }, [checkInBooking]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Operations Ledger</span>
            <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Sales &amp; Bookings Ledger</h1>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="btn-secondary-pill inline-flex items-center gap-1.5 border border-hairline bg-white text-xs py-2 px-4 cursor-pointer"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {/* Gross Revenue */}
        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden col-span-2 lg:col-span-1">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Gross Revenue</p>
            <TrendingUp size={13} className="text-primary opacity-60" />
          </div>
          <div className="mt-3 flex items-baseline gap-0.5 text-primary">
            <span className="text-sm font-bold">₱</span>
            <span className="text-2xl font-black font-mono">{summary.gross.toFixed(2)}</span>
          </div>
          <div className="mt-2">
            <Sparkline data={sparklineData} />
            <p className="text-[8px] text-muted-foreground font-mono mt-1">7-day revenue trend</p>
          </div>
        </div>

        {/* Cash */}
        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Cash Register</p>
            <span className="text-emerald-500 font-bold text-xs">₱</span>
          </div>
          <div className="mt-3 flex items-baseline gap-0.5 text-emerald-600">
            <span className="text-sm font-bold">₱</span>
            <span className="text-2xl font-black font-mono">{summary.cash.toFixed(2)}</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Card Reader</p>
            <CreditCard size={13} className="text-sky-500 opacity-60" />
          </div>
          <div className="mt-3 flex items-baseline gap-0.5 text-sky-600">
            <span className="text-sm font-bold">₱</span>
            <span className="text-2xl font-black font-mono">{summary.card.toFixed(2)}</span>
          </div>
        </div>

        {/* Pending Reader */}
        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Pending Reader</p>
            <AlertTriangle size={13} className="text-amber-500 opacity-60" />
          </div>
          <div className="mt-3 flex items-baseline gap-1 text-amber-500">
            <span className="text-2xl font-black font-mono">{summary.pendingCount}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">trials</span>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Credits Redeemed</p>
            <span className="text-amber-500 text-xs">🎟️</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1 text-amber-600">
            <span className="text-2xl font-black font-mono">{summary.creditsCount}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">passes</span>
          </div>
        </div>

        {/* Cancellations */}
        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-400" />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Cancellations</p>
            <XCircle size={13} className="text-red-400 opacity-60" />
          </div>
          <div className="mt-3 flex items-baseline gap-1 text-red-500">
            <span className="text-2xl font-black font-mono">{summary.refundCount}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">refunds</span>
          </div>
        </div>
      </div>

      {/* ── Sales Channel Breakdown ── */}
      <div className="bg-white border border-border rounded-3xl p-5 mb-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-sm uppercase tracking-wider text-foreground">Sales Distribution Breakdown</h3>
            <p className="text-[10px] text-muted-foreground font-semibold">Cash Register vs Card Reader — proportion of liquid revenue</p>
          </div>
          <span className="text-xs font-mono font-bold text-primary">Gross: ₱{(summary.cash + summary.card).toFixed(2)}</span>
        </div>
        <div className="w-full h-3.5 rounded-full bg-secondary overflow-hidden flex">
          {summary.cash + summary.card > 0 ? (
            <>
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(summary.cash / (summary.cash + summary.card)) * 100}%` }} title={`Cash: ₱${summary.cash.toFixed(2)}`} />
              <div className="bg-sky-500 h-full transition-all duration-500"    style={{ width: `${(summary.card / (summary.cash + summary.card)) * 100}%` }} title={`Card: ₱${summary.card.toFixed(2)}`} />
            </>
          ) : (
            <div className="w-full h-full bg-border" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Cash: ₱{summary.cash.toFixed(2)} ({summary.cash + summary.card > 0 ? ((summary.cash / (summary.cash + summary.card)) * 100).toFixed(1) : 0}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Card: ₱{summary.card.toFixed(2)} ({summary.cash + summary.card > 0 ? ((summary.card / (summary.cash + summary.card)) * 100).toFixed(1) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-card/30 border border-border/50 rounded-2xl p-4 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by client name, email, or transaction ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Date filter */}
            <div className="flex border border-border rounded-xl p-1 bg-background">
              {(['all', 'week', 'today'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={cn('px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer',
                    dateFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'Today'}
                </button>
              ))}
            </div>
            {/* Method filter */}
            <div className="flex border border-border rounded-xl p-1 bg-background">
              {(['all', 'cash', 'card', 'credit'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={cn('px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer',
                    methodFilter === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Check-in toast */}
      {checkInMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-600 font-semibold animate-slide-up">
          ✓ {checkInMsg}
        </div>
      )}

      {/* ── Transaction Table ── */}
      <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-lg">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-secondary/65 border-b border-border/80 text-muted-foreground uppercase tracking-widest text-[9px] font-bold">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Client</th>
                <th className="p-4">Streak</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Spot</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Check-In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 font-sans text-muted-foreground">
                    No transactions matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => {
                  const b = t.bookingId ? bookings.find(x => x.id === t.bookingId) : undefined;
                  const cls = b ? getClassById(b.classId) : undefined;
                  const cust = customers.find(c => c.email.toLowerCase() === t.customerEmail.toLowerCase());
                  const isExpanded = expandedTxId === t.id;
                  return (
                    <Fragment key={t.id}>
                      <tr 
                        onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                        className={cn("hover:bg-secondary/20 transition-colors cursor-pointer", isExpanded && "bg-secondary/35")}
                      >
                        <td className="p-4">
                          {b ? (
                            <Link 
                              href={`/book/${b.classId}/success/${b.id}`} 
                              onClick={e => e.stopPropagation()}
                              className="text-primary font-bold hover:underline"
                            >
                              {t.id.replace('tx-', '#').substring(0, 10)}
                            </Link>
                          ) : (
                            <span className="text-foreground font-bold">{t.id.replace('tx-', '#').substring(0, 10)}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider",
                            t.type === 'membership' ? "bg-amber-500/10 text-amber-700 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"
                          )}>
                            {t.type}
                          </Badge>
                        </td>
                        <td className="p-4 font-sans">
                          <p className="font-bold text-foreground">{t.customerName}</p>
                          <p className="text-[9px] text-muted-foreground">{t.customerEmail}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold text-[10px]">
                            🔥 {cust?.streak ?? 0}
                          </span>
                        </td>
                        <td className="p-4 font-sans text-foreground">
                          {t.description}
                        </td>
                        <td className="p-4 text-center">
                          {b ? (
                            <span className="w-6 h-6 rounded-full bg-canvas-lavender border border-primary/20 text-[9px] font-bold text-primary inline-flex items-center justify-center">
                              {b.spotNumber}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4"><MethodBadge method={t.paymentMethod} /></td>
                        <td className="p-4 text-foreground font-semibold">
                          {t.paymentMethod === 'credit'
                            ? <span className="text-amber-500">1 Credit</span>
                            : <span>₱{t.amount.toFixed(2)}</span>
                          }
                        </td>
                        <td className="p-4 text-muted-foreground text-[10px]">{formatDate(t.timestamp.split('T')[0])}</td>
                        <td className="p-4">
                          {t.status === 'cancelled' ? (
                            <span className="text-red-400 flex items-center gap-1 font-sans font-semibold"><XCircle size={12} /> Cancelled</span>
                          ) : t.status === 'pending' ? (
                            <span className="text-amber-500 flex items-center gap-1 font-sans font-semibold"><AlertTriangle size={12} className="animate-pulse" /> Pending</span>
                          ) : b?.status === 'attended' ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-sans font-semibold"><CheckCircle2 size={12} /> Attended</span>
                          ) : (
                            <span className="text-sky-500 flex items-center gap-1 font-sans font-semibold"><CheckCircle2 size={12} /> Paid</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {b && b.status === 'upcoming' && t.status === 'paid' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCheckIn(b.id); }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all cursor-pointer"
                            >
                              <UserCheck size={10} /> Check In
                            </button>
                          ) : (
                            <span className="text-[9px] text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-secondary/10 border-t-0">
                          <td colSpan={11} className="p-4 pl-6 border-t-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-foreground bg-white border border-border rounded-2xl p-5 shadow-sm font-sans" onClick={e => e.stopPropagation()}>
                              {/* Column 1: Transaction details */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary border-b border-border/40 pb-1">Transaction Details</h4>
                                <p><span className="font-semibold text-muted-foreground">ID:</span> <span className="font-mono">{t.id}</span></p>
                                <p><span className="font-semibold text-muted-foreground">Date/Time:</span> {new Date(t.timestamp).toLocaleString()}</p>
                                <p><span className="font-semibold text-muted-foreground">Type:</span> <span className="capitalize font-medium">{t.type}</span></p>
                                <p><span className="font-semibold text-muted-foreground">Item:</span> {t.description}</p>
                                <p><span className="font-semibold text-muted-foreground">Method:</span> <span className="capitalize">{t.paymentMethod}</span></p>
                                <p><span className="font-semibold text-muted-foreground">Amount:</span> {t.paymentMethod === 'credit' ? '1 Credit' : `₱${t.amount.toFixed(2)}`}</p>
                                <p><span className="font-semibold text-muted-foreground">Status:</span> <span className={cn("font-bold capitalize", t.status === 'cancelled' ? "text-red-500" : t.status === 'pending' ? "text-amber-500" : "text-emerald-600")}>{t.status}</span></p>
                              </div>

                              {/* Column 2: Client Profile */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary border-b border-border/40 pb-1">Client Profile</h4>
                                <p><span className="font-semibold text-muted-foreground">Name:</span> <span className="font-bold text-foreground">{t.customerName}</span></p>
                                <p><span className="font-semibold text-muted-foreground">Email:</span> {t.customerEmail}</p>
                                <p><span className="font-semibold text-muted-foreground">Phone:</span> {t.customerPhone || 'N/A'}</p>
                                {cust && (
                                  <>
                                    <p><span className="font-semibold text-muted-foreground">Membership:</span> {cust.membershipTier}</p>
                                    <p><span className="font-semibold text-muted-foreground">Credits Balance:</span> {cust.credits === 999 ? '∞' : cust.credits}</p>
                                    <p><span className="font-semibold text-muted-foreground">Workouts:</span> {cust.totalClassesAttended} classes (🔥 {cust.streak} streak)</p>
                                    {cust.birthday && <p><span className="font-semibold text-muted-foreground">Birthday:</span> 🎂 {cust.birthday}</p>}
                                    {cust.tags && cust.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        <span className="font-semibold text-muted-foreground mr-1">Tags:</span>
                                        {cust.tags.map(tag => (
                                          <span key={tag} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">{tag}</span>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Column 3: Booking/Class Info or Safety */}
                              <div className="space-y-2">
                                {b && cls ? (
                                  <>
                                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary border-b border-border/40 pb-1">Class &amp; Spot details</h4>
                                    <p><span className="font-semibold text-muted-foreground">Booking ID:</span> <span className="font-mono">{b.id}</span></p>
                                    <p><span className="font-semibold text-muted-foreground">Class Title:</span> <span className="font-bold">{cls.title}</span></p>
                                    <p><span className="font-semibold text-muted-foreground">Type/Level:</span> {cls.type} &middot; {cls.level}</p>
                                    <p><span className="font-semibold text-muted-foreground">Coach:</span> {cls.instructor.avatar} {cls.instructor.name}</p>
                                    <p><span className="font-semibold text-muted-foreground">Schedule:</span> {formatDate(cls.date)} at {cls.time} ({cls.duration} min)</p>
                                    <p><span className="font-semibold text-muted-foreground">Spot Securing:</span> <span className="font-bold text-primary font-mono">Spot #{b.spotNumber}</span></p>
                                    <p><span className="font-semibold text-muted-foreground">Check-in Status:</span> <span className="capitalize font-semibold">{b.status}</span></p>
                                  </>
                                ) : (
                                  <>
                                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary border-b border-border/40 pb-1">Safety &amp; Safety details</h4>
                                    {cust && (cust.emergencyContactName || cust.medicalNotes) ? (
                                      <div className="space-y-2">
                                        {cust.emergencyContactName && (
                                          <p>
                                            <span className="font-semibold text-muted-foreground">Emergency:</span> {cust.emergencyContactName} ({cust.emergencyContactRelation || 'Relation'}) &bull; <span className="font-mono">{cust.emergencyContactPhone}</span>
                                          </p>
                                        )}
                                        {cust.medicalNotes && (
                                          <div className="mt-1 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10px] leading-normal font-medium flex items-start gap-1">
                                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                            <div>
                                              <p className="font-black uppercase tracking-wider text-[8px] mb-0.5">Medical Safety Notes:</p>
                                              {cust.medicalNotes}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col justify-center items-center h-full text-center py-6 text-muted-foreground">
                                        <span className="text-xl">💳</span>
                                        <p className="text-[10px] font-bold uppercase mt-1">Membership Transaction</p>
                                        <p className="text-[9px]">No associated Pilates booking or health alerts.</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-border/60">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No transactions matching current filters.</div>
          ) : (
            filteredTransactions.map(t => {
              const b = t.bookingId ? bookings.find(x => x.id === t.bookingId) : undefined;
              const cls = b ? getClassById(b.classId) : undefined;
              const cust = customers.find(c => c.email.toLowerCase() === t.customerEmail.toLowerCase());
              const isExpanded = expandedTxId === t.id;
              return (
                <div 
                  key={t.id} 
                  onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                  className={cn("p-4 space-y-2.5 text-xs font-mono cursor-pointer hover:bg-secondary/40 transition-colors", isExpanded && "bg-secondary/20")}
                >
                  <div className="flex justify-between items-center">
                    {b ? (
                      <Link 
                        href={`/book/${b.classId}/success/${b.id}`} 
                        onClick={e => e.stopPropagation()}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        {t.id.replace('tx-', '#').substring(0, 10)}
                      </Link>
                    ) : (
                      <span className="text-foreground font-bold">{t.id.replace('tx-', '#').substring(0, 10)}</span>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[8px] font-bold uppercase tracking-wider py-0 px-1.5",
                        t.type === 'membership' ? "bg-amber-500/10 text-amber-700 border-amber-500/20" : "bg-primary/10 text-primary border-primary/20"
                      )}>
                        {t.type}
                      </Badge>
                      <MethodBadge method={t.paymentMethod} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-sans font-bold text-sm text-foreground">{t.customerName}</p>
                    <p className="text-muted-foreground">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(t.timestamp.split('T')[0])} · 🔥 {cust?.streak ?? 0} streak · 
                      {t.status === 'cancelled' ? (
                        <span className="text-red-400 font-semibold font-sans ml-1">Cancelled</span>
                      ) : t.status === 'pending' ? (
                        <span className="text-amber-500 font-semibold font-sans ml-1">Pending</span>
                      ) : b?.status === 'attended' ? (
                        <span className="text-emerald-400 font-semibold font-sans ml-1">Attended</span>
                      ) : (
                        <span className="text-sky-500 font-semibold font-sans ml-1">Paid</span>
                      )}
                    </p>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/40 pt-2">
                    <span className="font-sans font-bold text-muted-foreground text-[10px] uppercase">Total:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {t.paymentMethod === 'credit' ? '1 Credit' : `₱${t.amount.toFixed(2)}`}
                      </span>
                      {b && b.status === 'upcoming' && t.status === 'paid' && (
                        <button onClick={(e) => { e.stopPropagation(); handleCheckIn(b.id); }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase cursor-pointer">
                          <UserCheck size={9} /> Check In
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Mobile details panel */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-border/40 space-y-4 font-sans text-xs text-foreground animate-slide-up" onClick={e => e.stopPropagation()}>
                      {/* Section 1: Transaction details */}
                      <div className="space-y-1.5 bg-secondary/30 p-3 rounded-xl border border-border/40">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary">Transaction Info</p>
                        <p><span className="font-semibold text-muted-foreground">ID:</span> <span className="font-mono text-[10px]">{t.id}</span></p>
                        <p><span className="font-semibold text-muted-foreground">Timestamp:</span> {new Date(t.timestamp).toLocaleString()}</p>
                        <p><span className="font-semibold text-muted-foreground">Description:</span> {t.description}</p>
                        <p><span className="font-semibold text-muted-foreground">Payment Status:</span> <span className="capitalize font-bold text-primary">{t.status}</span></p>
                      </div>

                      {/* Section 2: Client Profile */}
                      <div className="space-y-1.5 bg-secondary/30 p-3 rounded-xl border border-border/40">
                        <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary">Client Profile</p>
                        <p><span className="font-semibold text-muted-foreground">Name:</span> <span className="font-bold">{t.customerName}</span></p>
                        <p><span className="font-semibold text-muted-foreground">Email:</span> {t.customerEmail}</p>
                        <p><span className="font-semibold text-muted-foreground">Phone:</span> {t.customerPhone || 'N/A'}</p>
                        {cust && (
                          <>
                            <p><span className="font-semibold text-muted-foreground">Membership:</span> {cust.membershipTier}</p>
                            <p><span className="font-semibold text-muted-foreground">Credits Balance:</span> {cust.credits === 999 ? '∞' : cust.credits}</p>
                            {cust.birthday && <p><span className="font-semibold text-muted-foreground">Birthday:</span> 🎂 {cust.birthday}</p>}
                            {cust.tags && cust.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cust.tags.map(tag => (
                                  <span key={tag} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">{tag}</span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Section 3: Booking/Safety Profile */}
                      {b && cls ? (
                        <div className="space-y-1.5 bg-secondary/30 p-3 rounded-xl border border-border/40">
                          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary">Class &amp; Spot Details</p>
                          <p><span className="font-semibold text-muted-foreground">Class Title:</span> <span className="font-bold text-foreground">{cls.title}</span></p>
                          <p><span className="font-semibold text-muted-foreground">Instructor:</span> {cls.instructor.avatar} {cls.instructor.name}</p>
                          <p><span className="font-semibold text-muted-foreground">Date/Time:</span> {formatDate(cls.date)} at {cls.time}</p>
                          <p><span className="font-semibold text-muted-foreground">Spot Securing:</span> <span className="font-bold text-primary">Spot #{b.spotNumber}</span></p>
                          <p><span className="font-semibold text-muted-foreground">Booking Status:</span> <span className="capitalize">{b.status}</span></p>
                        </div>
                      ) : cust && (cust.emergencyContactName || cust.medicalNotes) ? (
                        <div className="space-y-1.5 bg-secondary/30 p-3 rounded-xl border border-border/40">
                          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary">Safety &amp; Emergency</p>
                          {cust.emergencyContactName && (
                            <p><span className="font-semibold text-muted-foreground">Emergency Contact:</span> {cust.emergencyContactName} ({cust.emergencyContactRelation || 'Relation'}) &bull; <span className="font-mono">{cust.emergencyContactPhone}</span></p>
                          )}
                          {cust.medicalNotes && (
                            <div className="mt-1 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] leading-normal font-medium flex items-start gap-1">
                              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold uppercase tracking-wider text-[8px] mb-0.5">Safety/Medical Notes:</p>
                                {cust.medicalNotes}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer count */}
      <p className="text-center text-[10px] text-muted-foreground font-mono mt-4 uppercase tracking-widest">
        Showing {filteredTransactions.length} of {transactions.length} total transactions
      </p>
    </div>
  );
}
