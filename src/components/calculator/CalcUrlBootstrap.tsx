'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCalculator } from '@/hooks/useCalculator';

export function CalcUrlBootstrap() {
  const searchParams = useSearchParams();
  const { prefillFromUnit } = useCalculator();

  useEffect(() => {
    const projectId = searchParams.get('project');
    const unitId = searchParams.get('unit');
    if (projectId && unitId) {
      prefillFromUnit(Number(projectId), decodeURIComponent(unitId));
    }
  }, [searchParams, prefillFromUnit]);

  return null;
}
