'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';

type Mode = 'signin' | 'register';

export function AuthForm() {
  const t = useTranslations();
  const { supabaseEnabled, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setSubmitting(true);
    setError(null);
    try {
      const result =
        mode === 'register'
          ? await signUp(name.trim() || cleanEmail.split('@')[0] || 'User', cleanEmail, password)
          : await signIn(cleanEmail, password);

      if (!result.ok) {
        setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <h1
        className="text-[20px] font-semibold mb-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {mode === 'signin' ? t.auth.signIn : t.auth.register}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === 'register' && (
          <Input
            label={t.auth.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        )}
        <Input
          label={t.auth.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="email"
        />
        <Input
          label={t.auth.password}
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={supabaseEnabled}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />
        {error && (
          <div
            role="alert"
            className="text-[12px] text-[var(--danger)] -mt-1"
          >
            {error}
          </div>
        )}
        <Button type="submit" className="mt-1" disabled={submitting}>
          {mode === 'signin' ? t.auth.signIn : t.auth.register}
        </Button>
      </form>
      <div className="text-center text-[12px] text-[var(--text-dim)] mt-4">
        {t.auth.or}{' '}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'register' : 'signin');
            setError(null);
          }}
          className="text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {mode === 'signin' ? t.auth.register : t.auth.signIn}
        </button>
      </div>
    </Card>
  );
}
