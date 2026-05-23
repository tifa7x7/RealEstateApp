'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Не удалось загрузить аналитику"
      description="Что-то пошло не так при построении графиков. Попробуйте обновить страницу."
      error={error}
      reset={reset}
    />
  );
}
