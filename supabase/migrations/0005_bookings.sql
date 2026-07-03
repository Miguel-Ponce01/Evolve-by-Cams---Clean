-- 0005_bookings.sql
-- One row per rig point reservation. A booking with rig_point_id =
-- null and status = 'waitlisted' is a waitlist entry — kept in the
-- same table so promotion is a status flip + rig_point_id assignment,
-- not a cross-table move.

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id),
  user_id uuid not null references public.profiles(id),
  family_member_id uuid references public.family_members(id),  -- null = booking is for the account holder
  rig_point_id smallint references public.rig_points(id),
  status text not null default 'booked'
    check (status in ('booked', 'waitlisted', 'cancelled', 'no_show', 'completed')),
  waitlist_position smallint,
  credits_charged integer not null default 0,
  checked_in_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),

  -- A rig point can only be held by one active booking per class.
  constraint uniq_rig_point_per_class unique (class_id, rig_point_id)
);

create index idx_bookings_class_active on public.bookings(class_id) where status in ('booked', 'waitlisted');
create index idx_bookings_user on public.bookings(user_id);
