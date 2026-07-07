'use client';

import {
  CookieConsentProvider as SharedCookieConsentProvider,
  type ConsentUpdatePayload,
} from '@xabimedina/dlx-components';
import type React from 'react';
import { trackPageView } from '@/lib/analytics';
import { SITE } from '@/lib/site';

const COOKIE_POLICY_URL = `${SITE.mainSite}/politica-de-cookies`;

export function Providers({ children }: { children: React.ReactNode }) {
  const handleConsentUpdate = (payload: ConsentUpdatePayload) => {
    if (payload.analytics) {
      trackPageView();
    }
  };

  return (
    <SharedCookieConsentProvider
      policyHref={COOKIE_POLICY_URL}
      onConsentUpdate={handleConsentUpdate}
    >
      {children}
    </SharedCookieConsentProvider>
  );
}
