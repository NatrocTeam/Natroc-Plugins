# Changelog

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
