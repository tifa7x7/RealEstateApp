import { NextResponse } from 'next/server';
import { fetchProject } from '@/lib/api/projects';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json(
        { data: null, error: 'invalid id' },
        { status: 400 },
      );
    }
    const client = await getSupabaseServerClient();
    const project = await fetchProject(client, numericId);
    if (!project) {
      return NextResponse.json(
        { data: null, error: 'not found' },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: project, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json(
      { data: null, error: message },
      { status: 500 },
    );
  }
}
