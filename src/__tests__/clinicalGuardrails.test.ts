import { describe, test, expect } from "bun:test";
import { categories, dotPhrases } from "@/data/dotPhrases";
import {
  computeTotalScore,
  descriptions,
  formatNIHSSDocumentation,
  getStrokeSeverity,
  initialState,
  nihssFields,
  optionIndexToScore,
  ScoreState,
} from "@/components/NIHSSCalculator";

describe("Dot phrase schema and structural guardrails", () => {
  const validCategoryIds = new Set<string>(
    categories.map((c) => c.id).filter((id) => id !== "all")
  );

  test("categories list includes 'all' plus at least one clinical category", () => {
    expect(categories[0]?.id).toBe("all");
    expect(validCategoryIds.size).toBeGreaterThan(0);
  });

  test("every dot phrase has unique kebab-case id, unique dot trigger, and valid category", () => {
    expect(dotPhrases.length).toBeGreaterThanOrEqual(15);

    const ids = new Set<string>();
    const triggers = new Set<string>();

    for (const phrase of dotPhrases) {
      expect(phrase.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(ids.has(phrase.id)).toBe(false);
      ids.add(phrase.id);

      expect(phrase.trigger).toMatch(/^\.[a-z0-9]+$/);
      expect(triggers.has(phrase.trigger)).toBe(false);
      triggers.add(phrase.trigger);

      expect(validCategoryIds.has(phrase.category)).toBe(true);
      expect(phrase.name.trim().length).toBeGreaterThan(0);
      expect(phrase.description.trim().length).toBeGreaterThan(0);
      expect(phrase.content.trim().length).toBeGreaterThan(0);
      expect(phrase.tags.length).toBeGreaterThan(0);
    }
  });

  test("NIHSS initial state totals 0/42 and severity bands match NINDS conventions", () => {
    expect(nihssFields).toHaveLength(15);
    expect(computeTotalScore(initialState)).toBe(0);
    expect(getStrokeSeverity(0).label).toBe("No stroke symptoms");
    expect(getStrokeSeverity(1).label).toBe("Minor stroke");
    expect(getStrokeSeverity(4).label).toBe("Minor stroke");
    expect(getStrokeSeverity(5).label).toBe("Moderate stroke");
    expect(getStrokeSeverity(15).label).toBe("Moderate stroke");
    expect(getStrokeSeverity(16).label).toBe("Moderate-severe stroke");
    expect(getStrokeSeverity(20).label).toBe("Moderate-severe stroke");
    expect(getStrokeSeverity(21).label).toBe("Severe stroke");
    expect(getStrokeSeverity(42).label).toBe("Severe stroke");
  });
});

// ============================================================================
// Block A: NIHSS calculator and .nihssdoc scale guardrails (Defects #1, #2, #7)
// ============================================================================
describe("NIHSS scale and UN (Untestable) guardrails", () => {
  test.failing("selecting UN on limb motor items scores 0 and formats as UN", () => {
    const unIdx = descriptions.motorArm.findIndex((o) => o.startsWith("UN"));
    expect(unIdx).toBeGreaterThan(0);

    const singleUnState: ScoreState = {
      ...initialState,
      motorArmRight: optionIndexToScore(descriptions.motorArm, unIdx),
    };

    expect(computeTotalScore(singleUnState)).toBe(0);
    const doc = formatNIHSSDocumentation(singleUnState);
    expect(doc).toContain("5a. Motor Arm Right: UN");
    expect(doc).toContain("TOTAL NIHSS: 0");
  });

  test.failing("NIHSS total score never exceeds 42 across any combination of options", () => {
    const maxNumericState: ScoreState = { ...initialState };
    const lastOptionState: ScoreState = { ...initialState };

    for (const field of nihssFields) {
      const lastIdx = field.options.length - 1;
      lastOptionState[field.key] = optionIndexToScore(field.options, lastIdx);

      let maxNumericIdx = 0;
      field.options.forEach((opt, idx) => {
        if (!opt.startsWith("UN")) maxNumericIdx = idx;
      });
      maxNumericState[field.key] = optionIndexToScore(field.options, maxNumericIdx);
    }

    expect(computeTotalScore(maxNumericState)).toBe(42);
    expect(computeTotalScore(lastOptionState)).toBeLessThanOrEqual(42);

    // Item 2 (Best Gaze) official NINDS range is 0-2
    expect(descriptions.bestGaze).toHaveLength(3);
    const nihssDocPhrase = dotPhrases.find((p) => p.id === "nihss-documentation");
    expect(nihssDocPhrase?.content).toContain("2. Best Gaze: [0-2]");
    expect(nihssDocPhrase?.content).not.toContain("3 - Total gaze paresis");
  });

  test.failing("Item 7 (Limb Ataxia) and Item 10 (Dysarthria) include UN options in calculator and template", () => {
    expect(descriptions.ataxia.some((o) => o.startsWith("UN"))).toBe(true);
    expect(descriptions.dysarthria.some((o) => o.startsWith("UN"))).toBe(true);

    const nihssDocPhrase = dotPhrases.find((p) => p.id === "nihss-documentation");
    expect(nihssDocPhrase?.content).toMatch(/7\. Limb Ataxia:[\s\S]*?UN\s*-/);
    expect(nihssDocPhrase?.content).toMatch(/10\. Dysarthria:[\s\S]*?UN\s*-/);
  });
});

// ============================================================================
// Spacer passing check separating independent clinical blocks
// ============================================================================
describe("Required emergency templates presence", () => {
  test("core stroke and TIA templates exist by stable id", () => {
    for (const id of ["stroke-hpi", "nihss-documentation", "tpa-eligibility", "tia-hpi", "tia-workup", "gbs-workup", "ataxia-workup"]) {
      expect(dotPhrases.find((p) => p.id === id)).toBeDefined();
    }
  });
});

// ============================================================================
// Block B: Acute dosing caps & ABCD2 range guardrails (Defects #3, #4)
// ============================================================================
describe("Acute thrombolytic dosing cap and ABCD2 range guardrails", () => {
  test.failing("weight-based mg/kg dosing lines specify an explicit max cap and tPA checks DOAC use", () => {
    for (const phrase of dotPhrases) {
      if (/\bmg\/kg\b/i.test(phrase.content)) {
        expect(phrase.content).toMatch(/\bmax(imum)?\b[\s:]*\d+\s*mg/i);
      }
    }

    const tpa = dotPhrases.find((p) => p.id === "tpa-eligibility")!;
    expect(tpa.content).toMatch(/90\s*mg/i);
    expect(tpa.content).toMatch(/direct thrombin|factor Xa|DOAC|apixaban|rivaroxaban|dabigatran/i);
  });

  test.failing("ABCD2 score items in tia-hpi cover the full 0 to 7 range", () => {
    const tiaHpi = dotPhrases.find((p) => p.id === "tia-hpi")!;
    const abcdBlock = tiaHpi.content.split("ABCD² SCORE")[1] ?? "";
    expect(abcdBlock).toContain("TOTAL: ___/7");

    const itemLines = abcdBlock
      .split("\n")
      .filter((line) => line.trim().startsWith("- "));
    expect(itemLines).toHaveLength(5);

    // Sum the highest bracketed integer on each of the 5 ABCD2 component lines
    let minSum = 0;
    let maxSum = 0;
    for (const line of itemLines) {
      const nums = Array.from(line.matchAll(/\[([0-9/]+)\]/g))
        .flatMap((m) => m[1].split("/").map((n) => Number(n)))
        .filter((n) => !Number.isNaN(n));
      expect(nums.length).toBeGreaterThan(0);
      minSum += Math.min(...nums);
      maxSum += Math.max(...nums);
    }

    expect(minSum).toBe(0);
    expect(maxSum).toBe(7);
  });
});

// ============================================================================
// Spacer passing check separating independent clinical blocks
// ============================================================================
describe("Trigger uniqueness invariant", () => {
  test("all triggers are lowercase alphanumeric after leading dot", () => {
    for (const phrase of dotPhrases) {
      expect(phrase.trigger.startsWith(".")).toBe(true);
      expect(phrase.trigger.slice(1)).toBe(phrase.trigger.slice(1).toLowerCase());
    }
  });
});

// ============================================================================
// Block C: Placeholder bias and guideline contradiction guardrails (Defect #8)
// ============================================================================
describe("Placeholder neutrality and guideline contradiction guardrails", () => {
  test.failing("templates avoid hardcoded single-choice [YES] traps and contradicted ESUS/GBS/VLCAD items", () => {
    for (const phrase of dotPhrases) {
      const singleSideYesNo = phrase.content.match(/^-\s+[^:\n]+:\s*\[(YES|NO)\]\s*$/gim);
      expect(singleSideYesNo).toBeFalsy();
    }

    const tiaWorkup = dotPhrases.find((p) => p.id === "tia-workup")!;
    expect(tiaWorkup.content).not.toMatch(/anticoagulation if cryptogenic with ESUS/i);

    const gbsWorkup = dotPhrases.find((p) => p.id === "gbs-workup")!;
    expect(gbsWorkup.content).not.toMatch(/□\s*Both\s*\(if severe\)/i);

    const ataxiaWorkup = dotPhrases.find((p) => p.id === "ataxia-workup")!;
    expect(ataxiaWorkup.content).not.toMatch(/Very long chain fatty acids.*VLCAD/i);
  });
});
