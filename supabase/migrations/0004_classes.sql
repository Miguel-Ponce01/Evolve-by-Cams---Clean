-- 0004_classes.sql
-- Instructors, recurring class templates, and concrete class instances.
-- recurring_series must exist before classes since classes references it.

create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  bio text
);

-- Recurring class templates ("book recurring classes"). A generator
-- job materializes individual `classes` rows from this on a rolling
-- window (e.g. 8 weeks out), so cancelling one instance never touches
-- the series, and the series can be edited without rewriting history.
create table public.recurring_series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  class_type text not null check (class_type in ('regular', 'special')),
  instructor_id uuid not null references public.instructors(id),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  duration_minutes integer not null,
  capacity smallint not null default 5 check (capacity <= 5),
  credits_cost integer not null default 1,
  active boolean not null default true
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  class_type text not null check (class_type in ('regular', 'special')),
  instructor_id uuid not null references public.instructors(id),
  starts_at timestamptz not null,
  duration_minutes integer not null,
  capacity smallint not null default 5 check (capacity <= 5),  -- can be < 5 if a class needs fewer points
  min_to_run smallint not null default 1,
  credits_cost integer not null default 1,
  recurring_series_id uuid references public.recurring_series(id),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'cancelled_under_enrolled', 'completed')),
  created_at timestamptz not null default now()
);

create index idx_classes_starts_at on public.classes(starts_at);
create index idx_classes_recurring_series on public.classes(recurring_series_id);
