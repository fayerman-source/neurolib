'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import SearchBar, { QuickCopyFeedback } from '@/components/SearchBar';
import CategoryNav from '@/components/CategoryNav';
import PhraseCard from '@/components/PhraseCard';
import NIHSSCalculator from '@/components/NIHSSCalculator';
import EhrDialectSelector from '@/components/EhrDialectSelector';
import CustomPackPanel from '@/components/CustomPackPanel';
import { dotPhrases, CategoryId, DotPhrase } from '@/data/dotPhrases';
import { copyTextToClipboard } from '@/lib/clipboard';
import {
  compileTemplate,
  createDialectStore,
  EhrDialect,
  getPhraseSlotKey,
} from '@/lib/templateCompiler';
import {
  createPinnedStore,
  CUSTOM_PACK_STORAGE_KEY,
  mergeAndRankPhrases,
  PINNED_STORAGE_KEY,
  resolveQuickCopyPhrase,
  saveCustomPhrasesToStorage,
  StorageSaveResult,
  validateCustomPackJson,
} from '@/lib/packStorage';

const DIALECT_STORAGE_KEY = 'neurolib:ehr-dialect';
const EMPTY_IDS: readonly string[] = [];
const EMPTY_PHRASES: readonly DotPhrase[] = [];

const getSafeLocalStorage = (): Storage | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

const dialectStore = createDialectStore(DIALECT_STORAGE_KEY, getSafeLocalStorage);
const pinnedStore = createPinnedStore(PINNED_STORAGE_KEY, getSafeLocalStorage);

let cachedCustomRaw: string | null = null;
let cachedCustomParsed: readonly DotPhrase[] = EMPTY_PHRASES;

function subscribeStore(callback: () => void): () => void {
  window.addEventListener('neurolib-store-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('neurolib-store-change', callback);
    window.removeEventListener('storage', callback);
  };
}

function notifyStoreChange() {
  window.dispatchEvent(new Event('neurolib-store-change'));
}

function getClientDialect(): EhrDialect {
  return dialectStore.getDialect();
}

function getServerDialect(): EhrDialect {
  return 'epic';
}

function getClientPinnedIds(): readonly string[] {
  return pinnedStore.getPinnedIds();
}

function getServerPinnedIds(): readonly string[] {
  return EMPTY_IDS;
}

function getClientCustomPhrases(): readonly DotPhrase[] {
  const storage = getSafeLocalStorage();
  if (!storage) return EMPTY_PHRASES;
  try {
    const raw = storage.getItem(CUSTOM_PACK_STORAGE_KEY);
    if (raw !== cachedCustomRaw) {
      cachedCustomRaw = raw;
      if (!raw) {
        cachedCustomParsed = EMPTY_PHRASES;
      } else {
        const res = validateCustomPackJson(raw);
        cachedCustomParsed = res.ok ? res.phrases : EMPTY_PHRASES;
      }
    }
    return cachedCustomParsed;
  } catch {
    return EMPTY_PHRASES;
  }
}

