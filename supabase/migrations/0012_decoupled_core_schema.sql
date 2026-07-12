-- supabase/migrations/0012_decoupled_core_schema.sql
-- Decoupled Global System Architecture Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Application Enumerations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('CLIENT', 'STAFF', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'class_category') THEN
        CREATE TYPE class_category AS ENUM ('POLE_FITNESS', 'AERIAL_ARTS', 'PILATES_REFORMER', 'FLEXIBILITY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_state') THEN
        CREATE TYPE booking_state AS ENUM ('BOOKED', 'WAITLISTED', 'ATTENDED', 'NO_SHOW', 'CANCELLED_TIMELY', 'CANCELLED_LATE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_gateway_status') THEN
        CREATE TYPE payment_gateway_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
    END IF;
END $$;

-- 1. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    member_id VARCHAR(20) UNIQUE NOT NULL, -- Format: EPF-YYYYX
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role user_role DEFAULT 'CLIENT'::user_role NOT NULL,
    waiver_signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Family Members Table (For multi-booking capabilities)
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Instructors Profile Registry
CREATE TABLE IF NOT EXISTS public.instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- 4. Classes Definition Template Table
CREATE TABLE IF NOT EXISTS public.class_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category class_category NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60
);

-- 5. Active Live Schedules
CREATE TABLE IF NOT EXISTS public.class_schedules (
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
CREATE TABLE IF NOT EXISTS public.rig_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'A1', 'A2', 'A3', 'A4', 'A5'
    is_operational BOOLEAN DEFAULT true NOT NULL
);

-- 7. Appended Credit Ledger (Transaction Log)
CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INT NOT NULL, -- positive for purchase/refund, negative for booking debit
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Core Bookings and Reservations Engine Table
CREATE TABLE IF NOT EXISTS public.bookings (
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

-- Index for preventing rig point double bookings per class session
CREATE UNIQUE INDEX IF NOT EXISTS idx_prevent_rig_point_double_booking
ON public.bookings (class_schedule_id, rig_point_id)
WHERE (status IN ('BOOKED', 'ATTENDED') AND rig_point_id IS NOT NULL);


-- Rule A: Instructor Double-Booking Prevention Trigger Function
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

-- Recreate trigger block
DROP TRIGGER IF EXISTS trg_block_instructor_double_booking ON public.class_schedules;
CREATE TRIGGER trg_block_instructor_double_booking
BEFORE INSERT OR UPDATE ON public.class_schedules
FOR EACH ROW EXECUTE FUNCTION verify_instructor_availability();


-- Rule B: Concurrency & Race Condition Resolution (Atomic Booking Stored Procedure RPC)
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
    -- 1. Lock rows sequentially to block race conditions across matching request blocks
    SELECT start_time INTO v_class_time FROM public.class_schedules WHERE id = p_schedule_id FOR UPDATE;
    
    -- 2. Enforce the Tuesday Lockout Rule relative to Manila
    IF EXTRACT(ISODOW FROM v_class_time AT TIME ZONE 'Asia/Manila') = 2 THEN
        RAISE EXCEPTION 'Operation Blocked: Evolve Studio is closed on Tuesdays.';
    END IF;

    -- 3. Enforce the Digital Waiver requirement
    SELECT waiver_signed_at INTO v_waiver_signed FROM public.profiles WHERE id = p_user_id;
    IF v_waiver_signed IS NULL THEN
        RAISE EXCEPTION 'Policy Blocked: Client has not finalized the dynamic studio liability waiver.';
    END IF;

    -- 4. Calculate client credit balance securely from append-only records
    SELECT COALESCE(SUM(amount), 0) INTO v_current_balance FROM public.credit_ledger WHERE user_id = p_user_id FOR UPDATE;
    IF v_current_balance < 1 THEN
        RAISE EXCEPTION 'Transaction Blocked: Client has zero remaining class package credits.';
    END IF;

    -- 5. Calculate occupancy counts safely
    SELECT COUNT(*) INTO v_active_bookings_count FROM public.bookings WHERE class_schedule_id = p_schedule_id AND status = 'BOOKED';
    SELECT COUNT(*) INTO v_current_waitlist_count FROM public.bookings WHERE class_schedule_id = p_schedule_id AND status = 'WAITLISTED';

    -- Case A: Room is available in the regular roster
    IF v_active_bookings_count < 5 THEN
        INSERT INTO public.bookings (user_id, class_schedule_id, rig_point_id, family_member_id, status)
        VALUES (p_user_id, p_schedule_id, p_rig_point_id, p_family_member_id, 'BOOKED')
        RETURNING id INTO v_new_booking_id;

        INSERT INTO public.credit_ledger (user_id, amount, description)
        VALUES (p_user_id, -1, concat('Debited credit for confirmed class booking: ', v_new_booking_id));

        v_response := jsonb_build_object('success', true, 'booking_id', v_new_booking_id, 'allocation', 'ROSTER');
        RETURN v_response;

    -- Case B: Roster full, move entry to the prioritized FIFO waitlist queue
    ELSIF v_current_waitlist_count < 2 THEN
        INSERT INTO public.bookings (user_id, class_schedule_id, rig_point_id, family_member_id, status, waitlist_position)
        VALUES (p_user_id, p_schedule_id, NULL, p_family_member_id, 'WAITLISTED', v_current_waitlist_count + 1)
        RETURNING id INTO v_new_booking_id;

        -- We charge/hold the credit immediately for waitlists to guarantee intention
        INSERT INTO public.credit_ledger (user_id, amount, description)
        VALUES (p_user_id, -1, concat('Escrow credit held for waitlist position #', v_current_waitlist_count + 1));

        v_response := jsonb_build_object('success', true, 'booking_id', v_new_booking_id, 'allocation', 'WAITLIST');
        RETURN v_response;

    -- Case C: Both structures are full
    ELSE
        RAISE EXCEPTION 'Capacity Exceeded: This session and its waitlist queue are completely packed.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
