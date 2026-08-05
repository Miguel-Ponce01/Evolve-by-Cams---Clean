-- 1. Create custom roles and permissions table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_by TEXT,
    created_on DATE DEFAULT CURRENT_DATE,
    is_locked BOOLEAN DEFAULT false,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Insert default System Administrator role
INSERT INTO public.roles (name, type, created_by, is_locked, permissions)
VALUES (
    'System Administrator',
    'Primary Owner',
    'System Root',
    true,
    '{"accessConsole": true, "accessTimetable": true, "editSchedule": true, "accessFinancials": true, "manageReviews": true, "manageOutlets": true}'::jsonb
);
