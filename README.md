# Evolve by Cams — Studio Operations & Booking Console

Welcome to the comprehensive, master developer guide and system overview for the **Evolve by Cams** Pilates & Wellness Studio platform. This document outlines the decoupled architecture, concrete database schemas, native database constraints, test credentials, and the integration status of each subsystem.

---

## 📊 1. Current Integration Status & Honesty Checklist

To ensure absolute transparency across stakeholders and development cycles, the table below highlights exactly which components are live, partially integrated, or currently simulated as client-side prototypes.

| System / Feature | Integration Level | Technical Implementation Detail |
| :--- | :--- | :--- |
| **Authentication (Client)** | **Figma UI & Bypass** | Premium state-driven Login/Signup portal matching Figma designs. To bypass Supabase SMTP and registration rate limits, test student credentials (`teststudent@evolve.studio` / `password123`) log in via a local simulated session. |
| **Authentication (Admin)** | **Simulated Access** | Live admin login UI exists at `/admin` supporting default admin `admin@crtl.com` with `admin123`. Server-side `src/middleware.ts` guards Vercel/Next.js routes. |
| **System Security** | **Active Guard** | Suppressed F12, Right-Click, and standard DevTools key combinations, with background interval console clearance to prevent code leaks. |
| **Booking Approvals** | **Fully Integrated** | Card/cash bookings default to a new `'pending'` state. Staff can approve pending bookings and settle balances from the Admin Portal (`/portal`) or directly via Roster check-ins (`/roster`). |
| **Terminal Fallback** | **Robust Offline Mode** | The public Booking Terminal (`/book/[classId]`) attempts connection to Supabase Auth & Database triggers. If the remote database is offline/unmigrated, it gracefully falls back to localStorage/local seeds, keeping the terminal 100% testable. |
| **Tuesday Lockout** | **Fully Enforced (JS & DB)** | Prevented on the Next.js calendar (`BookingCalendarPage`) using JS timezone helpers (`Asia/Manila` checks) and protected at the database layer via triggers. |
| **Payments (PayMongo)** | **Simulated / Client-Side Mock** | Top-ups and checkouts simulate success instantly. Deno edge functions for PayMongo checkout sessions exist under `/supabase/functions` but are not yet deployed or wired. |
| **Stripe Terminal** | **Not Started** | Connection code for BBPOS WisePOS E readers to the POS front-desk terminal has not yet been started. |

---

## 🔑 2. Testing Credentials

For local testing, verification, and staging demonstrations:

### Student Portal & Booking Terminal
Use these to log in through the student login portal (`/login`):
* **Email:** `teststudent@evolve.studio`
* **Password:** `password123`

### Administrative Web Portal
Use these to access the manager dashboard (`/admin`):
* **Email:** `admin@crtl.com`
* **Password:** `admin123`

---

## 🏗️ 3. Decoupled Global System Architecture

To prevent static export conflicts and support dynamic routing, the system separates administrative workflows from client mobile apps while mapping to a unified Supabase hub.

```mermaid
graph TD
    %% Frontends
    subgraph Client Tier [Frontend Client Interfaces]
        admin_web[Admin Web Console<br/>Next.js 15 SSR / Vercel]
        mobile_app[Client Mobile App<br/>React Native + Expo]
    end

    %% API Gateway / Backend Platform
    subgraph Backend Platform [Managed Backend Hub]
        sb_auth[Supabase Auth<br/>OAuth / JWT Token Router]
        sb_storage[Supabase Storage<br/>SVGs / Logos / User Uploads]
        
        subgraph PostgreSQL Engine [PostgreSQL Database Engine]
            rls[Row-Level Security Policies]
            rpc[Stored Procedures / RPC Locks]
            triggers[Automation Triggers]
            tables[(Relational Core Tables)]
        end
    end

    %% External Systems
    subgraph External Infrastructure [Third-Party Services]
        paymongo[PayMongo Edge Functions<br/>GCash / Maya / Cards]
        resend[Resend API<br/>Transactional Email]
        cron[Supabase Cron / pg_cron<br/>No-Show Auto Checks]
    end

    %% Connections
    admin_web -->|Secure Dynamic HTTPS / WSS| PostgreSQL Engine
    admin_web -->|Session Cookies| sb_auth
    mobile_app -->|JWT Bearer Tokens| PostgreSQL Engine
    mobile_app -->|Secure Storage SDK| sb_auth

    PostgreSQL Engine --> rls --> rpc --> triggers --> tables
    tables -->|Webhooks| paymongo
    tables -->|Webhooks| resend
    cron -->|Executes Stored Procedures| rpc
```

