-- 0011_events_schema.sql
-- Relational schema representing interactive events and workshops.

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    tag VARCHAR(50) NOT NULL,
    spots_left INT DEFAULT 15 NOT NULL,
    price VARCHAR(50) DEFAULT 'Free' NOT NULL,
    location VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(255),
    tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'd3b07384-d113-4a12-b52c-cc31813088b3',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies
DROP POLICY IF EXISTS tenant_events_policy ON public.events;
CREATE POLICY tenant_events_policy ON public.events
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 4. Seed Initial Events data
INSERT INTO public.events (title, description, start_time, end_time, tag, spots_left, price, location, instructor_name)
VALUES 
('Vertical Artistry Showcase 2026', 'Our annual theatrical studio showcase celebrating vertical movement.', '2026-08-15 18:00:00+08', '2026-08-15 21:00:00+08', 'Showcase', 12, '₱750 / Ticket', 'Davao Studio (Main Hall)', 'Ervy Tweetie & Leadership Team'),
('Aerial Hoop & Lyra Basics Intensive', 'A focused 3-hour technique masterclass designed to optimize grip, transitions, and mount structures.', '2026-07-25 14:00:00+08', '2026-07-25 17:00:00+08', 'Workshop', 4, '₱1,500 / Entry', 'Cagayan de Oro Studio', 'Tweety Bullecer'),
('Pole Drops & Dynamic Rebounds', 'An advanced masterclass focusing on high-velocity drop catches, dynamic flips, and rebound setups.', '2026-09-05 16:00:00+08', '2026-09-05 18:30:00+08', 'Masterclass', 6, '₱1,800 / Entry', 'Davao Studio (Main Hall)', 'Cams & Guest Instructors')
ON CONFLICT DO NOTHING;
