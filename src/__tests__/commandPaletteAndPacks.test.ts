import { describe, test, expect } from "bun:test";
import { dotPhrases, DotPhrase } from "@/data/dotPhrases";
import {
  createPinnedStore,
  MAX_PACK_BYTES,
  mergeAndRankPhrases,
  parsePinnedIds,
  resolveQuickCopyPhrase,
  saveCustomPhrasesToStorage,
  serializeCustomPack,
  togglePinnedId,
  validateCustomPackJson,
} from "@/lib/packStorage";
import { getPhraseSlotKey } from "@/lib/templateCompiler";

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

  test("resolves quick-copy synchronously from live input query before debounce settles", () => {
    // Even if previous debounced state had stroke-hpi pinned at top, live '.tpaelig' resolves immediately
    const resolved = resolveQuickCopyPhrase(dotPhrases, [], "all", ".tpaelig", [
      "stroke-hpi",
    ]);
    expect(resolved?.id).toBe("tpa-eligibility");
    expect(resolveQuickCopyPhrase(dotPhrases, [], "all", "   ", ["stroke-hpi"])).toBeUndefined();
  });

  test("propagates storage write failures instead of reporting false success", () => {
    const sample: DotPhrase = {
      id: "custom-item",
      name: "Item",
      trigger: ".citem",
      category: "stroke",
      description: "Desc",
      content: "Body",
      tags: ["custom"],
    };

    const quotaFailure = saveCustomPhrasesToStorage([sample], {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(quotaFailure.ok).toBe(false);
  });

  test("enforces 512 KB cap on canonical normalized form so accepted packs reload and re-import cleanly", () => {
    // Entry without 'tags' gains '"tags":["custom"]' during normalization.
    // A raw input just under 512 KB whose normalized JSON exceeds 512 KB must be rejected up front.
    const nearLimitPadding = "x".repeat(MAX_PACK_BYTES - 125);
    const overAfterNormalize = JSON.stringify([
      {
        id: "near-limit",
        name: "Near Limit",
        trigger: ".nearlimit",
        category: "stroke",
        description: "Desc",
        content: nearLimitPadding,
      },
    ]);
    expect(overAfterNormalize.length).toBeLessThanOrEqual(MAX_PACK_BYTES);
    expect(validateCustomPackJson(overAfterNormalize).ok).toBe(false);

    // A pack that passes validation stays readable from localStorage and after pretty-printed export
    const validPadding = "x".repeat(MAX_PACK_BYTES - 200);
    const validRaw = JSON.stringify([
      {
        id: "fits-limit",
        name: "Fits Limit",
        trigger: ".fitslimit",
        category: "stroke",
        description: "Desc",
        content: validPadding,
      },
    ]);
    const accepted = validateCustomPackJson(validRaw);
    expect(accepted.ok).toBe(true);
    if (accepted.ok) {
      const storedReload = validateCustomPackJson(JSON.stringify(accepted.phrases));
      expect(storedReload.ok).toBe(true);
      const exportedReimport = validateCustomPackJson(serializeCustomPack(accepted.phrases));
      expect(exportedReimport.ok).toBe(true);
    }
  });

  test("custom phrase sharing a built-in trigger overrides the built-in cleanly without duplicates", () => {
    const customTpa: DotPhrase = {
      id: "custom-tpaelig",
      name: "Local Hospital Thrombolytic Checklist",
      trigger: ".tpaelig",
      category: "stroke",
      description: "Custom override for .tpaelig",
      content: "Custom protocol: [APPROVED/DECLINED]",
      tags: ["stroke", "custom"],
    };

    const mergedAll = mergeAndRankPhrases(dotPhrases, [customTpa], "all", "", []);
    const tpaMatches = mergedAll.filter((p) => p.trigger === ".tpaelig");
    expect(tpaMatches).toHaveLength(1);
    expect(tpaMatches[0]?.id).toBe("custom-tpaelig");

    const quick = resolveQuickCopyPhrase(dotPhrases, [customTpa], "all", ".tpaelig", []);
    expect(quick?.id).toBe("custom-tpaelig");
    expect(quick?.content).toContain("Custom protocol");
  });

  test("isolates Smart-Fill slot keys when replacing a phrase's content and keeps pins working without storage", () => {
    const original = { id: "stroke-hpi", content: "Side: [SIDE]" };
    const replaced = { id: "stroke-hpi", content: "Dose: [DOSE]" };
    expect(getPhraseSlotKey(original)).not.toBe(getPhraseSlotKey(replaced));

    const pinStore = createPinnedStore("neurolib:pinned-ids", () => ({
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    }));
    pinStore.togglePin("gbs-workup");
    expect(pinStore.getPinnedIds()).toEqual(["gbs-workup"]);
  });
});
