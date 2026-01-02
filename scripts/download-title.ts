import {
  fetchTitleStructure,
  fetchTitleFull,
  fetchTitleVersions,
} from './utils/ecfr-client';
import {
  writeJSON,
  writeXML,
  updateMetadata,
  getFixturePath,
  fileExists,
} from './utils/file-system';
import { DEFAULT_DATE } from '@/lib/ecfr/constants';
import type { TitleMetadata } from '@/lib/ecfr/types';

interface DownloadTitleOptions {
  title: number;
  date: string;
  force?: boolean;
}

/**
 * Parses command line arguments
 */
function parseArgs(): DownloadTitleOptions {
  const args = process.argv.slice(2);

  let title = 17; // Default to Title 17 (Energy)
  let date = DEFAULT_DATE;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--date' && i + 1 < args.length) {
      date = args[i + 1];
      i++;
    } else if (arg === '--force') {
      force = true;
    } else if (!isNaN(Number(arg))) {
      title = Number(arg);
    }
  }

  return { title, date, force };
}

/**
 * Downloads data for a specific CFR title
 */
async function downloadTitle(options: DownloadTitleOptions): Promise<void> {
  const { title, date, force } = options;

  console.log(`=== Downloading Title ${title} (${date}) ===\n`);

  const startTime = Date.now();
  const titleDir = getFixturePath('titles', `title-${title}`);
  const metadataPath = getFixturePath('titles', `title-${title}`, 'metadata.json');

  try {
    // Check if already downloaded (unless force flag is set)
    if (!force && (await fileExists(metadataPath))) {
      console.log(`⚠ Title ${title} already exists. Use --force to re-download.`);
      return;
    }

    const errors: string[] = [];

    // Fetch structure JSON
    let structurePath: string | undefined;
    try {
      const structure = await fetchTitleStructure(title, date);
      structurePath = getFixturePath(
        'titles',
        `title-${title}`,
        `structure-${date}.json`
      );
      console.log(`Saving structure to ${structurePath}...`);
      await writeJSON(structurePath, structure);
    } catch (error) {
      const errMsg = `Failed to fetch structure: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(`✗ ${errMsg}`);
      errors.push(errMsg);
    }

    // Fetch full XML
    let fullPath: string | undefined;
    try {
      const fullXml = await fetchTitleFull(title, date);
      fullPath = getFixturePath('titles', `title-${title}`, `full-${date}.xml`);
      console.log(`Saving XML to ${fullPath}...`);
      await writeXML(fullPath, fullXml);
    } catch (error) {
      const errMsg = `Failed to fetch XML: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(`✗ ${errMsg}`);
      errors.push(errMsg);
    }

    // Fetch versions/amendment history
    let versionsPath: string | undefined;
    try {
      const versions = await fetchTitleVersions(title);
      versionsPath = getFixturePath('titles', `title-${title}`, 'versions.json');
      console.log(`Saving versions to ${versionsPath}...`);
      await writeJSON(versionsPath, versions);
    } catch (error) {
      const errMsg = `Failed to fetch versions: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(`✗ ${errMsg}`);
      errors.push(errMsg);
    }

    // Save title metadata
    const titleMetadata: TitleMetadata = {
      title,
      downloadDate: new Date().toISOString(),
      dataDate: date,
      files: {
        structure: structurePath ? `structure-${date}.json` : undefined,
        full: fullPath ? `full-${date}.xml` : undefined,
        versions: versionsPath ? 'versions.json' : undefined,
      },
    };

    await writeJSON(metadataPath, titleMetadata);

    // Update global metadata
    const status = errors.length === 0 ? 'success' : errors.length < 3 ? 'partial' : 'failed';

    await updateMetadata({
      type: 'title',
      timestamp: new Date().toISOString(),
      title,
      date,
      status,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (status === 'success') {
      console.log(`\n✓ Title ${title} downloaded successfully in ${duration}s`);
    } else if (status === 'partial') {
      console.log(
        `\n⚠ Title ${title} partially downloaded in ${duration}s (${errors.length} errors)`
      );
    } else {
      console.error(`\n✗ Title ${title} download failed in ${duration}s`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ Failed to download title:', error);

    await updateMetadata({
      type: 'title',
      timestamp: new Date().toISOString(),
      title,
      date,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });

    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  const options = parseArgs();
  downloadTitle(options);
}

export { downloadTitle };
