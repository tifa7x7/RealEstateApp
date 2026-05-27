'use client';

import { type ReactNode, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export interface MarketingShellProps {
  children: ReactNode;
}

/**
 * Phase 18 — chrome for marketing surfaces (`/`, `/pricing`, `/products/*`,
 * `/applications/*`, `/blog/*`). Always renders in the light palette
 * regardless of the user's saved theme preference; the override is via
 * `:root[data-surface='marketing']` in globals.css.
 *
 * Currently reuses the existing `Header` + `Footer`. Phase 19 will swap
 * the marketing variant in (mega-menu with Products / Applications /
 * Pricing / Sign in / Try-for-free).
 */
export function MarketingShell({ children }: MarketingShellProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-surface', 'marketing');
    return () => {
      root.removeAttribute('data-surface');
    };
  }, []);

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
