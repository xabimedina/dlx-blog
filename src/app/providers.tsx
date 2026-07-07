'use client';

import { CookieConsentProvider } from '@xabimedina/dlx-components';
import { SITE } from '@/lib/site';

const COOKIE_POLICY_URL = `${SITE.mainSite}/politica-de-cookies`;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider policyHref={COOKIE_POLICY_URL}>
      {children}
    </CookieConsentProvider>
  );
}
