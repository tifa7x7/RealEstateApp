import { type HTMLAttributes, forwardRef } from 'react';

export type SkeletonRounded = 'sm' | 'md' | 'lg' | 'full';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: SkeletonRounded;
}

const ROUNDED_CLASSES: Record<SkeletonRounded, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height = '1rem', rounded = 'md', className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={`animate-pulse bg-[var(--bg-elevated)] ${ROUNDED_CLASSES[rounded]} ${className}`.trim()}
      style={{ width, height, ...style }}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';
