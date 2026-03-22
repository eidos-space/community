# Eidos Extension & Theme Registry

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
| `legacy`     | No       | `true` for deprecated themes                   |

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
