# Natroc Awareness

`natroc-awareness` gives coding agents a lightweight routing bootstrap at session start so they can route user requests to the right plugin skills without loading every plugin file into context.

This plugin is intentionally small. It is a routing layer, not a replacement for the individual plugin skills.

## What it includes

- One bootstrap skill: `using-natroc-plugins`.
- Two `SessionStart` hooks: `hooks.json` (Claude Code) and `hooks-codex.json` (Codex).
- Pure bash hook scripts (`session-start`, `session-start-codex`) - zero dependencies, no Python required.
- A cross-platform polyglot wrapper (`run-hook.cmd`) for Windows compatibility.
- On-demand routing guidance for inspecting nearby marketplace files and plugin manifests only when needed.

## How it works

1. The `SessionStart` hook runs `hooks/session-start` (pure bash, zero dependencies).
2. The hook injects the full `using-natroc-plugins` skill content so the agent knows to route Natroc plugin tasks first.
3. When a user request points to a Natroc plugin domain, the agent routes automatically without requiring the user to name a plugin, skill, agent, command, hook, or connector.
4. The agent inspects nearby marketplace files, plugin manifests, and capability folders on demand.
5. The agent loads only the matching plugin skill, agent, command, hook guidance, connector metadata, or supporting artifact when the user's task needs it.

## Boundaries

- Does not read all plugin docs at startup.
- Does not scan marketplace files or plugin manifests at startup.
- Does not scan the entire computer.
- Does not claim a plugin is installed unless it is detected near the current plugin installation.
- Does not use network access.
- Does not collect secrets or environment values.
- Does not require a manually maintained plugin index.

If only marketplace metadata is available during on-demand inspection, the agent should describe those entries as available in the nearby Natroc marketplace, not confirmed installed plugins.

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
│   ├── hooks-codex.json
│   ├── run-hook.cmd
│   ├── session-start
│   └── session-start-codex
└── skills/
    └── using-natroc-plugins/
        ├── SKILL.md
        └── agents/openai.yaml
```

## Version

2.0.0 - Lightweight SessionStart bootstrap with on-demand marketplace and manifest inspection, separate Claude/Codex SessionStart hooks, cross-platform polyglot wrapper, and full SKILL.md injection at session start.

## Author

PT Kelana Tech Solutions

## License

MIT License - See repository for details.
