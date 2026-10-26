import assert from "node:assert/strict";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { parseLocalization, localizePlugin, localeCandidates } from "./plugin-localization.ts";
import { parsePluginRegistry, type MarketplacePlugin } from "./plugin-registry.ts";
import { loadPluginDetails, parsePluginManifest } from "./plugin-details.ts";
import { fetchReleasedPlugin } from "./plugin-package.ts";

const localization = {
  defaultLocale: "en", name: "%name%", description: "%description%",
  messages: { en: { name: "History", description: "File history", title: "Recent files" }, "zh-CN": { name: "最近打开", title: "文件历史" } },
};
const plugin: MarketplacePlugin = {
  id: "test.localized", name: "History", description: "File history", category: "productivity", repo: "eidos-space/test-localized",
  version: "1.0.0", tag: "v1.0.0", asset: "test.localized-1.0.0.eidos-plugin", sha256: "a".repeat(64), compatibility: "Plugin API 3.7", localization,
};

test("catalog labels use canonical locales and message fallback without changing identity", () => {
  const parsed = parsePluginRegistry({ schemaVersion: 1, plugins: [plugin] }).plugins[0];
  assert.equal(localizePlugin(parsed, "zh").name, "最近打开");
  assert.equal(localizePlugin(parsed, "zh").description, "File history");
  assert.equal(localizePlugin(parsed, "zh").id, plugin.id);
  assert.equal(plugin.name, "History");
  assert.deepEqual(localeCandidates("zh-TW", "en"), ["zh-TW", "zh-Hant", "zh", "en"]);
  assert.equal(parseLocalization({ ...localization, messages: { en: { name: 42 } } }), undefined);
  assert.equal(parseLocalization({ ...localization, messages: { "zh-cn": { name: "x" } } }), undefined);
  assert.equal(parseLocalization({ ...localization, messages: { en: {} } }), undefined);
});

test("background grants are separate from page networking and hooks are counted", () => {
  const summary = parsePluginManifest({ id: plugin.id, version: plugin.version,
    background: { entry: "./background.js", autoStart: true, fileHistory: true, networkOrigins: ["wss://example.com", "javascript:bad"], bluetooth: { services: [6159] } },
    hooks: [{ id: "saved", title: "Saved" }], views: [{ id: "history", title: "%title%", kind: "page" }],
  }, plugin, "zh", localization)!;
  assert.equal(summary.views[0].title, "文件历史");
  assert.equal(summary.views[0].context, "page");
  assert.equal(summary.hooks.length, 1);
  assert.deepEqual(summary.networkOrigins, []);
  assert.equal(summary.background?.autoStart, true);
  assert.equal(summary.background?.fileHistory, true);
  assert.deepEqual(summary.background?.networkOrigins, ["wss://example.com"]);
  assert.equal(summary.background?.network, true);
  assert.deepEqual(summary.background?.services, ["6159"]);
});

function archive(translated: boolean) {
  const pkg = { format: 3, manifest: { apiVersion: 1, id: plugin.id, name: "%name%", version: plugin.version, requires: { pluginApi: "3.7.0" },
    i18n: { defaultLocale: "en", messages: { en: "./en.json", "zh-CN": "./zh.json" }, readme: { en: "./README.md", ...(translated ? { "zh-CN": "./README.zh.md" } : {}) } },
    views: [{ id: "history", title: "%title%", kind: "page" }], background: { entry: "./background.js", fileHistory: true, autoStart: true } },
    modules: { "./background.js": "throw Error('must not execute')" },
    resources: { "./en.json": JSON.stringify(localization.messages.en), "./zh.json": JSON.stringify(localization.messages["zh-CN"]), "./README.md": "# History\n\nEnglish release documentation\n\n[Guide](docs/guide.md)", ...(translated ? { "./README.zh.md": "# 历史\n\n中文发布说明" } : {}) } };
  const bytes = gzipSync(JSON.stringify(pkg));
  return { bytes, plugin: { ...plugin, sha256: createHash("sha256").update(bytes).digest("hex") } };
}

test("localized README comes from the verified release archive and never runs code", async (context) => {
  const fixture = archive(true);
  const requested: string[] = [];
  context.mock.method(globalThis, "fetch", async (input: Parameters<typeof fetch>[0]) => {
    requested.push(String(input));
    return new Response(new Uint8Array(fixture.bytes).buffer);
  });
  const details = await loadPluginDetails(fixture.plugin, "zh");
  assert.match(details.readmeHtml ?? "", /中文发布说明/u);
  assert.doesNotMatch(details.readmeHtml ?? "", /English release/u);
  assert.equal(details.readmeLocale, "zh-CN");
  assert.equal(details.readmeFallback, false);
  assert.equal(details.manifest?.background?.autoStart, true);
  assert.equal(details.manifest?.views[0].title, "文件历史");
  assert.deepEqual(requested, [`https://github.com/${plugin.repo}/releases/download/v1.0.0/${plugin.asset}`]);
});

test("missing translation selects one default document and identifies its language", async (context) => {
  const fixture = archive(false);
  context.mock.method(globalThis, "fetch", async () => new Response(new Uint8Array(fixture.bytes).buffer));
  const details = await loadPluginDetails(fixture.plugin, "zh");
  assert.equal(details.readmeFallback, true);
  assert.equal(details.readmeLocale, "en");
  assert.match(details.readmeHtml ?? "", /English release documentation/u);
  assert.match(details.readmeHtml ?? "", /blob\/v1\.0\.0\/docs\/guide\.md/u);
});

test("modified archive bytes are rejected instead of showing unverified documentation", async (context) => {
  const fixture = archive(true);
  context.mock.method(globalThis, "fetch", async () => new Response(new Uint8Array(fixture.bytes).buffer));
  await assert.rejects(fetchReleasedPlugin({ ...fixture.plugin, sha256: "0".repeat(64) }), /checksum/u);
});

test("failed archive lookups retry instead of caching an empty page", async (context) => {
  const fixture = archive(false);
  let attempts = 0;
  context.mock.method(globalThis, "fetch", async () => {
    if (++attempts === 1) return new Response("Unavailable", { status: 503 });
    return new Response(new Uint8Array(fixture.bytes).buffer);
  });
  assert.deepEqual(await loadPluginDetails(fixture.plugin, "en"), {});
  assert.match((await loadPluginDetails(fixture.plugin, "en")).readmeHtml ?? "", /English release documentation/u);
  assert.equal(attempts, 2);
});
