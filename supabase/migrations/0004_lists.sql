-- Phase 17 — Lists refactor.
--
-- Replaces the flat `favorites` + `fav_units` model with named, owned,
-- optionally-shared `lists`. Every user gets a default `Избранное` list
-- (created lazily by trigger for new signups; backfilled here for existing
-- users).
--
-- Migration shape:
--   1. Create lists / list_items / list_followers / list_collaborators /
--      list_comments tables + RLS + triggers.
--   2. Backfill: insert one `Избранное` list per existing user that has
--      either a `favorites` or `fav_units` row, then mirror those rows
--      into `list_items`.
--   3. Update `handle_new_user()` to auto-create `Избранное` on signup.
--   4. Replace `capture_price_snapshots()` to traverse `list_items` instead
--      of `favorites`/`fav_units` — keeps Phase 16 alerts working without
--      changing the price_alerts schema yet (that's 0005).
--   5. Drop `favorites` and `fav_units` tables.
--
-- The migration runs in a single transaction by default (each Supabase
-- migration file is wrapped automatically). DDL is transactional in
-- Postgres, so failure at any step rolls back cleanly.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1a. lists
-- ---------------------------------------------------------------------------
create table if not exists public.lists (
  id          uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  visibility  text not null default 'private'
              check (visibility in ('private','unlisted','public')),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists lists_owner_idx
  on public.lists (owner_user_id, created_at desc);

create index if not exists lists_visibility_idx
  on public.lists (visibility) where visibility <> 'private';

-- At most one default `Избранное` per user. The backfill + trigger both
-- rely on this — a second default-list insert for the same user is a no-op
-- via ON CONFLICT.
create unique index if not exists lists_one_default_per_owner_idx
  on public.lists (owner_user_id) where is_default;

-- ---------------------------------------------------------------------------
-- 1b. list_items
-- ---------------------------------------------------------------------------
create table if not exists public.list_items (
  list_id     uuid not null references public.lists(id) on delete cascade,
  project_id  integer not null references public.projects(id) on delete cascade,
  -- null = whole project; non-null = specific unit
  unit_id     text,
  position    integer not null default 0,
  note        text,
  added_at    timestamptz not null default now(),
  -- Foreign-key composite when unit_id is set
  foreign key (project_id, unit_id) references public.units(project_id, id)
    on delete cascade
    deferrable initially deferred
);

-- Unique (list, project, unit?) — partial-index pattern because nullable
-- columns are not deduped by a plain UNIQUE constraint.
create unique index if not exists list_items_unique_unit_idx
  on public.list_items (list_id, project_id, unit_id)
  where unit_id is not null;

create unique index if not exists list_items_unique_project_idx
  on public.list_items (list_id, project_id)
  where unit_id is null;

create index if not exists list_items_list_idx
  on public.list_items (list_id, added_at desc);

create index if not exists list_items_project_idx
  on public.list_items (project_id);

-- ---------------------------------------------------------------------------
-- 1c. list_followers — who follows whom (read-only access to public lists)
-- ---------------------------------------------------------------------------
create table if not exists public.list_followers (
  list_id          uuid not null references public.lists(id) on delete cascade,
  follower_user_id uuid not null references auth.users(id) on delete cascade,
  alerts_enabled   boolean not null default false,
  created_at       timestamptz not null default now(),
  primary key (list_id, follower_user_id)
);

create index if not exists list_followers_user_idx
  on public.list_followers (follower_user_id);

-- ---------------------------------------------------------------------------
-- 1d. list_collaborators — editor/viewer roles on lists
-- ---------------------------------------------------------------------------
create table if not exists public.list_collaborators (
  list_id    uuid not null references public.lists(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (list_id, user_id)
);

create index if not exists list_collaborators_user_idx
  on public.list_collaborators (user_id);

-- ---------------------------------------------------------------------------
-- 1e. list_comments
-- ---------------------------------------------------------------------------
create table if not exists public.list_comments (
  id              uuid primary key default gen_random_uuid(),
  list_id         uuid not null references public.lists(id) on delete cascade,
  author_user_id  uuid not null references auth.users(id) on delete cascade,
  body            text not null check (char_length(body) between 1 and 4000),
  created_at      timestamptz not null default now()
);

create index if not exists list_comments_list_idx
  on public.list_comments (list_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger on lists
-- ---------------------------------------------------------------------------
drop trigger if exists lists_set_updated_at on public.lists;
create trigger lists_set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Backfill from favorites + fav_units BEFORE dropping them.
--
-- For every distinct user_id that has at least one favorites OR fav_units
-- row, ensure a default `Избранное` list exists, then mirror their rows
-- into list_items.
-- ---------------------------------------------------------------------------
do $$
declare
  legacy_users_have_favorites boolean;
  legacy_users_have_fav_units boolean;
begin
  -- Probe whether the legacy tables exist + have rows. Necessary because
  -- this migration is idempotent — on a fresh project the tables are gone
  -- already from a successful previous run.
  select exists (select 1 from information_schema.tables
                  where table_schema = 'public' and table_name = 'favorites')
    into legacy_users_have_favorites;
  select exists (select 1 from information_schema.tables
                  where table_schema = 'public' and table_name = 'fav_units')
    into legacy_users_have_fav_units;

  if not legacy_users_have_favorites and not legacy_users_have_fav_units then
    raise notice 'No legacy favorites tables to backfill from; skipping data step';
    return;
  end if;

  -- Create one Избранное per user with any legacy row.
  execute $sql$
    insert into public.lists (owner_user_id, name, visibility, is_default)
    select distinct owner_user_id, 'Избранное', 'private', true
    from (
      select user_id as owner_user_id from public.favorites
      union
      select user_id as owner_user_id from public.fav_units
    ) src
    on conflict do nothing
  $sql$;

  -- Mirror project favorites → list_items (unit_id is null).
  execute $sql$
    insert into public.list_items (list_id, project_id, unit_id, position)
    select l.id, f.project_id, null, 0
    from public.favorites f
    join public.lists l on l.owner_user_id = f.user_id and l.is_default
    on conflict do nothing
  $sql$;

  -- Mirror unit favorites → list_items (unit_id is set).
  execute $sql$
    insert into public.list_items (list_id, project_id, unit_id, position)
    select l.id, fu.project_id, fu.unit_id, 0
    from public.fav_units fu
    join public.lists l on l.owner_user_id = fu.user_id and l.is_default
    on conflict do nothing
  $sql$;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Update handle_new_user() to also create Избранное for new signups.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, user_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));

  insert into public.lists (owner_user_id, name, visibility, is_default)
  values (new.id, 'Избранное', 'private', true)
  on conflict do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Replace capture_price_snapshots() to traverse list_items.
--
-- The "watched" set now comes from:
--   - price_alerts (still scoped per-(project, unit?) until migration 0005
--     re-keys them to list_id)
--   - list_items belonging to any user's list (project-scoped expands to
--     all units in the project; unit-scoped points at that unit)
-- ---------------------------------------------------------------------------
create or replace function public.capture_price_snapshots()
returns integer
language plpgsql security definer set search_path = public as $$
declare
  inserted integer;
begin
  with watched as (
    -- unit-scoped alerts (legacy schema until 0005)
    select pa.project_id, pa.unit_id
      from public.price_alerts pa
     where pa.active and pa.unit_id is not null
    union
    -- project-scoped alerts → expand to every unit
    select u.project_id, u.id as unit_id
      from public.price_alerts pa
      join public.units u on u.project_id = pa.project_id
     where pa.active and pa.unit_id is null
    union
    -- unit-scoped list items
    select li.project_id, li.unit_id
      from public.list_items li
     where li.unit_id is not null
    union
    -- project-scoped list items → expand to every unit
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

-- ---------------------------------------------------------------------------
-- 5. RLS on the new tables.
-- ---------------------------------------------------------------------------
alter table public.lists              enable row level security;
alter table public.list_items         enable row level security;
alter table public.list_followers     enable row level security;
alter table public.list_collaborators enable row level security;
alter table public.list_comments      enable row level security;

-- lists: owners read+write own; collaborators read; followers read; public
-- visibility readable by anyone.
drop policy if exists lists_select on public.lists;
create policy lists_select on public.lists for select using (
  auth.uid() = owner_user_id
  or visibility = 'public'
  or exists (
    select 1 from public.list_collaborators c
     where c.list_id = lists.id and c.user_id = auth.uid()
  )
  or exists (
    select 1 from public.list_followers f
     where f.list_id = lists.id and f.follower_user_id = auth.uid()
  )
);

drop policy if exists lists_insert on public.lists;
create policy lists_insert on public.lists for insert
  with check (auth.uid() = owner_user_id);

drop policy if exists lists_update on public.lists;
create policy lists_update on public.lists for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists lists_delete on public.lists;
create policy lists_delete on public.lists for delete
  using (auth.uid() = owner_user_id and not is_default);

-- list_items: visibility mirrors the parent list. Owners + editors write;
-- followers + viewers + public visitors read.
drop policy if exists list_items_select on public.list_items;
create policy list_items_select on public.list_items for select using (
  exists (
    select 1 from public.lists l
     where l.id = list_items.list_id
       and (
         l.owner_user_id = auth.uid()
         or l.visibility = 'public'
         or exists (
           select 1 from public.list_collaborators c
            where c.list_id = l.id and c.user_id = auth.uid()
         )
         or exists (
           select 1 from public.list_followers f
            where f.list_id = l.id and f.follower_user_id = auth.uid()
         )
       )
  )
);

drop policy if exists list_items_write on public.list_items;
create policy list_items_write on public.list_items for all using (
  exists (
    select 1 from public.lists l
     where l.id = list_items.list_id
       and (
         l.owner_user_id = auth.uid()
         or exists (
           select 1 from public.list_collaborators c
            where c.list_id = l.id and c.user_id = auth.uid() and c.role = 'editor'
         )
       )
  )
) with check (
  exists (
    select 1 from public.lists l
     where l.id = list_items.list_id
       and (
         l.owner_user_id = auth.uid()
         or exists (
           select 1 from public.list_collaborators c
            where c.list_id = l.id and c.user_id = auth.uid() and c.role = 'editor'
         )
       )
  )
);

-- list_followers: the follower row is owned by the follower; readable also
-- by the list owner so they can see who follows them.
drop policy if exists list_followers_select on public.list_followers;
create policy list_followers_select on public.list_followers for select using (
  auth.uid() = follower_user_id
  or exists (
    select 1 from public.lists l
     where l.id = list_followers.list_id and l.owner_user_id = auth.uid()
  )
);

drop policy if exists list_followers_write on public.list_followers;
create policy list_followers_write on public.list_followers for all
  using (auth.uid() = follower_user_id)
  with check (auth.uid() = follower_user_id);

-- list_collaborators: managed by the list owner.
drop policy if exists list_collaborators_select on public.list_collaborators;
create policy list_collaborators_select on public.list_collaborators for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.lists l
     where l.id = list_collaborators.list_id and l.owner_user_id = auth.uid()
  )
);

