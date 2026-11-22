'use client';

import { useState } from 'react';
import { DotPhrase } from '@/data/dotPhrases';

interface PhraseCardProps {
  phrase: DotPhrase;
}

export default function PhraseCard({ phrase }: PhraseCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phrase.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      className="overflow-hidden transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#111827',
        borderWidth: 1,
        borderStyle: 'solid',
        borderLeftWidth: expanded || hovered ? 2 : 1,
        borderLeftColor: expanded || hovered ? '#4F6EF7' : 'transparent',
        borderRadius: '14px',
        boxShadow: hovered 
          ? '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(79, 110, 247, 0.15)' 
          : '0 2px 8px rgba(0, 0, 0, 0.4)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div 
        className="p-5 transition-all duration-200"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" style={{ color: '#F8FAFC', fontSize: '18px' }}>{phrase.name}</h3>
            <span 
              className="inline-block mt-1 font-mono text-xs"
              style={{ 
                color: '#4F6EF7', 
                background: 'rgba(79, 110, 247, 0.1)', 
                padding: '2px 8px', 
                borderRadius: '4px' 
              }}
            >
              {phrase.trigger}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center transition-all"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              cursor: 'pointer',
            }}
            title="Copy to clipboard"
          >
            {copied ? (
              <svg className="w-4 h-4" style={{ color: '#22C55E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{phrase.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {phrase.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs"
              style={{ 
                color: 'rgba(255, 255, 255, 0.45)', 
                border: '1px solid rgba(255, 255, 255, 0.12)', 
                padding: '2px 8px', 
                borderRadius: '999px' 
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {phrase.source && phrase.source.trim().length > 0 && (
          <p
            className="text-xs mb-3 leading-relaxed"
            style={{ color: 'rgba(255, 255, 255, 0.55)' }}
          >
            <span
              className="font-semibold uppercase tracking-wider text-[10px] mr-1.5"
              style={{ color: '#7C9FFF' }}
            >
              Source:
            </span>
            {phrase.source}
          </p>
        )}

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }} className="pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.45)' }}
          >
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <pre 
              className="mt-3 overflow-x-auto max-h-96 overflow-y-auto animate-fade-in"
              style={{ 
                background: '#0D1117', 
                borderRadius: '8px', 
                padding: '16px', 
                color: '#94A3B8', 
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '13px',
              }}
            >
              {phrase.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
