import type { Agency, Title } from '@/lib/ecfr/types';
import type { AgencyStatsResult, AgencyStat, TitleDistribution } from './types';

/**
 * Processes an agency and its children to extract CFR references
 * @param agency Agency to process
 * @param results Map to store agency statistics
 */
function processAgency(
  agency: Agency,
  results: Map<string, AgencyStat>
): void {
  // Get unique titles this agency references
  const titles = new Set<number>();
  const chapters = new Set<string>();
  const parts = new Set<string>();

  if (agency.cfr_references) {
    for (const ref of agency.cfr_references) {
      titles.add(ref.title);
      if (ref.chapter) {
        chapters.add(`${ref.title}-${ref.chapter}`);
      }
      if (ref.part) {
        parts.add(`${ref.title}-${ref.part}`);
      }
    }
  }

  // Store agency stats
  if (titles.size > 0) {
    results.set(agency.slug, {
      name: agency.name,
      slug: agency.slug,
      shortName: agency.short_name,
      titleCount: titles.size,
      chapterCount: chapters.size,
      partCount: parts.size,
      titles: Array.from(titles).sort((a, b) => a - b),
    });
  }

  // Process children recursively
  if (agency.children && agency.children.length > 0) {
    for (const child of agency.children) {
      processAgency(child, results);
    }
  }
}

/**
 * Analyzes agency statistics from agencies and titles data
 * @param agencies Array of agencies
 * @param titles Array of titles (optional, for additional context)
 * @returns Agency statistics analysis
 */
export function analyzeAgencyStats(
  agencies: Agency[],
  titles?: Title[]
): AgencyStatsResult {
  const agencyStats = new Map<string, AgencyStat>();

  // Process all agencies and their children
  for (const agency of agencies) {
    processAgency(agency, agencyStats);
  }

  const allStats = Array.from(agencyStats.values());

  // Calculate totals
  const totalAgencies = agencies.length;
  const agenciesWithReferences = allStats.length;
  const totalTitles = titles ? titles.length : 50;

  // Calculate average titles per agency
  const totalTitleReferences = allStats.reduce(
    (sum, stat) => sum + stat.titleCount,
    0
  );
  const averageTitlesPerAgency =
    agenciesWithReferences > 0 ? totalTitleReferences / agenciesWithReferences : 0;

  // Get top 10 agencies by title count
  const topAgencies = [...allStats]
    .sort((a, b) => b.titleCount - a.titleCount)
    .slice(0, 10);

  // Calculate title distribution (which titles have the most agencies)
  const titleAgenciesMap = new Map<number, Set<string>>();

  for (const stat of allStats) {
    for (const titleNum of stat.titles) {
      if (!titleAgenciesMap.has(titleNum)) {
        titleAgenciesMap.set(titleNum, new Set());
      }
      titleAgenciesMap.get(titleNum)!.add(stat.slug);
    }
  }

  const titleDistribution: TitleDistribution[] = Array.from(
    titleAgenciesMap.entries()
  ).map(([titleNumber, agencySlugs]) => {
    const title = titles?.find((t) => t.number === titleNumber);
    return {
      titleNumber,
      titleName: title?.name || `Title ${titleNumber}`,
      agencyCount: agencySlugs.size,
      agencies: Array.from(agencySlugs),
    };
  });

  // Sort by agency count (descending)
  titleDistribution.sort((a, b) => b.agencyCount - a.agencyCount);

  return {
    totalAgencies,
    agenciesWithReferences,
    totalTitles,
    averageTitlesPerAgency,
    topAgencies,
    titleDistribution,
  };
}

/**
 * Gets statistics for a specific agency by slug
 * @param agencies Array of agencies
 * @param slug Agency slug
 * @returns Agency statistics or null if not found
 */
export function getAgencyBySlug(
  agencies: Agency[],
  slug: string
): AgencyStat | null {
  const results = new Map<string, AgencyStat>();

  for (const agency of agencies) {
    processAgency(agency, results);
  }

  return results.get(slug) || null;
}

/**
 * Gets all agencies that reference a specific title
 * @param agencies Array of agencies
 * @param titleNumber Title number to search for
 * @returns Array of agency statistics
 */
export function getAgenciesForTitle(
  agencies: Agency[],
  titleNumber: number
): AgencyStat[] {
  const results = new Map<string, AgencyStat>();

  for (const agency of agencies) {
    processAgency(agency, results);
  }

  return Array.from(results.values()).filter((stat) =>
    stat.titles.includes(titleNumber)
  );
}
