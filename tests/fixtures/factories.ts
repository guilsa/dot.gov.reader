import type {
  Agency,
  Title,
  TitleStructure,
  Section,
  Part,
  Chapter,
} from '@/lib/ecfr/types';

/**
 * Creates a mock Agency with optional overrides
 */
export function createMockAgency(
  overrides?: Partial<Agency>
): Agency {
  return {
    name: 'Test Agency',
    slug: 'test-agency',
    cfr_references: [{ title: 17 }],
    ...overrides,
  };
}

/**
 * Creates a mock Title with optional overrides
 */
export function createMockTitle(
  overrides?: Partial<Title>
): Title {
  return {
    number: 17,
    name: 'Test Title',
    reserved: false,
    amendment_date: '2025-12-30',
    issue_date: '2025-12-30',
    status: 'active',
    ...overrides,
  };
}

/**
 * Creates a mock Section with optional overrides
 */
export function createMockSection(
  overrides?: Partial<Section>
): Section {
  return {
    identifier: 'test-section-1',
    type: 'section',
    label: '§ 1.1 Test Section',
    section_number: '1.1',
    content: 'This is test content for the section.',
    ...overrides,
  };
}

/**
 * Creates a mock Part with optional overrides
 */
export function createMockPart(
  overrides?: Partial<Part>
): Part {
  return {
    identifier: 'test-part-1',
    type: 'part',
    label: 'Part 1 - Test Part',
    children: [createMockSection()],
    ...overrides,
  };
}

/**
 * Creates a mock Chapter with optional overrides
 */
export function createMockChapter(
  overrides?: Partial<Chapter>
): Chapter {
  return {
    identifier: 'test-chapter-1',
    type: 'chapter',
    label: 'Chapter I - Test Chapter',
    children: [createMockPart()],
    ...overrides,
  };
}

/**
 * Creates a mock TitleStructure with optional overrides
 */
export function createMockTitleStructure(
  overrides?: Partial<TitleStructure>
): TitleStructure {
  return {
    title: 17,
    identifier: 'test-title-17',
    type: 'title',
    label: 'Title 17 - Test Title',
    children: [createMockChapter()],
    ...overrides,
  };
}
