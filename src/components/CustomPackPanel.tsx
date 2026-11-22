'use client';

import { useState } from 'react';
import { categories, DotPhrase } from '@/data/dotPhrases';
import { serializeCustomPack, validateCustomPackJson } from '@/lib/packStorage';

interface CustomPackPanelProps {
  customPhrases: readonly DotPhrase[];
  onSaveCustomPhrases: (next: DotPhrase[]) => void;
}

const selectableCategories = categories.filter((c) => c.id !== 'all');

export default function CustomPackPanel({
  customPhrases,
  onSaveCustomPhrases,
}: CustomPackPanelProps) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('.');
  const [category, setCategory] = useState<string>(selectableCategories[0]?.id ?? 'general');
  const [description, setDescription] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [source, setSource] = useState('');
  const [content, setContent] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTrigger = trigger.trim().startsWith('.')
      ? trigger.trim().toLowerCase()
      : `.${trigger.trim().toLowerCase()}`;
    const generatedId =
      cleanTrigger
        .slice(1)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'custom-phrase';

    const candidate: DotPhrase = {
      id: `custom-${generatedId}`,
      name: name.trim(),
      trigger: cleanTrigger,
      category,
      description: description.trim(),
      content,
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      ...(source.trim() ? { source: source.trim() } : {}),
    };

    const nextList = [...customPhrases.filter((p) => p.id !== candidate.id), candidate];
    const check = validateCustomPackJson(JSON.stringify(nextList));
    if (!check.ok) {
      setStatusMsg({ type: 'err', text: check.error });
      return;
    }

    onSaveCustomPhrases(check.phrases);
    setName('');
    setTrigger('.');
    setDescription('');
    setTagsText('');
    setSource('');
    setContent('');
    setStatusMsg({ type: 'ok', text: `Saved local phrase ${candidate.trigger}.` });
  };

  const handleImportJson = () => {
    const check = validateCustomPackJson(jsonInput);
    if (!check.ok) {
      setStatusMsg({ type: 'err', text: check.error });
      return;
    }
    onSaveCustomPhrases(check.phrases);
    setJsonInput('');
    setStatusMsg({
      type: 'ok',
      text: `Imported ${check.phrases.length} custom phrase${check.phrases.length !== 1 ? 's' : ''}.`,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const check = validateCustomPackJson(text);
    if (!check.ok) {
      setStatusMsg({ type: 'err', text: check.error });
      return;
    }
    onSaveCustomPhrases(check.phrases);
    setStatusMsg({
      type: 'ok',
      text: `Imported ${check.phrases.length} phrase${check.phrases.length !== 1 ? 's' : ''} from ${file.name}.`,
    });
    e.target.value = '';
  };

  const handleExportJson = () => {
    const serialized = serializeCustomPack(customPhrases);
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neurolib-custom-pack.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-6"
      style={{
        background: '#111827',
        border: '1px solid rgba(79, 110, 247, 0.35)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">Local Custom Phrase Pack</h2>
          <p className="text-xs text-amber-400 mt-0.5">
            Stored in this browser only. Never include patient identifiers or PHI in custom templates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F8FAFC',
            }}
          >
            Import .json File
            <input type="file" accept="application/json,.json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            type="button"
            onClick={handleExportJson}
            disabled={customPhrases.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
            style={{
              background: 'rgba(79, 110, 247, 0.18)',
              border: '1px solid rgba(79, 110, 247, 0.4)',
              color: '#7C9FFF',
            }}
          >
            Export Pack ({customPhrases.length})
          </button>
          {customPhrases.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onSaveCustomPhrases([]);
                setStatusMsg({ type: 'ok', text: 'Cleared local custom phrases.' });
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <p
          role="status"
          className="text-xs px-3 py-2 rounded-lg"
          style={{
            background: statusMsg.type === 'ok' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: statusMsg.type === 'ok' ? '#22C55E' : '#EF4444',
          }}
        >
          {statusMsg.text}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={handleAddPhrase} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Add Local Template
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Name (e.g. Post-TNK Checks)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
            />
            <input
              type="text"
              placeholder=".trigger"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              required
              className="px-3 py-2 rounded-lg text-xs font-mono outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Template category"
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: '#1A2332', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
            >
              {selectableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
            />
          </div>
          <input
            type="text"
            placeholder="One-line description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
          />
          <input
            type="text"
            placeholder="Guideline source citation (optional)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
          />
          <textarea
            placeholder="Template content (use [CHOICE1/CHOICE2] or [FIELD] for Smart-Fill slots)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4F6EF7, #7B5EA7)' }}
          >
            Save Local Template
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Paste Pack JSON
          </h3>
          <textarea
            placeholder='{"version": 1, "phrases": [...]}'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={9}
            className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC' }}
          />
          <button
            type="button"
            onClick={handleImportJson}
            disabled={jsonInput.trim().length === 0}
            className="w-full py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F8FAFC',
            }}
          >
            Load Pasted JSON Pack
          </button>
        </div>
      </div>
    </div>
  );
}
