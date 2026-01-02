// Analysis result types

/**
 * Word count for a specific structural element
 */
export interface ElementWordCount {
  identifier: string;
  type: string;
  label?: string;
  wordCount: number;
  characterCount: number;
}

/**
 * Word count aggregated by hierarchy level
 */
export interface HierarchyWordCount {
  type: string; // 'chapter', 'part', 'section', etc.
  count: number;
  totalWords: number;
  averageWords: number;
}

/**
 * Complete word count analysis result
 */
export interface WordCountResult {
  title: number;
  titleName?: string;
  totalWords: number;
  totalCharacters: number;
  totalElements: number;
  byHierarchy: HierarchyWordCount[];
  topElements: ElementWordCount[]; // Top 10 longest elements
  sections?: ElementWordCount[]; // All sections with word counts
}

/**
 * Statistics for a single agency
 */
export interface AgencyStat {
  name: string;
  slug: string;
  shortName?: string;
  titleCount: number; // Number of titles this agency appears in
  chapterCount: number; // Number of chapters referenced
  partCount: number; // Number of parts referenced
  titles: number[]; // List of title numbers
}

/**
 * Agency statistics analysis result
 */
export interface AgencyStatsResult {
  totalAgencies: number;
  agenciesWithReferences: number;
  totalTitles: number;
  averageTitlesPerAgency: number;
  topAgencies: AgencyStat[]; // Top 10 agencies by title count
  titleDistribution: TitleDistribution[];
}

/**
 * Distribution of agencies across titles
 */
export interface TitleDistribution {
  titleNumber: number;
  titleName: string;
  agencyCount: number;
  agencies: string[]; // Agency slugs
}

/**
 * Statistics for a specific title
 */
export interface TitleStats {
  title: number;
  name: string;
  wordCount?: number;
  sectionCount: number;
  partCount: number;
  chapterCount: number;
  agencyCount: number;
}
