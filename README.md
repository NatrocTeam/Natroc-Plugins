<div align="center">

# **Natroc Plugins**

A cross-agent plugin marketplace for Claude Code and Codex - extend your AI agents with new tools, skills, and workflows.

</div>

---

## Available Plugins

| Plugin                                                   | Description                                                                                                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`21st`](./plugins/21st)                                 | Generate modern React UI components and search brand logos via the 21st.dev Magic MCP server.                                                                                  |
| [`bybit`](./plugins/bybit)                               | Trade and manage assets on Bybit (spot, derivatives, copy trading, bots, Earn, fiat & on-chain) via the official Bybit MCP server.                                             |
| [`context7`](./plugins/context7)                         | Fetch up-to-date library documentation, API references, and code examples via the Context7 MCP server.                                                                         |
| [`expo`](./plugins/expo)                                 | Official Expo skills for building, deploying, upgrading, and debugging Expo and React Native apps.                                                                             |
| [`human-context-writer`](./plugins/human-context-writer) | Make AI agents write human-like context for better understanding and interaction.                                                                                              |
| [`natroc-awareness`](./plugins/natroc-awareness)         | Load compact installed Natroc plugin awareness at session start so agents can route tasks to matching plugin skills without dumping every plugin file into context.            |
| [`motion`](./plugins/motion)                             | Animation guidance for React and JavaScript using Motion (formerly Framer Motion).                                                                                             |
| [`plugin-dev-claude`](./plugins/plugin-dev-claude)       | Toolkit for building Claude Code plugins — skills for agents, commands, hooks, MCP integrations, and plugin structure.                                                         |
| [`plugin-dev-codex`](./plugins/plugin-dev-codex)         | Evaluate Codex and Claude skills and plugins locally — analysis reports, score explanations, token budgets, improvement briefs, and benchmarking.                              |
| [`react-typescript`](./plugins/react-typescript)         | Local-first React + TypeScript guidance for components, hooks, refs, events, utility types, and reusable patterns.                                                             |
| [`typescript-lsp`](./plugins/typescript-lsp)             | TypeScript/JavaScript language server for enhanced code intelligence.                                                                                                          |
| [`code-review`](./plugins/code-review)                   | Strict evidence-based code review and safe fix workflow for frontend, backend, fullstack, security, database, dependencies, testing, CI/CD, deployment, and verified patching. |
| [`openai-sdk`](./plugins/openai-sdk)                     | Self-contained OpenAI Client SDK and Agents SDK docs for TypeScript/Python development plus validation of existing SDK code.                                                   |
| [`ollama-sdk`](./plugins/ollama-sdk)                     | Self-contained Ollama TypeScript/Python client docs for local/cloud model development plus validation of existing Ollama code.                                                 |
| [`anthropic-sdk`](./plugins/anthropic-sdk)               | Self-contained Anthropic Client SDK and Claude Agent SDK docs for TypeScript/Python development plus validation of existing Anthropic SDK code.                                |

## Plugins Installation

### Claude Code

- Claude Code CLI

  ```
  # Add marketplace
  claude plugin marketplace add NatrocTeam/Natroc-Plugins

  # Install plugin
  claude plugin install natroc-awareness@natroc-plugins
  ```

- Claude Desktop (MacOS & Windows)

  ```
  # Repository
  NatrocTeam/Natroc-Plugins
  ```

### Codex

- Codex CLI

  ```
  # Add marketplace
  codex plugin marketplace add NatrocTeam/Natroc-Plugins

  #install plugin from natroc marketplace
  codex plugin add natroc-awareness@natroc-plugins
  ```

- Codex Desktop (MacOS and Windows)

  ```
  # Source
  NatrocTeam/Natroc-Plugins

  # git ref
  main
  ```

## Skills Installation Only

For install skill only, use `npx skills`.

For example:

- View all available skills and select skills

  ```
  npx skills add NatrocTeam/Natroc-Plugins
  ```

- Install specific skills
  ```
  npx skills add NatrocTeam/Natroc-Plugins --natroc-awareness
  ```
