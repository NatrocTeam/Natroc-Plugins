# AGENTS.md

This file provides repository guidance for AI coding assistants and automated development agents working on **Natroc-Plugins**.

These instructions are intentionally model-agnostic. They apply to any AI assistant, coding agent, editor integration, CLI agent, or automation tool used to inspect, modify, or submit changes to this repository.

## Repository purpose

Natroc-Plugins is a plugin marketplace repository for AI coding agents.

It contains:

- Marketplace metadata
- Plugin definitions
- Skills
- Hooks
- Agent configuration files
- Validation rules and scripts
- Documentation
- GitHub community and workflow files

The goal of this repository is to provide clear, maintainable, and reusable plugin packages that help AI agents work more accurately with specific tools, SDKs, frameworks, workflows, and review processes.

## Read this before editing

Before making changes, read the relevant files in this order:

1. `README.md`
2. `CONTRIBUTING.md`
3. `rules/category.md`
4. `rules/verify.md`
5. `.claude-plugin/marketplace.json`
6. `.agents/plugins/marketplace.json`
7. The affected plugin README:
   - `plugins/<plugin-name>/README.md`
8. The affected plugin metadata:
   - `plugins/<plugin-name>/.claude-plugin/plugin.json`
   - `plugins/<plugin-name>/.codex-plugin/plugin.json`
9. Any affected plugin folders:
   - `skills/`
   - `hooks/`
   - `agents/`
   - `commands/`
   - `assets/`

Do not edit files before understanding the plugin structure and the affected metadata.

## Repository structure

````txt
.claude-plugin/
  marketplace.json

.agents/
  plugins/
    marketplace.json

plugins/
  <plugin-name>/
    README.md
    .claude-plugin/
      plugin.json
    .codex-plugin/
      plugin.json
    agents/
    assets/
    commands/
    hooks/
    skills/

.github/
  ISSUE_TEMPLATE/
  workflows/
  pull_request_template.md

rules/
  verify.md
  category.md

scripts/
  verify-plugins.js
  bump-plugin.js
  sync-version.js

packages/
  README.md
  package.json
  build.js
  src/
  dist/

Not every plugin is required to contain every optional folder. Only add folders and files that are useful for the plugin.

## General rules for AI assistants

These rules are **mandatory**. Violating any of them will cause the change to be rejected.

1. **MUST** make small, focused changes. Do not rewrite large files unless explicitly necessary.
2. **MUST** preserve the existing repository style, naming conventions, and folder layout.
3. **MUST** use clear, deterministic instructions. Do not write vague or ambiguous guidance.
4. **MUST NOT** add model-specific behavior unless the file is explicitly platform-specific.
5. **MUST NOT** invent plugin capabilities, endpoints, parameters, response fields, or pricing.
6. **MUST NOT** add unsupported metadata fields. Only use fields documented in existing manifests.
7. **MUST NOT** remove existing functionality unless explicitly requested by the user.
8. **MUST NOT** change release versions unless the task is specifically about versioning.
9. **MUST NOT** change marketplace metadata without verifying the matching plugin metadata.
10. **MUST NOT** commit generated files, build artifacts, caches, lockfiles, or local environment files.
11. **MUST NOT** commit secrets, tokens, private keys, passwords, or credentials.
12. **MUST NOT** make claims in documentation that are not verifiable against plugin files or official references.
13. **MUST** run `pnpm run verify-plugins` after any structural change to plugins, skills, hooks, or manifests.
14. **MUST** run `pnpm run format:check` before finalizing changes. Fix formatting failures with `pnpm run format`.

## Model-agnostic writing rule

This repository is used by many different AI agents, tools, models, editors, CLIs, and runtimes.

When writing documentation, skills, hooks, or agent instructions, you **MUST**:

- Use generic terms: `AI assistant`, `agent`, `coding agent`, or `runtime`.
- **MUST NOT** name a specific model unless the file is explicitly platform-specific.
- **MUST NOT** assume a single vendor, editor, or runtime.
- Keep instructions portable across compatible AI coding tools.

**Acceptable:**

