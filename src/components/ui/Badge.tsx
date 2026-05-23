import { type HTMLAttributes, forwardRef } from 'react';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  size?: BadgeSize;
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-[12px]',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color, size = 'md', className = '', style, children, ...props }, ref) => {
    const c = color ?? 'var(--text-dim)';
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${SIZE_CLASSES[size]} ${className}`.trim()}
        style={{
          background: `color-mix(in srgb, ${c} 12%, transparent)`,
          color: c,
          border: `1px solid color-mix(in srgb, ${c} 25%, transparent)`,
          ...style,
        }}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
