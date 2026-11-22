import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { collectExportAssets, renderServiceWorkerJs } from '../src/lib/pwaSwGenerator';

const outDir = join(process.cwd(), 'out');
if (!existsSync(outDir)) {
  throw new Error(`Expected static export directory at ${outDir}`);
}

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGithubPages ? '/neurolib' : '';

const { urls, versionHash } = collectExportAssets(outDir, basePath);
const swSource = renderServiceWorkerJs(urls, versionHash, basePath);
const swPath = join(outDir, 'sw.js');
writeFileSync(swPath, swSource, 'utf8');

console.log(`Generated ${swPath} (${urls.length} precached URLs, version ${versionHash})`);
