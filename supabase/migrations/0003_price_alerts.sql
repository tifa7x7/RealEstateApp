-- Phase 16 — Retention loop: price alerts.
--
-- New tables:
--   - price_snapshots: daily price-per-unit history (driven by the snapshot
--     edge function on a pg_cron schedule)
--   - price_alerts:    per-user (project, unit?) alert subscriptions with a
--     %-threshold trigger and an unsubscribe token
--
-- RPCs:
--   - capture_price_snapshots(): inserts today's snapshot for every unit
--     that any user has an active alert on (or has favorited). Idempotent
--     per day via the composite PK.
--   - compute_pending_alerts(): returns rows ready to notify — for each
--     active alert, compares today's snapshot to the previous one and emits
--     a row when |delta_pct| >= threshold_pct. The dispatch edge function
--     consumes the result, sends emails, then updates last_notified_at.
--
-- Free vs Pro frequency is enforced in the dispatch edge function, not the
-- schema (free users only see a row when 7 days have passed since their last
-- notification; Pro users see every triggered row immediately).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- price_snapshots
-- ---------------------------------------------------------------------------
create table if not exists public.price_snapshots (
  project_id   integer not null,
  unit_id      text    not null,
  captured_at  date    not null default current_date,
  price        bigint  not null,
  primary key (project_id, unit_id, captured_at),
  foreign key (project_id, unit_id) references public.units(project_id, id) on delete cascade
);

create index if not exists price_snapshots_captured_at_idx
  on public.price_snapshots (captured_at desc);

create index if not exists price_snapshots_unit_idx
  on public.price_snapshots (project_id, unit_id, captured_at desc);

-- ---------------------------------------------------------------------------
-- price_alerts
-- ---------------------------------------------------------------------------
create table if not exists public.price_alerts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  project_id        integer not null references public.projects(id) on delete cascade,
  -- null = whole project (any of its units triggers); non-null = single unit
  unit_id           text,
  threshold_pct     numeric not null default 5 check (threshold_pct > 0 and threshold_pct <= 100),
  channel           text not null default 'email' check (channel in ('email')),
  active            boolean not null default true,
  last_notified_at  timestamptz,
  unsubscribe_token text not null default encode(gen_random_bytes(24), 'hex') unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- One alert per (user, project, unit?) — partial-index pattern because
-- nullable columns are not deduped by a plain UNIQUE constraint.
create unique index if not exists price_alerts_user_scope_unit_idx
  on public.price_alerts (user_id, project_id, unit_id)
  where unit_id is not null;

create unique index if not exists price_alerts_user_scope_project_idx
  on public.price_alerts (user_id, project_id)
  where unit_id is null;

create index if not exists price_alerts_user_idx
  on public.price_alerts (user_id);

create index if not exists price_alerts_active_idx
  on public.price_alerts (active) where active = true;

drop trigger if exists price_alerts_set_updated_at on public.price_alerts;
create trigger price_alerts_set_updated_at
  before update on public.price_alerts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.price_snapshots enable row level security;
alter table public.price_alerts    enable row level security;

-- Snapshots: readable by anyone (they're public market history), writable
-- only by the service role (the snapshot edge function uses it).
drop policy if exists price_snapshots_select_all on public.price_snapshots;
create policy price_snapshots_select_all on public.price_snapshots
  for select using (true);

-- Alerts: per-user CRUD, plus a token-scoped one-shot deactivation path
-- (used by the unsubscribe link) is handled server-side by the API route
-- with the service-role key — no anon policy needed for that.
drop policy if exists price_alerts_all_own on public.price_alerts;
create policy price_alerts_all_own on public.price_alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- capture_price_snapshots()
--
-- Inserts one row per "watched" unit for today's date. A unit is watched
-- when at least one user has either a price_alert (any scope) or a fav_unit
-- targeting it, OR when the unit belongs to a project some user has
-- favorited. Idempotent: re-running the same day no-ops thanks to the
-- composite PK + ON CONFLICT DO NOTHING.
-- ---------------------------------------------------------------------------
create or replace function public.capture_price_snapshots()
returns integer
language plpgsql security definer set search_path = public as $$
declare
  inserted integer;
begin
  with watched as (
    -- unit-scoped alerts
    select pa.project_id, pa.unit_id
      from public.price_alerts pa
     where pa.active and pa.unit_id is not null
    union
    -- project-scoped alerts → expand to every unit in the project
    select u.project_id, u.id as unit_id
      from public.price_alerts pa
      join public.units u on u.project_id = pa.project_id
     where pa.active and pa.unit_id is null
    union
    -- favorited units
    select fu.project_id, fu.unit_id
      from public.fav_units fu
    union
    -- favorited projects → expand to every unit
    select u.project_id, u.id as unit_id
      from public.favorites f
      join public.units u on u.project_id = f.project_id
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

-- ---------------------------------------------------------------------------
-- compute_pending_alerts()
--
-- Returns one row per (active alert × unit) where today's price differs from
-- the previous snapshot by at least the alert's threshold_pct. For project-
-- scoped alerts each affected unit yields its own row so the dispatch layer
-- can list them in the digest body.
-- ---------------------------------------------------------------------------
create or replace function public.compute_pending_alerts()
returns table (
  alert_id          uuid,
  user_id           uuid,
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
  -- project-scoped alerts get any of their units that triggered
  project_hits as (
    select
      pa.id as alert_id,
      pa.user_id,
      pa.project_id,
      p.unit_id,
      p.previous_price,
      p.current_price,
      p.delta_pct,
      pa.threshold_pct,
      pa.last_notified_at,
      pa.unsubscribe_token
    from public.price_alerts pa
    join pairs p on p.project_id = pa.project_id
    where pa.active
      and pa.unit_id is null
      and abs(p.delta_pct) >= pa.threshold_pct
  ),
  unit_hits as (
    select
      pa.id as alert_id,
      pa.user_id,
      pa.project_id,
      pa.unit_id,
      p.previous_price,
      p.current_price,
      p.delta_pct,
      pa.threshold_pct,
      pa.last_notified_at,
      pa.unsubscribe_token
    from public.price_alerts pa
    join pairs p on p.project_id = pa.project_id and p.unit_id = pa.unit_id
    where pa.active
      and pa.unit_id is not null
      and abs(p.delta_pct) >= pa.threshold_pct
  )
  select * from project_hits
  union all
  select * from unit_hits;
$$;

-- ---------------------------------------------------------------------------
-- mark_alerts_notified(uuid[])
--
-- Stamps last_notified_at for the given alert ids. Called by the dispatch
-- edge function after a successful send.
-- ---------------------------------------------------------------------------
create or replace function public.mark_alerts_notified(alert_ids uuid[])
returns void
language sql security definer set search_path = public as $$
  update public.price_alerts
     set last_notified_at = now()
   where id = any(alert_ids);
$$;

-- ---------------------------------------------------------------------------
-- pg_cron schedule (best-effort; pg_cron extension must be enabled on the
-- project). The snapshot runs at 03:00 UTC, the dispatch at 03:15 UTC. The
-- dispatch is invoked by calling a Supabase edge function via http extension
-- — install net + http on the project first, then customize the URL below.
--
-- These statements are wrapped in a DO block so the migration still applies
-- on projects that don't have pg_cron available (the catch silently no-ops).
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'price-snapshots-daily',
      '0 3 * * *',
      $cron$select public.capture_price_snapshots();$cron$
    );
  end if;
exception when others then
  -- pg_cron not available; the snapshot can still be invoked manually or
  -- from the dispatch edge function before computing alerts.
  null;
end $$;
