-- supabase/migrations/0001_init.sql
-- Core Database Schema with Tuesday Lockout, Instructor Booking validation, and Capacity Controls.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MEMBERSHIP TIERS
CREATE TABLE membership_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    credits INT NOT NULL DEFAULT 0 CHECK (credits >= 0), -- 999 indicates Unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. PROFILES (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'staff', 'instructor', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    credits INT NOT NULL DEFAULT 0 CHECK (credits >= 0),
    tier_id UUID REFERENCES membership_tiers(id) ON DELETE SET NULL,
    birthday DATE,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. INSTRUCTORS (Linked optionally to a Profile/User for login access)
CREATE TABLE instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    specialty VARCHAR(150),
    rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Mat, Reformer, HIIT, etc.
    instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    total_spots INT NOT NULL DEFAULT 10 CHECK (total_spots > 0),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

    -- Business Rules checks:
    -- A. Tuesday Lockout (ISODOW 2 = Tuesday in Manila time)
    CONSTRAINT chk_no_tuesday CHECK (
        EXTRACT(ISODOW FROM (start_time AT TIME ZONE 'Asia/Manila')) <> 2
    ),
    -- B. Operating Window: Start must be >= 9:00 AM Manila time
    CONSTRAINT chk_start_time CHECK (
        EXTRACT(HOUR FROM (start_time AT TIME ZONE 'Asia/Manila')) >= 9
    ),
    -- C. Operating Window: End must be <= 6:00 PM Manila time on the same calendar day
    CONSTRAINT chk_end_time CHECK (
        ((start_time AT TIME ZONE 'Asia/Manila') + (duration_minutes || ' minutes')::INTERVAL)::TIME <= '18:00:00'::TIME AND
        ((start_time AT TIME ZONE 'Asia/Manila') + (duration_minutes || ' minutes')::INTERVAL)::DATE = (start_time AT TIME ZONE 'Asia/Manila')::DATE
    )
);

-- 6. BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    spot_number INT NOT NULL CHECK (spot_number > 0),
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'attended', 'cancelled')),
    payment_method VARCHAR(50) DEFAULT 'credit' CHECK (payment_method IN ('credit', 'card', 'cash')),
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
    CONSTRAINT unique_spot_per_class UNIQUE (class_id, spot_number)
);

-- 7. TRANSACTIONS (Financial Audit Ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'membership', 'refund', 'cancellation')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    description TEXT,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'credit')),
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
    handled_by VARCHAR(255) DEFAULT 'Cams Rivera' NOT NULL
);

-- Row-Level Security (RLS) Enablement
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Public read membership tiers" ON membership_tiers FOR SELECT USING (true);
CREATE POLICY "Admins full membership tiers" ON membership_tiers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins full profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Customers view own customer data" ON customers FOR SELECT USING (id = auth.uid());
CREATE POLICY "Staff/Admins full customer data" ON customers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

CREATE POLICY "Public view instructors" ON instructors FOR SELECT USING (true);
CREATE POLICY "Admins full instructors" ON instructors FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public view classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Admins full classes" ON classes FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Customers view and insert own bookings" ON bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Customers insert own bookings" ON bookings FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Staff/Admins full bookings" ON bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

CREATE POLICY "Customers view own transactions" ON transactions FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Admins/Staff full transactions" ON transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- DB TRIGGERS AND SAFEGUARDS

-- A. Automatically update updated_at timestamp on customer edits
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- B. Instructor Double-Booking Safeguard (tstzrange check)
CREATE OR REPLACE FUNCTION check_instructor_double_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.instructor_id IS NOT NULL AND EXISTS (
        SELECT 1 
        FROM classes
        WHERE instructor_id = NEW.instructor_id
          AND id <> NEW.id
          AND tstzrange(start_time, start_time + (duration_minutes || ' minutes')::INTERVAL) &&
              tstzrange(NEW.start_time, NEW.start_time + (NEW.duration_minutes || ' minutes')::INTERVAL)
    ) THEN
        RAISE EXCEPTION 'Double-booking conflict: Instructor already scheduled for an overlapping class during this time.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_instructor_double_booking
BEFORE INSERT OR UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION check_instructor_double_booking();

-- C. Capacity Safeguard with concurrency locking
CREATE OR REPLACE FUNCTION enforce_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_total_spots INT;
    v_booked_spots INT;
BEGIN
    -- Lock the class row to block concurrent transactions and avoid overselling
    SELECT total_spots INTO v_total_spots
    FROM classes
    WHERE id = NEW.class_id
    FOR UPDATE;

    SELECT COUNT(*) INTO v_booked_spots
    FROM bookings
    WHERE class_id = NEW.class_id 
      AND status = 'upcoming';

    IF v_booked_spots >= v_total_spots THEN
        RAISE EXCEPTION 'Booking failed: This class is fully booked (capacity: %).', v_total_spots;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_class_capacity
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION enforce_class_capacity();
