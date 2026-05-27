'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Calculator,
  type LucideIcon,
  Map as MapIcon,
  Search,
  User,
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface MobileTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/search') {
    return pathname === '/search' || pathname.startsWith('/search/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const t = useTranslations();
  const pathname = usePathname();

  const tabs: readonly MobileTab[] = [
    { href: '/search', label: t.tabs.search, icon: Search },
    { href: '/map', label: t.tabs.map, icon: MapIcon },
    { href: '/analytics', label: t.tabs.analytics, icon: BarChart3 },
    { href: '/calculator', label: t.tabs.calculator, icon: Calculator },
    { href: '/account', label: t.auth.myAccount, icon: User },
  ];

  return (
    <nav
      aria-label="Мобильная навигация"
      className="no-print md:hidden fixed bottom-0 inset-x-0 z-[100] border-t border-[var(--border)] bg-[var(--bg)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={
                  'flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ' +
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-inset ' +
                  (active
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]')
                }
              >
                <Icon size={20} aria-hidden="true" />
                <span className="leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
