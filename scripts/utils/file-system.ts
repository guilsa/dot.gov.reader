import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { FIXTURES_DIR } from '@/lib/ecfr/constants';
import type { FixtureMetadata, DownloadRecord } from '@/lib/ecfr/types';

/**
 * Ensures a directory exists, creating it if necessary
 * @param dirPath Path to the directory
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Writes JSON data to a file with pretty formatting
 * @param filePath Path to the file
 * @param data Data to write
 */
export async function writeJSON(
  filePath: string,
  data: unknown
): Promise<void> {
  await ensureDirectory(dirname(filePath));
  const json = JSON.stringify(data, null, 2);
  await writeFile(filePath, json, 'utf-8');
}

/**
 * Writes XML or text content to a file
 * @param filePath Path to the file
 * @param content Content to write
 */
export async function writeXML(
  filePath: string,
  content: string
): Promise<void> {
  await ensureDirectory(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Reads JSON data from a file
 * @param filePath Path to the file
 * @returns Parsed JSON data
 */
export async function readJSON<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Checks if a file exists
 * @param filePath Path to the file
 * @returns true if the file exists, false otherwise
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Updates the global fixtures metadata file
 * @param record Download record to add
 */
export async function updateMetadata(record: DownloadRecord): Promise<void> {
  const metadataPath = join(FIXTURES_DIR, 'metadata.json');

  let metadata: FixtureMetadata;

  try {
    if (await fileExists(metadataPath)) {
      metadata = await readJSON<FixtureMetadata>(metadataPath);
    } else {
      metadata = {
        lastUpdated: new Date().toISOString(),
        downloads: [],
      };
    }
  } catch {
    metadata = {
      lastUpdated: new Date().toISOString(),
      downloads: [],
    };
  }

  // Add new record
  metadata.downloads.push(record);
  metadata.lastUpdated = new Date().toISOString();

  await writeJSON(metadataPath, metadata);
}

/**
 * Gets the fixtures directory path
 * @returns Absolute path to fixtures directory
 */
export function getFixturesDir(): string {
  return FIXTURES_DIR;
}

/**
 * Gets the path for a specific fixture file
 * @param relativePath Relative path from fixtures directory
 * @returns Absolute path to the fixture file
 */
export function getFixturePath(...relativePath: string[]): string {
  return join(FIXTURES_DIR, ...relativePath);
}
