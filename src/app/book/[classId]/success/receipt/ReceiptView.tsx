'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Mail, MessageSquare, Calendar, ChevronRight, Copy, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

function BookingSuccessReceiptPageContent() {
  const { classId } = useParams();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const router = useRouter();
  const { getClassById, bookings } = useBooking();

  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');

  const booking = useMemo(() => {
    return bookings.find(b => b.id === bookingId);
  }, [bookings, bookingId]);

  const cls = useMemo(() => {
    return booking ? getClassById(booking.classId) : null;
  }, [booking, getClassById]);

  const defaultEmail = useMemo(() => {
    if (!booking || !cls) return '';
    return `Hi ${booking.customerName.split(' ')[0]},\n\nWe are thrilled to confirm your reformer spot has been secured by our front desk. Here are your booking details:\n\n- Class: ${cls.title}\n- Spot: #${booking.spotNumber}\n- Instructor: ${cls.instructor.name}\n- Date: ${formatDate(cls.date)}\n- Time: ${cls.time}\n\n⚠️ Mandatory Studio Guidelines:\n- Grip Socks Mandatory: For hygiene and safety, grip socks must be worn during reformer classes.\n- Available at Front Desk: If you don't have grip socks, you can purchase a pair for ₱15 before class.\n- Arrival: Please arrive 10 minutes early.`;
  }, [booking, cls]);

  const defaultSms = useMemo(() => {
    if (!booking || !cls) return '';
    return `Hi ${booking.customerName.split(' ')[0]}! Spot #${booking.spotNumber} in ${cls.title} with ${cls.instructor.name} on ${formatDate(cls.date)} @ ${cls.time} is locked! ⚠️ Remember, grip socks are mandatory! If you don't have them, they are available at the front desk. See you soon!`;
  }, [booking, cls]);

  const [emailBody, setEmailBody] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [hasInitializedText, setHasInitializedText] = useState(false);

  const [selectedTone, setSelectedTone] = useState<'high-vibe' | 'mindful' | 'professional'>('high-vibe');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize state once booking/cls load
  useEffect(() => {
    if (booking && cls && !hasInitializedText) {
      setEmailBody(defaultEmail);
      setSmsBody(defaultSms);
      setHasInitializedText(true);
    }
  }, [booking, cls, defaultEmail, defaultSms, hasInitializedText]);

  // ── Auto-redirect back to POS Console after 45 seconds of inactivity ────
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        router.push('/');
      }, 45000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [router]);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  const handleGenerateAIContent = async () => {
    if (!booking || !cls) return;
    setIsGenerating(true);
    setSendSuccess(false);

    if (!apiKey) {
      alert('NEXT_PUBLIC_GEMINI_API_KEY is not defined in your environmental variables.');
      setIsGenerating(false);
      return;
    }

    try {
      const prompt = `Write a personalized ${activeTab === 'email' ? 'email' : 'SMS'} notification for a client booking a Pilates class.

Booking Details:
- Client Name: ${booking.customerName}
- Class Title: ${cls.title}
- Instructor Name: ${cls.instructor.name}
- Spot Number: #${booking.spotNumber}
- Class Date: ${formatDate(cls.date)}
- Class Time: ${cls.time}

Guidelines to include:
- Grip socks are mandatory for safety and hygiene.
- Grip socks are available for purchase at the front desk for ₱15.
- Arrive 10 minutes early.

Tone preset: ${selectedTone}
- high-vibe: energetic, encouraging, enthusiastic, lots of positive vibes.
- mindful: calm, centering, gentle, focusing on alignment and breath.
- professional: structured, polite, clear, informative.

Write only the final message body text. Keep it concise. For SMS, keep it under 120 words. Do NOT include markdown tags, wrappers, or email headers/subjects in the output.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          { parts: [{ text: prompt }] }
        ]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      const resData = await response.json();
      const candidates = resData.candidates || [];
      if (candidates.length > 0) {
        const text = candidates[0].content?.parts[0]?.text || '';
        if (text) {
          if (activeTab === 'email') {
            setEmailBody(text.trim());
          } else {
            setSmsBody(text.trim());
          }
        }
      }
    } catch (e: any) {
      alert(`Error generating notification: ${e.message || e}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNotification = () => {
    const text = activeTab === 'email' ? emailBody : smsBody;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSendSuccess(true);
    }, 1200);
  };

  const selectTab = (tab: 'email' | 'sms') => {
    setActiveTab(tab);
    setSendSuccess(false);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!booking || !cls) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-400 font-bold">Booking receipt not found.</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Schedule
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="btn-outline-aubergine rounded-pill font-bold uppercase tracking-wider text-xs border-border hover:bg-secondary flex items-center gap-1.5 py-2 px-4 cursor-pointer"
          >
            <Printer size={14} /> Print Receipt
          </button>
          <Link 
            href={`/book/${classId}`}
            className="btn-primary-pill inline-flex items-center justify-center rounded-pill bg-primary text-on-primary text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-primary-press transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            Register Next Client
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: POS Printed Receipt */}
        <div className="lg:col-span-6 bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
          {/* Tear-off decorative borders */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary/20 print:hidden" />
          
          <div className="text-center border-b border-dashed border-border/60 pb-5 mb-5">
            <h2 className="text-2xl font-black font-heading tracking-widest uppercase text-primary print:text-black">EVOLVE</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mt-1">Pilates & Wellness Studio</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Front Desk Booking Terminal</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Metadata */}
            <div className="flex justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/40">
              <span>Receipt ID: {booking.id}</span>
              <span>{formatDate(booking.bookedAt.split('T')[0])}</span>
            </div>

            {/* Client info */}
            <div>
              <p className="font-bold text-[10px] uppercase text-primary tracking-wider mb-1 print:text-black">Customer Details</p>
              <div className="bg-secondary/35 p-3 rounded-xl print:bg-gray-100">
                <p className="font-bold text-foreground text-sm print:text-black">{booking.customerName}</p>
                <p className="text-muted-foreground">{booking.customerEmail}</p>
                {booking.customerPhone && <p className="text-muted-foreground">{booking.customerPhone}</p>}
              </div>
            </div>

            {/* Class info */}
            <div>
              <p className="font-bold text-[10px] uppercase text-primary tracking-wider mb-1 print:text-black">Session Booked</p>
              <div className="bg-secondary/35 p-3 rounded-xl space-y-1 print:bg-gray-100">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-foreground text-sm print:text-black">{cls.title}</p>
                  <Badge className="font-mono bg-primary/20 text-primary border-none text-[10px] px-2 py-0.5 print:bg-gray-200 print:text-black">
                    Spot #{booking.spotNumber}
                  </Badge>
                </div>
                <p className="text-muted-foreground">Instructor: {cls.instructor.name}</p>
                <p className="text-muted-foreground">Time: {cls.time} ({cls.duration} mins)</p>
                <p className="text-muted-foreground">Date: {formatDate(cls.date)}</p>
              </div>
            </div>

            {/* Payment info */}
            <div>
              <p className="font-bold text-[10px] uppercase text-primary tracking-wider mb-1 print:text-black">Payment Details</p>
              <div className="space-y-2 py-1 px-1">
                <div className="flex justify-between">
                  <span>Booking Payment:</span>
                  <span className="capitalize">{booking.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₱{cls.price.toFixed(2)}</span>
                </div>
                {booking.paymentMethod === 'credit' ? (
                  <div className="flex justify-between font-bold text-primary border-t border-border/40 pt-2 text-sm print:text-black">
                    <span>Amount Charged:</span>
                    <span>1 class credit</span>
                  </div>
                ) : (
                  <>
                    {booking.amountPaid < (cls.price + Math.round(cls.price * 0.08 * 100) / 100) && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount Code (EVOLVE10):</span>
                        <span>-10%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>GST Tax (8%):</span>
                      <span>{(booking.amountPaid - (booking.amountPaid / 1.08)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-primary border-t border-border/40 pt-2 text-sm print:text-black">
                      <span>Total Paid:</span>
                      <span>₱{booking.amountPaid.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="pt-6 border-t border-dashed border-border/60 text-center">
              <div className="inline-block bg-white px-6 py-2 rounded">
                <div className="flex items-center justify-center gap-[2px] h-9 w-40 bg-transparent">
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[3px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                  <div className="bg-black w-[4px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[3px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[4px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                  <div className="bg-black w-[1px] h-full" />
                  <div className="bg-black w-[3px] h-full" />
                  <div className="bg-black w-[2px] h-full" />
                </div>
                <span className="text-[9px] font-mono text-gray-500 block mt-1 tracking-widest">{booking.id.toUpperCase()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wider font-mono">Thank you for evolving with us</p>
            </div>
          </div>
        </div>

        {/* Right Side: Simulated Client Device Notifications */}
        <div className="lg:col-span-6 space-y-5 no-print">
          {/* AI Custom notification assistant */}
          <div className="bg-canvas-lavender/35 border border-primary/10 p-5 rounded-3xl space-y-4 shadow-sm animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">AI Notification Writer</span>
              </div>
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider font-mono">Gemini 2.5 Flash</span>
            </div>

            <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl border border-hairline">
              {(['high-vibe', 'mindful', 'professional'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`flex-1 py-1.5 px-2 text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                    selectedTone === tone 
                      ? 'bg-primary text-on-primary shadow-xs' 
                      : 'text-ink-mute hover:text-ink hover:bg-canvas-lavender/30'
                  }`}
                >
                  {tone === 'high-vibe' ? '🔥 Energetic' : tone === 'mindful' ? '🌸 Mindful' : '💼 Pro'}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerateAIContent}
                disabled={isGenerating}
                className="flex-1 btn-primary-pill py-3 text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-50 text-center bg-primary hover:bg-primary-press text-white"
              >
                {isGenerating ? 'Drafting Message...' : `✨ Generate ${activeTab === 'email' ? 'Email' : 'SMS'} Draft`}
              </button>
            </div>

            <textarea
              value={activeTab === 'email' ? emailBody : smsBody}
              onChange={(e) => {
                if (activeTab === 'email') setEmailBody(e.target.value);
                else setSmsBody(e.target.value);
              }}
              rows={6}
              className="w-full p-4 text-xs bg-white border border-hairline rounded-2xl focus:outline-none focus:border-primary text-ink font-sans leading-relaxed shadow-inner"
              placeholder="Edit notification copy..."
            />

            <div className="flex gap-2 justify-between items-center pt-2 border-t border-border/30">
              <button
                onClick={handleCopyNotification}
                className="text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy size={12} /> {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleSimulateSend}
                disabled={isSending || sendSuccess}
                className={`py-2 px-4 rounded-pill text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all ${
                  sendSuccess 
                    ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/20' 
                    : 'bg-primary text-white hover:bg-primary-press'
                }`}
              >
                {isSending ? 'Sending...' : sendSuccess ? '✓ Dispatched!' : 'Simulate Send'}
              </button>
            </div>

            {sendSuccess && (
              <p className="text-[10px] text-emerald-600 font-bold text-center animate-slide-up mt-1">
                ✓ Notification simulated and logged to client.
              </p>
            )}
          </div>

          {/* Toggle Tab */}
          <div className="flex border border-border/80 rounded-2xl p-1 bg-card/20 max-w-xs">
            <button
              onClick={() => selectTab('email')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'email' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail size={13} /> Email Notification
            </button>
            <button
              onClick={() => selectTab('sms')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'sms' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare size={13} /> SMS Alert
            </button>
          </div>

          {activeTab === 'email' ? (
            /* Email Frame Mock */
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg animate-slide-up">
              {/* Email Browser Header */}
              <div className="bg-secondary/50 px-4 py-3 border-b border-border text-xs space-y-1 font-mono">
                <p><span className="text-muted-foreground">From:</span> Evolve Pilates Studio &lt;<span className="text-primary">noreply@evolve.studio</span>&gt;</p>
                <p><span className="text-muted-foreground">To:</span> {booking.customerName} &lt;<span className="text-primary">{booking.customerEmail}</span>&gt;</p>
                <p><span className="text-muted-foreground">Subject:</span> Booking Confirmed: Spot #{booking.spotNumber} in {cls.title}!</p>
              </div>

              {/* Email Body HTML Mock */}
              <div className="p-6 bg-card text-foreground space-y-4 text-xs font-sans max-h-96 overflow-y-auto">
                <div className="text-center py-2 border-b border-border/40 pb-4 mb-4">
                  <span className="text-3xl">🎉</span>
                  <h3 className="font-heading font-black text-lg uppercase text-primary mt-2">Booking Confirmed!</h3>
                  <p className="text-xs text-muted-foreground">Evolve by Cams Reformer Studio</p>
                </div>

                <div className="whitespace-pre-line text-xs font-sans text-ink leading-relaxed font-medium">
                  {emailBody}
                </div>

                <p className="text-xs text-muted-foreground text-center border-t border-border pt-4">
                  Evolve by Cams Pilates Studio · 123 Fitness Ave, Davao City
                </p>
              </div>
            </div>
          ) : (
            /* SMS Message Thread Mock */
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl overflow-hidden shadow-lg max-w-sm mx-auto animate-slide-up">
              {/* Phone Header */}
              <div className="bg-[#2C2C2E]/60 px-4 py-3 flex items-center justify-between border-b border-[#3A3A3C] text-xs font-semibold text-white">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]">EC</div>
                <span>Evolve Cams</span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>

              {/* Message Feed */}
              <div className="p-4 bg-[#1C1C1E] h-80 flex flex-col justify-end space-y-3 font-sans">
                {/* Incoming Mock message */}
                <div className="self-start bg-[#2C2C2E] text-white p-3.5 rounded-2xl text-xs max-w-[85%] leading-normal">
                  <p className="font-mono text-[8px] text-gray-400 mb-1">Evolve by Cams - Just Now</p>
                  <p className="whitespace-pre-line font-medium">{smsBody}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessReceiptPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <BookingSuccessReceiptPageContent />
    </Suspense>
  );
}
