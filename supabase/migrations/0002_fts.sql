-- Full-text search on projects (Phase 14).
--
-- The seed-data fallback in `useProjects` keeps using String.includes for
-- local dev (no Postgres). This migration kicks in once Supabase is
-- configured and applied to a real project. Russian dictionary support is
-- bundled with Postgres; the GIN index makes `?q=ялта` and similar queries
-- O(log n) instead of full-table scans.

-- 1. Generated tsvector column. Combines name + developer + city + district
--    so a single query hits every meaningful text axis. Weights bias matches
--    toward more identifying fields (name > developer > city > district).
alter table public.projects
  add column if not exists search_vector tsvector
    generated always as (
      setweight(to_tsvector('russian', coalesce(name, '')),      'A')
      || setweight(to_tsvector('russian', coalesce(developer, '')), 'B')
      || setweight(to_tsvector('russian', coalesce(city, '')),      'C')
      || setweight(to_tsvector('russian', coalesce(district, '')),  'D')
    ) stored;

-- 2. GIN index on the generated column.
create index if not exists projects_search_vector_idx
  on public.projects using gin (search_vector);

-- 3. RPC. Returns the full Project row set so the data-access layer can
--    keep its `projectFromRow` mapper. `query` is parsed as a `tsquery`
--    via `plainto_tsquery` — handles user input like "ялта 1к" safely
--    without escaping.
create or replace function public.search_projects(query text)
returns setof public.projects
language sql
stable
as $$
  select *
  from public.projects
  where search_vector @@ plainto_tsquery('russian', query)
  order by ts_rank_cd(search_vector, plainto_tsquery('russian', query)) desc,
           id asc;
$$;

-- 4. Allow anonymous and authenticated roles to call the RPC. The RPC
--    returns rows from `projects`, which already has a public-read RLS
--    policy, so no new policy is required.
grant execute on function public.search_projects(text) to anon, authenticated;
