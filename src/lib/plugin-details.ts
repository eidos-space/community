import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import type { Locale } from "../i18n";
import type { MarketplacePlugin } from "./plugin-registry";
import { localizedText, localeCandidates, type PluginLocalization } from "./plugin-localization.ts";
import { fetchReleasedPlugin, readBounded } from "./plugin-package.ts";

const DETAIL_CACHE_SECONDS = 10 * 60;
const MAX_REPOSITORY_FILE_BYTES = 1024 * 1024;

export interface PluginContribution {
  id: string;
  title: string;
  context?: string;
  access?: "read" | "write";
}

export interface PluginManifestSummary {
  apiVersion: number;
  requiresPluginApi?: string;
  views: PluginContribution[];
  actions: PluginContribution[];
  formatters: PluginContribution[];
  hooks: PluginContribution[];
  background?: {
    entry: string;
    autoStart: boolean;
    fileHistory: boolean;
    network: boolean;
    networkOrigins: string[];
    bluetooth: boolean;
    services: string[];
  };
  publicNetwork: boolean;
  networkOrigins: string[];
  connections: { id: string; title: string; url: string; configurable: boolean }[];
  workers: boolean;
}

export interface PluginDetails {
  manifest?: PluginManifestSummary;
  readmeHtml?: string;
  readmeLocale?: string;
  readmeFallback?: boolean;
}

interface DetailCache {
  value: PluginDetails;
  expiresAt: number;
}

const memoryCache = new Map<string, DetailCache>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

function parseContributions(value: unknown): PluginContribution[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 64).flatMap((item) => {
    if (!isRecord(item) || !nonEmptyString(item.id)) return [];
    const title = nonEmptyString(item.title) ? item.title : item.id;
    const context = nonEmptyString(item.context) ? item.context : item.kind === "page" ? "page" : Array.isArray(item.capabilities) && item.capabilities.includes("eidos/table") ? "table" : Array.isArray(item.capabilities) && item.capabilities.includes("document") ? "document" : undefined;
    const access = item.access === "read" || item.access === "write" ? item.access : undefined;
    return [{ id: item.id, title, ...(context ? { context } : {}), ...(access ? { access } : {}) }];
  });
}

export function parsePluginManifest(
  value: unknown,
  plugin: Pick<MarketplacePlugin, "id" | "version">,
  locale: Locale = "en",
  localization?: PluginLocalization,
): PluginManifestSummary | undefined {
  if (!isRecord(value) || value.id !== plugin.id || value.version !== plugin.version) return undefined;

  const apiVersion = typeof value.apiVersion === "number" ? value.apiVersion : 1;
  const requires = isRecord(value.requires) ? value.requires : undefined;
  const requiresPluginApi = nonEmptyString(requires?.pluginApi) ? requires.pluginApi : undefined;
  const browser = isRecord(value.browser) ? value.browser : undefined;
  const rawBackground = isRecord(value.background) ? value.background : undefined;
  const origins = Array.isArray(rawBackground?.networkOrigins) ? rawBackground.networkOrigins.filter((origin): origin is string => {
    if (typeof origin !== "string") return false;
    try { const url = new URL(origin); return ["https:", "wss:"].includes(url.protocol) && url.origin === origin; } catch { return false; }
  }).slice(0, 32) : [];
  const bluetooth = rawBackground?.bluetooth;
  const background = rawBackground && nonEmptyString(rawBackground.entry) ? {
    entry: rawBackground.entry,
    autoStart: rawBackground.autoStart === true,
    fileHistory: rawBackground.fileHistory === true,
    network: (rawBackground.network === true && rawBackground.networkOrigins === undefined) || origins.length > 0,
    networkOrigins: origins,
    bluetooth: bluetooth === true || isRecord(bluetooth),
    services: isRecord(bluetooth) && Array.isArray(bluetooth.services) ? bluetooth.services.filter((service) => typeof service === "string" || typeof service === "number").map(String).slice(0, 32) : [],
  } : undefined;
  const contributions = (items: unknown) => parseContributions(items).map((item) => ({ ...item, title: localization ? localizedText(item.title, localization, locale) : item.title }));
  const networkOrigins = Array.isArray(browser?.networkOrigins)
    ? browser.networkOrigins.flatMap((origin) => {
        if (!nonEmptyString(origin)) return [];
        try {
          const parsed = new URL(origin);
          return parsed.protocol === "https:" && parsed.origin === origin ? [origin] : [];
        } catch {
          return [];
        }
      }).slice(0, 32)
    : [];

  const connections = isRecord(value.connections)
    ? Object.entries(value.connections).slice(0, 32).flatMap(([id, connection]) => {
        if (!isRecord(connection) || !nonEmptyString(connection.url)) return [];
        try {
          const url = new URL(connection.url);
          if (url.protocol !== "https:" || url.username || url.password) return [];
        } catch {
          return [];
        }
        return [{
          id,
          title: localization && nonEmptyString(connection.title) ? localizedText(connection.title, localization, locale) : nonEmptyString(connection.title) ? connection.title : id,
          url: connection.url,
          configurable: connection.configurable === true,
        }];
      })
    : [];

  return {
    apiVersion,
    ...(requiresPluginApi ? { requiresPluginApi } : {}),
    views: contributions(value.views),
    actions: contributions(value.actions),
    formatters: contributions(value.formatters),
    hooks: contributions(value.hooks),
    ...(background ? { background } : {}),
    publicNetwork: browser?.network === true && browser.networkOrigins === undefined,
    networkOrigins,
    connections,
    workers: browser?.workers === true,
  };
}

