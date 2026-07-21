'use client';

import { DlxNavbar } from '@xabimedina/dlx-components';
import { NavLinks } from '@/components/nav-links';
import { PostCard } from './post-card';
import { StickyFooter } from '@/components/sticky-footer';
import type { FooterProject } from '@/components/sticky-footer';
import type { BlogPostCard } from '@/types/post';
import { SITE } from '@/lib/site';

export default function BlogPage({
  posts,
  footerProjects,
}: {
  posts: BlogPostCard[];
  footerProjects: FooterProject[];
}) {
  return (
    <>
      <div className='relative z-[40] bg-smoke'>
        <DlxNavbar type='smoke'>
          <NavLinks />
        </DlxNavbar>

        <main className='min-h-screen bg-smoke'>
          {/* Cabecera editorial */}
          <header className='mx-auto max-w-6xl px-4 pt-32 pb-12'>
            <p className='font-montserrat text-sm uppercase tracking-[0.3em] text-saffron'>
              Despeja la X
            </p>
            <h1 className='mt-4 font-kanit text-6xl font-bold tracking-widest text-jet md:text-7xl'>
              Blog
            </h1>
            <p className='mt-6 max-w-2xl text-lg leading-relaxed text-jet/70'>
              Ideas, procesos y reflexiones sobre arquitectura, interiorismo y el
              diseño de los espacios que habitamos.
            </p>
          </header>

          {/* Listado */}
          <section className='mx-auto max-w-6xl px-4 pb-24'>
            {posts.length === 0 ? (
              <p className='py-24 text-center text-jet/50'>
                Todavía no hay artículos publicados. Vuelve pronto.
              </p>
            ) : (
              <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
                {posts.map(post => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <StickyFooter lastProjects={footerProjects} />
    </>
  );
}
