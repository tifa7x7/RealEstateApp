import { type NextRequest, NextResponse } from 'next/server';
import { fetchProjects, searchProjects } from '@/lib/api/projects';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const client = await getSupabaseServerClient();
    const q = req.nextUrl.searchParams.get('q')?.trim();

    if (q && client) {
      // Server-side full-text search via the `search_projects` RPC (Phase 14).
      // Returns null if the RPC errors — fall through to the full list, which
      // the client-side `filterProjects` will then narrow by `String.includes`.
      const matched = await searchProjects(client, q);
      if (matched !== null) {
        return NextResponse.json({ data: matched, error: null });
      }
    }

    const projects = await fetchProjects(client);
    return NextResponse.json({ data: projects, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 },
    );
  }
}
