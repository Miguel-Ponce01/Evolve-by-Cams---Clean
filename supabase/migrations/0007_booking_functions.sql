-- 0007_booking_functions.sql
-- book_class() and cancel_booking() are what actually protect the 5
-- rig points under concurrent requests. Everything before this file
-- is standard CRUD; this is the part worth reviewing carefully.

create or replace function public.book_class(
  p_class_id uuid,
  p_user_id uuid,
  p_family_member_id uuid default null
) returns public.bookings
language plpgsql
as $$
declare
  v_class public.classes%rowtype;
  v_free_point smallint;
  v_balance integer;
  v_booking public.bookings%rowtype;
  v_waitlist_max smallint;
  v_waitlist_count smallint;
begin
  select value::smallint into v_waitlist_max from public.booking_policy where key = 'waitlist_max_size';

  -- Lock the class row itself first so capacity checks are consistent for
  -- the duration of this transaction.
  select * into v_class from public.classes where id = p_class_id for update;
  if not found then
    raise exception 'class not found';
  end if;

  -- Waiver + membership gate.
  if not exists (
    select 1 from public.profiles
    where id = p_user_id and membership_status = 'active' and waiver_signed_at is not null
  ) then
    raise exception 'membership inactive or waiver not signed';
  end if;

  -- Find a rig point not currently held by an active booking for
  -- this class. SKIP LOCKED means a concurrent transaction already
  -- evaluating a different free point won't block us, and we'll
  -- never both land on the same one.
  select rp.id into v_free_point
  from public.rig_points rp
  where rp.id <= v_class.capacity
    and not exists (
      select 1 from public.bookings b
      where b.class_id = p_class_id
        and b.rig_point_id = rp.id
        and b.status = 'booked'
    )
  order by rp.id
  limit 1
  for update skip locked;

  if v_free_point is null then
    -- No open point — fall back to waitlist if there's room.
    select count(*) into v_waitlist_count
    from public.bookings
    where class_id = p_class_id and status = 'waitlisted';

    if v_waitlist_count >= v_waitlist_max then
      raise exception 'class full and waitlist full';
    end if;

    insert into public.bookings (class_id, user_id, family_member_id, status, waitlist_position, credits_charged)
    values (p_class_id, p_user_id, p_family_member_id, 'waitlisted', v_waitlist_count + 1, 0)
    returning * into v_booking;

    return v_booking;
  end if;

  -- Credit check, locked against concurrent spends by this user.
  select coalesce(sum(delta), 0) into v_balance
  from public.credit_ledger
  where user_id = p_user_id
  for update;

  if v_balance < v_class.credits_cost then
    raise exception 'insufficient credits';
  end if;

  insert into public.bookings (class_id, user_id, family_member_id, rig_point_id, status, credits_charged)
  values (p_class_id, p_user_id, p_family_member_id, v_free_point, 'booked', v_class.credits_cost)
  returning * into v_booking;

  insert into public.credit_ledger (user_id, delta, reason, booking_id)
  values (p_user_id, -v_class.credits_cost, 'booking', v_booking.id);

  return v_booking;
end;
$$;

-- ------------------------------------------------------------
-- Cancellation + waitlist promotion. Refunds credits if outside
-- the deadline, then promotes the top of the waitlist into the
-- freed rig point atomically.
-- ------------------------------------------------------------
create or replace function public.cancel_booking(p_booking_id uuid) returns void
language plpgsql
as $$
declare
  v_booking public.bookings%rowtype;
  v_class public.classes%rowtype;
  v_deadline_hours integer;
  v_next_waitlisted public.bookings%rowtype;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  select * into v_class from public.classes where id = v_booking.class_id for update;
  select value::integer into v_deadline_hours from public.booking_policy where key = 'cancellation_deadline_hours';

  update public.bookings
  set status = 'cancelled', cancelled_at = now()
  where id = p_booking_id;

  if v_booking.status = 'booked' then
    if now() < v_class.starts_at - (v_deadline_hours || ' hours')::interval then
      insert into public.credit_ledger (user_id, delta, reason, booking_id)
      values (v_booking.user_id, v_booking.credits_charged, 'cancellation_refund', p_booking_id);
    end if;

    -- Promote next waitlisted booking into the freed rig point.
    select * into v_next_waitlisted
    from public.bookings
    where class_id = v_booking.class_id and status = 'waitlisted'
    order by waitlist_position asc
    limit 1
    for update skip locked;

    if found then
      update public.bookings
      set status = 'booked', rig_point_id = v_booking.rig_point_id, credits_charged = v_class.credits_cost
      where id = v_next_waitlisted.id;

      insert into public.credit_ledger (user_id, delta, reason, booking_id)
      values (v_next_waitlisted.user_id, -v_class.credits_cost, 'booking', v_next_waitlisted.id);

      -- TODO: trigger notification to promoted user (email / Messenger)
    end if;
  end if;
end;
$$;
