export const BLOG_IMAGE_STORAGE_PREFIX = 'blog/images/';
export const BLOG_IMAGE_ROUTE = '/api/blog-image';

export function isBlogImageStoragePath(value: string): boolean {
  const path = value.trim();

  return (
    path.startsWith(BLOG_IMAGE_STORAGE_PREFIX) &&
    !path.includes('..') &&
    !path.includes('\\') &&
    !path.includes('//') &&
    !path.endsWith('/')
  );
}

function encodeStoragePath(path: string): string {
  return path
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

export function getBlogImageUrl(value: string, baseUrl?: string): string {
  const pathOrUrl = value.trim();
  if (!pathOrUrl) return '';

  let url = pathOrUrl;

  if (isBlogImageStoragePath(pathOrUrl)) {
    url = `${BLOG_IMAGE_ROUTE}/${encodeStoragePath(pathOrUrl)}`;
  }

  if (!baseUrl || /^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url, baseUrl).toString();
}
