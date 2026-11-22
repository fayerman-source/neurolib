import { describe, test, expect } from "bun:test";
import { dotPhrases, DotPhrase } from "@/data/dotPhrases";
import {
  mergeAndRankPhrases,
  parsePinnedIds,
  serializeCustomPack,
  togglePinnedId,
  validateCustomPackJson,
} from "@/lib/packStorage";

describe("Command-palette ranking, pinned favorites, and local JSON packs", () => {
  test("togglePinnedId and parsePinnedIds add, remove, and deduplicate ids safely", () => {
    const pinned1 = togglePinnedId([], "tpa-eligibility");
    expect(pinned1).toEqual(["tpa-eligibility"]);

    const pinned2 = togglePinnedId(pinned1, "stroke-hpi");
    expect(pinned2).toEqual(["tpa-eligibility", "stroke-hpi"]);

    const unpinned = togglePinnedId(pinned2, "tpa-eligibility");
    expect(unpinned).toEqual(["stroke-hpi"]);

    expect(parsePinnedIds('["a","b","a","",123]')).toEqual(["a", "b"]);
    expect(parsePinnedIds("not-json")).toEqual([]);
  });

  test("ranks pinned favorites above unpinned phrases and prioritizes exact trigger matches", () => {
    const rankedByPin = mergeAndRankPhrases(dotPhrases, [], "all", "", ["gbs-workup"]);
    expect(rankedByPin[0]?.id).toBe("gbs-workup");

    // Exact trigger match beats general tag/description matches even when another item is pinned
    const rankedByTrigger = mergeAndRankPhrases(dotPhrases, [], "all", ".tpaelig", [
      "stroke-hpi",
    ]);
    expect(rankedByTrigger[0]?.id).toBe("tpa-eligibility");
  });

  test("validates, serializes, and merges custom local JSON phrase packs", () => {
    const customSample: DotPhrase = {
      id: "custom-tnk-checks",
      name: "Post-TNK Neuro Checks",
      trigger: ".tnkchecks",
      category: "stroke",
      description: "Local nursing frequency template structure",
      content: "Frequency: [Q15M/Q30M/Q1H]",
      tags: ["stroke", "custom"],
    };

    const json = serializeCustomPack([customSample]);
    const validated = validateCustomPackJson(json);
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(validated.phrases).toHaveLength(1);
      expect(validated.phrases[0]?.trigger).toBe(".tnkchecks");
    }

    const merged = mergeAndRankPhrases(dotPhrases, [customSample], "stroke", ".tnk", []);
    expect(merged.map((p) => p.id)).toEqual(["custom-tnk-checks"]);
  });

  test("rejects malformed JSON packs, invalid categories, missing dot triggers, and duplicate ids", () => {
    expect(validateCustomPackJson("{bad").ok).toBe(false);

    const badCategory = validateCustomPackJson(
      JSON.stringify([
        {
          id: "valid-id",
          name: "Name",
          trigger: ".valid",
          category: "unknown-specialty",
          description: "Desc",
          content: "Body",
          tags: ["tag"],
        },
      ])
    );
    expect(badCategory.ok).toBe(false);

    const badTrigger = validateCustomPackJson(
      JSON.stringify([
        {
          id: "valid-id",
          name: "Name",
          trigger: "nodot",
          category: "stroke",
          description: "Desc",
          content: "Body",
          tags: ["tag"],
        },
      ])
    );
    expect(badTrigger.ok).toBe(false);
  });
});
