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
  PlusCircle,
  TrendingUp,
  User
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export default function ClientDashboard() {
  const { 
    bookings, 
    transactions, 
    customers, 
    cancelBooking,
    addTransaction
  } = useBooking();

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

  return (
    <div className="min-h-screen bg-[#121212] text-[#f5f5f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Profile Billboard */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF5E62]/10 to-[#FF9966]/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5E62] to-[#FF9966] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#FF5E62]/15">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{currentCustomer.name}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{currentCustomer.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-[#FF9966]/15 text-[#FF9966] border border-[#FF9966]/20 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5">
                  Premium Tier
                </Badge>
                <span className="text-[10px] text-zinc-500 font-semibold">• Joined Evolve Studio</span>
              </div>
            </div>
          </div>

          {/* Credits Quick Panel */}
          <div className="flex items-center gap-6 bg-[#121212] border border-[#2a2a2a] py-4 px-6 rounded-2xl w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FF5E62]/10 rounded-xl text-[#FF5E62]">
                <Wallet size={24} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Wallet Balance</span>
                <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1">
                  {currentCustomer.credits}
                  <span className="text-xs font-semibold text-[#FF9966]">Credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Bookings Ledger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Calendar size={18} className="text-[#FF5E62]" />
                MY BOOKING LEDGER
              </h3>
              <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-[10px] bg-[#151515]">
                {customerBookings.length} Bookings Total
              </Badge>
            </div>

            {customerBookings.length === 0 ? (
              <div className="bg-[#1a1a1a]/40 border border-[#2a2a2a] rounded-2xl p-12 text-center text-zinc-500">
                <Clock size={36} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-sm font-semibold">You don't have any bookings recorded yet.</p>
                <p className="text-xs text-zinc-600 mt-1">Book your first Pilates class on Evolve calendar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerBookings.map(booking => {
                  const isUpcoming = booking.status === 'upcoming';
                  const isCancelled = booking.status === 'cancelled';
                  const isAttended = booking.status === 'attended';

                  return (
                    <div 
                      key={booking.id}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-800 transition-all duration-300"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">Class Booking</span>
                          <span className="text-xs text-zinc-500">• Spot #{booking.spotNumber}</span>
                        </div>
                        <div className="text-xs text-zinc-400 space-y-1">
                          <p><strong>Booking ID:</strong> <span className="font-mono text-[10px]">{booking.id}</span></p>
                          <p><strong>Reserved At:</strong> {formatDate(booking.bookedAt)}</p>
                          <p><strong>Payment Mode:</strong> <span className="uppercase text-[10px] font-bold text-[#FF9966]">{booking.paymentMethod}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Status badge */}
                        <div>
                          {isCancelled && (
                            <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase flex items-center gap-1">
                              <XCircle size={10} /> Cancelled
                            </Badge>
                          )}
                          {isAttended && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase flex items-center gap-1">
                              <CheckCircle2 size={10} /> Attended
                            </Badge>
                          )}
                          {isUpcoming && (
                            <Badge className="bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[9px] font-black uppercase flex items-center gap-1">
                              <Clock size={10} /> Upcoming
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        {isUpcoming && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-all duration-300 uppercase tracking-wider text-[10px]"
                          >
                            Cancel Spot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 3: Top-up & Ledger Summary */}
          <div className="space-y-8">
            
            {/* Top-up Panel */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <CreditCard size={18} className="text-[#FF9966]" />
                TOP UP WALLET
              </h3>

              <div className="space-y-4">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Select Credit Bundle</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex flex-col items-center",
                        topUpAmount === amt
                          ? "border-[#FF5E62] bg-[#FF5E62]/10 text-white"
                          : "border-[#2a2a2a] bg-[#121212] hover:border-zinc-800 text-zinc-400"
                      )}
                    >
                      <span>+{amt}</span>
                      <span className="text-[9px] font-semibold text-zinc-500 mt-0.5">Credits</span>
                    </button>
                  ))}
                </div>

                <div className="bg-[#121212] border border-[#2a2a2a] p-4 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">Total Amount Due</span>
                  <div className="text-2xl font-black text-white font-mono">
                    ₱{(topUpAmount * 250).toLocaleString()}
                  </div>
                  <span className="text-[9px] text-zinc-500 block">Sourced via PayMongo Gateway (250 PHP / Credit)</span>
                </div>

                <button
                  onClick={handleTopUp}
                  disabled={isProcessingTopUp}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:shadow-[0_4px_20px_rgba(255,94,98,0.2)] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300"
                >
                  {isProcessingTopUp ? (
                    'Redirecting to checkout...'
                  ) : (
                    <>
                      <PlusCircle size={14} /> Buy Credits Now
                    </>
                  )}
                </button>

                {topUpSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center text-xs font-semibold text-emerald-500">
                    Wallet top-up successful! Credits synced.
                  </div>
                )}
              </div>
            </div>

            {/* Financial Activity Log */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <History size={18} className="text-zinc-400" />
                RECENT ACTIVITY
              </h3>

              {customerTransactions.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4">No recent financial logs.</p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {customerTransactions.map(tx => (
                    <div 
                      key={tx.id}
                      className="border-b border-[#2a2a2a] pb-3 last:border-b-0 last:pb-0 space-y-1"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-white leading-relaxed">
                          {tx.description}
                        </span>
                        <span className="text-xs font-black font-mono text-zinc-400 whitespace-nowrap">
                          ₱{tx.amount}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>{formatDate(tx.timestamp)}</span>
                        <span className="uppercase text-[9px] font-bold text-[#FF9966]">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
