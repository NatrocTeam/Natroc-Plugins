# TypeScript LSP

`typescript-lsp` packages TypeScript/JavaScript language-server guidance for
Claude Code and Codex.

The plugin has two surfaces:

- Claude Code can load the `lspServers` configuration from
  `.claude-plugin/plugin.json` to launch `typescript-language-server --stdio`.
- Codex uses the bundled `typescript-lsp` skill and local references for
  diagnostics, definitions, references, rename, code actions, refactors, inlay
  hints, and server configuration. Codex does not load `lspServers` directly.

## Supported Extensions

`.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.cts`, `.mjs`, `.cjs`

## Runtime Requirements

Install the TypeScript language server and TypeScript wherever the LSP runtime
will execute:

```bash
npm install -g typescript-language-server typescript
```

Or with yarn:

```bash
yarn global add typescript-language-server typescript
```

The core launch command is:

```bash
typescript-language-server --stdio
```

## What It Includes

- Claude Code LSP server configuration for TypeScript and JavaScript files.
- A Claude Code command reference for `workspace/executeCommand` operations.
- A Codex skill named `typescript-lsp`.
- Local references for installation, LSP features, configuration, and command
  arguments under `skills/typescript-lsp/references/`.

## Install/Use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install typescript-lsp@natroc-plugins
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
  codex plugin add typescript-lsp@natroc-plugins
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

## Plugin Structure

```text
typescript-lsp/
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
├── assets/
├── commands/
└── skills/
    └── typescript-lsp/
        ├── SKILL.md
        └── references/
```

## More Information

- [typescript-language-server on npm](https://www.npmjs.com/package/typescript-language-server)
- [GitHub Repository](https://github.com/typescript-language-server/typescript-language-server)
