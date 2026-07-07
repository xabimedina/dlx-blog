import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/server/firebase/api';
import { SITE } from '@/lib/site';

export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Awaited<ReturnType<typeof getAllPosts>> = [];

  try {
    posts = await getAllPosts();
  } catch (err) {
    console.error('[sitemap] Error loading posts:', err);
  }

  const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...postEntries,
  ];
}
