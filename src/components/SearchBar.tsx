'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  topMatchTrigger?: string;
  onQuickCopyTopMatch?: () => void;
  quickCopiedTrigger?: string | null;
}

export default function SearchBar({
  onSearch,
  topMatchTrigger,
  onQuickCopyTopMatch,
  quickCopiedTrigger,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target !== null &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (!isEditable && e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && query.length > 0) {
      e.preventDefault();
      handleClear();
    } else if (e.key === 'Enter' && query.trim().length > 0 && onQuickCopyTopMatch) {
      e.preventDefault();
      onQuickCopyTopMatch();
    }
  };

  return (
    <div className="relative group">
      <input
        ref={inputRef}
        type="text"
        aria-label="Search dot phrases or triggers"
        placeholder="Search phrases or type .trigger (press / or ⌘K)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleInputKeyDown}
        className="w-full px-4 py-3 pl-12 pr-36 text-base rounded-xl transition-all outline-none"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#E2E8F0',
          height: '48px',
        }}
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
        style={{ color: '#4F6EF7' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {quickCopiedTrigger ? (
          <span
            role="status"
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(34, 197, 94, 0.18)', color: '#22C55E' }}
          >
            Copied {quickCopiedTrigger}
          </span>
        ) : query.trim().length > 0 && topMatchTrigger ? (
          <span
            className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(79, 110, 247, 0.15)', color: '#7C9FFF' }}
          >
            ↵ {topMatchTrigger}
          </span>
        ) : !query ? (
          <kbd
            className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            / or ⌘K
          </kbd>
        ) : null}

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="transition-colors hover:text-white"
            style={{ color: 'rgba(255, 255, 255, 0.45)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <style jsx global>{`
        input[type="text"]::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        input[type="text"]:focus {
          border-color: #4F6EF7 !important;
          box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
