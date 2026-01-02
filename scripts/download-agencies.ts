import { fetchAgencies } from './utils/ecfr-client';
import { writeJSON, updateMetadata, getFixturePath } from './utils/file-system';

/**
 * Downloads agencies data from eCFR API and saves as fixture
 */
async function downloadAgencies(): Promise<void> {
  console.log('=== Downloading Agencies Data ===\n');

  const startTime = Date.now();

  try {
    // Fetch agencies data
    const agencies = await fetchAgencies();

    // Save to fixture file
    const agenciesPath = getFixturePath('agencies', 'agencies.json');
    console.log(`\nSaving to ${agenciesPath}...`);
    await writeJSON(agenciesPath, agencies);

    // Update metadata
    await updateMetadata({
      type: 'agencies',
      timestamp: new Date().toISOString(),
      status: 'success',
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✓ Agencies data downloaded successfully in ${duration}s`);
    console.log(`  Total agencies: ${agencies.length}`);
  } catch (error) {
    console.error('\n✗ Failed to download agencies data:', error);

    // Update metadata with failure
    await updateMetadata({
      type: 'agencies',
      timestamp: new Date().toISOString(),
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });

    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  downloadAgencies();
}

export { downloadAgencies };
