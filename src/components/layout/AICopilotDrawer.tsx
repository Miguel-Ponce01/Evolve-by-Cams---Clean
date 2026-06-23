'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBooking } from '@/context/BookingContext';
import { AGENT_PERSONAS, AgentType } from '@/lib/agentPersonas';
import { 
  Sparkles, 
  X, 
  Send, 
  Terminal, 
  Activity, 
  AlertCircle, 
  RefreshCw,
  Copy,
  Check,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export function AICopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentType>('debugging');
  const [messages, setMessages] = useState<Record<AgentType, Message[]>>({
    coding: [
      {
        role: 'model',
        text: 'Hello! I am the Coding Agent. I can help you draft styling variations, check touch target sizes (min 48x48px), and review Slacc brand design alignment. How can I help with the UI today?',
        timestamp: new Date()
      }
    ],
    debugging: [
      {
        role: 'model',
        text: 'Hello! I am the Debugging Agent. Click "Roster Diagnostic" below to have me run a real-time audit of active Pilates bookings and waitlists, or describe a scheduling conflict to begin.',
        timestamp: new Date()
      }
    ],
    deployment: [
      {
        role: 'model',
        text: 'Hello! I am the Deployment Agent. I can help guide you through Next.js static builds (`npm run build`), Capacitor syncing, or opening the project in Android Studio. What is our deployment target?',
        timestamp: new Date()
      }
    ]
  });
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const { classes, bookings, waitlist } = useBooking();
  const feedEndRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  // Load messages from localStorage on mount (hydration-safe)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('evolve_ai_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored: Record<AgentType, Message[]> = {
          coding: parsed.coding?.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) || [],
          debugging: parsed.debugging?.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) || [],
          deployment: parsed.deployment?.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) || []
        };
        if (restored.coding.length || restored.debugging.length || restored.deployment.length) {
          setMessages(restored);
        }
      }
    } catch (e) {
      console.error('Failed to load AI messages from localStorage:', e);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('evolve_ai_messages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save AI messages to localStorage:', e);
    }
  }, [messages]);

  // Auto-scroll chat feed
  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeAgent, isLoading]);

  const getAgentTheme = (agent: AgentType) => {
    switch (agent) {
      case 'coding':
        return {
          avatar: '💻',
          gradient: 'from-purple-500 to-indigo-600',
          accent: 'border-l-4 border-l-purple-500',
          textMute: 'text-purple-600'
        };
      case 'debugging':
        return {
          avatar: '🔍',
          gradient: 'from-amber-500 to-orange-600',
          accent: 'border-l-4 border-l-amber-500',
          textMute: 'text-amber-600'
        };
      case 'deployment':
        return {
          avatar: '🚀',
          gradient: 'from-sky-500 to-link-blue',
          accent: 'border-l-4 border-l-link-blue',
          textMute: 'text-sky-600'
        };
    }
  };

  const handleClearHistory = () => {
    const defaultGreeting = {
      coding: 'Hello! I am the Coding Agent. I can help you draft styling variations, check touch target sizes (min 48x48px), and review Slacc brand design alignment. How can I help with the UI today?',
      debugging: 'Hello! I am the Debugging Agent. Click "Roster Diagnostic" below to have me run a real-time audit of active Pilates bookings and waitlists, or describe a scheduling conflict to begin.',
      deployment: 'Hello! I am the Deployment Agent. I can help guide you through Next.js static builds (`npm run build`), Capacitor syncing, or opening the project in Android Studio. What is our deployment target?'
    };

    setMessages(prev => ({
      ...prev,
      [activeAgent]: [
        {
          role: 'model',
          text: defaultGreeting[activeAgent],
          timestamp: new Date()
        }
      ]
    }));
    setShowClearConfirm(false);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || isLoading) return;

    if (!apiKey) {
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [
          ...prev[activeAgent],
          { role: 'user', text: textToSend, timestamp: new Date() },
          { 
            role: 'model', 
            text: '⚠ Error: GEMINI_API_KEY is not configured in .env.local. Please configure NEXT_PUBLIC_GEMINI_API_KEY to enable live AI responses.', 
            timestamp: new Date() 
          }
        ]
      }));
      setInputText('');
      return;
    }

    const updatedMessages = [
      ...messages[activeAgent],
      { role: 'user', text: textToSend, timestamp: new Date() }
    ];
    
    setMessages(prev => ({
      ...prev,
      [activeAgent]: updatedMessages
    }));
    setInputText('');
    setIsLoading(true);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}`.replace('{key}', apiKey);
      const payload = {
        contents: [
          {
            parts: [
              { text: textToSend }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            { text: AGENT_PERSONAS[activeAgent] }
          ]
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const resData = await response.json();
      const candidates = resData.candidates || [];
      let replyText = 'Empty response from Gemini.';

      if (candidates.length > 0) {
        const parts = candidates[0].content?.parts || [];
        if (parts.length > 0) {
          replyText = parts[0].text;
        }
      }

      setMessages(prev => ({
        ...prev,
        [activeAgent]: [
          ...updatedMessages,
          { role: 'model', text: replyText, timestamp: new Date() }
        ]
      }));
    } catch (err: any) {
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [
          ...updatedMessages,
          { role: 'model', text: `⚠ Connection Error: ${err.message || err}`, timestamp: new Date() }
        ]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRosterDiagnostic = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayClasses = classes.filter(c => c.date === todayStr);

    const diagnosticPrompt = `Perform a Front-Desk Roster Diagnostic based on the following real-time data:
