<div align="center">

# **Natroc Plugins**

A cross-agent plugin marketplace for Claude Code and Codex - extend your AI agents with new tools, skills, and workflows.

[![Claude Code](https://img.shields.io/badge/Plugins-FFFFFF?style=for-the-badge&logo=claude&logoColor=white&label=Claude%20Code&labelColor=D97757&color=522d21)](https://claude.com/product/claude-code)
[![GitHub Release](https://img.shields.io/github/v/release/NatrocTeam/Natroc-Plugins?display_name=release&style=for-the-badge)](https://github.com/NatrocTeam/Natroc-Plugins/releases)
[![Codex](https://img.shields.io/badge/Plugins-3B43FF?style=for-the-badge&label=Codex&labelColor=A9A6FF)](https://openai.com/codex/)

</div>

---

## Available Plugins

| Plugin                                                   | Description                                                                                                                                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`21st`](./plugins/21st)                                 | Generate modern React UI components and search brand logos via the 21st.dev Magic MCP server.                                                                                                                      |
| [`anthropic-sdk`](./plugins/anthropic-sdk)               | Self-contained Anthropic Client SDK and Claude Agent SDK docs for TypeScript/Python development plus validation of existing Anthropic SDK code.                                                                    |
| [`bybit`](./plugins/bybit)                               | Trade and manage assets on Bybit (spot, derivatives, copy trading, bots, Earn, fiat & on-chain) via the official Bybit MCP server.                                                                                 |
| [`code-review`](./plugins/code-review)                   | Strict evidence-based code review and safe fix workflow for frontend, backend, fullstack, security, database, dependencies, testing, CI/CD, deployment, and verified patching.                                     |
| [`context7`](./plugins/context7)                         | Fetch up-to-date library documentation, API references, and code examples via the Context7 MCP server.                                                                                                             |
| [`expo`](./plugins/expo)                                 | Official Expo skills for building, deploying, upgrading, and debugging Expo and React Native apps.                                                                                                                 |
| [`human-context-writer`](./plugins/human-context-writer) | Make AI agents write human-like context for better understanding and interaction.                                                                                                                                  |
| [`midtrans`](./plugins/midtrans)                         | Midtrans payment gateway integration.                                                                                                                                                                              |
| [`motion`](./plugins/motion)                             | Animation guidance for React and JavaScript using Motion (formerly Framer Motion).                                                                                                                                 |
| [`natroc-awareness`](./plugins/natroc-awareness)         | **Install first.** Loads compact installed Natroc plugin awareness at session start so agents can automatically discover and route tasks to matching plugin skills without dumping every plugin file into context. |
| [`nextjs`](./plugins/nextjs)                             | Next.js best practices, cache components, upgrade guidance, and production patterns for App Router and Server Components.                                                                                          |
| [`ollama-sdk`](./plugins/ollama-sdk)                     | Self-contained Ollama TypeScript/Python client docs for local/cloud model development plus validation of existing Ollama code.                                                                                     |
| [`openai-sdk`](./plugins/openai-sdk)                     | Self-contained OpenAI Client SDK and Agents SDK docs for TypeScript/Python development plus validation of existing SDK code.                                                                                       |
| [`plugin-dev-claude`](./plugins/plugin-dev-claude)       | Toolkit for building Claude Code plugins - skills for agents, commands, hooks, MCP integrations, and plugin structure.                                                                                             |
| [`plugin-dev-codex`](./plugins/plugin-dev-codex)         | Evaluate Codex and Claude skills and plugins locally - analysis reports, score explanations, token budgets, improvement briefs, and benchmarking.                                                                  |
| [`react-typescript`](./plugins/react-typescript)         | Local-first React + TypeScript guidance for components, hooks, refs, events, utility types, and reusable patterns.                                                                                                 |
| [`stitch`](./plugins/stitch)                             | MCP server bridge for Google Stitch - auto-connects 19 Stitch tools via STDIO-to-HTTPS transport for AI agent integration.                                                                                         |
| [`typescript-lsp`](./plugins/typescript-lsp)             | TypeScript/JavaScript language server for enhanced code intelligence.                                                                                                                                              |
| [`xquik`](./plugins/xquik)                               | X data automation guidance for using Xquik docs, SDKs, REST API, MCP, webhooks, and public source examples.                                                                                                        |

## Plugins Installation

### Claude

- Claude Code CLI

  ```
  # Add marketplace
  claude plugin marketplace add NatrocTeam/Natroc-Plugins

  # Install plugin
  claude plugin install natroc-awareness@natroc-plugins
  ```

- Claude Desktop (macOS & Windows)

  ```
  # Repository
  NatrocTeam/Natroc-Plugins
  ```

### Codex

- Codex CLI

  ```
  # Add marketplace
  codex plugin marketplace add NatrocTeam/Natroc-Plugins

  # Install plugin from natroc marketplace
  codex plugin add natroc-awareness@natroc-plugins
  ```

- Codex Desktop (macOS and Windows)

  ```
  # Source
  NatrocTeam/Natroc-Plugins

  # git ref
  main
  ```

## Skills Installation Only

You can install individual skills (without the full plugin) using [`npx skills`](https://github.com/vercel-labs/skills). This is useful for lightweight setups where only specific capabilities are needed.

- View and select skills interactively:

  ```
  npx skills add NatrocTeam/Natroc-Plugins
  ```

- Install a specific plugin's skills directly:

  ```
  npx skills add NatrocTeam/Natroc-Plugins --plugin natroc-awareness
  ```

## Validation

Run the plugin structure verifier to check all plugins:

```bash
pnpm install
pnpm run verify-plugins
```

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history and version details.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution guidelines, validation steps, and version bump instructions.

## License

This repository is licensed under the [MIT License](./LICENSE).
