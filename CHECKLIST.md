# Evolve Studio POS & Booking — Master Improvement Checklist (v2)

> Last updated: 2026-06-30
> Tracking Evolve Studio Next.js 15, Tailwind, Supabase, and PayMongo dark-mode transition.

---

## ✅ Completed (Evolve Studio v2 Upgrade)

- [x] **Business Hours & Timezone Rules** — Timezone utils (`src/lib/business-hours.ts`) enforcing Asia/Manila (UTC+8) timezone as single source of truth.
- [x] **Tuesday Lockout** — Hardcoded date validation preventing Monday-Tuesday overnight session overlaps or Tuesday class scheduling/booking.
- [x] **Supabase Database Schema (`0001_init.sql`)** — Relational schema mapping: `membership_tiers`, `profiles`, `customers`, `instructors`, `classes`, `bookings`, `transactions`.
- [x] **RLS & Access Control** — Role-Based Access Control (RBAC) rules isolating Super Admin, Front Desk Staff, Coaches, and Clients at the Database layer.
- [x] **Instructor Double-Booking trigger** — Postgres constraint logic blocking overlapping classes for a single coach.
- [x] **Concurrent Capacity trigger** — Postgres row-level locking (`FOR UPDATE`) safeguarding against booking oversells.
- [x] **Notification Trigger Schema (`0002_notifications.sql`)** — Automated `AFTER INSERT ON bookings` trigger for confirmed client spots.
- [x] **Instructor Notification Edge Function (`notify-instructor`)** — Asynchronous edge function dispatching Resend HTML emails and optional Facebook Messenger alerts with robust failure isolation.
- [x] **PayMongo Checkout Edge Function (`create-checkout`)** — Initiates GCash, Maya, Card, or QR Ph checkout sessions in local PHP currency.
- [x] **PayMongo Webhook Handler (`paymongo-webhook`)** — Atomic database credit adjustments and ledger transaction logging verified with HMAC SHA-256 signature verification.
- [x] **Sunset Gradient Dark Theme** — Replaced light-mode styles with Charcoal `#121212` backgrounds, coral `#FF5E62` and gold `#FF9966` accents in `src/app/globals.css`.
- [x] **Public Booking Page (`src/app/book/page.tsx`)** — Session calendar displaying filterable classes, skipping Tuesday lockouts.
- [x] **Client Dashboard (`src/app/dashboard/page.tsx`)** — View personal booking history, wallet credits balance, and simulated PayMongo top-ups.
- [x] **Admin Portal (`src/app/portal/page.tsx`)** — Command center containing staff credit overrides form, realtime terminal list, and live activity log ticker.
- [x] **Codebase Cleanup** — Excluded Supabase functions from TS config and deleted duplicate navigation components.

---

## 🔴 Remaining Tasks (Production Launch)

- [ ] **Auth Signups Integration** — Replace mock auth states with live Supabase Magic Link and SMS OTP redirects.
- [ ] **Deploy Edge Functions** — Deploy `notify-instructor`, `create-checkout`, and `paymongo-webhook` to production Supabase Cloud.
- [ ] **Stripe Terminal integration** — Connect BBPOS WisePOS E readers to the POS terminal dashboard.
