import { describe, test, expect } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import manifest from "@/app/manifest";
import { collectExportAssets, renderServiceWorkerJs } from "@/lib/pwaSwGenerator";

describe("Installable offline PWA manifest and service worker generation", () => {
  test("manifest returns standalone config with 192x192 and 512x512 PNG icons", () => {
    const prev = process.env.NEXT_PUBLIC_BASE_PATH;
    try {
      process.env.NEXT_PUBLIC_BASE_PATH = "";
      const localManifest = manifest();
      expect(localManifest.display).toBe("standalone");
      expect(localManifest.start_url).toBe("/");
      expect(localManifest.scope).toBe("/");
      expect(localManifest.icons?.map((i) => i.sizes)).toEqual(["192x192", "512x512"]);

      process.env.NEXT_PUBLIC_BASE_PATH = "/neurolib";
      const pagesManifest = manifest();
      expect(pagesManifest.start_url).toBe("/neurolib/");
      expect(pagesManifest.scope).toBe("/neurolib/");
      expect(pagesManifest.icons?.[0]?.src).toBe("/neurolib/icon-192.png");
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
      else process.env.NEXT_PUBLIC_BASE_PATH = prev;
    }
  });

  test("collectExportAssets discovers hashed Next.js chunks, skips sw.js/maps, and hashes content", () => {
    const tempOut = mkdtempSync(join(tmpdir(), "neurolib-pwa-test-"));
    try {
      mkdirSync(join(tempOut, "_next", "static", "chunks"), { recursive: true });
      writeFileSync(join(tempOut, "index.html"), "<html>v1</html>");
      writeFileSync(join(tempOut, "manifest.webmanifest"), "{}");
      writeFileSync(join(tempOut, "_next", "static", "chunks", "app-abc123.js"), "console.log(1);");
      writeFileSync(join(tempOut, "_next", "static", "chunks", "app-abc123.js.map"), "{}");
      writeFileSync(join(tempOut, "sw.js"), "// old sw");

      const pass1 = collectExportAssets(tempOut, "/neurolib");
      expect(pass1.urls).toContain("/neurolib/");
      expect(pass1.urls).toContain("/neurolib/index.html");
      expect(pass1.urls).toContain("/neurolib/manifest.webmanifest");
      expect(pass1.urls).toContain("/neurolib/_next/static/chunks/app-abc123.js");
      expect(pass1.urls.some((u) => u.endsWith("sw.js"))).toBe(false);
      expect(pass1.urls.some((u) => u.endsWith(".map"))).toBe(false);

      // Modifying a file invalidates versionHash so stale clinical templates are evicted
      writeFileSync(join(tempOut, "index.html"), "<html>v2-updated-phrase</html>");
      const pass2 = collectExportAssets(tempOut, "/neurolib");
      expect(pass2.versionHash).not.toBe(pass1.versionHash);

      const swJs = renderServiceWorkerJs(pass2.urls, pass2.versionHash, "/neurolib");
      expect(swJs).toContain(`neurolib-precache-`);
      expect(swJs).toContain(pass2.versionHash);
      expect(swJs).toContain("/neurolib/_next/static/chunks/app-abc123.js");
      // Verify generated service worker JavaScript is syntactically valid
      expect(typeof new Function(swJs)).toBe("function");
    } finally {
      rmSync(tempOut, { recursive: true, force: true });
    }
  });
});
