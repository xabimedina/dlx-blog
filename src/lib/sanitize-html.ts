import 'server-only';

const STRUCTURAL_TAGS = [
  'p',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
] as const;

const STRUCTURAL_TAG_PATTERN = STRUCTURAL_TAGS.join('|');

const escapedOpenTagPattern = new RegExp(
  `&lt;(${STRUCTURAL_TAG_PATTERN})(?:\\s+.*?)?&gt;`,
  'gi'
);
const escapedCloseTagPattern = new RegExp(
  `&lt;/(${STRUCTURAL_TAG_PATTERN}|a)\\s*&gt;`,
  'gi'
);

function escapeHtmlMarkup(value: string): string {
  return value.replace(/[&<>"']/g, char => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

function decodeHtmlAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function getEscapedAttr(attrs: string, name: string): string {
  const pattern = new RegExp(
    `${name}\\s*=\\s*(?:&quot;([^]*?)&quot;|&#39;([^]*?)&#39;)`,
    'i'
  );
  const match = attrs.match(pattern);
  return decodeHtmlAttr(match?.[1] ?? match?.[2] ?? '');
}

function escapeHtmlAttr(value: string): string {
  return escapeHtmlMarkup(value);
}

function isSafeLink(url: string): boolean {
  if (url.startsWith('/') || url.startsWith('#')) return true;

  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['storage.googleapis.com', 'firebasestorage.googleapis.com'].includes(
      parsed.hostname
    );
  } catch {
    return false;
  }
}

function restoreLinks(html: string): string {
  return html.replace(/&lt;a\b(.*?)&gt;/gi, (_match, attrs: string) => {
    const href = getEscapedAttr(attrs, 'href');
    if (!href || !isSafeLink(href)) return '';
    return `<a href="${escapeHtmlAttr(href)}" target="_blank" rel="noopener noreferrer">`;
  });
}

function restoreImages(html: string): string {
  return html.replace(/&lt;img\b(.*?)\/?&gt;/gi, (_match, attrs: string) => {
    const src = getEscapedAttr(attrs, 'src');
    if (!src || !isSafeImageUrl(src)) return '';

    const alt = getEscapedAttr(attrs, 'alt');
    return `<img src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(alt)}" loading="lazy" />`;
  });
}

/**
 * Sanitiza el HTML editorial del blog con una allowlist conservadora.
 * Primero escapa todo el markup y después reactiva solo tags/atributos seguros.
 */
export function sanitizeBlogHtml(html: string): string {
  if (!html?.trim()) return '';

  return restoreImages(restoreLinks(escapeHtmlMarkup(html)))
    .replace(escapedOpenTagPattern, (_match, tag: string) => `<${tag.toLowerCase()}>`)
    .replace(escapedCloseTagPattern, (_match, tag: string) => `</${tag.toLowerCase()}>`)
    .replace(/&lt;br\s*\/?&gt;/gi, '<br />');
}
