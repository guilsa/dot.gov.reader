import { NextResponse } from 'next/server';
import { loadTitlesSummary } from '@/lib/fixtures/loader';

export const dynamic = 'force-static';

/**
 * GET /api/titles
 * Returns summary information for all CFR titles
 */
export async function GET() {
  try {
    const titles = await loadTitlesSummary();

    return NextResponse.json(titles, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error loading titles summary:', error);

    return NextResponse.json(
      {
        error: 'Failed to load titles summary',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
