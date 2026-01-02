import { loadAgencies, loadTitlesSummary, loadTitleStructure } from '@/lib/fixtures/loader';
import { analyzeWordCount } from '@/lib/analysis/word-count';
import { analyzeAgencyStats } from '@/lib/analysis/agency-stats';
import { StatsCard } from './_components/StatsCard';
import { WordCountTable } from './_components/WordCountTable';
import { AgencyStatsTable } from './_components/AgencyStatsTable';

export default async function DashboardPage() {
  // Load data server-side
  const agencies = await loadAgencies();
  const titles = await loadTitlesSummary();

  // Analyze Title 17 (our sample title)
  let wordCountAnalysis;
  let hasTitle17 = false;
  try {
    const title17Structure = await loadTitleStructure(17);
    wordCountAnalysis = analyzeWordCount(title17Structure);
    hasTitle17 = true;
  } catch {
    // Title 17 not available
    wordCountAnalysis = null;
  }

  // Analyze agency statistics
  const agencyStats = analyzeAgencyStats(agencies, titles);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Agencies"
            value={agencyStats.totalAgencies}
            description="Top-level federal agencies"
          />
          <StatsCard
            title="Agencies with CFR References"
            value={agencyStats.agenciesWithReferences}
            description="Including sub-agencies"
          />
          <StatsCard
            title="Total CFR Titles"
            value={agencyStats.totalTitles}
            description="50 titles in the Code of Federal Regulations"
          />
          <StatsCard
            title="Avg Titles per Agency"
            value={agencyStats.averageTitlesPerAgency.toFixed(1)}
            description="Mean title references"
          />
        </div>
      </section>

      {/* Title 17 Word Count Analysis */}
      {hasTitle17 && wordCountAnalysis && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Title 17 Analysis - Commodity and Securities Exchanges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title="Total Elements"
              value={wordCountAnalysis.totalElements.toLocaleString()}
              description="Structural components"
            />
            <StatsCard
              title="Total Words"
              value={wordCountAnalysis.totalWords.toLocaleString()}
              description="Across all sections"
            />
            <StatsCard
              title="Total Characters"
              value={wordCountAnalysis.totalCharacters.toLocaleString()}
              description="Character count"
            />
          </div>
          <WordCountTable hierarchyData={wordCountAnalysis.byHierarchy} />
        </section>
      )}

      {/* Agency Statistics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Agency Statistics
        </h2>
        <AgencyStatsTable agencies={agencyStats.topAgencies} limit={10} />
      </section>

      {/* Title Distribution */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Title Distribution
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Titles by Agency Count (Top 10)
          </h3>
          <div className="space-y-3">
            {agencyStats.titleDistribution.slice(0, 10).map((dist) => (
              <div key={dist.titleNumber} className="flex items-center">
                <div className="flex-shrink-0 w-16">
                  <span className="text-sm font-medium text-gray-900">
                    Title {dist.titleNumber}
                  </span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(dist.agencyCount / Math.max(...agencyStats.titleDistribution.map(d => d.agencyCount))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-sm text-gray-600">
                    {dist.agencyCount} {dist.agencyCount === 1 ? 'agency' : 'agencies'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Source Info */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Data Source
        </h3>
        <p className="text-sm text-blue-800">
          Data sourced from the{' '}
          <a
            href="https://www.ecfr.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-900"
          >
            Electronic Code of Federal Regulations (eCFR)
          </a>
          . Last updated from fixtures. To refresh data, run the download scripts:
        </p>
        <div className="mt-3 space-y-1 text-xs font-mono text-blue-700">
          <div>• pnpm tsx scripts/download-agencies.ts</div>
          <div>• pnpm tsx scripts/download-titles-summary.ts</div>
          <div>• pnpm tsx scripts/download-title.ts [title-number]</div>
        </div>
      </section>
    </div>
  );
}
