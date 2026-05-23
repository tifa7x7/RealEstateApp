import type { FilterState, Project, ProjectClass, ProjectStatus } from './types';

export type SortDirection = 'asc' | 'desc';

export type ProjectSortColumn =
  | 'name'
  | 'developer'
  | 'city'
  | 'status'
  | 'classType'
  | 'totalUnits'
  | 'pricePerSqm'
  | 'minPrice'
  | 'completion'
  | 'distSea'
  | 'floors'
  | 'buildings';

export interface SortState {
  column: ProjectSortColumn;
  direction: SortDirection;
}

export interface FilterOptions {
  cities: string[];
  statuses: ProjectStatus[];
  classes: ProjectClass[];
  types: string[];
  amenities: string[];
  priceRange: [number, number];
  sizeRange: [number, number];
  seaRange: [number, number];
}

export interface MarketStats {
  count: number;
  totalUnits: number;
  avgPrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgSea: number;
  nearSea: number;
}

const CLASS_ORDER: readonly ProjectClass[] = ['Эконом', 'Комфорт', 'Бизнес', 'Премиум'];

export function getFilterOptions(projects: readonly Project[]): FilterOptions {
  if (projects.length === 0) {
    return {
      cities: [],
      statuses: [],
      classes: [...CLASS_ORDER],
      types: [],
      amenities: [],
      priceRange: [0, 0],
      sizeRange: [0, 0],
      seaRange: [0, 0],
    };
  }
  return {
    cities: [...new Set(projects.map((p) => p.city))].sort(),
    statuses: [...new Set(projects.map((p) => p.status))],
    classes: [...CLASS_ORDER],
    types: [...new Set(projects.map((p) => p.buildingType))].sort(),
    amenities: [...new Set(projects.flatMap((p) => p.amenities))].sort(),
    priceRange: [
      Math.min(...projects.map((p) => p.pricePerSqm)),
      Math.max(...projects.map((p) => p.pricePerSqm)),
    ],
    sizeRange: [
      Math.min(...projects.map((p) => p.sizeMin)),
      Math.max(...projects.map((p) => p.sizeMax)),
    ],
    seaRange: [0, Math.max(...projects.map((p) => p.distSea))],
  };
}

export function getMarketStats(projects: readonly Project[]): MarketStats {
  if (projects.length === 0) {
    return { count: 0, totalUnits: 0, avgPrice: 0, medianPrice: 0, minPrice: 0, maxPrice: 0, avgSea: 0, nearSea: 0 };
  }
  const prices = projects.map((p) => p.minPrice).sort((a, b) => a - b);
  return {
    count: projects.length,
    totalUnits: projects.reduce((s, p) => s + p.totalUnits, 0),
    avgPrice: Math.round(projects.reduce((s, p) => s + p.pricePerSqm, 0) / projects.length),
    medianPrice: prices[Math.floor(prices.length / 2)],
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgSea: +(projects.reduce((s, p) => s + p.distSea, 0) / projects.length).toFixed(1),
    nearSea: projects.filter((p) => p.distSea <= 1).length,
  };
}

export function getProjectById(projects: readonly Project[], id: number): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function filterProjects(projects: readonly Project[], filters: FilterState): Project[] {
  const search = filters.search.toLowerCase();
  return projects.filter((p) => {
    if (search) {
      const matches =
        p.name.toLowerCase().includes(search) ||
        p.developer.toLowerCase().includes(search) ||
        p.district.toLowerCase().includes(search) ||
        p.city.toLowerCase().includes(search);
      if (!matches) return false;
    }
    if (filters.cities.length && !filters.cities.includes(p.city)) return false;
    if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
    if (filters.classes.length && !filters.classes.includes(p.classType)) return false;
    if (filters.types.length && !filters.types.includes(p.buildingType)) return false;
    if (p.pricePerSqm < filters.priceRange[0] || p.pricePerSqm > filters.priceRange[1]) return false;
    if (p.distSea > filters.seaRange[1]) return false;
    return true;
  });
}

function compareValues(a: string | number, b: string | number, direction: SortDirection): number {
  if (a < b) return direction === 'asc' ? -1 : 1;
  if (a > b) return direction === 'asc' ? 1 : -1;
  return 0;
}

export function sortProjects(
  projects: readonly Project[],
  sort: SortState,
  favorites: readonly number[] = [],
): Project[] {
  const favSet = new Set(favorites);
  return [...projects].sort((a, b) => {
    const aFav = favSet.has(a.id) ? -1 : 0;
    const bFav = favSet.has(b.id) ? -1 : 0;
    if (aFav !== bFav) return aFav - bFav;
    const va = a[sort.column];
    const vb = b[sort.column];
    if (typeof va === 'string' && typeof vb === 'string') {
      return compareValues(va.toLowerCase(), vb.toLowerCase(), sort.direction);
    }
    return compareValues(va, vb, sort.direction);
  });
}
