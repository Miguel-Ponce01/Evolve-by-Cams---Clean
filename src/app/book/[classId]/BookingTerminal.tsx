'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, User, CreditCard, DollarSign, Sparkles } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

export default function BookingTerminalPage() {
  const { classId } = useParams();
  const router = useRouter();
  const { getClassById, getBookingForSpot, customers, bookSpot, joinWaitlist } = useBooking();

  const cls = useMemo(() => getClassById(classId as string), [getClassById, classId]);

  // POS Form State
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  
  // Customer lookup/registration state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Waitlist form state (if class is full)
  const [wlName, setWlName] = useState('');
  const [wlEmail, setWlEmail] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlMsg, setWlMsg] = useState('');

  // Filter customers for dropdown
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const selectExistingCustomer = (id: string) => {
    const c = customers.find(x => x.id === id);
    if (c) {
      setSelectedCustomerId(c.id);
      setCustName(c.name);
      setCustEmail(c.email);
      setCustPhone(c.phone || '');
      setSearchQuery('');
      // Default payment method
      if (c.credits > 0) {
        setPaymentMethod('credit');
      } else {
        setPaymentMethod('cash');
      }
    }
  };

  const clearCustomerSelection = () => {
    setSelectedCustomerId(null);
    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setPaymentMethod('cash');
  };

  // Pricing calculations
  const priceStats = useMemo(() => {
    if (!cls) return { base: 0, discount: 0, tax: 0, total: 0 };
    const base = cls.price;
    const discount = promoApplied ? base * 0.1 : 0;
    const subtotal = base - discount;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { base, discount, tax, total };
  }, [cls, promoApplied]);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'EVOLVE10') {
      setPromoApplied(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid promo code.');
      setPromoApplied(false);
    }
  };

  const handleProcessBooking = () => {
    if (!selectedSpot) return;
    if (!custName.trim() || !custEmail.trim()) {
      setErrorMessage('Customer Name and Email are required.');
      return;
    }

    const res = bookSpot(
      classId as string,
      selectedSpot,
      paymentMethod,
      custName,
      custEmail,
      custPhone,
      promoApplied ? 'EVOLVE10' : undefined
    );

    if (res.success && res.booking) {
      router.push(`/book/${classId}/success/${res.booking.id}`);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlName.trim() || !wlEmail.trim()) {
      setErrorMessage('Waitlist Name and Email are required.');
      return;
    }
    joinWaitlist(classId as string, wlName, wlEmail, wlPhone);
    setWlMsg(`✓ Customer ${wlName} has been registered to the waitlist.`);
    setWlName('');
    setWlEmail('');
    setWlPhone('');
  };

  if (!cls) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-400 font-bold">Class session not found.</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return to dashboard</Link>
      </div>
    );
  }

  const isClassFull = cls.bookedSpots.length >= cls.totalSpots;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to POS Dashboard
      </Link>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">Front Desk Intake</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Class Roster & Booking Console</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Class: <span className="font-bold text-foreground">{cls.title}</span> · Date: {formatDate(cls.date)} · Time: {cls.time} · Coach: {cls.instructor.name}
          </p>
        </div>
        <div>
          {isClassFull ? (
            <Badge variant="destructive" className="uppercase font-black text-xs tracking-wider px-3 py-1">Class Fully Booked</Badge>
          ) : (
            <Badge className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 uppercase font-black text-xs tracking-wider px-3 py-1">
              {cls.totalSpots - cls.bookedSpots.length} spots remaining
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand Side: Studio Floor Map */}
        <div className="lg:col-span-7">
          <div className="bg-card/50 border border-border/50 rounded-3xl p-6 relative backdrop-blur-sm">
            <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-6 text-center">Studio Layout (Front Desk Map)</h2>
            
            {/* Studio Front/Instructor Area */}
            <div className="w-full flex justify-center mb-8">
              <Badge variant="outline" className="px-6 py-2 uppercase tracking-widest bg-background/50 border-primary/45 text-primary text-xs font-bold font-mono">
                Coach Station ({cls.instructor.name})
              </Badge>
            </div>

            {/* Spot Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {Array.from({ length: cls.totalSpots }).map((_, i) => {
                const spotNumber = i + 1;
                const b = getBookingForSpot(cls.id, spotNumber);
                const isBooked = !!b;
                const isSelected = selectedSpot === spotNumber;

                return (
                  <button
                    key={spotNumber}
                    disabled={isBooked || isClassFull}
                    onClick={() => {
                      setSelectedSpot(spotNumber === selectedSpot ? null : spotNumber);
                      setErrorMessage('');
                    }}
                    className={cn(
                      "relative h-22 rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-2 cursor-pointer select-none",
                      isBooked && 'bg-secondary/40 border-border/40 opacity-70 cursor-not-allowed',
                      isSelected && 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-102',
                      !isBooked && !isSelected && 'bg-card border-border hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    <span className={cn(
                      "font-mono text-xl font-black",
                      isSelected ? 'text-primary animate-pulse' : 'text-foreground'
                    )}>
                      #{spotNumber}
                    </span>
                    
                    {isBooked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 rounded-2xl backdrop-blur-[1px] p-1 text-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-destructive mb-0.5">Taken</span>
                        <span className="text-[8px] font-bold text-muted-foreground truncate max-w-full" title={b.customerName}>
                          {b.customerName.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    
                    {isSelected && (
                      <CheckCircle2 className="absolute -top-2 -right-2 text-primary bg-background rounded-full w-5 h-5 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Hand Side: POS Admin Terminal Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Error Message Toast */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-red-500/30 text-sm text-red-400 font-semibold animate-slide-up">
              ⚠ Error: {errorMessage}
            </div>
          )}

          {isClassFull ? (
            /* Waitlist Booking Intake Form */
            <div className="bg-card border border-border p-6 rounded-3xl space-y-4">
              <div className="border-b border-border/50 pb-3">
                <h3 className="font-heading font-black text-lg uppercase tracking-wide">Register to Waitlist</h3>
                <p className="text-xs text-muted-foreground">Class is full. Register this customer to be notified of open spots.</p>
              </div>

              {wlMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 font-medium">
                  {wlMsg}
                </div>
              )}

              <form onSubmit={handleJoinWaitlist} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter client's full name"
                    value={wlName}
                    onChange={e => setWlName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Client Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={wlEmail}
                    onChange={e => setWlEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Client Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+63 9xx xxx xxxx"
                    value={wlPhone}
                    onChange={e => setWlPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <button type="submit" className="btn-primary-pill w-full text-center uppercase tracking-widest cursor-pointer">
                  Register on Waitlist
                </button>
              </form>
            </div>
          ) : !selectedSpot ? (
            /* Choose Spot Instruction Card */
            <div className="bg-card/40 border border-border/50 p-6 rounded-3xl text-center py-10">
              <span className="text-3xl block mb-2">🎯</span>
              <h3 className="font-heading font-black text-lg uppercase">Select Studio Spot</h3>
              <p className="text-sm text-muted-foreground mt-1.5">Please click on an available numbered Pilates spot on the layout map to begin checkout.</p>
            </div>
          ) : (
            /* Active Intake checkout form */
            <div className="bg-card border border-border p-6 rounded-3xl space-y-5">
              <div className="border-b border-border/50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-black text-lg uppercase tracking-wide">Spot Checkout</h3>
                  <p className="text-xs text-muted-foreground">Booking Spot <span className="text-primary font-bold font-mono">#{selectedSpot}</span> for client</p>
                </div>
                <button 
                  onClick={() => setSelectedSpot(null)}
                  className="text-xs text-muted-foreground hover:text-destructive underline"
                >
                  Change Spot
                </button>
              </div>

              {/* 1. Customer Search Registry Selector */}
              <div className="space-y-2 relative">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Search Client Registry</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search existing customer by name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
                {/* Search Dropdown Matches */}
                {filteredCustomers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-border/60">
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => selectExistingCustomer(c.id)}
                        className="w-full text-left px-4 py-2 hover:bg-secondary text-sm flex justify-between items-center cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono font-bold text-primary border-primary/20">
                          {c.credits} credits
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Customer Details Card / Walk-in input */}
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Customer Profile</span>
                  {selectedCustomerId && (
                    <button 
                      onClick={clearCustomerSelection}
                      className="text-[10px] text-destructive hover:underline"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    required
                    value={custName}
                    disabled={!!selectedCustomerId}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <input
                    type="email"
                    placeholder="Customer Email *"
                    required
                    value={custEmail}
                    disabled={!!selectedCustomerId}
                    onChange={e => setCustEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <input
                    type="tel"
                    placeholder="Customer Phone (Optional)"
                    value={custPhone}
                    disabled={!!selectedCustomerId}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                {selectedCustomerId && activeCustomer && (
                  <div className="text-[11px] text-muted-foreground flex justify-between items-center pt-1">
                    <span>Membership: <span className="font-semibold text-foreground">{activeCustomer.membershipTier}</span></span>
                    <span>Credits: <span className="font-bold text-primary font-mono">{activeCustomer.credits}</span></span>
                  </div>
                )}
              </div>

              {/* 3. Payment Method Select */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Select payment method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer",
                      paymentMethod === 'cash'
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <DollarSign size={14} /> Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer",
                      paymentMethod === 'card'
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <CreditCard size={14} /> Card
                  </button>
                  <button
                    onClick={() => {
                      if (activeCustomer && activeCustomer.credits > 0) {
                        setPaymentMethod('credit');
                      }
                    }}
                    disabled={!activeCustomer || activeCustomer.credits < 1}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer",
                      paymentMethod === 'credit'
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed'
                    )}
                  >
                    <Sparkles size={14} /> Credits
                  </button>
                </div>
              </div>

              {/* 4. Promo Code input (disabled if credits) */}
              {paymentMethod !== 'credit' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Discount Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. EVOLVE10"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary disabled:opacity-60"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode}
                      className="px-4 py-1.5 rounded-xl bg-secondary text-xs font-semibold hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors"
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}

              {/* 5. Cost Breakdown */}
              <div className="bg-secondary/20 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Pilates Ticket:</span>
                  <span className="font-mono">${priceStats.base.toFixed(2)}</span>
                </div>
                {paymentMethod === 'credit' ? (
                  <div className="flex justify-between text-primary font-semibold border-t border-border/40 pt-2 text-sm">
                    <span>Billing Charge:</span>
                    <span>1 class credit</span>
                  </div>
                ) : (
                  <>
                    {priceStats.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount (EVOLVE10):</span>
                        <span className="font-mono">-${priceStats.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes (8%):</span>
                      <span className="font-mono">${priceStats.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-primary border-t border-border/40 pt-2">
                      <span>Total Amount:</span>
                      <span className="font-mono">${priceStats.total.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* 6. Checkout action */}
              <button
                onClick={handleProcessBooking}
                className="btn-primary-pill w-full text-center uppercase tracking-widest py-4 shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer"
              >
                Process & Book Spot #{selectedSpot}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
