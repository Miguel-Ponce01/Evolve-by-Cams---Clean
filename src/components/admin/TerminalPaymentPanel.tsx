// src/components/admin/TerminalPaymentPanel.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StripeTerminalIntegration, StripeTerminalState } from '@/lib/stripeTerminal';
import { CreditCard, Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface TerminalPaymentPanelProps {
  onPaymentSuccess: (amount: number, transactionId: string) => void;
}

export default function TerminalPaymentPanel({ onPaymentSuccess }: TerminalPaymentPanelProps) {
  const [terminalState, setTerminalState] = useState<StripeTerminalState>('IDLE');
  const [amount, setAmount] = useState<string>('250');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const terminal = useMemo(() => {
    return new StripeTerminalIntegration((state: StripeTerminalState) => setTerminalState(state));
  }, []);

  const handleConnect = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const success = await terminal.initializeTerminal();
    if (!success) {
      setErrorMsg('Failed to establish terminal communication.');
    }
  };

  const handleCollect = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setErrorMsg('Please enter a valid payment amount.');
      return;
    }

    const result = await terminal.processPayment(value);
    if (result.success && result.transactionId) {
      setSuccessMsg(result.message);
      onPaymentSuccess(value, result.transactionId);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="bg-[#121212] border border-zinc-900 rounded-3xl p-6 max-w-md w-full space-y-6 text-[#F5F5F3]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight uppercase text-[#C9A961]">Stripe Smart Terminal</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">BBPOS WisePOS E counter checkout</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-bold">
          {terminalState === 'CONNECTED' ? (
            <>
              <Wifi className="text-emerald-500 w-3.5 h-3.5" />
              <span className="text-zinc-300">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="text-zinc-600 w-3.5 h-3.5" />
              <span className="text-zinc-500">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Reader Setup / Action area */}
      {terminalState === 'IDLE' ? (
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 text-center space-y-3">
          <CreditCard className="w-8 h-8 text-zinc-600 mx-auto" />
          <div>
            <p className="text-xs font-bold text-zinc-300">Reader Connection Required</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Initiate connection to register terminal readers.</p>
          </div>
          <button
            onClick={handleConnect}
            className="w-full py-2.5 bg-[#C9A961] hover:bg-[#b09352] text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer"
          >
            Connect WisePOS E
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Amount input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-400">Payment Amount (PHP)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">₱</span>
              <input
                type="number"
                disabled={terminalState !== 'CONNECTED'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 pl-8 bg-zinc-950 border border-zinc-850 rounded-xl focus:outline-none focus:border-[#C9A961] text-white text-sm font-bold transition-colors duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Quick options */}
          <div className="grid grid-cols-3 gap-2">
            {[250, 1000, 2500].map((val) => (
              <button
                key={val}
                disabled={terminalState !== 'CONNECTED'}
                onClick={() => setAmount(val.toString())}
                className={`py-2 border rounded-lg text-[10px] font-black tracking-wider transition-colors duration-150 cursor-pointer ${
                  amount === val.toString()
                    ? 'border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961]'
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                ₱{val}
              </button>
            ))}
          </div>

          {/* Action trigger button */}
          <button
            onClick={handleCollect}
            disabled={terminalState !== 'CONNECTED'}
            className="w-full min-h-[48px] bg-[#C9A961] hover:bg-[#b09352] disabled:bg-zinc-850 disabled:text-zinc-500 text-black rounded-full font-black uppercase tracking-wider text-[10px] transition-transform duration-150 active:scale-[0.97] cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            {(terminalState === 'PROCESSING' || terminalState === 'AWAITING_TAP') && (
              <RefreshCw className="animate-spin w-3.5 h-3.5" />
            )}
            {terminalState === 'AWAITING_TAP'
              ? 'Awaiting Card Tap...'
              : terminalState === 'PROCESSING'
              ? 'Authorizing Transaction...'
              : 'Collect Payment'}
          </button>
        </div>
      )}

      {/* Visual feedbacks */}
      {errorMsg && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-[10px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-xl text-[10px] flex items-start gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
