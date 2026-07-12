'use client';

import React, { useState } from 'react';
import { Camera, Check } from 'lucide-react';

interface POSOverrideBridgeProps {
  classes: any[];
  onConfirmOverride: (data: {
    clientName: string;
    email: string;
    paymentChannel: string;
    refNum: string;
    classId: string;
    screenshotUrl?: string;
  }) => void;
}

export default function POSOverrideBridge({ classes, onConfirmOverride }: POSOverrideBridgeProps) {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [refNum, setRefNum] = useState('');
  const [channel, setChannel] = useState('GCASH');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !email || !refNum || !selectedClassId) return;
    setIsSaving(true);

    setTimeout(() => {
      onConfirmOverride({
        clientName,
        email,
        paymentChannel: channel,
        refNum,
        classId: selectedClassId,
        screenshotUrl: screenshotUploaded ? '/mock/uploads/receipt.png' : undefined,
      });
      setIsSaving(false);
      alert('Manual intake complete. Roster spot secured.');
    }, 1000);
  };

  return (
    <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 max-w-md w-full space-y-6 text-[#F5F5F3]">
      <div>
        <h3 className="text-lg font-bold tracking-tight uppercase text-[#C9A961] text-balance">Social Media Intake Bridge</h3>
        <p className="text-xs text-zinc-500 mt-1">Manual overrides place clients on physical rigging points immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-400">Target Class Session</label>
          <select 
            required
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)} 
            className="w-full p-3 bg-[#1C1C1C] border border-zinc-850 text-white rounded-xl focus:outline-none focus:border-[#C9A961] transition-colors duration-200"
          >
            <option value="" className="bg-[#121212]">-- Select Class Session --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id} className="bg-[#121212]">
                {c.title} w/ {c.instructor?.name || c.instructorName} ({c.date} @ {c.time})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400">Client Name</label>
            <input 
              required 
              type="text" 
              value={clientName} 
              onChange={e => setClientName(e.target.value)} 
              className="w-full p-3 bg-[#1C1C1C] border border-zinc-850 rounded-xl focus:outline-none focus:border-[#C9A961] text-white transition-colors duration-200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400">Email Address</label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-3 bg-[#1C1C1C] border border-zinc-850 rounded-xl focus:outline-none focus:border-[#C9A961] text-white transition-colors duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400">Override Mode</label>
            <select 
              value={channel} 
              onChange={e => setChannel(e.target.value)} 
              className="w-full p-3 bg-[#1C1C1C] border border-zinc-850 text-white rounded-xl focus:outline-none focus:border-[#C9A961] transition-colors duration-200"
            >
              <option value="GCASH" className="bg-[#121212]">GCash</option>
              <option value="PAYMAYA" className="bg-[#121212]">PayMaya</option>
              <option value="BANK_TRANSFER" className="bg-[#121212]">Bank Transfer</option>
              <option value="SOCIAL_MEDIA_OVERRIDE" className="bg-[#121212]">Social Media PM</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400">Payment Reference</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Ref #10029302"
              value={refNum} 
              onChange={e => setRefNum(e.target.value)} 
              className="w-full p-3 bg-[#1C1C1C] border border-zinc-850 rounded-xl focus:outline-none focus:border-[#C9A961] text-white placeholder-zinc-700 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Screenshot Upload Dropzone */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-zinc-400">Screenshot Verification Bridge</label>
          <div 
            onClick={() => setScreenshotUploaded(true)}
            className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center gap-1.5 ${
              screenshotUploaded ? 'border-emerald-500 bg-emerald-950/20' : 'border-zinc-800 hover:bg-[#1C1C1C]'
            }`}
          >
            {screenshotUploaded ? (
              <>
                <Check className="text-emerald-500" size={16} />
                <span className="text-[10px] text-emerald-400">Receipt screenshot verified successfully</span>
              </>
            ) : (
              <>
                <Camera className="text-zinc-500" size={16} />
                <span className="text-zinc-400">Upload GCash / Bank Confirmation Receipt</span>
              </>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full min-h-[48px] bg-[#C9A961] hover:bg-[#b09352] text-black transition-transform duration-200 active:scale-[0.96] rounded-full font-black uppercase tracking-wider text-[10px] mt-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? 'Processing database transaction...' : 'Secure Rigging Spot'}
        </button>
      </form>
    </div>
  );
}
