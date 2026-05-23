'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PROJECTS } from '@/data/projects';
import {
  type ProjectSortColumn,
  type SortDirection,
  filterProjects,
  sortProjects,
} from '@/lib/filters';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { FilterState, Project, ProjectClass, ProjectStatus } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

const VALID_SORT_COLUMNS = new Set<ProjectSortColumn>([
  'name',
  'developer',
  'city',
  'status',
  'classType',
  'totalUnits',
  'pricePerSqm',
  'minPrice',
  'completion',
  'distSea',
  'floors',
  'buildings',
]);

const VALID_STATUSES = new Set<ProjectStatus>([
  'Проектируется',
  'Строится',
  'Ввод в эксплуатацию',
  'Сдан',
]);

const VALID_CLASSES = new Set<ProjectClass>([
  'Эконом',
  'Комфорт',
  'Бизнес',
  'Премиум',
]);

function parseSortColumn(value: string | null): ProjectSortColumn {
  if (value && VALID_SORT_COLUMNS.has(value as ProjectSortColumn)) {
    return value as ProjectSortColumn;
  }
  return 'name';
}

function parseSortDirection(value: string | null): SortDirection {
  return value === 'desc' ? 'desc' : 'asc';
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

function parseNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function fetchProjectsViaApi(): Promise<Project[]> {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error(`projects fetch failed: ${res.status}`);
  const json = (await res.json()) as { data: Project[] | null; error: string | null };
  if (!json.data) throw new Error(json.error ?? 'no data');
  return json.data;
}

export interface UseProjectsResult {
  projects: Project[];
  filters: FilterState;
  sort: { column: ProjectSortColumn; direction: SortDirection };
  totalCount: number;
}

export function useProjects(): UseProjectsResult {
  const searchParams = useSearchParams();
  const favorites = useAppStore((s) => s.favorites);
  const supabaseEnabled = isSupabaseConfigured();

  const { data: source = PROJECTS } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjectsViaApi,
    initialData: PROJECTS as Project[],
    staleTime: 5 * 60_000,
    enabled: supabaseEnabled,
  });

  return useMemo(() => {
    const filters: FilterState = {
      search: searchParams.get('q') ?? '',
      region: searchParams.get('region') ?? 'crimea',
      cities: parseList(searchParams.get('cities')),
      statuses: parseList(searchParams.get('statuses')).filter((s): s is ProjectStatus =>
        VALID_STATUSES.has(s as ProjectStatus),
      ),
      classes: parseList(searchParams.get('classes')).filter((c): c is ProjectClass =>
        VALID_CLASSES.has(c as ProjectClass),
      ),
      types: parseList(searchParams.get('types')),
      priceRange: [
        parseNumber(searchParams.get('priceMin'), 0),
        parseNumber(searchParams.get('priceMax'), Number.MAX_SAFE_INTEGER),
      ],
      sizeRange: [
        parseNumber(searchParams.get('sizeMin'), 0),
        parseNumber(searchParams.get('sizeMax'), Number.MAX_SAFE_INTEGER),
      ],
      seaRange: [
        parseNumber(searchParams.get('seaMin'), 0),
        parseNumber(searchParams.get('seaMax'), Number.MAX_SAFE_INTEGER),
      ],
    };

    const sort = {
      column: parseSortColumn(searchParams.get('sort')),
      direction: parseSortDirection(searchParams.get('dir')),
    };

    const filtered = filterProjects(source, filters);
    const sorted = sortProjects(filtered, sort, favorites);

    return { projects: sorted, filters, sort, totalCount: source.length };
  }, [searchParams, favorites, source]);
}
