export type EhrDialect = 'epic' | 'cerner' | 'raw';

export interface EhrDialectOption {
  id: EhrDialect;
  label: string;
  wildcard: string | null;
  description: string;
}

export const EHR_DIALECT_OPTIONS: readonly EhrDialectOption[] = [
  {
    id: 'epic',
    label: 'Epic (***)',
    wildcard: '***',
    description: 'Converts unfilled blanks to *** for Epic F2 wildcard navigation',
  },
  {
    id: 'cerner',
    label: 'Cerner (_)',
    wildcard: '_',
    description: 'Converts unfilled blanks to _ for Cerner AutoText navigation',
  },
  {
    id: 'raw',
    label: 'Raw ([...])',
    wildcard: null,
    description: 'Keeps original bracketed placeholders when unfilled',
  },
];

export interface TemplateSlot {
  id: string;
  raw: string;
  placeholder: string;
  label: string;
  choices: string[] | null;
}

export interface CompiledTemplateResult {
  text: string;
  totalSlots: number;
  filledSlots: number;
  unfilledBlanks: number;
  wildcard: string | null;
}

const UNIT_RATIO_PATTERN =
  /\b(mg|mcg|ug|g|kg|ml|dl|l|mmol|meq|iu|u)\/(kg|dl|ml|l|min|hr|h|day|d)\b/i;

function isCheckboxToken(inner: string): boolean {
  const trimmed = inner.trim().toLowerCase();
  return trimmed === '' || trimmed === 'x';
}

function parseSlotChoices(inner: string): string[] | null {
  if (!inner.includes('/')) return null;
  if (UNIT_RATIO_PATTERN.test(inner)) return null;
  if (inner.trim().toUpperCase() === 'DATE/TIME') return null;

  const parts = inner
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return parts.length >= 2 ? parts : null;
}

function deriveSlotLabel(
  lineBeforeSlot: string,
  segmentSincePrevSlot: string,
  inner: string,
  hasChoices: boolean
): string {
  const cleanPrefix = (raw: string) =>
    raw
      .replace(/^[\s\-*□•]+/, '')
      .replace(/^\[\s*\]\s*/, '')
      .replace(/[:\-\s]+$/, '')
      .trim();

  const segmentLabel = cleanPrefix(segmentSincePrevSlot);
  const fullLineLabel = cleanPrefix(lineBeforeSlot);

  if (segmentLabel.length > 0 && segmentLabel.length <= 48 && segmentSincePrevSlot.includes(':')) {
    return segmentLabel;
  }

  if (fullLineLabel.length > 0 && fullLineLabel.length <= 48 && lineBeforeSlot.includes(':')) {
    if (!hasChoices && inner.length <= 16 && !fullLineLabel.toLowerCase().includes(inner.toLowerCase())) {
      return `${fullLineLabel} (${inner})`;
    }
    return fullLineLabel;
  }

  if (segmentLabel.length > 0 && segmentLabel.length <= 32 && /onset|side|type|location|severity/i.test(segmentLabel)) {
    return segmentLabel;
  }

  return inner;
}

export function getDialectWildcard(dialect: EhrDialect): string | null {
  if (dialect === 'epic') return '***';
  if (dialect === 'cerner') return '_';
  return null;
}

export function extractTemplateSlots(content: string): TemplateSlot[] {
  const slots: TemplateSlot[] = [];
  const regex = /\[([^\]]*)\]/g;
  let match: RegExpExecArray | null;
  let slotIdx = 0;
  let prevSlotEnd = 0;

  while ((match = regex.exec(content)) !== null) {
    const raw = match[0];
    const inner = match[1].trim();
    if (isCheckboxToken(match[1])) {
      continue;
    }

    const matchStart = match.index;
    const lineStart = content.lastIndexOf('\n', matchStart - 1) + 1;
    const lineBeforeSlot = content.slice(lineStart, matchStart);
    const segmentStart = Math.max(lineStart, prevSlotEnd);
    const segmentSincePrevSlot = content.slice(segmentStart, matchStart);

    const choices = parseSlotChoices(inner);
    const label = deriveSlotLabel(lineBeforeSlot, segmentSincePrevSlot, inner, choices !== null);

    slots.push({
      id: `slot-${slotIdx}`,
      raw,
      placeholder: inner,
      label,
      choices,
    });

    slotIdx++;
    prevSlotEnd = matchStart + raw.length;
  }

  return slots;
}

export function compileTemplate(
  content: string,
  values: Record<string, string>,
  dialect: EhrDialect
): CompiledTemplateResult {
  const wildcard = getDialectWildcard(dialect);
  let slotIdx = 0;
  let filledSlots = 0;
  let unfilledBlanks = 0;

  let compiled = content.replace(/\[([^\]]*)\]/g, (raw, rawInner: string) => {
    if (isCheckboxToken(rawInner)) {
      return raw;
    }

    const slotId = `slot-${slotIdx}`;
    slotIdx++;

    const provided = values[slotId]?.trim();
    if (provided && provided.length > 0) {
      filledSlots++;
      return provided;
    }

    unfilledBlanks++;
    return wildcard !== null ? wildcard : raw;
  });

  compiled = compiled.replace(/_{2,}/g, (underscores) => {
    unfilledBlanks++;
    return wildcard !== null ? wildcard : underscores;
  });

  return {
    text: compiled,
    totalSlots: slotIdx,
    filledSlots,
    unfilledBlanks,
    wildcard,
  };
}