function getServerCustomPhrases(): readonly DotPhrase[] {
  return EMPTY_PHRASES;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNIHSS, setShowNIHSS] = useState(false);
  const [showCustomPack, setShowCustomPack] = useState(false);
  const [quickCopyFeedback, setQuickCopyFeedback] = useState<QuickCopyFeedback | null>(null);
  // Keyed by getPhraseSlotKey(phrase) (id + content), so filtering preserves active drafts
  // while replacing a phrase's content via custom pack cleanly isolates/resets slot values.
  const [slotValuesByPhrase, setSlotValuesByPhrase] = useState<
    Record<string, Record<string, string>>
  >({});

  const ehrDialect = useSyncExternalStore(subscribeStore, getClientDialect, getServerDialect);
  const pinnedIds = useSyncExternalStore(subscribeStore, getClientPinnedIds, getServerPinnedIds);
  const customPhrases = useSyncExternalStore(
    subscribeStore,
    getClientCustomPhrases,
    getServerCustomPhrases
  );

  const customIdSet = useMemo(() => new Set(customPhrases.map((p) => p.id)), [customPhrases]);
  const pinnedIdSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  const filteredPhrases = useMemo(() => {
    return mergeAndRankPhrases(
      dotPhrases,
      customPhrases,
      activeCategory,
      searchQuery,
      pinnedIds
    );
  }, [customPhrases, activeCategory, searchQuery, pinnedIds]);

  const handleDialectChange = (nextDialect: EhrDialect) => {
    dialectStore.setDialect(nextDialect);
    notifyStoreChange();
  };

  const handleTogglePin = (phraseId: string) => {
    pinnedStore.togglePin(phraseId);
    notifyStoreChange();
  };

  const handlePhraseSlotsChange = (
    slotKey: string,
    nextValues: Record<string, string>
  ) => {
    setSlotValuesByPhrase((prev) => ({
      ...prev,
      [slotKey]: nextValues,
    }));
  };

  const handleSaveCustomPhrases = (next: DotPhrase[]): StorageSaveResult => {
    const res = saveCustomPhrasesToStorage(next);
    if (res.ok) {
      notifyStoreChange();
    }
    return res;
  };

  const handleDeleteCustomPhrase = (phraseId: string) => {
    handleSaveCustomPhrases(customPhrases.filter((p) => p.id !== phraseId));
  };

  const resolveTopMatchTrigger = (liveQuery: string): string | undefined => {
    return resolveQuickCopyPhrase(
      dotPhrases,
      customPhrases,
      activeCategory,
      liveQuery,
      pinnedIds
    )?.trigger;
  };

  const handleQuickCopyTopMatch = async (liveQuery: string) => {
    const top = resolveQuickCopyPhrase(
      dotPhrases,
      customPhrases,
      activeCategory,
      liveQuery,
      pinnedIds
    );
    if (!top) return;
    const activeSlots = slotValuesByPhrase[getPhraseSlotKey(top)] ?? {};
    const compiled = compileTemplate(top.content, activeSlots, ehrDialect);
    const ok = await copyTextToClipboard(compiled.text);
    if (ok) {
      setQuickCopyFeedback({ status: 'copied', trigger: top.trigger });
      setTimeout(() => {
        setQuickCopyFeedback((prev) => (prev?.status === 'copied' ? null : prev));
      }, 1800);
    } else {
      setQuickCopyFeedback({
        status: 'error',
        trigger: top.trigger,
        fallbackText: compiled.text,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#4F6EF7] focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Top Section - Navigation and Identity */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #4F6EF7, #7B5EA7)',
                boxShadow: '0 4px 12px rgba(79, 110, 247, 0.4)',
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">neurolib</h1>
              <p className="text-xs text-white/45">High-performance neurology templates</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCustomPack(!showCustomPack)}
              aria-expanded={showCustomPack}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                border: showCustomPack ? 'none' : '1px solid rgba(255, 255, 255, 0.14)',
                color: showCustomPack ? 'white' : 'rgba(255, 255, 255, 0.75)',
                background: showCustomPack
                  ? 'linear-gradient(135deg, #4F6EF7, #7B5EA7)'
                  : 'rgba(255, 255, 255, 0.05)',
              }}
            >
              Custom Pack{customPhrases.length > 0 ? ` (${customPhrases.length})` : ''}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowNIHSS(!showNIHSS);
                if (!showNIHSS) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                border: showNIHSS ? 'none' : '1px solid rgba(79, 110, 247, 0.4)',
                color: showNIHSS ? 'white' : '#7C9FFF',
                background: showNIHSS
                  ? 'linear-gradient(135deg, #4F6EF7, #7B5EA7)'
                  : 'rgba(79, 110, 247, 0.08)',
                boxShadow: showNIHSS ? '0 4px 12px rgba(79, 110, 247, 0.4)' : 'none',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              NIHSS Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Primary Action Area - Search, Categories, and Dialect */}
      <div
        className="sticky top-0 z-50 border-y border-white/5"
        style={{
          backdropFilter: 'blur(16px)',
          background: 'rgba(11, 15, 26, 0.7)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <SearchBar
              onSearch={setSearchQuery}
              topMatchTrigger={filteredPhrases[0]?.trigger}
              resolveTopMatchTrigger={resolveTopMatchTrigger}
              onQuickCopyTopMatch={handleQuickCopyTopMatch}
              quickCopyFeedback={quickCopyFeedback}
              onDismissQuickCopyFeedback={() => setQuickCopyFeedback(null)}
            />
            <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            <EhrDialectSelector dialect={ehrDialect} onChange={handleDialectChange} />
          </div>
        </div>
      </div>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        {showCustomPack && (
          <div className="mb-10 animate-slide-down">
            <CustomPackPanel
              customPhrases={customPhrases}
              onSaveCustomPhrases={handleSaveCustomPhrases}
            />
          </div>
        )}

        {showNIHSS && (
          <div className="mb-12 animate-slide-down">
            <NIHSSCalculator />
          </div>
        )}

        <div className="mb-6 flex items-center justify-end">
          <p
            className="text-[10px] uppercase tracking-widest font-semibold text-white/20"
            aria-live="polite"
          >
            {filteredPhrases.length} template{filteredPhrases.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredPhrases.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {filteredPhrases.map((phrase) => {
              const slotKey = getPhraseSlotKey(phrase);
              return (
                <PhraseCard
                  key={slotKey}
                  phrase={phrase}
                  dialect={ehrDialect}
                  slotValues={slotValuesByPhrase[slotKey]}
                  onSlotValuesChange={(next) => handlePhraseSlotsChange(slotKey, next)}
                  isPinned={pinnedIdSet.has(phrase.id)}
                  onTogglePin={handleTogglePin}
                  isCustom={customIdSet.has(phrase.id)}
                  onDeleteCustom={handleDeleteCustomPhrase}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/5">
              <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1 text-white/90">No templates found</h3>
            <p className="text-sm text-white/45">Try adjusting your search or category filter</p>
          </div>
        )}
      </main>
    </div>
  );
}
