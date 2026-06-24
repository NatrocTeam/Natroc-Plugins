# Changelog

## [1.13.0] - 2026-06-25 [(e6addce)](https://github.com/NatrocTeam/Natroc-Plugins/commit/e6addce1b260553cf4f3821a54e51337923554d0)

### Features

- **nextjs**: Add `next-production` skill for production security hardening
  - SKILL.md with 37 production checkpoints covering Server Actions, Route Handlers, Data Access Layer, auth/session, CSP, SSRF, uploads, rate limits, audit logging, and CI/CD
  - 3 references: production-security-checklist (64 items), nextjs-secure-patterns (8 code patterns), review-report-template
  - 4 evaluation test cases in evals/evals.json
  - Add MIT LICENSE file to plugin root

### Changed

- **nextjs**: Update descriptions and keywords - add production, security, hardening - across Claude, Codex, and ZCode manifests
- **nextjs**: Update README with next-production skill table, usage section, and plugin structure tree

## [1.12.0] - 2026-06-23 [(fe9bd55)](https://github.com/NatrocTeam/Natroc-Plugins/commit/fe9bd55a34f7008ee30c991ffe9e12cc8b5d3e56)

### Features

- **packages**: bundle plugins in npm package for npx support
  - Copy `plugins/` during build so plugin data ships with the npm package
  - Add `resolve-plugins.js`: find `plugins/` relative to bundle location (works from anywhere)
  - Update `list`, `zcode add` to use bundled plugins - no `--path` flag needed
  - Prioritize `natroc-awareness` in `zcode install` prompt with "Recommended" label
  - Update README: use `npx` directly, global install no longer recommended

- **supabase**: add initial MCP configuration for Supabase server
  - Add Supabase MCP server integration at version 1.1.0

- **hermes-tweet**: add initial plugin configuration for Hermes Agent X/Twitter
  - New plugin for X/Twitter automation via Hermes Agent (@kriptoburak)

- **husky**: add pre-push hooks for quality gates
  - Run `verify-plugins` and `format:check` automatically on `git push`
  - Use `postinstall` script for cross-package-manager compatibility (npm, pnpm, yarn, bun)

### Fixes

- **natroc-awareness - Stop hook infinite loop** (4 files)
  - Fix guard condition incorrectly gated on `session_id` (always null → never fired)
  - Change fallback marker from per-second timestamp (`date +%s`) to stable daily date (`date +%Y-%m-%d`)
  - Fix cached copies in `~/.claude/plugins/cache/` (not just repo files - the actual running scripts)
  - Fix marketplace copies in `~/.claude/plugins/marketplaces/`
  - Applies to all 4 script variants: Claude/Codex × bash/PowerShell

- **verify-plugins**: add mandatory `.zcode-plugin/plugin.json` validation
  - Zcode manifest is now REQUIRED (was optional)
  - Zcode version must match both Claude and Codex manifest versions
  - Detected 3 version mismatches on first run (all fixed)

- **bump-plugin.js**: now also updates `.zcode-plugin/plugin.json` version
  - `sync-version.js` already handled separately

- **publish workflow**: multiple fixes for GitHub Packages publishing
  - Dynamic package name based on repository owner
  - Enhanced error handling and validation checks
  - CI workflow improvements

## [1.11.0] - 2026-06-22 [(dc10bc4)](https://github.com/NatrocTeam/Natroc-Plugins/commit/dc10bc47af8be257e19ddc91d37e389a6d73b0a0)

### Added

- **github**: New plugin with 4 skills for GitHub MCP integration
  - `github-mcp` skill - server overview, tool naming, routing, and complete ~70-tool catalog
  - `github-commit` skill - single/multi-file commits, branch creation, commit history
  - `github-pr` skill - full PR lifecycle (create, review, merge, Copilot reviews)
  - `github-releases` skill - list releases, get by tag, prepare release notes
  - Claude Code, Codex, and ZCode manifests with full interface branding (`#FFFFFF`)
  - `.mcp.json` HTTP transport to `api.githubcopilot.com/mcp`
  - `.app.json` connector registration for Codex
  - Plugin README with toolset support table, quick start, and skill routing
