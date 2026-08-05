'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Eye, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Link2,
  Search,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'Details' | 'Pricing' | 'Options' | 'Classes to include';

export default function EditPackagePage() {
  const [activeStep, setActiveStep] = useState<Step>('Details');
  
  // ── 1. Details State ────────────────────────────────────────────────────────
  const [packageName, setPackageName] = useState('88 Session Pack');
  const [description, setDescription] = useState('88 Credit Pilates Pack');
  const [category, setCategory] = useState('Credit Packs');
  const [locationMode, setLocationMode] = useState<'selected' | 'single'>('selected');
  const [allLocationAccess, setAllLocationAccess] = useState(true);
  const [nexStudioAccess, setNexStudioAccess] = useState(true);
  const [nexBarbershopAccess, setNexBarbershopAccess] = useState(true);
  const [validityNumber, setValidityNumber] = useState(6);
  const [validityUnit, setValidityUnit] = useState<'Months' | 'Days' | 'Years'>('Months');
  const [activationDate, setActivationDate] = useState<'purchase' | 'first_booking'>('purchase');

  // ── 2. Pricing State ────────────────────────────────────────────────────────
  const [customerGroups, setCustomerGroups] = useState([
    { id: 'not_assigned', name: 'Not assigned', checked: true, price: '88' },
    { id: 'doctors_group', name: "Doctor's Group", checked: false, price: '' },
    { id: 'trainers', name: 'Trainers', checked: false, price: '' },
    { id: 'royal_family', name: 'Royal Family', checked: true, price: '28' },
    { id: 'old_member', name: 'Old Member', checked: false, price: '' },
    { id: 'penghuni', name: 'Penghuni Membership', checked: true, price: '14' },
  ]);
  const [numberOfCredits, setNumberOfCredits] = useState(88);

  // ── 3. Options State ────────────────────────────────────────────────────────
  const [limitPurchase, setLimitPurchase] = useState(true);
  const [purchaseLimitCount, setPurchaseLimitCount] = useState(1);
  const [restrictSpecificCustomers, setRestrictSpecificCustomers] = useState(false);
  const [setShareable, setSetShareable] = useState(true);
  const [limitSharePeople, setLimitSharePeople] = useState(false);
  const [setTransferrable, setSetTransferrable] = useState(false);
  const [limitBookingPax, setLimitBookingPax] = useState(true);
  const [paxCount, setPaxCount] = useState(1);

  // ── 4. Classes to Include State ─────────────────────────────────────────────
  const [selectAllClasses, setSelectAllClasses] = useState(true);
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [includedClasses, setIncludedClasses] = useState([
    { id: 'reformer', name: 'Reformer Pilates', checked: true, count: 2 },
    { id: 'facility', name: 'Facility Rental', checked: true, count: 2 },
    { id: 'kids', name: "Kids' Class", checked: true, count: 0 },
    { id: 'personal', name: 'Personal Trainer', checked: true, count: 1 },
    { id: 'private', name: 'Private Class', checked: true, count: 0 },
    { id: 'massage', name: 'Massage', checked: true, count: 0 },
  ]);

  const steps: Step[] = ['Details', 'Pricing', 'Options', 'Classes to include'];

  const toggleGroupCheck = (id: string) => {
    setCustomerGroups(prev => prev.map(g => g.id === id ? { ...g, checked: !g.checked } : g));
  };

  const updateGroupPrice = (id: string, val: string) => {
    setCustomerGroups(prev => prev.map(g => g.id === id ? { ...g, price: val } : g));
  };

  const toggleIncludedClass = (id: string) => {
    setIncludedClasses(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleSelectAllClasses = (checked: boolean) => {
    setSelectAllClasses(checked);
    setIncludedClasses(prev => prev.map(c => ({ ...c, checked })));
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen font-sans flex flex-col relative text-black animate-fade-in">
      
      {/* Top Bar */}
      <div className="h-20 border-b border-gray-200 bg-white flex items-center justify-end px-8 gap-4 sticky top-0 z-20">
        <span className="text-xs text-gray-400 font-medium mr-2">Saved 8 days ago</span>
        <Link 
          href="/portal/pricing"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm"
        >
          Save & Exit
        </Link>
      </div>

      <div className="flex flex-1 max-w-[1200px] w-full mx-auto p-8 gap-12">
        
        {/* Left Sidebar Steps */}
        <div className="w-64 shrink-0">
          <div className="text-sm text-gray-500 font-medium mb-2">
            <Link href="/portal/pricing" className="hover:text-black">Packages</Link> &gt; <span className="text-black font-bold">{packageName}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{packageName}</h1>
          
          <div className="h-1 w-full bg-green-500 rounded-full mb-3"></div>
          <p className="text-sm font-bold text-gray-900 mb-8">100% completed</p>

          <nav className="flex flex-col gap-1 border-l-2 border-gray-100 pl-4 relative">
            {steps.map(step => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={cn(
                  "flex items-center gap-3 py-3 px-4 rounded-lg text-left text-sm font-semibold transition-colors",
                  activeStep === step ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                {step}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Form */}
        <div className="flex-1 max-w-xl">
          
          {/* STEP 1: DETAILS */}
          {activeStep === 'Details' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About your package</h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700">Package name</label>
                  <span className="text-xs text-gray-400">{packageName.length}/100</span>
                </div>
                <input 
                  type="text" 
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-700">Description</label>
                  <span className="text-xs text-gray-400">{description.length}/500</span>
                </div>
                
                <div className="border border-gray-300 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1D1B4B]">
                  <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 flex-wrap">
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Bold size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Italic size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Underline size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Strikethrough size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignLeft size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignCenter size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignRight size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><AlignJustify size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><List size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><ListOrdered size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><ImageIcon size={16} /></button>
                    <button className="p-1 hover:bg-gray-200 rounded text-gray-600"><Link2 size={16} /></button>
                  </div>
                  <textarea 
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 text-sm text-gray-800 resize-none outline-none border-none leading-relaxed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Package category</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                  />
                  <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-6">
                <label className="block text-xs font-bold text-gray-700">Location access for customer</label>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                    <input 
                      type="radio"
                      name="locationMode"
                      checked={locationMode === 'selected'}
                      onChange={() => setLocationMode('selected')}
                      className="w-4 h-4 accent-black"
                    />
                    All locations or selected location(s)
                  </label>

                  <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                    <input 
                      type="radio"
                      name="locationMode"
                      checked={locationMode === 'single'}
                      onChange={() => setLocationMode('single')}
                      className="w-4 h-4 accent-black"
                    />
                    Any single location <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px]">?</span>
                  </label>
                </div>

                {locationMode === 'selected' && (
                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-3 text-sm font-bold text-gray-900 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={allLocationAccess}
                        onChange={(e) => {
                          setAllLocationAccess(e.target.checked);
                          setNexStudioAccess(e.target.checked);
                          setNexBarbershopAccess(e.target.checked);
                        }}
                        className="w-4 h-4 rounded accent-black"
                      />
                      All location access
                    </label>

                    <div className="pl-6 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={nexStudioAccess}
                          onChange={(e) => setNexStudioAccess(e.target.checked)}
                          className="w-4 h-4 rounded accent-black"
                        />
                        Nex Studio
                      </label>

                      <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={nexBarbershopAccess}
                          onChange={(e) => setNexBarbershopAccess(e.target.checked)}
                          className="w-4 h-4 rounded accent-black"
                        />
                        Nex Barbershop
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900">Validity</h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                    Package validity <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px]">?</span>
                  </label>
                  
                  <div className="flex gap-3 max-w-xs">
                    <input 
                      type="number"
                      value={validityNumber}
                      onChange={(e) => setValidityNumber(Number(e.target.value))}
                      className="w-24 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                    />

                    <div className="relative flex-1">
                      <select 
                        value={validityUnit}
                        onChange={(e) => setValidityUnit(e.target.value as any)}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B] cursor-pointer"
                      >
                        <option value="Days">Days</option>
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-gray-700">Activation date</label>
                  
                  <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                    <input 
                      type="radio"
                      name="activationDate"
                      checked={activationDate === 'purchase'}
                      onChange={() => setActivationDate('purchase')}
                      className="w-4 h-4 accent-black"
                    />
                    Date of purchase
                  </label>

                  <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                    <input 
                      type="radio"
                      name="activationDate"
                      checked={activationDate === 'first_booking'}
                      onChange={() => setActivationDate('first_booking')}
                      className="w-4 h-4 accent-black"
                    />
                    Date of first booking
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PRICING (Image 1) */}
          {activeStep === 'Pricing' && (
            <div className="animate-fade-in space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Pricing</h2>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  How much you charge is entirely up to you. Enter the price you want each customer to pay and discover what you can earn.
                </p>
              </div>

              {/* Customer Groups Container */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Customer groups</h3>
                
                <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-6 space-y-4">
                  {customerGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between gap-4 py-1">
                      <label className="flex items-center gap-3 text-sm font-bold text-gray-900 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={group.checked}
                          onChange={() => toggleGroupCheck(group.id)}
                          className="w-5 h-5 rounded accent-black"
                        />
                        {group.name}
                      </label>

                      {group.checked && (
                        <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-2.5 max-w-[200px] w-full focus-within:ring-2 focus-within:ring-[#1D1B4B]">
                          <span className="text-xs font-bold text-gray-400 mr-2 shrink-0">S$</span>
                          <input 
                            type="text" 
                            value={group.price}
                            onChange={(e) => updateGroupPrice(group.id, e.target.value)}
                            className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Number of Credits */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3">Number of credits</label>
                <div className="flex items-center justify-between border border-gray-300 rounded-xl bg-white px-4 py-3 max-w-[180px]">
                  <button 
                    onClick={() => setNumberOfCredits(Math.max(1, numberOfCredits - 1))}
                    className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-lg text-gray-900">{numberOfCredits}</span>
                  <button 
                    onClick={() => setNumberOfCredits(numberOfCredits + 1)}
                    className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: OPTIONS (Image 2 & 3) */}
          {activeStep === 'Options' && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Options</h2>

              {/* Purchase Options */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Purchase options</h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Purchase limit</label>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={limitPurchase}
                        onChange={(e) => setLimitPurchase(e.target.checked)}
                        className="w-4 h-4 rounded accent-black"
                      />
                      Limit the number of times this plan can be purchased per customer
                    </label>

                    {limitPurchase && (
                      <input 
                        type="number"
                        value={purchaseLimitCount}
                        onChange={(e) => setPurchaseLimitCount(Number(e.target.value))}
                        className="w-24 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium ml-7 focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                      />
                    )}

                    <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={restrictSpecificCustomers}
                        onChange={(e) => setRestrictSpecificCustomers(e.target.checked)}
                        className="w-4 h-4 rounded accent-black"
                      />
                      Restrict to specific customers <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px]">?</span>
                    </label>
                  </div>
                </div>

                {/* Set as Shareable */}
                <div className="flex items-start justify-between border-t border-gray-100 pt-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Set as shareable</h4>
                    <p className="text-xs text-gray-500 font-medium">Allow this plan to be shared between customers</p>
                    
                    {setShareable && (
                      <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer mt-3">
                        <input 
                          type="checkbox"
                          checked={limitSharePeople}
                          onChange={(e) => setLimitSharePeople(e.target.checked)}
                          className="w-4 h-4 rounded accent-black"
                        />
                        Limit the total number of people that can be shared
                      </label>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => setSetShareable(!setShareable)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors p-1 cursor-pointer shrink-0",
                      setShareable ? "bg-green-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform",
                      setShareable ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Set as Transferrable */}
                <div className="flex items-start justify-between border-t border-gray-100 pt-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Set as transferrable</h4>
                    <p className="text-xs text-gray-500 font-medium">Allow this plan to be transferred to another customer</p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setSetTransferrable(!setTransferrable)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors p-1 cursor-pointer shrink-0",
                      setTransferrable ? "bg-green-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform",
                      setTransferrable ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              {/* Booking Options */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900">Booking options</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm font-medium text-gray-800 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={limitBookingPax}
                      onChange={(e) => setLimitBookingPax(e.target.checked)}
                      className="w-4 h-4 rounded accent-black"
                    />
                    Limit the number of customers to be booked per class <span className="w-4 h-4 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center text-[10px]">?</span>
                  </label>

                  {limitBookingPax && (
                    <div className="pl-7 space-y-1">
                      <div className="flex items-center justify-between border border-gray-300 rounded-xl bg-white px-4 py-2.5 max-w-[160px]">
                        <button 
                          onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                          className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center hover:bg-gray-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-sm text-gray-900">{paxCount} pax</span>
                        <button 
                          onClick={() => setPaxCount(paxCount + 1)}
                          className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center hover:bg-gray-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">Maximum pax: {paxCount}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: CLASSES TO INCLUDE (Image 4 & 5) */}
          {activeStep === 'Classes to include' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">What classes should be included in this package?</h2>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Assign the different classes for this package and enter the credit rate. This will deduct credits from this package to fulfill the class credit requirements.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search class"
                  value={classSearchQuery}
                  onChange={(e) => setClassSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#1D1B4B] outline-none"
                />
              </div>

              {/* Select All Classes */}
              <label className="flex items-center gap-3 text-sm font-bold text-gray-900 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={selectAllClasses}
                  onChange={(e) => handleSelectAllClasses(e.target.checked)}
                  className="w-5 h-5 rounded accent-black"
                />
                Select all classes
              </label>

              {/* Classes Accordion Checklist */}
              <div className="space-y-3">
                {[
                  {
                    id: 'reformer',
                    name: 'Reformer Pilates',
                    checked: true,
                    count: 1,
                    isExpanded: true,
                    subItems: [
                      { id: 'ref-private', name: 'Reformer Pilates Private', checked: false, credits: 1 },
                      { id: 'ref-group', name: 'Reformer Pilates', checked: true, credits: 2 }
                    ]
                  },
                  {
                    id: 'facility',
                    name: 'Facility Rental',
                    checked: false,
                    count: 0,
                    isExpanded: false,
                    subItems: [
                      { id: 'fac-1', name: 'Studio 1 Rental', checked: false, credits: 1 }
                    ]
                  },
                  {
                    id: 'kids',
                    name: "Kids' Class",
                    checked: false,
                    count: 0,
                    isExpanded: false,
                    subItems: [
                      { id: 'kids-1', name: 'Kids Aerial Sling', checked: false, credits: 1 }
                    ]
                  },
                  {
                    id: 'personal',
                    name: 'Personal Trainer',
                    checked: true,
                    count: 1,
                    isExpanded: true,
                    subItems: [
                      { id: 'pt-1', name: 'Personal Training', checked: true, credits: 3 }
                    ]
                  },
                  {
                    id: 'private',
                    name: 'Private Class',
                    checked: false,
                    count: 0,
                    isExpanded: false,
                    subItems: [
                      { id: 'priv-1', name: '1-on-1 Pole Session', checked: false, credits: 2 }
                    ]
                  },
                  {
                    id: 'massage',
                    name: 'Massage',
                    checked: false,
                    count: 0,
                    isExpanded: false,
                    subItems: [
                      { id: 'msg-1', name: 'Deep Tissue 60m', checked: false, credits: 2 }
                    ]
                  }
                ].filter(c => c.name.toLowerCase().includes(classSearchQuery.toLowerCase())).map((item) => (
                  <div key={item.id} className="bg-[#FAF9F7] rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
                    {/* Parent Row */}
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50">
                      <label className="flex items-center gap-3 text-sm font-bold text-gray-900 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {}}
                          className="w-5 h-5 rounded accent-black"
                        />
                        {item.name}
                        {item.count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                            {item.count}
                          </span>
                        )}
                      </label>

                      {item.isExpanded ? <ChevronUp size={18} className="text-gray-600" /> : <ChevronDown size={18} className="text-gray-600" />}
                    </div>

                    {/* Expanded Sub-Items with Credit Counters */}
                    {item.isExpanded && (
                      <div className="px-6 pb-5 pt-2 space-y-4 border-t border-gray-200/60 bg-white">
                        {item.subItems.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between gap-4">
                            <label className={cn(
                              "flex items-center gap-3 text-sm font-medium cursor-pointer",
                              sub.checked ? "text-gray-900 font-bold" : "text-gray-400"
                            )}>
                              <input 
                                type="checkbox"
                                checked={sub.checked}
                                onChange={() => {}}
                                className="w-4 h-4 rounded accent-black"
                              />
                              {sub.name}
                            </label>

                            {sub.checked && (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-3 py-1.5 shadow-sm">
                                  <button className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800">
                                    <Minus size={12} />
                                  </button>
                                  <span className="font-bold text-sm text-gray-900">{sub.credits}</span>
                                  <button className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800">
                                    <Plus size={12} />
                                  </button>
                                </div>
                                <span className="text-xs text-gray-500 font-semibold">credit required</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Buttons */}
              <div className="pt-6 flex justify-between items-center border-t border-gray-200">
                <button 
                  onClick={() => setActiveStep('Options')}
                  className="px-8 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 text-sm"
                >
                  Back
                </button>
                <Link 
                  href="/portal/pricing"
                  className="px-8 py-2.5 rounded-full bg-[#1D1B4B] text-white font-bold hover:bg-[#2E2B70] text-sm shadow-md"
                >
                  Save
                </Link>
              </div>

            </div>
          )}

        </div>

        {/* Right Info Tips Box */}
        <div className="w-72 shrink-0">
          <div className="bg-black text-white rounded-2xl p-6 shadow-xl sticky top-28">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-400 fill-yellow-400" /> Tips
            </h3>
            <p className="text-xs leading-relaxed text-gray-300">
              {activeStep === 'Details' && "Describe your package so that your customers can choose which is suitable."}
              {activeStep === 'Pricing' && "Set custom pricing rates per customer group to reward your loyal members."}
              {activeStep === 'Options' && "Configure purchase limits, shareability, and booking rules for your package."}
              {activeStep === 'Classes to include' && "Classes and outlets have different credit rates that vary depending on location, popularity or cost of the class."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
