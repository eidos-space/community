import type { Locale } from "../i18n";

export interface PluginLocalization {
  defaultLocale: string;
  messages: Record<string, Record<string, string>>;
  name: string;
  description?: string;
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

export function parseLocalization(value: unknown): PluginLocalization | undefined {
  if (!record(value) || typeof value.defaultLocale !== "string" || !record(value.messages) ||
      !Object.hasOwn(value.messages, value.defaultLocale) || Object.keys(value.messages).length > 32 ||
      typeof value.name !== "string" || !value.name || value.name.length > 128 ||
      (value.description !== undefined && (typeof value.description !== "string" || value.description.length > 1024))) return undefined;
  try {
    const dictionaries: Record<string, Record<string, string>> = {};
    for (const [locale, messages] of Object.entries(value.messages)) {
      if (Intl.getCanonicalLocales(locale)[0] !== locale || !record(messages) || Object.keys(messages).length > 4096 ||
          Object.entries(messages).some(([key, message]) => !/^[a-zA-Z][\w.-]{0,127}$/.test(key) || typeof message !== "string" || message.length > 4096 || /[\u0000-\u001f\u007f]/.test(message))) return undefined;
      const dictionary: Record<string, string> = {};
      for (const [key, message] of Object.entries(messages)) {
        if (typeof message !== "string") return undefined;
        dictionary[key] = message;
      }
      dictionaries[locale] = dictionary;
    }
    const defaults = dictionaries[value.defaultLocale];
    for (const label of [value.name, value.description]) {
      if (typeof label === "string" && /^%[^%]+%$/.test(label) && !Object.hasOwn(defaults, label.slice(1, -1))) return undefined;
    }
    return { defaultLocale: value.defaultLocale, messages: dictionaries, name: value.name, ...(typeof value.description === "string" ? { description: value.description } : {}) };
  } catch { return undefined; }
}

/** Plugin API 3.7 matching: exact tag, script, base language, explicit default. */
export function localeCandidates(locale: string, fallback: string): string[] {
  const tag = new Intl.Locale(locale);
  const script = tag.script ?? (tag.language === "zh" ? tag.maximize().script : undefined);
  return [...new Set([tag.toString(), ...(script ? [`${tag.language}-${script}`] : []), tag.language, fallback])];
}

export function localizedText(text: string, localization: PluginLocalization, locale: Locale): string {
  if (!/^%[^%]+%$/.test(text)) return text;
  const key = text.slice(1, -1);
  for (const candidate of localeCandidates(locale === "zh" ? "zh-CN" : "en", localization.defaultLocale)) {
    const messages = localization.messages[candidate];
    if (messages && Object.hasOwn(messages, key)) return messages[key];
  }
  return key;
}

export function localizePlugin<T extends { name: string; description: string; localization?: PluginLocalization }>(plugin: T, locale: Locale): T {
  if (!plugin.localization) return plugin;
  return { ...plugin, name: localizedText(plugin.localization.name, plugin.localization, locale),
    description: plugin.localization.description ? localizedText(plugin.localization.description, plugin.localization, locale) : plugin.description };
}
