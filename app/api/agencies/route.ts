import { NextResponse } from 'next/server';
import { loadAgencies } from '@/lib/fixtures/loader';

export const dynamic = 'force-static';

/**
 * GET /api/agencies
 * Returns all agencies with CFR references
 */
export async function GET() {
  try {
    const agencies = await loadAgencies();

    return NextResponse.json(agencies, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error loading agencies:', error);

    return NextResponse.json(
      {
        error: 'Failed to load agencies data',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
