# Eidos Registry

## Eidos Lite plugins

`plugins.registry.json` is the official Marketplace catalog for the current Eidos Lite plugin preview. Legacy extension and theme catalogs below remain separate.

To submit a plugin, publish a public GitHub Release containing `<id>-<version>.eidos-plugin`, then open a PR adding its entry. Include its exact version, tag, asset filename, SHA-256 of the uploaded bytes, a short description and a compatibility note. Set `preview: true` for preview builds. Optional icons contain SVG path data in a 24×24 viewBox, never markup or remote images.

Updates use a new release and a registry PR. Do not replace published assets: the host verifies the pinned checksum and package identity before requesting installation permission. Maintainers review ownership, compatibility and requested permissions before merging. Listing does not execute plugin code. Install once per device and enable separately in each Space.

The host fetches this catalog over HTTPS and downloads the pinned GitHub Release asset. It retains the last successful catalog for offline browsing; installing requires a fresh online catalog. There is no automatic update or npm dependency installation.

This is the official registry for Eidos extensions and themes.

## Themes

Submit your theme by adding to `themes.registry.json`:

```json
{
  "name": "My Theme",
  "author": "github-username",
  "repo": "owner/repo-name",
  "screenshot": "screenshot.png",
  "modes": ["dark", "light"]
}
```

### Theme Fields

| Field        | Required | Description                                    |
| ------------ | -------- | ---------------------------------------------- |
| `name`       | Yes      | Display name                                   |
| `author`     | Yes      | Your name                                      |
| `repo`       | Yes      | GitHub `owner/repo`                            |
| `screenshot` | Yes      | Image filename in repo                         |
| `modes`      | Yes      | `["light"]`, `["dark"]` or `["light", "dark"]` |

### Theme Requirements

- Public GitHub repo
- `theme.css` in repo root
- Screenshot image in repo

## Extensions

Submit your extension by adding to `extensions.registry.json`:

```json
{
  "name": "My Extension",
  "author": "github-username",
  "repo": "owner/repo-name",
  "description": "Short description of what the extension does"
}
```

### Extension Fields

| Field         | Required | Description                         |
| ------------- | -------- | ----------------------------------- |
| `name`        | Yes      | Display name                        |
| `author`      | Yes      | Your name                           |
| `repo`        | Yes      | GitHub `owner/repo`                 |
| `description` | Yes      | Brief description of the extension  |

### Extension Requirements

- Public GitHub repo
- Follow the Eidos extension structure

## Example Repos

- Theme: `mayneyao/eidos-theme-flexoki`
