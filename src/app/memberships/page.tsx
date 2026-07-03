'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Search,
  Sparkles,
  CreditCard,
  DollarSign,
  Check,
  ShoppingBag,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PackType } from '@/types';

interface PackageItem {
  id: PackType;
  title: string;
  price: number;
  credits: number;
  perClass: string;
  desc: string;
  popular?: boolean;
}

const PACKAGES: PackageItem[] = [
  {
    id: 'single',
    title: 'Single Class Pass (Group Class)',
    price: 700,
    credits: 1,
    perClass: '₱700/class',
    desc: 'Valid for all Pole Group Classes (All Levels). Perfect for walk-ins and trial sessions.',
  },
  {
    id: 'five',
    title: 'Davao Group Class Pass Pack',
    price: 1000,
    credits: 1,
    perClass: '₱1,000/class',
    desc: 'Evolve Davao Studio Group Class pass (Pole/Aerial Group Class All Levels).',
    popular: true,
  },
  {
    id: 'ten',
    title: 'Private Class (Pole / Aerial / Exole / Acro / Sexy Chair)',
    price: 1800,
    credits: 1,
    perClass: '₱1,800/hour',
    desc: 'Personalized training, faster progress, and a stronger you. Gracious in the air or bold on the floor.',
  },
  {
    id: 'unlimited',
    title: 'Annual Membership Fee',
    price: 1500,
    credits: 0,
    perClass: '₱1,500/year',
    desc: 'Annual Membership registration fee to access packages and premium features.',
  },
];

