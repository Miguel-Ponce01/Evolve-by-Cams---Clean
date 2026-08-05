'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  LayoutGrid, 
  List, 
  Table as TableIcon, 
  Search, 
  X, 
  ChevronRight, 
  CreditCard, 
  QrCode, 
  Wallet, 
  ShieldCheck,
  Building2,
  PhoneCall,
  User,
  Mail,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBooking } from '@/context/BookingContext';

export interface PackageItem {
  id: string;
  title: string;
  category: string;
  price: number;
  credits: number;
  perClass: string;
  desc: string;
  validity: string;
  popular?: boolean;
  features: string[];
}

const PACKAGES: PackageItem[] = [
  {
    id: 'single',
    title: 'Single Class Pass (Group Class)',
    category: 'Class Passes',
    price: 700,
    credits: 1,
    perClass: '₱700 / class',
    desc: 'Valid for all Pole & Aerial Group Classes (All Levels). Perfect for walk-ins and trial sessions.',
    validity: 'Valid for 14 days',
    features: ['Access to 1 group class', 'Professional coaching', 'All equipment provided', 'Locker access'],
  },
  {
    id: 'davao-pack',
    title: 'Davao Group Class Pass Pack',
    category: 'Credit Packs',
    price: 1000,
    credits: 1,
    perClass: '₱1,000 / class',
    desc: 'Evolve Davao Studio Group Class pass (Pole/Aerial Group Class All Levels).',
    validity: 'Valid for 30 days',
    popular: true,
    features: ['Davao Studio exclusive access', 'Priority waitlist queue', 'Complimentary grip chalk sample', 'Flexible rescheduling'],
  },
  {
    id: 'private-pack',
    title: 'Private Class (Pole / Aerial / Exole / Chair)',
    category: 'Private Sessions',
    price: 1800,
    credits: 1,
    perClass: '₱1,800 / hour',
    desc: 'Personalized 1-on-1 training, faster progress, and a stronger you. Grace in the air or bold on the floor.',
    validity: 'Valid for 60 days',
    features: ['1-on-1 dedicated instructor', 'Custom choreography', 'Video recording allowed', 'Personalized conditioning plan'],
  },
  {
    id: 'annual-member',
    title: 'Annual Membership Registration Fee',
    category: 'Membership',
    price: 1500,
    credits: 0,
    perClass: '₱1,500 / year',
    desc: 'Annual Membership registration fee to unlock discounted credit rates and VIP studio perks.',
    validity: 'Valid for 1 Full Year',
    popular: true,
    features: ['10% discount on all packages', 'Early access to workshop registration', 'Free Evolve Grip Towel', 'Member-only open jam sessions'],
  },
  {
    id: '88-session-pack',
    title: '88 Session Intensive Pack',
    category: 'Credit Packs',
    price: 8800,
    credits: 88,
    perClass: '₱100 / class',
    desc: 'Our maximum value credit pack designed for dedicated dancers and movers practicing multiple times a week.',
    validity: 'Valid for 6 months',
    features: ['88 transferable class credits', 'Valid across all locations', 'Shareable with 1 family member', 'Free workshop pass included'],
  },
];

type ViewMode = 'grid' | 'table' | 'compact';

