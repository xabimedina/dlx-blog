/**
 * Modelo de datos de un artículo del blog.
 * Coincide con la estructura de la colección `blog` en Firestore.
 * Las imágenes (`coverImage`, `images`) se guardan como paths de Storage y se
 * resuelven a URLs firmadas en la capa de servidor (ver `get-blog-posts.ts`).
 */
export interface BlogPost {
  id: string;
  slug: string; // único, URL-friendly
  title: string;
  excerpt: string; // resumen para listado + meta description
  content: string; // HTML enriquecido (guardado desde el editor del admin)
  coverImage: string; // path de Storage → URL firmada al resolver
  images: string[]; // galería opcional (paths de Storage)
  author: string;
  tags: string[];
  published: boolean; // equivalente a `showProject` en projects
  publishedAt: Date; // Firestore Timestamp → .toDate()
  updatedAt: Date;
  readingTime?: number; // minutos (calculado a partir del contenido)
}

/** Proyección ligera para las tarjetas del listado. */
export type BlogPostCard = Pick<
  BlogPost,
  | 'slug'
  | 'title'
  | 'excerpt'
  | 'coverImage'
  | 'tags'
  | 'publishedAt'
  | 'readingTime'
>;
