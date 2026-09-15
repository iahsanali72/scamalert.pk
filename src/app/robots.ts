import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/case/', '/respond/', '/reset-password', '/auth/', '/api/', '/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