export default function PublicPackagesPage() {
  const { addTransaction } = useBooking();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Drawer state
  const [activeDrawerPkg, setActiveDrawerPkg] = useState<PackageItem | null>(null);

  // Avail & Payment Modal State
  const [availModalPkg, setAvailModalPkg] = useState<PackageItem | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<'gcash' | 'maya' | 'card' | 'qrph' | 'bank'>('gcash');
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [availSuccess, setAvailSuccess] = useState(false);

  const filteredPackages = PACKAGES.filter(pkg => {
    const searchMatch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || pkg.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = selectedCategory === 'All' || pkg.category === selectedCategory;
    return searchMatch && catMatch;
  });

  const handleOpenAvailModal = (pkg: PackageItem) => {
    setAvailModalPkg(pkg);
    setAvailSuccess(false);
    setCustName('');
    setCustEmail('');
    setCustPhone('');
  };

  const handleConfirmAvail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) return;

    setIsSubmittingPay(true);
    setTimeout(() => {
      const methodMap: Record<string, 'card' | 'cash' | 'credit'> = {
        card: 'card',
        gcash: 'cash',
        maya: 'cash',
        qrph: 'cash',
        bank: 'cash',
      };

      // Create transaction log for admin portal
      addTransaction({
        id: `tx-${Date.now()}`,
        customerName: custName,
        customerEmail: custEmail,
        customerPhone: custPhone,
        amount: availModalPkg?.price || 0,
        type: 'membership',
        paymentMethod: methodMap[paymentChannel] || 'cash',
        status: 'paid',
        timestamp: new Date().toISOString(),
        description: `${availModalPkg?.title} (${paymentChannel.toUpperCase()})`
      });

      setIsSubmittingPay(false);
      setAvailSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F3] overflow-x-hidden font-sans relative pb-16">
      
      {/* Hero Section */}
      <section className="relative py-20 text-center bg-[#0C0C0C] border-b border-zinc-900 overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={12} /> Pricing &amp; Passes
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-light tracking-[0.1em] uppercase text-white leading-none">
            Packages &amp; <span className="text-[#C9A961]">Memberships</span>
          </h1>
          <div className="w-16 h-[1px] bg-zinc-800 mx-auto my-4" />
          <p className="text-xs sm:text-sm tracking-[0.15em] text-zinc-400 font-bold uppercase max-w-xl mx-auto">
            Choose a plan that fits your practice and goals. Avail online for instant activation.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-6 py-12 space-y-8">
        
        {/* Controls & Filter Bar */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search package or membership..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#C9A961] transition-colors placeholder:text-zinc-600"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['All', 'Class Passes', 'Credit Packs', 'Private Sessions', 'Membership'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-white text-black font-bold shadow-sm"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Controls */}
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer",
                viewMode === 'grid' ? "bg-[#C9A961] text-black shadow-sm" : "text-zinc-400 hover:text-white"
              )}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer",
                viewMode === 'table' ? "bg-[#C9A961] text-black shadow-sm" : "text-zinc-400 hover:text-white"
              )}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                "p-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer",
                viewMode === 'compact' ? "bg-[#C9A961] text-black shadow-sm" : "text-zinc-400 hover:text-white"
              )}
              title="Compact View"
            >
              <List size={16} />
            </button>
          </div>

        </div>

        {/* ── 1. GRID VIEW MODE ── */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "bg-zinc-950 border rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative shadow-lg hover:border-[#C9A961]/50 transition-all duration-300 group",
                  pkg.popular ? "border-[#C9A961]/60" : "border-zinc-900"
                )}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 z-10">
                    <span className="bg-[#C9A961] text-black rounded-bl-2xl font-sans text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 shadow-sm inline-flex items-center gap-1">
                      <Sparkles size={11} /> Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6 text-left">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#C9A961] block">
                      {pkg.category}
                    </span>
                    <h3 className="font-serif font-bold text-xl uppercase tracking-wide text-white group-hover:text-[#C9A961] transition-colors leading-snug">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                      {pkg.desc}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white font-mono tabular-nums">
                      ₱{pkg.price.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-bold block">
                      {pkg.perClass} &middot; {pkg.validity}
                    </span>
                  </div>

                  <ul className="space-y-2 pt-4 border-t border-zinc-900 text-xs text-zinc-300">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={13} className="text-[#C9A961] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    onClick={() => setActiveDrawerPkg(pkg)}
                    className="w-full text-center uppercase tracking-widest py-2.5 font-bold rounded-xl border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs block transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleOpenAvailModal(pkg)}
                    className="w-full text-center uppercase tracking-widest py-3 font-black rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black text-xs block transition-transform duration-200 active:scale-[0.96] shadow-md shadow-[#C9A961]/10 cursor-pointer"
                  >
                    Avail Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 2. TABLE VIEW MODE ── */}
        {viewMode === 'table' && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/50 text-zinc-400 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-4 px-6 font-bold">Package Name</th>
                    <th className="py-4 px-6 font-bold">Category</th>
                    <th className="py-4 px-6 font-bold">Validity</th>
                    <th className="py-4 px-6 font-bold">Price</th>
                    <th className="py-4 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {filteredPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm uppercase tracking-wide">{pkg.title}</div>
                        <div className="text-[10px] text-zinc-400 leading-tight mt-0.5 max-w-md">{pkg.desc}</div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#C9A961]">
                        {pkg.category}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-400">
                        {pkg.validity}
                      </td>
                      <td className="py-4 px-6 font-mono font-black text-white text-base">
                        ₱{pkg.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveDrawerPkg(pkg)}
                            className="px-3.5 py-2 rounded-xl border border-zinc-800 hover:border-zinc-600 text-xs font-bold uppercase tracking-wider text-zinc-300 cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleOpenAvailModal(pkg)}
                            className="px-5 py-2 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                          >
                            Avail Now
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 3. COMPACT VIEW MODE ── */}
        {viewMode === 'compact' && (
          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#C9A961]/40 transition-colors shadow-lg text-left"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wide">{pkg.title}</h3>
                    <span className="bg-zinc-900 text-[#C9A961] text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-[#C9A961]/20">
                      {pkg.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium line-clamp-1">{pkg.desc}</p>
                </div>

                <div className="flex items-center gap-5 self-end md:self-center shrink-0 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-white block">₱{pkg.price.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-500 font-mono block">{pkg.validity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDrawerPkg(pkg)}
                      className="px-4 py-2 rounded-xl border border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenAvailModal(pkg)}
                      className="px-5 py-2 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                    >
                      Avail Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── RIGHT-SIDE DETAILS DRAWER ── */}
      {activeDrawerPkg && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            onClick={() => setActiveDrawerPkg(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          />

          <div className="relative w-full max-w-md bg-[#0D0D0D] border-l border-zinc-800 h-full overflow-y-auto z-10 shadow-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 animate-in slide-in-from-right duration-300 text-left">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A961] font-bold flex items-center gap-1.5">
                  <Sparkles size={14} /> Package Overview
                </span>
                <button
                  onClick={() => setActiveDrawerPkg(null)}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <span className="bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/30 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  {activeDrawerPkg.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wide text-white leading-tight">
                  {activeDrawerPkg.title}
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {activeDrawerPkg.desc}
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Total Investment</span>
                  <span className="text-2xl font-black text-white font-mono">₱{activeDrawerPkg.price.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 block">Validity</span>
                  <span className="text-xs font-bold text-[#C9A961] font-mono">{activeDrawerPkg.validity}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">Included Privileges</h4>
                <ul className="space-y-2.5">
                  {activeDrawerPkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle2 size={16} className="text-[#C9A961] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900">
              <button
                onClick={() => {
                  const pkg = activeDrawerPkg;
                  setActiveDrawerPkg(null);
                  handleOpenAvailModal(pkg);
                }}
                className="w-full py-3.5 rounded-2xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
              >
                <span>Avail Package Now</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── AVAIL NOW & ONLINE PAYMENT MODAL ── */}
      {availModalPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            onClick={() => setAvailModalPkg(null)} 
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer" 
          />

          <div className="relative w-full max-w-lg bg-[#0E0E0E] border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-left space-y-6 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {!availSuccess ? (
              <>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9A961] font-bold">Online Checkout</span>
                    <h3 className="text-xl font-serif font-bold uppercase tracking-wide text-white">
                      Avail {availModalPkg.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setAvailModalPkg(null)} 
                    className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleConfirmAvail} className="space-y-5">
                  {/* Summary Header */}
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{availModalPkg.category}</span>
                      <div className="text-sm font-bold text-white">{availModalPkg.perClass}</div>
                    </div>
                    <div className="text-xl font-black font-mono text-[#C9A961]">
                      ₱{availModalPkg.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Customer Inputs */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">Client Information</label>
                    <div className="space-y-2">
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={custName}
                          onChange={(e) => setCustName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#C9A961]"
                        />
                      </div>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          value={custEmail}
                          onChange={(e) => setCustEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#C9A961]"
                        />
                      </div>
                      <div className="relative">
                        <PhoneCall size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="tel"
                          placeholder="Mobile Phone Number"
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#C9A961]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Channel Options */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">Select Payment Channel</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'gcash', label: 'GCash', icon: Wallet },
                        { id: 'maya', label: 'Maya', icon: Wallet },
                        { id: 'qrph', label: 'QR Ph Instant', icon: QrCode },
                        { id: 'card', label: 'Credit Card', icon: CreditCard },
                        { id: 'bank', label: 'Bank Transfer', icon: Building2 },
                      ].map((ch) => {
                        const Icon = ch.icon;
                        const isSel = paymentChannel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setPaymentChannel(ch.id as any)}
                            className={cn(
                              "p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer",
                              isSel 
                                ? "bg-[#C9A961]/10 border-[#C9A961] text-[#C9A961]" 
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            )}
                          >
                            <Icon size={16} />
                            <span>{ch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="w-full py-3.5 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-[#C9A961]/10"
                  >
                    {isSubmittingPay ? 'Processing Payment...' : `Pay ₱${availModalPkg.price.toLocaleString()} via ${paymentChannel.toUpperCase()}`}
                  </button>
                </form>
              </>
            ) : (
              /* Success Confirmation */
              <div className="py-8 text-center space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">Transaction Confirmed</span>
                  <h3 className="text-2xl font-serif font-bold uppercase text-white">Package Availed!</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto pt-1">
                    Thank you, <span className="text-white font-bold">{custName}</span>! Your purchase notification has been forwarded to Evolve Studio Admin.
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-left space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400"><span>Item:</span> <span className="text-white">{availModalPkg.title}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Amount:</span> <span className="text-[#C9A961]">₱{availModalPkg.price.toLocaleString()}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Channel:</span> <span className="text-white uppercase">{paymentChannel}</span></div>
                </div>

                <button
                  onClick={() => setAvailModalPkg(null)}
                  className="w-full py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer Registered Business */}
      <section className="py-12 border-t text-center bg-black border-zinc-900">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black font-sans">
          Evolve Pole Fitness &amp; Aerial Arts Studio
        </div>
      </section>

    </div>
  );
}
