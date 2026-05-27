'use client';

import { type ReactNode, useEffect } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProductRail } from '@/components/layout/ProductRail';
import { CompareLauncher } from '@/components/product/projects/CompareLauncher';

export type ProductChrome = 'top' | 'rail';

export interface ProductShellProps {
  children: ReactNode;
  /**
   * Chrome variant. Default `'top'` reuses the existing horizontal Header
   * + bottom MobileNav (today's pattern). Switch to `'rail'` when the
   * product surface count grows past 6-7 (per CLAUDE.md surface model).
   * One-prop change — no behavior elsewhere depends on which is active.
   */
  chrome?: ProductChrome;
}

/**
 * Phase 18 — chrome for product surfaces (`/calculator`, `/map`,
 * `/analytics`, `/account/*`, `/lists/*`). Honors the user's theme
 * preference (dark default). Marks the surface with
 * `data-surface='product'` for any future surface-specific CSS.
 *
 * `chrome='top'` is today's layout: Header (horizontal nav), MobileNav
 * (bottom on `<md`), Footer, CompareLauncher floating launcher.
 *
 * `chrome='rail'` swaps the horizontal Header for `ProductRail` (narrow
 * icon-only left rail, Solgt-style). Built but not yet enabled by default.
 */
export function ProductShell({ children, chrome = 'top' }: ProductShellProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-surface', 'product');
    return () => {
      root.removeAttribute('data-surface');
    };
  }, []);

  if (chrome === 'rail') {
    return (
      <div className="flex min-h-screen">
        <ProductRail />
        <div className="flex-1 flex flex-col min-w-0">
          <main id="main-content" className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <CompareLauncher />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <CompareLauncher />
    </>
  );
}
