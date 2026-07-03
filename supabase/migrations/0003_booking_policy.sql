-- 0003_booking_policy.sql
-- Cancellation deadline, no-show penalty, late-booking cutoff were
-- flagged as pain points but never given numbers in the client brief.
-- Keep them editable from a settings screen, not hardcoded in app logic.

create table public.booking_policy (
  key text primary key,
  value text not null,
  description text
);

insert into public.booking_policy (key, value, description) values
  ('cancellation_deadline_hours', '12', 'Hours before class start for a full credit refund on cancellation'),
  ('no_show_penalty_credits', 'full', 'full = forfeit entire class cost, or a fixed integer'),
  ('late_booking_cutoff_minutes', '30', 'Minutes before start after which booking is blocked'),
  ('special_class_min_to_run', '3', 'Minimum bookings for a special class; auto-cancels below this'),
  ('special_class_auto_cancel_hours', '24', 'Hours before start to evaluate the min-to-run cutoff'),
  ('waitlist_max_size', '2', 'Maximum number of people who can queue on a full class');
