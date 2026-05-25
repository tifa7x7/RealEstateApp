'use client';

import { type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type SheetSide = 'right' | 'bottom' | 'auto';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /**
   * Mount edge. `'auto'` picks `right` on `lg+` and `bottom` on smaller screens.
   * Default `'auto'`.
   */
  side?: SheetSide;
  /** Tailwind size class for the side dimension (width for right, height for bottom). */
  size?: string;
  className?: string;
  closeOnBackdrop?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Side-mounted or bottom-mounted panel. Replaces the centered-Modal pattern
 * for cases where a Modal feels obtrusive on mobile (filter, results,
 * comparison drawer). Focus-trapped, Esc-dismissable, body-scroll-locked.
 *
 * `side="auto"` is the default: renders as a bottom sheet on `<lg` and a
 * right-side drawer on `lg+`. Manual `side="right"` or `side="bottom"` forces
 * one or the other.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  side = 'auto',
  size,
  className = '',
  closeOnBackdrop = true,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const panel = panelRef.current;
    const initial = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (initial ?? panel)?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      const list = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  // Side-specific positioning. For `auto` we render both responsive variants
  // via Tailwind classes so the same panel adapts to viewport without a JS
  // measurement.
  const isRight = side === 'right';
  const isBottom = side === 'bottom';

  const containerCls =
    isRight
      ? 'fixed inset-y-0 right-0 flex'
      : isBottom
        ? 'fixed inset-x-0 bottom-0 flex flex-col justify-end'
        : // auto
          'fixed inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:inset-x-auto flex flex-col justify-end lg:flex-row';

  const panelSizeCls =
    isRight
      ? size ?? 'w-full max-w-md sm:max-w-lg h-full'
      : isBottom
        ? size ?? 'w-full max-h-[85vh]'
        : // auto
          `${size ?? 'w-full max-h-[85vh] lg:max-h-none lg:h-full lg:max-w-md xl:max-w-lg'}`;

  const radiusCls = isRight
    ? ''
    : isBottom
      ? 'rounded-t-2xl'
      : 'rounded-t-2xl lg:rounded-none';

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onMouseDown={closeOnBackdrop ? onClose : undefined}
      />
      <div className={`${containerCls} z-[201]`}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          className={
            `${panelSizeCls} ${radiusCls} overflow-auto shadow-2xl border border-[var(--border)] ` +
            `bg-[var(--bg-card)] text-[var(--text)] focus:outline-none ${className}`.trim()
          }
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            {title ? (
              <h2 id={titleId} className="font-semibold text-[15px]">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
