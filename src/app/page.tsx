import type { Metadata } from 'next';
import { getAllPosts } from '@/server/firebase/api';
import BlogPage from '@/components/pages/blog';
import { SITE } from '@/lib/site';
import {
  StructuredData,
  blogSchema,
  generateBreadcrumbSchema,
} from '@/components/structured-data';

export const revalidate = 1800;

const description =
  'Artículos sobre arquitectura, interiorismo y diseño del estudio Despeja la X.';

export const metadata: Metadata = {
  title: 'Blog',
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Blog · Despeja la X',
    description,
    url: SITE.url,
    type: 'website',
    images: [
      {
        url: '/brand/dlx-logo-black.png',
        width: 1200,
        height: 630,
        alt: 'Despeja la X',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog · Despeja la X',
    description,
    images: ['/brand/dlx-logo-black.png'],
  },
};

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <>
      <StructuredData id='blog-schema' data={blogSchema} />
      <StructuredData
        id='breadcrumb-schema'
        data={generateBreadcrumbSchema([{ name: 'Blog', url: '/' }])}
      />
      <BlogPage posts={posts} />
    </>
  );
}
