'use client';

import { useState, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import CategoryNav from '@/components/CategoryNav';
import PhraseCard from '@/components/PhraseCard';
import NIHSSCalculator from '@/components/NIHSSCalculator';
import { dotPhrases, CategoryId } from '@/data/dotPhrases';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNIHSS, setShowNIHSS] = useState(false);

  const filteredPhrases = useMemo(() => {
    return dotPhrases.filter((phrase) => {
      const matchesCategory = activeCategory === 'all' || phrase.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        phrase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phrase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phrase.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#4F6EF7] focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>
      <header 
        className="sticky top-0 z-50"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(10, 15, 30, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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
                <h1 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>Neuro Note Macros</h1>
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Neurology dot phrases & templates</p>
              </div>
            </div>
            <button
              onClick={() => setShowNIHSS(!showNIHSS)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                border: showNIHSS ? 'none' : '1px solid #4F6EF7',
                color: showNIHSS ? 'white' : '#7C9FFF',
                background: showNIHSS 
                  ? 'linear-gradient(135deg, #4F6EF7, #7B5EA7)' 
                  : 'rgba(79, 110, 247, 0.08)',
                boxShadow: showNIHSS 
                  ? '0 4px 12px rgba(79, 110, 247, 0.4)' 
                  : 'none',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              NIHSS Calculator
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={setSearchQuery} />
            </div>
          </div>

          <div className="mt-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <CategoryNav activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-6">
        {showNIHSS && (
          <div className="mb-8 animate-slide-down">
            <NIHSSCalculator />
          </div>
        )}

        <div className="mb-4 flex items-center justify-end">
          <p 
            className="text-xs uppercase tracking-wider" 
            style={{ color: 'rgba(255, 255, 255, 0.3)' }}
            aria-live="polite"
          >
            {filteredPhrases.length} template{filteredPhrases.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredPhrases.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPhrases.map((phrase) => (
              <PhraseCard key={phrase.id} phrase={phrase} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <svg className="w-8 h-8" style={{ color: 'rgba(255, 255, 255, 0.25)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1" style={{ color: '#F8FAFC' }}>No templates found</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Try adjusting your search or category filter</p>
          </div>
        )}
      </main>

    </div>
  );
}
