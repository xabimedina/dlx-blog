import 'server-only'; // Ensure server-only is imported first
import type { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config';
import type { BlogPost, BlogPostCard } from '@/types/post';
import { getBlogImageUrl, isBlogImageStoragePath } from '@/lib/blog-images';
import { sanitizeBlogHtml } from '@/lib/sanitize-html';
import { htmlToPlainText } from '@/lib/seo';

const COLLECTION = 'blog';

// Forma cruda del documento en Firestore (paths de Storage + Timestamps).
type RawPost = Omit<
  BlogPost,
  'coverImage' | 'images' | 'publishedAt' | 'updatedAt'
> & {
  coverImage: string;
  images?: string[];
  publishedAt: Timestamp;
  updatedAt?: Timestamp;
};

function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPublishableRawPost(raw: Partial<RawPost>): raw is RawPost {
  return (
    raw.published === true &&
    isNonEmptyString(raw.slug) &&
    isNonEmptyString(raw.title) &&
    isNonEmptyString(raw.excerpt) &&
    isNonEmptyString(raw.author) &&
    isNonEmptyString(raw.content) &&
    htmlToPlainText(raw.content).length > 0 &&
    isNonEmptyString(raw.coverImage) &&
    isBlogImageStoragePath(raw.coverImage) &&
    isTimestamp(raw.publishedAt)
  );
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter(isNonEmptyString).map(tag => tag.trim());
}

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];

  return images
    .filter(isNonEmptyString)
    .filter(isBlogImageStoragePath)
    .map(path => getBlogImageUrl(path));
}

/** Resuelve un path de Storage a una URL estable del blog. */
function resolveImage(path?: string): string {
  if (!path?.trim() || !isBlogImageStoragePath(path)) return '';
  return getBlogImageUrl(path);
}

function resolveInlineImages(html: string): string {
  const imageSources = Array.from(
    html.matchAll(/<img\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gi)
  )
    .map(match => match[2]?.trim())
    .filter((src): src is string => src?.startsWith('blog/images/') ?? false);

  if (imageSources.length === 0) return html;

  const resolved = new Map(
    Array.from(new Set(imageSources))
      .filter(isBlogImageStoragePath)
      .map(src => [src, getBlogImageUrl(src)] as const)
  );

  return html.replace(
    /(<img\b[^>]*\bsrc=)(["'])(.*?)\2([^>]*>)/gi,
    (match, prefix: string, quote: string, src: string, suffix: string) => {
      const nextSrc = resolved.get(src.trim());
      return nextSrc ? `${prefix}${quote}${nextSrc}${quote}${suffix}` : match;
    }
  );
}

/** Calcula el tiempo de lectura en minutos a partir del HTML del contenido. */
function estimateReadingTime(html: string): number {
  const text = htmlToPlainText(html);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function getReadingTime(raw: RawPost): number {
  if (
    typeof raw.readingTime === 'number' &&
    Number.isFinite(raw.readingTime) &&
    raw.readingTime > 0
  ) {
    return Math.round(raw.readingTime);
  }

  return estimateReadingTime(raw.content);
}

/**
 * Devuelve las tarjetas de todos los posts publicados,
 * ordenados por fecha de publicación (más recientes primero).
 */
export async function getAllPosts(): Promise<BlogPostCard[]> {
  try {
    // Solo filtramos por `published` (índice de campo único, automático) y
    // ordenamos en memoria por fecha para no requerir un índice compuesto.
    const snapshot = await db
      .collection(COLLECTION)
      .where('published', '==', true)
      .get();

    const cards = snapshot.docs
      .flatMap(doc => {
        const raw = doc.data() as RawPost;
        if (!isPublishableRawPost(raw)) {
          console.warn(
            `[getAllPosts] Ignorando artículo publicado no válido: ${doc.id}`
          );
          return [];
        }

        return [
          {
            slug: raw.slug,
            title: raw.title,
            excerpt: raw.excerpt,
            coverImage: resolveImage(raw.coverImage),
            tags: normalizeTags(raw.tags),
            publishedAt: raw.publishedAt.toDate(),
            readingTime: getReadingTime(raw),
          } satisfies BlogPostCard,
        ];
      });

    return cards.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  } catch (err) {
    console.error('[getAllPosts] Error:', err);
    throw new Error('No se pudieron obtener los artículos del blog', {
      cause: err,
    });
  }
}

/**
 * Devuelve un post publicado por su slug, con las imágenes resueltas a URLs
 * estables del blog. Devuelve `null` si no existe o no está publicado.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .where('slug', '==', slug)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs.find(candidate => {
      const raw = candidate.data() as RawPost;
      return isPublishableRawPost(raw);
    });

    if (!doc) return null;

    const raw = doc.data() as RawPost;

    const coverImage = resolveImage(raw.coverImage);
    const images = normalizeImages(raw.images);
    const content = resolveInlineImages(raw.content);

    return {
      id: doc.id,
      slug: raw.slug,
      title: raw.title,
      excerpt: raw.excerpt,
      content: sanitizeBlogHtml(content),
      coverImage,
      images,
      author: raw.author,
      tags: normalizeTags(raw.tags),
      published: raw.published,
      publishedAt: raw.publishedAt.toDate(),
      updatedAt: isTimestamp(raw.updatedAt)
        ? raw.updatedAt.toDate()
        : raw.publishedAt.toDate(),
      readingTime: getReadingTime(raw),
    } satisfies BlogPost;
  } catch (err) {
    console.error('[getPostBySlug] Error:', err);
    return null;
  }
}
