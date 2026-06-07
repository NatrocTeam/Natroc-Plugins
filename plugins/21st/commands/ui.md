---
description: Generate a new React UI component from a natural language description using 21st.dev Magic
argument-hint: <component description>
allowed-tools:
  - "mcp__plugin_21st_magic__21st_magic_component_builder"
  - "Read"
  - "Write"
  - "Edit"
  - "Glob"
  - "Grep"
---

# /21st:ui

Generate a polished, production-ready React UI component from your description using the 21st.dev Magic MCP server. The component is inspired by the 21st.dev library and ready to be integrated into your project.

## Usage

```
/21st:ui <component description>
```

## Examples

```
/21st:ui a modern navigation bar with responsive design and dark mode toggle
/21st:ui a pricing card with gradient background and feature list
/21st:ui a sign-in form with email, password, and OAuth providers
/21st:ui a data table with sorting, filtering, and pagination
```

## How It Works

1. The MCP tool `21st_magic_component_builder` opens a browser callback flow to 21st.dev with your request.
2. You pick or refine the generated component in the 21st.dev canvas.
3. The MCP returns the component snippet (TSX) plus integration instructions.
4. Claude then edits or adds the necessary files in your project to integrate the snippet.

## Required Inputs Passed to the Tool

When invoking the underlying tool, supply:

- `message` — the full user request (the description after `/21st:ui`).
- `searchQuery` — a 2-4 word phrase that captures the component (e.g., `responsive navigation bar`).
- `absolutePathToCurrentFile` — the file where the component should be inserted (ask the user if unclear).
- `absolutePathToProjectDirectory` — the project root.
- `standaloneRequestQuery` — a focused, hallucination-free summary of what to build, derived from the description, conversation history, and current file context.

## After the Tool Returns

- Read the returned snippet carefully.
- Match the project's conventions: TypeScript, Tailwind CSS, shadcn/ui patterns, file naming, and folder layout.
- Reuse existing components, hooks, and utilities before introducing new ones.
- Run the project's type checker / linter if available before declaring the task done.

## Requirements

- `TWENTY_FIRST_API_KEY` environment variable set with a valid key from https://21st.dev/magic/console.
- Node.js available on `PATH` (the MCP server runs via `npx @21st-dev/magic@latest`).