export default function PackageSalesPage() {
  const { customers, buyCreditsForCustomer, addTransaction, updateTransactionStatus } = useBooking();

  const [selectedPack, setSelectedPack] = useState<PackageItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [terminalStateMsg, setTerminalStateMsg] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('Cams Rivera');
  const [cashPercent, setCashPercent] = useState<number>(100);
  const [walletPercent, setWalletPercent] = useState<number>(0);

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

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setSearchQuery('');
    setErrorMsg('');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPack) return;
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer to credit.');
      return;
    }

    const client = customers.find(c => c.id === selectedCustomerId);
    if (!client) {
      setErrorMsg('Selected client not found.');
      return;
    }

    const cashAmount = (selectedPack.price * cashPercent) / 100;
    const walletAmount = (selectedPack.price * walletPercent) / 100;

    if (walletAmount > 0) {
      // Wallet balance check (simulation)
      const creditsNeeded = walletAmount / 250; // assuming 250 PHP per credit unit
      if (client.credits < creditsNeeded && selectedPack.id !== 'unlimited') {
        setErrorMsg(`Insufficient wallet credits. Client has ${client.credits} credits, but needs ${(creditsNeeded).toFixed(1)} credits to cover ₱${walletAmount.toFixed(2)}.`);
        return;
      }
      // Deduct client credits
      if (selectedPack.id !== 'unlimited') {
        client.credits = Math.max(0, client.credits - Math.floor(creditsNeeded));
      }
    }

    // Assign credits/tier for the availed pack
    buyCreditsForCustomer(selectedCustomerId, selectedPack.id);

    // Record transaction
    const splitDetails = `Avail: ${selectedPack.title} (${cashPercent}% Paid via ${paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}: ₱${cashAmount.toFixed(2)}, ${walletPercent}% Paid via Wallet Credit: ₱${walletAmount.toFixed(2)})`;
    
    addTransaction({
      type: 'membership',
      customerName: client.name,
      customerEmail: client.email,
      customerPhone: client.phone,
      description: splitDetails,
      paymentMethod: paymentMethod === 'cash' ? 'cash' : 'card', // mapped to cash or card
      amount: cashAmount, // cash collected
      status: 'paid',
      handledBy: selectedStaff,
    });

    setToastMsg(`✓ Successfully availed ${selectedPack.title} for ${client.name}. ₱${cashAmount.toFixed(2)} (${paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}) + ₱${walletAmount.toFixed(2)} (Wallet Credit)`);

    // Reset selections on success
    setSelectedPack(null);
    setSelectedCustomerId(null);
    setSearchQuery('');
    setPaymentMethod('cash');
    setCashPercent(100);
    setWalletPercent(0);
    setErrorMsg('');

    setTimeout(() => setToastMsg(''), 5000);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">POS Package Desk</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Membership Packages</h1>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 font-semibold animate-slide-up">
          {toastMsg}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-6 p-3 rounded-xl bg-destructive/15 border border-red-500/30 text-sm text-red-400 font-semibold animate-slide-up">
          ⚠ Error: {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand: Package Catalog */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "border border-border bg-white rounded-3xl transition-all flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md",
                pkg.id === 'unlimited'
                  ? "border-amber-400 bg-gradient-to-br from-white to-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "hover:border-primary/40"
              )}
            >
              {/* Popular Badge / Unlimited Tag */}
              {pkg.id === 'unlimited' ? (
                <div className="absolute top-0 right-0 z-10">
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-none rounded-bl-2xl font-sans text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm inline-flex items-center gap-1">
                    <Sparkles size={11} className="animate-pulse" /> Premium
                  </span>
                </div>
              ) : pkg.popular ? (
                <div className="absolute top-0 right-0 z-10">
                  <span className="bg-primary text-white rounded-none rounded-bl-2xl font-sans text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm inline-block">
                    Best Seller
                  </span>
                </div>
              ) : null}

              {/* Ticket Top Half */}
              <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className={cn(
                    "font-heading font-black text-lg uppercase tracking-wide",
                    pkg.id === 'unlimited' ? "text-amber-600" : "text-foreground"
                  )}>
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pkg.desc}</p>
                </div>

                {/* Benefits checklist */}
                <ul className="space-y-1.5 pt-2">
                  {pkg.id === 'single' && (
                    <>
                      <li className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>Valid for all Pole, Aerial, Chair & Yoga classes</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>Perfect for walk-ins & trial guests</span>
                      </li>
                    </>
                  )}
                  {pkg.id === 'five' && (
                    <>
                      <li className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>Saves ₱15 compared to single passes</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>Valid for a full 90 days</span>
                      </li>
                    </>
                  )}
                  {pkg.id === 'ten' && (
                    <>
                      <li className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>Saves ₱50 compared to single passes</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
                        <Check size={13} className="text-emerald-500 shrink-0" />
                        <span>Valid for a full 180 days</span>
                      </li>
                    </>
                  )}
                  {pkg.id === 'unlimited' && (
                    <>
                      <li className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                        <Check size={13} className="text-amber-500 shrink-0" />
                        <span>Unlimited classes monthly (Auto-renew)</span>
                      </li>
                      <li className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                        <Check size={13} className="text-amber-500 shrink-0" />
                        <span>Priority class booking privileges</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Dashed Separator with punch notches */}
              <div className="relative flex items-center py-1">
                {/* Left Notch */}
                <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-[#f4ede4] border-r border-border/80 z-10" />
                {/* Dashed Line */}
                <div className="w-full border-t-2 border-dashed border-border/75" />
                {/* Right Notch */}
                <div className="absolute -right-2.5 w-5 h-5 rounded-full bg-[#f4ede4] border-l border-border/80 z-10" />
              </div>

              {/* Ticket Bottom Half */}
              <div className="p-5 flex justify-between items-center bg-secondary/15">
                <div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground">₱</span>
                    <span className={cn(
                      "text-2xl font-black font-mono tracking-tight",
                      pkg.id === 'unlimited' ? "text-amber-600" : "text-primary"
                    )}>
                      {pkg.price}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase font-black font-mono tracking-wider block mt-0.5">
                    {pkg.perClass}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedPack(pkg);
                    setErrorMsg('');
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-pill active:scale-[0.98] transition-all cursor-pointer shadow-sm",
                    pkg.id === 'unlimited'
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-primary hover:bg-primary-press text-on-primary"
                  )}
                >
                  <ShoppingBag size={13} /> Avail
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Hand: Checkout / credit details form */}
        <div className="lg:col-span-4">
          {!selectedPack ? (
            <div className="space-y-6">
              {/* Select Service Prompt */}
              <div className="bg-card/40 border border-border/50 rounded-3xl text-center py-12 px-6">
                <span className="text-4xl block mb-2">🛍️</span>
                <h3 className="font-heading font-black text-lg uppercase">Select Service</h3>
                <p className="text-sm text-muted-foreground mt-2">Click on "Avail" on any catalog item on the left to begin the client checkout flow.</p>
              </div>

              {/* Pre-Select Customer Panel */}
              <div className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm relative">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Pre-Select Client</span>
                  {activeCustomer && (
                    <button
                      onClick={() => setSelectedCustomerId(null)}
                      className="text-[9px] text-destructive hover:underline font-bold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {activeCustomer ? (
                  <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 space-y-2 text-xs">
                    <p className="font-bold text-foreground text-sm">{activeCustomer.name}</p>
                    <p className="text-muted-foreground">{activeCustomer.email}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-border/20 text-[10px] text-primary font-bold">
                      <span>Tier: {activeCustomer.membershipTier}</span>
                      <span>Credits: {activeCustomer.credits}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 relative">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Search Client Registry</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search client to select first..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                      />
                    </div>
                    {/* Search Dropdown Matches */}
                    {filteredCustomers.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-border">
                        {filteredCustomers.map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectCustomer(c.id)}
                            className="w-full text-left px-4 py-2 hover:bg-secondary text-xs flex justify-between items-center cursor-pointer"
                          >
                            <div>
                              <p className="font-semibold">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono font-bold text-primary">
                              {c.credits} cr
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-5 space-y-5 animate-in slide-in-from-right-5 bg-white">
              <div className="border-b border-border pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-black text-base uppercase">Avail Pass</h3>
                  <p className="text-xs text-muted-foreground">Product: <span className="text-primary font-bold">{selectedPack.title}</span></p>
                </div>
                <button
                  onClick={() => setSelectedPack(null)}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Package Benefits List */}
              <div className="bg-primary/[0.03] border border-primary/20 rounded-2xl p-4.5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Package Benefits</span>
                <ul className="space-y-2 text-xs text-ink-mute font-medium">
                  {selectedPack.id === 'single' && (
                    <>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Valid for all Pole, Aerial, Chair & Yoga classes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Perfect for walk-ins & trial guests</span>
                      </li>
                    </>
                  )}
                  {selectedPack.id === 'five' && (
                    <>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Saves ₱15 compared to single passes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Valid for a full 90 days</span>
                      </li>
                    </>
                  )}
                  {selectedPack.id === 'ten' && (
                    <>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Saves ₱50 compared to single passes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>Valid for a full 180 days</span>
                      </li>
                    </>
                  )}
                  {selectedPack.id === 'unlimited' && (
                    <>
                      <li className="flex items-start gap-2 text-amber-700">
                        <Check size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>Unlimited classes monthly (Auto-renew)</span>
                      </li>
                      <li className="flex items-start gap-2 text-amber-700">
                        <Check size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>Priority class booking privileges</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* 1. Customer Selector */}
              <div className="space-y-2 relative">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Search Client Registry</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by client name/email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
                {/* Search Dropdown Matches */}
                {filteredCustomers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-border">
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCustomer(c.id)}
                        className="w-full text-left px-4 py-2 hover:bg-secondary text-xs flex justify-between items-center cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono font-bold text-primary">
                          {c.credits} cr
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Customer Confirmation card */}
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Target Customer</span>
                {activeCustomer ? (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-foreground text-sm">{activeCustomer.name}</p>
                      <p className="text-muted-foreground">{activeCustomer.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCustomerId(null)}
                      className="text-destructive hover:underline text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <p className="text-muted-foreground font-semibold text-center py-2">Please search and select a client above to credit this purchase.</p>
                )}
              </div>

              {/* 3. Payment Mode select */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Select payment method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer",
                      paymentMethod === 'cash'
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <DollarSign size={13} /> Cash
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
                    <CreditCard size={13} /> Online / Bank Transfer
                  </button>
                </div>
              </div>

              {/* Staff Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Assisting Staff / Coach</label>
                <div className="grid grid-cols-2 gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border/40">
                  {['Cams Rivera', 'Sarah Lee', 'Alex Tran', 'Evolve Staff'].map(staff => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className={cn(
                        "py-1.5 px-1 text-[9px] font-mono font-bold rounded-xl border text-center transition-all cursor-pointer",
                        selectedStaff === staff
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-white border-border text-muted-foreground hover:bg-secondary/40"
                      )}
                    >
                      {staff === 'Cams Rivera' ? '👑 Cams' : staff === 'Sarah Lee' ? '👟 Sarah' : staff === 'Alex Tran' ? '👟 Alex' : '🧑‍💻 Staff'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Wallet Split Control */}
              <div className="space-y-3 p-4 bg-secondary/20 border border-border/60 rounded-2xl">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Credit Wallet Adjustments</label>
                  {activeCustomer && (
                    <span className="text-[10px] font-bold text-primary">Available Credits: {activeCustomer.credits}</span>
                  )}
                </div>
                
                {/* Preset Splits */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: '100/0', cash: 100 },
                    { label: '90/10', cash: 90 },
                    { label: '70/30', cash: 70 },
                    { label: '50/50', cash: 50 },
                    { label: '30/70', cash: 30 }
                  ].map((split) => (
                    <button
                      key={split.label}
                      type="button"
                      onClick={() => handleSplitChange(split.cash)}
                      className={cn(
                        "py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer text-center",
                        cashPercent === split.cash
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-border bg-white text-muted-foreground"
                      )}
                    >
                      {split.label}
                    </button>
                  ))}
                </div>

                {/* Slider bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                    <span>Cash/Bank: {cashPercent}%</span>
                    <span>Wallet Credit: {walletPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={cashPercent}
                    onChange={(e) => handleSplitChange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* 4. Sales Details invoice */}
              <div className="bg-secondary/20 rounded-2xl p-4 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Price:</span>
                  <span>₱{selectedPack.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Pay via {paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'} ({cashPercent}%):</span>
                  <span className="font-bold">₱{((selectedPack.price * cashPercent) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Pay via Wallet Credits ({walletPercent}%):</span>
                  <span className="font-bold">₱{((selectedPack.price * walletPercent) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits Assigned:</span>
                  <span className="font-bold text-primary">{selectedPack.credits === 999 ? 'Unlimited' : `+${selectedPack.credits} passes`}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-2 text-base font-black text-primary font-sans">
                  <span>Grand Total:</span>
                  <span>₱{selectedPack.price.toFixed(2)}</span>
                </div>
              </div>

              {/* 5. Checkout button */}
              <button
                onClick={handleConfirmPurchase}
                disabled={!selectedCustomerId}
                className={cn(
                  "btn-primary-pill w-full text-center uppercase tracking-widest py-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans transition-all"
                )}
              >
                Confirm Sale & Assign Credits
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
