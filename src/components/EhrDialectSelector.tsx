'use client';

import { dotPhrases } from '@/data/dotPhrases';
import { generateEspansoYaml } from '@/lib/espansoExporter';
import { EHR_DIALECT_OPTIONS, EhrDialect } from '@/lib/templateCompiler';

interface EhrDialectSelectorProps {
  dialect: EhrDialect;
  onChange: (dialect: EhrDialect) => void;
}

export default function EhrDialectSelector({ dialect, onChange }: EhrDialectSelectorProps) {
  const handleDownloadEspanso = () => {
    const yaml = generateEspansoYaml(dotPhrases, dialect);
    const filename =
      dialect === 'raw'
        ? 'neurolib.espanso.yml'
        : `neurolib-${dialect}.espanso.yml`;
    const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 pt-1"
      role="group"
      aria-label="EHR wildcard output format and expander export"
    >
      <div className="flex flex-wrap items-center gap-2">
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

      <button
        type="button"
        onClick={handleDownloadEspanso}
        title="Download all phrases as an Espanso v2 YAML text-expander package"
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          background: 'rgba(79, 110, 247, 0.14)',
          border: '1px solid rgba(79, 110, 247, 0.35)',
          color: '#7C9FFF',
        }}
      >
        Export Espanso (.yml)
      </button>
    </div>
  );
}