- Today's date: ${new Date().toLocaleDateString()}
- Total active classes in system: ${classes.length}
- Today's scheduled classes count: ${todayClasses.length}
- Total active bookings in system: ${bookings.length}
- Total waitlisted entries: ${waitlist.length}

Roster Details:
${classes.map(c => {
  const waitCount = waitlist.filter(w => w.classId === c.id).length;
  return `- Class ID "${c.id}": "${c.title}" at ${c.time} with Coach ${c.instructor.name}. Spots: ${c.bookedSpots.length}/${c.totalSpots} filled.${waitCount > 0 ? ` Waitlist: ${waitCount} clients waiting.` : ''}`;
}).join('\n')}

Please perform a structured audit:
1. Identify fully-booked classes and high-demand reformer times.
2. Outline waitlist bottlenecks.
3. Suggest specific front-desk actions (e.g. promoting clients, opening spots, warning coaches of full rosters).
Keep the tone professional, concise, and helpful for the studio staff.`;

    handleSendMessage(diagnosticPrompt);
  };

  const triggerCapacitorCheck = () => {
    const prompt = `Perform a Capacitor Mobile Sync Check:
Briefly summarize the deployment commands needed to sync static Next.js assets ('out/' folder) to the native Android platform on Windows, and give troubleshooting advice for missing Android Studio installation paths.`;
    handleSendMessage(prompt);
  };

  // Styled Markdown Code-Block Parser
  const renderMessageText = (text: string, msgIdx: number) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, matchIndex),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'code',
        content: match[2],
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    if (parts.length === 0) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }

    return (
      <div className="space-y-2">
        {parts.map((part, pIdx) => {
          if (part.type === 'code') {
            const isCopied = copiedId === `${activeAgent}-${msgIdx}-code-${pIdx}`;
            return (
              <div key={pIdx} className="my-2.5 rounded-xl overflow-hidden border border-neutral-700 bg-[#1E1E1E] text-neutral-200 font-mono text-[10px]">
                <div className="bg-[#2D2D2D] px-3.5 py-1.5 flex justify-between items-center text-[9px] text-neutral-400 font-sans border-b border-neutral-700 font-bold uppercase tracking-wider select-none">
                  <span>{part.language}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(part.content);
                      setCopiedId(`${activeAgent}-${msgIdx}-code-${pIdx}`);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check size={10} className="text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={10} /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto leading-normal whitespace-pre">
                  <code>{part.content}</code>
                </pre>
              </div>
            );
          }
          return (
            <p key={pIdx} className="whitespace-pre-wrap leading-relaxed">
              {part.content}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 btn-primary-pill shadow-lg hover:scale-105 flex items-center justify-center gap-2 p-4 cursor-pointer bg-gradient-to-r from-primary to-primary-press text-white border border-primary/25 group transition-all"
        title="Open Staff AI Copilot"
      >
        <div className="relative">
          <Sparkles size={18} className="animate-pulse" />
          <span className="absolute -top-1.5 -right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <span className="font-extrabold text-xs tracking-widest uppercase">Staff AI</span>
      </button>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-primary/30 backdrop-blur-md transition-opacity duration-300"
        />
      )}

      {/* Drawer Container */}
      <div className={cn(
        "fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-[420px] bg-white border-l border-hairline shadow-2xl transition-all duration-300 transform flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Drawer Header */}
        <div className="p-5 border-b border-hairline bg-surface-aubergine text-on-primary flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-on-aubergine-mute font-bold uppercase tracking-wider">
              <Activity size={12} className="text-emerald-400 animate-pulse" /> Live Front-Desk Assistant
            </div>
            <h2 className="text-lg font-display font-black tracking-tight mt-0.5 uppercase">Staff AI Copilot</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-on-aubergine-mute hover:text-on-primary transition-colors p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Agent Tab Selector */}
        <div className="p-3 bg-canvas-lavender/40 border-b border-hairline flex items-center justify-between gap-2">
          <div className="flex-1 grid grid-cols-3 gap-0.5 text-center bg-white p-0.5 rounded-xl border border-hairline shadow-xs">
            {(['coding', 'debugging', 'deployment'] as AgentType[]).map((agent) => {
              const isActive = activeAgent === agent;
              return (
                <button
                  key={agent}
                  onClick={() => {
                    setActiveAgent(agent);
                    setInputText('');
                    setShowClearConfirm(false);
                  }}
                  className={cn(
                    "py-1.5 px-1 text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-all cursor-pointer",
                    isActive 
                      ? "bg-primary text-on-primary shadow-xs" 
                      : "text-ink-mute hover:text-ink hover:bg-canvas-lavender/40"
                  )}
                >
                  {agent === 'coding' && 'Coding'}
                  {agent === 'debugging' && 'Debug'}
                  {agent === 'deployment' && 'Deploy'}
                </button>
              );
            })}
          </div>

          {showClearConfirm ? (
            <div className="flex items-center gap-1.5 bg-white border border-destructive/20 rounded-xl px-2.5 py-1.5 animate-slide-up shrink-0 shadow-xs">
              <button
                onClick={handleClearHistory}
                className="text-[9px] font-black uppercase text-destructive hover:underline cursor-pointer"
              >
                Clear
              </button>
              <span className="text-[9px] text-ink-mute font-bold">/</span>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-[9px] font-black uppercase text-ink hover:underline cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-8 h-8 rounded-xl bg-white border border-hairline text-ink-mute hover:text-destructive flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs hover:border-destructive/20"
              title="Clear Active Chat Log"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas-lavender/10">
          {messages[activeAgent].map((msg, idx) => {
            const isModel = msg.role === 'model';
            const theme = getAgentTheme(activeAgent);
            return (
              <div 
                key={idx} 
                className={cn(
                  "flex gap-2.5 max-w-[88%] transition-all animate-slide-up", 
                  isModel ? "self-start" : "self-end flex-row-reverse ml-auto"
                )}
              >
                {isModel ? (
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 text-white shadow-xs bg-gradient-to-br", theme.gradient)}>
                    {theme.avatar}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 text-white bg-gradient-to-br from-primary-press to-primary shadow-xs font-black font-mono">
                    👑
                  </div>
                )}
                
                <div 
                  className={cn(
                    "flex flex-col rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs border transition-all",
                    isModel 
                      ? cn("bg-white border-hairline text-ink", theme.accent)
                      : "bg-primary text-on-primary border-primary/20"
                  )}
                >
                  <div className={cn(
                    "flex justify-between items-center gap-6 mb-1.5 border-b pb-1 text-[8px] font-extrabold uppercase tracking-widest",
                    isModel ? "border-neutral-100 text-ink-mute/70" : "border-primary-tint/30 text-on-aubergine-mute"
                  )}>
                    <span>{isModel ? `${activeAgent.toUpperCase()} AGENT` : 'STAFF ADMIN'}</span>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="font-sans font-medium">
                    {isModel ? renderMessageText(msg.text, idx) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Animated Typing Indicator */}
          {isLoading && (
            <div className="self-start flex gap-2.5 max-w-[80%] animate-slide-up">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 text-white shadow-xs bg-gradient-to-br", getAgentTheme(activeAgent).gradient)}>
                {getAgentTheme(activeAgent).avatar}
              </div>
              <div className="bg-white border border-hairline rounded-2xl p-3.5 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce shrink-0" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce shrink-0" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce shrink-0" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={feedEndRef} />
        </div>

        {/* Dynamic Diagnostics Panels */}
        <div className="px-4 py-2 border-t border-hairline bg-canvas-cream/50 flex flex-wrap gap-2 justify-center">
          {activeAgent === 'debugging' && (
            <button
              onClick={triggerRosterDiagnostic}
              disabled={isLoading}
              className="btn-secondary-pill flex items-center gap-1 py-1 px-3 border border-primary/20 text-[10px] font-extrabold uppercase tracking-widest text-primary bg-white hover:bg-canvas-lavender cursor-pointer disabled:opacity-50"
            >
              <Activity size={12} /> Roster Diagnostic
            </button>
          )}
          {activeAgent === 'deployment' && (
            <button
              onClick={triggerCapacitorCheck}
              disabled={isLoading}
              className="btn-secondary-pill flex items-center gap-1 py-1 px-3 border border-primary/20 text-[10px] font-extrabold uppercase tracking-widest text-primary bg-white hover:bg-canvas-lavender cursor-pointer disabled:opacity-50"
            >
              <Terminal size={12} /> Capacitor Sync Check
            </button>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-hairline bg-white flex gap-2">
          <input
            type="text"
            placeholder={`Ask ${activeAgent.charAt(0).toUpperCase() + activeAgent.slice(1)} Agent...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs bg-canvas-lavender/20 border border-hairline rounded-xl focus:outline-none focus:border-primary focus:bg-white text-ink placeholder:text-ink-mute/60 font-sans font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-press transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
