# CrimeaDevTracker

Real-estate investment analytics for new-build apartments in Russia (starting with Crimea). Bloomberg-level analysis with zero learning curve — for everyday apartment seekers and casual investors, not professionals.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Zustand · React Query · Supabase · Recharts · Leaflet · Lucide icons.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or whichever port Next picks if 3000 is busy).

## Optional: enable Supabase backend

The app runs end-to-end on bundled seed data + localStorage without any backend. To turn on real persistence:

1. Copy `.env.example` to `.env.local` and fill in your Supabase URL + anon key.
2. Apply the schema: `supabase/migrations/0001_init.sql`.
3. Seed projects/units: `supabase/seed.sql` (regenerate via `npx tsx supabase/generate-seed.ts` if seed data changes).
4. Restart `npm run dev`.

Once configured, every data fetch routes through Supabase, and the first sign-in on a device migrates any local favorites / saved calculations / portfolio rows into the database.

## Build for production

```bash
npm run build
npm start
```

## Documentation

See [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for the full phase-by-phase plan, decision log, and carry-over list. See [`CLAUDE.md`](CLAUDE.md) for project conventions and architecture rules.

## License

Not yet licensed — all rights reserved.
