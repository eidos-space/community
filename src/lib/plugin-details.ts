import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import type { Locale } from "../i18n";
import type { MarketplacePlugin } from "./plugin-registry";

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
  networkOrigins: string[];
  workers: boolean;
}

export interface PluginDetails {
  manifest?: PluginManifestSummary;
  readmeHtml?: string;
}

interface DetailCache {
  value: PluginDetails;
  expiresAt: number;
}

const memoryCache = new Map<string, DetailCache>();
const pendingLoads = new Map<string, Promise<PluginDetails>>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

function parseContributions(value: unknown): PluginContribution[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 64).flatMap((item) => {
    if (!isRecord(item) || !nonEmptyString(item.id)) return [];
    const title = nonEmptyString(item.title) ? item.title : item.id;
    const context = nonEmptyString(item.context) ? item.context : undefined;
    const access = item.access === "read" || item.access === "write" ? item.access : undefined;
    return [{ id: item.id, title, ...(context ? { context } : {}), ...(access ? { access } : {}) }];
  });
}

export function parsePluginManifest(
  value: unknown,
  plugin: Pick<MarketplacePlugin, "id" | "version">,
): PluginManifestSummary | undefined {
  if (!isRecord(value) || value.id !== plugin.id || value.version !== plugin.version) return undefined;

  const apiVersion = typeof value.apiVersion === "number" ? value.apiVersion : 1;
  const requires = isRecord(value.requires) ? value.requires : undefined;
  const requiresPluginApi = nonEmptyString(requires?.pluginApi) ? requires.pluginApi : undefined;
  const browser = isRecord(value.browser) ? value.browser : undefined;
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

  return {
    apiVersion,
    ...(requiresPluginApi ? { requiresPluginApi } : {}),
    views: parseContributions(value.views),
    actions: parseContributions(value.actions),
    formatters: parseContributions(value.formatters),
    networkOrigins,
    workers: browser?.workers === true,
  };
}

function rewriteRepositoryLinks(markdown: string, repo: string): string {
  const rawBase = `https://raw.githubusercontent.com/${repo}/main/`;
  const fileBase = `https://github.com/${repo}/blob/main/`;
  return markdown.replace(
    /(!?)\[([^\]]*)\]\((?![A-Za-z][A-Za-z0-9+.-]*:|#)([^)\s]+)(?:\s+"[^"]*")?\)/gu,
    (_match, image: string, label: string, path: string) => {
      const cleanPath = path.trim().replace(/^\.?\//u, "");
      return `${image}[${label}](${image ? rawBase : fileBase}${cleanPath})`;
    },
  );
}

export function renderPluginReadme(markdown: string, repo: string): string {
  const withoutDuplicateTitle = markdown.replace(/^\s*#\s+[^\n]+\n+/u, "");
  const rendered = marked.parse(rewriteRepositoryLinks(withoutDuplicateTitle, repo), {
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

async function fetchRepositoryText(repo: string, filename: string): Promise<string | undefined> {
  for (const branch of ["main", "master"]) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${repo}/${branch}/${filename}`,
        { headers: { accept: filename.endsWith(".json") ? "application/json" : "text/plain" }, signal: AbortSignal.timeout(4_000) },
      );
      if (!response.ok) continue;
      const declaredLength = Number(response.headers.get("content-length")) || 0;
      if (declaredLength > MAX_REPOSITORY_FILE_BYTES) continue;
      const text = await response.text();
      if (new TextEncoder().encode(text).byteLength > MAX_REPOSITORY_FILE_BYTES) continue;
      return text;
    } catch {
      // Try the repository's other conventional default branch.
    }
  }
  return undefined;
}

async function loadDetails(plugin: MarketplacePlugin, locale: Locale): Promise<PluginDetails> {
  const [manifestSource, localizedReadmeSource] = await Promise.all([
    fetchRepositoryText(plugin.repo, "plugin.json"),
    fetchRepositoryText(plugin.repo, locale === "zh" ? "README.zh-CN.md" : "README.md"),
  ]);
  const readmeSource = locale === "zh" && !localizedReadmeSource
    ? await fetchRepositoryText(plugin.repo, "README.md")
    : localizedReadmeSource;

  let manifest: PluginManifestSummary | undefined;
  if (manifestSource) {
    try {
      manifest = parsePluginManifest(JSON.parse(manifestSource), plugin);
    } catch {
      manifest = undefined;
    }
  }

  return {
    ...(manifest ? { manifest } : {}),
    ...(readmeSource ? { readmeHtml: renderPluginReadme(readmeSource, plugin.repo) } : {}),
  };
}

export function loadPluginDetails(plugin: MarketplacePlugin, locale: Locale): Promise<PluginDetails> {
  const cacheKey = `${plugin.id}:${plugin.version}:${locale}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);

  const existing = pendingLoads.get(cacheKey);
  if (existing) return existing;

  const pending = loadDetails(plugin, locale)
    .then((value) => {
      memoryCache.set(cacheKey, { value, expiresAt: Date.now() + DETAIL_CACHE_SECONDS * 1_000 });
      return value;
    })
    .finally(() => pendingLoads.delete(cacheKey));
  pendingLoads.set(cacheKey, pending);
  return pending;
}
