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
    title: 'Single Class Pass',
    price: 35,
    credits: 1,
    perClass: '$35/class',
    desc: 'Perfect for walk-ins and trial sessions. Valid for all Reformer, Mat, and HIIT classes.',
  },
  {
    id: 'five',
    title: '5-Class Pass Pack',
    price: 160,
    credits: 5,
    perClass: '$32/class',
    desc: 'Great for weekly regulars. Valid for 90 days. Saves $15 compared to single passes.',
    popular: true,
  },
  {
    id: 'ten',
    title: '10-Class Pass Pack',
    price: 300,
    credits: 10,
    perClass: '$30/class',
    desc: 'Our best value class pack. Valid for 180 days. Saves $50 compared to single passes.',
  },
  {
    id: 'unlimited',
    title: 'Unlimited Monthly Pass',
    price: 199,
    credits: 999,
    perClass: 'Subscription',
    desc: 'High-vibe unlimited Reformer & Yoga access. Automatically renews monthly. Priority booking.',
  },
];

export default function PackageSalesPage() {
  const { customers, buyCreditsForCustomer } = useBooking();

  const [selectedPack, setSelectedPack] = useState<PackageItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleConfirmPurchase = () => {
    if (!selectedPack) return;
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer to credit.');
      return;
    }

    buyCreditsForCustomer(selectedCustomerId, selectedPack.id);
    const client = customers.find(c => c.id === selectedCustomerId);
    
    setToastMsg(`✓ Sold ${selectedPack.title} to ${client?.name} for $${selectedPack.price.toFixed(2)} (${paymentMethod.toUpperCase()})`);
    
    // Reset selections
    setSelectedPack(null);
    setSelectedCustomerId(null);
    setSearchQuery('');
    setPaymentMethod('cash');
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
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Sell Service Packages</h1>
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
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={cn(
                "border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden relative",
                pkg.popular && "border-primary/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              )}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-primary text-primary-foreground rounded-none rounded-bl-xl font-mono text-[9px] uppercase tracking-wider font-bold">Best Value</Badge>
                </div>
              )}
              <CardContent className="p-5 flex-1 flex flex-col justify-between h-56">
                <div>
                  <h3 className="font-heading font-black text-lg uppercase text-foreground">{pkg.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{pkg.desc}</p>
                </div>
                <div className="pt-4 flex justify-between items-end">
                  <div>
                    <span className="text-2xl font-black text-primary">${pkg.price}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold font-mono tracking-wider ml-1">({pkg.perClass})</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPack(pkg);
                      setSelectedCustomerId(null);
                      setSearchQuery('');
                      setErrorMsg('');
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest rounded-pill hover:bg-primary-press active:scale-[0.98] transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
                  >
                    <ShoppingBag size={13} /> Sell Package
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Hand: Checkout / credit details form */}
        <div className="lg:col-span-4">
          {!selectedPack ? (
            <div className="bg-card/40 border border-border/50 rounded-3xl text-center py-16 px-6">
              <span className="text-4xl block mb-2">🛍️</span>
              <h3 className="font-heading font-black text-lg uppercase">Select Service</h3>
              <p className="text-sm text-muted-foreground mt-2">Click on "Sell Package" on any catalog item on the left to begin the client checkout flow.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-5 space-y-5 animate-in slide-in-from-right-5">
              <div className="border-b border-border pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-black text-base uppercase">Sell Pass Pass</h3>
                  <p className="text-xs text-muted-foreground">Product: <span className="text-primary font-bold">{selectedPack.title}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedPack(null)}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Change
                </button>
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
                    <CreditCard size={13} /> Card Reader
                  </button>
                </div>
              </div>

              {/* 4. Sales Details invoice */}
              <div className="bg-secondary/20 rounded-2xl p-4 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Price:</span>
                  <span>${selectedPack.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits Assigned:</span>
                  <span className="font-bold text-primary">{selectedPack.credits === 999 ? 'Unlimited' : `+${selectedPack.credits} passes`}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-2 text-base font-black text-primary font-sans">
                  <span>Grand Total:</span>
                  <span>${selectedPack.price.toFixed(2)}</span>
                </div>
              </div>

              {/* 5. Checkout button */}
              <button
                onClick={handleConfirmPurchase}
                disabled={!selectedCustomerId}
                className="btn-primary-pill w-full text-center uppercase tracking-widest py-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans"
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
