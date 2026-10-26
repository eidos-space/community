# Eidos Community

The independent application marketplace at [community.eidos.space](https://community.eidos.space).

## Data and ownership

- This repository owns the website, its English and Chinese pages, and deployment.
- [eidos-space/registry](https://github.com/eidos-space/registry) owns catalog entries, schemas, and plugin submissions.
- By default, development and production fetch the public GitHub registry at runtime.
  Successful responses are cached for 10 minutes. Registry updates do not require
  a website deployment. A first load requires network access; refresh failures
  can use the last successful response available to the loader.
- Localized format 3 documentation is read from the checksum-verified release
  archive, selected as a whole document, and cached separately by package hash
  and interface language. Missing translations show a fallback notice. Legacy
  README files are read at the release tag. Screenshots remain repository assets.
- Optional registry `localization` metadata supplies translated names and
  descriptions; the website uses the same exact/script/base/default matching
  order as Plugin API 3.7. Permission summaries include background startup,
  file-open metadata, network and Bluetooth declarations, separately from pages.

Submit or update a plugin in the
[registry repository](https://github.com/eidos-space/registry/blob/main/CONTRIBUTING.md).
Report website issues and contribute UI changes here.

The [official plugin template](https://github.com/eidos-space/eidos-plugin-template)
and [first-plugin tutorial](https://docs.eidos.space/plugins/guide/) are linked
from the developer footer and plugin resources. The template uses published
SDK/tools; newer APIs require matching host and authoring-tool versions.

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

`pnpm deploy:preview` deploys a separate `eidos-plugin-marketplace-preview` Worker
on its workers.dev address. Its routes are empty, so it does not bind the
production `community.eidos.space` domain.

To preview unpublished registry changes, set `EIDOS_REGISTRY_PATH` to the absolute
path of your registry checkout's `plugins.registry.json` in `.env.local`, then
run `pnpm dev`. Development reads that file on every request so edits appear
after refreshing. An invalid local file produces a catalog error instead of
silently showing remote data. Production always uses the public GitHub registry.

## Deployment

```sh
pnpm exec wrangler login
pnpm run deploy
```

Maintainers deploy locally. GitHub Actions only runs validation; it does not
deploy. The existing Worker name `eidos-plugin-marketplace` and custom domain
`community.eidos.space` are retained so deployments update the same service.
No registry checkout, database, or account service is required.

## Repository layout

- `src/`: Astro pages, components, styles, and cached GitHub data loaders.
- `public/`: static assets.
- `tests/`: marketplace contract checks; loader tests live beside their source.
- `wrangler.jsonc`: Cloudflare Worker and custom domain configuration.

The repository retains the shared history from before the website was split
from the registry.
