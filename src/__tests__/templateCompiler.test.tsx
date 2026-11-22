import { describe, test, expect } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { dotPhrases } from "@/data/dotPhrases";
import { compileTemplate, extractTemplateSlots } from "@/lib/templateCompiler";
import PhraseCard from "@/components/PhraseCard";

describe("Smart-Fill slot extraction and EHR wildcard dialect compiler", () => {
  test("extracts independent per-occurrence slots with line-context labels and skips empty [ ] checkboxes", () => {
    const strokeHpi = dotPhrases.find((p) => p.id === "stroke-hpi")!;
    const slots = extractTemplateSlots(strokeHpi.content);

    expect(slots[0]).toEqual({
      id: "slot-0",
      raw: "[AGE]",
      placeholder: "AGE",
      label: "AGE",
      choices: null,
    });
    expect(slots[1]?.placeholder).toBe("SEX");
    expect(slots[2]?.choices).toEqual(["ACUTE", "CHRONIC"]);

    // Wake-up stroke and Coronary artery disease both use [YES/NO] on separate lines and stay independent
    const wakeupSlot = slots.find((s) => s.label === "Wake-up stroke");
    const cadSlot = slots.find((s) => s.label === "Coronary artery disease");
    expect(wakeupSlot).toBeDefined();
    expect(cadSlot).toBeDefined();
    expect(wakeupSlot?.id).not.toBe(cadSlot?.id);
    expect(wakeupSlot?.choices).toEqual(["YES", "NO"]);

    // Empty checkboxes "[ ] Nausea/Vomiting" are not extracted as fill slots
    expect(slots.some((s) => s.placeholder === "")).toBe(false);
  });

  test("does not split unit ratios such as [0.9 mg/kg] into choice chips", () => {
    const tpa = dotPhrases.find((p) => p.id === "tpa-eligibility")!;
    const slots = extractTemplateSlots(tpa.content);
    const doseRateSlot = slots.find((s) => s.placeholder === "0.9 mg/kg");
    expect(doseRateSlot).toBeDefined();
    expect(doseRateSlot?.choices).toBe(null);
  });

  test("compiles filled slots and converts unfilled brackets + underscore runs to Epic *** wildcards", () => {
    const sample = [
      "Age: [AGE], Side: [RIGHT/LEFT]",
      "[ ] Nausea",
      "Wake-up: [YES/NO]",
      "CAD: [YES/NO]",
      "Strength: ___/5, Examiner: _________",
    ].join("\n");

    const slots = extractTemplateSlots(sample);
    const wakeupId = slots.find((s) => s.label === "Wake-up")!.id;
    const ageId = slots.find((s) => s.label.startsWith("Age"))!.id;

    const epic = compileTemplate(
      sample,
      {
        [ageId]: "71",
        [wakeupId]: "NO",
      },
      "epic"
    );

    expect(epic.filledSlots).toBe(2);
    // 2 unfilled bracket slots ([RIGHT/LEFT], CAD [YES/NO]) + 2 underscore runs (___ and _________) = 4
    expect(epic.unfilledBlanks).toBe(4);
    expect(epic.text).toBe(
      [
        "Age: 71, Side: ***",
        "[ ] Nausea",
        "Wake-up: NO",
        "CAD: ***",
        "Strength: ***/5, Examiner: ***",
      ].join("\n")
    );
  });

  test("supports Cerner (_) and Raw ([...]) output dialects", () => {
    const sample = "Onset: [SUDDEN/GRADUAL], Time: _____";

    const cerner = compileTemplate(sample, {}, "cerner");
    expect(cerner.text).toBe("Onset: _, Time: _");
    expect(cerner.unfilledBlanks).toBe(2);

    const raw = compileTemplate(sample, { "slot-0": "SUDDEN" }, "raw");
    expect(raw.text).toBe("Onset: SUDDEN, Time: _____");
    expect(raw.filledSlots).toBe(1);
    expect(raw.unfilledBlanks).toBe(1);
  });

  test("PhraseCard renders Smart Fill button and Epic wildcard badge", () => {
    const strokeHpi = dotPhrases.find((p) => p.id === "stroke-hpi")!;
    const html = renderToStaticMarkup(<PhraseCard phrase={strokeHpi} dialect="epic" />);
    expect(html).toContain("Smart Fill (0/");
    expect(html).toContain("*** blanks");
  });
});
