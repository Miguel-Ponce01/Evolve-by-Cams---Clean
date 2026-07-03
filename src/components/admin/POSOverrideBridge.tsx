'use client';

import React, { useState } from 'react';
import { Camera, Check } from 'lucide-react';

interface POSOverrideBridgeProps {
  onConfirmOverride: (data: {
    clientName: string;
    email: string;
    paymentChannel: string;
    refNum: string;
    screenshotUrl?: string;
  }) => void;
}

export default function POSOverrideBridge({ onConfirmOverride }: POSOverrideBridgeProps) {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [refNum, setRefNum] = useState('');
  const [channel, setChannel] = useState('GCASH');
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !email || !refNum) return;
    setIsSaving(true);

    setTimeout(() => {
      onConfirmOverride({
        clientName,
        email,
        paymentChannel: channel,
        refNum,
        screenshotUrl: screenshotUploaded ? '/mock/uploads/receipt.png' : undefined,
      });
      setIsSaving(false);
      alert('Manual intake complete. Roster spot secured.');
    }, 1000);
  };

  return (
    <div className="bg-[#f9f9f9] border border-zinc-200 rounded-3xl p-6 max-w-md w-full space-y-6 text-zinc-900">
      <div>
        <h3 className="text-lg font-bold tracking-tight uppercase">Social Media Intake Bridge</h3>
        <p className="text-xs text-zinc-500 mt-1">Manual overrides place clients on physical rigging points immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500">Client Name</label>
            <input 
              required 
              type="text" 
              value={clientName} 
              onChange={e => setClientName(e.target.value)} 
              className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-black text-black"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500">Email Address</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-black text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500">Override Mode</label>
            <select 
              value={channel} 
              onChange={e => setChannel(e.target.value)} 
              className="w-full p-3 bg-white border border-zinc-200 text-black rounded-xl focus:outline-none focus:border-black"
            >
              <option value="GCASH">GCash</option>
              <option value="PAYMAYA">PayMaya</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="SOCIAL_MEDIA_OVERRIDE">Social Media PM</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500">Payment Reference</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Ref #10029302"
              value={refNum} 
              onChange={e => setRefNum(e.target.value)} 
              className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-black text-black"
            />
          </div>
        </div>

        {/* Screenshot Upload Dropzone */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-500">Screenshot Verification Bridge</label>
          <div 
            onClick={() => setScreenshotUploaded(true)}
            className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 ${
              screenshotUploaded ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            {screenshotUploaded ? (
              <>
                <Check className="text-emerald-500" size={16} />
                <span className="text-[10px] text-emerald-700">Receipt screenshot verified successfully</span>
              </>
            ) : (
              <>
                <Camera className="text-zinc-400" size={16} />
                <span>Upload GCash / Bank Confirmation Receipt</span>
              </>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full min-h-[48px] bg-black text-white hover:bg-zinc-800 transition-all rounded-full font-black uppercase tracking-wider text-[10px] mt-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? 'Processing database transaction...' : 'Secure Rigging Spot'}
        </button>
      </form>
    </div>
  );
}
