# Stitch MCP Plugin

The `stitch` plugin bundles the **Stitch-MCP** bridge (`@natroc/stitch-mcp`) as an auto-starting MCP server inside Claude Code / Codex, plus a skill with setup guidance and tool references for all 19 Stitch tools.

## What is Stitch-MCP?

**[Stitch-MCP](https://github.com/NatrocTeam/Stitch-MCP)** is an open-source bridge that translates STDIO MCP transport (used by Claude Code, Codex, and most AI coding agents) into HTTPS/StreamableHTTP transport (used by Google Stitch).

**Data flow:**

```
[AI Agent] ← STDIO → [@natroc/stitch-mcp] ← HTTPS → [Google Stitch MCP API]
```

## What's Included

| Component            | Description                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `.mcp.json`          | Auto-starts `@natroc/stitch-mcp` when the plugin loads, exposing all 19 Stitch tools directly as MCP tools in the agent |
| `README.md`          | Plugin documentation                                                                                                    |
| `skills/stitch-mcp/` | Skill with MCP setup, environment variables, tool reference, and workflow patterns                                      |

## Prerequisites

- **Node.js >= 18**
- A **Google Stitch API key** or **OAuth access token**

## Installation

### Via Marketplace (Recommended)

```bash
claude plugin marketplace add NatrocTeam/Natroc-Plugins
claude plugin install stitch@natroc-plugins
```

```bash
codex plugin marketplace add NatrocTeam/Natroc-Plugins
codex plugin add stitch@natroc-plugins
```

### Manual Setup

The plugin auto-configures the MCP server. You only need to set the environment variable:

```bash
export STITCH_API_KEY="your_stitch_api_key_here"
```

Restart the agent after installation so the MCP server starts.

## Environment Variables

| Variable                        | Required        | Default                             | Description                           |
| ------------------------------- | --------------- | ----------------------------------- | ------------------------------------- |
| `STITCH_API_KEY`                | \* (one of two) | -                                   | API key for Stitch authentication     |
| `STITCH_ACCESS_TOKEN`           | \* (one of two) | -                                   | OAuth2 Bearer token alternative       |
| `GOOGLE_CLOUD_PROJECT`          | with OAuth      | -                                   | Quota project ID                      |
| `STITCH_MCP_URL`                | optional        | `https://stitch.googleapis.com/mcp` | Target Stitch MCP server URL          |
| `STITCH_ALLOW_INSECURE_MCP_URL` | optional        | `false`                             | Allow non-HTTPS URLs (dev only)       |
| `STITCH_ALLOWED_UPLOAD_DIR`     | optional        | -                                   | Restricted directory for file uploads |
| `STITCH_UPLOAD_MAX_BYTES`       | optional        | `10485760` (10 MB)                  | Max upload file size                  |

> Either `STITCH_API_KEY` or `STITCH_ACCESS_TOKEN` is required. When using `STITCH_ACCESS_TOKEN`, also set `GOOGLE_CLOUD_PROJECT`.

## MCP Server

The plugin starts `@natroc/stitch-mcp` as a local STDIO MCP server via `.mcp.json`:

```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "@natroc/stitch-mcp"],
      "env": {
        "STITCH_API_KEY": "${STITCH_API_KEY}"
      }
    }
  }
}
```

Tools are available via `mcp__plugin_stitch_stitch__<tool-name>` in commands, or directly by name when the skill routes them.

## Plugin Structure

```
stitch/
├── .mcp.json                    # MCP server definition
├── .claude-plugin/plugin.json   # Claude Code manifest
├── .codex-plugin/plugin.json    # Codex manifest
├── README.md                    # This file
└── skills/stitch-mcp/
    └── SKILL.md                 # Full tool reference & workflows
```

## Version

1.0.0 - Initial release.

## Author

PT Kelana Tech Solutions

## License

MIT License - See the repository for details.
