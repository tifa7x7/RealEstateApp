'use client';

import { useMemo } from 'react';
import { computeCalcResults } from '@/lib/calculator';
import type { CalcObject, CalcResults } from '@/lib/types';
import { MAX_CALC_OBJECTS, useAppStore } from '@/store/app-store';

export interface UseCalculatorResult {
  // Active object (single-object UI)
  object: CalcObject;
  setField: <K extends keyof CalcObject>(field: K, value: CalcObject[K]) => void;
  reset: () => void;
  prefillFromUnit: (projectId: number, unitId: string) => void;
  results: CalcResults;
  // Multi-object
  objects: CalcObject[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  addObject: () => void;
  removeObject: (index: number) => void;
  canAdd: boolean;
  canRemove: boolean;
  maxObjects: number;
  allResults: CalcResults[];
}

export function useCalculator(): UseCalculatorResult {
  const objects = useAppStore((s) => s.calcObjects);
  const activeIndex = useAppStore((s) => s.activeCalcIndex);
  const setField = useAppStore((s) => s.setCalcField);
  const reset = useAppStore((s) => s.resetCalc);
  const prefillFromUnit = useAppStore((s) => s.prefillCalcFromUnit);
  const addObject = useAppStore((s) => s.addCalcObject);
  const removeObject = useAppStore((s) => s.removeCalcObject);
  const setActiveIndex = useAppStore((s) => s.setActiveCalcIndex);

  const activeObject = objects[activeIndex] ?? objects[0];

  const results = useMemo(() => computeCalcResults(activeObject), [activeObject]);
  const allResults = useMemo(
    () => objects.map((o) => computeCalcResults(o)),
    [objects],
  );

  return {
    object: activeObject,
    setField,
    reset,
    prefillFromUnit,
    results,
    objects,
    activeIndex,
    setActiveIndex,
    addObject,
    removeObject,
    canAdd: objects.length < MAX_CALC_OBJECTS,
    canRemove: objects.length > 1,
    maxObjects: MAX_CALC_OBJECTS,
    allResults,
  };
}
