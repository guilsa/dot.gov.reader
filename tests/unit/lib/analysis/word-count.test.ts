import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { analyzeWordCount, getWordCountSummary } from '@/lib/analysis/word-count';
import type { TitleStructure } from '@/lib/ecfr/types';
import { createMockTitleStructure, createMockSection } from '@/tests/fixtures/factories';

describe('Word Count Analysis', () => {
  let sampleStructure: TitleStructure;

  beforeAll(async () => {
    // Load the sample Title 17 fixture
    const fixturePath = join(
      process.cwd(),
      'tests',
      'fixtures',
      'sample-title-17.json'
    );
    const content = await readFile(fixturePath, 'utf-8');
    sampleStructure = JSON.parse(content);
  });

  describe('analyzeWordCount', () => {
    it('should analyze word count for sample Title 17', () => {
      const result = analyzeWordCount(sampleStructure);

      expect(result).toBeDefined();
      expect(result.title).toBe(17);
      expect(result.totalWords).toBeGreaterThan(0);
      expect(result.totalCharacters).toBeGreaterThan(0);
      expect(result.totalElements).toBeGreaterThan(0);
    });

    it('should include hierarchy breakdown', () => {
      const result = analyzeWordCount(sampleStructure);

      expect(result.byHierarchy).toBeDefined();
      expect(Array.isArray(result.byHierarchy)).toBe(true);
      expect(result.byHierarchy.length).toBeGreaterThan(0);

      // Should have different hierarchy types
      const types = result.byHierarchy.map((h) => h.type);
      expect(types).toContain('title');
      expect(types).toContain('chapter');
      expect(types).toContain('section');
    });

    it('should calculate average words per hierarchy type', () => {
      const result = analyzeWordCount(sampleStructure);

      for (const hierarchy of result.byHierarchy) {
        expect(hierarchy.count).toBeGreaterThan(0);
        expect(hierarchy.totalWords).toBeGreaterThanOrEqual(0);
        expect(hierarchy.averageWords).toBe(
          hierarchy.totalWords / hierarchy.count
        );
      }
    });

    it('should identify top elements by word count', () => {
      const result = analyzeWordCount(sampleStructure);

      expect(result.topElements).toBeDefined();
      expect(Array.isArray(result.topElements)).toBe(true);
      expect(result.topElements.length).toBeGreaterThan(0);
      expect(result.topElements.length).toBeLessThanOrEqual(10);

      // Top elements should be sorted by word count (descending)
      for (let i = 1; i < result.topElements.length; i++) {
        expect(result.topElements[i - 1].wordCount).toBeGreaterThanOrEqual(
          result.topElements[i].wordCount
        );
      }
    });

    it('should extract sections', () => {
      const result = analyzeWordCount(sampleStructure);

      expect(result.sections).toBeDefined();
      expect(Array.isArray(result.sections)).toBe(true);

      // All items should be sections
      for (const section of result.sections!) {
        expect(section.type).toBe('section');
      }
    });

    it('should handle structure with no content', () => {
      const emptyStructure = createMockTitleStructure({
        children: [
          {
            identifier: 'empty-chapter',
            type: 'chapter',
            label: 'Empty Chapter',
            children: [],
          },
        ],
      });

      const result = analyzeWordCount(emptyStructure);

      expect(result.totalWords).toBe(0);
      expect(result.totalCharacters).toBe(0);
    });

    it('should count words in section content', () => {
      const structureWithContent = createMockTitleStructure({
        children: [
          {
            identifier: 'test-chapter',
            type: 'chapter',
            label: 'Test Chapter',
            children: [
              {
                identifier: 'test-part',
                type: 'part',
                label: 'Test Part',
                children: [
                  createMockSection({
                    content: 'This is a test section with exactly ten words here.',
                  }),
                ],
              },
            ],
          },
        ],
      });

      const result = analyzeWordCount(structureWithContent);

      expect(result.totalWords).toBe(10);
    });
  });

  describe('getWordCountSummary', () => {
    it('should calculate summary statistics', () => {
      const results = [
        analyzeWordCount(sampleStructure),
        analyzeWordCount(
          createMockTitleStructure({
            title: 10,
            children: [
              {
                identifier: 'ch1',
                type: 'chapter',
                label: 'Chapter',
                children: [
                  {
                    identifier: 'sec1',
                    type: 'section',
                    label: 'Section',
                    content: 'Short content',
                  },
                ],
              },
            ],
          })
        ),
      ];

      const summary = getWordCountSummary(results);

      expect(summary.titleCount).toBe(2);
      expect(summary.totalWords).toBeGreaterThan(0);
      expect(summary.totalElements).toBeGreaterThan(0);
      expect(summary.averageWordsPerTitle).toBe(
        summary.totalWords / summary.titleCount
      );
      expect(summary.longestTitle).toBeDefined();
      expect(summary.shortestTitle).toBeDefined();
    });
  });
});
