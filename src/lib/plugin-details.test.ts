import assert from "node:assert/strict";
import test from "node:test";
import { loadPluginDetails, parsePluginManifest, renderPluginReadme } from "./plugin-details.ts";
import type { MarketplacePlugin } from "./plugin-registry.ts";

const plugin = { id: "eidos.map", version: "0.1.0" };
const languagePlugin: MarketplacePlugin = {
  id: "eidos.language-test",
  name: "Language test",
  description: "README language test",
  category: "other",
  repo: "eidos-space/eidos-language-test-plugin",
  version: "0.1.0",
  tag: "v0.1.0",
  asset: "eidos.language-test-0.1.0.eidos-plugin",
  sha256: "a".repeat(64),
  compatibility: "Eidos Lite",
};

test("summarizes the same capabilities shown by Eidos Lite", () => {
  const manifest = parsePluginManifest(
    {
      apiVersion: 1,
      id: plugin.id,
      version: plugin.version,
      browser: { workers: true, networkOrigins: ["https://tiles.example.com", "javascript:bad"] },
      views: [{ id: "map", title: "Map", context: "table", access: "read" }],
      actions: [{ id: "open", title: "Open", access: "write" }],
    },
    plugin,
  );
  assert.deepEqual(manifest?.networkOrigins, ["https://tiles.example.com"]);
  assert.equal(manifest?.views[0]?.context, "table");
  assert.equal(manifest?.actions[0]?.access, "write");
  assert.equal(manifest?.workers, true);
});

test("ignores a manifest whose package identity does not match the registry", () => {
  assert.equal(parsePluginManifest({ id: "wrong", version: "0.1.0" }, plugin), undefined);
});

test("shows a theme's minimum plugin API rather than the manifest format version", () => {
  const manifest = parsePluginManifest(
    {
      apiVersion: 1,
      id: plugin.id,
      version: plugin.version,
      kind: "theme",
      requires: { pluginApi: "1.6.0" },
      theme: { stylesheet: "./theme.css" },
    },
    plugin,
  );
  assert.equal(manifest?.requiresPluginApi, "1.6.0");
});

test("renders repository markdown without exposing active content", () => {
  const html = renderPluginReadme(
    "# Map\n\n![Preview](assets/map.png)\n\n[Guide](docs/guide.md)\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))",
    "eidos-space/eidos-map-plugin",
  );
  assert.match(html, /raw\.githubusercontent\.com\/eidos-space\/eidos-map-plugin\/main\/assets\/map\.png/u);
  assert.match(html, /github\.com\/eidos-space\/eidos-map-plugin\/blob\/main\/docs\/guide\.md/u);
  assert.doesNotMatch(html, /<script|javascript:/u);
  assert.doesNotMatch(html, /<h1/u);
});

test("loads the README for each page language and keeps their caches separate", async (context) => {
  const requested: string[] = [];
  context.mock.method(globalThis, "fetch", async (input: Parameters<typeof fetch>[0]) => {
    const url = String(input);
    requested.push(url);
    if (url.endsWith("/README.zh-CN.md")) return new Response("# 插件\n\n中文说明");
    if (url.endsWith("/README.md")) return new Response("# Plugin\n\nEnglish description");
    return new Response("", { status: 404 });
  });

  const chinese = await loadPluginDetails(languagePlugin, "zh");
  assert.match(chinese.readmeHtml ?? "", /中文说明/u);
  assert.equal(requested.some((url) => url.endsWith("/README.md")), false);

  const english = await loadPluginDetails(languagePlugin, "en");
  assert.match(english.readmeHtml ?? "", /English description/u);
  assert.doesNotMatch(english.readmeHtml ?? "", /中文说明/u);
  assert.equal(requested.some((url) => url.endsWith("/README.md")), true);
});

test("falls back to the English README when a Chinese translation is missing", async (context) => {
  const requested: string[] = [];
  context.mock.method(globalThis, "fetch", async (input: Parameters<typeof fetch>[0]) => {
    const url = String(input);
    requested.push(url);
    return url.endsWith("/README.md")
      ? new Response("# Plugin\n\nEnglish fallback")
      : new Response("", { status: 404 });
  });

  const details = await loadPluginDetails({ ...languagePlugin, id: "eidos.fallback-test" }, "zh");
  assert.match(details.readmeHtml ?? "", /English fallback/u);
  assert.equal(requested.some((url) => url.endsWith("/README.zh-CN.md")), true);
});
