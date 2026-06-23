'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  Search, 
  FileSpreadsheet, 
  Sparkles, 
  Calendar,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SalesLedgerPage() {
  const { bookings, getClassById } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'card' | 'credit'>('all');

  // Ledger calculation summary
  const summary = useMemo(() => {
    let gross = 0;
    let cash = 0;
    let card = 0;
    let creditsCount = 0;
    let refundCount = 0;

    bookings.forEach(b => {
      if (b.status === 'cancelled') {
        refundCount++;
        return;
      }
      
      if (b.paymentMethod === 'cash') {
        cash += b.amountPaid;
        gross += b.amountPaid;
      } else if (b.paymentMethod === 'card') {
        card += b.amountPaid;
        gross += b.amountPaid;
      } else if (b.paymentMethod === 'credit') {
        creditsCount++;
      }
    });

    return { gross, cash, card, creditsCount, refundCount };
  }, [bookings]);

  // Filtered transactions list
  const filteredTransactions = useMemo(() => {
    return bookings.filter(b => {
      const matchQuery = !searchQuery || 
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.id.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchMethod = methodFilter === 'all' || b.paymentMethod === methodFilter;

      return matchQuery && matchMethod;
    }).sort((x, y) => y.bookedAt.localeCompare(x.bookedAt)); // Latest first
  }, [bookings, searchQuery, methodFilter]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Operations Ledger</span>
            <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Sales & Bookings Ledger</h1>
          </div>
        </div>
        <div>
          <button 
            onClick={() => window.print()}
            className="btn-secondary-pill inline-flex items-center gap-1.5 border border-hairline bg-white text-xs py-2 px-4 cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* POS Ledgers Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Gross Sales Revenue</p>
          <div className="mt-2 flex items-baseline gap-1 text-primary">
            <span className="text-sm font-bold">$</span>
            <span className="text-2xl font-black">{summary.gross.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Cash Register Balance</p>
          <div className="mt-2 flex items-baseline gap-1 text-emerald-400">
            <span className="text-sm font-bold">$</span>
            <span className="text-2xl font-black">{summary.cash.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Card Reader Sales</p>
          <div className="mt-2 flex items-baseline gap-1 text-sky-400">
            <span className="text-sm font-bold">$</span>
            <span className="text-2xl font-black">{summary.card.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Studio Credits Redeemed</p>
          <div className="mt-2 flex items-baseline gap-1 text-amber-500">
            <span className="text-2xl font-black">{summary.creditsCount}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">credits</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Cancellations Ledger</p>
          <div className="mt-2 flex items-baseline gap-1 text-red-400">
            <span className="text-2xl font-black">{summary.refundCount}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">refunds</span>
          </div>
        </div>
      </div>

      {/* Transaction Table Filters */}
      <div className="bg-card/30 border border-border/50 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search ledger by client name or booking ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase font-mono">Payment Type:</span>
            <div className="flex border border-border rounded-xl p-1 bg-background">
              {(['all', 'cash', 'card', 'credit'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                    methodFilter === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
        {/* Responsive Table for desktop, list items for mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-secondary/65 border-b border-border/80 text-muted-foreground uppercase tracking-widest text-[9px] font-bold">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Pilates Class Session</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-sans text-muted-foreground">
                    No transactions registered matching search parameters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(b => {
                  const cls = getClassById(b.classId);
                  return (
                    <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4 text-primary font-bold">
                        <Link href={`/book/${b.classId}/success/${b.id}`} className="hover:underline">
                          {b.id.replace('booking-', '#')}
                        </Link>
                      </td>
                      <td className="p-4 font-sans font-bold text-foreground">{b.customerName}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(b.bookedAt.split('T')[0])}</td>
                      <td className="p-4 font-sans text-foreground">
                        {cls ? (
                          <span>{cls.title} <span className="text-[10px] text-muted-foreground">({cls.time})</span></span>
                        ) : (
                          'Class Session'
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          b.paymentMethod === 'cash' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          b.paymentMethod === 'card' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 text-foreground font-semibold">
                        {b.paymentMethod === 'credit' ? (
                          <span className="text-amber-500">1 Credit</span>
                        ) : (
                          <span>${b.amountPaid.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {b.status === 'cancelled' ? (
                          <span className="text-red-400 flex items-center gap-1 font-sans font-semibold">
                            <XCircle size={12} /> Refunded
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1 font-sans font-semibold">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (Viewports < 768px) */}
        <div className="block md:hidden divide-y divide-border/60">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No transactions registered matching search parameters.
            </div>
          ) : (
            filteredTransactions.map(b => {
              const cls = getClassById(b.classId);
              return (
                <div key={b.id} className="p-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold text-sm">
                      <Link href={`/book/${b.classId}/success/${b.id}`} className="hover:underline">
                        {b.id.replace('booking-', '#')}
                      </Link>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      b.paymentMethod === 'cash' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      b.paymentMethod === 'card' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {b.paymentMethod}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-sans font-bold text-sm text-foreground">{b.customerName}</p>
                    <p className="text-muted-foreground">{cls?.title} · {cls?.time} · Spot #{b.spotNumber}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(b.bookedAt.split('T')[0])}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-border/40 pt-2">
                    <span className="font-sans font-bold text-muted-foreground text-[10px] uppercase">Transaction Total:</span>
                    <span className="font-semibold text-foreground">
                      {b.paymentMethod === 'credit' ? '1 Credit' : `$${b.amountPaid.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
