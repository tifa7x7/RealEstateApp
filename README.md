# RealEstateApp

Real-estate investment analytics for new-build apartments. Bloomberg-level analysis with zero learning curve — for everyday apartment seekers and casual investors, not professionals.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Zustand · React Query · Supabase · Recharts · Leaflet · Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or whichever port Next picks if 3000 is busy).

## Optional in dev, REQUIRED in production: enable Supabase backend

The app runs end-to-end on bundled seed data + localStorage stub auth in **dev** when Supabase env vars are absent. **Production builds hard-fail** at boot if these aren't configured — see `src/lib/supabase/env.ts`.

1. Copy `.env.example` to `.env.local` and fill in your Supabase URL + anon key.
2. Apply migrations in order:
   - `supabase/migrations/0001_init.sql` — schema + RLS + auto-profile trigger
   - `supabase/migrations/0002_fts.sql` — full-text search (Russian dictionary + GIN index + RPC)
3. Seed projects/units: `supabase/seed.sql` (regenerate via `npx tsx supabase/generate-seed.ts` if seed data changes).
4. Restart `npm run dev`.

Once configured, every data fetch routes through Supabase, the search box uses Postgres FTS, and the first sign-in on a device migrates any local favorites / saved calculations / portfolio rows into the database. `profiles.tier` becomes the canonical source for Pro vs Free.

## Billing (Phase 15 — pre-launch)

`/api/billing/checkout` and `/api/billing/webhook` ship as wired-up stubs. To enable real payments:

1. Pick a provider: YooKassa, CloudPayments, or ProductBoard.
2. Set `BILLING_PROVIDER`, `BILLING_API_KEY`, and `BILLING_WEBHOOK_SECRET` in `.env.local` / the deploy env.
3. Implement the provider integration in `src/app/api/billing/checkout/route.ts` (replace the 501 stub with the provider's SDK call) and `src/app/api/billing/webhook/route.ts` (`verifySignature` + `parseEvent`).
4. Test the upgrade flow via `UpgradePrompt` → checkout → webhook → `profiles.tier` update → `revalidatePath('/account/settings')`.

Without these, the `UpgradePrompt` button surfaces a friendly "оплата временно недоступна" toast and the user stays on Free.

## Build for production

```bash
npm run build
npm start
```

## Documentation

See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for the full phase-by-phase plan, decision log, and carry-over list. See [`CLAUDE.md`](CLAUDE.md) for project conventions and architecture rules.

## License

Not yet licensed — all rights reserved.
