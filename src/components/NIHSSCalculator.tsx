'use client';

import { useState } from 'react';

interface ScoreState {
  loc: number;
  locQuestions: number;
  locCommands: number;
  bestGaze: number;
  visual: number;
  facial: number;
  motorArmRight: number;
  motorArmLeft: number;
  motorLegRight: number;
  motorLegLeft: number;
  ataxia: number;
  sensory: number;
  language: number;
  dysarthria: number;
  extinction: number;
}

const initialState: ScoreState = {
  loc: 0,
  locQuestions: 0,
  locCommands: 0,
  bestGaze: 0,
  visual: 0,
  facial: 0,
  motorArmRight: 0,
  motorArmLeft: 0,
  motorLegRight: 0,
  motorLegLeft: 0,
  ataxia: 0,
  sensory: 0,
  language: 0,
  dysarthria: 0,
  extinction: 0,
};

const descriptions = {
  loc: [
    '0 - Alert, keenly responsive',
    '1 - Not alert, but arousable by minor stimulation',
    '2 - Not alert, requires repeated stimulation',
    '3 - Reflex motor or autonomic effects',
  ],
  locQuestions: [
    '0 - Answers both correctly',
    '1 - Answers one correctly',
    '2 - Answers neither correctly',
  ],
  locCommands: [
    '0 - Performs both correctly',
    '1 - Performs one correctly',
    '2 - Performs neither correctly',
  ],
  bestGaze: [
    '0 - Normal',
    '1 - Partial gaze palsy',
    '2 - Forced deviation',
    '3 - Total gaze paresis',
  ],
  visual: [
    '0 - No visual loss',
    '1 - Partial hemianopia',
    '2 - Complete hemianopia',
    '3 - Bilateral hemianopia',
  ],
  facial: [
    '0 - Normal symmetric movement',
    '1 - Minor paralysis (asymmetry at rest)',
    '2 - Partial paralysis (lower face)',
    '3 - Complete paralysis (upper and lower face)',
  ],
  motorArm: [
    '0 - No drift',
    '1 - Drift but does not hit bed',
    '2 - Some effort against gravity',
    '3 - No effort against gravity',
    '4 - No movement',
    'UN - Untestable',
  ],
  motorLeg: [
    '0 - No drift',
    '1 - Drift but does not hit bed',
    '2 - Some effort against gravity',
    '3 - No effort against gravity',
    '4 - No movement',
    'UN - Untestable',
  ],
  ataxia: [
    '0 - Absent',
    '1 - Present in one limb',
    '2 - Present in two or more limbs',
  ],
  sensory: [
    '0 - Normal',
    '1 - Mild-moderate sensory loss',
    '2 - Severe/total sensory loss',
  ],
  language: [
    '0 - No aphasia',
    '1 - Mild-moderate aphasia',
    '2 - Severe aphasia',
    '3 - Mute or global aphasia',
  ],
  dysarthria: [
    '0 - Normal',
    '1 - Mild-moderate slurred speech',
    '2 - Severe dysarthria, unintelligible',
  ],
  extinction: [
    '0 - No abnormality',
    '1 - Mild (extinction to one modality)',
    '2 - Profound (both modalities)',
  ],
};

