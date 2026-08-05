-- supabase/migrations/0015_rezerv_parity.sql
-- Rezerv-style Features Schema Parity Migration

-- 1. Create service_format enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_format') THEN
        CREATE TYPE service_format AS ENUM ('CLASS', 'COURSE', 'APPOINTMENT', 'EVENT');
    END IF;
END $$;

-- 2. Extend class_definitions with service format and buffer parameters
ALTER TABLE public.class_definitions 
ADD COLUMN IF NOT EXISTS format service_format DEFAULT 'CLASS'::service_format NOT NULL,
ADD COLUMN IF NOT EXISTS setup_buffer_minutes INT DEFAULT 15,
ADD COLUMN IF NOT EXISTS cleanup_buffer_minutes INT DEFAULT 15;

-- 3. Course Package Table for Bundled Sessions
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_cents INT NOT NULL DEFAULT 0,
    total_sessions INT NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Facilities & Rooms Layout Tables
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.spot_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE NOT NULL,
    spot_label VARCHAR(10) NOT NULL, -- e.g. 'Mat 1', 'Reformer 3'
    grid_row INT NOT NULL,
    grid_col INT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    UNIQUE (facility_id, grid_row, grid_col)
);

-- 5. Extend class_schedules for Course and Facility Mapping
ALTER TABLE public.class_schedules
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES public.facilities(id) ON DELETE RESTRICT;

-- 6. Extend credit_ledger to support dynamic currency debiting
ALTER TABLE public.credit_ledger
ADD COLUMN IF NOT EXISTS currency_amount_cents INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_type VARCHAR(20) DEFAULT 'CREDIT' CHECK (balance_type IN ('CREDIT', 'CURRENCY'));

-- 7. Staff Shifts Table for Operational Shifts
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT chk_shift_sequence CHECK (end_time > start_time)
);

-- 8. Extend family_members for Sub-Accounts
ALTER TABLE public.family_members
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS is_sub_account_active BOOLEAN DEFAULT true;

-- 9. Extend Bookings table with spot layouts, payment methods & states
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS spot_layout_id UUID REFERENCES public.spot_layouts(id) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'CREDIT' CHECK (payment_method IN ('CREDIT', 'CASH_IN_STORE', 'STRIPE', 'PAYMONGO_GCASH')),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING_STORE_COLLECTION', 'EXEMPT'));

-- 10. Trigger: Instructor shift allocation and buffer collision verification
CREATE OR REPLACE FUNCTION verify_instructor_shift_and_buffers()
RETURNS TRIGGER AS $$
DECLARE
    v_has_shift BOOLEAN;
    v_collision_id UUID;
    v_setup_buffer INTERVAL;
    v_cleanup_buffer INTERVAL;
BEGIN
    -- Get buffer thresholds from current class definitions
    SELECT (setup_buffer_minutes || ' minutes')::INTERVAL, 
           (cleanup_buffer_minutes || ' minutes')::INTERVAL
    INTO v_setup_buffer, v_cleanup_buffer
    FROM public.class_definitions
    WHERE id = NEW.class_definition_id;

    -- A. Verify class starts and ends within a scheduled shift
    SELECT EXISTS (
        SELECT 1 FROM public.staff_shifts
        WHERE instructor_id = NEW.instructor_id
          AND start_time <= NEW.start_time
          AND end_time >= NEW.end_time
    ) INTO v_has_shift;

    IF NOT v_has_shift THEN
        RAISE EXCEPTION 'Scheduling Conflict: Instructor is not scheduled for a staff shift during this period.';
    END IF;

    -- B. Verify instructor is free from overlaps including buffers
    SELECT cs.id INTO v_collision_id
    FROM public.class_schedules cs
    JOIN public.class_definitions cd ON cd.id = cs.class_definition_id
    WHERE cs.instructor_id = NEW.instructor_id
      AND cs.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (NEW.start_time - v_setup_buffer, NEW.end_time + v_cleanup_buffer) 
          OVERLAPS 
          (cs.start_time - (cd.setup_buffer_minutes || ' minutes')::INTERVAL, 
           cs.end_time + (cd.cleanup_buffer_minutes || ' minutes')::INTERVAL);

    IF v_collision_id IS NOT NULL THEN
        RAISE EXCEPTION 'Scheduling Conflict: Overlapping class or buffer time detected for this instructor.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_instructor_shift_buffers ON public.class_schedules;
CREATE TRIGGER trg_block_instructor_shift_buffers
BEFORE INSERT OR UPDATE ON public.class_schedules
FOR EACH ROW EXECUTE FUNCTION verify_instructor_shift_and_buffers();


-- 11. Trigger: Advanced Waitlist auto-promotion logic
CREATE OR REPLACE FUNCTION promote_waitlist_on_cancellation()
RETURNS TRIGGER AS $$
DECLARE
    v_next_waitlist_id UUID;
    v_next_user_id UUID;
    v_class_time TIMESTAMP WITH TIME ZONE;
    v_cancel_boundary INT;
BEGIN
    IF OLD.status IN ('BOOKED', 'ATTENDED') AND NEW.status = 'CANCELLED_TIMELY' THEN
        SELECT start_time, cancel_boundary_hours 
        INTO v_class_time, v_cancel_boundary
        FROM public.class_schedules
        WHERE id = OLD.class_schedule_id;

        IF (v_class_time - NOW()) >= (v_cancel_boundary || ' hours')::INTERVAL THEN
            SELECT id, user_id INTO v_next_waitlist_id, v_next_user_id
            FROM public.bookings
            WHERE class_schedule_id = OLD.class_schedule_id
              AND status = 'WAITLISTED'
            ORDER BY waitlist_position ASC
            LIMIT 1;

            IF v_next_waitlist_id IS NOT NULL THEN
                UPDATE public.bookings
                SET status = 'BOOKED',
                    waitlist_position = NULL,
                    spot_layout_id = OLD.spot_layout_id
                WHERE id = v_next_waitlist_id;

                UPDATE public.bookings
                SET waitlist_position = waitlist_position - 1
                WHERE class_schedule_id = OLD.class_schedule_id
                  AND status = 'WAITLISTED'
                  AND waitlist_position > 1;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_promote_waitlist ON public.bookings;
CREATE TRIGGER trg_promote_waitlist
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION promote_waitlist_on_cancellation();
