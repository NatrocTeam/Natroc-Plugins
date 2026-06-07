# Context7 Plugin

Context7 solves a common problem with AI coding assistants: outdated training
data and hallucinated APIs. Instead of relying on stale knowledge, this plugin
lets Claude Code and Codex fetch current documentation directly from source
repositories through the Context7 MCP server.

## What's Included

This plugin provides:

- **MCP Server** - Connects to Context7's documentation service
- **Skills** - Auto-triggers documentation lookups when you ask about libraries
- **Agents** - A dedicated `docs-researcher` agent for focused lookups
- **Commands** - `/context7:docs` for manual documentation queries

## Installation

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install context7@natroc-plugins
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
  codex plugin add context7@natroc-plugins
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

### resolve-library-id

Searches for libraries and returns Context7-compatible identifiers.

```
Input: "next.js"
Output: { id: "/vercel/next.js", name: "Next.js", versions: ["v15.1.8", "v14.2.0", ...] }
```

### query-docs

Fetches documentation for a specific library, ranked by relevance to your question.

```
Input: { libraryId: "/vercel/next.js", query: "app router middleware" }
Output: Relevant documentation snippets with code examples
```

## Usage Examples

The plugin works automatically when you ask about libraries:

- "How do I set up authentication in Next.js 15?"
- "Show me React Server Components examples"
- "What's the Prisma syntax for relations?"

For manual lookups, use the command:

```
/context7:docs next.js app router
/context7:docs /vercel/next.js/v15.1.8 middleware
```

Or spawn the docs-researcher agent when you want to keep your main context clean:

```
spawn docs-researcher to look up Supabase auth methods
```

## Version Pinning

To get documentation for a specific version, include the version in the library ID:

```
/vercel/next.js/v15.1.8
/supabase/supabase/v2.45.0
```

The `resolve-library-id` tool returns available versions, so you can pick the one that matches your project.

## Plugin Structure

```text
context7/
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
├── .mcp.json
├── agents/
├── assets/
├── commands/
└── skills/
```
