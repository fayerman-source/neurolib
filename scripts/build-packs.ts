import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { dotPhrases } from '../src/data/dotPhrases';
import { writeExpanderPacksToDir } from '../src/lib/espansoPackWriter';

const outDir = join(process.cwd(), 'out');
if (!existsSync(outDir)) {
  throw new Error(`Expected static export directory at ${outDir}`);
}

const written = writeExpanderPacksToDir(outDir, dotPhrases);
for (const path of written) {
  console.log(`Generated expander pack: ${path} (${dotPhrases.length} phrases)`);
}
