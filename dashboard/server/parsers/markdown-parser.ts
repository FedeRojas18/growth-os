/**
 * Parse markdown tables into structured data
 */

export interface TableRow {
  [key: string]: string;
}

export interface ParsedTable {
  headers: string[];
  rows: TableRow[];
}

/**
 * Find and parse a markdown table that appears after a given section header
 */
export function parseTableAfterHeader(markdown: string, headerText: string): ParsedTable | null {
  // Find the section header
  const headerRegex = new RegExp(`^##\\s+${escapeRegex(headerText)}\\s*$`, 'm');
  const headerMatch = markdown.match(headerRegex);

  if (!headerMatch || headerMatch.index === undefined) {
    return null;
  }

  // Get content after the header
  const contentAfterHeader = markdown.slice(headerMatch.index + headerMatch[0].length);

  // Find the first table in this section (before next ## header)
  const nextSectionMatch = contentAfterHeader.match(/^##\s+/m);
  const sectionContent = nextSectionMatch && nextSectionMatch.index !== undefined
    ? contentAfterHeader.slice(0, nextSectionMatch.index)
    : contentAfterHeader;

  return parseFirstTable(sectionContent);
}

/**
 * Parse the first markdown table found in the content
 */
export function parseFirstTable(content: string): ParsedTable | null {
  const lines = content.split('\n');
  const tableLines: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this is a table row (starts and ends with |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableLines.push(trimmed);
    } else if (inTable && trimmed === '') {
      // Empty line after table starts - continue looking
      continue;
    } else if (inTable) {
      // Non-table line after we've started - table is complete
      break;
    }
  }

  if (tableLines.length < 2) {
    return null;
  }

  // Parse header row
  const headers = parseTableRow(tableLines[0]);

  // Skip separator row (the |---|---| row) and parse data rows
  const rows: TableRow[] = [];
  for (let i = 1; i < tableLines.length; i++) {
    const line = tableLines[i];
    // Skip separator row
    if (line.match(/^\|[\s-:|]+\|$/)) {
      continue;
    }

    const values = parseTableRow(line);
    if (values.length === headers.length) {
      const row: TableRow = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      rows.push(row);
    }
  }

  return { headers, rows };
}

/**
 * Parse a single table row into an array of cell values
 */
function parseTableRow(line: string): string[] {
  // Remove leading and trailing pipes, then split by |
  const content = line.slice(1, -1);
  return content.split('|').map(cell => cell.trim());
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
