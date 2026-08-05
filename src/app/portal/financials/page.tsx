'use client';

import { useState, useMemo } from 'react';
import { useBooking } from '@/context/BookingContext';
import { 
  DollarSign, TrendingUp, CreditCard, Clock, XCircle, Search, Calendar, RefreshCw 
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function FinancialsPage() {
  const { transactions, bookings, classes } = useBooking();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'today'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'card' | 'credit'>('all');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = q === '' || 
                          t.id.toLowerCase().includes(q) || 
                          t.customerName.toLowerCase().includes(q) || 
                          t.customerEmail.toLowerCase().includes(q) || 
                          t.description.toLowerCase().includes(q);

      // 2. Time Filter
      const matchTime = timeFilter === 'all' || 
                        (timeFilter === 'today' && t.timestamp.startsWith(todayStr)) || 
                        (timeFilter === 'month' && t.timestamp.startsWith(thisMonthStr));

      // 3. Payment Method Filter
      const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;

      return matchSearch && matchTime && matchMethod;
    });
  }, [transactions, searchQuery, timeFilter, methodFilter, todayStr, thisMonthStr]);

  // Derived KPIs
  const kpis = useMemo(() => {
    const activeTx = transactions.filter(t => t.status === 'paid');
    const pendingTx = transactions.filter(t => t.status === 'pending');
    const refundedTx = transactions.filter(t => (t.status as string) === 'refunded' || t.status === 'cancelled');

    const grossRevenue = activeTx.reduce((s, t) => s + t.amount, 0);
    const cashRegistry = activeTx.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.amount, 0);
    const cardPayments = activeTx.filter(t => t.paymentMethod === 'card').reduce((s, t) => s + t.amount, 0);
    const creditPayments = activeTx.filter(t => t.paymentMethod === 'credit').reduce((s, t) => s + t.amount, 0);
    const pendingSum = pendingTx.reduce((s, t) => s + t.amount, 0);
    const cancelledCount = refundedTx.length;

    // Distribution breakdown
    const distribution: Record<string, number> = {
      'Pole Fitness': 0,
      'Aerial Sling': 0,
      'Sexy Chair': 0,
      'Yoga': 0,
      'Kids': 0,
      'Other': 0
    };

    activeTx.forEach(t => {
      if (t.description.includes('Pole')) distribution['Pole Fitness'] += t.amount;
      else if (t.description.includes('Sling')) distribution['Aerial Sling'] += t.amount;
      else if (t.description.includes('Chair')) distribution['Sexy Chair'] += t.amount;
      else if (t.description.includes('Yoga')) distribution['Yoga'] += t.amount;
      else if (t.description.includes('Kids')) distribution['Kids'] += t.amount;
      else distribution['Other'] += t.amount;
    });

    return {
      grossRevenue,
      cashRegistry,
      cardPayments,
      creditPayments,
      pendingSum,
      pendingCount: pendingTx.length,
      cancelledCount,
      distribution
    };
  }, [transactions]);

  function formatPHP(amount: number) {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] py-12 px-6 sm:px-8 font-sans relative z-10 selection:bg-[#C9A961] selection:text-black text-left animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="border-b border-zinc-900 pb-8">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Financial Ledger &amp; Auditing</span>
          <h1 className="text-3xl font-serif font-light tracking-[0.1em] text-white mt-1">
            FINANCIAL REPORTS
          </h1>
          <p className="text-xs text-zinc-550 mt-1">Gross revenue reporting, register cash tracking, transaction history audit, and class breakdowns.</p>
        </div>

        {/* KPIs grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-2">
            <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-black block">Gross Revenue</span>
            <span className="text-lg font-black text-white font-mono block">{formatPHP(kpis.grossRevenue)}</span>
            <span className="text-[9px] text-zinc-550 block">All-time paid</span>
          </div>

          <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-2">
            <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-black block">Cash Registry</span>
            <span className="text-lg font-black text-emerald-400 font-mono block">{formatPHP(kpis.cashRegistry)}</span>
            <span className="text-[9px] text-zinc-550 block">Drawer total</span>
          </div>

          <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-2">
            <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-black block">Card Payments</span>
            <span className="text-lg font-black text-sky-400 font-mono block">{formatPHP(kpis.cardPayments)}</span>
            <span className="text-[9px] text-zinc-550 block">Stripe Terminal</span>
          </div>

          <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-2">
            <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-black block">Pending Approvals</span>
            <span className="text-lg font-black text-amber-500 font-mono block">{formatPHP(kpis.pendingSum)}</span>
            <span className="text-[9px] text-zinc-550 block">{kpis.pendingCount} pending requests</span>
          </div>

          <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-2">
            <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-black block">Cancelled / Refunds</span>
            <span className="text-lg font-black text-red-400 font-mono block">{kpis.cancelledCount} bookings</span>
            <span className="text-[9px] text-zinc-550 block">Returned credits</span>
          </div>

          <div className="bg-[#121212] border border-zinc-900 rounded-2xl p-5 space-y-2">
            <span className="text-[8px] uppercase tracking-widest text-zinc-550 font-black block">Credit Packages</span>
            <span className="text-lg font-black text-[#C9A961] font-mono block">{formatPHP(kpis.creditPayments)}</span>
            <span className="text-[9px] text-zinc-550 block">Member top-ups</span>
          </div>
        </div>

        {/* Breakdown distribution */}
        <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Revenue Distribution by Discipline</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(kpis.distribution).map(([cat, val]) => (
              <div key={cat} className="p-4 bg-black/20 border border-zinc-900 rounded-2xl">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block">{cat}</span>
                <span className="text-sm font-black text-white font-mono mt-1 block">{formatPHP(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search tx, client, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-zinc-800 text-xs text-white pl-8 pr-4 py-2.5 focus:outline-none focus:border-[#C9A961] rounded-xl"
              />
              <Search size={12} className="absolute left-3 top-3.5 text-zinc-500" />
            </div>

            {/* Time filters */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-850 gap-1 w-full md:w-auto overflow-x-auto">
              {(['all', 'month', 'today'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={cn(
                    "flex-1 md:flex-none px-4 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                    timeFilter === f ? "bg-[#C9A961] text-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {f === 'all' ? 'All Time' : f === 'month' ? 'This Month' : 'Today'}
                </button>
              ))}
            </div>

            {/* Payment Method Filters */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-zinc-850 gap-1 w-full md:w-auto overflow-x-auto">
              {(['all', 'cash', 'card', 'credit'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={cn(
                    "flex-1 md:flex-none px-4 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                    methodFilter === m ? "bg-[#C9A961] text-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-900 bg-black/20">
            <table className="w-full text-xs" aria-label="Transactions sales history ledger">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-900">
                  {['Tx ID', 'Client', 'Description', 'Payment', 'Amount', 'Status', 'Handled By', 'Timestamp'].map(h => (
                    <th key={h} className="text-left text-[9px] font-black uppercase tracking-widest text-zinc-500 py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 bg-black/5">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-400">{t.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{t.customerName}</p>
                      <p className="text-[9px] text-zinc-550 font-mono">{t.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-300">{t.description}</td>
                    <td className="py-3 px-4">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase">{t.paymentMethod}</span>
                    </td>
                    <td className="py-3 px-4 font-black text-white">{formatPHP(t.amount)}</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider font-mono inline-block",
                        t.status === 'paid' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        t.status === 'pending' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-bold">{t.handledBy || 'POS reader'}</td>
                    <td className="py-3 px-4 font-mono text-[9px] text-zinc-500">{formatDate(t.timestamp)}</td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 italic">No transactions match your search filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
