-- 0006_credit_ledger.sql
-- Append-only — never UPDATE a balance. Balance = sum(delta) for a
-- user. This is what turns "keeping record of class credits" (their
-- single most time-consuming manual process) into a query instead of
-- a notebook.

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,                -- positive = purchase/refund, negative = spend
  reason text not null
    check (reason in ('purchase', 'booking', 'cancellation_refund', 'no_show_forfeit', 'admin_adjustment')),
  booking_id uuid references public.bookings(id),
  created_at timestamptz not null default now()
);

create index idx_credit_ledger_user on public.credit_ledger(user_id);

-- Convenience view for display only. Real balance checks in the
-- booking function use a direct locked sum, not this view.
create or replace view public.credit_balances as
  select user_id, coalesce(sum(delta), 0) as balance
  from public.credit_ledger
  group by user_id;
