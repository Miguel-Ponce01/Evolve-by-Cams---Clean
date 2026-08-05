'use client';

import React, { useState } from 'react';
import {
  Share2,
  Tag,
  Code2,
  CheckCircle2,
  Copy,
  RotateCcw,
  Save,
  Sparkles,
  ExternalLink,
  Sliders
} from 'lucide-react';

export default function MarketingInvites() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Widget settings state
  const [widgetMode, setWidgetMode] = useState<'button' | 'embedded'>('button');
  const [primaryColor, setPrimaryColor] = useState('#C9A961');
  const [buttonLabel, setButtonLabel] = useState('Book Reformer Class');
  const [autoOpenModal, setAutoOpenModal] = useState(false);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage('Copied code snippet to clipboard!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettings = () => {
    setToastMessage('Booking widget configuration saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetDefaults = () => {
    setWidgetMode('button');
    setPrimaryColor('#C9A961');
    setButtonLabel('Book Reformer Class');
    setAutoOpenModal(false);
    setToastMessage('Widget settings reset to defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const buttonSnippet = `<script src="https://evolve.studio/widget.js"></script>
<button data-evolve-widget="modal" data-[#C9A961]="${primaryColor}">
  ${buttonLabel}
</button>`;

  const embeddedSnippet = `<iframe src="https://evolve.studio/book/embed" width="100%" height="700px" frameborder="0"></iframe>`;

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141416] p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Share2 size={20} className="text-[#C9A961]" />
            <span>Marketing, Invites & Widget Integrations</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Generate invite posts, review promo codes draft status, and configure booking widget embeds.
          </p>
        </div>
      </div>

      {/* Grid: Marketing Draft & Promo Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Draft Invites Post */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[#C9A961]" />
              <span>Social Media & VIP Invite Copy</span>
            </h3>
            <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Draft</span>
          </div>

          <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 text-xs space-y-3 font-sans text-zinc-300">
            <p className="font-semibold text-white">✨ Elevate Your Pilates Practice at Evolve Studio Davao!</p>
            <p>
              Experience world-class Reformer Pilates, tailored alignment coaching, and state-of-the-art Allegro reformers.
            </p>
            <p className="font-mono text-[11px] text-[#C9A961]">
              👉 Book your spot today: https://evolve.studio/book
            </p>
          </div>

          <button
            onClick={() => handleCopy('✨ Elevate Your Pilates Practice at Evolve Studio Davao! Book your spot today: https://evolve.studio/book')}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-700"
          >
            <Copy size={14} />
            <span>Copy Post Invite Copy</span>
          </button>
        </div>

        {/* Promo Codes Status */}
        <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag size={16} className="text-purple-400" />
              <span>Promo Code Management</span>
            </h3>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
              NOT YET DONE / DRAFT
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white font-mono">EVOLVE10</p>
                <p className="text-[10px] text-zinc-400">10% Off POS Cart Pass & Bundles</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVE</span>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white font-mono">VIPNEW2026</p>
                <p className="text-[10px] text-zinc-400">Free Grip Towel with 88 Session Pack</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">DRAFT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Widget Settings Section */}
      <div className="bg-[#141416] p-6 rounded-2xl border border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 size={18} className="text-blue-400" />
              <span>Booking Widget Integration & Embed Mode</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Customize how the booking calendar appears on external websites or partner landing pages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-medium border border-zinc-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset to Default</span>
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-1.5 bg-[#C9A961] hover:bg-[#b09352] text-black rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <Save size={12} />
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* Integration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-2">
              Integration Display Mode
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="widgetMode"
                  checked={widgetMode === 'button'}
                  onChange={() => setWidgetMode('button')}
                />
                <div>
                  <p className="font-bold text-white">Button Trigger Modal</p>
                  <p className="text-[10px] text-zinc-400">Opens overlay modal on click</p>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="widgetMode"
                  checked={widgetMode === 'embedded'}
                  onChange={() => setWidgetMode('embedded')}
                />
                <div>
                  <p className="font-bold text-white">Embedded Layout Frame</p>
                  <p className="text-[10px] text-zinc-400">Inline full-width calendar iframe</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-2">
              Button Label Text
            </label>
            <input
              type="text"
              value={buttonLabel}
              onChange={e => setButtonLabel(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#C9A961]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-2">
              Primary Accent Hex Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Snippet Output */}
        <div className="bg-black/60 p-4 rounded-xl border border-zinc-800 relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-mono text-zinc-500">
              HTML / JS Embed Code ({widgetMode === 'button' ? 'Modal Trigger' : 'Inline Frame'})
            </span>
            <button
              onClick={() => handleCopy(widgetMode === 'button' ? buttonSnippet : embeddedSnippet)}
              className="text-xs text-[#C9A961] hover:underline flex items-center gap-1 cursor-pointer font-mono"
            >
              <Copy size={12} />
              <span>Copy Snippet</span>
            </button>
          </div>
          <pre className="text-zinc-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
            {widgetMode === 'button' ? buttonSnippet : embeddedSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
