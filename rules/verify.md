# Verify Plugins

`scripts/verify-plugins.js` validates all plugins under `plugins/` plus the
marketplace metadata files. Run with:

```bash
pnpm run verify-plugins
```

---

## Plugin Structure

```text
<plugin-name>/
├── .app.json                                   # Optional: connector app for Codex Only
├── .claude-plugin/
│   └── plugin.json                             # Claude Plugin Manifest (required)
├── .codex-plugin/
│   └── plugin.json                             # Codex Plugin Manifest (required)
├── .gitignore                                  # Optional for Both Agents
├── .mcp.json                                   # Optional for Both Agents
├── LICENSE                                     # Optional for Both Agents
├── README.md                                   # Required, must be human readable and non-empty
├── agents/                                     # Optional: Subagents
│   ├── code-reviewer.md                        # Claude agent: Markdown with YAML frontmatter
│   └── code-reviewer.toml                      # Codex agent: TOML format
├── assets/                                     # Optional: For Codex Only
│   ├── logo.svg                                # Must be jpeg, jpg, png, or svg
│   └── screenshots/                            # Optional: screenshots subdirectory
│       ├── fix-flow.svg
│       ├── review-report.svg
│       └── security-gate.svg
├── commands/                                   # Optional: Claude Only, Markdown files
├── hooks/                                      # Optional: lifecycle for Both Agents
│   ├── hooks.json                              # Claude hook configuration
│   ├── hooks-codex.json                        # Optional: Codex variant
│   ├── user_prompt_submit_intent_gate.py       # Optional: Python hook command
│   ├── session-start                           # Optional: bash hook command (no extension)
│   └── run-hook.cmd                            # Optional: cross-platform polyglot wrapper
└── skills/                                     # Required: at least one skill folder
    ├── assets/                                 # Optional: shared skill-level assets (ignored by verifier)
    └── <skill-name>/
        ├── SKILL.md                            # Required: frontmatter name must match folder name
        ├── agents/                             # Optional: Skill metadata for Codex Only
        │   └── openai.yaml                     # Exactly one YAML file, must be named openai.yaml
        ├── assets/                             # Optional: skill-level assets
        ├── references/                         # Optional: extracted reference content
        ├── examples/                           # Optional: extracted code examples
        ├── scripts/                            # Optional: utility scripts
        └── templates/                          # Optional: templates
```

> **Notes:**
>
> - Directories under `skills/` that are not skill folders (e.g. `assets/`) are ignored by the verifier.
> - `hooks.json` and `hooks-codex.json` may be in the plugin root OR inside `hooks/`, but NOT both.
> - Hook command files must use `.py`, `.cmd`, or no extension (bash script).

---

## Validations Performed

### Plugin Root

| Check               | Rule                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Directory structure | Only allowed folders: `.claude-plugin`, `.codex-plugin`, `agents`, `assets`, `commands`, `hooks`, `skills` |
| Root files          | Only allowed: `.app.json`, `.gitignore`, `.mcp.json`, `LICENSE`, `README.md`, `hooks.json`                 |
| README.md           | Required, must be non-empty                                                                                |

### Manifests

| Check               | Rule                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Manifest folder     | May only contain `plugin.json`                                                             |
| Manifest `name`     | Must match plugin folder name                                                              |
| Manifest `version`  | Must be a non-empty string                                                                 |
| Version consistency | Claude manifest version must equal Codex manifest version                                  |
| Marketplace version | Claude manifest version must match `.claude-plugin/marketplace.json` entry for that plugin |

### Categories

| Check                               | Rule                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------- |
| Claude marketplace `category`       | Must be in allowed list (`rules/category.md`), lowercase kebab-case        |
| Codex marketplace `category`        | Must be in allowed list (`rules/category.md`), Title Case                  |
| Codex manifest `interface.category` | Must be in allowed list (`rules/category.md`), Title Case                  |
| Marketplace coverage                | Every plugin under `plugins/` must have an entry in both marketplace files |
| Marketplace `plugins` array         | Both marketplace files must contain a valid `plugins` array                |

### SKILL.md

| Check                | Rule                                                              |
| -------------------- | ----------------------------------------------------------------- | -------- |
| Frontmatter presence | Must start with `---` YAML frontmatter                            |
| `name` field         | Required, must match the skill folder name                        |
| `description` field  | Required, must not be empty                                       |
| `description` length | Max 1024 characters (single-line or multiline `>`/`               | ` block) |
| `description` colon  | Must not contain `:` characters anywhere in the value             |
| Body line count      | Max 500 lines (content after the closing `---` of frontmatter)    |
| Body token count     | Max ~5000 estimated tokens (approximately 4 characters per token) |

### Skills Directory

| Check              | Rule                                                             |
| ------------------ | ---------------------------------------------------------------- |
| At least one skill | `skills/` must contain at least one skill folder with `SKILL.md` |
| No loose files     | `skills/` may only contain skill folders and optional `assets/`  |

### Skill Agents (Codex)

| Check             | Rule                                             |
| ----------------- | ------------------------------------------------ |
| Agents folder     | May only contain one YAML file                   |
| Agent file name   | Must be named `openai.yaml`                      |
| Agent file format | Must use `.yaml` or `.yml` extension, valid YAML |

### Agents (Root)

| Check         | Rule                                               |
| ------------- | -------------------------------------------------- |
| File format   | `.md` (Claude with frontmatter) or `.toml` (Codex) |
| Claude agents | Must have YAML frontmatter                         |

### Commands

| Check       | Rule                            |
| ----------- | ------------------------------- |
| File format | Must be `.md` files             |
| Directory   | May only contain Markdown files |

### Hooks

| Check                 | Rule                                     |
| --------------------- | ---------------------------------------- |
| `hooks.json` location | Plugin root OR `hooks/` folder, not both |
| Hook command formats  | `.py`, `.cmd`, or no extension (bash)    |

### Assets

| Check           | Rule                                              |
| --------------- | ------------------------------------------------- |
| File formats    | `jpeg`, `jpg`, `png`, `svg` only                  |
| PNG validation  | Must have valid PNG header                        |
| JPEG validation | Must have valid JPEG header                       |
| SVG validation  | Must contain `<svg>` element                      |
| Subdirectories  | Only `screenshots/` allowed inside root `assets/` |

### Marketplace Files

| Check                              | Rule                                              |
| ---------------------------------- | ------------------------------------------------- |
| `.claude-plugin/marketplace.json`  | Required, must be valid JSON with `plugins` array |
| `.agents/plugins/marketplace.json` | Required, must be valid JSON with `plugins` array |

---

## Plugin Version

The plugin version must be identical across all three locations:

1. `plugins/<name>/.claude-plugin/plugin.json` - `version` field
2. `plugins/<name>/.codex-plugin/plugin.json` - `version` field
3. `.claude-plugin/marketplace.json` - `plugins[].version` for that plugin

The verifier checks all three and reports any mismatch.
