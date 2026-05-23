/**
 * Public read-side data access for projects and units. Each function tries
 * Supabase first and falls back to the bundled seed (`src/data/projects.ts`)
 * when Supabase is unconfigured or the request fails.
 *
 * Intentionally framework-agnostic: no React, no Next.js. Server Components
 * call these directly; client components call them via the API routes in
 * `src/app/api/projects/`.
 */
import { PROJECTS } from '@/data/projects';
import type { Project, Unit } from '@/lib/types';
import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type UnitRow = Database['public']['Tables']['units']['Row'];

function projectFromRow(row: ProjectRow, units: Unit[]): Project {
  return {
    id: row.id,
    name: row.name,
    developer: row.developer,
    city: row.city,
    district: row.district,
    status: row.status,
    classType: row.class_type,
    buildingType: row.building_type,
    buildings: row.buildings,
    totalUnits: row.total_units,
    sizeMin: Number(row.size_min),
    sizeMax: Number(row.size_max),
    floors: row.floors,
    pricePerSqm: Number(row.price_per_sqm),
    minPrice: Number(row.min_price),
    completion: row.completion,
    amenities: row.amenities,
    distSea: Number(row.dist_sea),
    lat: Number(row.lat),
    lng: Number(row.lng),
    dateAdded: row.date_added ?? undefined,
    dataConfidence: row.data_confidence ?? undefined,
    description: row.description ?? undefined,
    units,
  };
}

function unitFromRow(row: UnitRow): Unit {
  return {
    id: row.id,
    building: row.building,
    floor: row.floor,
    rooms: row.rooms,
    area: Number(row.area),
    price: Number(row.price),
    status: row.status,
  };
}

/**
 * Returns all projects (with their units). When `client` is null or the call
 * fails, returns the bundled seed.
 */
export async function fetchProjects(
  client: AppSupabaseClient | null,
): Promise<Project[]> {
  if (!client) return PROJECTS;

  const [projectsRes, unitsRes] = await Promise.all([
    client.from('projects').select('*').order('id'),
    client.from('units').select('*'),
  ]);

  if (projectsRes.error || unitsRes.error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[fetchProjects] falling back to seed:',
        projectsRes.error ?? unitsRes.error,
      );
    }
    return PROJECTS;
  }

  const unitsByProject = new Map<number, Unit[]>();
  for (const row of unitsRes.data) {
    const list = unitsByProject.get(row.project_id) ?? [];
    list.push(unitFromRow(row));
    unitsByProject.set(row.project_id, list);
  }

  return projectsRes.data.map((row) =>
    projectFromRow(row, unitsByProject.get(row.id) ?? []),
  );
}

/**
 * Fetch a single project by id. Returns `null` if not found.
 */
export async function fetchProject(
  client: AppSupabaseClient | null,
  id: number,
): Promise<Project | null> {
  if (!client) {
    return PROJECTS.find((p) => p.id === id) ?? null;
  }

  const [projectRes, unitsRes] = await Promise.all([
    client.from('projects').select('*').eq('id', id).maybeSingle(),
    client.from('units').select('*').eq('project_id', id),
  ]);

  if (projectRes.error || unitsRes.error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[fetchProject] falling back to seed:',
        projectRes.error ?? unitsRes.error,
      );
    }
    return PROJECTS.find((p) => p.id === id) ?? null;
  }

  if (!projectRes.data) return null;
  return projectFromRow(projectRes.data, unitsRes.data.map(unitFromRow));
}
