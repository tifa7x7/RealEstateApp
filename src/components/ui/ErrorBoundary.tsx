'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export interface ErrorBoundaryProps {
  /** Title shown above the message. Defaults to a generic Russian string. */
  title?: string;
  /** Description shown below the title. Defaults to a generic Russian string. */
  description?: string;
  /** The error from Next.js's `error.tsx` boundary. */
  error: Error & { digest?: string };
  /** Resets the boundary. Forwarded from Next.js. */
  reset: () => void;
}

/**
 * Generic error boundary body for Next.js's `error.tsx` files. Surfaces the
 * error to the console in development so it's easier to debug.
 */
export function ErrorBoundary({
  title = 'Что-то пошло не так',
  description = 'Мы не смогли загрузить эту страницу. Попробуйте ещё раз — обычно помогает.',
  error,
  reset,
}: ErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error);
    }
  }, [error]);

  return (
    <div className="px-4 py-12 md:py-16 max-w-xl mx-auto">
      <Card>
        <div className="flex flex-col items-center text-center gap-3">
          <AlertTriangle
            size={44}
            aria-hidden="true"
            className="text-[var(--danger)]"
          />
          <h2 className="text-[18px] font-semibold">{title}</h2>
          <p className="text-[13px] text-[var(--text-dim)] max-w-md">
            {description}
          </p>
          {error.digest && (
            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              ID: {error.digest}
            </p>
          )}
          <Button onClick={reset} className="mt-2">
            Попробовать снова
          </Button>
        </div>
      </Card>
    </div>
  );
}