- **zcode**: Add `.zcode-plugin/plugin.json` manifests for all 21 plugins
- **packages**: New `@natroc/plugins` CLI package
  - `natroc-plugins list` - list all available plugins with versions
  - `natroc-plugins zcode add` - register marketplace + copy plugins to ZCode cache
  - `natroc-plugins zcode install` - interactive checkbox install (Select All, keyboard nav, pagination)
  - Levenshtein-based fuzzy matching with did-you-mean suggestions
  - esbuild build system with ESM output, metafile reporting
  - Colored terminal output (spinner, progress bar, checkmarks)
- **ci**: Add GitHub Actions publish workflow (`publish-packages.yml`)
  - Triggers on release published, reads version from `packages/package.json`
  - Builds with pnpm, publishes to npm with `--provenance`
- **natroc-awareness**: Cross-platform persistent agent memory hooks
  - `memory-read`/`memory-write` scripts (bash + PowerShell) for Claude (`~/.claude/memory/`)
  - `memory-read-codex`/`memory-write-codex` scripts (bash + PowerShell) for Codex (`~/.codex/memory/`)
  - `UserPromptSubmit` hook injects memory context before every user prompt
  - `Stop` hook persists new knowledge when agent finishes
  - `stop_hook_active` loop protection to prevent recursion
  - PowerShell `session-start` and `session-start-codex` hooks
  - Platform-agnostic `run-hook.cmd` polyglot wrapper (PowerShell → Git Bash → exit silently)

### Changed

- **marketplace**: Register github in both `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`
- **marketplace**: Update README plugins table with github entry
- **verifier**: Allow `.ps1` hook command format in addition to existing extensions
- **verifier**: Allow `memory/` subdirectory inside `hooks/` for hook scripts
- **rules**: Update `rules/verify.md` and `CONTRIBUTING.md` for `.ps1` hooks and `memory/` subdirectory

## [1.10.0] - 2026-06-19 [(59fce2a)](https://github.com/NatrocTeam/Natroc-Plugins/commit/59fce2aa85898e751983214ae4d60de714a3eb71)

### Added

- **supabase**: New plugin with 2 skills and 35 Postgres best-practice references
  - `supabase` skill - Database, Auth, Edge Functions, Realtime, Storage, Vectors, CLI/MCP
  - `supabase-postgres-best-practices` skill - 35 references covering schema design, query optimization, indexing, RLS, connection pooling, locking, monitoring, and more
  - Claude Code and Codex plugin manifests with brand color `#3ECF8E`
  - `.app.json` connector app for Codex
- **verifier**: Add SKILL.md body size validation - max 500 lines and ~5000 tokens for content after the frontmatter block
- **verifier**: Add `.app.json` validation - require `apps` field in codex manifest with `"./"` prefix when `.app.json` is present at plugin root
- **verifier**: Add marketplace coverage check - every plugin under `plugins/` must have entries in both `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`
- **verifier**: Add three-way version consistency check - Claude manifest, Codex manifest, and Claude marketplace versions must match
- **verifier**: Add SKILL.md frontmatter description validation - required field, max 1024 characters, must not contain colon characters
- **docs**: Add `rules/verify.md` - complete documentation of all 14 validation categories performed by the verifier
- **docs**: Add `rules/category.md` - 24 allowed plugin categories (domains, not technologies) with usage rules per marketplace file
- **docs**: Add `AUDIT.md` - comprehensive audit of `.github/` directory
- **marketplace**: Register threejs and supabase in both marketplace files
- **docs**: Add threejs and supabase to root README plugin table

### Changed

