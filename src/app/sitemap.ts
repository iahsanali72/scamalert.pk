import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scamalert.pk';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    {
      url: `${SITE_URL}/how-to-spot-online-scams-pakistan`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/how-to-verify-online-seller-pakistan`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.rpc('public_expired_reports');
    const reportRoutes: MetadataRoute.Sitemap = ((data || []) as { report_number: string }[])
      .filter((r) => r.report_number)
      .map((r) => ({
        url: `${SITE_URL}/report/${encodeURIComponent(r.report_number)}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    return [...staticRoutes, ...reportRoutes];
  } catch {
    return staticRoutes;
  }
}
