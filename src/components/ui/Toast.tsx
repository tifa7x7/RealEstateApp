'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const VARIANT_COLOR: Record<ToastVariant, string> = {
  info: 'var(--secondary)',
  success: 'var(--accent)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
};

const VARIANT_ICON: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

/**
 * Presentational toast card. Position-agnostic: the consumer (typically
 * `ToastProvider`) is responsible for placement on the page. For one-off
 * direct use, pass `className="fixed bottom-4 right-4 z-[300]"` or similar.
 */
export function Toast({
  message,
  variant = 'info',
  duration = 3000,
  onClose,
  className = '',
}: ToastProps) {
  useEffect(() => {
    if (duration <= 0 || !onClose) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  const accent = VARIANT_COLOR[variant];
  const Icon = VARIANT_ICON[variant];
  const isUrgent = variant === 'error' || variant === 'warning';

  return (
    <div
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl ` +
        `text-[13px] bg-[var(--bg-card)] text-[var(--text)] ${className}`.trim()}
      style={{ border: `1px solid ${accent}` }}
    >
      <Icon size={16} style={{ color: accent, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="p-0.5 rounded hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
