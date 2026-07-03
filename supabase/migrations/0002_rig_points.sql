-- 0002_rig_points.sql
-- Static — there are exactly 5, ever. This table existing at all
-- (rather than a `capacity integer` column somewhere) is what makes
-- "one row per physical point" possible, which is what the booking
-- function locks against.

create table public.rig_points (
  id smallint primary key,     -- 1 through 5
  label text not null          -- matches the physical mount plate, e.g. 'A1'..'A5'
);

insert into public.rig_points (id, label) values
  (1, 'A1'), (2, 'A2'), (3, 'A3'), (4, 'A4'), (5, 'A5');
