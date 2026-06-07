# Magic MCP Tool Reference

Detailed parameter reference for each tool exposed by the `@21st-dev/magic` MCP server. All tool names below use the Claude Code plugin prefix `mcp__plugin_21st_magic__`.

## 21st_magic_component_builder

Generate a brand-new React UI component from a natural language description.

### When to Use

- The user requests a new component (button, navbar, card, dialog, form, table, banner, etc.).
- The user types `/ui`, `/21`, or `/21st`.
- The target file is known or can be confirmed with the user.

### Schema

| Field                            | Type   | Required | Description                                                                                                                    |
| -------------------------------- | ------ | :------: | ------------------------------------------------------------------------------------------------------------------------------ |
| `message`                        | string |   yes    | The full user message, verbatim. Used by 21st.dev to understand intent.                                                        |
| `searchQuery`                    | string |   yes    | 2-4 word phrase that captures the component type (e.g., `responsive navigation bar`, `pricing card`).                          |
| `absolutePathToCurrentFile`      | string |   yes    | Absolute path to the file where the component should be inserted.                                                              |
| `absolutePathToProjectDirectory` | string |   yes    | Absolute path to the project root.                                                                                             |
| `standaloneRequestQuery`         | string |   yes    | A precise, self-contained summary of what to build. Pull in context from chat history and current files. Avoid hallucinations. |

### Behavior

- Opens a browser callback flow to 21st.dev.
- The user picks or refines the generated component in the 21st.dev canvas.
- Returns the component snippet (TSX) plus integration instructions.

### Notes

- The returned text snippet is the source of truth. After receiving it, **edit or add files** to integrate the snippet into the codebase.
- Always pass absolute paths — relative paths are rejected.

## 21st_magic_component_inspiration

Fetch component data and previews from 21st.dev without generating new code.

### When to Use

- The user wants to browse options before committing.
- The user asks "show me examples of X", "what's a good design for Y", "/21st fetch ...".

### Schema

| Field         | Type   | Required | Description                                                        |
| ------------- | ------ | :------: | ------------------------------------------------------------------ |
| `message`     | string |   yes    | Full user message.                                                 |
| `searchQuery` | string |   yes    | 2-4 word phrase (e.g., `bento grid layout`, `glassmorphism card`). |

### Behavior

- Returns matching components as JSON with metadata and preview links.
- **Does not generate or modify code.**

### Notes

- Use this as a pre-step before `21st_magic_component_builder` when direction is unclear.
- Summarize the top matches for the user and recommend the best fit before building.

## 21st_magic_component_refiner

Re-design and improve an existing React component file.

### When to Use

- The user points to a specific component file and asks to improve styling, layout, responsiveness, animations, focus states, etc.
- Best for **components and molecules** (button, card, modal, form). **Not for entire pages.**

### Schema

| Field                        | Type   | Required | Description                                                                                                                                                                                                          |
| ---------------------------- | ------ | :------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `userMessage`                | string |   yes    | Full user message about refinement.                                                                                                                                                                                  |
| `absolutePathToRefiningFile` | string |   yes    | Absolute path to the component file.                                                                                                                                                                                 |
| `context`                    | string |   yes    | Specific UI elements and aspects to improve. Extract from the message, file contents, and conversation history. Return an empty string if no specifics can be inferred — **never hallucinate generic improvements.** |

### Behavior

- Sends the file content plus context to the 21st.dev API.
- Returns the redesigned component plus apply-instructions.

### Notes

- Read the file first with the `Read` tool before invoking this — confirm the file exists and contents match expectations.
- Apply the suggested change with **minimal, focused edits**. Do not rewrite the entire file if a partial update suffices.
- Preserve imports, prop types, and exported names unless the refinement explicitly changes them.

## logo_search

Search and return brand logos in JSX, TSX, or SVG format. **This tool lives in the `logo-search` skill — keep brand-asset workflows separate from component-generation workflows.**

### Schema (for reference)

| Field     | Type                      | Required | Description                                   |
| --------- | ------------------------- | :------: | --------------------------------------------- |
| `queries` | string[]                  |   yes    | Array of brand names (lowercase recommended). |
| `format`  | `"JSX" \| "TSX" \| "SVG"` |   yes    | Output format.                                |

See the `logo-search` skill for full workflow guidance.
