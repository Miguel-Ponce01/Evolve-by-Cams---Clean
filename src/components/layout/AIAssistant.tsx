'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Bot, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const PRESETS = [
  { q: "What are your opening hours?", a: "Evolve Studio is open Monday to Friday from 9:00 AM to 9:00 PM (except Tuesdays, when we are closed), and Saturdays from 9:00 AM to 5:00 PM. We are closed on Sundays." },
  { q: "Where is the studio located?", a: "Our Davao Studio is located at 3F Sunscor Bldg., corner Arroyo St., along R Castillo highway, Davao City, 8000." },
  { q: "Can I book for multiple participants?", a: "Yes, you can! During the second step (DETAILS) of the booking process, you can select the number of participants (up to 5) and enter their full names and emails." },
  { q: "How do I check in for my class?", a: "When you book a class, you will receive a QR code via email or dashboard. Bring this QR code to the studio, and the receptionist or coach will scan it to verify your attendance!" },
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your Evolve Studio assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      let userProfile = { full_name: "Guest Student", available_credits: 0 };
      const mockUserStr = typeof window !== 'undefined' ? localStorage.getItem('evolve_mock_user') : null;
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        userProfile = {
          full_name: mockUser.user_metadata?.full_name || mockUser.email || "Guest Student",
          available_credits: 5
        };
      }

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userProfile }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          setMessages(prev => [...prev, {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: data.answer,
            timestamp: new Date()
          }]);
          return;
        }
      }
      
      // Fallback local query parser
      let botReply = "You can ask about our studio hours, location, booking for multiple participants, or class check-ins!";
      const query = text.toLowerCase();
      if (query.includes('hour') || query.includes('time') || query.includes('open') || query.includes('schedule')) {
        botReply = "Our studio is open Monday to Friday 9:00 AM - 9:00 PM (except Tuesdays, when we are closed), and Saturdays 9:00 AM - 5:00 PM. We are closed on Sundays.";
      } else if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('branch')) {
        botReply = "Our Davao Studio is located at 3F Sunscor Bldg., corner Arroyo St., along R Castillo highway, Davao City, 8000.";
      } else if (query.includes('participant') || query.includes('multiple') || query.includes('friend') || query.includes('book for')) {
        botReply = "Yes, you can book for multiple participants! In the class details page, adjust the participant count up to 5 and enter their names & email addresses to book them all under one transaction.";
      } else if (query.includes('checkin') || query.includes('check in') || query.includes('qr') || query.includes('scan')) {
        botReply = "Simply present the QR code from your booking confirmation email or profile page. The staff at the front desk will scan it to check you in automatically.";
      } else if (query.includes('price') || query.includes('cost') || query.includes('fee')) {
        botReply = "Group classes cost ₱1,000 per session, and private 1-on-1 classes are ₱1,800 per session.";
      }
      
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#C9A961] hover:bg-[#b09352] text-black flex items-center justify-center shadow-lg hover:shadow-[#C9A961]/25 transition-colors duration-300 active:scale-95 cursor-pointer relative group"
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center text-[8px] font-bold text-white">1</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[520px] bg-zinc-950/95 border border-zinc-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#121212] border-b border-zinc-900 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/20 flex items-center justify-center text-[#C9A961]">
                <Sparkles size={16} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif">Evolve AI Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">Agent Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#C9A961] transition-all cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2 max-w-[85%]",
                  msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0",
                    msg.sender === 'user' ? "bg-zinc-800 text-zinc-300" : "bg-[#C9A961]/10 border border-[#C9A961]/20 text-[#C9A961]"
                  )}
                >
                  {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div
                  className={cn(
                    "p-3 rounded-2xl text-xs leading-relaxed text-left",
                    msg.sender === 'user'
                      ? "bg-[#C9A961] text-[#0A0A0A] rounded-br-none font-medium"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-none font-medium"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 mr-auto max-w-[80%]">
                <div className="w-6 h-6 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/20 flex items-center justify-center text-[#C9A961]">
                  <Bot size={12} />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#C9A961] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#C9A961] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#C9A961] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preset Questions Drawer */}
          <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 space-y-1">
            <span className="text-[8px] uppercase tracking-widest font-black text-zinc-500 flex items-center gap-1">
              <HelpCircle size={10} /> Frequently Asked Questions
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset.q)}
                  className="shrink-0 bg-zinc-900 border border-zinc-800 hover:border-[#C9A961]/40 px-3 py-1.5 rounded-lg text-[9px] font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  {preset.q}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Footer */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            className="p-3 bg-[#121212] border-t border-zinc-900 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about Evolve..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A961]"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-[#C9A961] hover:bg-[#b09352] text-black flex items-center justify-center shrink-0 cursor-pointer transition-all active:scale-95"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
