import { readFile } from 'fs/promises';
import { join } from 'path';
import type {
  Agency,
  Title,
  TitleStructure,
  FixtureMetadata,
  TitleMetadata,
} from '@/lib/ecfr/types';

const FIXTURES_DIR = join(process.cwd(), 'fixtures');

/**
 * Loads agencies data from fixtures
 * @returns Array of agencies
 * @throws Error if fixture file not found or invalid
 */
export async function loadAgencies(): Promise<Agency[]> {
  try {
    const filePath = join(FIXTURES_DIR, 'agencies', 'agencies.json');
    const content = await readFile(filePath, 'utf-8');
    const agencies = JSON.parse(content);
    return Array.isArray(agencies) ? agencies : agencies.agencies || [];
  } catch (error) {
    throw new Error(
      `Failed to load agencies fixture: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Loads titles summary from fixtures
 * @returns Array of title summaries
 * @throws Error if fixture file not found or invalid
 */
export async function loadTitlesSummary(): Promise<Title[]> {
  try {
    const filePath = join(FIXTURES_DIR, 'titles', 'summary.json');
    const content = await readFile(filePath, 'utf-8');
    const titles = JSON.parse(content);
    return Array.isArray(titles) ? titles : titles.titles || [];
  } catch (error) {
    throw new Error(
      `Failed to load titles summary fixture: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Loads structure for a specific title from fixtures
 * @param titleNumber Title number (e.g., 17)
 * @returns Title structure with hierarchy
 * @throws Error if fixture file not found or invalid
 */
export async function loadTitleStructure(
  titleNumber: number
): Promise<TitleStructure> {
  try {
    // First, load the title metadata to find the structure file
    const metadataPath = join(
      FIXTURES_DIR,
      'titles',
      `title-${titleNumber}`,
      'metadata.json'
    );
    const metadataContent = await readFile(metadataPath, 'utf-8');
    const metadata: TitleMetadata = JSON.parse(metadataContent);

    if (!metadata.files.structure) {
      throw new Error(`No structure file found for title ${titleNumber}`);
    }

    // Load the structure file
    const structurePath = join(
      FIXTURES_DIR,
      'titles',
      `title-${titleNumber}`,
      metadata.files.structure
    );
    const content = await readFile(structurePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load title ${titleNumber} structure: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Loads metadata for a specific title
 * @param titleNumber Title number (e.g., 17)
 * @returns Title metadata
 * @throws Error if metadata file not found
 */
export async function loadTitleMetadata(
  titleNumber: number
): Promise<TitleMetadata> {
  try {
    const metadataPath = join(
      FIXTURES_DIR,
      'titles',
      `title-${titleNumber}`,
      'metadata.json'
    );
    const content = await readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load title ${titleNumber} metadata: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Loads the global fixtures metadata
 * @returns Fixture metadata with download history
 * @throws Error if metadata file not found
 */
export async function loadFixtureMetadata(): Promise<FixtureMetadata> {
  try {
    const metadataPath = join(FIXTURES_DIR, 'metadata.json');
    const content = await readFile(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load fixture metadata: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Checks if a title's fixture exists
 * @param titleNumber Title number to check
 * @returns true if the fixture exists
 */
export async function titleFixtureExists(
  titleNumber: number
): Promise<boolean> {
  try {
    await loadTitleMetadata(titleNumber);
    return true;
  } catch {
    return false;
  }
}
