# GitHub Plugin

A plugin that connects the agent to the **GitHub Copilot remote MCP server**
(`https://api.githubcopilot.com/mcp`) so it can operate on GitHub the way a
developer would - reading code, committing files, opening and reviewing pull
requests, triaging issues, and managing releases - all through structured MCP
tools.

## Features

- **Repository & code access** - read files, browse branches/commits, and
  search code across repositories
- **Commits** - create/update single files, push multi-file atomic commits, and
  create branches without a local clone
- **Pull requests** - open, list, search, read (diff/files/checks), review,
  update, and merge PRs, including automated Copilot reviews
- **Issues** - create, read, update, comment, and search issues
- **Releases & tags** - list releases, fetch the latest, look up by tag, and
  prepare release notes
- **GitHub Actions** - list and trigger workflow runs and read job logs

## Skills

| Skill             | Focus            | Key Tools                                                              |
| ----------------- | ---------------- | ---------------------------------------------------------------------- |
| `github-mcp`      | Server & routing | `get_me`, `get_file_contents`, `search_code` + toolset catalog         |
| `github-commit`   | Files & commits  | `create_or_update_file`, `push_files`, `create_branch`, `list_commits` |
| `github-pr`       | Pull requests    | `create_pull_request`, `pull_request_read`, `merge_pull_request`       |
| `github-releases` | Releases & tags  | `list_releases`, `get_latest_release`, `get_release_by_tag`, `get_tag` |

Each skill includes step-by-step instructions, example tool inputs/outputs, an
**Edge Cases & Gotchas** section, and supporting reference/example files that
the agent loads on demand.

## Prerequisites

1. A **GitHub Personal Access Token** exported as `GITHUB_PAT`:

   ```bash
   export GITHUB_PAT="github_pat_xxxxxxxxxxxxxxxxxxxx"
   ```

2. Token permissions (fine-grained PAT recommended):
   - **Contents**: Read and write (files, commits, branches)
   - **Pull requests**: Read and write
   - **Issues**: Read and write
   - **Metadata**: Read (always required)
   - **Actions**: Read (write to trigger runs)

   See [`skills/github-mcp/references/setup.md`](skills/github-mcp/references/setup.md)
   for the full scope guide and troubleshooting.

## MCP Configuration

The server is bundled via `.mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PAT}"
      }
    }
  }
}
```

> Never hardcode the token. Always use the `${GITHUB_PAT}` environment variable.

## Quick Start

1. Export `GITHUB_PAT` and enable the plugin.
2. Run `/mcp` and confirm the `github` server is connected.
3. Verify auth - the agent calls `get_me`
   (`mcp__plugin_github_github__get_me`).
4. Ask for what you need, for example:
   - "Create a branch and commit an updated README to `octocat/hello-world`."
   - "Open a PR from `feature/onboarding` into `main`."
   - "Show me the latest release and the commits since it."

## Tool Naming

Tools provided by this plugin are prefixed automatically:

```
mcp__plugin_github_github__<tool_name>
```

For example, `create_pull_request` is invoked as
`mcp__plugin_github_github__create_pull_request`.

## Toolset Support

| Toolset            | Covered by skill  | Status |
| ------------------ | ----------------- | ------ |
| `context`          | `github-mcp`      | ✅     |
| `repos` (files)    | `github-commit`   | ✅     |
| `repos` (search)   | `github-mcp`      | ✅     |
| `pull_requests`    | `github-pr`       | ✅     |
| `repos` (releases) | `github-releases` | ✅     |
| `issues`           | `github-mcp`      | ✅     |
| `actions`          | `github-mcp`      | ✅     |

See [`skills/github-mcp/references/toolsets.md`](skills/github-mcp/references/toolsets.md)
for the complete tool catalog.

## Documentation

- [`skills/github-mcp/SKILL.md`](skills/github-mcp/SKILL.md) - server overview, tool naming, routing
- [`skills/github-commit/SKILL.md`](skills/github-commit/SKILL.md) - commits & files
- [`skills/github-pr/SKILL.md`](skills/github-pr/SKILL.md) - pull request lifecycle
- [`skills/github-releases/SKILL.md`](skills/github-releases/SKILL.md) - releases & tags

## License

This plugin is licensed under the [MIT License](LICENSE).
