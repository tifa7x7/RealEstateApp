-- CrimeaDevTracker initial schema
-- Tables: projects, units, profiles, favorites, fav_units, saved_calculations, rental_properties
-- RLS: public read on projects/units; per-user read/write on user-owned tables.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id            integer primary key,
  name          text not null,
  developer     text not null,
  city          text not null,
  district      text not null,
  status        text not null check (status in ('Проектируется','Строится','Ввод в эксплуатацию','Сдан')),
  class_type    text not null check (class_type in ('Эконом','Комфорт','Бизнес','Премиум')),
  building_type text not null,
  buildings     integer not null,
  total_units   integer not null,
  size_min      numeric not null,
  size_max      numeric not null,
  floors        integer not null,
  price_per_sqm bigint  not null,
  min_price     bigint  not null,
  completion    text    not null,
  amenities     text[]  not null default '{}',
  dist_sea      numeric not null,
  lat           double precision not null,
  lng           double precision not null,
  date_added    date,
  data_confidence text check (data_confidence in ('verified','estimated','unverified')),
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists projects_city_idx        on public.projects (city);
create index if not exists projects_status_idx      on public.projects (status);
create index if not exists projects_class_type_idx  on public.projects (class_type);
create index if not exists projects_price_idx       on public.projects (min_price);

-- ---------------------------------------------------------------------------
-- units (composite PK: project_id + id, since unit ids like "А-1-01" are
-- only unique within their project)
-- ---------------------------------------------------------------------------
create table if not exists public.units (
  project_id integer not null references public.projects(id) on delete cascade,
  id         text    not null,
  building   text    not null,
  floor      integer not null,
  rooms      integer not null,
  area       numeric not null,
  price      bigint  not null,
  status     text    not null check (status in ('в продаже','бронь','продано')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, id)
);

create index if not exists units_status_idx on public.units (status);
create index if not exists units_rooms_idx  on public.units (rooms);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  user_name  text not null default '',
  tier       text not null default 'free' check (tier in ('free','pro')),
  locale     text not null default 'ru'   check (locale in ('ru','en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- favorites (user × project)
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  project_id integer not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

-- ---------------------------------------------------------------------------
-- fav_units (user × unit)
-- ---------------------------------------------------------------------------
create table if not exists public.fav_units (
  user_id    uuid    not null references auth.users(id) on delete cascade,
  project_id integer not null,
  unit_id    text    not null,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id, unit_id),
  foreign key (project_id, unit_id) references public.units(project_id, id) on delete cascade
);

create index if not exists fav_units_user_idx on public.fav_units (user_id);

-- ---------------------------------------------------------------------------
-- saved_calculations (full CalcObject[] payload stored as jsonb)
-- ---------------------------------------------------------------------------
create table if not exists public.saved_calculations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  label      text,
  objects    jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_calculations_user_created_idx
  on public.saved_calculations (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- rental_properties (portfolio entries)
-- ---------------------------------------------------------------------------
create table if not exists public.rental_properties (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text,
  type             text,
  purchase_price   bigint,
  current_value    bigint,
  monthly_rent     bigint,
  monthly_expenses bigint,
  purchase_date    date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists rental_properties_user_created_idx
  on public.rental_properties (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger function
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists units_set_updated_at on public.units;
create trigger units_set_updated_at
  before update on public.units
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists saved_calculations_set_updated_at on public.saved_calculations;
create trigger saved_calculations_set_updated_at
  before update on public.saved_calculations
  for each row execute function public.set_updated_at();

drop trigger if exists rental_properties_set_updated_at on public.rental_properties;
create trigger rental_properties_set_updated_at
  before update on public.rental_properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New-user signup: auto-create a profile row.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, user_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.projects           enable row level security;
alter table public.units              enable row level security;
alter table public.profiles           enable row level security;
alter table public.favorites          enable row level security;
alter table public.fav_units          enable row level security;
alter table public.saved_calculations enable row level security;
alter table public.rental_properties  enable row level security;

-- projects + units: public read, no public writes
drop policy if exists projects_select_all on public.projects;
create policy projects_select_all on public.projects for select using (true);

drop policy if exists units_select_all on public.units;
create policy units_select_all on public.units for select using (true);

-- profiles: each user can read/update only their own row
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select
  using (auth.uid() = id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert
  with check (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- favorites
drop policy if exists favorites_all_own on public.favorites;
create policy favorites_all_own on public.favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- fav_units
drop policy if exists fav_units_all_own on public.fav_units;
create policy fav_units_all_own on public.fav_units for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- saved_calculations
drop policy if exists saved_calculations_all_own on public.saved_calculations;
create policy saved_calculations_all_own on public.saved_calculations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- rental_properties
drop policy if exists rental_properties_all_own on public.rental_properties;
create policy rental_properties_all_own on public.rental_properties for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
