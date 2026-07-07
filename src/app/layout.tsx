import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { montserrat, kanit } from '@/assets/fonts';
import { SITE } from '@/lib/site';
import { GA_MEASUREMENT_ID } from '@/lib/analytics/constants';
import { Providers } from './providers';
import '@/assets/styles/globals.css';

const CONSENT_STORAGE_KEY = 'dlx_cookie_consent';
const CONSENT_VERSION = 1;

export const metadata: Metadata = {
  title: {
    default: 'Blog · Despeja la X - Arquitectura e Interiorismo',
    template: '%s | Blog Despeja la X',
  },
  description: SITE.description,
  keywords:
    'blog arquitectura, interiorismo, diseño, reforma, hogar, despeja la x, diseño interior',
  authors: [{ name: SITE.author }],
  creator: SITE.author,
  publisher: SITE.author,
  metadataBase: new URL(SITE.url),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: 'Blog · Despeja la X - Arquitectura e Interiorismo',
    description: SITE.description,
    images: [
      {
        url: '/brand/dlx-logo-black.png',
        width: 1200,
        height: 630,
        alt: 'Despeja la X',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog · Despeja la X',
    description: SITE.description,
    images: ['/brand/dlx-logo-black.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F4F3F1',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='es'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
        <link rel='dns-prefetch' href='https://storage.googleapis.com' />
        <Script id='ga-consent-mode' strategy='beforeInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){window.dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied'
            });
            try {
              var storedConsent = window.localStorage.getItem('${CONSENT_STORAGE_KEY}');
              if (storedConsent) {
                var consentPreference = JSON.parse(storedConsent);
                if (consentPreference.version === ${CONSENT_VERSION} && consentPreference.analytics === true) {
                  gtag('consent', 'update', {
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied',
                    analytics_storage: 'granted'
                  });
                }
              }
            } catch (error) {}
          `}
        </Script>
      </head>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <body
        className={`${montserrat.variable} ${kanit.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
