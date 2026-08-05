'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, Save, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'Account details' | 'Contact details' | 'Personal details' | 'Employment details' | 'Display staff on website';

export default function EditStaffPage() {
  const [activeStep, setActiveStep] = useState<Step>('Account details');
  
  // Form State
  const [availableForBooking, setAvailableForBooking] = useState(true);
  const [firstName, setFirstName] = useState('Esther');
  const [lastName, setLastName] = useState('Rezeve');
  const [email, setEmail] = useState('esther@rezeve.com');
  const [role, setRole] = useState('Instructor');

  const steps: Step[] = [
    'Account details',
    'Contact details',
    'Personal details',
    'Employment details',
    'Display staff on website'
  ];

  const rolesList = ['Admin', 'Instructor', 'Receptionist', 'No access', 'Trial Account'];

  return (
    <div className="bg-[#F9FAFB] min-h-screen font-sans flex flex-col relative text-black animate-fade-in">
      
      {/* Top Bar */}
      <div className="h-20 border-b border-gray-200 bg-white flex items-center justify-end px-8 gap-4 sticky top-0 z-20">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm">
          <Eye size={16} className="text-[#1D1B4B]" /> Preview
        </button>
        <Link 
          href="/portal/users"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-sm"
        >
          Save & Exit
        </Link>
      </div>

      <div className="flex flex-1 max-w-[1100px] w-full mx-auto p-8 gap-12">
        
        {/* Left Sidebar Steps */}
        <div className="w-64 shrink-0">
          <div className="text-sm text-gray-500 font-medium mb-2">
            <Link href="/portal/users" className="hover:text-black">Staff</Link> &gt; <span className="text-black font-bold">Edit staff</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit staff</h1>
          
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

        {/* Main Form Content */}
        <div className="flex-1 max-w-xl">
          {activeStep === 'Account details' && (
            <div className="animate-fade-in space-y-8">
              
              <h2 className="text-3xl font-bold text-gray-900">Account details</h2>

              {/* Toggle Switch Card */}
              <div className="flex items-start justify-between border-b border-gray-200 pb-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Available for booking on Online Store</h3>
                  <p className="text-xs text-gray-500 font-medium">Able to assign classes and be bookable by customers</p>
                </div>

                <button 
                  type="button"
                  onClick={() => setAvailableForBooking(!availableForBooking)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors p-1 cursor-pointer",
                    availableForBooking ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white transition-transform",
                    availableForBooking ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>

              {/* Account Image */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3">Account image (Optional)</label>
                <div className="w-16 h-16 rounded-full bg-yellow-500 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                  ER
                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">First name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Last name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B]"
                />
                <p className="text-xs text-gray-400 font-medium mt-1.5">This will be their login email address.</p>
              </div>

              {/* Role Select Dropdown */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-xs font-bold text-gray-700 mb-2">Role</label>
                <div className="relative">
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D1B4B] cursor-pointer"
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

            </div>
          )}

          {/* Placeholders for other steps */}
          {activeStep !== 'Account details' && (
            <div className="py-12 text-center text-gray-400 font-medium">
              Section ({activeStep}) settings loaded.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
