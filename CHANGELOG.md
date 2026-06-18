# Changelog

## [1.7.0] - 2026-06-18 [(fdabf14)](https://github.com/NatrocTeam/Natroc-Plugins/commit/fdabf14cdea8be12c882c19e5d083cd81e328cc0)

### Added

- **xquik**: New skill-only plugin for X data automation workflows
  - Bundled `xquik` skill routes agents to public Xquik docs, SDKs (`x-developer`),
    REST API, MCP, webhooks, and public source examples
  - Claude Code and Codex plugin manifests with full interface branding
  - SVG icon with light/dark mode support via `prefers-color-scheme`
  - Codex agent config (`openai.yaml`) with implicit invocation enabled
  - Plugin README with Agent Usage Contract and install instructions
- **marketplace**: Register xquik in `.claude-plugin/marketplace.json` and
  `.agents/plugins/marketplace.json`
- **docs**: Add xquik to root README plugins table

## [1.6.1] - 2026-06-18 [(4aa6d44)](https://github.com/NatrocTeam/Natroc-Plugins/commit/4aa6d44b9dd62e3df9a8986a9021c6b4a3932c6a)

### Fixed

- **natroc-awareness**: Fix hook scripts not executable - `run-hook.cmd`, `session-start`, and
  `session-start-codex` were missing the executable bit (`100644` instead of `100755`), causing
  SessionStart hook to fail with `Permission denied` when invoked directly as a command by
  Claude Code. Execute permission is now tracked in git so fresh clones preserve it.

## [1.6.0] - 2026-06-18 [(594f821)](https://github.com/NatrocTeam/Natroc-Plugins/commit/594f8219ac3a78c177a63eceef5571e6c7df379b)

### Added

- **natroc-awareness**: Pure bash SessionStart hooks (zero Python dependency)
  - Separate hook configs for Claude Code (`hooks.json`) and Codex (`hooks-codex.json`)
  - Cross-platform polyglot wrapper (`run-hook.cmd`) for Windows compatibility
  - Full SKILL.md injection at session start following the superpowers pattern
  - Dynamic routing table built from marketplace.json plus filesystem scan
  - Bash hook scripts (`session-start`, `session-start-codex`) with graceful fallback

### Changed

- **natroc-awareness**: Strengthen SKILL.md enforcement language with `<EXTREMELY-IMPORTANT>`
  block, Routing Red Flags table, and imperative routing priorities
- **natroc-awareness**: Remove hardcoded plugin list from SKILL.md - routing table is now
  the single source of truth
- **natroc-awareness**: Bump version to 1.1.0
- **midtrans**: Rewrite Codex defaultPrompt for payment gateway context (Snap transaction,
  payment status, refund processing)
- **verifier**: Allow `.cmd` and extensionless bash hook command files
- **verifier**: Handle `hooks-codex.json` alongside `hooks.json`
- **docs**: AGENTS.md - fix repo structure diagram, remove phantom CODEOWNERS, add
  `rules/` and `scripts/`, remove unsupported plugin root folders, document hook command
  formats and bump scripts
- **docs**: README.md - add Contributing, License, Changelog, and Validation sections,
  mark natroc-awareness as recommended first install
- **docs**: CONTRIBUTING.md - document `hooks-codex.json`, hook formats, and pnpm prerequisite
- **docs**: rules/verify.md - fix phrasing, document `hooks-codex.json`, replace ambiguous
  `...` with explicit allowed skill folders
- **issue-templates**: Add midtrans, nextjs, stitch to plugin checklists

### Removed

- **natroc-awareness**: 335-line Python hook script (`session_start_context.py`)

### Fixed

- **marketplace**: Sync natroc-awareness version 1.0.0 → 1.1.0
- **marketplace**: Sync typescript-lsp version 1.0.0 → 5.3.0
- **midtrans**: Fix copy-pasted defaultPrompt from human-context-writer

## [1.5.0] - 2026-06-17 [(fd77fe6)](https://github.com/NatrocTeam/Natroc-Plugins/commit/fd77fe6095dcb97cd82503344635363fa837dd54)

### Added

Midtrans plugin and plugin assets

- Add new Midtrans payment gateway plugin with skills for Node.js, PHP, and Python clients
- Include Midtrans API references, gotchas, and endpoint documentation
- Add branded assets (PNG/SVG logos) for 10+ plugins
- Update agent configurations (openai.yaml) for skills across plugins
- Sync marketplace metadata with new plugin additions

