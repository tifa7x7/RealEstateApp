'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Globe, Link2, Lock } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useLists } from '@/hooks/useLists';
import { useTranslations } from '@/hooks/useTranslations';
import type { ListVisibility } from '@/lib/api/lists';

export interface CreateListDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful create with the new list's id. */
  onCreated?: (listId: string) => void;
}

const VISIBILITY_OPTIONS: ReadonlyArray<{
  value: ListVisibility;
  labelKey: 'visibilityPrivate' | 'visibilityUnlisted' | 'visibilityPublic';
  icon: typeof Lock;
}> = [
  { value: 'private', labelKey: 'visibilityPrivate', icon: Lock },
  { value: 'unlisted', labelKey: 'visibilityUnlisted', icon: Link2 },
  { value: 'public', labelKey: 'visibilityPublic', icon: Globe },
];

/**
 * Phase 17 — modal for creating a new named list. Assumes the caller has
 * already tier-gated the entry point (Free users hit the `UpgradePrompt`
 * before this dialog opens). The visibility radio still flags Pro-only
 * options for documentation; in practice this whole dialog is Pro-only.
 */
export function CreateListDialog({ open, onClose, onCreated }: CreateListDialogProps) {
  const t = useTranslations();
  const { createList } = useLists();
  const toast = useToast();
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<ListVisibility>('private');
  const [submitting, setSubmitting] = useState(false);

  // Reset form whenever the modal opens.
  useEffect(() => {
    if (open) {
      setName('');
      setVisibility('private');
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const result = await createList({ name: name.trim(), visibility });
    setSubmitting(false);
    if (result.ok) {
      toast.success(t.lists.saveSuccess);
      onCreated?.(result.list.id);
      onClose();
    } else if (result.reason === 'save-failed') {
      toast.error(t.alerts.saveFailed);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t.lists.createTitle} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-[13px] text-[var(--text-dim)] leading-relaxed">
          {t.lists.createSubtitle}
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="list-name" className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
            {t.lists.namePlaceholder}
          </label>
          <Input
            id="list-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.lists.namePlaceholder}
            maxLength={80}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
            {t.lists.visibilityLabel}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {VISIBILITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = visibility === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisibility(opt.value)}
                  aria-pressed={selected}
                  className={
                    'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-[12px] font-medium transition-colors ' +
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
                    (selected
                      ? 'border-[var(--accent)] bg-[var(--accent-surface)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]/40 ')
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{t.lists[opt.labelKey]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            {t.lists.cancel}
          </Button>
          <Button variant="primary" type="submit" disabled={submitting || !name.trim()}>
            {t.lists.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