---

## 🗄️ 4. Concrete Production Database Schema

The core relational structure is defined in SQL below to prevent overbookings and track package balances:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Application Enumerations
CREATE TYPE user_role AS ENUM ('CLIENT', 'STAFF', 'ADMIN');
CREATE TYPE class_category AS ENUM ('POLE_FITNESS', 'AERIAL_ARTS', 'PILATES_REFORMER', 'FLEXIBILITY');
CREATE TYPE booking_state AS ENUM ('BOOKED', 'WAITLISTED', 'ATTENDED', 'NO_SHOW', 'CANCELLED_TIMELY', 'CANCELLED_LATE');
CREATE TYPE payment_gateway_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    member_id VARCHAR(20) UNIQUE NOT NULL, -- Format: EPF-YYYYX
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role user_role DEFAULT 'CLIENT'::user_role NOT NULL,
    waiver_signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Family Members Table (For multi-booking capabilities)
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Instructors Profile Registry
CREATE TABLE public.instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- 4. Classes Definition Template Table
CREATE TABLE public.class_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category class_category NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60
);

-- 5. Active Live Schedules
CREATE TABLE public.class_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_definition_id UUID REFERENCES public.class_definitions(id) ON DELETE RESTRICT NOT NULL,
    instructor_id UUID REFERENCES public.instructors(id) ON DELETE RESTRICT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_capacity INT NOT NULL DEFAULT 5,
    waitlist_capacity INT NOT NULL DEFAULT 2,
    cancel_boundary_hours INT NOT NULL DEFAULT 12,
    CONSTRAINT chk_time_sequence CHECK (end_time > start_time)
);

-- 6. Physical Rig Points / Apparatus Mapping
CREATE TABLE public.rig_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'A1', 'A2', 'A3', 'A4', 'A5'
    is_operational BOOLEAN DEFAULT true NOT NULL
);

-- 7. Appended Credit Ledger (Transaction Log)
CREATE TABLE public.credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INT NOT NULL, -- positive for purchase/refund, negative for booking debit
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Core Bookings and Reservations Engine Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    class_schedule_id UUID REFERENCES public.class_schedules(id) ON DELETE RESTRICT NOT NULL,
    rig_point_id UUID REFERENCES public.rig_points(id) ON DELETE RESTRICT,
    family_member_id UUID REFERENCES public.family_members(id) ON DELETE RESTRICT,
    status booking_state DEFAULT 'BOOKED'::booking_state NOT NULL,
    waitlist_position INT DEFAULT NULL,
    qr_code_token UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Business constraint protections
    CONSTRAINT chk_waitlist_pos CHECK (waitlist_position IN (1, 2)),
    CONSTRAINT unique_user_class_booking UNIQUE (user_id, class_schedule_id)
);
```

---

## 🔒 5. Server-Side Safety Triggers & Strict Business Rules

To run a secure, robust studio ecosystem, operational boundaries are written natively inside PostgreSQL:

### Rule A: Instructor Double-Booking Prevention Trigger
```sql
CREATE OR REPLACE FUNCTION verify_instructor_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.class_schedules
        WHERE instructor_id = NEW.instructor_id
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
    ) THEN
        RAISE EXCEPTION 'Scheduling Collision: Instructor is already assigned to an overlapping class session.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_instructor_double_booking
