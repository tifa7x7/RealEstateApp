-- Phase 17 — re-key price_alerts from per-(project, unit?) to per-list.
--
-- After 0004_lists.sql, list_items hold what the user cares about. Alerts
-- become "notify me when any item in this list moves price by ≥ X%."
-- The dispatch logic in supabase/functions/dispatch-price-alerts/ keeps
-- working — it computes per-unit deltas and fans them out per user; only
-- the alert→user mapping changes shape.
--
-- Migration shape:
--   1. Add nullable list_id column.
--   2. Backfill: for every existing price_alerts row, attach it to the
--      user's default Избранное list. Dedupe to one alert per (user, list)
--      keeping the lowest threshold_pct (most-sensitive wins).
--   3. Drop legacy unique indexes; add the new (user_id, list_id) one.
--   4. Drop project_id + unit_id columns.
--   5. Make list_id NOT NULL.
--   6. Update compute_pending_alerts() to scope by list_id.

-- ---------------------------------------------------------------------------
-- 1. Add nullable list_id column with FK.
-- ---------------------------------------------------------------------------
alter table public.price_alerts
  add column if not exists list_id uuid references public.lists(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 2. Backfill list_id from each user's default `Избранное` list.
--
-- 0004_lists.sql ensured every user with any favorite/fav_unit has a
-- default list. A user with only alerts (no favorites/fav_units) would
-- not have one — so first ensure they do.
-- ---------------------------------------------------------------------------
insert into public.lists (owner_user_id, name, visibility, is_default)
select distinct user_id, 'Избранное', 'private', true
  from public.price_alerts
  where list_id is null
  on conflict do nothing;

update public.price_alerts pa
   set list_id = l.id
  from public.lists l
 where pa.list_id is null
   and l.owner_user_id = pa.user_id
   and l.is_default;

-- ---------------------------------------------------------------------------
-- 3. Dedupe: if a user has multiple legacy alerts (e.g. one per favorited
--    unit), keep only the row with the lowest threshold (most sensitive),
--    drop the rest.
-- ---------------------------------------------------------------------------
delete from public.price_alerts pa
where pa.id in (
  select id from (
    select id,
           row_number() over (
             partition by user_id, list_id
             order by threshold_pct asc, created_at asc
           ) as rn
      from public.price_alerts
  ) ranked
  where ranked.rn > 1
);

-- ---------------------------------------------------------------------------
-- 4. Drop legacy unique indexes (from 0003).
-- ---------------------------------------------------------------------------
drop index if exists public.price_alerts_user_scope_unit_idx;
drop index if exists public.price_alerts_user_scope_project_idx;

-- ---------------------------------------------------------------------------
-- 5. Drop project_id + unit_id columns.
-- ---------------------------------------------------------------------------
alter table public.price_alerts drop column if exists project_id;
alter table public.price_alerts drop column if exists unit_id;

-- ---------------------------------------------------------------------------
-- 6. Make list_id NOT NULL + add unique constraint.
-- ---------------------------------------------------------------------------
alter table public.price_alerts alter column list_id set not null;

create unique index if not exists price_alerts_user_list_idx
  on public.price_alerts (user_id, list_id);

create index if not exists price_alerts_list_idx
  on public.price_alerts (list_id);

-- ---------------------------------------------------------------------------
-- 7. Replace compute_pending_alerts() to scope by list_id.
--
-- For every active alert pointing at a list, find list items whose latest
-- snapshot crossed the threshold and emit one row per (alert × triggered
-- unit). Project-scoped items in the list expand to their constituent units.
-- ---------------------------------------------------------------------------
create or replace function public.compute_pending_alerts()
returns table (
  alert_id          uuid,
  user_id           uuid,
  list_id           uuid,
  project_id        integer,
  unit_id           text,
  previous_price    bigint,
  current_price     bigint,
  delta_pct         numeric,
  threshold_pct     numeric,
  last_notified_at  timestamptz,
  unsubscribe_token text
)
language sql security definer set search_path = public as $$
  with latest as (
    select
      ps.project_id,
      ps.unit_id,
      ps.captured_at,
      ps.price,
      row_number() over (
        partition by ps.project_id, ps.unit_id
        order by ps.captured_at desc
      ) as rn
    from public.price_snapshots ps
  ),
  pairs as (
    select
      cur.project_id,
      cur.unit_id,
      prev.price as previous_price,
      cur.price as current_price,
      case when prev.price = 0 then 0
           else ((cur.price - prev.price)::numeric / prev.price) * 100
      end as delta_pct
    from latest cur
    join latest prev
      on prev.project_id = cur.project_id
     and prev.unit_id = cur.unit_id
     and prev.rn = cur.rn + 1
    where cur.rn = 1
  ),
  -- Expand each list to its constituent (project, unit) pairs.
  list_targets as (
    -- unit-scoped items
    select li.list_id, li.project_id, li.unit_id
      from public.list_items li
     where li.unit_id is not null
    union
    -- project-scoped items expand to every unit in the project
    select li.list_id, u.project_id, u.id as unit_id
      from public.list_items li
      join public.units u on u.project_id = li.project_id
     where li.unit_id is null
  )
  select
    pa.id as alert_id,
    pa.user_id,
    pa.list_id,
    p.project_id,
    p.unit_id,
    p.previous_price,
    p.current_price,
    p.delta_pct,
    pa.threshold_pct,
    pa.last_notified_at,
    pa.unsubscribe_token
  from public.price_alerts pa
  join list_targets lt on lt.list_id = pa.list_id
  join pairs p on p.project_id = lt.project_id and p.unit_id = lt.unit_id
  where pa.active
    and abs(p.delta_pct) >= pa.threshold_pct;
$$;

-- ---------------------------------------------------------------------------
-- 8. Replace capture_price_snapshots() to drop the legacy alert reference.
--
-- 0004 left a fallback that read price_alerts.project_id / unit_id — those
-- columns are gone now. The "watched" set is simply: every (project, unit)
-- pair that appears in any list_items row (project-scoped expanded).
-- ---------------------------------------------------------------------------
create or replace function public.capture_price_snapshots()
returns integer
language plpgsql security definer set search_path = public as $$
declare
  inserted integer;
begin
  with watched as (
    select li.project_id, li.unit_id
      from public.list_items li
     where li.unit_id is not null
    union
    select u.project_id, u.id as unit_id
      from public.list_items li
      join public.units u on u.project_id = li.project_id
     where li.unit_id is null
  ),
  ins as (
    insert into public.price_snapshots (project_id, unit_id, captured_at, price)
    select w.project_id, w.unit_id, current_date, u.price
      from watched w
      join public.units u
        on u.project_id = w.project_id and u.id = w.unit_id
    on conflict (project_id, unit_id, captured_at) do nothing
    returning 1
  )
  select count(*) into inserted from ins;
  return coalesce(inserted, 0);
end;
$$;
