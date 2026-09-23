import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://community.eidos.space",
  output: "server",
  trailingSlash: "ignore",
  adapter: cloudflare({
    platformProxy: {
      enabled: false,
    },
  }),
});
