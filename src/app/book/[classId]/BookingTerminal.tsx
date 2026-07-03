'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  User,
  CreditCard,
  DollarSign,
  Sparkles,
  Star,
  Music,
  Instagram,
  UserCheck,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

export default function BookingTerminalPage() {
  const { classId } = useParams();
  const router = useRouter();
  const {
    getClassById, getBookingForSpot, customers,
    bookSpot, joinWaitlist, waitlist, promoteFromWaitlist,
    checkInBooking, cancelBooking,
    lockSpot, unlockSpot, spotLocks,
  } = useBooking();

  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('evolve_session_id') || '';
  }, []);

  const cls = useMemo(() => getClassById(classId as string), [getClassById, classId]);
  const classWaitlist = useMemo(() => waitlist.filter(w => w.classId === cls?.id), [waitlist, cls?.id]);

  // POS Form State
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);

  // Spot action popover state
  const [activePopoverSpot, setActivePopoverSpot]   = useState<number | null>(null);
  const [popoverMsg,         setPopoverMsg]         = useState<string>('');
  const [confirmCancelId,    setConfirmCancelId]    = useState<string | null>(null);
  const [cancelResult,       setCancelResult]       = useState<string>('');

  const handleCheckIn = useCallback((bookingId: string) => {
    const res = checkInBooking(bookingId);
    setPopoverMsg(res.message);
    if (res.success) setActivePopoverSpot(null);
    setTimeout(() => setPopoverMsg(''), 3000);
  }, [checkInBooking]);

  const handleCancelConfirmed = useCallback((bookingId: string) => {
    const res = cancelBooking(bookingId);
    setCancelResult(res.message);
    setConfirmCancelId(null);
    setActivePopoverSpot(null);
    setTimeout(() => setCancelResult(''), 4000);
  }, [cancelBooking]);

  // ── Auto-release active lock on page unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (selectedSpot) {
        unlockSpot(classId as string, selectedSpot);
      }
    };
  }, [selectedSpot, classId, unlockSpot]);

  // ── 5-Minute Spot Hold Countdown ──────────────────────────────────────
  const [spotHeldSince, setSpotHeldSince] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  // Reset timer when spot is selected or cleared
  useEffect(() => {
    if (selectedSpot) {
      setSpotHeldSince(Date.now());
      setSecondsRemaining(300);
    } else {
      setSpotHeldSince(null);
      setSecondsRemaining(300);
    }
  }, [selectedSpot]);

  // Tick the countdown every second
  useEffect(() => {
    if (!spotHeldSince || !selectedSpot) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - spotHeldSince) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        // Auto-release the spot
        unlockSpot(classId as string, selectedSpot);
        setSelectedSpot(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [spotHeldSince, selectedSpot, classId, unlockSpot]);

  function formatCountdown(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ── Front-Desk Kiosk Auto-Clear Inactivity Timer (45 Seconds) ───────────
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (selectedSpot) {
          unlockSpot(classId as string, selectedSpot);
        }
        setSelectedSpot(null);
        clearCustomerSelection();
        setSearchQuery('');
        setWlName('');
        setWlEmail('');
        setWlPhone('');
        setErrorMessage('');
        setPromoCode('');
        setPromoApplied(false);
      }, 45000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [selectedSpot, classId, unlockSpot]);

  const instructorReviews = useMemo(() => {
    const defaultReviews = [
      { author: "Maria S.", rating: 5, text: "The reformer flows are challenging but so satisfying." },
      { author: "Josh K.", rating: 5, text: "High energy, great music vibes throughout." }
    ];
    if (!cls) return defaultReviews;
    if (cls.instructor.id === 'cams') {
      return [
        { author: "Maria S.", rating: 5, text: "Cams has the absolute best playlist selection! The reformer flows are challenging but so satisfying." },
        { author: "Emma D.", rating: 5, text: "Front desk was super helpful matching me with Cams. Will be booking every week!" },
        { author: "Liam N.", rating: 5, text: "Incredible guidance on posture and core strength. 10/10!" }
      ];
    }
    if (cls.instructor.id === 'sarah') {
      return [
        { author: "Aria G.", rating: 5, text: "The aerial transitions are seamless. Best flow in the city!" },
        { author: "Nate W.", rating: 5, text: "Love the sundown sessions! High energy but very restorative." },
        { author: "Chloe M.", rating: 5, text: "Playlist was amazing, felt like dancing on the mat!" }
      ];
    }
    if (cls.instructor.id === 'alex') {
      return [
        { author: "Sophia V.", rating: 5, text: "As a dancer, I appreciate Alex's precision and attention to posture." },
        { author: "Marcus P.", rating: 5, text: "Incredible class foundations! The burn is real." },
        { author: "Tina L.", rating: 5, text: "Clear instructions and super motivating. Loved it!" }
      ];
    }
    return defaultReviews;
  }, [cls]);

  // POS Form State
  
  // Customer lookup/registration state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [terminalStateMsg, setTerminalStateMsg] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('Cams Rivera');

  // Waitlist form state (if class is full)
  const [wlName, setWlName] = useState('');
  const [wlEmail, setWlEmail] = useState('');
  const [wlPhone, setWlPhone] = useState('');
  const [wlMsg, setWlMsg] = useState('');

  // Filter customers for dropdown
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const selectExistingCustomer = (id: string) => {
    const c = customers.find(x => x.id === id);
    if (c) {
      setSelectedCustomerId(c.id);
      setCustName(c.name);
      setCustEmail(c.email);
      setCustPhone(c.phone || '');
      setSearchQuery('');
      // Default payment method
      if (c.credits > 0) {
        setPaymentMethod('credit');
      } else {
        setPaymentMethod('cash');
      }
    }
  };

  const clearCustomerSelection = () => {
    setSelectedCustomerId(null);
    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setPaymentMethod('cash');
  };

  // Pricing calculations
  const priceStats = useMemo(() => {
    if (!cls) return { base: 0, discount: 0, tax: 0, total: 0 };
    const base = cls.price;
    const discount = promoApplied ? base * 0.1 : 0;
    const subtotal = base - discount;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { base, discount, tax, total };
  }, [cls, promoApplied]);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'EVOLVE10') {
      setPromoApplied(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid promo code.');
      setPromoApplied(false);
    }
  };

  const handleProcessBooking = async () => {
    if (!selectedSpot) return;
    if (!custName.trim() || !custEmail.trim()) {
      setErrorMessage('Customer Name and Email are required.');
      return;
    }

    if (paymentMethod === 'card') {
      setIsProcessingCard(true);
      setErrorMessage('');
      try {
        const { StripeTerminalMock } = await import('@/lib/stripeTerminal');
        const terminal = new StripeTerminalMock((state) => {
          switch (state) {
            case 'CONNECTING':
              setTerminalStateMsg('Connecting to Bluetooth Reader...');
              break;
            case 'CONNECTED':
              setTerminalStateMsg('Card Reader Connected.');
              break;
            case 'AWAITING_TAP':
              setTerminalStateMsg('Tap, Insert, or Swipe Card...');
              break;
            case 'PROCESSING':
              setTerminalStateMsg('Authorizing Transaction...');
              break;
            case 'SUCCESS':
              setTerminalStateMsg('Authorized.');
              break;
            case 'FAILED':
              setTerminalStateMsg('Payment Failed.');
              break;
            default:
              setTerminalStateMsg('');
          }
        });

        const payResult = await terminal.processPayment(priceStats.total);
        setIsProcessingCard(false);
        setTerminalStateMsg('');

        if (!payResult.success) {
          setErrorMessage(payResult.message);
          return;
        }
      } catch (err: any) {
        setIsProcessingCard(false);
        setTerminalStateMsg('');
        setErrorMessage(err.message || 'Payment reader failed.');
        return;
      }
    }

    const res = bookSpot(
      classId as string,
      selectedSpot,
      paymentMethod,
      custName,
      custEmail,
      custPhone,
      promoApplied ? 'EVOLVE10' : undefined,
      selectedStaff
    );

    if (res.success && res.booking) {
      router.push(`/book/${classId}/success/receipt?bookingId=${res.booking.id}`);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlName.trim() || !wlEmail.trim()) {
      setErrorMessage('Waitlist Name and Email are required.');
      return;
    }
    joinWaitlist(classId as string, wlName, wlEmail, wlPhone);
    setWlMsg(`✓ Customer ${wlName} has been registered to the waitlist.`);
    setWlName('');
    setWlEmail('');
    setWlPhone('');
  };

  if (!cls) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-400 font-bold">Class session not found.</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return to dashboard</Link>
      </div>
    );
  }

  const isClassFull = cls.bookedSpots.length >= cls.totalSpots;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to POS Dashboard
      </Link>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold">Front Desk Intake</span>
          <h1 className="text-3xl font-heading font-black tracking-wide uppercase">Class Roster & Booking Console</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Class: <span className="font-bold text-foreground">{cls.title}</span> · Date: {formatDate(cls.date)} · Time: {cls.time} · Coach: {cls.instructor.name}
          </p>
        </div>
        <div>
          {isClassFull ? (
            <Badge variant="destructive" className="uppercase font-black text-xs tracking-wider px-3 py-1">Class Fully Booked</Badge>
          ) : (
            <Badge className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 uppercase font-black text-xs tracking-wider px-3 py-1">
              {cls.totalSpots - cls.bookedSpots.length} spots remaining
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Coach Spotlight & Reviews */}
        <div className="lg:col-span-3 space-y-6">
          {/* Class Spotlight Card */}
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-primary/5 border-b border-border p-4.5">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary font-mono block">Class Spotlight</span>
              <h3 className="font-heading font-black text-base text-foreground uppercase tracking-wide mt-0.5">{cls.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Level: <span className="font-bold text-foreground">{cls.level}</span> · Duration: {cls.duration} mins</p>
            </div>
            <div className="p-4.5 space-y-3.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">{cls.description}</p>
              <div className="flex flex-wrap gap-1">
                {cls.tags?.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-[9px] font-mono border-primary/20 text-primary bg-primary/5">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Coach Spotlight Card */}
          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            {/* Gradient Header Band */}
            <div className="relative h-20 overflow-hidden flex items-center justify-center"
              style={{
                background: cls.instructor.id === 'cams'
                  ? 'linear-gradient(135deg, #7C3AED, #F59E0B)'
                  : cls.instructor.id === 'sarah'
                  ? 'linear-gradient(135deg, #10B981, #3B82F6)'
                  : 'linear-gradient(135deg, #EF4444, #EC4899)',
              }}
            >
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
              <span className="text-4xl z-10 filter drop-shadow-md select-none">{cls.instructor.avatar}</span>
              <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-sm text-white text-[10px] font-bold font-mono">
                <Star size={9} className="fill-amber-400 text-amber-400" />
                {cls.instructor.rating.toFixed(2)}
              </div>
            </div>

            <div className="p-4.5 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <h4 className="font-heading font-black text-sm text-foreground uppercase tracking-wide">{cls.instructor.name}</h4>
                  <p className="text-[10px] text-primary font-bold">{cls.instructor.specialty}</p>
                </div>
                <a
                  href={`https://instagram.com/${cls.instructor.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-primary hover:bg-primary hover:text-on-primary transition-all shrink-0"
                  title="View Instagram"
                >
                  <Instagram size={11} />
                </a>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{cls.instructor.bio}</p>

              {/* Playlist Vibe */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#edf7e7]/30 border border-[#edf7e7]/60">
                <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Music size={11} className="text-emerald-500 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] text-muted-foreground uppercase font-extrabold tracking-wider">Vibe: {cls.instructor.musicStyle}</p>
                  <p className="text-[10px] font-bold text-ink truncate">{cls.instructor.playlist}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Reviews Scroller */}
          <div className="bg-white border border-border rounded-3xl p-4.5 space-y-3 shadow-sm">
            <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Client Feedback</h4>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {instructorReviews.map((rev, idx) => (
                <div key={idx} className="bg-secondary/20 border border-border/40 p-3 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-foreground">{rev.author}</span>
                    <div className="flex gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={8} className="fill-amber-400 text-amber-400 border-none" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic leading-normal font-medium">&ldquo;{rev.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Studio Floor Map & Waitlist Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-border rounded-3xl p-5 relative shadow-sm">
            <h2 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-5 text-center">Studio Layout Map</h2>
            
            {/* Studio Front/Instructor Area */}
            <div className="w-full flex justify-center mb-6">
              <Badge variant="outline" className="px-5 py-1.5 uppercase tracking-widest bg-background/50 border-primary/45 text-primary text-[10px] font-bold font-mono">
                Coach Station ({cls.instructor.name})
              </Badge>
            </div>

            {/* Spot Grid */}
            <div className="grid grid-cols-3 gap-3.5 max-w-sm mx-auto">
              {Array.from({ length: cls.totalSpots }).map((_, i) => {
                const spotNumber = i + 1;
                const b          = getBookingForSpot(cls.id, spotNumber);
                const isBooked   = !!b;
                const isSelected = selectedSpot === spotNumber;
                const isPopped   = activePopoverSpot === spotNumber;
                const isLockedByOther = spotLocks.some(
                  l => l.classId === cls.id && 
                       l.spotNumber === spotNumber && 
                       l.lockedBy !== sessionId &&
                       (new Date().getTime() - new Date(l.lockedAt).getTime()) < 30000
                );

                return (
                  <button
                    key={spotNumber}
                    disabled={(!isBooked && isClassFull) || isLockedByOther}
                    onClick={() => {
                      if (isBooked) {
                        // Toggle the check-in/cancel popover
                        setActivePopoverSpot(isPopped ? null : spotNumber);
                        setErrorMessage('');
                      } else {
                        if (selectedSpot === spotNumber) {
                          unlockSpot(classId as string, spotNumber);
                          setSelectedSpot(null);
                          setErrorMessage('');
                        } else {
                          const lockRes = lockSpot(classId as string, spotNumber);
                          if (lockRes.success) {
                            if (selectedSpot) {
                              unlockSpot(classId as string, selectedSpot);
                            }
                            setSelectedSpot(spotNumber);
                            setActivePopoverSpot(null);
                            setErrorMessage('');
                          } else {
                            setErrorMessage(lockRes.message);
                          }
                        }
                      }
                    }}
                    className={cn(
                      'relative h-32 rounded-2xl border-2 transition-all p-3 cursor-pointer select-none overflow-hidden',
                      isBooked && !isPopped && 'bg-secondary/20 border-border/30 opacity-80 hover:opacity-100 hover:border-primary/40',
                      isBooked && isPopped  && 'bg-primary/5 border-primary shadow-[0_0_20px_rgba(74,21,75,0.2)]',
                      isSelected && 'bg-primary/5 border-primary shadow-[0_0_20px_rgba(74,21,75,0.25)] scale-102',
                      !isBooked && !isSelected && 'bg-white border-hairline hover:border-primary/50 hover:bg-canvas-lavender/25',
                      !isBooked && isClassFull && 'opacity-40 cursor-not-allowed',
                      isLockedByOther && 'bg-amber-500/5 border-amber-500/40 opacity-80 cursor-not-allowed'
                    )}
                  >
                    {/* Visual Spot Layout */}
                    <div className="absolute inset-x-3.5 inset-y-2.5 border border-neutral-300 rounded-md flex flex-col justify-between p-1 bg-neutral-50/50">
                      {/* Top: Headrest & Shoulder Blocks */}
                      <div className="flex justify-between items-start w-full px-1">
                        <div className="w-2.5 h-3 bg-neutral-400 rounded-xs" title="Shoulder block L" />
                        <div className="w-3.5 h-1.5 bg-neutral-500 rounded-b-xs" title="Headrest" />
                        <div className="w-2.5 h-3 bg-neutral-400 rounded-xs" title="Shoulder block R" />
                      </div>

                      {/* Middle: Carriage */}
                      <div className={cn(
                        'w-full h-11 border rounded-sm flex items-center justify-center transition-all shadow-xs shrink-0 my-1',
                        isBooked  ? 'bg-neutral-300 border-neutral-400' :
                        isSelected ? 'bg-primary text-on-primary border-primary animate-pulse' :
                        'bg-white border-neutral-300 hover:bg-canvas-lavender/40 text-neutral-800'
                      )}>
                        <span className="font-mono text-xs font-black">#{spotNumber}</span>
                      </div>

                      {/* Bottom: Springs & Footbar */}
                      <div className="flex flex-col items-center w-full gap-[3px]">
                        <div className="flex gap-[3px] justify-center w-full">
                          <div className="w-[1.5px] h-3 bg-neutral-400 rounded-full" />
                          <div className="w-[1.5px] h-3 bg-primary/45 rounded-full" />
                          <div className="w-[1.5px] h-3 bg-neutral-400 rounded-full" />
                        </div>
                        <div className="w-4/5 h-[3px] bg-neutral-600 rounded-full" />
                      </div>
                    </div>

                    {/* Booked overlay — normal state */}
                    {isBooked && !isPopped && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl p-1 text-center backdrop-blur-xs">
                        <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-[8px] font-black uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded-sm">Taken</Badge>
                        <span className="text-[10px] font-extrabold text-foreground truncate max-w-full" title={b?.customerName}>
                          {b?.customerName.split(' ')[0]}
                        </span>
                      </div>
                    )}

                    {/* Reserved by other terminal overlay */}
                    {isLockedByOther && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-2xl p-1 text-center backdrop-blur-xs">
                        <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/20 text-[8px] font-black uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded-sm">Reserved</Badge>
                        <span className="text-[9px] font-extrabold text-amber-600">Other Terminal</span>
                      </div>
                    )}

                    {/* Booked overlay — popover action state */}
                    {isBooked && isPopped && b && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-white/97 rounded-2xl p-2 text-center backdrop-blur-sm z-10 gap-1.5"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="text-[9px] font-black text-primary uppercase tracking-wider">{b.customerName.split(' ')[0]}</span>
                        {/* Check-In */}
                        {b.status === 'upcoming' && (
                          <button
                            onClick={e => { e.stopPropagation(); handleCheckIn(b.id); }}
                            className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider cursor-pointer hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            <UserCheck size={9} /> Check In
                          </button>
                        )}
                        {b.status === 'attended' && (
                          <span className="text-[8px] text-emerald-600 font-black">✓ Attended</span>
                        )}
                        {/* Cancel */}
                        {b.status !== 'cancelled' && (
                          confirmCancelId === b.id ? (
                            <div className="flex flex-col gap-1 w-full">
                              <span className="text-[7px] text-red-500 font-bold">Confirm cancel?</span>
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={e => { e.stopPropagation(); handleCancelConfirmed(b.id); }}
                                  className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[7px] font-black uppercase cursor-pointer"
                                >Yes</button>
                                <button
                                  onClick={e => { e.stopPropagation(); setConfirmCancelId(null); }}
                                  className="px-2 py-0.5 rounded-full bg-secondary text-ink text-[7px] font-black uppercase cursor-pointer"
                                >No</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); setConfirmCancelId(b.id); }}
                              className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-[8px] font-black uppercase tracking-wider cursor-pointer hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X size={8} /> Cancel
                            </button>
                          )
                        )}
                        {/* Close */}
                        <button
                          onClick={e => { e.stopPropagation(); setActivePopoverSpot(null); setConfirmCancelId(null); }}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary text-ink-mute flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    )}

                    {isSelected && (
                      <>
                        <div className={cn(
                          "absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-1.5 text-center backdrop-blur-xs transition-colors z-10",
                          secondsRemaining <= 60
                            ? "bg-red-500/10 border border-red-500/30 text-red-700"
                            : "bg-amber-500/10 border border-amber-500/30 text-amber-700"
                        )}>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded-sm border-none text-white",
                            secondsRemaining <= 60 ? "bg-red-500 animate-pulse" : "bg-amber-500"
                          )}>Held</Badge>
                          <span className="text-[9px] font-extrabold text-foreground">Spot #{spotNumber} held</span>
                          <span className="text-xs font-black font-mono mt-0.5">{formatCountdown(secondsRemaining)}</span>
                        </div>
                        <CheckCircle2 className="absolute -top-1.5 -right-1.5 text-primary bg-white rounded-full w-5 h-5 shadow-sm border border-primary/10 z-20" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Waitlisted Clients waiting (only when spots are open) */}
          {!isClassFull && classWaitlist.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl space-y-4 animate-slide-up">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <h3 className="font-heading font-black text-sm uppercase text-primary tracking-wide">Waitlisted Clients Waiting</h3>
              </div>
              <p className="text-xs text-muted-foreground">There are clients waiting on the waitlist, and open spots are available. Promote the next in queue:</p>
              <div className="divide-y divide-border/40 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {classWaitlist.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 text-xs bg-white">
                    <div>
                      <p className="font-bold text-foreground">#{index + 1} &bull; {entry.customerName}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.customerEmail}</p>
                    </div>
                    {index === 0 && (
                      <button
                        onClick={() => {
                          const res = promoteFromWaitlist(cls.id, entry.customerEmail, 'cash');
                          if (res.success) {
                            setWlMsg(`✓ Successfully promoted ${entry.customerName} to the class!`);
                            setErrorMessage('');
                          } else {
                            setErrorMessage(res.message);
                            setWlMsg('');
                          }
                        }}
                        className="btn-primary-pill py-1.5 px-3.5 text-[9px] uppercase tracking-widest font-black cursor-pointer shadow-xs"
                      >
                        Promote Client
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 3: Checkout Desk & Invoice Receipt */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cancel result toast */}
          {cancelResult && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-600 font-semibold animate-slide-up">
              ✓ {cancelResult}
            </div>
          )}
          {/* Error Message Toast */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/15 border border-red-500/30 text-sm text-red-400 font-semibold animate-slide-up">
              ⚠ Error: {errorMessage}
            </div>
          )}

          {wlMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 font-semibold animate-slide-up">
              {wlMsg}
            </div>
          )}

          {isClassFull ? (
            /* Waitlist Booking Intake Form */
            <div className="bg-white border border-border p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="border-b border-border/50 pb-3">
                <h3 className="font-heading font-black text-lg uppercase tracking-wide">Register to Waitlist</h3>
                <p className="text-xs text-muted-foreground">Class is full. Register this customer to be notified of open spots.</p>
              </div>

              <form onSubmit={handleJoinWaitlist} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter client's full name"
                    value={wlName}
                    onChange={e => setWlName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Client Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={wlEmail}
                    onChange={e => setWlEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Client Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+63 9xx xxx xxxx"
                    value={wlPhone}
                    onChange={e => setWlPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <button type="submit" className="btn-primary-pill w-full text-center uppercase tracking-widest cursor-pointer">
                  Register on Waitlist
                </button>
              </form>

              {classWaitlist.length > 0 && (
                <div className="mt-5 pt-4 border-t border-border/50">
                  <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">Waitlist Priority Queue</h4>
                  <div className="space-y-2">
                    {classWaitlist.map((entry, index) => (
                      <div key={index} className="flex justify-between items-center bg-secondary/30 p-3 rounded-xl text-xs">
                        <div>
                          <p className="font-bold text-foreground">#{index + 1} &bull; {entry.customerName}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.customerEmail}</p>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {new Date(entry.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : !selectedSpot ? (
            /* Choose Spot Instruction Card */
            <div className="bg-white border border-border p-6 rounded-3xl text-center py-10 shadow-sm">
              <span className="text-3xl block mb-2">🎯</span>
              <h3 className="font-heading font-black text-lg uppercase">Select Studio Spot</h3>
              <p className="text-sm text-muted-foreground mt-1.5">Please click on an available numbered Pilates spot on the layout map to begin checkout.</p>
            </div>
          ) : (
            /* Active Intake checkout form - Styled as paper invoice ticket */
            <div className="bg-white border border-border p-5 rounded-3xl space-y-5 shadow-lg relative overflow-hidden">
              {/* Receipt top header */}
              <div className="border-b border-border/50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-black text-base uppercase">Booking Receipt</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold">Spot secured: <span className="text-primary font-bold font-mono">#{selectedSpot}</span></p>
                </div>
                <button 
                  onClick={() => {
                    if (selectedSpot) unlockSpot(classId as string, selectedSpot);
                    setSelectedSpot(null);
                  }}
                  className="text-[10px] text-muted-foreground hover:text-destructive font-bold underline cursor-pointer"
                >
                  Change Spot
                </button>
              </div>

              {/* 5-Minute Spot Hold Countdown Banner */}
              {selectedSpot && (
                <div className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-xl border text-[11px] font-bold transition-colors',
                  secondsRemaining <= 20
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : secondsRemaining <= 60
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-primary/5 border-primary/20 text-primary'
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-2 h-2 rounded-full animate-pulse',
                      secondsRemaining <= 20 ? 'bg-red-500' : secondsRemaining <= 60 ? 'bg-amber-500' : 'bg-primary'
                    )} />
                    <span>Spot #{selectedSpot} held for</span>
                  </div>
                  <span className="font-mono font-black text-sm tracking-widest">
                    {formatCountdown(secondsRemaining)}
                  </span>
                </div>
              )}

              {/* Staff Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Assisting Staff / Coach</label>
                <div className="grid grid-cols-2 gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border/40">
                  {['Cams Rivera', 'Sarah Lee', 'Alex Tran', 'Evolve Staff'].map(staff => (
                    <button
                      key={staff}
                      type="button"
                      onClick={() => setSelectedStaff(staff)}
                      className={cn(
                        "py-1.5 px-1 text-[9px] font-mono font-bold rounded-xl border text-center transition-all cursor-pointer",
                        selectedStaff === staff
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-white border-border text-muted-foreground hover:bg-secondary/40"
                      )}
                    >
                      {staff === 'Cams Rivera' ? '👑 Cams' : staff === 'Sarah Lee' ? '👟 Sarah' : staff === 'Alex Tran' ? '👟 Alex' : '🧑‍💻 Staff'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Customer Search Registry Selector */}
              <div className="space-y-2 relative">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Search Client Registry</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search existing customer by name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
                {/* Search Dropdown Matches */}
                {filteredCustomers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-border/60">
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => selectExistingCustomer(c.id)}
                        className="w-full text-left px-4 py-2 hover:bg-secondary text-xs flex justify-between items-center cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-mono font-bold text-primary border-primary/20">
                          {c.credits} cr
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Customer Details Card / Walk-in input */}
              <div className="bg-secondary/30 border border-border/40 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Billing Profile</span>
                  {selectedCustomerId && (
                    <button 
                      onClick={clearCustomerSelection}
                      className="text-[9px] text-destructive hover:underline font-bold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    required
                    value={custName}
                    disabled={!!selectedCustomerId}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <input
                    type="email"
                    placeholder="Customer Email *"
                    required
                    value={custEmail}
                    disabled={!!selectedCustomerId}
                    onChange={e => setCustEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                  <input
                    type="tel"
                    placeholder="Customer Phone (Optional)"
                    value={custPhone}
                    disabled={!!selectedCustomerId}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                {selectedCustomerId && activeCustomer && (
                  <div className="text-[10px] text-muted-foreground flex justify-between items-center pt-1 border-t border-border/45">
                    <span>Tier: <span className="font-semibold text-foreground">{activeCustomer.membershipTier}</span></span>
                    <span>Credits: <span className="font-bold text-primary font-mono">{activeCustomer.credits}</span></span>
                  </div>
                )}
              </div>

              {/* 3. Payment Method Select */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Select payment method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                      paymentMethod === 'cash'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <DollarSign size={13} /> Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                      paymentMethod === 'card'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <CreditCard size={13} /> Card
                  </button>
                  <button
                    onClick={() => {
                      if (activeCustomer && activeCustomer.credits > 0) {
                        setPaymentMethod('credit');
                      }
                    }}
                    disabled={!activeCustomer || activeCustomer.credits < 1}
                    className={cn(
                      "py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                      paymentMethod === 'credit'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50 disabled:opacity-40 disabled:bg-neutral-50 disabled:border-neutral-200 disabled:cursor-not-allowed'
                    )}
                  >
                    <Sparkles size={13} /> Credits
                  </button>
                </div>
                {/* Warning message for credit availability */}
                <div className="text-[9px] text-right font-semibold">
                  {!selectedCustomerId ? (
                    <span className="text-muted-foreground">Please select customer to check credits</span>
                  ) : activeCustomer && activeCustomer.credits < 1 ? (
                    <span className="text-destructive">⚠️ Client has no available class credits</span>
                  ) : activeCustomer ? (
                    <span className="text-emerald-500">✓ {activeCustomer.credits} class credits available</span>
                  ) : null}
                </div>
              </div>

              {/* 4. Promo Code input (disabled if credits) */}
              {paymentMethod !== 'credit' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Discount Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. EVOLVE10"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary disabled:opacity-60"
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode}
                      className="px-4 py-1.5 rounded-xl bg-secondary text-xs font-semibold hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors"
                    >
                      {promoApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}

              {/* Dashed Separator with punch notches */}
              <div className="relative flex items-center py-1 -mx-5">
                {/* Left Notch */}
                <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-background border-r border-border/80 z-10" />
                {/* Dashed Line */}
                <div className="w-full border-t-2 border-dashed border-border/75" />
                {/* Right Notch */}
                <div className="absolute -right-2.5 w-5 h-5 rounded-full bg-background border-l border-border/80 z-10" />
              </div>

              {/* 5. Cost Breakdown */}
              <div className="bg-secondary/15 rounded-2xl p-4 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Session Pass:</span>
                  <span>₱{priceStats.base.toFixed(2)}</span>
                </div>
                {paymentMethod === 'credit' ? (
                  <div className="flex justify-between text-primary font-bold border-t border-border/30 pt-2 text-sm font-sans">
                    <span>Billing Charge:</span>
                    <span>1 Class Credit</span>
                  </div>
                ) : (
                  <>
                    {priceStats.discount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-semibold">
                        <span>Discount (EVOLVE10):</span>
                        <span>-₱{priceStats.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes (8%):</span>
                      <span>₱{priceStats.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-primary border-t border-border/30 pt-2 font-sans">
                      <span>Total Amount:</span>
                      <span>₱{priceStats.total.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* 6. Checkout action */}
              <button
                disabled={isProcessingCard}
                onClick={handleProcessBooking}
                className={cn(
                  "btn-primary-pill w-full text-center uppercase tracking-widest py-3.5 shadow-md cursor-pointer transition-all hover:scale-[1.01]",
                  isProcessingCard && "opacity-75 cursor-wait"
                )}
              >
                {isProcessingCard ? terminalStateMsg : `Book Spot #${selectedSpot}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
