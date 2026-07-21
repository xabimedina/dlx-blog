'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DlxNavbar, Badge } from '@xabimedina/dlx-components';
import { ArrowLeft } from 'lucide-react';
import { NavLinks } from '@/components/nav-links';
import { PostGallery } from './post-gallery';
import { StickyFooter } from '@/components/sticky-footer';
import type { FooterProject } from '@/components/sticky-footer';
import type { BlogPost } from '@/types/post';
import { SITE } from '@/lib/site';

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function PostDetail({
  post,
  footerProjects,
}: {
  post: BlogPost;
  footerProjects: FooterProject[];
}) {
  return (
    <>
      <div className='relative z-[40] bg-smoke'>
        <DlxNavbar type='smoke'>
          <NavLinks />
        </DlxNavbar>

        <main className='min-h-screen bg-smoke pb-24'>
          {/* Cabecera del artículo */}
          <header className='mx-auto max-w-4xl px-4 pt-32'>
            <Link
              href='/'
              className='group inline-flex items-center gap-2 text-sm text-jet/60 transition-colors hover:text-jet'
            >
              <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
              Volver al blog
            </Link>

            {post.tags?.length > 0 && (
              <div className='mt-8 flex flex-wrap gap-2'>
                {post.tags.map(tag => (
                  <Badge
                    key={tag}
                    className='bg-saffron/20 text-jet border-transparent uppercase tracking-wide text-[11px]'
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className='mt-5 font-kanit text-4xl font-bold leading-tight tracking-wide text-jet md:text-6xl'>
              {post.title}
            </h1>

            <div className='mt-6 flex items-center gap-2 text-sm text-jet/50'>
              <span>{post.author}</span>
              <span aria-hidden>·</span>
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
          </header>

          {/* Imagen de portada */}
          {post.coverImage && (
            <figure className='mx-auto mt-12 max-w-5xl px-4'>
              <div className='relative aspect-[16/9] overflow-hidden rounded-2xl bg-jet/5'>
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes='(max-width: 1024px) 100vw, 1024px'
                  className='object-cover'
                />
              </div>
            </figure>
          )}

          {/* Resumen destacado */}
          {post.excerpt && (
            <p className='mx-auto mt-12 max-w-3xl px-4 font-kanit text-xl leading-relaxed text-jet/80'>
              {post.excerpt}
            </p>
          )}

          {/* Contenido enriquecido (HTML del editor) */}
          <article className='mx-auto mt-10 max-w-3xl px-4'>
            <div
              className='post-content'
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Galería opcional */}
          <PostGallery images={post.images} title={post.title} />
        </main>
      </div>

      <StickyFooter lastProjects={footerProjects} />
    </>
  );
}
