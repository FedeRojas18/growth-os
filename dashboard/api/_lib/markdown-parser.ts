export interface TableRow {
  [key: string]: string;
}

export interface ParsedTable {
  headers: string[];
  rows: TableRow[];
}

export function parseTableAfterHeader(markdown: string, headerText: string): ParsedTable | null {
  const headerRegex = new RegExp(`^##\\s+${escapeRegex(headerText)}\\s*$`, 'm');
  const headerMatch = markdown.match(headerRegex);

  if (!headerMatch || headerMatch.index === undefined) {
    return null;
  }

  const contentAfterHeader = markdown.slice(headerMatch.index + headerMatch[0].length);
  const nextSectionMatch = contentAfterHeader.match(/^##\s+/m);
  const sectionContent = nextSectionMatch && nextSectionMatch.index !== undefined
    ? contentAfterHeader.slice(0, nextSectionMatch.index)
    : contentAfterHeader;

  return parseFirstTable(sectionContent);
}

export function parseFirstTable(content: string): ParsedTable | null {
  const lines = content.split('\n');
  const tableLines: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableLines.push(trimmed);
    } else if (inTable && trimmed === '') {
      continue;
    } else if (inTable) {
      break;
    }
  }

  if (tableLines.length < 2) {
    return null;
  }

  const headers = parseTableRow(tableLines[0]);
  const rows: TableRow[] = [];

  for (let i = 1; i < tableLines.length; i++) {
    const line = tableLines[i];
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

function parseTableRow(line: string): string[] {
  const content = line.slice(1, -1);
  return content.split('|').map(cell => cell.trim());
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
