"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, User, Check, ChevronRight, ChevronLeft,
  MapPin, AlertCircle, QrCode, CreditCard, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn, parseClassDateTime } from "@/lib/utils"; // BUG 2 FIX: import parseClassDateTime
import ProgressBar, { ProgressBarVariant, ProgressBarTheme } from "@/components/ui/ProgressBar";

const WAITLIST_MAX = 2; // mirrors booking_policy.waitlist_max_size — kept in sync manually

/* ————————————————————————————————————————————————
   Rig diagram — signature element, unchanged from the mock
   version. Five mount points in a shallow arc.
———————————————————————————————————————————————— */
interface RigDiagramProps {
  used: number;
  capacity?: number;
  size?: "sm" | "md";
}

function RigDiagram({ used, capacity = 5, size = "md" }: RigDiagramProps) {
  const positions = useMemo(() => {
    if (capacity === 5) {
      return [
        { x: 20, y: 34 }, { x: 55, y: 14 }, { x: 90, y: 6 },
        { x: 125, y: 14 }, { x: 160, y: 34 },
      ];
    }
    // Generate an arc dynamically for other capacities
    const list = [];
    const startX = 20;
    const endX = 160;
    const stepX = capacity > 1 ? (endX - startX) / (capacity - 1) : 0;
    for (let i = 0; i < capacity; i++) {
      const x = startX + i * stepX;
      // Arc formula: y is lower at the edges, higher (smaller y value) in the middle
      const normalizedX = capacity > 1 ? (i / (capacity - 1)) * 2 - 1 : 0; // -1 to 1
      const y = 20 - 14 * (1 - normalizedX * normalizedX); // parabola shape
      list.push({ x, y });
    }
    return list;
  }, [capacity]);

  const dims = size === "sm" ? { w: 90, h: 30, r: 4.5, stroke: 1 } : { w: 180, h: 46, r: 7, stroke: 1.5 };

  return (
    <svg width={dims.w} height={dims.h} viewBox="0 0 180 46" aria-label={`${used} of ${capacity} rig points in use`}>
      <line x1="14" y1="20" x2="166" y2="20" stroke="#2A2A2A" strokeWidth={dims.stroke} />
      {positions.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={p.y + 4} stroke="#2A2A2A" strokeWidth={dims.stroke} />
          <circle
            cx={p.x} cy={p.y} r={dims.r}
            fill={i < used ? "#D1D1D6" : "none"}
            stroke={i < used ? "#D1D1D6" : "#3A3A3A"}
            strokeWidth={dims.stroke}
          />
        </g>
      ))}
    </svg>
  );
}