- **all plugins**: Trim SKILL.md bodies to under 500 lines - move detailed code examples to `examples/` files and reference tables to `references/` files across expo, human-context-writer, midtrans, plugin-dev-claude, and threejs plugins
- **issue-templates**: Merge `plugin_improvement.yml` into `bug_report.yml` as unified form with type dropdown; add threejs and supabase to plugin checkboxes
- **pull-request-template**: Add `pnpm run verify-plugins`, category validation per `rules/category.md`, and marketplace checks to the checklist; add Validation performed section
- **workflows**: Standardize all workflows on `actions/checkout@v6`, add concurrency groups and timeout-minutes to all jobs
- **workflows**: Fix `bump-version.yml` - upgrade to Natroc Bot token for push access, add `workflow_dispatch` trigger, pin Node.js to `22.22.3`
- **workflows**: Add `bump-version.yml` to tracked files
- **marketplace**: Update versions for human-context-writer, midtrans, plugin-dev-claude, and threejs in marketplace entries

### Fixed

- **code-review**: Update descriptions in `evidence-policy` and `security-review` SKILL.md files for clarity (commit `81fbf26`)

## [1.9.0] - 2026-06-19 [(7071472)](https://github.com/NatrocTeam/Natroc-Plugins/commit/707147255e94b48b95b7cc7b1dd1ba589c631007)

### Changed

- **natroc-awareness**: Strengthen automatic plugin discovery and routing
  - Bump version to 2.1.0
  - Expand SKILL.md routing workflow - agents MUST perform capability
    discovery before handling any user request, even without explicit
    plugin mentions
  - Add workflow agents, subagents, commands, connectors to routing scope
  - Streamline hook scripts (`session-start`, `session-start-codex`) -
    reduce verbosity while maintaining routing table accuracy
- **marketplace**: Sync natroc-awareness version to 2.1.0

## [1.8.0] - 2026-06-18 [(684dc3b)](https://github.com/NatrocTeam/Natroc-Plugins/commit/684dc3b57b5d184fa0e9166d2411e3f800151f84)

### Added

- **threejs**: New skill-only plugin for Three.js 3D graphics development
  - 10 bundled skills: fundamentals, geometry, materials, shaders, lighting,
    animation, interaction, loaders, textures, post-processing
  - Claude Code and Codex plugin manifests with brand color `#049EF4`
  - Plugin README with skills table and Agent Usage Contract

### Changed

- **all plugins**: Standardize `openai.yaml` Codex skill metadata across 81 files
  - Fix `display_name` to consistent `<Plugin> - <Skill Name>` format
  - Rewrite `short_description` as concise single phrase
  - Rewrite `default_prompt` as detailed user-facing queries without `$` or `@`
    prefixes, grounded against each skill's SKILL.md domain
  - Sync `brand_color` with the plugin's codex manifest
- **all plugins**: Standardize `.codex-plugin/plugin.json` manifests across 20 files
  - Limit `defaultPrompt` to exactly 3 entries
  - Rewrite all prompts as detailed user-facing queries without `$` or `@`
    prefixes, covering each plugin's primary domains
- **bybit**: Remove `$bybit` prefix from codex defaultPrompt
- **context7**: Improve defaultPrompt detail with specific library/doc examples
- **midtrans**: Remove `@Midtrans` prefix from codex defaultPrompt
- **motion**: Remove `$motion-*` prefix, rewrite prompts as user-facing queries
- **nextjs**: Remove `$nextjs` prefix, add detailed App Router/cache/upgrade prompts
- **react-typescript**: Remove `$react-typescript` prefix, add typed component
  API examples in defaultPrompt
- **typescript-lsp**: Remove `$typescript-lsp` prefix, add diagnostic/rename
  workflow examples
- **xquik**: Remove `Use Xquik` pattern, rewrite as user-facing data
  automation workflow prompts

### Fixed

- **plugin-dev-codex**: Correct `allow_implicit_invocation` from `false` to
  `true` in 3 skill files

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
