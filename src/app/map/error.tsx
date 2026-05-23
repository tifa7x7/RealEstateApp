'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Карта не загрузилась"
      description="Не удалось загрузить карту. Проверьте соединение и попробуйте ещё раз."
      error={error}
      reset={reset}
    />
  );
}
