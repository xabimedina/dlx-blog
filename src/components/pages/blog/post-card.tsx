import Image from 'next/image';
import Link from 'next/link';
import { AspectRatio, Badge } from '@xabimedina/dlx-components';
import type { BlogPostCard } from '@/types/post';

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function PostCard({ post }: { post: BlogPostCard }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className='group flex flex-col overflow-hidden rounded-xl bg-white border border-jet/10 transition-all duration-300 hover:border-jet/25 hover:shadow-lg'
    >
      <div className='overflow-hidden'>
        <AspectRatio ratio={16 / 10}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover transition-transform duration-500 group-hover:scale-105'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-jet/5'>
              <span className='font-kanit text-3xl tracking-widest text-jet/20'>
                DLX
              </span>
            </div>
          )}
        </AspectRatio>
      </div>

      <div className='flex flex-1 flex-col gap-3 p-5'>
        {post.tags?.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {post.tags.slice(0, 2).map(tag => (
              <Badge
                key={tag}
                className='bg-saffron/20 text-jet border-transparent uppercase tracking-wide text-[11px]'
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <h2 className='font-kanit text-xl font-semibold leading-snug text-jet tracking-wide'>
          {post.title}
        </h2>

        <p className='line-clamp-2 text-sm leading-relaxed text-jet/70'>
          {post.excerpt}
        </p>

        <div className='mt-auto flex items-center gap-2 pt-2 text-xs text-jet/50'>
          <time dateTime={post.publishedAt.toISOString()}>
            {dateFormatter.format(post.publishedAt)}
          </time>
          {post.readingTime ? (
            <>
              <span aria-hidden>·</span>
              <span>{post.readingTime} min de lectura</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
