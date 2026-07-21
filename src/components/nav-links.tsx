'use client';
import { DlxLink } from './dlx-link';
import { SITE } from '@/lib/site';

export function NavLinks() {
  return (
    <>
      <div className='px-4 py-2'>
        <a
          href={SITE.mainSite}
          className='relative cursor-pointer group transition-all duration-200 text-jet'
        >
          Inicio
          <span className='absolute -bottom-1 left-1/2 w-0 h-0.5 bg-saffron transition-all duration-200 group-hover:w-full group-hover:left-0'></span>
        </a>
      </div>
      <div className='px-4 py-2'>
        <a
          href={`${SITE.mainSite}/proyectos`}
          className='relative cursor-pointer group transition-all duration-200 text-jet'
        >
          Proyectos
          <span className='absolute -bottom-1 left-1/2 w-0 h-0.5 bg-saffron transition-all duration-200 group-hover:w-full group-hover:left-0'></span>
        </a>
      </div>
      <div className='px-4 py-2'>
        <DlxLink href='/' className='text-jet'>
          Blog
        </DlxLink>
      </div>
    </>
  );
}
