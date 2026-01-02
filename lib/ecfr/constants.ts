import { join } from 'path';

export const ECFR_BASE_URL = 'https://www.ecfr.gov';

export const FIXTURES_DIR = join(process.cwd(), 'fixtures');

// API endpoint paths
export const API_PATHS = {
  // Admin Service
  AGENCIES: '/api/admin/v1/agencies.json',
  CORRECTIONS: '/api/admin/v1/corrections.json',

  // Versioner Service
  TITLES_SUMMARY: '/api/versioner/v1/titles.json',
  TITLE_STRUCTURE: (date: string, title: number) =>
    `/api/versioner/v1/structure/${date}/title-${title}.json`,
  TITLE_FULL: (date: string, title: number) =>
    `/api/versioner/v1/full/${date}/title-${title}.xml`,
  TITLE_VERSIONS: (title: number) =>
    `/api/versioner/v1/versions/title-${title}.json`,

  // Search Service
  SEARCH_RESULTS: '/api/search/v1/results',
  SEARCH_COUNT: '/api/search/v1/count',
} as const;

// Default date format: YYYY-MM-DD
export const DEFAULT_DATE = new Date().toISOString().split('T')[0];

// Retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  factor: 2, // exponential backoff factor
} as const;
