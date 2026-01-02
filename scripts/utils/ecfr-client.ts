import { ECFR_BASE_URL, API_PATHS } from '@/lib/ecfr/constants';
import { retryWithBackoff } from './retry';
import type {
  Agency,
  Title,
  TitleStructure,
  TitleVersions,
} from '@/lib/ecfr/types';

/**
 * Fetches agencies data from eCFR API
 * @returns Array of agencies with children and CFR references
 */
export async function fetchAgencies(): Promise<Agency[]> {
  console.log('Fetching agencies data...');

  const response = await retryWithBackoff(
    async () => {
      const res = await fetch(`${ECFR_BASE_URL}${API_PATHS.AGENCIES}`);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch agencies: ${res.status} ${res.statusText}`
        );
      }
      return res;
    },
    {
      onRetry: (attempt, error) => {
        console.log(`  Retry attempt ${attempt}: ${error.message}`);
      },
    }
  );

  const data = await response.json();
  console.log('✓ Agencies data fetched successfully');
  return data.agencies || data;
}

/**
 * Fetches summary information for all CFR titles
 * @returns Array of title summaries
 */
export async function fetchTitlesSummary(): Promise<Title[]> {
  console.log('Fetching titles summary...');

  const response = await retryWithBackoff(
    async () => {
      const res = await fetch(`${ECFR_BASE_URL}${API_PATHS.TITLES_SUMMARY}`);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch titles summary: ${res.status} ${res.statusText}`
        );
      }
      return res;
    },
    {
      onRetry: (attempt, error) => {
        console.log(`  Retry attempt ${attempt}: ${error.message}`);
      },
    }
  );

  const data = await response.json();
  console.log('✓ Titles summary fetched successfully');
  return data.titles || data;
}

/**
 * Fetches the structure of a specific title at a given date
 * @param title Title number (e.g., 17)
 * @param date Date in YYYY-MM-DD format
 * @returns Title structure with hierarchy
 */
export async function fetchTitleStructure(
  title: number,
  date: string
): Promise<TitleStructure> {
  console.log(`Fetching structure for Title ${title} (${date})...`);

  const response = await retryWithBackoff(
    async () => {
      const url = `${ECFR_BASE_URL}${API_PATHS.TITLE_STRUCTURE(date, title)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch title structure: ${res.status} ${res.statusText}`
        );
      }
      return res;
    },
    {
      onRetry: (attempt, error) => {
        console.log(`  Retry attempt ${attempt}: ${error.message}`);
      },
    }
  );

  const data = await response.json();
  console.log(`✓ Title ${title} structure fetched successfully`);
  return data;
}

/**
 * Fetches the full XML content of a specific title at a given date
 * @param title Title number (e.g., 17)
 * @param date Date in YYYY-MM-DD format
 * @returns XML content as string
 */
export async function fetchTitleFull(
  title: number,
  date: string
): Promise<string> {
  console.log(`Fetching full XML for Title ${title} (${date})...`);

  const response = await retryWithBackoff(
    async () => {
      const url = `${ECFR_BASE_URL}${API_PATHS.TITLE_FULL(date, title)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch title XML: ${res.status} ${res.statusText}`
        );
      }
      return res;
    },
    {
      onRetry: (attempt, error) => {
        console.log(`  Retry attempt ${attempt}: ${error.message}`);
      },
    }
  );

  const xml = await response.text();
  console.log(`✓ Title ${title} XML fetched successfully`);
  return xml;
}

/**
 * Fetches version history for all sections/appendices in a title
 * @param title Title number (e.g., 17)
 * @returns Version history data
 */
export async function fetchTitleVersions(title: number): Promise<TitleVersions> {
  console.log(`Fetching version history for Title ${title}...`);

  const response = await retryWithBackoff(
    async () => {
      const url = `${ECFR_BASE_URL}${API_PATHS.TITLE_VERSIONS(title)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch title versions: ${res.status} ${res.statusText}`
        );
      }
      return res;
    },
    {
      onRetry: (attempt, error) => {
        console.log(`  Retry attempt ${attempt}: ${error.message}`);
      },
    }
  );

  const data = await response.json();
  console.log(`✓ Title ${title} versions fetched successfully`);
  return data;
}
