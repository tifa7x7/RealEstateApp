'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/layout/ThemeProvider';
import {
  CLASS_COLOR_VARS,
  STATUS_COLOR_VARS,
  UNIT_STATUS_COLOR_VARS,
} from '@/lib/constants';
import type { ProjectClass, ProjectStatus, UnitStatus } from '@/lib/types';

/**
 * Resolved (hex / rgb) chart colors for the current theme.
 *
 * Why this hook exists: SVG `fill` attributes (Recharts axes, ticks, bars,
 * lines) do not interpolate CSS custom properties. Hardcoding hex in chart
 * files violates CLAUDE.md and breaks under theme switches. This hook
 * resolves the CSS variables on every theme change and returns a typed
 * palette object that charts subscribe to.
 *
 * On the server (no `window`) the hook returns the dark-theme defaults so
 * SSR markup matches the initial `data-theme="dark"` attribute on `<html>`.
 */
export interface ChartColors {
  grid: string;
  tick: string;
  axis: string;
  accent: string;
  secondary: string;
  warning: string;
  premium: string;
  danger: string;
  status: Record<ProjectStatus, string>;
  class: Record<ProjectClass, string>;
  unit: Record<UnitStatus, string>;
}

const DARK_DEFAULTS: ChartColors = {
  grid: '#1f2937',
  tick: '#8893a7',
  axis: '#5a6478',
  accent: '#00d4aa',
  secondary: '#3b82f6',
  warning: '#f59e0b',
  premium: '#a855f7',
  danger: '#ef4444',
  status: {
    'Проектируется': '#3b82f6',
    'Строится': '#f59e0b',
    'Ввод в эксплуатацию': '#a855f7',
    'Сдан': '#00d4aa',
  },
  class: {
    'Эконом': '#8893a7',
    'Комфорт': '#3b82f6',
    'Бизнес': '#f59e0b',
    'Премиум': '#a855f7',
  },
  unit: {
    'в продаже': '#00d4aa',
    'бронь': '#f59e0b',
    'продано': '#ef4444',
  },
};

function readVar(name: string): string {
  if (typeof window === 'undefined') return '';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value;
}

function resolveColors(): ChartColors {
  if (typeof window === 'undefined') return DARK_DEFAULTS;

  const status = {} as Record<ProjectStatus, string>;
  for (const key in STATUS_COLOR_VARS) {
    const k = key as ProjectStatus;
    status[k] = readVar(STATUS_COLOR_VARS[k]) || DARK_DEFAULTS.status[k];
  }

  const klass = {} as Record<ProjectClass, string>;
  for (const key in CLASS_COLOR_VARS) {
    const k = key as ProjectClass;
    klass[k] = readVar(CLASS_COLOR_VARS[k]) || DARK_DEFAULTS.class[k];
  }

  const unit = {} as Record<UnitStatus, string>;
  for (const key in UNIT_STATUS_COLOR_VARS) {
    const k = key as UnitStatus;
    unit[k] = readVar(UNIT_STATUS_COLOR_VARS[k]) || DARK_DEFAULTS.unit[k];
  }

  return {
    grid: readVar('--border') || DARK_DEFAULTS.grid,
    tick: readVar('--text-dim') || DARK_DEFAULTS.tick,
    axis: readVar('--text-muted') || DARK_DEFAULTS.axis,
    accent: readVar('--accent') || DARK_DEFAULTS.accent,
    secondary: readVar('--secondary') || DARK_DEFAULTS.secondary,
    warning: readVar('--warning') || DARK_DEFAULTS.warning,
    premium: readVar('--premium') || DARK_DEFAULTS.premium,
    danger: readVar('--danger') || DARK_DEFAULTS.danger,
    status,
    class: klass,
    unit,
  };
}

export function useChartColors(): ChartColors {
  const { theme } = useTheme();
  const [colors, setColors] = useState<ChartColors>(DARK_DEFAULTS);

  useEffect(() => {
    setColors(resolveColors());
  }, [theme]);

  return colors;
}
