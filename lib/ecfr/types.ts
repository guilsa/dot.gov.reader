// eCFR API Response Types

// Agency types (from /api/admin/v1/agencies.json)
export interface Agency {
  name: string;
  short_name?: string;
  slug: string;
  parent_slug?: string;
  url?: string;
  cfr_references?: CfrReference[];
  children?: Agency[];
}

export interface CfrReference {
  title: number;
  chapter?: string;
  part?: string;
}

// Title types (from /api/versioner/v1/titles.json)
export interface Title {
  number: number;
  name: string;
  reserved: boolean;
  amendment_date?: string;
  issue_date?: string;
  status?: string;
}

// Title Structure types (from /api/versioner/v1/structure/{date}/title-{title}.json)
export interface TitleStructure {
  title: number;
  identifier: string;
  type: 'title';
  label?: string;
  children?: StructureNode[];
  reserved?: boolean;
  date?: string;
  [key: string]: unknown; // Allow additional fields
}

export type StructureNode =
  | TitleStructure
  | Subtitle
  | Chapter
  | Subchapter
  | Part
  | Subpart
  | Subject
  | Section
  | Appendix;

interface BaseStructureNode {
  identifier: string;
  label?: string;
  reserved?: boolean;
  children?: StructureNode[];
  [key: string]: unknown; // Allow additional fields
}

export interface Subtitle extends BaseStructureNode {
  type: 'subtitle';
}

export interface Chapter extends BaseStructureNode {
  type: 'chapter';
}

export interface Subchapter extends BaseStructureNode {
  type: 'subchapter';
}

export interface Part extends BaseStructureNode {
  type: 'part';
}

export interface Subpart extends BaseStructureNode {
  type: 'subpart';
}

export interface Subject extends BaseStructureNode {
  type: 'subject';
}

export interface Section extends BaseStructureNode {
  type: 'section';
  section_number?: string;
  content?: string; // May contain text content
  text?: string; // Alternative field name for content
}

export interface Appendix extends BaseStructureNode {
  type: 'appendix';
  content?: string;
}

// Version types (from /api/versioner/v1/versions/title-{title}.json)
export interface TitleVersions {
  title: number;
  sections?: SectionVersion[];
  appendices?: AppendixVersion[];
}

export interface SectionVersion {
  identifier: string;
  section_number: string;
  label?: string;
  versions?: Version[];
}

export interface AppendixVersion {
  identifier: string;
  label?: string;
  versions?: Version[];
}

export interface Version {
  date: string;
  volume?: number;
  page?: number;
  citation?: string;
  action?: string; // 'amended', 'added', 'removed', etc.
}

// Corrections types (from /api/admin/v1/corrections.json)
export interface Correction {
  title: number;
  date: string;
  error_corrected_date?: string;
  part?: string;
  section?: string;
  description?: string;
}

// Fixture metadata types
export interface FixtureMetadata {
  lastUpdated: string;
  downloads: DownloadRecord[];
}

export interface DownloadRecord {
  type: 'agencies' | 'titles-summary' | 'title';
  timestamp: string;
  title?: number;
  date?: string;
  status: 'success' | 'partial' | 'failed';
  error?: string;
}

// Per-title metadata
export interface TitleMetadata {
  title: number;
  downloadDate: string;
  dataDate: string; // The point-in-time date of the data
  files: {
    structure?: string;
    full?: string;
    versions?: string;
  };
}

// Utility types
export type StructureNodeType =
  | 'title'
  | 'subtitle'
  | 'chapter'
  | 'subchapter'
  | 'part'
  | 'subpart'
  | 'subject'
  | 'section'
  | 'appendix';

// Helper type guards
export function isSection(node: StructureNode): node is Section {
  return node.type === 'section';
}

export function isPart(node: StructureNode): node is Part {
  return node.type === 'part';
}

export function isChapter(node: StructureNode): node is Chapter {
  return node.type === 'chapter';
}

export function hasChildren(
  node: StructureNode
): node is StructureNode & { children: StructureNode[] } {
  return Array.isArray(node.children) && node.children.length > 0;
}
