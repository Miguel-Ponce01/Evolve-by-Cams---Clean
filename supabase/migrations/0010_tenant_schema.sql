-- 0010_tenant_schema.sql
-- Migrates the single-tenant Evolve Studio database into a multi-tenant schema.

-- 1. Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Populate Default Tenant for Evolve Studio (Slug: evolve)
INSERT INTO public.tenants (id, name, slug)
VALUES ('d3b07384-d113-4a12-b52c-cc31813088b3', 'Evolve Studio', 'evolve')
ON CONFLICT (slug) DO NOTHING;

-- 3. Add tenant_id Columns to Core Tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'd3b07384-d113-4a12-b52c-cc31813088b3';
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'd3b07384-d113-4a12-b52c-cc31813088b3';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'd3b07384-d113-4a12-b52c-cc31813088b3';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) DEFAULT 'd3b07384-d113-4a12-b52c-cc31813088b3';

-- 4. Enable Row Level Security (RLS) policies per tenant
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. Define Tenant-Based RLS Isolation Policies
DROP POLICY IF EXISTS tenant_profiles_policy ON public.profiles;
CREATE POLICY tenant_profiles_policy ON public.profiles
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS tenant_family_members_policy ON public.family_members;
CREATE POLICY tenant_family_members_policy ON public.family_members
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS tenant_classes_policy ON public.classes;
CREATE POLICY tenant_classes_policy ON public.classes
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS tenant_bookings_policy ON public.bookings;
CREATE POLICY tenant_bookings_policy ON public.bookings
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
