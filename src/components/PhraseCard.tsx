'use client';

import { useMemo, useState } from 'react';
import { DotPhrase } from '@/data/dotPhrases';
import { copyTextToClipboard } from '@/lib/clipboard';
import {
  compileTemplate,
  EhrDialect,
  extractTemplateSlots,
} from '@/lib/templateCompiler';

interface PhraseCardProps {
  phrase: DotPhrase;
  dialect?: EhrDialect;
}

export default function PhraseCard({ phrase, dialect = 'raw' }: PhraseCardProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [expanded, setExpanded] = useState(false);
  const [smartFillOpen, setSmartFillOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  // Transient in-memory slot state only — intentionally never persisted to storage
  const [slotValues, setSlotValues] = useState<Record<string, string>>({});

  const slots = useMemo(() => extractTemplateSlots(phrase.content), [phrase.content]);
  const compiled = useMemo(
    () => compileTemplate(phrase.content, slotValues, dialect),
    [phrase.content, slotValues, dialect]
  );

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(compiled.text);
    if (ok) {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else {
      setCopyStatus('error');
      setExpanded(true);
      setTimeout(() => setCopyStatus('idle'), 3500);
    }
  };

  const updateSlot = (slotId: string, nextValue: string) => {
    setSlotValues((prev) => ({
      ...prev,
      [slotId]: prev[slotId] === nextValue ? '' : nextValue,
    }));
  };

  const setFreeTextSlot = (slotId: string, nextValue: string) => {
    setSlotValues((prev) => ({
      ...prev,
      [slotId]: nextValue,
    }));
  };

  const hasAnyFilled = compiled.filledSlots > 0;

  return (
    <div
      className="overflow-hidden transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#111827',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(255, 255, 255, 0.07)',
        borderLeftWidth: expanded || smartFillOpen || hovered ? 2 : 1,
        borderLeftColor: expanded || smartFillOpen || hovered ? '#4F6EF7' : 'rgba(255, 255, 255, 0.07)',
        borderRadius: '14px',
        boxShadow: hovered
          ? '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(79, 110, 247, 0.15)'
          : '0 2px 8px rgba(0, 0, 0, 0.4)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div className="p-5 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" style={{ color: '#F8FAFC', fontSize: '18px' }}>
              {phrase.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className="inline-block font-mono text-xs"
                style={{
                  color: '#4F6EF7',
                  background: 'rgba(79, 110, 247, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {phrase.trigger}
              </span>
              {compiled.wildcard && (
                <span
                  className="font-mono text-[11px]"
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {compiled.unfilledBlanks} {compiled.wildcard} blank{compiled.unfilledBlanks !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center transition-all"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background:
                copyStatus === 'copied'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : copyStatus === 'error'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              cursor: 'pointer',
            }}
            title={copyStatus === 'error' ? 'Copy failed — select text below' : 'Copy to clipboard'}
            aria-label={
              copyStatus === 'error'
                ? 'Copy failed'
                : copyStatus === 'copied'
                  ? 'Copied to clipboard'
                  : `Copy ${phrase.name}`
            }
          >
            {copyStatus === 'copied' ? (
              <svg className="w-4 h-4" style={{ color: '#22C55E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : copyStatus === 'error' ? (
              <svg className="w-4 h-4" style={{ color: '#EF4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>

        {copyStatus === 'error' && (
          <p role="alert" className="text-xs mb-2" style={{ color: '#EF4444' }}>
            Clipboard unavailable — select and copy the expanded template text manually.
          </p>
        )}

        <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {phrase.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {phrase.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs"
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }} className="pt-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse ${phrase.name} preview` : `Expand ${phrase.name} preview`}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
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
              Preview
            </button>

            {slots.length > 0 && (
              <button
                type="button"
                onClick={() => setSmartFillOpen(!smartFillOpen)}
                aria-expanded={smartFillOpen}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  background: smartFillOpen || hasAnyFilled ? 'rgba(79, 110, 247, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                  color: smartFillOpen || hasAnyFilled ? '#7C9FFF' : 'rgba(255, 255, 255, 0.6)',
                  border:
                    smartFillOpen || hasAnyFilled
                      ? '1px solid rgba(79, 110, 247, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                Smart Fill ({compiled.filledSlots}/{slots.length})
              </button>
            )}
          </div>

          {smartFillOpen && slots.length > 0 && (
            <div
              className="mt-3 p-3.5 rounded-lg space-y-3 animate-fade-in"
              style={{
                background: '#0D1526',
                border: '1px solid rgba(79, 110, 247, 0.25)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px]" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  In-memory only (never saved). Do not enter patient identifiers.
                </p>
                {hasAnyFilled && (
                  <button
                    type="button"
                    onClick={() => setSlotValues({})}
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{
                      color: '#F8FAFC',
                      background: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                {slots.map((slot) => {
                  const currentVal = slotValues[slot.id] ?? '';
                  return (
                    <div key={slot.id} className="space-y-1">
                      <label
                        htmlFor={`input-${phrase.id}-${slot.id}`}
                        className="block text-xs font-medium"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        {slot.label}
                      </label>
                      {slot.choices ? (
                        <div className="flex flex-wrap gap-1">
                          {slot.choices.map((choice) => {
                            const selected = currentVal === choice;
                            return (
                              <button
                                key={choice}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => updateSlot(slot.id, choice)}
                                className="px-2.5 py-1 rounded text-xs transition-all"
                                style={{
                                  background: selected ? '#4F6EF7' : 'rgba(255, 255, 255, 0.05)',
                                  color: selected ? 'white' : 'rgba(255, 255, 255, 0.65)',
                                  border: selected
                                    ? '1px solid #4F6EF7'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                {choice}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          id={`input-${phrase.id}-${slot.id}`}
                          type="text"
                          value={currentVal}
                          onChange={(e) => setFreeTextSlot(slot.id, e.target.value)}
                          placeholder={compiled.wildcard ?? slot.placeholder}
                          className="w-full px-2.5 py-1.5 rounded text-xs outline-none"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#F8FAFC',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2 rounded-md text-xs font-semibold transition-all"
                style={{
                  background:
                    copyStatus === 'copied'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'linear-gradient(135deg, #4F6EF7, #7B5EA7)',
                  color: copyStatus === 'copied' ? '#22C55E' : 'white',
                }}
              >
                {copyStatus === 'copied'
                  ? 'Compiled Note Copied!'
                  : `Copy Compiled Note (${compiled.unfilledBlanks} unfilled blank${compiled.unfilledBlanks !== 1 ? 's' : ''})`}
              </button>
            </div>
          )}

          {(expanded || smartFillOpen) && (
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
              {compiled.text}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
