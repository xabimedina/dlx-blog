'use client';

import { DlxFooter } from '@xabimedina/dlx-components';
import { useEffect, useRef, useState } from 'react';

import type { ComponentProps, ComponentType } from 'react';

export interface FooterProject {
  name: string;
  href: string;
}

type StickyFooterProps = Omit<
  ComponentProps<typeof DlxFooter>,
  'lastProjects'
> & {
  lastProjects?: FooterProject[];
};

const FooterWithProjects = DlxFooter as ComponentType<StickyFooterProps>;

export function StickyFooter(props: StickyFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setFooterHeight(Math.ceil(rect.height));
    };

    update();

    let ro: ResizeObserver | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    } else {
      intervalId = setInterval(update, 300);
    }

    return () => {
      ro?.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <div style={{ height: footerHeight }} aria-hidden='true' />
      <section ref={footerRef} className='fixed bottom-0 z-[30] w-full'>
        <FooterWithProjects {...props} />
      </section>
    </>
  );
}
