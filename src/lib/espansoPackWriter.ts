import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DotPhrase } from '@/data/dotPhrases';
import { EhrDialect } from '@/lib/templateCompiler';
import { generateEspansoYaml } from '@/lib/espansoExporter';

export function writeExpanderPacksToDir(
  outDir: string,
  phrases: readonly DotPhrase[]
): string[] {
  const packsDir = join(outDir, 'packs');
  mkdirSync(packsDir, { recursive: true });

  const dialects: readonly EhrDialect[] = ['epic', 'cerner', 'raw'];
  const writtenPaths: string[] = [];

  for (const dialect of dialects) {
    const filename =
      dialect === 'raw'
        ? 'neurolib.espanso.yml'
        : `neurolib-${dialect}.espanso.yml`;
    const fullPath = join(packsDir, filename);
    writeFileSync(fullPath, generateEspansoYaml(phrases, dialect), 'utf8');
    writtenPaths.push(fullPath);
  }

  return writtenPaths;
}