BEFORE INSERT OR UPDATE ON public.class_schedules
FOR EACH ROW EXECUTE FUNCTION verify_instructor_availability();
```

### Rule B: Dynamic Physical Rig Point Allocation Constraint
```sql
CREATE UNIQUE INDEX idx_prevent_rig_point_double_booking
ON public.bookings (class_schedule_id, rig_point_id)
WHERE (status IN ('BOOKED', 'ATTENDED') AND rig_point_id IS NOT NULL);
```

### Rule C: Manila Timezone & Waiver Gated Atomic Booking RPC
```sql
CREATE OR REPLACE FUNCTION execute_atomic_studio_booking(
    p_user_id UUID,
    p_schedule_id UUID,
    p_rig_point_id UUID,
    p_family_member_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_class_time TIMESTAMP WITH TIME ZONE;
    v_waiver_signed TIMESTAMP WITH TIME ZONE;
    v_current_balance INT;
    v_active_bookings_count INT;
    v_current_waitlist_count INT;
    v_new_booking_id UUID;
    v_response JSONB;
BEGIN
    -- 1. Lock rows sequentially to block race conditions
    SELECT start_time INTO v_class_time FROM public.class_schedules WHERE id = p_schedule_id FOR UPDATE;
    
    -- 2. Enforce Tuesday Lockout Rule relative to Manila Timezone
    IF EXTRACT(ISODOW FROM v_class_time AT TIME ZONE 'Asia/Manila') = 2 THEN
        RAISE EXCEPTION 'Operation Blocked: Evolve Studio is closed on Tuesdays.';
    END IF;

    -- 3. Enforce Waiver Requirement
    SELECT waiver_signed_at INTO v_waiver_signed FROM public.profiles WHERE id = p_user_id;
    IF v_waiver_signed IS NULL THEN
        RAISE EXCEPTION 'Policy Blocked: Client has not finalized the dynamic studio liability waiver.';
    END IF;

    -- 4. Calculate credit balance
    SELECT COALESCE(SUM(amount), 0) INTO v_current_balance FROM public.credit_ledger WHERE user_id = p_user_id FOR UPDATE;
    IF v_current_balance < 1 THEN
        RAISE EXCEPTION 'Transaction Blocked: Client has zero remaining class package credits.';
    END IF;

    -- 5. Calculate occupancy counts safely
    SELECT COUNT(*) INTO v_active_bookings_count FROM public.bookings WHERE class_schedule_id = p_schedule_id AND status = 'BOOKED';
    SELECT COUNT(*) INTO v_current_waitlist_count FROM public.bookings WHERE class_schedule_id = p_schedule_id AND status = 'WAITLISTED';

    -- Roster spots available
    IF v_active_bookings_count < 5 THEN
        INSERT INTO public.bookings (user_id, class_schedule_id, rig_point_id, family_member_id, status)
        VALUES (p_user_id, p_schedule_id, p_rig_point_id, p_family_member_id, 'BOOKED')
        RETURNING id INTO v_new_booking_id;

        INSERT INTO public.credit_ledger (user_id, amount, description)
        VALUES (p_user_id, -1, concat('Debited credit for confirmed class booking: ', v_new_booking_id));

        v_response := jsonb_build_object('success', true, 'booking_id', v_new_booking_id, 'allocation', 'ROSTER');
        RETURN v_response;

    -- Waitlist spots available
    ELSIF v_current_waitlist_count < 2 THEN
        INSERT INTO public.bookings (user_id, class_schedule_id, rig_point_id, family_member_id, status, waitlist_position)
        VALUES (p_user_id, p_schedule_id, NULL, p_family_member_id, 'WAITLISTED', v_current_waitlist_count + 1)
        RETURNING id INTO v_new_booking_id;

        INSERT INTO public.credit_ledger (user_id, amount, description)
        VALUES (p_user_id, -1, concat('Escrow credit held for waitlist position #', v_current_waitlist_count + 1));

        v_response := jsonb_build_object('success', true, 'booking_id', v_new_booking_id, 'allocation', 'WAITLIST');
        RETURN v_response;

    -- Roster and waitlist full
    ELSE
        RAISE EXCEPTION 'Capacity Exceeded: This session and its waitlist queue are completely packed.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚀 6. Setup & Local Execution

### 1. Restore Dependencies
```powershell
# Web Application
npm install

# Python Orchestrator
pip install -r requirements.txt
```

### 2. Set Local Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Development Server
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.
