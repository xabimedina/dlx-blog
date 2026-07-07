import { getBlogImageUrl } from '@/lib/blog-images';
import { getPostDescription } from '@/lib/seo';
import { SITE } from '@/lib/site';
import type { BlogPost } from '@/types/post';

interface StructuredDataProps {
  data: object;
  id?: string;
}

export function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      id={id}
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  publisher: {
    '@type': 'Organization',
    name: 'Despeja la X',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE.mainSite}/brand/dlx-logo-black.png`,
    },
  },
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const breadcrumbItems = [{ name: 'Inicio', url: '/' }, ...items];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.url}`,
    })),
  };
}

/** JSON-LD `BlogPosting` para la página de detalle de un artículo. */
export function generateArticleSchema(post: BlogPost) {
  const cleanExcerpt = getPostDescription({
    excerpt: post.excerpt,
    content: post.content,
    maxLength: 200,
  });
  const imageUrl = post.coverImage
    ? getBlogImageUrl(post.coverImage, SITE.url)
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: cleanExcerpt,
    image: imageUrl
      ? {
          '@type': 'ImageObject',
          url: imageUrl,
          width: 1200,
          height: 630,
          caption: post.title,
        }
      : undefined,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE.mainSite,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Despeja la X',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.mainSite}/brand/dlx-logo-black.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE.url}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
}
