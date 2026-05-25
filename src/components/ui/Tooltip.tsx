'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'auto';

export interface TooltipProps {
  content: ReactNode;
  /** Default 'auto' — flips to bottom if there's no room above the trigger. */
  placement?: TooltipPlacement;
  /** Hover delay before showing, ms. Default 300. */
  delay?: number;
  /** Max width of the tooltip body in px. Default 260. */
  maxWidth?: number;
  /** Trigger element. Receives hover/focus listeners via a wrapper span. */
  children: ReactNode;
  /** Extra classes on the wrapping span. */
  className?: string;
  /** Force-disable the tooltip (e.g., on touch devices). */
  disabled?: boolean;
}

/**
 * Lightweight tooltip primitive. No external positioning library — uses
 * `position: absolute` relative to the trigger wrapper plus a one-shot
 * viewport check to flip top/bottom on open. Sufficient for short hint text
 * on form labels, confidence badges, and similar inline triggers.
 *
 * Works on hover AND focus (keyboard-accessible). Dismisses on Esc.
 */
export function Tooltip({
  content,
  placement = 'auto',
  delay = 300,
  maxWidth = 260,
  children,
  className = '',
  disabled = false,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [resolvedPlacement, setResolvedPlacement] = useState<'top' | 'bottom'>(
    placement === 'bottom' ? 'bottom' : 'top',
  );
  const triggerRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | null>(null);

  const clearShowTimer = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  }, []);

  const handleShow = useCallback(() => {
    if (disabled) return;
    clearShowTimer();
    showTimer.current = window.setTimeout(() => {
      setOpen(true);
      if (placement === 'auto' && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        // Estimate tooltip height (~40px for one line, more for wrapped text);
        // 80 is a safe upper bound that catches most cases.
        const wouldOverflowTop = rect.top < 80;
        setResolvedPlacement(wouldOverflowTop ? 'bottom' : 'top');
      }
    }, delay);
  }, [clearShowTimer, delay, disabled, placement]);

  const handleHide = useCallback(() => {
    clearShowTimer();
    setOpen(false);
  }, [clearShowTimer]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleHide();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleHide]);

  useEffect(() => clearShowTimer, [clearShowTimer]);

  const positionCls =
    resolvedPlacement === 'bottom'
      ? 'top-full mt-2'
      : 'bottom-full mb-2';

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className}`.trim()}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && !disabled && (
        <span
          role="tooltip"
          id={id}
          className={
            `${positionCls} left-1/2 -translate-x-1/2 absolute px-3 py-2 rounded text-[12px] leading-snug z-50 ` +
            `shadow-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] pointer-events-none`
          }
          style={{ maxWidth, whiteSpace: 'normal' }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
