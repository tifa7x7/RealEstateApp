'use client';

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface InViewportProps {
  children: ReactNode;
  /** Pre-load margin — IntersectionObserver `rootMargin`. Default '200px'. */
  rootMargin?: string;
  /** Render this until the children are scrolled into view. Default: nothing. */
  fallback?: ReactNode;
  /** Once true, stay true (don't unmount on scroll-out). Default true. */
  once?: boolean;
  className?: string;
}

/**
 * Defers rendering of `children` until the wrapper enters the viewport. Paired
 * with `next/dynamic`-imported heavy components, this means the JS for those
 * components only downloads when the user is about to see them.
 *
 * Used for analytics charts: a user who lands on `/analytics` and only views
 * the top chart never pays the bundle cost of the others.
 *
 * No SSR mismatch concerns: `children` are rendered after the effect fires
 * client-side. The placeholder (`fallback`) renders during SSR and the brief
 * initial CSR window.
 */
export function InViewport({
  children,
  rootMargin = '200px',
  fallback = null,
  once = true,
  className = '',
}: InViewportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      // No IO support — render eagerly. Acceptable fallback.
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
