---
description: Fetch UI component inspiration and previews from 21st.dev without generating new code
argument-hint: <search phrase>
allowed-tools:
  - "mcp__plugin_21st_magic__21st_magic_component_inspiration"
  - "Read"
---

# /21st:inspire

Browse the 21st.dev component library for inspiration. Returns matching component data and previews without generating new code, so the user can pick a direction before committing to a build.

## Usage

```
/21st:inspire <search phrase>
```

## Examples

```
/21st:inspire dashboard sidebar
/21st:inspire animated hero section
/21st:inspire bento grid layout
/21st:inspire glassmorphism card
```

## How It Works

1. The MCP tool `21st_magic_component_inspiration` searches the 21st.dev component library.
2. Matching components, previews, and metadata are returned as JSON.
3. No code is generated yet — review the options first.
4. Use `/21st:ui` afterwards to actually build the chosen direction.

## Required Inputs Passed to the Tool

- `message` — the full user message (the search phrase after `/21st:inspire`).
- `searchQuery` — a 2-4 word phrase distilled from the message (e.g., `bento grid layout`).

## After the Tool Returns

- Summarize the most relevant matches for the user.
- Recommend one or two strong candidates with a short rationale.
- Do **not** modify any project files at this stage — this is a research command.
- When the user picks a direction, follow up with `/21st:ui` to generate the component.

## Requirements

- `TWENTY_FIRST_API_KEY` environment variable set with a valid key from https://21st.dev/magic/console.
