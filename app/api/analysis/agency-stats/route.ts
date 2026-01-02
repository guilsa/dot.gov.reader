import { NextResponse } from 'next/server';
import { loadAgencies, loadTitlesSummary } from '@/lib/fixtures/loader';
import { analyzeAgencyStats } from '@/lib/analysis/agency-stats';

/**
 * GET /api/analysis/agency-stats
 * Analyzes statistics across all agencies and their CFR references
 */
export async function GET() {
  try {
    // Load agencies and titles
    const agencies = await loadAgencies();
    const titles = await loadTitlesSummary();

    // Perform agency statistics analysis
    const analysis = analyzeAgencyStats(agencies, titles);

    return NextResponse.json(analysis, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error analyzing agency stats:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze agency statistics',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
