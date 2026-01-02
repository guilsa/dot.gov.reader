import type { TitleStructure, StructureNode } from '@/lib/ecfr/types';
import type {
  WordCountResult,
  ElementWordCount,
  HierarchyWordCount,
} from './types';

/**
 * Counts words in a text string
 * @param text Text to count words in
 * @returns Number of words
 */
function countWords(text: string | undefined): number {
  if (!text) return 0;
  // Remove extra whitespace and count words
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Extracts text content from a structure node
 * @param node Structure node
 * @returns Text content
 */
function getNodeContent(node: StructureNode): string {
  let content = '';

  // Check for content in various possible fields
  if ('content' in node && node.content) {
    content += String(node.content);
  }
  if ('text' in node && node.text) {
    content += ' ' + String(node.text);
  }

  return content.trim();
}

/**
 * Recursively counts words in a structure node and its children
 * @param node Structure node
 * @param elements Array to collect element word counts
 * @param hierarchyCounts Map of hierarchy type to counts
 */
function processNode(
  node: StructureNode,
  elements: ElementWordCount[],
  hierarchyCounts: Map<string, { count: number; totalWords: number }>
): number {
  const content = getNodeContent(node);
  const wordCount = countWords(content);
  const characterCount = content.length;

  // Create element word count record
  const elementCount: ElementWordCount = {
    identifier: node.identifier,
    type: node.type,
    label: node.label,
    wordCount,
    characterCount,
  };

  elements.push(elementCount);

  // Update hierarchy counts
  const hierarchyKey = node.type;
  const existing = hierarchyCounts.get(hierarchyKey) || {
    count: 0,
    totalWords: 0,
  };
  hierarchyCounts.set(hierarchyKey, {
    count: existing.count + 1,
    totalWords: existing.totalWords + wordCount,
  });

  // Process children recursively
  let childWordsTotal = 0;
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      childWordsTotal += processNode(child, elements, hierarchyCounts);
    }
  }

  // Return total words for this node (including children)
  return wordCount + childWordsTotal;
}

/**
 * Analyzes word count for a title structure
 * @param structure Title structure to analyze
 * @returns Word count analysis results
 */
export function analyzeWordCount(structure: TitleStructure): WordCountResult {
  const elements: ElementWordCount[] = [];
  const hierarchyCounts = new Map<
    string,
    { count: number; totalWords: number }
  >();

  // Process the entire structure
  const totalWords = processNode(structure, elements, hierarchyCounts);

  // Calculate total characters
  const totalCharacters = elements.reduce(
    (sum, el) => sum + el.characterCount,
    0
  );

  // Convert hierarchy counts to array
  const byHierarchy: HierarchyWordCount[] = Array.from(
    hierarchyCounts.entries()
  ).map(([type, data]) => ({
    type,
    count: data.count,
    totalWords: data.totalWords,
    averageWords: data.count > 0 ? data.totalWords / data.count : 0,
  }));

  // Sort by type name for consistency
  byHierarchy.sort((a, b) => a.type.localeCompare(b.type));

  // Get top 10 elements by word count
  const topElements = [...elements]
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 10);

  // Get all sections
  const sections = elements.filter((el) => el.type === 'section');

  return {
    title: structure.title,
    titleName: structure.label,
    totalWords,
    totalCharacters,
    totalElements: elements.length,
    byHierarchy,
    topElements,
    sections,
  };
}

/**
 * Analyzes word count for multiple titles
 * @param structures Array of title structures
 * @returns Array of word count results
 */
export function analyzeMultipleTitles(
  structures: TitleStructure[]
): WordCountResult[] {
  return structures.map((structure) => analyzeWordCount(structure));
}

/**
 * Gets summary statistics from word count results
 * @param results Array of word count results
 * @returns Summary statistics
 */
export function getWordCountSummary(results: WordCountResult[]) {
  const totalWords = results.reduce((sum, r) => sum + r.totalWords, 0);
  const totalElements = results.reduce((sum, r) => sum + r.totalElements, 0);
  const averageWordsPerTitle = results.length > 0 ? totalWords / results.length : 0;

  return {
    titleCount: results.length,
    totalWords,
    totalElements,
    averageWordsPerTitle,
    longestTitle: results.reduce(
      (max, r) => (r.totalWords > max.totalWords ? r : max),
      results[0]
    ),
    shortestTitle: results.reduce(
      (min, r) => (r.totalWords < min.totalWords ? r : min),
      results[0]
    ),
  };
}
