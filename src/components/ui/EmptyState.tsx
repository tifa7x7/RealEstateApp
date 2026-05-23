import type { LucideIcon } from 'lucide-react';
import { Button, type ButtonVariant } from './Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`.trim()}
    >
      {Icon && (
        <Icon
          size={44}
          aria-hidden="true"
          className="mb-3 text-[var(--text-muted)]"
        />
      )}
      <h3 className="text-[15px] font-semibold text-[var(--text)] mb-1">{title}</h3>
      {description && (
        <p className="text-[13px] text-[var(--text-dim)] mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <Button variant={action.variant ?? 'primary'} size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
