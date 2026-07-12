# Evolve Studio POS & Booking — Master Improvement Checklist (v2)

> Last updated: 2026-07-04
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
- [x] **Supabase SSR Helpers & API Check-in** — Configured Supabase SSR client/server utilities, middleware, and a dedicated API check-in route (`src/app/api/checkin/route.ts`).
- [x] **Supabase Auth Trigger** — Added a database trigger (`0009_auth_trigger.sql`) that automatically synchronizes and creates a user profile on signup.
- [x] **Modular Migrations** — Refactored DB migration scripts into discrete, modular files mapping profiles, classes, bookings, booking policies, credit ledgers, and helper functions.
- [x] **Premium Client Booking Flow** — Rebuilt `BookingTerminal.tsx` with dynamic step indicators ("Schedule", "Details", "Confirm", "Booked"), real-time rig point mapping, and database transaction booking validations.
- [x] **Aesthetics & Theme Config** — Integrated custom black/white/gray theme config toggle alongside original Sunset gradient, updated class catalog, and optimized membership page layout.
- [x] **Premium Navbar Retheme** — Upgraded the global header navigation with animated active-page underlines, dark dropdown menus, and gold mobile notifications dot.
- [x] **About Us & Home Pages** — Designed responsive homepage hero carousel, a dedicated class list catalog module, and an About Us page featuring 5 high-fidelity Evolve studio photos.
- [x] **Subdomain Admin Routing & Navbar Decoupling** — Separated Wallet, Profile, and Dashboard from client layouts to admin portal scopes.
- [x] **POS Override Form Integration** — Rethemed and integrated POSOverrideBridge with live class dropdown selections.
- [x] **Public Pricing Desk** — Converted /memberships to a clean public layout.
- [x] **Cybersecurity Defenses** — Blocked F12, Inspect element, source code shortcuts, right clicks, and added automated console clearing alongside protected middleware routes.
- [x] **Dark Mode Autofill Repair** — Repaired input placeholder and text color override leaks under Chrome autocomplete.
- [x] **Auth Credentials Update** — Changed default console email to admin@crtl.com and password to admin123.
- [x] **Master Implementation Plan** — Created detailed blueprints and implementation guidelines.

## 🔴 Remaining Tasks (Production Launch)

- [ ] **Deploy Edge Functions** — Deploy `notify-instructor`, `create-checkout`, and `paymongo-webhook` to production Supabase Cloud.
- [ ] **Stripe Terminal integration** — Connect BBPOS WisePOS E readers to the POS terminal dashboard.

## ✅ Completed (Evolve Studio v2 Upgrade)

- [x] **Auth Signups Integration** — Replaced mock auth states with live Supabase Magic Link and SMS OTP redirects.

