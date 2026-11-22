'use client';

import { EHR_DIALECT_OPTIONS, EhrDialect } from '@/lib/templateCompiler';

interface EhrDialectSelectorProps {
  dialect: EhrDialect;
  onChange: (dialect: EhrDialect) => void;
}

export default function EhrDialectSelector({ dialect, onChange }: EhrDialectSelectorProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 pt-1"
      role="group"
      aria-label="EHR wildcard output format"
    >
      <span className="text-xs font-medium" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
        EHR Wildcard Format:
      </span>
      <div
        className="inline-flex rounded-lg p-0.5"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {EHR_DIALECT_OPTIONS.map((option) => {
          const active = dialect === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              title={option.description}
              onClick={() => onChange(option.id)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all"
              style={{
                background: active ? 'rgba(79, 110, 247, 0.25)' : 'transparent',
                color: active ? '#F8FAFC' : 'rgba(255, 255, 255, 0.5)',
                border: active ? '1px solid rgba(79, 110, 247, 0.5)' : '1px solid transparent',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
