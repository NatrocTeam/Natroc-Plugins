# 21st Plugin

The `21st` plugin connects Claude Code and Codex to the **21st.dev Magic** MCP
server, an AI-driven UI component platform. It lets agents generate polished
React components, browse inspiration, refine existing components, and search
brand logos through natural language or slash commands.

## What's Included

This plugin provides:

- **MCP Server** - `@21st-dev/magic` runs locally via `npx` and exposes four tools.
- **Skills** - Auto-trigger UI component generation and logo search when the user asks for components or brand assets.
- **Subagents** - Focused Claude and Codex agents for Magic UI component work and logo asset integration.
- **Commands** - `/21st:ui`, `/21st:inspire`, `/21st:refine`, and `/21st:logo` for direct invocation.

## Prerequisites

1. **Node.js** (latest LTS recommended) on your `PATH`.
2. A **21st.dev Magic API key** - generate one at https://21st.dev/magic/console.
3. Set the API key as an environment variable named `TWENTY_FIRST_API_KEY`:

   ```bash
   export TWENTY_FIRST_API_KEY="your-api-key-here"
   ```

   Or add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.).

## Installation

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install code-review@natroc-plugins
  ```

### Claude Desktop & Claude Web (claude.ai)

Open `Customize` in the left panel and click `+` icon, then select `Create
plugin` > `Add marketplace`.

- Add marketplace from a repository

  ```
  NatrocTeam/Natroc-Plugins
  ```

### Codex CLI

- Add marketplace

  ```
  codex plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin
  ```
  codex plugin add code-review@natroc-plugins
  ```

### Codex Desktop

- Add marketplace

  Source

  ```
  NatrocTeam/Natroc-Plugins
  ```

  Git ref (optional)

  ```
  main
  ```

## Available Tools

The Magic MCP server exposes four tools. Tool names below use the Claude Code plugin prefix `mcp__plugin_21st_magic__`.

### 21st_magic_component_builder

Generate a new React UI component from a description.

```
Input: { message, searchQuery, absolutePathToCurrentFile, absolutePathToProjectDirectory, standaloneRequestQuery }
Output: TSX component snippet + integration instructions
```

### 21st_magic_component_inspiration

Fetch component data and previews from 21st.dev without generating new code.

```
Input: { message, searchQuery }
Output: JSON list of matching components with metadata
```

### 21st_magic_component_refiner

Re-design and improve an existing component file.

```
Input: { userMessage, absolutePathToRefiningFile, context }
Output: Refined component + apply-instructions
```

### logo_search

Search SVGL for brand logos and return them as components.

```
Input: { queries: string[], format: "JSX" | "TSX" | "SVG" }
Output: Component code + import instructions
```

## Slash Commands

### `/21st:ui <description>`

Generate a new component.

```
/21st:ui modern navigation bar with responsive design
/21st:ui pricing card with gradient background
/21st:ui sign-in form with email and OAuth providers
```

### `/21st:inspire <phrase>`

Browse component inspiration without generating code.

```
/21st:inspire dashboard sidebar
/21st:inspire animated hero section
/21st:inspire bento grid layout
```

### `/21st:refine <path> <goal>`

Refine an existing component file.

```
/21st:refine src/components/ui/button.tsx improve hover states
/21st:refine src/components/PricingCard.tsx make it responsive on mobile
```

### `/21st:logo <brand> [more brands...] [--format=tsx|jsx|svg]`

Search and import brand logos.

```
/21st:logo github
/21st:logo discord slack notion
/21st:logo vercel --format=svg
```

## Auto-triggering Skills

The plugin includes two skills that activate without an explicit slash command:

- **magic-ui** - Activates when the user asks to create, refine, or get inspiration for any React UI component.
- **logo-search** - Activates when the user asks for a brand logo or company icon.

This means natural-language requests like "buat hero section dengan animasi" or "tambahkan logo GitHub" will trigger the right tool automatically.

## Configuration

The plugin's MCP config (`./.mcp.json`):

```json
{
  "mcpServers": {
    "magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": {
        "API_KEY": "${TWENTY_FIRST_API_KEY}"
      }
    }
  }
}
```

The MCP server is launched on demand via `npx`. The first invocation downloads the package.

## Plugin Structure

```text
21st/
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
├── .mcp.json
├── agents/
├── assets/
├── commands/
└── skills/
```

## Troubleshooting

- **`/mcp` shows the server but no tools** - ensure `TWENTY_FIRST_API_KEY` is exported in the shell that launched Claude Code.
- **Generation fails / hangs** - confirm the API key is valid at https://21st.dev/magic/console and check your remaining generation quota.
- **`npx` cannot find the package** - verify Node.js is on your `PATH` and run `npx @21st-dev/magic@latest` manually to test.
- **Browser callback does not open** - the builder tool opens a callback URL; ensure your system has a default browser configured.

## Links

- 21st.dev Magic Console: https://21st.dev/magic/console
- Magic MCP source: https://github.com/21st-dev/magic-mcp
- SVGL (logo source): https://svgl.app
- 21st.dev component library: https://21st.dev

## License

MIT