## [1.4.0] - 2026-06-17 [(8505dc0)](https://github.com/NatrocTeam/Natroc-Plugins/commit/8505dc0888e9be11d38db8457844a34a1bf65399)

### Added

- **nextjs**: New `next-docs` skill - curated index of official Next.js 16.2.9 documentation across 6 reference categories (Getting Started, Guides, API Reference, Glossary, Architecture, Community)
- **nextjs**: 5 new reference files under `skills/next-docs/references/` - API-Reference.md, Glossary.md, Guides.md, Getting-Started.md, Architecture.md, Community.md

### Changed

- **nextjs**: Expand `next-best-practices` file-conventions.md, functions.md, directives, error-handling, metadata, self-hosting, and debug-tricks references
- **nextjs**: Minor improvements to `next-cache-components` and `next-upgrade` skill descriptions
- **nextjs**: Update README to reflect 4-skill structure, add `next-docs` to skills table, usage section, and plugin tree
- **nextjs**: Replace `nextjs.svg` with `nextjs.png` asset
- **marketplace**: Update main README Available Plugins table - add bybit, nextjs, and stitch plugins
- **marketplace**: Update `.claude-plugin/marketplace.json` description and both plugin manifests

## [1.3.0] - 2026-06-15 [(193ada7)](https://github.com/NatrocTeam/Natroc-Plugins/commit/193ada77811601707ed657d660279611adcf4fb9)

### Features

- add stitch plugin with MCP server bridge for Google Stitch

Create the stitch plugin bundling @natroc/stitch-mcp as an auto-starting STDIO MCP server, enabling AI agents to interact with the Google Stitch design platform.

Includes:

- .mcp.json - auto-starts npx @natroc/stitch-mcp with env var expansion
- .claude-plugin/plugin.json - Claude Code manifest with mcpServers ref
- .codex-plugin/plugin.json - Codex manifest with interface branding
- README.md - plugin docs covering setup, env vars, MCP config
- skills/stitch-mcp/SKILL.md - full skill with 19 tools reference, 5 workflow patterns, security notes, and troubleshooting

## [1.2.0] - 2026-06-14 [(f73b9e1)](https://github.com/NatrocTeam/Natroc-Plugins/commit/f73b9e1dc96b9675852124c6f4aa69ce88e80d61)

### Added

- **nextjs**: New plugin with 3 skills for Next.js development
  - `next-best-practices` - 19 reference files covering App Router, RSC boundaries, data patterns, error handling, image/font optimization, bundling, parallel routes, self-hosting, and debug tricks
  - `next-cache-components` - Next.js 16 Cache Components (PPR, `use cache`, `cacheLife`, `cacheTag`, `updateTag`, migration from `unstable_cache`)
  - `next-upgrade` - Structured migration workflow with codemods and version-specific guides (v14 → v15 → v16)
- **marketplace**: Register nextjs plugin in `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`

## [1.1.0] - 2026-06-13 [(ff88cd2)](https://github.com/NatrocTeam/Natroc-Plugins/commit/ff88cd208654431f4229c8ac82022bb293c0ff9c)

### Changed

- **code-review**: Remove hooks system entirely - all 6 lifecycle hooks deleted
- **code-review**: Clean up .codex-plugin/plugin.json hooks reference
- **code-review**: Update README - remove hooks mentions, add License section referencing Apache 2.0

### Removed

- **code-review**: 820 lines of hook code (hooks.json, \_common.py, and 6 hook scripts)

## [1.0.2] - 2026-06-13 [(50429ce)](https://github.com/NatrocTeam/Natroc-Plugins/commit/50429ce9e665cc69c8ee47b7cd92acf4eefe5148)

### Fixed

Replace python with python3 in all hook commands

## [1.0.1] - 2026-06-13 [(88bb15f)](https://github.com/NatrocTeam/Natroc-Plugins/commit/88bb15f6a6a03cf6560ea0ae044270b7849b5111)

### Fixed

SessionStart hook to fire on every session start:

- Remove matcher filter on SessionStart hook so it runs on every session start, not only on /clear or /compact
- Change interpreter from python to python3 for compatibility
- Add hooks field to .claude-plugin/plugin.json for explicit hook registration in Claude Code

## [1.0.0] - 2026-06-05 [(056d369)](https://github.com/NatrocTeam/Natroc-Plugins/commit/056d369d34005ebb199aefdef18da01cdad457fe)

### initial plugins scaffolding for Natroc-Plugins

Initialize repository with core plugin marketplace structure, tooling, and documentation to support plugin development, validation, and publishing workflows.
