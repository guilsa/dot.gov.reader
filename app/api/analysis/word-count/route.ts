import { NextResponse } from 'next/server';
import { loadTitleStructure, loadTitlesSummary } from '@/lib/fixtures/loader';
import { analyzeWordCount } from '@/lib/analysis/word-count';

/**
 * GET /api/analysis/word-count?title=17
 * Analyzes word count for a specific CFR title
 * Query params:
 *   - title: Title number (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const titleParam = searchParams.get('title');

    if (!titleParam) {
      return NextResponse.json(
        {
          error: 'Missing title parameter',
          message: 'Please provide a title number: /api/analysis/word-count?title=17',
        },
        { status: 400 }
      );
    }

    const titleNumber = parseInt(titleParam, 10);

    if (isNaN(titleNumber) || titleNumber < 1 || titleNumber > 50) {
      return NextResponse.json(
        {
          error: 'Invalid title number',
          message: 'Title number must be between 1 and 50',
        },
        { status: 400 }
      );
    }

    // Load the title structure
    const structure = await loadTitleStructure(titleNumber);

    // Perform word count analysis
    const analysis = analyzeWordCount(structure);

    // Optionally add title name from summary
    try {
      const titles = await loadTitlesSummary();
      const titleInfo = titles.find((t) => t.number === titleNumber);
      if (titleInfo) {
        analysis.titleName = titleInfo.name;
      }
    } catch {
      // Ignore if we can't load the summary
    }

    return NextResponse.json(analysis, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error analyzing word count:', error);

    // Check if it's a fixture not found error
    if (
      error instanceof Error &&
      error.message.includes('Failed to load title')
    ) {
      return NextResponse.json(
        {
          error: 'Title data not available',
          message: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to analyze word count',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
