const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  nbsp: ' ',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
};

function isValidCodePoint(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff;
}

function decodeHtmlEntity(entity: string): string {
  const normalized = entity.toLowerCase();

  if (normalized.startsWith('#x')) {
    const codePoint = Number.parseInt(normalized.slice(2), 16);
    return isValidCodePoint(codePoint) ? String.fromCodePoint(codePoint) : '';
  }

  if (normalized.startsWith('#')) {
    const codePoint = Number.parseInt(normalized.slice(1), 10);
    return isValidCodePoint(codePoint) ? String.fromCodePoint(codePoint) : '';
  }

  return HTML_ENTITIES[normalized] ?? '';
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&([a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);/g, (_match, entity: string) =>
      decodeHtmlEntity(entity)
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const slice = normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd();
  const lastSpace = slice.lastIndexOf(' ');
  const trimmed =
    lastSpace > Math.floor(maxLength * 0.7) ? slice.slice(0, lastSpace) : slice;

  return `${trimmed}...`;
}

export function getPostDescription({
  excerpt,
  content,
  maxLength = 160,
}: {
  excerpt?: string;
  content: string;
  maxLength?: number;
}): string {
  return truncateText(excerpt?.trim() || htmlToPlainText(content), maxLength);
}
