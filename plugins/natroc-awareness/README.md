# Natroc Awareness

`natroc-awareness` gives coding agents a compact inventory of installed Natroc plugins at session start so they can route user requests to the right plugin skills without loading every plugin file into context.

This plugin is intentionally small. It is a routing layer, not a replacement for the individual plugin skills.

## What it includes

- One bootstrap skill: `using-natroc-plugins`.
- One `SessionStart` hook for Claude Code-compatible runtimes.
- A bounded marketplace and manifest scanner that checks nearby installed plugin folders and avoids scanning the user's whole disk.

## How it works

1. The `SessionStart` hook runs `hooks/session_start_context.py`.
2. The hook scans nearby plugin folders for `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`.
3. It also reads nearby Natroc marketplace files when they are available.
4. It derives routing lines from plugin descriptions, keywords, categories, and skill folder names.
5. It injects a short `additionalContext` message that tells the agent which Natroc plugins were detected and how to route tasks.
6. The agent loads only the matching plugin skill or metadata when the user's task needs it.

## Boundaries

- Does not read all plugin docs at startup.
- Does not scan the entire computer.
- Does not claim a plugin is installed unless it is detected near the current plugin installation.
- Does not use network access.
- Does not collect secrets or environment values.
- Does not require a manually maintained plugin index.

If only marketplace metadata is available, the agent should describe those entries as available in the nearby Natroc marketplace, not confirmed installed plugins.

## Install/use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install natroc-awareness@natroc-plugins
  ```

Restart Claude Code after installing so the `SessionStart` hook is loaded.

### Claude Desktop & Claude Web (claude.ai)

Open `Customize` in the left panel and click `+` icon, then select `Create plugin` > `Add marketplace`.

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
  codex plugin add natroc-awareness@natroc-plugins
  ```

Codex runtimes that do not execute Claude-style session hooks still get the bootstrap skill and can inspect nearby marketplace and manifest metadata on demand.

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

## Plugin structure

```text
natroc-awareness/
├── .claude-plugin/plugin.json
├── .codex-plugin/plugin.json
├── hooks/
│   ├── hooks.json
│   └── session_start_context.py
└── skills/
    └── using-natroc-plugins/
        ├── SKILL.md
        └── agents/openai.yaml
```

## Version

1.0.0 - Initial dynamic marketplace-aware routing skill and `SessionStart` context hook.

## Author

PT Kelana Tech Solutions

## License

MIT License - See repository for details.
