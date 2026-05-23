import { type HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  elevated?: boolean;
  interactive?: boolean;
}

const BASE_CLASSES = 'rounded-lg border border-[var(--border)] text-[var(--text)]';
const INTERACTIVE_CLASSES =
  'transition-colors hover:border-[var(--accent)]/40 focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padded = true, elevated = false, interactive = false, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`${BASE_CLASSES} ${padded ? 'p-4' : ''} ${interactive ? INTERACTIVE_CLASSES : ''} ${className}`
        .replace(/\s+/g, ' ')
        .trim()}
      style={{
        background: elevated ? 'var(--bg-elevated)' : 'var(--bg-card)',
        ...style,
      }}
      {...props}
    />
  ),
);

Card.displayName = 'Card';
