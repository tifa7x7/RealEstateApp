'use client';

import type { UserTier } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export type ProFeature =
  | 'multi-object'
  | 'comparison'
  | 'rankings'
  | 'forecast'
  | 'portfolio'
  | 'unlimited-favorites'
  | 'exports';

const PRO_FEATURES: ReadonlySet<string> = new Set<ProFeature>([
  'multi-object',
  'comparison',
  'rankings',
  'forecast',
  'portfolio',
  'unlimited-favorites',
  'exports',
]);

export interface PaywallResult {
  allowed: boolean;
  tier: UserTier;
  isPro: boolean;
}

export function usePaywall(feature: ProFeature): PaywallResult {
  const tier = useAppStore((s) => s.currentTier);
  const isPro = tier === 'pro';
  const allowed = isPro || !PRO_FEATURES.has(feature);
  return { allowed, tier, isPro };
}
