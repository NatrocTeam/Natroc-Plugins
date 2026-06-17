# script verify-plugins

## Plugins Structure

```text
<plugin-name>/
├── .app.json                                   # Optional: connector app for Codex Only
├── .claude-plugin/
│   └── plugin.json                             # Claude Plugin Manifest
├── .codex-plugin/
│   └── plugin.json                             # Codex Plugin Manifest
├── .gitignore                                  # Optional for Both Agents
├── .mcp.json                                   # Optional for Both Agents
├── LICENSE                                     # Optional for Both Agents
├── README.md                                   # Must have, and human readble
├── agents/                                     # Optional: Subagent and must be in markdown format with frontmatter for Claude and toml format for Codex
│   ├── code-reviewer.md
│   └── code-reviewer.toml
├── assets/                                     # Optional: For Codex Only and must be in jpeg, jpg, png, and svg format
│   ├── logo.svg
│   └── screenshots/                            # Optional: For screenshoot in Codex Apps and must be in jpeg, jpg, png, and svg format
│       ├── fix-flow.svg
│       ├── review-report.svg
│       └── security-gate.svg
├── commands/                                   # Optional: for Claude Only and must be in markdown format
├── hooks/                                      # Optional: lifecycle for Both Agents
│   ├── hooks.json
│   ├── hooks-codex.json                        # Optional: Codex variant
│   ├── user_prompt_submit_intent_gate.py       # Optional for hooks command (Python)
│   ├── session-start                           # Optional for hooks command (bash)
│   └── run-hook.cmd                            # Optional: cross-platform polyglot wrapper
└── skills/                                     # Must have at least one skill
    └── <skill-name>/
        ├── SKILL.md                            # `name` in frontmatter must match `<skill-name>` folder
        ├── agents/                             # Optional: Skill metadata for Codex Only and must be in yaml format
        │   └── openai.yaml                     # Just one file
        ├── assets/                             # Optional: skill-level assets (ignored by verifier)
        ├── references/                         # Optional
        ├── scripts/                            # Optional
        └── templates/                          # Optional
```

> Directories under `skills/` that are not skill folders (e.g. `assets/`) are ignored by the verifier.

> NOTE for `hooks.json` and `hooks-codex.json`
>
> `hooks.json` and `hooks-codex.json` can be stored in the plugin root or inside a folder named hooks (not both).

## Plugin Version

The plugin version must be the same in the claude plugin manifest and the codex plugin manifest.
