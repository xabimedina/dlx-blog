import 'server-only'; // Ensure server-only is imported first
import type { Timestamp } from 'firebase-admin/firestore';
import { db } from '../config';
import { getDownloadUrl } from '../storage';
import type { BlogPost, BlogPostCard } from '@/types/post';
import { sanitizeBlogHtml } from '@/lib/sanitize-html';

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

/** Resuelve un path de Storage a URL firmada; cadena vacía si no hay path. */
async function resolveImage(path?: string): Promise<string> {
  if (!path?.trim()) return '';
  try {
    return await getDownloadUrl(path);
  } catch {
    return '';
  }
}

async function resolveInlineImages(html: string): Promise<string> {
  const imageSources = Array.from(
    html.matchAll(/<img\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gi)
  )
    .map(match => match[2]?.trim())
    .filter((src): src is string => src?.startsWith('blog/images/') ?? false);

  if (imageSources.length === 0) return html;

  const resolvedEntries = await Promise.all(
    Array.from(new Set(imageSources)).map(async src => [
      src,
      await resolveImage(src),
    ] as const)
  );
  const resolved = new Map(
    resolvedEntries.filter((entry): entry is readonly [string, string] =>
      Boolean(entry[1])
    )
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
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
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

    const cards = await Promise.all(
      snapshot.docs.map(async doc => {
        const raw = doc.data() as RawPost;
        return {
          slug: raw.slug,
          title: raw.title,
          excerpt: raw.excerpt,
          coverImage: await resolveImage(raw.coverImage),
          tags: raw.tags ?? [],
          publishedAt: raw.publishedAt.toDate(),
          readingTime: raw.readingTime ?? estimateReadingTime(raw.content ?? ''),
        } satisfies BlogPostCard;
      })
    );

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
 * Devuelve un post publicado por su slug, con las imágenes resueltas a URL
 * firmada. Devuelve `null` si no existe o no está publicado.
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
      return raw.published;
    });

    if (!doc) return null;

    const raw = doc.data() as RawPost;

    const [coverImage, images, content] = await Promise.all([
      resolveImage(raw.coverImage),
      Promise.all((raw.images ?? []).map(resolveImage)),
      resolveInlineImages(raw.content ?? ''),
    ]);

    return {
      id: doc.id,
      slug: raw.slug,
      title: raw.title,
      excerpt: raw.excerpt,
      content: sanitizeBlogHtml(content),
      coverImage,
      images: images.filter(Boolean),
      author: raw.author ?? 'Despeja la X',
      tags: raw.tags ?? [],
      published: raw.published,
      publishedAt: raw.publishedAt.toDate(),
      updatedAt: raw.updatedAt?.toDate() ?? raw.publishedAt.toDate(),
      readingTime: raw.readingTime ?? estimateReadingTime(raw.content ?? ''),
    } satisfies BlogPost;
  } catch (err) {
    console.error('[getPostBySlug] Error:', err);
    return null;
  }
}
