-- 0001_profiles.sql
-- Extends Supabase Auth's auth.users with studio-specific fields.
-- Auth (email/Google/Apple, MFA) is handled by Supabase Auth itself —
-- do not duplicate those fields here.

create sequence if not exists member_id_seq start with 1000;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  member_id text unique not null default ('EPF-' || lpad(nextval('member_id_seq')::text, 5, '0')),
  membership_status text not null default 'inactive'
    check (membership_status in ('inactive', 'active', 'suspended')),
  waiver_signed_at timestamptz,          -- null = not signed; booking is gated on this
  created_at timestamptz not null default now()
);

-- Family members booked under a primary account. Each still needs
-- their own waiver on file before they can be checked in.
create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  primary_user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  relationship text,
  waiver_signed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_family_members_primary_user on public.family_members(primary_user_id);
