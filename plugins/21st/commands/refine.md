---
description: Re-design and refine an existing React UI component file using 21st.dev Magic
argument-hint: <absolute path to component file> <what to improve>
allowed-tools:
  - "mcp__plugin_21st_magic__21st_magic_component_refiner"
  - "Read"
  - "Edit"
  - "Write"
---

# /21st:refine

Improve the look-and-feel of an existing React component (button, card, modal, form — molecule-sized, not full pages). The Magic server analyzes the current file and returns a redesigned version plus integration instructions.

## Usage

```
/21st:refine <absolute path to component file> <what to improve>
```

## Examples

```
/21st:refine src/components/ui/button.tsx improve hover states and add subtle animation
/21st:refine src/components/PricingCard.tsx make the layout responsive on mobile
/21st:refine src/components/auth/SignInForm.tsx polish the focus states and error styles
```

## How It Works

1. Read the target file first to confirm its contents.
2. The MCP tool `21st_magic_component_refiner` sends the file content plus context to 21st.dev.
3. The tool returns a refined version of the component along with apply-instructions.
4. Claude integrates the suggested changes carefully into the existing file.

## Required Inputs Passed to the Tool

- `userMessage` — the full user request including refinement goals.
- `absolutePathToRefiningFile` — the absolute path to the component file to refine.
- `context` — specific UI elements and aspects to improve, extracted from the request, file contents, and conversation history. Be precise. Return an empty string if nothing specific can be inferred — do not hallucinate generic improvements.

## After the Tool Returns

- Diff the suggested code against the existing file.
- Preserve the file's existing imports, prop types, and exported names unless the refinement explicitly changes them.
- Keep the project's design tokens (Tailwind theme, shadcn variants, color palette).
- Apply the change with minimal, focused edits — do not rewrite the whole file if a partial update suffices.
- Run the project's type checker / linter if available.

## Scope Limits

- Best for **components and molecules**, not entire pages or layouts.
- For brand-new components, use `/21st:ui` instead.
- For exploring options before building, use `/21st:inspire`.

## Requirements

- `TWENTY_FIRST_API_KEY` environment variable set with a valid key from https://21st.dev/magic/console.
