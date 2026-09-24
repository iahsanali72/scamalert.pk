import type { Metadata, Viewport } from 'next';
import {
  IBM_Plex_Mono,
  Instrument_Sans,
  Space_Grotesk,
} from 'next/font/google';
import Script from 'next/script';
import { preload } from 'react-dom';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#dc2f26',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const SITE_NAME = 'ScamAlert.pk';
const SITE_TITLE = 'ScamAlert.pk - Report Today, Protect Others';
const SITE_DESCRIPTION =
  'Verify Pakistani online stores and sellers before you pay, and file structured fraud disputes when something goes wrong. A free public database of reported scams, blacklisted brands, and dispute outcomes.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'online scam Pakistan',
    'report online fraud Pakistan',
    'verify online seller Pakistan',
    'blacklisted brands Pakistan',
    'ecommerce scam Pakistan',
    'fraud dispute Pakistan',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  alternates: {
    canonical: '/',
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
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/pakistan-hero-og.jpg',
        width: 2043,
        height: 770,
        alt: 'ScamAlert.pk — report and verify online sellers in Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/images/pakistan-hero-og.jpg'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      description: SITE_DESCRIPTION,
      sameAs: [
        'https://www.facebook.com/ScamAlert.pk',
        'https://www.instagram.com/Scam_alert.pk',
        'https://x.com/scamAlertpk',
        'https://www.tiktok.com/@ScamAlert.pk',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preload('/images/pakistan-hero-bg.webp', { as: 'image' });

  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Script id="register-service-worker" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              });
            }
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
