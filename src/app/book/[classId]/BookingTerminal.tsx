"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar, Clock, User, Check, ChevronRight, ChevronLeft,
  MapPin, AlertCircle, QrCode, CreditCard, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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
            fill={i < used ? "#C9A961" : "none"}
            stroke={i < used ? "#C9A961" : "#3A3A3A"}
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
    active: { color: "#C9A961", border: "#4A3F28" },
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

function StepNav({ step }: { step: string }) {
  const steps = ["Schedule", "Details", "Confirm", "Booked"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className="text-xs uppercase" style={{
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.08em",
            color: i <= idx ? "#F5F5F3" : "#5A5A5A",
            borderBottom: i === idx ? "1px solid #C9A961" : "1px solid transparent", paddingBottom: "4px",
          }}>{s}</span>
          {i < steps.length - 1 && <ChevronRight size={12} className="text-[#3A3A3A]" />}
        </div>
      ))}
    </div>
  );
}

export default function BookingFlow() {
  const { classId } = useParams();
  const router = useRouter();

  const [step, setStep] = useState("Schedule");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [classes, setClasses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null); // result row from book_class()

  /* ---------- Load current user, profile, balance, schedule ---------- */
  const loadEverything = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not signed in.");

      const [{ data: profileRow, error: profileError }, { data: balanceRow }, { data: classRows, error: classError }] =
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

      if (profileError) throw profileError;
      if (classError) throw classError;

      setProfile(profileRow);
      setBalance(balanceRow?.balance ?? 0);
      setClasses(classRows ?? []);
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
    profile?.membership_status === "active" &&
    !!profile?.waiver_signed_at &&
    (hasCredits || wouldJoinWaitlist);

  const goToDetails = (cls: any) => { setSelected(cls); setActionError(null); setStep("Details"); };

  /* ---------- The actual write: calls book_class() via RPC ---------- */
  const confirmBooking = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");

      const { data, error: rpcError } = await supabase.rpc("book_class", {
        p_class_id: selected.id,
        p_user_id: user.id,
        p_family_member_id: null,
      });
      if (rpcError) throw rpcError; // surfaces the Postgres raise exception message directly
      setBooking(data);
      setStep("Booked");
      // Refresh balance + class availability in the background so
      // the schedule list reflects the new rig point state.
      loadEverything();
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
      router.push("/book");
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
            <div className="text-xs mt-1" style={{ color: "#C9A961" }}>{balance} credits available</div>
          </div>
        </div>

        <StepNav step={step} />

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
          <div>
            <button onClick={reset} className="flex items-center gap-1 text-xs mb-6 hover:text-white transition-colors" style={{ color: "#8C8C8C" }}>
              <ChevronLeft size={14} /> Back to schedule
            </button>

            <h1 className="display text-4xl mb-1 text-white font-bold">{selected.title}</h1>
            <div className="flex items-center gap-4 text-sm mb-6" style={{ color: "#8C8C8C" }}>
              <span className="flex items-center gap-1"><User size={13} />{selected.instructor_name}</span>
              <span className="flex items-center gap-1"><Calendar size={13} />{fmtDate(selected.starts_at)}</span>
              <span className="flex items-center gap-1"><Clock size={13} />{fmtTime(selected.starts_at)} · {selected.duration_minutes} min</span>
              <span className="flex items-center gap-1"><MapPin size={13} />Studio A</span>
            </div>

            <div className="p-5 rounded-sm mb-4 bg-[#141414] border border-[#232323]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase" style={{ color: "#5A5A5A", letterSpacing: "0.08em" }}>Rig Points</span>
                <span className="text-xs" style={{ color: "#8C8C8C" }}>{selected.rig_points_used} of {selected.capacity} in use</span>
              </div>
              <div className="py-2 flex justify-center">
                <RigDiagram used={selected.rig_points_used} capacity={selected.capacity} />
              </div>
              {selected.class_type === "special" && (
                <p className="text-xs mt-3" style={{ color: "#8C8C8C" }}>
                  Special class — needs at least {selected.min_to_run} bookings to run.
                </p>
              )}
            </div>

            <div className="p-5 rounded-sm mb-4 bg-[#141414] border border-[#232323]">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={15} color="#C9A961" />
                <span className="text-xs uppercase" style={{ color: "#5A5A5A", letterSpacing: "0.08em" }}>Membership Check</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: "#8C8C8C" }}>Membership status</span>
                <StatusPill tone={profile?.membership_status === "active" ? "active" : "full"}>{profile?.membership_status}</StatusPill>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: "#8C8C8C" }}>Class cost</span>
                <span>{selected.credits_cost} credit{selected.credits_cost !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#8C8C8C" }}>Your balance</span>
                <span style={{ color: hasCredits ? "#F5F5F3" : "#D9635A" }}>{balance} credits</span>
              </div>
              {!profile?.waiver_signed_at && (
                <p className="text-xs mt-3 flex items-center gap-1" style={{ color: "#D9635A" }}>
                  <AlertCircle size={12} /> Waiver not on file — required before booking.
                </p>
              )}
              {!hasCredits && !wouldJoinWaitlist && profile?.waiver_signed_at && (
                <p className="text-xs mt-3 flex items-center gap-1" style={{ color: "#D9635A" }}>
                  <AlertCircle size={12} /> Not enough credits. Purchase a package to book this class.
                </p>
              )}
            </div>

            {isFull(selected) && (
              <div className="p-4 rounded-sm mb-4 flex items-start gap-2 bg-[#1A1512] border border-[#3A2E1A]">
                <AlertCircle size={15} color="#C9A961" style={{ marginTop: "2px", flexShrink: 0 }} />
                <p className="text-sm" style={{ color: "#C9A961" }}>
                  All {selected.capacity} rig points are booked. Confirming will place you on the waitlist
                  ({selected.waitlist_count}/{WAITLIST_MAX}).
                </p>
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-sm mb-4 text-sm flex items-center gap-2 bg-[#1A1212] border border-[#3A2222] text-[#D9635A]">
                <AlertCircle size={14} /> {actionError}
              </div>
            )}

            <button onClick={confirmBooking} disabled={!canConfirm || actionLoading}
              className="w-full py-3 rounded-sm text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors"
              style={{
                background: canConfirm ? "#C9A961" : "#232323",
                color: canConfirm ? "#0A0A0A" : "#5A5A5A",
                fontWeight: 600, letterSpacing: "0.08em",
                cursor: canConfirm && !actionLoading ? "pointer" : "not-allowed",
              }}>
              {actionLoading && <Loader2 size={14} className="animate-spin" />}
              {wouldJoinWaitlist ? "Join Waitlist" : "Confirm & Book"}
            </button>
          </div>
        )}

        {step === "Booked" && booking && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-full flex items-center justify-center bg-[#C9A961]" style={{ width: 28, height: 28 }}>
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
                      className="px-6 py-2 rounded-sm text-sm uppercase tracking-wide flex items-center gap-2 mx-auto bg-[#C9A961] text-[#0A0A0A] font-bold cursor-pointer hover:bg-[#b09352] transition-colors"
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
    </div>
  );
}
