'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type ArrayFilterKey = 'cities' | 'statuses' | 'classes' | 'types';
export type RangeFilterKey = 'priceRange' | 'sizeRange' | 'seaRange';

const RANGE_PARAM_PREFIX: Record<RangeFilterKey, string> = {
  priceRange: 'price',
  sizeRange: 'size',
  seaRange: 'sea',
};

export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const writeParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, searchParams],
  );

  const setSearch = useCallback(
    (q: string) => {
      writeParams((p) => {
        if (q.trim()) p.set('q', q.trim());
        else p.delete('q');
      });
    },
    [writeParams],
  );

  const setRegion = useCallback(
    (region: string) => {
      writeParams((p) => {
        if (region && region !== 'crimea') p.set('region', region);
        else p.delete('region');
        // Region change invalidates city selection
        p.delete('cities');
      });
    },
    [writeParams],
  );

  const toggleArrayFilter = useCallback(
    (key: ArrayFilterKey, value: string) => {
      writeParams((p) => {
        const current = (p.get(key) ?? '').split(',').filter(Boolean);
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        if (next.length > 0) p.set(key, next.join(','));
        else p.delete(key);
      });
    },
    [writeParams],
  );

  const setRange = useCallback(
    (key: RangeFilterKey, range: [number, number]) => {
      writeParams((p) => {
        const prefix = RANGE_PARAM_PREFIX[key];
        p.set(`${prefix}Min`, String(range[0]));
        p.set(`${prefix}Max`, String(range[1]));
      });
    },
    [writeParams],
  );

  const setSort = useCallback(
    (column: string, direction: 'asc' | 'desc') => {
      writeParams((p) => {
        p.set('sort', column);
        p.set('dir', direction);
      });
    },
    [writeParams],
  );

  const reset = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { setSearch, setRegion, toggleArrayFilter, setRange, setSort, reset };
}
