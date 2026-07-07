'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { GA_MEASUREMENT_ID } from './constants';

export function trackPageView(url?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const pageUrl = new URL(url ?? window.location.href, window.location.origin);

  sendGAEvent('config', GA_MEASUREMENT_ID, {
    page_path: `${pageUrl.pathname}${pageUrl.search}${pageUrl.hash}`,
    page_location: pageUrl.href,
    page_title: document.title,
  });
}
