'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';

/**
 * Returns true once Zustand-persist has rehydrated from localStorage.
 * Use to gate UI that depends on persisted state (auth, favorites) to avoid
 * a flash of default state before hydration completes.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  return hydrated;
}