```md
The agent should inspect the relevant files before proposing changes.
````

**Rejected:**

```md
Claude should inspect the relevant files before proposing changes.
```

**Acceptable** when editing a platform-specific manifest:

```md
This plugin supports Claude Code CLI.
```

## Plugin metadata rules

You **MUST** keep these files consistent when editing any plugin metadata:

```txt
.claude-plugin/marketplace.json
.agents/plugins/marketplace.json
plugins/<plugin-name>/.claude-plugin/plugin.json
plugins/<plugin-name>/.codex-plugin/plugin.json
plugins/<plugin-name>/README.md
```

You **MUST** verify these fields match across all affected files:

- Plugin name
- Display name
- Description
- Version
- Author
- Repository URL
- Plugin path
- Supported platforms
- Skill paths
- Hook paths
- Agent configuration paths
- Command paths
- Asset paths

Repository URLs for plugin folders **MUST** point to valid GitHub tree paths:

```txt
https://github.com/NatrocTeam/Natroc-Plugins/tree/main/plugins/<plugin-name>
```

**MUST NOT** use invalid folder URLs:

```txt
https://github.com/NatrocTeam/Natroc-Plugins/plugins/<plugin-name>
```

## Category rules

Every plugin in the marketplace **MUST** have a `category`. The allowed list is defined in `rules/category.md`. **Any category outside this list will be rejected.**

Categories describe **what domain the plugin serves**, not what technology it uses:

- A Next.js plugin **MUST** use `development`, **NOT** `nextjs`.
- A Midtrans plugin **MUST** use `finance`, **NOT** `payments` or `midtrans`.
- A Docker plugin **MUST** use `devops`, **NOT** `containerization`.

Framework, language, library, and tool names are `keywords` - they **MUST NOT** be used as categories.

**Mandatory rules:**

1. **MUST** pick from the allowed list in `rules/category.md` only.
2. **MUST** use lowercase kebab-case in `.claude-plugin/marketplace.json`.
3. **MUST** use Title Case in `.agents/plugins/marketplace.json` and `.codex-plugin/plugin.json` (`interface.category`).
4. **MUST NOT** add a new category without updating `rules/category.md` and the verifier together.
5. **MUST** use `development` / `Development` when no other category fits.

The verifier enforces this automatically. Changes with invalid categories will fail CI.

## Plugin folder rules

A plugin folder may include:

```txt
README.md
.claude-plugin/plugin.json
.codex-plugin/plugin.json
skills/
hooks/
agents/
commands/
assets/
```

Use these folders only when needed. See `rules/verify.md` for the complete list of allowed plugin root directories and files.

### `skills/`

Use `skills/` for focused capability instructions.

A skill should:

- Have a clear purpose.
- Be scoped to a specific capability.
- Prefer official documentation or trusted references.
- Tell the agent when to use the skill.
- Tell the agent what to inspect before acting.
- Avoid broad, generic, or duplicated instructions.

### `hooks/`

Use `hooks/` for lifecycle behavior or deterministic workflow guidance.

Hook configuration uses JSON files:

- `hooks.json` - Claude Code hook configuration.
- `hooks-codex.json` - Codex hook configuration.

Hook command files may use these formats:

- `.py` - Python hook commands.
- `.ps1` - PowerShell hook commands (cross-platform, native on Windows).
- Extensionless - Bash hook scripts (e.g. `session-start`).
- `.cmd` - Cross-platform polyglot wrappers (e.g. `run-hook.cmd`).

Hook directories may include a `memory/` subdirectory for platform-specific memory scripts.

A hook should:

- Have a clear trigger point.
- Be predictable.
- Avoid unsafe side effects.
- Avoid making irreversible changes without user intent.
- Prefer validation, inspection, or guidance over hidden behavior.

### `agents/`

Use `agents/` for reusable role or workflow configuration.

Agent configuration should:

- Be clear and portable.
- Avoid hardcoding a specific AI model unless required by the platform.
- Define responsibilities, boundaries, and expected behavior.
- Avoid claiming capabilities that are not supported by the plugin.

### `commands/`

Use `commands/` for Claude Code slash commands in Markdown format.

Commands should:

- Have a clear, discoverable name.
- Be scoped to a specific action.
- Include usage instructions and examples where helpful.

### `assets/`

Use `assets/` for plugin images and screenshots (Codex).

Assets should:

- Use supported image formats: jpeg, jpg, png, svg.
- Place screenshots in an optional `screenshots/` subdirectory.

## Documentation rules

When editing documentation, you **MUST**:

1. Keep instructions concise and actionable.
2. Use exact file paths - never approximate paths.
3. Use valid commands that actually exist in `package.json` scripts.
4. Keep installation instructions consistent across plugin READMEs.
5. Update documentation when behavior or metadata changes.
6. **MUST NOT** document features that are not implemented.
7. **MUST NOT** remove warnings or limitations unless the limitation has been fixed.
8. **MUST** include examples that users can copy and run directly.

## Marketplace rules

When editing marketplace metadata, you **MUST**:

1. Check both `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`.
2. Verify the matching plugin metadata in both `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`.
3. Verify the plugin README matches the marketplace entry.
4. Verify all repository URLs point to valid GitHub tree paths.
5. Verify all plugin paths resolve to existing directories.
6. Verify the `category` field is in the allowed list (see `rules/category.md`).
7. Keep descriptions consistent but not unnecessarily duplicated.
8. **MUST NOT** add a plugin to the marketplace unless its folder and metadata exist.
9. **MUST NOT** remove a plugin from the marketplace unless explicitly requested.

## Versioning rules

**MUST NOT** change versions unless the task is specifically about versioning, release preparation, or marketplace synchronization.

**MUST** use the bump scripts - **MUST NOT** edit version fields by hand unless the bump script cannot run:

```bash
pnpm run bump          # interactive mode
pnpm run bump:patch
pnpm run bump:minor
pnpm run bump:major
```

The bump scripts update:

- `.claude-plugin/marketplace.json`
- `plugins/<plugin-name>/.claude-plugin/plugin.json`
- `plugins/<plugin-name>/.codex-plugin/plugin.json`

When a version change is requested, also verify:

- Changelog is updated (`CHANGELOG.md`)
- Release notes or tags are prepared if applicable
- Sync scripts and workflows are consistent

**MUST NOT** create a release commit unless explicitly requested.

## Validation rules

**MUST** run these checks before finalizing any change:

```bash
pnpm run verify-plugins
pnpm run format:check
```

If formatting fails, **MUST** run:

```bash
pnpm run format
```

**MUST** run `pnpm run verify-plugins` after any structural change to plugins, hooks, skills, or manifests. **MUST NOT** skip validation. **MUST NOT** claim validation was performed unless it was actually run and passed.

## Pull request rules

Every pull request **MUST** include:

- A clear summary
- A focused set of changes
- A list of affected plugins
- Notes about metadata changes
- Notes about documentation changes
- Validation performed (with exact command output)
- Any known limitations

Before opening or updating a pull request, all of these **MUST** be true:

- [ ] Affected plugin files were reviewed.
- [ ] Affected `plugin.json` files were reviewed.
- [ ] Affected `marketplace.json` files were reviewed.
- [ ] README links and installation instructions were verified.
- [ ] File paths and repository URLs are valid.
- [ ] `pnpm run verify-plugins` was run and passed.
- [ ] `pnpm run format:check` was run and passed (or `pnpm run format` was applied).
- [ ] Documentation was updated if behavior or metadata changed.
- [ ] Category is valid per `rules/category.md` (if marketplace entry was added or changed).

## Commit message guidance

Use clear and simple commit messages.

Examples:

```txt
feat: add new plugin
feat: add code review skill
fix: correct plugin repository URL
fix: update invalid marketplace path
docs: update install instructions
docs: add contributing guide
chore: add GitHub issue templates
chore: sync marketplace version
refactor: simplify plugin metadata
```

Use `feat:` for new capabilities.

Use `fix:` for bug fixes or incorrect metadata.

Use `docs:` for documentation-only changes.

Use `chore:` for repository maintenance.

Use `refactor:` for internal restructuring without behavior changes.

## Safety and security rules

Never commit:

- API keys
- Access tokens
- Private keys
- Passwords
- Session cookies
- `.env` files
- Local machine paths containing sensitive information
- Personal data unrelated to the repository

If a security issue is found, do not open a public issue containing exploit details or secrets.

Use GitHub Security Advisories:

```txt
https://github.com/NatrocTeam/Natroc-Plugins/security/advisories/new
```

## When uncertain

If the correct change is unclear, you **MUST**:

1. Inspect the relevant files first - never guess.
2. Make the smallest safe change that addresses the problem.
3. Preserve existing behavior unless explicitly asked to change it.
4. Leave a note explaining the uncertainty and what was decided.
5. **MUST NOT** invent missing standards, fields, endpoints, capabilities, or conventions.

The priority is correctness, maintainability, and clear repository behavior. When in doubt, ask before acting.
