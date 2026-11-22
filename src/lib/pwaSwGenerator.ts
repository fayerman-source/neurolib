import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const PRECACHE_EXTENSIONS = new Set([
  '.html',
  '.js',
  '.css',
  '.png',
  '.ico',
  '.svg',
  '.webmanifest',
  '.json',
  '.woff2',
]);

export interface ExportAssetSummary {
  urls: string[];
  versionHash: string;
}

function walkDirectory(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkDirectory(fullPath));
    } else if (stat.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

export function collectExportAssets(outDir: string, basePath: string = ''): ExportAssetSummary {
  const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const files = walkDirectory(outDir).sort();
  const hasher = createHash('sha256');
  const urlSet = new Set<string>();

  urlSet.add(`${cleanBase}/`);

  for (const fullPath of files) {
    const relPosix = relative(outDir, fullPath).split(sep).join('/');
    if (relPosix === 'sw.js' || relPosix.endsWith('.map') || relPosix.startsWith('__next.')) {
      continue;
    }

    const dotIdx = relPosix.lastIndexOf('.');
    const ext = dotIdx >= 0 ? relPosix.slice(dotIdx).toLowerCase() : '';
    if (!PRECACHE_EXTENSIONS.has(ext)) {
      continue;
    }

    const urlPath = `${cleanBase}/${relPosix}`;
    urlSet.add(urlPath);

    hasher.update(relPosix);
    hasher.update(readFileSync(fullPath));
  }

  const urls = [...urlSet].sort();
  const versionHash = hasher.digest('hex').slice(0, 10);
  return { urls, versionHash };
}

export function renderServiceWorkerJs(
  urls: readonly string[],
  versionHash: string,
  basePath: string = ''
): string {
  const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const fallbackIndexUrl = `${cleanBase}/index.html`;
  const fallbackRootUrl = `${cleanBase}/`;

  return `// Static offline precache service worker for neurolib
const CACHE_PREFIX = "neurolib-precache-";
const CACHE_NAME = CACHE_PREFIX + ${JSON.stringify(versionHash)};
const FALLBACK_INDEX_URL = ${JSON.stringify(fallbackIndexUrl)};
const FALLBACK_ROOT_URL = ${JSON.stringify(fallbackRootUrl)};
const PRECACHE_URLS = ${JSON.stringify(urls, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches
              .match(FALLBACK_INDEX_URL)
              .then((idxResp) => idxResp || caches.match(FALLBACK_ROOT_URL));
          }
          return Response.error();
        });
    })
  );
});
`;
}