function StatusPill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "active" | "full" }) {
  const tones = {
    default: { color: "#8C8C8C", border: "#2A2A2A" },
    active: { color: "#D1D1D6", border: "#3A3A3C" },
    full: { color: "#D9635A", border: "#3A2422" },
  };
  const t = tones[tone];
  return (
    <span className="text-xs px-2 py-1 rounded-sm uppercase tracking-wide border"
      style={{ color: t.color, borderColor: t.border, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.06em" }}>
      {children}
    </span>
  );
}



export default function BookingFlow({ overrideClassId }: { overrideClassId?: string } = {}) {
  const params = useParams();
  const classId = overrideClassId || (params ? (params.classId as string) : undefined);
  const router = useRouter();

  const [step, setStep] = useState("Schedule");
  const [stepperStyle, setStepperStyle] = useState<ProgressBarVariant>("dots");
  const [stepperTheme, setStepperTheme] = useState<ProgressBarTheme>("sunset");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [classes, setClasses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [numParticipants, setNumParticipants] = useState(1);
  const [participantDetails, setParticipantDetails] = useState<Array<{ name: string; email: string; phone: string }>>([
    { name: "", email: "", phone: "" }
  ]);

  const handleIncreaseParticipants = () => {
    if (numParticipants >= 5) return;
    const newNum = numParticipants + 1;
    setNumParticipants(newNum);
    setParticipantDetails([...participantDetails, { name: "", email: "", phone: "" }]);
  };

  const handleDecreaseParticipants = () => {
    if (numParticipants <= 1) return;
    const newNum = numParticipants - 1;
    setNumParticipants(newNum);
    setParticipantDetails(participantDetails.slice(0, newNum));
  };

  const handleParticipantDetailChange = (index: number, field: "name" | "email" | "phone", value: string) => {
    const updated = [...participantDetails];
    updated[index][field] = value;
    setParticipantDetails(updated);
  };

  /* ---------- Load current user, profile, balance, schedule ---------- */
  const loadEverything = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let user = null;
      try {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      } catch (err) {
        console.warn("Supabase getUser failed, trying local fallback", err);
      }

      // Check mock user in localStorage
      if (!user) {
        const mockUserStr = localStorage.getItem('evolve_mock_user');
        if (mockUserStr) {
          user = JSON.parse(mockUserStr);
        }
      }

      if (!user) {
        user = {
          id: '00000000-0000-0000-0000-000000000001',
          user_metadata: { full_name: 'Guest Student' }
        };
      }

      let profileRow = null;
      let balanceRow = null;
      let classRows = [];

      try {
        const [{ data: pRow }, { data: bRow }, { data: cRows }] =
          await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("credit_balances").select("balance").eq("user_id", user.id).maybeSingle(),
            supabase
              .from("class_availability")
              .select("*")
              .gte("starts_at", new Date().toISOString())
              .eq("status", "scheduled")
              .order("starts_at", { ascending: true })
              .limit(20),
          ]);
        profileRow = pRow;
        balanceRow = bRow;
        classRows = cRows ?? [];
      } catch (dbErr) {
        console.warn("Database fetches failed, falling back to localStorage", dbErr);
      }

      // LocalStorage / mock fallback triggers
      if (!profileRow) {
        profileRow = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Test Student',
          membership_status: 'active',
          waiver_signed_at: new Date().toISOString(),
          member_id: 'EPF-01000'
        };
      }

      const finalBalance = balanceRow?.balance ?? 5; // default 5 test credits if no balance is set

      if (classRows.length === 0) {
        const savedClasses = localStorage.getItem('evolve_classes');
        const localClasses = savedClasses ? JSON.parse(savedClasses) : [];
        classRows = localClasses.map((c: any) => ({
          id: c.id,
          title: c.title,
          instructor_name: c.instructor?.name ?? c.instructor_name ?? 'Instructor',
          // BUG 2 FIX: use parseClassDateTime instead of hardcoding '08:00:00'
          starts_at: parseClassDateTime(c.date, c.time).toISOString(),
          duration_minutes: c.duration,
          capacity: c.totalSpots,
          rig_points_used: c.bookedSpots?.length ?? 0,
          class_type: c.type === 'Yoga' ? 'regular' : 'special',
          waitlist_count: 0,
          credits_cost: 1
        }));
      }

      setProfile(profileRow);
      setBalance(finalBalance);
      setClasses(classRows);
    } catch (e: any) {
      setError(e.message ?? "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEverything(); }, [loadEverything]);

  // Sync selected class from URL params once classes are loaded
  useEffect(() => {
    if (classId && classes.length > 0) {
      const match = classes.find(c => c.id === classId);
      if (match) {
        setSelected(match);
        setStep("Details");
      }
    }
  }, [classId, classes]);

  const isFull = (c: any) => c.rig_points_used >= c.capacity;
  const wouldJoinWaitlist = selected && isFull(selected);
  const hasCredits = profile && selected ? balance >= selected.credits_cost : false;
  const canConfirm =
    selected &&
    (participantDetails[0]?.name ?? "").trim() !== "" &&
    (participantDetails[0]?.email ?? "").trim() !== "" &&
    (participantDetails[0]?.phone ?? "").trim() !== "";

  const goToDetails = (cls: any) => { setSelected(cls); setActionError(null); setStep("Details"); };

  /* ---------- The actual write: calls book_class() via RPC ---------- */
  const confirmBooking = async () => {
    // BUG 3 FIX: guard against null selected before any async work
    if (!selected) {
      setActionError("No class selected. Please choose a class first.");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      let user = null;
      try {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      } catch (err) {}

      if (!user) {
        const mockUserStr = localStorage.getItem('evolve_mock_user');
        if (mockUserStr) user = JSON.parse(mockUserStr);
      }

      if (!user) throw new Error("Not authenticated.");

      try {
        const { data, error: rpcError } = await supabase.rpc("book_class", {
          p_class_id: selected.id,
          p_user_id: user.id,
          p_family_member_id: null,
        });
        if (rpcError) throw rpcError;
        setBooking(data);
        setStep("Booked");
        loadEverything();
      } catch (e: any) {
        console.warn("Supabase RPC failed, simulating local booking", e);
        
        // Simulating booking locally in localStorage
        const savedClasses = localStorage.getItem('evolve_classes');
        const localClasses = savedClasses ? JSON.parse(savedClasses) : [];
        const targetClass = localClasses.find((c: any) => c.id === selected.id);

        if (!targetClass) throw new Error("Class not found in local store.");

        const spotsRemaining = targetClass.totalSpots - targetClass.bookedSpots.length;
        if (spotsRemaining <= 0) throw new Error("Class is already full.");

        // Choose the first available spot
        let freeSpot = 1;
        for (let s = 1; s <= targetClass.totalSpots; s++) {
          if (!targetClass.bookedSpots.includes(s)) {
            freeSpot = s;
            break;
          }
        }

        // Add spot to bookedSpots
        targetClass.bookedSpots.push(freeSpot);
        localStorage.setItem('evolve_classes', JSON.stringify(localClasses));

        // Create local booking
        const newBooking = {
          id: `booking-${Date.now()}`,
          classId: selected.id,
          spotNumber: freeSpot,
          bookedAt: new Date().toISOString(),
          paymentMethod: 'cash',
          amountPaid: 0,
          status: 'pending',
          customerName: profile?.full_name || 'Test Student',
          customerEmail: user.email,
          customerPhone: profile?.phone_number || '',
          participantsCount: numParticipants,
          participants: participantDetails
        };

        const savedBookings = localStorage.getItem('evolve_bookings');
        const localBookings = savedBookings ? JSON.parse(savedBookings) : [];
        localBookings.push(newBooking);
        localStorage.setItem('evolve_bookings', JSON.stringify(localBookings));

        // Create local transaction
        const newTx = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'booking',
          timestamp: new Date().toISOString(),
          customerName: profile?.full_name || 'Test Student',
          customerEmail: user.email,
          description: `${selected.title} (${numParticipants} spot(s), Spot #${freeSpot})`,
          paymentMethod: 'cash',
          amount: (selected.price || 600) * numParticipants,
          status: 'pending',
          bookingId: newBooking.id
        };
        const savedTx = localStorage.getItem('evolve_transactions');
        const localTx = savedTx ? JSON.parse(savedTx) : [];
        localTx.unshift(newTx);
        localStorage.setItem('evolve_transactions', JSON.stringify(localTx));

        // BUG 9 FIX: always deduct exactly 1 credit per booking (not headcount)
        setBalance(prev => Math.max(0, prev - 1));

        setBooking({
          id: newBooking.id,
          status: 'booked',
          checked_in_at: null
        });
        setStep("Booked");
      }
    } catch (e: any) {
      setActionError(e.message ?? "Could not complete booking.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- Check-in is a staff action, not a self-service one.
     It should go through a server route using the service-role key
     (e.g. /api/checkin), never called directly from this client
     component with the anon key. Shown here as a stub. ---------- */
  const checkIn = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Check-in failed.");
      const updated = await res.json();
      setBooking(updated);
    } catch (e: any) {
      setActionError(e.message ?? "Check-in failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const reset = () => {
    setSelected(null);
    setBooking(null);
    setActionError(null);
    if (classId) {
      // BUG 11 FIX: /book doesn't exist as a standalone page; redirect to /events
      router.push("/events");
    } else {
      setStep("Schedule");
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Manila" });
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A", color: "#8C8C8C" }}>
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#0A0A0A", color: "#D9635A" }}>
        <AlertCircle size={20} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: "#0A0A0A", color: "#F5F5F3", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600&display=swap');
        .display { font-family: 'Big Shoulders Display', sans-serif; text-transform: uppercase; letter-spacing: 0.01em; }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10 pb-6" style={{ borderBottom: "1px solid #1E1E1E" }}>
          <div>
            <div className="display text-3xl leading-none font-bold text-white cursor-pointer" onClick={reset}>EVOLVE</div>
            <div className="text-xs mt-1" style={{ color: "#5A5A5A", letterSpacing: "0.1em" }}>POLE FITNESS &amp; AERIAL ARTS</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{profile?.full_name}</div>
            <div className="text-xs mt-1" style={{ color: "#D1D1D6" }}>{balance} credits available</div>
          </div>
        </div>

        <ProgressBar
          steps={["Schedule", "Details", "Booked"]}
          currentStep={step}
          variant={stepperStyle}
          theme={stepperTheme}
          className="mb-8"
          onStepClick={(stepName, index) => {
            if (stepName === "Schedule") {
              reset();
            } else if (stepName === "Details" && selected) {
              setStep("Details");
            }
          }}
        />

        {step === "Schedule" && (
          <div>
            <h1 className="display text-4xl mb-1 text-white font-bold">This Week</h1>
            <p className="text-sm mb-8" style={{ color: "#8C8C8C" }}>
              Every class is capped by rig points, not headcount. What you see is what's actually mountable.
            </p>
            {classes.length === 0 && <p className="text-sm" style={{ color: "#5A5A5A" }}>No upcoming classes scheduled.</p>}
            <div className="flex flex-col gap-3">
              {classes.map((c) => (
                <button key={c.id} onClick={() => goToDetails(c)} className="text-left p-5 rounded-sm w-full block cursor-pointer"
                  style={{ background: "#141414", border: "1px solid #232323" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="display text-xl text-white font-bold">{c.title}</span>
                        {c.class_type === "special" && <StatusPill tone="active">Special</StatusPill>}
                      </div>
                      <div className="flex items-center gap-4 text-xs" style={{ color: "#8C8C8C" }}>
                        <span className="flex items-center gap-1"><User size={12} />{c.instructor_name}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} />{fmtDate(c.starts_at)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{fmtTime(c.starts_at)} · {c.duration_minutes} min</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <RigDiagram used={c.rig_points_used} capacity={c.capacity} size="sm" />
                      {isFull(c) ? (
                        <StatusPill tone="full">
                          {c.waitlist_count < WAITLIST_MAX ? `Waitlist ${c.waitlist_count}/${WAITLIST_MAX}` : "Waitlist full"}
                        </StatusPill>
                      ) : (
                        <span className="text-xs" style={{ color: "#5A5A5A" }}>
                          {c.capacity - c.rig_points_used} point{c.capacity - c.rig_points_used !== 1 ? "s" : ""} open
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "Details" && selected && (
          <div className="max-w-[420px] mx-auto bg-[#121212] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-left">
            
            {/* Top Image Banner */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img 
                src={
                  selected.title.toLowerCase().includes('silks') || selected.title.toLowerCase().includes('sling') 
                    ? '/images/hero_aerial_silks.png' 
                    : selected.title.toLowerCase().includes('chair') 
                    ? '/images/class_chair.png' 
                    : '/images/hero_pole_back.png'
                } 
                alt={selected.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              
              {/* Overlay Pills */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-black/75 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-300 px-3 py-1 rounded-full backdrop-blur-xs">
                  {selected.class_type === 'special' ? 'Special Masterclass' : 'Medium Intensity'}
                </span>
                <span className="bg-black/75 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-300 px-3 py-1 rounded-full backdrop-blur-xs">
                  {selected.duration_minutes} min
                </span>
              </div>

              {/* Close Button */}
              <button 
                onClick={reset} 
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer select-none"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h1 className="font-serif text-3xl font-bold uppercase text-white leading-tight">
                  {selected.title}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium">
                  A technique-focused session that builds strength, endurance, muscle tone, flexibility, and spatial awareness under safe rigging controls.
                </p>
              </div>

              {/* Instructor Card Row */}
              <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg select-none">
                  👤
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-serif tracking-wide">{selected.instructor_name}</h4>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">Certified Pole &amp; Aerial Coach</span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3 text-xs font-semibold text-zinc-300 border-t border-b border-zinc-900 py-4">
                <div className="flex items-center gap-3">
                  <Clock size={15} className="text-zinc-400" />
                  <span>{fmtTime(selected.starts_at)} &middot; {fmtDate(selected.starts_at)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={15} className="text-zinc-400" />
                  <span>Evolve Studio Branch Area</span>
                </div>
                <div className="flex items-center gap-3">
                  <User size={15} className="text-zinc-400" />
                  <span>{selected.capacity - selected.rig_points_used} of {selected.capacity} spots left</span>
                </div>
              </div>

              {/* Number of Participants */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-zinc-400 uppercase tracking-wide">Number of Participants</span>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={handleDecreaseParticipants} 
                    className="w-8 h-8 rounded-full border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer font-bold transition-colors select-none"
                  >
                    —
                  </button>
                  <span className="font-mono font-bold text-white">{numParticipants.toString().padStart(2, '0')}</span>
                  <button 
                    type="button"
                    onClick={handleIncreaseParticipants} 
                    className="w-8 h-8 rounded-full border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer font-bold transition-colors select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Participant Inputs */}
              <div className="space-y-4 pt-4 border-t border-zinc-900">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-300 block mb-2">
                  Participant Details
                </span>
                {participantDetails.map((p, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <div key={idx} className="space-y-2 p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                      <div className="text-[9px] uppercase font-bold text-[#C9A961] tracking-wider">
                        Participant #{idx + 1} {isPrimary ? "(Primary Booker)" : ""}
                      </div>
                      <div className={cn("grid gap-2", isPrimary ? "grid-cols-3" : "grid-cols-2")}>
                        <input
                          required
                          type="text"
                          placeholder="Full Name"
                          value={p.name}
                          onChange={(e) => handleParticipantDetailChange(idx, "name", e.target.value)}
                          className="w-full bg-zinc-900/55 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                        />
                        <input
                          required={isPrimary}
                          type="email"
                          placeholder={isPrimary ? "Email Address" : "Email (Optional)"}
                          value={p.email}
                          onChange={(e) => handleParticipantDetailChange(idx, "email", e.target.value)}
                          className="w-full bg-zinc-900/55 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                        />
                        {isPrimary && (
                          <input
                            required
                            type="tel"
                            placeholder="Phone Number"
                            value={p.phone || ""}
                            onChange={(e) => handleParticipantDetailChange(idx, "phone", e.target.value)}
                            className="w-full bg-zinc-900/55 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {actionError && (
                <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-[#1A1212] border border-[#3A2222] text-[#D9635A]">
                  <AlertCircle size={14} /> {actionError}
                </div>
              )}

              {/* Actions row */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={confirmBooking} 
                    disabled={!canConfirm || actionLoading}
                    className="flex-1 py-3.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                    style={{
                       background: canConfirm ? "#D1D1D6" : "#232323",
                       color: canConfirm ? "#0A0A0A" : "#5A5A5A",
                       boxShadow: canConfirm ? "0 4px 12px rgba(209, 209, 214, 0.15)" : "none"
                    }}
                  >
                    {actionLoading && <Loader2 size={12} className="animate-spin" />}
                    {wouldJoinWaitlist ? "Join Waitlist" : "Book Now"}
                  </button>
                  <button
                    type="button"
                    onClick={confirmBooking}
                    disabled={!canConfirm || actionLoading}
                    className="w-12 h-12 rounded-full border border-zinc-800 hover:border-zinc-400 flex items-center justify-center text-zinc-400 hover:text-zinc-300 transition-all cursor-pointer select-none"
                    aria-label="Confirm booking next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                {/* BUG 14 FIX: show which fields are missing when button is disabled */}
                {!canConfirm && selected && (
                  <p className="text-[10px] text-center" style={{ color: '#5A5A5A' }}>
                    Fill in name, email, and phone number for participant #1 to continue.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

        {step === "Booked" && booking && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-full flex items-center justify-center bg-[#D1D1D6]" style={{ width: 28, height: 28 }}>
                <Check size={16} className="text-[#0A0A0A]" />
              </div>
              <h1 className="display text-4xl text-white font-bold">{booking.status === "waitlisted" ? "You're on the list" : "You're booked"}</h1>
            </div>

            <p className="text-sm mb-6" style={{ color: "#8C8C8C" }}>
              A confirmation has been sent by email. {booking.status === "booked" && "Check in below when you arrive at the studio."}
            </p>

            {actionError && (
              <div className="p-3 rounded-sm mb-4 text-sm flex items-center gap-2 bg-[#1A1212] border border-[#3A2222] text-[#D9635A]">
                <AlertCircle size={14} /> {actionError}
              </div>
            )}

            <div className="p-6 rounded-sm mb-6 text-center bg-[#141414] border border-[#232323]">
              {!booking.checked_in_at ? (
                <>
                  <QrCode size={120} className="text-[#F5F5F3] mx-auto mb-4" />
                  <div className="text-xs mb-4" style={{ color: "#5A5A5A" }}>Member ID {profile?.member_id}</div>
                  {booking.status === "booked" && (
                    <button onClick={checkIn} disabled={actionLoading}
                      className="px-6 py-2 rounded-sm text-sm uppercase tracking-wide flex items-center gap-2 mx-auto bg-[#D1D1D6] text-[#0A0A0A] font-bold cursor-pointer hover:bg-zinc-300 transition-colors"
                      style={{ letterSpacing: "0.08em" }}>
                      {actionLoading && <Loader2 size={14} className="animate-spin" />}
                      Simulate Front Desk Check-In
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="rounded-full flex items-center justify-center mx-auto mb-3 bg-[#1A2A1E] border border-[#2E4A36]" style={{ width: 56, height: 56 }}>
                    <Check size={26} className="text-[#7FBF8A]" />
                  </div>
                  <div className="display text-2xl mb-1 text-white font-bold">Checked In</div>
                </>
              )}
            </div>

            <button onClick={reset} className="text-xs text-[#8C8C8C] hover:text-white transition-colors cursor-pointer">← Back to schedule</button>
          </div>
        )}
      </div>

      {/* Floating Style Switcher for Demo Purposes */}
      <div className="fixed bottom-6 right-6 z-50 bg-[#121212]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-2xl max-w-[240px] text-xs space-y-3 font-sans animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="font-bold text-white uppercase tracking-wider text-[9px] font-mono">UX Stepper Control</span>
          <span className="text-[8px] bg-[#FF9966]/20 text-[#FF9966] px-1.5 py-0.5 rounded font-bold uppercase font-mono">Demo</span>
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 block font-semibold">Visual Style:</span>
            <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
              {(['dots', 'capsules', 'percent', 'circle'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setStepperStyle(style)}
                  className={cn(
                    "px-1.5 py-1 rounded border text-center transition-all cursor-pointer font-bold capitalize",
                    stepperStyle === style 
                      ? "bg-[#FF9966] text-black border-[#FF9966]" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 block font-semibold">Color Theme:</span>
            <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
              {(['sunset', 'teal', 'gold', 'silver'] as const).map((themeName) => (
                <button
                  key={themeName}
                  type="button"
                  onClick={() => setStepperTheme(themeName)}
                  className={cn(
                    "px-1.5 py-1 rounded border text-center transition-all cursor-pointer font-bold capitalize",
                    stepperTheme === themeName 
                      ? "bg-[#FF9966] text-black border-[#FF9966]" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {themeName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
