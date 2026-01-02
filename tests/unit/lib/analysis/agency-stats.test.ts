import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  analyzeAgencyStats,
  getAgencyBySlug,
  getAgenciesForTitle,
} from '@/lib/analysis/agency-stats';
import type { Agency } from '@/lib/ecfr/types';
import { createMockAgency } from '@/tests/fixtures/factories';

describe('Agency Stats Analysis', () => {
  let sampleAgencies: Agency[];

  beforeAll(async () => {
    // Load the sample agencies fixture
    const fixturePath = join(
      process.cwd(),
      'tests',
      'fixtures',
      'sample-agencies.json'
    );
    const content = await readFile(fixturePath, 'utf-8');
    sampleAgencies = JSON.parse(content);
  });

  describe('analyzeAgencyStats', () => {
    it('should analyze agency statistics', () => {
      const result = analyzeAgencyStats(sampleAgencies);

      expect(result).toBeDefined();
      expect(result.totalAgencies).toBe(sampleAgencies.length);
      expect(result.agenciesWithReferences).toBeGreaterThan(0);
      expect(result.totalTitles).toBe(50); // Default CFR title count
    });

    it('should calculate average titles per agency', () => {
      const result = analyzeAgencyStats(sampleAgencies);

      expect(result.averageTitlesPerAgency).toBeGreaterThan(0);
      expect(result.averageTitlesPerAgency).toBeLessThanOrEqual(50);
    });

    it('should identify top agencies', () => {
      const result = analyzeAgencyStats(sampleAgencies);

      expect(result.topAgencies).toBeDefined();
      expect(Array.isArray(result.topAgencies)).toBe(true);
      expect(result.topAgencies.length).toBeLessThanOrEqual(10);

      // Top agencies should be sorted by title count (descending)
      for (let i = 1; i < result.topAgencies.length; i++) {
        expect(result.topAgencies[i - 1].titleCount).toBeGreaterThanOrEqual(
          result.topAgencies[i].titleCount
        );
      }
    });

    it('should include agency details', () => {
      const result = analyzeAgencyStats(sampleAgencies);

      for (const agency of result.topAgencies) {
        expect(agency.name).toBeDefined();
        expect(agency.slug).toBeDefined();
        expect(agency.titleCount).toBeGreaterThan(0);
        expect(Array.isArray(agency.titles)).toBe(true);
      }
    });

    it('should calculate title distribution', () => {
      const result = analyzeAgencyStats(sampleAgencies);

      expect(result.titleDistribution).toBeDefined();
      expect(Array.isArray(result.titleDistribution)).toBe(true);

      // Each distribution entry should have required fields
      for (const dist of result.titleDistribution) {
        expect(dist.titleNumber).toBeGreaterThan(0);
        expect(dist.titleName).toBeDefined();
        expect(dist.agencyCount).toBeGreaterThan(0);
        expect(Array.isArray(dist.agencies)).toBe(true);
        expect(dist.agencies.length).toBe(dist.agencyCount);
      }
    });

    it('should sort title distribution by agency count', () => {
      const result = analyzeAgencyStats(sampleAgencies);

      for (let i = 1; i < result.titleDistribution.length; i++) {
        expect(
          result.titleDistribution[i - 1].agencyCount
        ).toBeGreaterThanOrEqual(result.titleDistribution[i].agencyCount);
      }
    });

    it('should handle agencies with no references', () => {
      const agenciesWithEmpty = [
        ...sampleAgencies,
        createMockAgency({
          name: 'No References Agency',
          slug: 'no-refs',
          cfr_references: [],
        }),
      ];

      const result = analyzeAgencyStats(agenciesWithEmpty);

      expect(result.totalAgencies).toBe(agenciesWithEmpty.length);
      // Agencies with no references shouldn't be counted
      expect(result.agenciesWithReferences).toBeLessThan(
        agenciesWithEmpty.length
      );
    });

    it('should handle agencies with children', () => {
      const parentAgency = createMockAgency({
        name: 'Parent Agency',
        slug: 'parent',
        cfr_references: [{ title: 5 }],
        children: [
          createMockAgency({
            name: 'Child Agency',
            slug: 'child',
            cfr_references: [{ title: 10 }],
          }),
        ],
      });

      const result = analyzeAgencyStats([parentAgency]);

      // Should process both parent and child
      expect(result.agenciesWithReferences).toBe(2);
    });
  });

  describe('getAgencyBySlug', () => {
    it('should find agency by slug', () => {
      const agency = getAgencyBySlug(
        sampleAgencies,
        'commodity-futures-trading-commission'
      );

      expect(agency).toBeDefined();
      expect(agency?.slug).toBe('commodity-futures-trading-commission');
      expect(agency?.name).toBe('Commodity Futures Trading Commission');
    });

    it('should return null for non-existent slug', () => {
      const agency = getAgencyBySlug(sampleAgencies, 'non-existent-slug');

      expect(agency).toBeNull();
    });

    it('should include title information', () => {
      const agency = getAgencyBySlug(
        sampleAgencies,
        'commodity-futures-trading-commission'
      );

      expect(agency).toBeDefined();
      expect(agency?.titles).toBeDefined();
      expect(Array.isArray(agency?.titles)).toBe(true);
      expect(agency?.titles.length).toBeGreaterThan(0);
    });
  });

  describe('getAgenciesForTitle', () => {
    it('should find agencies for Title 17', () => {
      const agencies = getAgenciesForTitle(sampleAgencies, 17);

      expect(Array.isArray(agencies)).toBe(true);
      expect(agencies.length).toBeGreaterThan(0);

      // All returned agencies should reference Title 17
      for (const agency of agencies) {
        expect(agency.titles).toContain(17);
      }
    });

    it('should return empty array for title with no agencies', () => {
      const agencies = getAgenciesForTitle(sampleAgencies, 999);

      expect(Array.isArray(agencies)).toBe(true);
      expect(agencies.length).toBe(0);
    });

    it('should find agencies for Title 10', () => {
      const agencies = getAgenciesForTitle(sampleAgencies, 10);

      expect(agencies.length).toBeGreaterThan(0);

      // Should include Department of Energy
      const doe = agencies.find((a) => a.slug === 'department-of-energy');
      expect(doe).toBeDefined();
    });
  });
});
