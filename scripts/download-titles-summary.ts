import { fetchTitlesSummary } from './utils/ecfr-client';
import { writeJSON, updateMetadata, getFixturePath } from './utils/file-system';

/**
 * Downloads summary information for all CFR titles and saves as fixture
 */
async function downloadTitlesSummary(): Promise<void> {
  console.log('=== Downloading Titles Summary ===\n');

  const startTime = Date.now();

  try {
    // Fetch titles summary
    const titles = await fetchTitlesSummary();

    // Save to fixture file
    const summaryPath = getFixturePath('titles', 'summary.json');
    console.log(`\nSaving to ${summaryPath}...`);
    await writeJSON(summaryPath, titles);

    // Update metadata
    await updateMetadata({
      type: 'titles-summary',
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✓ Titles summary downloaded successfully in ${duration}s`);
    console.log(`  Total titles: ${titles.length}`);
    console.log(
      `  Reserved: ${titles.filter((t) => t.reserved).length}`
    );
    console.log(
      `  Active: ${titles.filter((t) => !t.reserved).length}`
    );
  } catch (error) {
    console.error('\n✗ Failed to download titles summary:', error);

    // Update metadata with failure
    await updateMetadata({
      type: 'titles-summary',
      timestamp: new Date().toISOString(),
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });

    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  downloadTitlesSummary();
}

export { downloadTitlesSummary };
