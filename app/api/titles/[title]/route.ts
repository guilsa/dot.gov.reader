import { NextResponse } from 'next/server';
import { loadTitleStructure, titleFixtureExists } from '@/lib/fixtures/loader';

export const dynamic = 'force-static';

interface RouteContext {
  params: Promise<{ title: string }>;
}

/**
 * GET /api/titles/[title]
 * Returns the structure for a specific CFR title
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { title: titleParam } = await context.params;
    const titleNumber = parseInt(titleParam, 10);

    // Validate title number
    if (isNaN(titleNumber) || titleNumber < 1 || titleNumber > 50) {
      return NextResponse.json(
        {
          error: 'Invalid title number',
          message: 'Title number must be between 1 and 50',
        },
        { status: 400 }
      );
    }

    // Check if fixture exists
    const exists = await titleFixtureExists(titleNumber);
    if (!exists) {
      return NextResponse.json(
        {
          error: 'Title not found',
          message: `No fixture data available for Title ${titleNumber}. Run the download script first: pnpm tsx scripts/download-title.ts ${titleNumber}`,
        },
        { status: 404 }
      );
    }

    // Load and return the structure
    const structure = await loadTitleStructure(titleNumber);

    return NextResponse.json(structure, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error loading title structure:', error);

    return NextResponse.json(
      {
        error: 'Failed to load title structure',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
