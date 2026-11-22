import { categories, CategoryId, DotPhrase } from '@/data/dotPhrases';
import { filterDotPhrases } from '@/lib/filterPhrases';

export const PINNED_STORAGE_KEY = 'neurolib:pinned-ids';
export const CUSTOM_PACK_STORAGE_KEY = 'neurolib:custom-phrases';
export const MAX_PACK_BYTES = 512 * 1024;
const MAX_RAW_PARSE_BYTES = MAX_PACK_BYTES * 4;

const VALID_CATEGORIES = new Set<string>(
  categories.map((c) => c.id).filter((id) => id !== 'all')
);

export interface CustomPhrasePack {
  version: 1;
  exportedFrom: 'neurolib';
  phrases: DotPhrase[];
}

export type PackValidationResult =
  | { ok: true; phrases: DotPhrase[] }
  | { ok: false; error: string };

export type StorageSaveResult =
  | { ok: true }
  | { ok: false; error: string };

export function parsePinnedIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of parsed) {
      if (typeof item === 'string' && item.trim().length > 0 && !seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    }
    return result;
  } catch {
    return [];
  }
}

export function togglePinnedId(current: readonly string[], phraseId: string): string[] {
  if (current.includes(phraseId)) {
    return current.filter((id) => id !== phraseId);
  }
  return [...current, phraseId];
}

export interface PinnedStore {
  getPinnedIds: () => readonly string[];
  togglePin: (phraseId: string) => void;
}

export function createPinnedStore(
  storageKey: string,
  getStorage: () => Pick<Storage, 'getItem' | 'setItem'> | undefined
): PinnedStore {
  let memoryPinned: readonly string[] = [];
  let lastObservedRaw: string | null | undefined = undefined;

  return {
    getPinnedIds() {
      const storage = getStorage();
      if (storage) {
        try {
          const raw = storage.getItem(storageKey);
          if (raw !== lastObservedRaw) {
            lastObservedRaw = raw;
            memoryPinned = parsePinnedIds(raw);
          }
        } catch {
          // Fall back to in-memory pinned IDs when storage is blocked
        }
      }
      return memoryPinned;
    },
    togglePin(phraseId: string) {
      // Ensure initial stored snapshot has been loaded before applying toggle
      this.getPinnedIds();
      const next = togglePinnedId(memoryPinned, phraseId);
      memoryPinned = next;
      const serialized = JSON.stringify(next);
      const storage = getStorage();
      if (storage) {
        try {
          storage.setItem(storageKey, serialized);
          lastObservedRaw = serialized;
        } catch {
          // Keep lastObservedRaw unchanged so failed writes do not revert memoryPinned on next read
        }
      }
    },
  };
}

export function buildUniqueCustomPhraseId(
  cleanTrigger: string,
  existingPhrases: readonly DotPhrase[]
): string {
  const existingForTrigger = existingPhrases.find(
    (p) => p.trigger.toLowerCase() === cleanTrigger.toLowerCase()
  );
  if (existingForTrigger) {
    return existingForTrigger.id;
  }

  const baseSlug =
    cleanTrigger
      .replace(/^\.+/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'phrase';

  const takenIds = new Set(existingPhrases.map((p) => p.id));
  const candidateBase = `custom-${baseSlug}`;
  if (!takenIds.has(candidateBase)) {
    return candidateBase;
  }

  let suffix = 2;
  while (takenIds.has(`${candidateBase}-${suffix}`)) {
    suffix++;
  }
  return `${candidateBase}-${suffix}`;
}

export function validateCustomPackJson(rawJson: string): PackValidationResult {
  if (rawJson.length > MAX_RAW_PARSE_BYTES) {
    return { ok: false, error: 'Pack file exceeds 512 KB normalized size limit.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: 'Invalid JSON syntax.' };
  }

  const candidateList: unknown = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && 'phrases' in parsed
      ? (parsed as { phrases: unknown }).phrases
      : null;

  if (!Array.isArray(candidateList)) {
    return { ok: false, error: 'Expected a JSON array of phrases or an object with a "phrases" array.' };
  }

  const seenIds = new Set<string>();
  const seenTriggers = new Set<string>();
  const validated: DotPhrase[] = [];

  for (let i = 0; i < candidateList.length; i++) {
    const entry = candidateList[i];
    if (typeof entry !== 'object' || entry === null) {
      return { ok: false, error: `Entry #${i + 1} must be an object.` };
    }

    const rec = entry as Record<string, unknown>;
    const id = typeof rec.id === 'string' ? rec.id.trim() : '';
    const name = typeof rec.name === 'string' ? rec.name.trim() : '';
    const rawTrigger = typeof rec.trigger === 'string' ? rec.trigger.trim().toLowerCase() : '';
    const category = typeof rec.category === 'string' ? rec.category.trim() : '';
    const description = typeof rec.description === 'string' ? rec.description.trim() : '';
    const content = typeof rec.content === 'string' ? rec.content : '';
    const source = typeof rec.source === 'string' && rec.source.trim().length > 0 ? rec.source.trim() : undefined;

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
      return { ok: false, error: `Entry #${i + 1} has invalid kebab-case id "${id}".` };
    }
    if (seenIds.has(id)) {
      return { ok: false, error: `Duplicate phrase id "${id}" in pack.` };
    }
    seenIds.add(id);

    if (!/^\.[a-z0-9-]+$/.test(rawTrigger)) {
      return {
        ok: false,
        error: `Phrase "${id}" trigger "${rawTrigger}" must start with "." followed by lowercase letters, digits, or hyphens.`,
      };
    }
    if (seenTriggers.has(rawTrigger)) {
      return { ok: false, error: `Duplicate trigger "${rawTrigger}" in pack.` };
    }
    seenTriggers.add(rawTrigger);

    if (!VALID_CATEGORIES.has(category)) {
      return {
        ok: false,
        error: `Phrase "${id}" has unsupported category "${category}".`,
      };
    }

    if (name.length === 0 || description.length === 0 || content.trim().length === 0) {
      return {
        ok: false,
        error: `Phrase "${id}" requires non-empty name, description, and content.`,
      };
    }

    const tags = Array.isArray(rec.tags)
      ? rec.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim())
      : ['custom'];

    validated.push({
      id,
      name,
      trigger: rawTrigger,
      category,
      description,
      content,
      tags: tags.length > 0 ? tags : ['custom'],
      ...(source ? { source } : {}),
    });
  }

  const canonicalJson = JSON.stringify(validated);
  if (canonicalJson.length > MAX_PACK_BYTES) {
    return { ok: false, error: 'Pack exceeds 512 KB normalized size limit.' };
  }

  return { ok: true, phrases: validated };
}

