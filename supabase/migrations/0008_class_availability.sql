-- 0008_class_availability.sql
-- Frontend-facing view: one row per class with rig points used and
-- waitlist count already computed, so BookingFlow.jsx doesn't need
-- to run its own aggregation query per class card.

create or replace view public.class_availability as
select
  c.id,
  c.title,
  c.class_type,
  c.starts_at,
  c.duration_minutes,
  c.capacity,
  c.min_to_run,
  c.credits_cost,
  c.status,
  i.full_name as instructor_name,
  coalesce(sum(case when b.status = 'booked' then 1 else 0 end), 0) as rig_points_used,
  coalesce(sum(case when b.status = 'waitlisted' then 1 else 0 end), 0) as waitlist_count
from public.classes c
join public.instructors i on i.id = c.instructor_id
left join public.bookings b on b.class_id = c.id
group by c.id, i.full_name, c.title, c.class_type, c.starts_at, c.duration_minutes, c.capacity, c.min_to_run, c.credits_cost, c.status;

-- ------------------------------------------------------------
-- Check-in. Called from the front desk terminal (service-role
-- key, not the public anon key) when a member scans in or gives
-- their member ID. Only 'booked' bookings for a class already
-- underway or about to start can be checked in.
-- ------------------------------------------------------------
create or replace function public.check_in_booking(p_booking_id uuid) returns public.bookings
language plpgsql
as $$
declare
  v_booking public.bookings%rowtype;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;

  if not found then
    raise exception 'booking not found';
  end if;

  if v_booking.status <> 'booked' then
    raise exception 'booking is not in a checkable state (%)', v_booking.status;
  end if;

  update public.bookings
  set checked_in_at = now()
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;
