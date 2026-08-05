'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  PlusCircle,
  MinusCircle,
  UserCheck,
  Shield,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import type { Customer } from '@/types';

interface ClientDirectoryTableProps {
  customers: Customer[];
  onAdjustCredits: (customerId: string, delta: number, description: string) => void;
}

export default function ClientDirectoryTable({
  customers,
  onAdjustCredits
}: ClientDirectoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedClientForAdjust, setSelectedClientForAdjust] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustNote, setAdjustNote] = useState<string>('Manual credit adjustment');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm);

      const matchesTier =
        tierFilter === 'all' ||
        (tierFilter === 'premium' && c.membershipTier?.toLowerCase().includes('premium')) ||
        (tierFilter === 'standard' && !c.membershipTier?.toLowerCase().includes('premium'));

      return matchesSearch && matchesTier;
    });
  }, [customers, searchTerm, tierFilter]);

  // Export CSV/Excel function
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Credits Balance', 'Tier', 'Joined Date'];
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      c.credits,
      c.membershipTier || 'Standard',
      '2026-01-01'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Evolve_Client_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Client directory exported to CSV successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyAdjustment = (customerId: string, delta: number) => {
    onAdjustCredits(customerId, delta, adjustNote);
    const client = customers.find(c => c.id === customerId);
    setToastMessage(`Updated credits for ${client?.name || 'client'}`);
    setTimeout(() => setToastMessage(null), 3000);
    setSelectedClientForAdjust(null);
  };

  return (
    <div className="space-y-4">
      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141416] p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Client Master Directory & Ledger</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Total Recorded Clients: <span className="text-white font-bold">{customers.length}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A961]"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#C9A961]"
          >
            <option value="all">All Tiers</option>
            <option value="premium">Premium Tier Only</option>
            <option value="standard">Standard Tier Only</option>
          </select>

          {/* Export to Excel Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-900/20"
          >
            <Download size={14} />
            <span>Export Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#141416] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead className="bg-zinc-900/80 text-[10px] uppercase tracking-wider text-zinc-400 font-mono border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Client Name & Email</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Membership Tier</th>
                <th className="py-3 px-4 text-center">Wallet Credits</th>
                <th className="py-3 px-4 text-right">Actions / Adjustments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono">
                    No clients match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center border border-zinc-700">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{c.name}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {c.phone || 'N/A'}
                    </td>

                    <td className="py-3 px-4">
                      {c.membershipTier?.toLowerCase().includes('premium') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A961]/15 text-[#C9A961] border border-[#C9A961]/30">
                          <Shield size={10} />
                          PREMIUM TIER
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400">
                          {c.membershipTier || 'STANDARD TIER'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-sm text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {c.credits} Credits
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {selectedClientForAdjust === c.id ? (
                        <div className="flex items-center justify-end gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-700 animate-in fade-in">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={adjustAmount}
                            onChange={e => setAdjustAmount(parseInt(e.target.value) || 1)}
                            className="w-14 bg-black border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => handleApplyAdjustment(c.id, adjustAmount)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <PlusCircle size={12} /> Add
                          </button>
                          <button
                            onClick={() => handleApplyAdjustment(c.id, -adjustAmount)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <MinusCircle size={12} /> Deduct
                          </button>
                          <button
                            onClick={() => setSelectedClientForAdjust(null)}
                            className="text-zinc-500 hover:text-zinc-300 text-[10px] px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedClientForAdjust(c.id);
                            setAdjustAmount(1);
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-medium border border-zinc-700 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <UserCheck size={12} />
                          <span>Adjust Balance</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
