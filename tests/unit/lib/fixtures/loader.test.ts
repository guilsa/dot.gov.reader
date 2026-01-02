import { describe, it, expect } from 'vitest';
import {
  loadAgencies,
  loadTitlesSummary,
  loadTitleStructure,
  loadTitleMetadata,
  titleFixtureExists,
} from '@/lib/fixtures/loader';

describe('Fixture Loader', () => {
  describe('loadAgencies', () => {
    it('should load agencies fixture successfully', async () => {
      const agencies = await loadAgencies();

      expect(Array.isArray(agencies)).toBe(true);
      expect(agencies.length).toBeGreaterThan(0);
      expect(agencies[0]).toHaveProperty('name');
      expect(agencies[0]).toHaveProperty('slug');
    });
  });

  describe('loadTitlesSummary', () => {
    it('should load titles summary successfully', async () => {
      const titles = await loadTitlesSummary();

      expect(Array.isArray(titles)).toBe(true);
      expect(titles.length).toBe(50); // All CFR titles
      expect(titles[0]).toHaveProperty('number');
      expect(titles[0]).toHaveProperty('name');
      expect(titles[0]).toHaveProperty('reserved');
    });

    it('should include Title 17', async () => {
      const titles = await loadTitlesSummary();
      const title17 = titles.find((t) => t.number === 17);

      expect(title17).toBeDefined();
      expect(title17?.name).toBe('Commodity and Securities Exchanges');
      expect(title17?.reserved).toBe(false);
    });
  });

  describe('loadTitleStructure', () => {
    it('should load Title 17 structure successfully', async () => {
      const structure = await loadTitleStructure(17);

      expect(structure).toBeDefined();
      expect(structure.type).toBe('title');
      expect(structure.identifier).toBe('17');
      expect(structure.children).toBeDefined();
      expect(Array.isArray(structure.children)).toBe(true);
    });

    it('should throw error for non-existent title', async () => {
      await expect(loadTitleStructure(999)).rejects.toThrow();
    });
  });

  describe('loadTitleMetadata', () => {
    it('should load Title 17 metadata successfully', async () => {
      const metadata = await loadTitleMetadata(17);

      expect(metadata).toBeDefined();
      expect(metadata.title).toBe(17);
      expect(metadata.downloadDate).toBeDefined();
      expect(metadata.dataDate).toBeDefined();
      expect(metadata.files).toBeDefined();
    });

    it('should throw error for non-existent title metadata', async () => {
      await expect(loadTitleMetadata(999)).rejects.toThrow();
    });
  });

  describe('titleFixtureExists', () => {
    it('should return true for Title 17', async () => {
      const exists = await titleFixtureExists(17);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent title', async () => {
      const exists = await titleFixtureExists(999);
      expect(exists).toBe(false);
    });
  });
});
