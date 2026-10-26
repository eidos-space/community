import { loadPluginRegistry, parsePluginRegistry, type PluginRegistry } from "./plugin-registry";

export async function loadMarketplaceRegistry(): Promise<PluginRegistry> {
  // Local registry previews are opt-in and never used by the production Worker.
  if (import.meta.env.DEV && import.meta.env.EIDOS_REGISTRY_PATH) {
    const { readFile } = await import("node:fs/promises");
    return parsePluginRegistry(JSON.parse(await readFile(import.meta.env.EIDOS_REGISTRY_PATH, "utf8")));
  }
  return loadPluginRegistry();
}
