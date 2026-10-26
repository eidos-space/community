import type { MarketplacePlugin } from "./plugin-registry.ts";
import { parseLocalization, type PluginLocalization } from "./plugin-localization.ts";

const MAX_BYTES = 16 * 1024 * 1024;
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const resourcePath = (value: unknown): value is string => typeof value === "string" && value.startsWith("./") && !/[\\?#\u0000-\u001f]/.test(value) && value.slice(2).split("/").every((part) => !!part && part !== "." && part !== ".." && !part.includes(":"));

export interface ReleasedPlugin {
  manifest: Record<string, unknown>;
  localization: PluginLocalization;
  readmes: Record<string, string>;
  resources: Record<string, string>;
}

export async function readBounded(stream: ReadableStream<Uint8Array> | null, limit = MAX_BYTES): Promise<Uint8Array<ArrayBuffer>> {
  if (!stream) throw new Error("Empty plugin archive");
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Plugin resource exceeds size limit");
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export function parseReleasedPlugin(value: unknown, plugin: Pick<MarketplacePlugin, "id" | "version">): ReleasedPlugin {
  if (!record(value) || value.format !== 3 || !record(value.manifest) || !record(value.resources)) throw new Error("Invalid localized plugin archive");
  const manifest = value.manifest;
  if (manifest.id !== plugin.id || manifest.version !== plugin.version || !record(manifest.i18n)) throw new Error("Plugin archive identity mismatch");
  const declaration = manifest.i18n;
  if (typeof declaration.defaultLocale !== "string" || !record(declaration.messages)) throw new Error("Missing plugin language resources");
  const resources = value.resources;
  const messages: Record<string, unknown> = {};
  const textResources: Record<string, string> = {};
  const readmes: Record<string, string> = {};
  const paths = new Set<string>();
  for (const [kind, entries] of [["messages", declaration.messages], ["readme", declaration.readme]] as const) {
    if (entries === undefined) continue;
    if (!record(entries) || !Object.keys(entries).length || Object.keys(entries).length > 32 || !Object.hasOwn(entries, declaration.defaultLocale)) throw new Error("Invalid plugin locales");
    for (const [locale, path] of Object.entries(entries)) {
      if (Intl.getCanonicalLocales(locale)[0] !== locale || !resourcePath(path) || !path.endsWith(kind === "messages" ? ".json" : ".md") || typeof resources[path] !== "string" || new TextEncoder().encode(resources[path]).byteLength > 1024 * 1024) throw new Error("Invalid plugin resource");
      paths.add(path);
      const content = resources[path];
      if (typeof content !== "string") throw new Error("Invalid plugin resource");
      textResources[path] = content;
      if (kind === "messages") messages[locale] = JSON.parse(content);
      else readmes[locale] = path;
    }
  }
  if (paths.size !== Object.keys(resources).length || typeof manifest.name !== "string") throw new Error("Unexpected plugin resources");
  const localization = parseLocalization({ defaultLocale: declaration.defaultLocale, messages, name: manifest.name, description: manifest.description });
  if (!localization) throw new Error("Invalid plugin messages");
  return { manifest, localization, readmes, resources: textResources };
}

/** Read metadata and documentation only; never evaluate archive modules. */
export async function fetchReleasedPlugin(plugin: MarketplacePlugin): Promise<ReleasedPlugin> {
  const response = await fetch(`https://github.com/${plugin.repo}/releases/download/${encodeURIComponent(plugin.tag)}/${encodeURIComponent(plugin.asset)}`, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok || Number(response.headers.get("content-length")) > MAX_BYTES) throw new Error("Plugin archive unavailable");
  const bytes = await readBounded(response.body);
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer);
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== plugin.sha256) throw new Error("Plugin archive checksum mismatch");
  const compressed = new Response(bytes.buffer).body!;
  const json = await readBounded(compressed.pipeThrough(new DecompressionStream("gzip")));
  return parseReleasedPlugin(JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(json)), plugin);
}
