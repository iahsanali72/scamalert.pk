import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'ScamAlert.pk - Report Today, Protect Others',
    short_name: 'ScamAlert.pk',
    description:
      'Verify Pakistani online stores and sellers before you pay, and file structured fraud disputes when something goes wrong.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5f2',
    theme_color: '#dc2f26',
    orientation: 'portrait-primary',
    categories: ['shopping', 'utilities', 'lifestyle'],
    prefer_related_applications: false,
    screenshots: [
      {
        src: '/screenshots/wide-home.png',
        sizes: '1280x800',
        type: 'image/png',
        form_factor: 'wide',
        label: 'ScamAlert.pk homepage on desktop',
      },
      {
        src: '/screenshots/narrow-home.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'ScamAlert.pk homepage on mobile',
      },
    ],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
