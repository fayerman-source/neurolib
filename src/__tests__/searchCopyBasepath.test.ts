import { describe, test, expect } from "bun:test";
import { dotPhrases } from "@/data/dotPhrases";
import { filterDotPhrases } from "@/lib/filterPhrases";
import { copyTextToClipboard, ClipboardEnvironment } from "@/lib/clipboard";
import { getPublicAssetPath } from "@/lib/assetPath";

describe("Dot phrase search including .trigger commands", () => {
  test("matches exact and partial dot triggers with or without leading dot", () => {
    expect(filterDotPhrases(dotPhrases, "all", ".strokehpi").map((p) => p.id)).toEqual([
      "stroke-hpi",
    ]);
    expect(filterDotPhrases(dotPhrases, "all", "strokehpi").map((p) => p.id)).toEqual([
      "stroke-hpi",
    ]);
    expect(filterDotPhrases(dotPhrases, "all", ".tpaelig").map((p) => p.id)).toEqual([
      "tpa-eligibility",
    ]);
    expect(filterDotPhrases(dotPhrases, "all", ".nihssdoc").map((p) => p.id)).toEqual([
      "nihss-documentation",
    ]);
    expect(filterDotPhrases(dotPhrases, "all", ".").length).toBe(dotPhrases.length);
  });

  test("combines category filtering with trigger search and trims whitespace", () => {
    expect(filterDotPhrases(dotPhrases, "stroke", "  .strokedc  ").map((p) => p.id)).toEqual([
      "stroke-discharge",
    ]);
    expect(filterDotPhrases(dotPhrases, "seizure", ".strokedc")).toHaveLength(0);
  });
});

describe("Plain-HTTP intranet clipboard fallback", () => {
  function createMockDom(execResult: boolean) {
    const appended: unknown[] = [];
    const removed: unknown[] = [];
    let selectedValue = "";

    const doc: NonNullable<ClipboardEnvironment["document"]> = {
      createElement: () => ({
        value: "",
        setAttribute: () => {},
        style: { position: "", top: "", left: "", opacity: "" },
        focus: () => {},
        select() {
          selectedValue = this.value;
        },
      }),
      body: {
        appendChild: (node) => appended.push(node),
        removeChild: (node) => removed.push(node),
      },
      execCommand: (cmd) => cmd === "copy" && execResult,
    };

    return { doc, appended, removed, getSelectedValue: () => selectedValue };
  }

  test("uses navigator.clipboard.writeText when available in secure contexts", async () => {
    let written = "";
    const ok = await copyTextToClipboard("NIHSS: 0", {
      clipboard: {
        writeText: async (t) => {
          written = t;
        },
      },
    });
    expect(ok).toBe(true);
    expect(written).toBe("NIHSS: 0");
  });

  test("falls back to textarea + execCommand('copy') when navigator.clipboard is undefined on HTTP", async () => {
    const mock = createMockDom(true);
    const ok = await copyTextToClipboard("Template content", {
      clipboard: undefined,
      document: mock.doc,
    });
    expect(ok).toBe(true);
    expect(mock.getSelectedValue()).toBe("Template content");
    expect(mock.appended).toHaveLength(1);
    expect(mock.removed).toHaveLength(1);
  });

  test("falls back to execCommand('copy') when writeText rejects", async () => {
    const mock = createMockDom(true);
    const ok = await copyTextToClipboard("Fallback text", {
      clipboard: {
        writeText: async () => {
          throw new Error("NotAllowedError");
        },
      },
      document: mock.doc,
    });
    expect(ok).toBe(true);
    expect(mock.getSelectedValue()).toBe("Fallback text");
  });

  test("returns false cleanly when both clipboard APIs are unavailable or blocked", async () => {
    const mock = createMockDom(false);
    const ok = await copyTextToClipboard("Blocked", {
      clipboard: undefined,
      document: mock.doc,
    });
    expect(ok).toBe(false);
    expect(mock.removed).toHaveLength(1);
  });
});

describe("GitHub Pages basePath public asset resolution", () => {
  test("prefixes /hero-bg.png when NEXT_PUBLIC_BASE_PATH is set", () => {
    expect(getPublicAssetPath("/hero-bg.png", "")).toBe("/hero-bg.png");
    expect(getPublicAssetPath("/hero-bg.png", "/neurolib")).toBe("/neurolib/hero-bg.png");
    expect(getPublicAssetPath("hero-bg.png", "/neurolib/")).toBe("/neurolib/hero-bg.png");
  });
});