drop policy if exists list_collaborators_write on public.list_collaborators;
create policy list_collaborators_write on public.list_collaborators for all
  using (
    exists (
      select 1 from public.lists l
       where l.id = list_collaborators.list_id and l.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lists l
       where l.id = list_collaborators.list_id and l.owner_user_id = auth.uid()
    )
  );

-- list_comments: read mirrors list visibility; write requires owner or
-- collaborator (any role).
drop policy if exists list_comments_select on public.list_comments;
create policy list_comments_select on public.list_comments for select using (
  exists (
    select 1 from public.lists l
     where l.id = list_comments.list_id
       and (
         l.owner_user_id = auth.uid()
         or l.visibility = 'public'
         or exists (
           select 1 from public.list_collaborators c
            where c.list_id = l.id and c.user_id = auth.uid()
         )
         or exists (
           select 1 from public.list_followers f
            where f.list_id = l.id and f.follower_user_id = auth.uid()
         )
       )
  )
);

drop policy if exists list_comments_insert on public.list_comments;
create policy list_comments_insert on public.list_comments for insert
  with check (
    auth.uid() = author_user_id
    and exists (
      select 1 from public.lists l
       where l.id = list_comments.list_id
         and (
           l.owner_user_id = auth.uid()
           or exists (
             select 1 from public.list_collaborators c
              where c.list_id = l.id and c.user_id = auth.uid()
           )
         )
    )
  );

drop policy if exists list_comments_delete on public.list_comments;
create policy list_comments_delete on public.list_comments for delete using (
  auth.uid() = author_user_id
  or exists (
    select 1 from public.lists l
     where l.id = list_comments.list_id and l.owner_user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- 6. Drop the legacy favorites tables. RPC and policies referencing them
--    were already removed/replaced above.
-- ---------------------------------------------------------------------------
drop table if exists public.fav_units;
drop table if exists public.favorites;
