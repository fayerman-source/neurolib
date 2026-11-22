import type { MetadataRoute } from 'next';
import { getPublicAssetPath } from '@/lib/assetPath';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const rootUrl = getPublicAssetPath('/', basePath);

  return {
    name: 'neurolib — Neurology Dot Phrases & NIHSS Calculator',
    short_name: 'neurolib',
    description:
      'Offline-capable neurology clinical documentation templates and NIHSS calculator.',
    start_url: rootUrl,
    scope: rootUrl,
    display: 'standalone',
    background_color: '#0A0F1E',
    theme_color: '#4F6EF7',
    icons: [
      {
        src: getPublicAssetPath('/icon-192.png', basePath),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: getPublicAssetPath('/icon-512.png', basePath),
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
