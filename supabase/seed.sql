-- ==============================================================================
-- EVOLVE STUDIO - MASTER SUPABASE DATABASE SEED FILE
-- Professional, normalized, production-ready dataset for demonstration & testing
-- ==============================================================================

-- 1. Extension Guard
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Seed Instructors Registry
INSERT INTO public.instructors (id, full_name, bio, avatar_url, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Cams Rivera', 'Co-founder of Evolve. Over a decade of experience in pole fitness and aerial arts. Cams brings fierce energy and empowering movement to every class.', '👩‍🦱', true),
('22222222-2222-2222-2222-222222222222', 'Tweetie Bullecer', 'Founder of Evolve Pole Fitness & Aerial Arts. Tweetie built the studio on the belief that pole fitness is empowering, joyful, and artistic.', '👩‍🦰', true),
('33333333-3333-3333-3333-333333333333', 'Alex Tran', 'Former professional dancer turned aerial coach. Alex brings athleticism, creativity, and precision to every session.', '🧑‍🦲', true)
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

-- 3. Seed Physical Stations / Rig Points
INSERT INTO public.rig_points (id, station_code, is_operational) VALUES
('b1111111-1111-1111-1111-111111111111', 'A1', true),
('b2222222-2222-2222-2222-222222222222', 'A2', true),
('b3333333-3333-3333-3333-333333333333', 'A3', true),
('b4444444-4444-4444-4444-444444444444', 'A4', true),
('b5555555-5555-5555-5555-555555555555', 'A5', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Class Definition Templates
INSERT INTO public.class_definitions (id, name, category, description, duration_minutes) VALUES
('c1111111-1111-1111-1111-111111111111', 'Pole Fitness Basics', 'POLE_FITNESS', 'Learn foundations of pole fitness: grip technique, basic spins, and confidence building.', 60),
('c2222222-2222-2222-2222-222222222222', 'Aerial Sling Flow', 'AERIAL_ARTS', 'Float and flow on the aerial sling with graceful transitions and poses.', 60),
('c3333333-3333-3333-3333-333333333333', 'Exole (Exotic Pole)', 'POLE_FITNESS', 'Exotic pole combines sensual movement, floorwork, and pole choreography.', 60),
('c4444444-4444-4444-4444-444444444444', 'Reformer Pilates Group', 'PILATES_REFORMER', 'Full body reformer workout for core strength and alignment.', 60)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Outlets / Studios
INSERT INTO public.outlets (id, name, address, phone, is_active) VALUES
('d1111111-1111-1111-1111-111111111111', 'Davao Studio', '3F Sunscor Bldg., corner Arroyo St., Davao City', '+63 917 123 4567', true),
('d2222222-2222-2222-2222-222222222222', 'Nex Studio', 'Nex Mall 2F Main Wing, Singapore', '+65 6789 0123', true),
('d3333333-3333-3333-3333-333333333333', 'Nex Barbershop', 'Nex Mall B1 Suite 12, Singapore', '+65 6789 0124', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Pricing Packages
INSERT INTO public.packages (id, name, category, price, credits, validity_months, status) VALUES
('e1111111-1111-1111-1111-111111111111', '88 Session Pack', 'Credit Packs', 88.00, 88, 6, 'Active'),
('e2222222-2222-2222-2222-222222222222', 'Private 8 credit pack', 'Credit Packs', 100.00, 8, 2, 'Active'),
('e3333333-3333-3333-3333-333333333333', 'Starter 5 Credit Pack', 'Credit Packs', 50.00, 5, 1, 'Active'),
('e4444444-4444-4444-4444-444444444444', '10-Class All Access Pass', 'Multi Packs', 120.00, 10, 3, 'Active')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Memberships
INSERT INTO public.memberships (id, name, category, price, status, validity_months, total_purchases, total_sales) VALUES
('f1111111-1111-1111-1111-111111111111', 'Monthly', 'Monthly', 30.00, 'Active', 3, 7, 2400.00),
('f2222222-2222-2222-2222-222222222222', 'My Membership', 'Monthly', 0.00, 'Draft', 1, 0, 0.00)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Customer Groups
INSERT INTO public.customer_groups (id, name, discount_rate) VALUES
('g1111111-1111-1111-1111-111111111111', 'Not assigned', 0.0),
('g2222222-2222-2222-2222-222222222222', 'Doctor''s Group', 15.0),
('g3333333-3333-3333-3333-333333333333', 'Trainers', 20.0),
('g4444444-4444-4444-4444-444444444444', 'Royal Family', 25.0),
('g5555555-5555-5555-5555-555555555555', 'Penghuni Membership', 30.0)
ON CONFLICT (id) DO NOTHING;
