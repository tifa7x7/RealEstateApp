'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Не удалось загрузить аккаунт"
      description="Возможно, проблема с подключением. Ваши данные сохранены — попробуйте ещё раз."
      error={error}
      reset={reset}
    />
  );
}
