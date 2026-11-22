import { DotPhrase } from '@/data/dotPhrases';
import { compileTemplate, EhrDialect } from '@/lib/templateCompiler';

export interface EspansoMatchEntry {
  trigger: string;
  label: string;
  force_clipboard: boolean;
  replace: string;
}

export function generateEspansoYaml(
  phrases: readonly DotPhrase[],
  dialect: EhrDialect = 'raw'
): string {
  const header = [
    '# neurolib Espanso v2 text-expander package',
    `# Dialect: ${dialect}`,
    '# Install: copy this file into your Espanso match/ directory (e.g. ~/.config/espanso/match/neurolib.yml)',
    '',
    'matches:',
  ];

  const body: string[] = [];
  for (const phrase of phrases) {
    const compiledText =
      dialect === 'raw'
        ? phrase.content
        : compileTemplate(phrase.content, {}, dialect).text;

    const label = `${phrase.name} — ${phrase.description}`;
    body.push(`  - trigger: ${JSON.stringify(phrase.trigger)}`);
    body.push(`    label: ${JSON.stringify(label)}`);
    body.push(`    force_clipboard: true`);
    body.push(`    replace: ${JSON.stringify(compiledText)}`);
  }

  return [...header, ...body, ''].join('\n');
}

export function parseEspansoYaml(yamlContent: string): EspansoMatchEntry[] {
  const lines = yamlContent.split(/\r?\n/);
  const entries: EspansoMatchEntry[] = [];
  let inMatches = false;
  let current: Partial<EspansoMatchEntry> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }

    if (!inMatches) {
      if (trimmed === 'matches:') {
        inMatches = true;
        continue;
      }
      throw new Error(`Unexpected line before "matches:" at line ${i + 1}: ${rawLine}`);
    }

    if (/^\s*-\s+trigger:\s*/.test(rawLine)) {
      if (current) {
        entries.push(finalizeEntry(current, i));
      }
      const valStr = rawLine.replace(/^\s*-\s+trigger:\s*/, '').trim();
      current = { trigger: parseDoubleQuotedYamlScalar(valStr, i + 1) };
      continue;
    }

    if (!current) {
      throw new Error(`Unexpected property outside match item at line ${i + 1}: ${rawLine}`);
    }

    if (/^\s+label:\s*/.test(rawLine)) {
      const valStr = rawLine.replace(/^\s+label:\s*/, '').trim();
      current.label = parseDoubleQuotedYamlScalar(valStr, i + 1);
    } else if (/^\s+force_clipboard:\s*/.test(rawLine)) {
      const valStr = rawLine.replace(/^\s+force_clipboard:\s*/, '').trim();
      if (valStr !== 'true' && valStr !== 'false') {
        throw new Error(`Invalid boolean for force_clipboard at line ${i + 1}: ${valStr}`);
      }
      current.force_clipboard = valStr === 'true';
    } else if (/^\s+replace:\s*/.test(rawLine)) {
      const valStr = rawLine.replace(/^\s+replace:\s*/, '').trim();
      current.replace = parseDoubleQuotedYamlScalar(valStr, i + 1);
    } else {
      throw new Error(`Unsupported Espanso match field at line ${i + 1}: ${rawLine}`);
    }
  }

  if (current) {
    entries.push(finalizeEntry(current, lines.length));
  }

  if (!inMatches) {
    throw new Error('Missing top-level "matches:" key in Espanso YAML.');
  }

  return entries;
}

function parseDoubleQuotedYamlScalar(rawScalar: string, lineNumber: number): string {
  if (!rawScalar.startsWith('"') || !rawScalar.endsWith('"')) {
    throw new Error(`Expected double-quoted YAML scalar at line ${lineNumber}`);
  }
  const parsed: unknown = JSON.parse(rawScalar);
  if (typeof parsed !== 'string') {
    throw new Error(`Expected string scalar at line ${lineNumber}`);
  }
  return parsed;
}

function finalizeEntry(partial: Partial<EspansoMatchEntry>, lineNumber: number): EspansoMatchEntry {
  if (
    typeof partial.trigger !== 'string' ||
    typeof partial.label !== 'string' ||
    typeof partial.force_clipboard !== 'boolean' ||
    typeof partial.replace !== 'string'
  ) {
    throw new Error(`Incomplete Espanso match entry before line ${lineNumber}`);
  }
  return {
    trigger: partial.trigger,
    label: partial.label,
    force_clipboard: partial.force_clipboard,
    replace: partial.replace,
  };
}
