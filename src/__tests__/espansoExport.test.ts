import { describe, test, expect } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dotPhrases, DotPhrase } from "@/data/dotPhrases";
import { compileTemplate } from "@/lib/templateCompiler";
import {
  generateEspansoYaml,
  parseEspansoYaml,
} from "@/lib/espansoExporter";
import { writeExpanderPacksToDir } from "@/lib/espansoPackWriter";

describe("Espanso YAML text-expander pack build-time exporter and round-trip parser", () => {
  test("every phrase in dotPhrases round-trips byte-for-byte in raw, epic, and cerner dialects", () => {
    for (const dialect of ["raw", "epic", "cerner"] as const) {
      const yaml = generateEspansoYaml(dotPhrases, dialect);
      const parsed = parseEspansoYaml(yaml);

      expect(parsed).toHaveLength(dotPhrases.length);

      dotPhrases.forEach((phrase, idx) => {
        const expectedReplace =
          dialect === "raw"
            ? phrase.content
            : compileTemplate(phrase.content, {}, dialect).text;

        expect(parsed[idx]).toEqual({
          trigger: phrase.trigger,
          label: `${phrase.name} — ${phrase.description}`,
          force_clipboard: true,
          replace: expectedReplace,
        });
      });
    }
  });

  test("preserves YAML-sensitive characters (quotes, backslashes, #, colons, Unicode) on round-trip", () => {
    const trickyPhrase: DotPhrase = {
      id: "yaml-edge-case",
      name: 'Edge: "Quotes" & #Comments',
      trigger: ".yamledge",
      category: "stroke",
      description: "Contains : colons, # hashes, and \\ backslashes",
      content: 'Line 1: "quoted" # not a YAML comment\n□ Checkbox ≥ 2, ABCD²\nPath: C:\\temp\\note\n\nTrailing blank:',
      tags: ["edge"],
    };

    const yaml = generateEspansoYaml([trickyPhrase], "raw");
    const parsed = parseEspansoYaml(yaml);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.replace).toBe(trickyPhrase.content);
    expect(parsed[0]?.label).toBe(`${trickyPhrase.name} — ${trickyPhrase.description}`);
  });

  test("writeExpanderPacksToDir emits static .espanso.yml files to out/packs/ that all round-trip", () => {
    const tempOut = mkdtempSync(join(tmpdir(), "neurolib-packs-test-"));
    try {
      const paths = writeExpanderPacksToDir(tempOut, dotPhrases);
      expect(paths).toHaveLength(3);

      const rawDisk = readFileSync(join(tempOut, "packs", "neurolib.espanso.yml"), "utf8");
      const epicDisk = readFileSync(join(tempOut, "packs", "neurolib-epic.espanso.yml"), "utf8");
      const cernerDisk = readFileSync(join(tempOut, "packs", "neurolib-cerner.espanso.yml"), "utf8");

      const parsedRaw = parseEspansoYaml(rawDisk);
      const parsedEpic = parseEspansoYaml(epicDisk);
      const parsedCerner = parseEspansoYaml(cernerDisk);

      expect(parsedRaw).toHaveLength(dotPhrases.length);
      expect(parsedEpic).toHaveLength(dotPhrases.length);
      expect(parsedCerner).toHaveLength(dotPhrases.length);

      expect(parsedRaw[0]?.replace).toBe(dotPhrases[0]?.content);
      expect(parsedEpic[0]?.replace).toContain("***");
      expect(parsedCerner[0]?.replace).toContain("_");
    } finally {
      rmSync(tempOut, { recursive: true, force: true });
    }
  });
});
