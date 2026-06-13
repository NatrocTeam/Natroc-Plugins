# Changelog

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
