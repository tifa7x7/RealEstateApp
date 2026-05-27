import type { ReactNode } from 'react';
import { MarketingShell } from '@/components/layout/MarketingShell';

/**
 * Phase 18 — wraps all `(marketing)` routes in the marketing shell.
 * The route group `(marketing)` itself doesn't appear in the URL.
 */
export default function MarketingGroupLayout({ children }: { children: ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
