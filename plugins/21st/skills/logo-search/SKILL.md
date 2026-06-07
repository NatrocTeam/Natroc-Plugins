---
name: logo-search
description: This skill should be used when the user asks to "add a logo", "find a brand logo", "search for company icon", "import GitHub/Discord/Slack/Microsoft/etc logo", or types "/logo <brand>". Fetches brand assets from SVGL and returns them as JSX, TSX, or SVG components ready to drop into a React project.
---

# Logo Search — SVGL Brand Assets

Use this skill whenever the user asks for a brand logo or company icon that is not already present in the project. The `logo_search` tool wraps the SVGL API and returns logos as JSX, TSX, or raw SVG components.

## When to Activate

Activate this skill when the user:

- Types `/logo <brand>` (e.g., `/logo github`, `/logo discord slack`).
- Asks to "add a logo" or "find a brand logo".
- Requests an icon for a specific company / product (GitHub, Discord, Slack, Microsoft, Vercel, Notion, etc.).
- Builds a marketing section that lists customer logos or social proof.

Do **not** activate for: generic UI icons (use Lucide / Heroicons / project icon library), custom illustrations, or non-brand graphics.

## Available Tool

| Tool                                  | Use for                                                           |
| ------------------------------------- | ----------------------------------------------------------------- |
| `mcp__plugin_21st_magic__logo_search` | Search SVGL by company name and return logos as JSX, TSX, or SVG. |

## Workflow

1. **Extract brand names** from the request. Lowercase, no special characters. Examples:
   - `/logo GitHub` → `["github"]`
   - `Add Discord and Slack icons` → `["discord", "slack"]`
   - `microsoft office logo` → `["microsoft office"]`
2. **Choose the output format**:
   - `TSX` — default for TypeScript React projects.
   - `JSX` — for JavaScript React projects.
   - `SVG` — for raw SVG (e.g., placing in `public/`, inlining in HTML).
3. **Call `logo_search`** with:
   - `queries` — array of brand names.
   - `format` — one of `"TSX"`, `"JSX"`, `"SVG"`.
4. **Integrate the returned component(s)**:
   - Save into the project's icon directory (e.g., `src/components/icons/`).
   - Match the existing naming convention (file: `kebab-case.tsx` or `PascalCase.tsx`; component: `GithubIcon`, `DiscordIcon`).
   - If light/dark variants are returned, wire them into the project's theme system (e.g., conditionally render based on `useTheme()`).

## Behavior Notes

- SVGL returns 404 / empty results when no matching brand is found. The tool returns an empty array gracefully — inform the user and suggest alternative spellings.
- Brand logos are property of their respective owners. Confirm usage rights for commercial / marketing material.
- The returned component name is derived from the brand (e.g., `discord` → `DiscordIcon`). Rename if the project uses a different convention.

## Required Setup

- `TWENTY_FIRST_API_KEY` environment variable set with a valid key from https://21st.dev/magic/console.
- Network access to `https://api.svgl.app`.

## Slash Command

The user can invoke this workflow directly via:

```
/21st:logo <brand> [more brands...] [--format=tsx|jsx|svg]
```

## Integration Tips

- For a "customer logo strip" or "social proof" section, fetch multiple brands in a single call (the tool accepts an array).
- Use `aria-label="<Brand> logo"` on the rendered component for accessibility.
- For dark / light themed brands, prefer the theme-aware variant from SVGL when available.
- Avoid duplicating an icon that already exists in the project — search the codebase first.