export function saveCustomPhrasesToStorage(
  phrases: readonly DotPhrase[],
  storage?: Pick<Storage, 'setItem'>
): StorageSaveResult {
  const canonicalJson = JSON.stringify(phrases);
  if (canonicalJson.length > MAX_PACK_BYTES) {
    return { ok: false, error: 'Pack exceeds 512 KB normalized size limit.' };
  }

  const targetStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);

  if (!targetStorage) {
    return { ok: false, error: 'Browser storage is unavailable.' };
  }

  try {
    targetStorage.setItem(CUSTOM_PACK_STORAGE_KEY, canonicalJson);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Failed to save to browser storage (storage disabled or quota exceeded).',
    };
  }
}

export function serializeCustomPack(phrases: readonly DotPhrase[]): string {
  const payload: CustomPhrasePack = {
    version: 1,
    exportedFrom: 'neurolib',
    phrases: [...phrases],
  };
  return JSON.stringify(payload, null, 2);
}

function triggerMatchScore(phrase: DotPhrase, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;
  const trigger = phrase.trigger.toLowerCase();
  const bareTrigger = trigger.slice(1);
  const bareQuery = normalizedQuery.startsWith('.') ? normalizedQuery.slice(1) : normalizedQuery;

  if (trigger === normalizedQuery || (bareQuery.length > 0 && bareTrigger === bareQuery)) {
    return 3;
  }
  if (trigger.startsWith(normalizedQuery) || (bareQuery.length > 0 && bareTrigger.startsWith(bareQuery))) {
    return 2;
  }
  if (trigger.includes(normalizedQuery)) {
    return 1;
  }
  return 0;
}

export function mergeAndRankPhrases(
  builtInPhrases: readonly DotPhrase[],
  customPhrases: readonly DotPhrase[],
  activeCategory: CategoryId,
  searchQuery: string,
  pinnedIds: readonly string[]
): DotPhrase[] {
  // Custom phrases explicitly override built-in phrases by matching either ID or normalized .trigger,
  // ensuring a user-saved trigger (e.g. '.tpaelig' under 'custom-tpaelig') never gets shadowed by a built-in.
  const customById = new Map<string, DotPhrase>();
  const customByTrigger = new Map<string, DotPhrase>();
  for (const cp of customPhrases) {
    customById.set(cp.id, cp);
    customByTrigger.set(cp.trigger.toLowerCase(), cp);
  }

  const usedCustomIds = new Set<string>();
  const merged: DotPhrase[] = [];

  for (const bp of builtInPhrases) {
    const replacement =
      customById.get(bp.id) ?? customByTrigger.get(bp.trigger.toLowerCase());
    if (replacement) {
      if (!usedCustomIds.has(replacement.id)) {
        merged.push(replacement);
        usedCustomIds.add(replacement.id);
      }
    } else {
      merged.push(bp);
    }
  }

  for (const cp of customPhrases) {
    if (!usedCustomIds.has(cp.id)) {
      merged.push(cp);
      usedCustomIds.add(cp.id);
    }
  }

  const filtered = filterDotPhrases(merged, activeCategory, searchQuery);
  const pinnedSet = new Set(pinnedIds);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return [...filtered].sort((a, b) => {
    if (normalizedQuery.length > 0) {
      const scoreDiff = triggerMatchScore(b, normalizedQuery) - triggerMatchScore(a, normalizedQuery);
      if (scoreDiff !== 0) return scoreDiff;
    }

    const aPinned = pinnedSet.has(a.id) ? 1 : 0;
    const bPinned = pinnedSet.has(b.id) ? 1 : 0;
    return bPinned - aPinned;
  });
}

export function resolveQuickCopyPhrase(
  builtInPhrases: readonly DotPhrase[],
  customPhrases: readonly DotPhrase[],
  activeCategory: CategoryId,
  liveQuery: string,
  pinnedIds: readonly string[]
): DotPhrase | undefined {
  if (liveQuery.trim().length === 0) return undefined;
  return mergeAndRankPhrases(
    builtInPhrases,
    customPhrases,
    activeCategory,
    liveQuery,
    pinnedIds
  )[0];
}