function rewriteRepositoryLinks(markdown: string, repo: string, ref: string, filename: string): string {
  const directory = filename.includes("/") ? filename.slice(0, filename.lastIndexOf("/") + 1) : "";
  const rawBase = `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(ref)}/${directory}`;
  const fileBase = `https://github.com/${repo}/blob/${encodeURIComponent(ref)}/${directory}`;
  return markdown.replace(
    /(!?)\[([^\]]*)\]\((?![A-Za-z][A-Za-z0-9+.-]*:|#)([^)\s]+)(?:\s+"[^"]*")?\)/gu,
    (_match, image: string, label: string, path: string) => {
      const cleanPath = path.trim().replace(/^\.?\//u, "");
      return `${image}[${label}](${image ? rawBase : fileBase}${cleanPath})`;
    },
  );
}

export function renderPluginReadme(markdown: string, repo: string, ref = "main", filename = "README.md"): string {
  const withoutDuplicateTitle = markdown.replace(/^\s*#\s+[^\n]+\n+/u, "");
  const rendered = marked.parse(rewriteRepositoryLinks(withoutDuplicateTitle, repo, ref, filename), {
    async: false,
    gfm: true,
  }) as string;

  return sanitizeHtml(rendered, {
    allowedTags: [
      "a", "blockquote", "br", "code", "del", "em", "h2", "h3", "h4", "h5", "h6",
      "hr", "img", "li", "ol", "p", "pre", "strong", "table", "tbody", "td", "th",
      "thead", "tr", "ul",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      code: ["class"],
      img: ["src", "alt", "title", "loading"],
      ol: ["start"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: { ...attributes, target: "_blank", rel: "noreferrer" },
      }),
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: { ...attributes, loading: "lazy" },
      }),
    },
  });
}

async function fetchRepositoryText(repo: string, tag: string, filename: string): Promise<string | undefined> {
  for (const branch of [encodeURIComponent(tag)]) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${repo}/${branch}/${filename}`,
        { headers: { accept: filename.endsWith(".json") ? "application/json" : "text/plain" }, signal: AbortSignal.timeout(4_000) },
      );
      if (!response.ok) continue;
      const declaredLength = Number(response.headers.get("content-length")) || 0;
      if (declaredLength > MAX_REPOSITORY_FILE_BYTES) continue;
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(await readBounded(response.body, MAX_REPOSITORY_FILE_BYTES));
      return text;
    } catch {
      // A missing release document must not be substituted with mutable HEAD.
    }
  }
  return undefined;
}

async function loadDetails(plugin: MarketplacePlugin, locale: Locale): Promise<PluginDetails> {
  if (plugin.localization) {
    try {
      const pkg = await fetchReleasedPlugin(plugin);
      const manifest = parsePluginManifest(pkg.manifest, plugin, locale, pkg.localization);
      const requested = locale === "zh" ? "zh-CN" : "en";
      for (const candidate of localeCandidates(requested, pkg.localization.defaultLocale)) {
        const filename = pkg.readmes[candidate];
        if (!filename) continue;
        return { manifest, readmeHtml: renderPluginReadme(pkg.resources[filename], plugin.repo, plugin.tag, filename.slice(2)), readmeLocale: candidate,
          readmeFallback: candidate === pkg.localization.defaultLocale && !localeCandidates(requested, requested).includes(candidate) };
      }
      return { manifest };
    } catch { return {}; }
  }
  const [manifestSource, localizedReadmeSource] = await Promise.all([
    fetchRepositoryText(plugin.repo, plugin.tag, "plugin.json"),
    fetchRepositoryText(plugin.repo, plugin.tag, locale === "zh" ? "README.zh-CN.md" : "README.md"),
  ]);
  const readmeSource = locale === "zh" && !localizedReadmeSource
    ? await fetchRepositoryText(plugin.repo, plugin.tag, "README.md")
    : localizedReadmeSource;

  let manifest: PluginManifestSummary | undefined;
  if (manifestSource) {
    try {
      manifest = parsePluginManifest(JSON.parse(manifestSource), plugin, locale);
    } catch {
      manifest = undefined;
    }
  }

  return {
    ...(manifest ? { manifest } : {}),
    ...(readmeSource ? { readmeHtml: renderPluginReadme(readmeSource, plugin.repo, plugin.tag, locale === "zh" && localizedReadmeSource ? "README.zh-CN.md" : "README.md"), readmeFallback: locale === "zh" && !localizedReadmeSource } : {}),
  };
}

export async function loadPluginDetails(plugin: MarketplacePlugin, locale: Locale): Promise<PluginDetails> {
  for (const [key, cached] of memoryCache) {
    if (cached.expiresAt <= Date.now()) memoryCache.delete(key);
  }
  const cacheKey = `${plugin.id}:${plugin.sha256}:${locale}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  // Cache only completed public data, never another Worker's request-scoped I/O.
  const value = await loadDetails(plugin, locale);
  // A transient archive failure must not hide documentation for ten minutes.
  if (!value.manifest && !value.readmeHtml) return value;
  if (memoryCache.size >= 16) memoryCache.delete(memoryCache.keys().next().value!);
  memoryCache.set(cacheKey, { value, expiresAt: Date.now() + DETAIL_CACHE_SECONDS * 1_000 });
  return value;
}
