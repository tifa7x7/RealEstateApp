import { NextResponse } from 'next/server';
import { fetchProjects } from '@/lib/api/projects';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await getSupabaseServerClient();
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
