import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/server/firebase/api';
import PostDetail from '@/components/pages/blog/post-detail';
import {
  StructuredData,
  generateArticleSchema,
  generateBreadcrumbSchema,
} from '@/components/structured-data';
import { getBlogImageUrl } from '@/lib/blog-images';
import { getPostDescription } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const revalidate = 1800;
// Permitimos generar posts publicados entre builds (ISR on-demand).
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Artículo no encontrado',
      description: 'El artículo que buscas no existe o ha sido eliminado.',
    };
  }

  const description = getPostDescription({
    excerpt: post.excerpt,
    content: post.content,
  });
  const imageUrl = post.coverImage
    ? getBlogImageUrl(post.coverImage, SITE.url)
    : undefined;

  return {
    title: post.title,
    description,
    keywords: post.tags.join(', '),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return notFound();

  const breadcrumbItems = [
    { name: 'Blog', url: '/' },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <>
      <StructuredData id='article-schema' data={generateArticleSchema(post)} />
      <StructuredData
        id='breadcrumb-schema'
        data={generateBreadcrumbSchema(breadcrumbItems)}
      />
      <PostDetail post={post} />
    </>
  );
}
