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
- References
- Templates
- Scripts
- Schemas
- Documentation
- GitHub community and workflow files

The goal of this repository is to provide clear, maintainable, and reusable plugin packages that help AI agents work more accurately with specific tools, SDKs, frameworks, workflows, and review processes.

## Read this before editing

Before making changes, read the relevant files in this order:

1. `README.md`
2. `CONTRIBUTING.md`
3. `.claude-plugin/marketplace.json`
4. `.agents/plugins/marketplace.json`
5. The affected plugin README:
   - `plugins/<plugin-name>/README.md`
6. The affected plugin metadata:
   - `plugins/<plugin-name>/.claude-plugin/plugin.json`
   - `plugins/<plugin-name>/.codex-plugin/plugin.json`
7. Any affected plugin folders:
   - `skills/`
   - `hooks/`
   - `agents/`
   - `references/`
   - `templates/`
   - `schemas/`
   - `scripts/`

Do not edit files before understanding the plugin structure and the affected metadata.

## Repository structure

```txt
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
    hooks/
    references/
    schemas/
    scripts/
    skills/
    templates/

.github/
  ISSUE_TEMPLATE/
  workflows/
  CODEOWNERS
  pull_request_template.md
```

Not every plugin is required to contain every optional folder. Only add folders and files that are useful for the plugin.

## General rules for AI assistants

When working in this repository:

1. Make small, focused changes.
2. Do not rewrite large files unless necessary.
3. Preserve the existing repository style and naming conventions.
4. Prefer clear, deterministic instructions over vague guidance.
5. Do not add model-specific behavior unless a platform-specific file requires it.
6. Do not invent plugin capabilities.
7. Do not invent unsupported metadata fields.
8. Do not remove existing functionality unless explicitly requested.
9. Do not update release versions unless the task is specifically about a release.
10. Do not change marketplace metadata without checking the matching plugin metadata.
11. Do not add generated files, build artifacts, caches, or local environment files.
12. Do not include secrets, tokens, private keys, or credentials.
13. Do not make claims in documentation that are not supported by the plugin files or official references.

## Model-agnostic writing rule

This repository may be used by many different AI agents, tools, models, editors, CLIs, and runtimes.

When writing documentation, skills, hooks, or agent instructions:

- Use generic terms like `AI assistant`, `agent`, `coding agent`, or `runtime`.
- Avoid naming a specific model unless the file is explicitly for a specific platform.
- Avoid assuming a single vendor, editor, or runtime.
- Keep instructions portable across compatible AI coding tools.

Acceptable:

```md
The agent should inspect the relevant files before proposing changes.
```

Avoid:

```md
Claude should inspect the relevant files before proposing changes.
```

Acceptable when editing a platform-specific manifest:

```md
This plugin supports Claude Code CLI.
```

## Plugin metadata rules

When editing plugin metadata, keep these files consistent:

```txt
.claude-plugin/marketplace.json
.agents/plugins/marketplace.json
plugins/<plugin-name>/.claude-plugin/plugin.json
plugins/<plugin-name>/.codex-plugin/plugin.json
plugins/<plugin-name>/README.md
```

Check these fields carefully:

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
- Reference paths
- Template paths
- Script paths
- Schema paths

Repository URLs for plugin folders should point to valid GitHub tree paths:

```txt
https://github.com/NatrocTeam/Natroc-Plugins/tree/main/plugins/<plugin-name>
```

Do not use invalid folder URLs such as:

```txt
https://github.com/NatrocTeam/Natroc-Plugins/plugins/<plugin-name>
```

## Plugin folder rules

A plugin folder may include:

```txt
README.md
.claude-plugin/plugin.json
.codex-plugin/plugin.json
skills/
hooks/
agents/
references/
templates/
schemas/
scripts/
```

Use these folders only when needed.

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

### `references/`

Use `references/` for source material, official docs excerpts, summaries, or structured reference notes.

References should:

- Prefer official documentation.
- Include enough context for future maintainers.
- Avoid stale or unsupported claims.
- Be updated when upstream behavior changes.

### `templates/`

Use `templates/` for reusable issue, prompt, code, config, or workflow templates.

Templates should:

- Be easy to copy.
- Use placeholders clearly.
- Avoid environment-specific assumptions unless documented.

### `schemas/`

Use `schemas/` for JSON Schema or other validation schemas.

Schemas should:

- Match the actual files they validate.
- Be strict enough to catch mistakes.
- Avoid unsupported fields.

### `scripts/`

Use `scripts/` for deterministic automation.

Scripts should:

- Be safe to run locally.
- Avoid destructive behavior by default.
- Include clear error messages.
- Avoid network access unless necessary and documented.
- Avoid writing outside the repository unless explicitly intended.

## Documentation rules

When editing documentation:

1. Keep instructions concise and actionable.
2. Use exact file paths.
3. Use valid commands.
4. Keep installation instructions consistent across plugin READMEs.
5. Update documentation when behavior or metadata changes.
6. Do not document features that are not implemented.
7. Do not remove warnings or limitations unless the limitation has been fixed.
8. Prefer examples that users can copy and run.

## Marketplace rules

When editing marketplace metadata:

1. Check both marketplace files.
2. Check the matching plugin metadata.
3. Check the plugin README.
4. Check all repository URLs.
5. Check all plugin paths.
6. Keep descriptions consistent but not unnecessarily duplicated.
7. Do not add a plugin to the marketplace unless its folder and metadata exist.
8. Do not remove a plugin from the marketplace unless explicitly requested.

## Versioning rules

Do not change versions unless the task is specifically about versioning, release preparation, or marketplace synchronization.

If a version change is requested, check:

- Root package metadata
- Marketplace metadata
- Plugin metadata
- Changelog or release notes, if applicable
- Existing version sync scripts or workflows

Do not create a release commit unless explicitly requested.

## Validation rules

Before finalizing changes, inspect available scripts in `package.json`.

Common checks may include:

```bash
pnpm run format:check
pnpm run format
```

Only run scripts that exist in `package.json`.

If a requested validation script does not exist, do not claim it was run.

## Pull request rules

A good pull request should include:

- A clear summary
- A focused set of changes
- A list of affected plugins
- Notes about metadata changes
- Notes about documentation changes
- Validation performed
- Any known limitations

Before opening or updating a pull request, check:

- [ ] Affected plugin files were reviewed.
- [ ] Affected `plugin.json` files were reviewed.
- [ ] Affected `marketplace.json` files were reviewed.
- [ ] README links and installation instructions were checked.
- [ ] File paths and repository URLs are valid.
- [ ] Formatting was checked when possible.
- [ ] Documentation was updated if behavior changed.

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

If the correct change is unclear:

1. Inspect the relevant files first.
2. Prefer the smallest safe change.
3. Preserve existing behavior.
4. Leave a note explaining the uncertainty.
5. Do not invent missing standards, fields, or capabilities.

The priority is correctness, maintainability, and clear repository behavior.
