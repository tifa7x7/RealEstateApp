'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Не удалось загрузить проект"
      description="Возможно, ссылка устарела или проект был удалён. Попробуйте обновить страницу."
      error={error}
      reset={reset}
    />
  );
}
