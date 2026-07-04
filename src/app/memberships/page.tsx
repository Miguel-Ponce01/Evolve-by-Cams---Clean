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
  Sun,
  Moon
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
  const { customers, buyCreditsForCustomer, addTransaction } = useBooking();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedPack, setSelectedPack] = useState<PackageItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('Cams Rivera');
  const [cashPercent, setCashPercent] = useState<number>(100);
  const [walletPercent, setWalletPercent] = useState<number>(0);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin' || passwordInput === 'evolve10') {
      setIsUnlocked(true);
      setPassError('');
    } else {
      setPassError('Access denied: Invalid code.');
    }
  };

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

  const handleSplitChange = (cash: number) => {
    setCashPercent(cash);
    setWalletPercent(100 - cash);
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
      const creditsNeeded = walletAmount / 250; // assuming 250 PHP per credit unit
      if (client.credits < creditsNeeded && selectedPack.id !== 'unlimited') {
        setErrorMsg(`Insufficient wallet credits. Client has ${client.credits} credits, but needs ${(creditsNeeded).toFixed(1)} credits to cover ₱${walletAmount.toFixed(2)}.`);
        return;
      }
      if (selectedPack.id !== 'unlimited') {
        client.credits = Math.max(0, client.credits - Math.floor(creditsNeeded));
      }
    }

    buyCreditsForCustomer(selectedCustomerId, selectedPack.id);

    const splitDetails = `Avail: ${selectedPack.title} (${cashPercent}% Paid via ${paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}: ₱${cashAmount.toFixed(2)}, ${walletPercent}% Paid via Wallet Credit: ₱${walletAmount.toFixed(2)})`;
    
    addTransaction({
      type: 'membership',
      customerName: client.name,
      customerEmail: client.email,
      customerPhone: client.phone,
      description: splitDetails,
      paymentMethod: paymentMethod === 'cash' ? 'cash' : 'card',
      amount: cashAmount,
      status: 'paid',
      handledBy: selectedStaff,
    });

    setToastMsg(`✓ Successfully availed ${selectedPack.title} for ${client.name}. ₱${cashAmount.toFixed(2)} (${paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'}) + ₱${walletAmount.toFixed(2)} (Wallet Credit)`);

    setSelectedPack(null);
    setSelectedCustomerId(null);
    setSearchQuery('');
    setPaymentMethod('cash');
    setCashPercent(100);
    setWalletPercent(0);
    setErrorMsg('');

    setTimeout(() => setToastMsg(''), 5000);
  };

  const themeBg = isDarkMode ? "bg-[#0A0A0A] text-[#F5F5F3]" : "bg-[#FFFFFF] text-[#111111]";
  const themeCardBg = isDarkMode ? "bg-[#141414] border-[#232323]" : "bg-[#F9F9F9] border-[#E5E5E5]";
  const themeTextMuted = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const themeBorderColor = isDarkMode ? "border-zinc-800" : "border-zinc-200";
  const themeInputBg = isDarkMode ? "bg-black border-zinc-800 text-white" : "bg-white border-zinc-200 text-black";

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] flex flex-col justify-center items-center px-6 relative z-10 font-sans">
        <div className="max-w-[400px] w-full bg-[#121212] border border-zinc-900 rounded-2xl p-8 space-y-6 text-left shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold">Secure Access Portal</span>
            <h1 className="text-3xl font-serif font-light uppercase tracking-wider text-white">Evolve Staff</h1>
            <p className="text-xs text-zinc-500">Please authenticate to access the Package Sales &amp; Membership desk.</p>
          </div>
          {passError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-md">
              {passError}
            </div>
          )}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">Staff PIN / Code</label>
              <input
                required
                type="password"
                placeholder="••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-zinc-800 text-sm text-center tracking-widest text-white px-3 py-3 focus:outline-none focus:border-[#C9A961] rounded-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#C9A961] hover:bg-[#b09352] text-black text-xs font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer"
            >
              Unlock Access
            </button>
            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider font-bold">
                &larr; Back to Public Page
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-16 relative text-left ${themeBg}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600&display=swap');
        .display { font-family: 'Big Shoulders Display', sans-serif; text-transform: uppercase; letter-spacing: 0.01em; }
        .body-font { font-family: 'Space Grotesk', sans-serif; }
      `}</style>



      {/* ── BECOME AN EVOLVE MEMBER BANNER BLOCK (Screenshot 4 design style) ── */}
      <section className={`py-20 px-6 border-b text-center ${isDarkMode ? "bg-[#111111]" : "bg-zinc-50"}`} style={{ borderColor: isDarkMode ? "#1f1f1f" : "#e5e7eb" }}>
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className={`text-3xl md:text-5xl font-semibold font-serif tracking-wide uppercase leading-tight ${isDarkMode ? "text-white" : "text-black"}`}>
            Become an Evolve Member <br />
            and enjoy special savings <br />
            with our class packages.
          </h2>
          <div className="w-24 h-[1px] bg-zinc-500 mx-auto my-6" />
          <button 
            onClick={() => alert("Registration setup launched.")}
            className={`py-3.5 px-8 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md ${
              isDarkMode 
                ? "bg-[#C9A961] hover:bg-[#b09352] text-black" 
                : "bg-black hover:bg-zinc-800 text-white"
            }`}
          >
            Register Here
          </button>
        </div>
      </section>

      {/* ── PACKAGE INTEGRITY & SALES AREA ── */}
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        
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
                  "border rounded-3xl transition-all flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md",
                  themeCardBg,
                  pkg.id === 'unlimited' ? "border-[#C9A961]" : ""
                )}
              >
                {/* Popular Badge */}
                {pkg.id === 'unlimited' ? (
                  <div className="absolute top-0 right-0 z-10">
                    <span className="bg-[#C9A961] text-black rounded-none rounded-bl-2xl font-sans text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm inline-flex items-center gap-1">
                      <Sparkles size={11} /> Premium
                    </span>
                  </div>
                ) : pkg.popular ? (
                  <div className="absolute top-0 right-0 z-10">
                    <span className="bg-[#C9A961] text-black rounded-none rounded-bl-2xl font-sans text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm inline-block">
                      Best Seller
                    </span>
                  </div>
                ) : null}

                {/* Ticket Top Half */}
                <div className="p-6 flex-1 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-lg uppercase tracking-wide">
                      {pkg.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${themeTextMuted}`}>{pkg.desc}</p>
                  </div>

                  {/* Benefits checklist */}
                  <ul className="space-y-1.5 pt-2">
                    {pkg.id === 'single' && (
                      <>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Valid for all Pole Group Classes</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Perfect for walk-ins & trial guests</span>
                        </li>
                      </>
                    )}
                    {pkg.id === 'five' && (
                      <>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Valid for Pole & Aerial Group Classes</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Valid for a full 90 days</span>
                        </li>
                      </>
                    )}
                    {pkg.id === 'ten' && (
                      <>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Pole / Aerial / Exole / Acro / Sexy Chair</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Valid for a full 180 days</span>
                        </li>
                      </>
                    )}
                    {pkg.id === 'unlimited' && (
                      <>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Valid for all class offerings</span>
                        </li>
                        <li className="flex items-center gap-2 text-xs font-semibold">
                          <Check size={13} className="text-[#C9A961] shrink-0" />
                          <span>Priority class booking privileges</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Dashed Separator */}
                <div className="relative flex items-center py-1">
                  <div className={`absolute -left-2.5 w-5 h-5 rounded-full border-r z-10 ${isDarkMode ? "bg-[#0A0A0A] border-zinc-800" : "bg-white border-zinc-200"}`} />
                  <div className={`w-full border-t-2 border-dashed ${isDarkMode ? "border-zinc-800" : "border-zinc-200"}`} />
                  <div className={`absolute -right-2.5 w-5 h-5 rounded-full border-l z-10 ${isDarkMode ? "bg-[#0A0A0A] border-zinc-800" : "bg-white border-zinc-200"}`} />
                </div>

                {/* Ticket Bottom Half */}
                <div className={`p-6 flex justify-between items-center ${isDarkMode ? "bg-black/40" : "bg-zinc-50"}`}>
                  <div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[10px] font-bold">₱</span>
                      <span className="text-2xl font-black font-mono tracking-tight text-[#C9A961]">
                        {pkg.price}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase font-black font-mono tracking-wider block mt-0.5">
                      {pkg.perClass}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPack(pkg);
                      setErrorMsg('');
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full active:scale-[0.98] transition-all cursor-pointer shadow-sm ${
                      isDarkMode 
                        ? "bg-[#C9A961] text-black hover:bg-[#b09352]" 
                        : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    <ShoppingBag size={13} /> Avail
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Hand: Checkout */}
          <div className="lg:col-span-4">
            {!selectedPack ? (
              <div className="space-y-6">
                <div className={`border rounded-3xl text-center py-12 px-6 ${themeCardBg}`}>
                  <span className="text-4xl block mb-2">🛍️</span>
                  <h3 className="font-heading font-black text-lg uppercase">Select Service</h3>
                  <p className={`text-sm mt-2 ${themeTextMuted}`}>Click on "Avail" on any catalog item on the left to begin the client checkout flow.</p>
                </div>

                {/* Pre-Select Client */}
                <div className={`border rounded-3xl p-5 space-y-4 shadow-sm relative ${themeCardBg}`}>
                  <div className={`flex justify-between items-center pb-2 border-b ${themeBorderColor}`}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Pre-Select Client</span>
                    {activeCustomer && (
                      <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="text-[9px] text-red-500 hover:underline font-bold"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  {activeCustomer ? (
                    <div className={`border rounded-2xl p-4 space-y-2 text-xs ${isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200"}`}>
                      <p className="font-bold text-sm">{activeCustomer.name}</p>
                      <p className={themeTextMuted}>{activeCustomer.email}</p>
                      <div className={`flex justify-between items-center pt-2 border-t text-[10px] font-bold ${themeBorderColor}`}>
                        <span>Tier: {activeCustomer.membershipTier}</span>
                        <span>Credits: {activeCustomer.credits}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 relative">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider">Search Client Registry</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search client to select first..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-[#C9A961] ${themeInputBg}`}
                        />
                      </div>
                      {filteredCustomers.length > 0 && (
                        <div className={`absolute z-20 top-full left-0 right-0 mt-1 border rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y ${isDarkMode ? "bg-[#141414] border-zinc-800 divide-zinc-800" : "bg-white border-zinc-200 divide-zinc-200"}`}>
                          {filteredCustomers.map(c => (
                            <button
                              key={c.id}
                              onClick={() => handleSelectCustomer(c.id)}
                              className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs flex justify-between items-center cursor-pointer"
                            >
                              <div>
                                <p className="font-semibold">{c.name}</p>
                                <p className="text-xs text-zinc-500">{c.email}</p>
                              </div>
                              <Badge className="text-[10px] font-mono font-bold bg-[#C9A961] text-black">
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
              <div className={`border rounded-3xl p-5 space-y-5 shadow-sm ${themeCardBg}`}>
                <div className={`border-b pb-3 flex justify-between items-center ${themeBorderColor}`}>
                  <div>
                    <h3 className="font-heading font-black text-base uppercase">Avail Pass</h3>
                    <p className="text-xs">Product: <span className="text-[#C9A961] font-bold">{selectedPack.title}</span></p>
                  </div>
                  <button
                    onClick={() => setSelectedPack(null)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div className={`border rounded-2xl p-4.5 space-y-2 ${isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200"}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A961] block">Package Benefits</span>
                  <ul className="space-y-2 text-xs font-medium">
                    {selectedPack.id === 'single' && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-[#C9A961] shrink-0 mt-0.5" />
                          <span>Valid for all Pole Group Classes</span>
                        </li>
                      </>
                    )}
                    {selectedPack.id === 'five' && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-[#C9A961] shrink-0 mt-0.5" />
                          <span>Valid for Pole & Aerial Group Classes</span>
                        </li>
                      </>
                    )}
                    {selectedPack.id === 'ten' && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-[#C9A961] shrink-0 mt-0.5" />
                          <span>Pole / Aerial / Exole / Acro / Sexy Chair</span>
                        </li>
                      </>
                    )}
                    {selectedPack.id === 'unlimited' && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-[#C9A961] shrink-0 mt-0.5" />
                          <span>Valid for all class offerings</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="space-y-2 relative">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider">Search Client Registry</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by client name/email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:border-[#C9A961] ${themeInputBg}`}
                    />
                  </div>
                  {filteredCustomers.length > 0 && (
                    <div className={`absolute z-20 top-full left-0 right-0 mt-1 border rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y ${isDarkMode ? "bg-[#141414] border-zinc-800 divide-zinc-800" : "bg-white border-zinc-200 divide-zinc-200"}`}>
                      {filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCustomer(c.id)}
                          className="w-full text-left px-4 py-2 hover:bg-zinc-900 text-xs flex justify-between items-center cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-white">{c.name}</p>
                            <p className="text-xs text-zinc-500">{c.email}</p>
                          </div>
                          <Badge className="text-[10px] font-mono font-bold bg-[#C9A961] text-black">
                            {c.credits} cr
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`border rounded-2xl p-4 space-y-2 text-xs ${isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200"}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A961] block">Target Customer</span>
                  {activeCustomer ? (
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-sm">{activeCustomer.name}</p>
                        <p className={themeTextMuted}>{activeCustomer.email}</p>
                      </div>
                      <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="text-red-500 hover:underline text-[10px]"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <p className="text-zinc-550 font-semibold text-center py-2">Please search and select a client above to credit this purchase.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider">Select payment method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={cn(
                        "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer",
                        paymentMethod === 'cash'
                          ? 'bg-[#C9A961]/20 border-[#C9A961] text-[#C9A961]'
                          : `bg-transparent border-zinc-700 text-zinc-550 hover:border-[#C9A961]/50`
                      )}
                    >
                      <DollarSign size={13} /> Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={cn(
                        "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer",
                        paymentMethod === 'card'
                          ? 'bg-[#C9A961]/20 border-[#C9A961] text-[#C9A961]'
                          : `bg-transparent border-zinc-700 text-zinc-550 hover:border-[#C9A961]/50`
                      )}
                    >
                      <CreditCard size={13} /> Online / Bank Transfer
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider">Assisting Staff / Coach</label>
                  <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${isDarkMode ? "bg-black/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                    {['Cams Rivera', 'Sarah Lee', 'Alex Tran', 'Evolve Staff'].map(staff => (
                      <button
                        key={staff}
                        type="button"
                        onClick={() => setSelectedStaff(staff)}
                        className={cn(
                          "py-1.5 px-1 text-[9px] font-mono font-bold rounded-xl border text-center transition-all cursor-pointer",
                          selectedStaff === staff
                            ? "bg-[#C9A961] text-black border-[#C9A961]"
                            : `bg-transparent border-zinc-750 text-zinc-500 hover:bg-zinc-900`
                        )}
                      >
                        {staff === 'Cams Rivera' ? '👑 Cams' : staff === 'Sarah Lee' ? '👟 Sarah' : staff === 'Alex Tran' ? '👟 Alex' : '🧑‍💻 Staff'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`space-y-3 p-4 rounded-2xl border ${isDarkMode ? "bg-black/30 border-zinc-850" : "bg-white border-zinc-250"}`}>
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider">Credit Wallet Adjustments</label>
                    {activeCustomer && (
                      <span className="text-[10px] font-bold text-[#C9A961]">Available: {activeCustomer.credits}</span>
                    )}
                  </div>
                  
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
                            ? "bg-[#C9A961]/20 border-[#C9A961] text-[#C9A961]"
                            : `border-zinc-700 bg-transparent text-zinc-550`
                        )}
                      >
                        {split.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold">
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
                      className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-[#C9A961]"
                    />
                  </div>
                </div>

                <div className={`rounded-2xl p-4 text-xs space-y-2 font-mono border ${themeBorderColor}`}>
                  <div className="flex justify-between">
                    <span className={themeTextMuted}>Product Price:</span>
                    <span>₱{selectedPack.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className={themeTextMuted}>Pay via {paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'} ({cashPercent}%):</span>
                    <span className="font-bold">₱{((selectedPack.price * cashPercent) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className={themeTextMuted}>Pay via Wallet Credits ({walletPercent}%):</span>
                    <span className="font-bold">₱{((selectedPack.price * walletPercent) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={themeTextMuted}>Credits Assigned:</span>
                    <span className="font-bold text-[#C9A961]">{selectedPack.credits === 999 ? 'Unlimited' : `+${selectedPack.credits} passes`}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-black text-[#C9A961] font-sans" style={{ borderColor: isDarkMode ? "#1f1f1f" : "#e5e7eb" }}>
                    <span>Grand Total:</span>
                    <span>₱{selectedPack.price.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={!selectedCustomerId}
                  className="w-full text-center uppercase tracking-widest py-3.5 font-bold rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  Confirm Sale & Assign Credits
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── REGISTERED BUSINESS NAME ON BOTTOM (Screenshot 4 design style) ── */}
      <section className={`py-12 border-t text-center ${isDarkMode ? "bg-black border-zinc-900" : "bg-zinc-50 border-zinc-200"}`}>
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black font-sans">
          Evolve Pole Fitness &amp; Aerial Arts Studio
        </div>
      </section>
    </div>
  );
}
