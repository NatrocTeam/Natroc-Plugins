---
name: magic-ui
description: This skill should be used when the user asks to "create a UI component", "build a React component", "design a form/button/card/modal/dialog/navbar/sidebar/hero/pricing/dashboard", or types "/ui", "/21", "/21st". Also activates when the user wants to refine, redesign, or improve an existing React component, or needs inspiration from the 21st.dev component library. Generates production-ready React components via the 21st.dev Magic MCP server.
---

# Magic UI - 21st.dev Component Generation

Use this skill whenever the user asks to create, refine, or get inspiration for a React UI component. The 21st.dev Magic MCP server provides three tools that cover the full component-building workflow: building from scratch, fetching inspiration, and refining existing components.

## When to Activate

Activate this skill when the user:

- Asks to **create** a UI component ("buatkan button", "create a navbar", "buat hero section", "design a pricing card").
- Types one of the trigger commands: `/ui`, `/21`, `/21st`.
- Wants to **refine, redesign, or improve** an existing React component file.
- Wants to **explore inspiration** from the 21st.dev component library before building.
- Mentions component types: button, input, dialog, modal, table, form, banner, card, navbar, sidebar, hero, pricing, dashboard, footer, etc.

Do **not** activate for: backend logic, server actions, database queries, refactoring unrelated code, or generic React questions that are not about UI generation.

## Available Tools

Three Magic MCP tools cover the full workflow. Their exact names (with plugin prefix):

| Tool                                                       | Use for                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `mcp__plugin_21st_magic__21st_magic_component_builder`     | Generate a brand-new component from a description.         |
| `mcp__plugin_21st_magic__21st_magic_component_inspiration` | Fetch component data and previews without generating code. |
| `mcp__plugin_21st_magic__21st_magic_component_refiner`     | Re-design and improve an existing component file.          |

The companion `logo_search` tool lives in the `logo-search` skill - keep concerns separated.

## Workflow

### Build a New Component

1. Confirm the component goal and the destination file path. Ask the user if the target path is ambiguous.
2. Call `21st_magic_component_builder` with:
   - `message` - the user's full request, verbatim.
   - `searchQuery` - a 2-4 word phrase summarizing the component (e.g., `responsive navigation bar`).
   - `absolutePathToCurrentFile` - the destination file (absolute path).
   - `absolutePathToProjectDirectory` - the project root (absolute path).
   - `standaloneRequestQuery` - a precise, hallucination-free summary of what to build.
3. Integrate the returned snippet into the project:
   - Match existing TypeScript, Tailwind, and shadcn/ui conventions.
   - Reuse existing utilities, hooks, and shared components before adding new ones.
   - Place files in the directory the project already uses for similar components.
4. Verify with the project's type checker / linter when possible.

### Get Inspiration First

When the user says "show me options", "give me ideas", "what would a good X look like":

1. Call `21st_magic_component_inspiration` with:
   - `message` - full request.
   - `searchQuery` - 2-4 word distilled phrase.
2. Summarize the top matches. Recommend one or two with a short rationale.
3. **Do not edit any files** at this stage. Wait for the user to pick a direction, then move to the build step.

### Refine an Existing Component

When the user points to an existing component file and asks for improvements:

1. Read the target file first with the `Read` tool to confirm contents.
2. Call `21st_magic_component_refiner` with:
   - `userMessage` - full refinement request.
   - `absolutePathToRefiningFile` - absolute path to the file.
   - `context` - concrete UI aspects to improve (extracted from the request and file contents). Return an empty string if no specifics can be inferred - never hallucinate generic improvements.
3. Apply the suggested changes with **minimal, focused edits**:
   - Preserve existing imports, prop types, and exported names unless the refinement explicitly changes them.
   - Keep the project's design tokens (Tailwind theme, shadcn variants, color palette).
   - Do not rewrite the entire file if a partial edit suffices.

## Important Constraints

- The component refiner is best for **components and molecules** - not full pages or layouts.
- Magic returns React + TypeScript by default. If the project is JavaScript-only, request JSX explicitly or convert before saving.
- The Magic tool may open a browser callback (for the builder) to let the user choose options interactively. Inform the user when this is about to happen.
- Always pass **absolute paths** to the tools - relative paths are not supported.

## Required Setup

- `TWENTY_FIRST_API_KEY` environment variable set with a valid key from https://21st.dev/magic/console.
- Node.js available on `PATH` (the MCP server runs via `npx @21st-dev/magic@latest`).
- A 21st.dev account on a plan that allows the requested generation volume.

## Slash Commands

The user can invoke the same workflows directly via slash commands:

- `/21st:ui <description>` - generate a new component.
- `/21st:inspire <phrase>` - browse inspiration.
- `/21st:refine <path> <goal>` - refine an existing component.
- `/21st:logo <brand>` - search brand logos (handled by the `logo-search` skill).

## Additional Resources

For deeper guidance, consult:

- **`references/tools.md`** - detailed parameter reference for each Magic tool.
- **`references/integration.md`** - how to merge generated snippets into a typical Next.js / Vite + Tailwind + shadcn project.
