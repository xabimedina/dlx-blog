import { forwardRef } from 'react';
import { cn } from '@xabimedina/dlx-components';
import Link from 'next/link';

import type { LinkProps as NextLinkProps } from 'next/link';

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    NextLinkProps {
  href: NextLinkProps['href'];
}

const Underline = () => (
  <span className='absolute -bottom-1 left-1/2 w-0 h-0.5 bg-saffron transition-all duration-200 group-hover:w-full group-hover:left-0'></span>
);

export const DlxLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, children, ...props }, ref) => (
    <Link
      ref={ref}
      {...props}
      className={cn(
        'relative cursor-pointer group transition-all duration-200',
        className
      )}
    >
      {children}
      <Underline />
    </Link>
  )
);

DlxLink.displayName = 'DlxLink';
