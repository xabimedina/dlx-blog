import { NextResponse, type NextRequest } from 'next/server';
import { isBlogImageStoragePath } from '@/lib/blog-images';
import { storage } from '@/server/firebase/config';

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function notFound() {
  return new NextResponse('Not found', { status: 404 });
}

function getSafeFilename(filePath: string): string {
  return (filePath.split('/').at(-1) ?? 'image').replace(/[^\w.-]/g, '_');
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { path = [] } = await params;
  const filePath = path.join('/');

  if (!isBlogImageStoragePath(filePath)) {
    return notFound();
  }

  try {
    const file = storage.file(filePath);
    const [[contents], [metadata]] = await Promise.all([
      file.download(),
      file.getMetadata(),
    ]);
    const contentType = metadata.contentType ?? 'application/octet-stream';

    if (!contentType.startsWith('image/')) {
      return notFound();
    }

    return new NextResponse(new Uint8Array(contents), {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Disposition': `inline; filename="${getSafeFilename(filePath)}"`,
        'Content-Length': String(contents.byteLength),
        'Content-Type': contentType,
      },
    });
  } catch (err) {
    console.error('[blog-image] Error:', err);
    return notFound();
  }
}
