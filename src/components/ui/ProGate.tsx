'use client';

import { type ReactNode, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { UpgradePrompt } from './UpgradePrompt';
import { usePaywall, type ProFeature } from '@/hooks/usePaywall';

export interface ProGateProps {
  feature: ProFeature;
  title?: string;
  description?: string;
  children: ReactNode;
}

export function ProGate({
  feature,
  title = 'Эта функция в Pro',
  description = 'Обновите тариф, чтобы получить доступ.',
  children,
}: ProGateProps) {
  const { allowed } = usePaywall(feature);
  const [open, setOpen] = useState(false);

  if (allowed) return <>{children}</>;

  return (
    <>
      <Card>
        <div className="flex flex-col items-center justify-center text-center py-10 px-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg mb-3"
            style={{
              background: 'color-mix(in srgb, var(--premium) 15%, transparent)',
            }}
          >
            <Sparkles
              size={22}
              aria-hidden="true"
              className="text-[var(--premium)]"
            />
          </div>
          <h2 className="text-[15px] font-semibold mb-1">{title}</h2>
          <p className="text-[13px] text-[var(--text-dim)] max-w-md mb-4">
            {description}
          </p>
          <Button variant="primary" onClick={() => setOpen(true)}>
            Перейти на Pro
          </Button>
        </div>
      </Card>
      <UpgradePrompt
        open={open}
        onClose={() => setOpen(false)}
        description={description}
      />
    </>
  );
}
