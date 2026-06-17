# Contributing to Natroc Plugins

Thank you for contributing to Natroc Plugins. This repository is a cross-agent plugin marketplace, so changes should stay focused, portable, and easy to validate.

## Before You Start

Read these files before editing plugin content:

1. `README.md`
2. `rules/verify.md`
3. `.claude-plugin/marketplace.json`
4. `.agents/plugins/marketplace.json`
5. The affected plugin `README.md`
6. The affected `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`

Keep changes small. Do not update plugin versions, marketplace metadata, or release files unless the contribution is specifically about those files.

## Repository Layout

Plugins live under `plugins/<plugin-name>/`. Each plugin must include:

- `README.md`
- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `skills/` with at least one skill folder

Optional plugin folders and files are documented in `rules/verify.md`. Do not add new root folders or file formats unless `rules/verify.md` and the verifier are updated together.

## Plugin Rules

Follow the current structure in `rules/verify.md`:

- `skills/<skill-name>/SKILL.md` is required for every skill.
- The `name` field in `SKILL.md` frontmatter must match `<skill-name>`.
- Root `agents/` is for subagents. Claude agents use Markdown with frontmatter. Codex agents use TOML.
- `skills/<skill-name>/agents/openai.yaml` is optional Codex skill metadata, not a subagent.
- `commands/` is for Claude commands and must contain Markdown files.
- Root `assets/` is for Codex assets and must use `jpeg`, `jpg`, `png`, or `svg`.
- `hooks.json` and `hooks-codex.json` may be in the plugin root or in `hooks/`, but not both.
- Hook command files may use `.py` (Python), `.cmd` (cross-platform wrapper), or no extension (bash script).
- Claude and Codex plugin manifest versions must match.

Do not commit generated files or runtime caches such as `__pycache__/`, `.env`, build output, or local lockfiles not used by this repository.

## Metadata

When editing metadata, keep these files consistent:

- `.claude-plugin/marketplace.json`
- `.agents/plugins/marketplace.json`
- `plugins/<plugin-name>/README.md`
- `plugins/<plugin-name>/.claude-plugin/plugin.json`
- `plugins/<plugin-name>/.codex-plugin/plugin.json`

Check plugin names, display names, descriptions, versions, authors, repository URLs, plugin paths, supported platforms, and component paths.

Repository URLs for local plugins should point to valid GitHub tree paths:

```txt
https://github.com/NatrocTeam/Natroc-Plugins/tree/main/plugins/<plugin-name>
```

## Version Bumps

Use the bump scripts when changing plugin versions. Do not edit version fields by hand unless the bump script cannot run.

Interactive mode:

```bash
pnpm run bump
```

Direct bump shortcuts:

```bash
pnpm run bump:patch
pnpm run bump:minor
pnpm run bump:major
```

The bump script updates the selected plugin version in:

- `.claude-plugin/marketplace.json`
- `plugins/<plugin-name>/.claude-plugin/plugin.json`
- `plugins/<plugin-name>/.codex-plugin/plugin.json`

## Writing Guidelines

Write for compatible AI assistants and coding agents unless a file is explicitly platform-specific.

- Prefer clear, deterministic instructions.
- Avoid unsupported claims or invented capabilities.
- Prefer official documentation or trusted references.
- Use generic terms such as `AI assistant`, `agent`, or `coding agent` where possible.
- Keep examples copyable and paths exact.

## Validation

You need [pnpm](https://pnpm.io/installation) installed. Install dependencies when needed:

```bash
pnpm install
```

Run plugin verification:

```bash
pnpm run verify-plugins
```

Run formatting checks:

```bash
pnpm run format:check
```

If formatting fails, run:

```bash
pnpm run format
```

Only claim validation that you actually ran.

## Pull Requests

A good pull request includes:

- A clear summary
- A focused set of changes
- A list of affected plugins
- Notes about metadata changes
- Notes about documentation changes
- Validation performed
- Known limitations, if any

Before opening a pull request, confirm:

- Affected plugin files were reviewed.
- Affected manifests were reviewed.
- Marketplace metadata was reviewed when relevant.
- README links and installation instructions were checked.
- `pnpm run verify-plugins` was run.
- Formatting was checked.

## Commit Messages

Use clear and simple commit messages:

```txt
feat: add new plugin
feat: add code review skill
fix: correct plugin repository URL
docs: update install instructions
chore: sync marketplace version
refactor: simplify plugin metadata
```

Use `feat:` for new capabilities, `fix:` for bug fixes, `docs:` for documentation changes, `chore:` for maintenance, and `refactor:` for internal restructuring without behavior changes.

## Security

Never commit secrets, tokens, private keys, passwords, session cookies, `.env` files, or unrelated personal data.

Do not report security vulnerabilities in public issues. Use GitHub Security Advisories:

```txt
https://github.com/NatrocTeam/Natroc-Plugins/security/advisories/new
```