export default function NIHSSCalculator() {
  const [scores, setScores] = useState<ScoreState>(initialState);
  const [copied, setCopied] = useState(false);

  const updateScore = (field: keyof ScoreState, value: number) => {
    setScores((prev) => ({ ...prev, [field]: value }));
  };

  const totalScore = Object.values(scores).reduce((sum, val) => {
    const numVal = typeof val === 'string' ? 0 : val;
    return sum + numVal;
  }, 0);

  const getStrokeSeverity = (score: number): { label: string; color: string } => {
    if (score === 0) return { label: 'No stroke symptoms', color: '#22C55E' };
    if (score <= 4) return { label: 'Minor stroke', color: '#22C55E' };
    if (score <= 15) return { label: 'Moderate stroke', color: '#F59E0B' };
    if (score <= 20) return { label: 'Moderate-severe stroke', color: '#F97316' };
    return { label: 'Severe stroke', color: '#EF4444' };
  };

  const generateDocumentation = () => {
    const items = [
      `1a. Level of Consciousness: ${scores.loc}`,
      `1b. LOC Questions: ${scores.locQuestions}`,
      `1c. LOC Commands: ${scores.locCommands}`,
      `2. Best Gaze: ${scores.bestGaze}`,
      `3. Visual Fields: ${scores.visual}`,
      `4. Facial Movement: ${scores.facial}`,
      `5a. Motor Arm Right: ${scores.motorArmRight}`,
      `5b. Motor Arm Left: ${scores.motorArmLeft}`,
      `6a. Motor Leg Right: ${scores.motorLegRight}`,
      `6b. Motor Leg Left: ${scores.motorLegLeft}`,
      `7. Limb Ataxia: ${scores.ataxia}`,
      `8. Sensory: ${scores.sensory}`,
      `9. Best Language: ${scores.language}`,
      `10. Dysarthria: ${scores.dysarthria}`,
      `11. Extinction/Inattention: ${scores.extinction}`,
      `TOTAL NIHSS: ${totalScore}`,
    ];
    return items.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateDocumentation());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const severity = getStrokeSeverity(totalScore);

  return (
    <div 
      style={{
        background: '#111827',
        borderRadius: '0 0 16px 16px',
        borderTop: '3px solid #4F6EF7',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div 
        className="px-6 py-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.15), rgba(123, 94, 167, 0.1))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>NIHSS Calculator</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>National Institutes of Health Stroke Scale</p>
          <div 
            className="font-bold"
            style={{ 
              fontSize: '80px', 
              fontWeight: 800, 
              letterSpacing: '-4px',
              lineHeight: 1,
              color: '#F8FAFC',
              textShadow: '0 0 40px rgba(79, 110, 247, 0.5)',
            }}
          >
            {totalScore}
            <span style={{ fontSize: '24px', color: 'rgba(255, 255, 255, 0.3)', letterSpacing: '0', marginLeft: '4px' }}>/42</span>
          </div>
          <div 
            className="text-sm font-medium mt-2 px-4 py-1 rounded-full"
            style={{ 
              color: severity.color,
              background: `${severity.color}15`,
              border: `1px solid ${severity.color}30`,
            }}
          >
            {severity.label}
          </div>
        </div>
      </div>

      <div className="p-6 grid gap-4 md:grid-cols-2">
        {[
          { key: 'loc' as const, label: '1a. Level of Consciousness', options: descriptions.loc },
          { key: 'locQuestions' as const, label: '1b. LOC Questions', options: descriptions.locQuestions },
          { key: 'locCommands' as const, label: '1c. LOC Commands', options: descriptions.locCommands },
          { key: 'bestGaze' as const, label: '2. Best Gaze', options: descriptions.bestGaze },
          { key: 'visual' as const, label: '3. Visual Fields', options: descriptions.visual },
          { key: 'facial' as const, label: '4. Facial Movement', options: descriptions.facial },
          { key: 'motorArmRight' as const, label: '5a. Motor Arm (R)', options: descriptions.motorArm },
          { key: 'motorArmLeft' as const, label: '5b. Motor Arm (L)', options: descriptions.motorArm },
          { key: 'motorLegRight' as const, label: '6a. Motor Leg (R)', options: descriptions.motorLeg },
          { key: 'motorLegLeft' as const, label: '6b. Motor Leg (L)', options: descriptions.motorLeg },
          { key: 'ataxia' as const, label: '7. Limb Ataxia', options: descriptions.ataxia },
          { key: 'sensory' as const, label: '8. Sensory', options: descriptions.sensory },
          { key: 'language' as const, label: '9. Best Language', options: descriptions.language },
          { key: 'dysarthria' as const, label: '10. Dysarthria', options: descriptions.dysarthria },
          { key: 'extinction' as const, label: '11. Extinction/Inattention', options: descriptions.extinction },
        ].map(({ key, label, options }) => (
          <div 
            key={key}
            style={{
              background: '#1A2332',
              borderRadius: '10px',
              padding: '16px',
            }}
            role="group"
            aria-labelledby={`label-${key}`}
          >
            <label 
              id={`label-${key}`} 
              className="block text-sm font-medium mb-2"
              style={{ 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em',
                color: '#64748B',
                fontWeight: 600,
              }}
            >
              {label}
            </label>
            <div 
              className="flex flex-wrap gap-1" 
              role="radiogroup" 
              aria-label={label}
            >
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  role="radio"
                  aria-checked={scores[key] === idx}
                  aria-label={opt}
                  onClick={() => updateScore(key, idx)}
                  className="px-3 py-1.5 text-xs transition-all"
                  style={{
                    background: scores[key] === idx ? '#4F6EF7' : 'rgba(255, 255, 255, 0.05)',
                    border: scores[key] === idx ? '1px solid #4F6EF7' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: scores[key] === idx ? 'white' : 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '6px',
                    boxShadow: scores[key] === idx ? '0 0 12px rgba(79, 110, 247, 0.6), inset 0 0 8px rgba(79, 110, 247, 0.2)' : 'none',
                    fontWeight: scores[key] === idx ? 600 : 400,
                  }}
                >
                  {opt.split(' - ')[0]}
                </button>
              ))}
            </div>
            <p 
              className="mt-2 text-xs" 
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
              aria-live="polite"
            >
              {options[scores[key]]}
            </p>
          </div>
        ))}
      </div>

      <div className="px-6 pb-6">
        <div
          role="note"
          aria-label="Clinical safety warning"
          className="mb-3 flex items-start gap-2 px-4 py-3 bg-amber-500/8 border border-amber-500/35 rounded-[10px]"
        >
          <span aria-hidden="true" className="text-amber-500 text-base leading-5">⚠</span>
          <p className="text-xs leading-relaxed text-white/75">
            <span className="text-amber-500 font-semibold">Verify every item against the patient before copying.</span>{' '}
            This tool does not replace clinical judgement. Do not paste PHI into this calculator.
          </p>
        </div>
        <button
          onClick={handleCopy}
          aria-live="polite"
          className="w-full flex items-center justify-center gap-2 py-3 font-medium transition-all"
          style={{
            borderRadius: '10px',
            background: copied 
              ? 'rgba(34, 197, 94, 0.15)' 
              : 'linear-gradient(135deg, #4F6EF7, #7B5EA7)',
            color: copied ? '#22C55E' : 'white',
            border: 'none',
            fontSize: '15px',
            fontWeight: 600,
            boxShadow: copied ? 'none' : '0 4px 12px rgba(79, 110, 247, 0.4)',
          }}
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Documentation Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy NIHSS Documentation
            </>
          )}
        </button>
        <p className="text-center text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.25)' }}>
          Score: {totalScore}/42
        </p>
      </div>
    </div>
  );
}
