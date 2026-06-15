---
description: Search and import brand logos as JSX, TSX, or SVG components via SVGL
argument-hint: <brand name> [more brands...] [--format=tsx|jsx|svg]
allowed-tools:
  - "mcp__plugin_21st_magic__logo_search"
  - "Read"
  - "Write"
  - "Edit"
  - "Glob"
---

# /21st:logo

Search the SVGL library for brand logos and return them as ready-to-use JSX, TSX, or raw SVG components. Use this whenever you need a company or product logo that is not already in the project.

## Usage

```
/21st:logo <brand name> [more brands...] [--format=tsx|jsx|svg]
```

Default format is `TSX` if not specified.

## Examples

```
/21st:logo github
/21st:logo discord slack notion
/21st:logo microsoft office --format=svg
/21st:logo vercel --format=jsx
```

## How It Works

1. The MCP tool `logo_search` queries the SVGL API for matching logos.
2. Light/dark theme variants are returned when available.
3. The chosen format (`TSX`, `JSX`, or `SVG`) is generated with a clean component name (e.g. `GithubIcon`).
4. Import instructions are included with each result.

## Required Inputs Passed to the Tool

- `queries` - an array of company / brand names (lowercase, e.g., `["discord", "github"]`).
- `format` - one of `TSX`, `JSX`, or `SVG`.

## After the Tool Returns

- Save the component into the project's icon directory (e.g., `src/components/icons/` or wherever existing brand icons live).
- Match the existing naming convention; do not invent a new folder layout.
- If multiple variants are returned (light/dark), wire them into the project's theme system.
- For raw `SVG`, consider placing it in `public/` or inlining as a React component, depending on convention.

## Requirements

- `TWENTY_FIRST_API_KEY` environment variable set.
- Network access to https://api.svgl.app (used by the underlying tool).
