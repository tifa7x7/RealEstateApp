import type { ReactNode } from 'react';
import { ProductShell } from '@/components/layout/ProductShell';

/**
 * Phase 18 — wraps all `(product)` routes in the product shell. Default
 * chrome is `'top'` (existing Header + MobileNav). Switch to `'rail'`
 * when CLAUDE.md's 6-7 surface threshold trips.
 */
export default function ProductGroupLayout({ children }: { children: ReactNode }) {
  return <ProductShell chrome="top">{children}</ProductShell>;
}
