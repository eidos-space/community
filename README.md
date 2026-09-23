# Eidos Community

The independent application marketplace at [community.eidos.space](https://community.eidos.space).

## Data and ownership

- This repository owns the website, its English and Chinese pages, and deployment.
- [eidos-space/registry](https://github.com/eidos-space/registry) owns catalog entries, schemas, and plugin submissions.
- Both development and production fetch the public GitHub registry at runtime.
  Successful responses are cached for 10 minutes. Registry updates do not require
  a website deployment. A first load requires network access; refresh failures
  can use the last successful response available to the loader.
- Plugin README files and screenshots are read from their GitHub repositories.
  Installation assets remain pinned to the releases and checksums in the registry.

Submit or update a plugin in the
[registry repository](https://github.com/eidos-space/registry/blob/main/CONTRIBUTING.md).
Report website issues and contribute UI changes here.

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

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
