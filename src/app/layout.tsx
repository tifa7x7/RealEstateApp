import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Playfair_Display } from 'next/font/google';

import { LocaleHtmlLang } from '@/components/layout/LocaleHtmlLang';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SupabaseSync } from '@/components/providers/SupabaseSync';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { SITE_URL, buildMetadata } from '@/lib/seo';

import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({
    title: 'Найди квартиру и просчитай инвестицию',
    path: '/',
  }),
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

/**
 * Phase 18 — root layout is now neutral: providers, fonts, theme
 * bootstrap script, and the skip link only. Surface chrome (Header,
 * Footer, MobileNav, CompareLauncher) lives in `MarketingShell` /
 * `ProductShell`, mounted by the route-group layouts
 * (`app/(marketing)/layout.tsx` and `app/(product)/layout.tsx`).
 *
 * The theme bootstrap script sets `data-theme` on `<html>` before paint.
 * The `data-surface` attribute is set client-side by whichever shell
 * mounts first (see MarketingShell + ProductShell useEffects). Marketing
 * surfaces force light via the CSS selector in `globals.css` regardless
 * of the user's saved `data-theme`.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      data-theme="dark"
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-3 focus:py-2 focus:rounded-md focus:bg-[var(--accent)] focus:text-[var(--bg)] focus:font-medium focus:text-[13px] focus-visible:outline-none"
        >
          Перейти к содержимому
        </a>
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <LocaleHtmlLang />
              <SupabaseSync />
              {children}
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
