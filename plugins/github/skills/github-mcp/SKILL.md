---
name: github-mcp
description: >
  Use GitHub's remote MCP server to manage repositories, files, commits,
  branches, pull requests, issues, releases, and GitHub Actions. Use this
  skill when the user mentions GitHub, the GitHub MCP server, a GITHUB_PAT,
  api.githubcopilot.com/mcp, or asks to read/search/create/update
  repositories, files, branches, issues, PRs, reviews, releases, tags,
  workflow runs, or any other GitHub resource through MCP tools.
license: MIT
compatibility: Requires a GitHub Personal Access Token in the GITHUB_PAT environment variable and the bundled .mcp.json (HTTP transport to https://api.githubcopilot.com/mcp).
---

# GitHub MCP Skill

This skill drives the **GitHub Copilot remote MCP server** so the agent can
operate on GitHub the same way a developer would: reading code, creating
commits, opening pull requests, triaging issues, and shipping releases.

The server is bundled with this plugin via `.mcp.json`:

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

## Overview

The GitHub MCP server exposes ~70 tools grouped into **toolsets** (repos,
issues, pull_requests, actions, releases-via-repos, etc.). Each tool is a
structured function call with a JSON input and a JSON output. This skill
explains how to discover, authenticate, and call those tools correctly.

**Key capabilities:**

- Read & search repositories, files, commits, branches, and code
- Create/update files and push multi-file commits
- Open, review, update, and merge pull requests
- Create, read, update, and comment on issues
- Manage releases, tags, and GitHub Actions workflow runs

For the full catalog of toolsets and exact tool names, see
[references/toolsets.md](references/toolsets.md). For environment setup and
token scopes, see [references/setup.md](references/setup.md).

## Prerequisites

1. **`GITHUB_PAT`** must be set in the environment before the MCP server
   starts. Use a fine-grained PAT scoped to the target repositories.
2. The plugin must be enabled so the `github` MCP server connects.
3. Confirm connectivity with the `/mcp` command - the `github` server should
   be listed and its tools discoverable.

## Tool Naming

MCP tools provided by this plugin are automatically prefixed:

```
mcp__plugin_github_github__<tool_name>
```

**Example:** the `get_me` tool becomes
`mcp__plugin_github_github__get_me`.

Throughout this skill we use the short tool name (e.g. `create_pull_request`)
for readability; the agent must call the fully-prefixed name.

## Step-by-Step: Calling a Tool

1. **Establish context.** Call `get_me` once per session to confirm
   authentication and learn the active user/login. Most other tools require
   `owner` and `repo` arguments - gather these from the user if not known.
2. **Pick the right tool.** Map the user's intent to a toolset
   (see [references/toolsets.md](references/toolsets.md)). Prefer read tools
   (`get_*`, `list_*`, `search_*`) before any write.
3. **Validate inputs.** Ensure required fields (`owner`, `repo`, `branch`,
   `sha`, etc.) are present and correctly typed before the call.
4. **Call the tool** with the fully-prefixed name and a JSON argument object.
5. **Inspect the response.** Handle pagination (`page`/`perPage`), empty
   results, and error payloads before reporting back to the user.

## Example Input / Output

**Identify the authenticated user**

Tool: `get_me`

```json
{}
```

Sample response:

```json
{
  "login": "octocat",
  "id": 1,
  "name": "The Octocat",
  "type": "User",
  "html_url": "https://github.com/octocat"
}
```

**Read a file from a repository**

Tool: `get_file_contents`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "path": "README.md",
  "ref": "main"
}
```

Sample response (truncated):

```json
{
  "name": "README.md",
  "path": "README.md",
  "sha": "3b18e512dba79e4c8300dd08aeb37f8e728b8dad",
  "encoding": "base64",
  "content": "IyBIZWxsbyBXb3JsZAo="
}
```

**Search code across a repository**

Tool: `search_code`

```json
{
  "query": "addEventListener repo:octocat/hello-world language:js"
}
```

## Routing to Specialized Skills

For deeper workflows, this skill defers to focused sibling skills:

| Intent                                  | Use skill         |
| --------------------------------------- | ----------------- |
| Create/update files, push commits       | `github-commit`   |
| Open/review/merge pull requests         | `github-pr`       |
| Create/read releases, manage tags       | `github-releases` |
| Anything else (issues, actions, search) | this skill        |

## Edge Cases & Gotchas

- **Exact tool names.** Names must match exactly (`get_file_contents`, not
  `getFileContents`). Some tools were renamed and keep old names as aliases.
- **Read-only mode.** If the server runs with `--read-only` /
  `GITHUB_READ_ONLY=1`, all write tools are silently skipped - never assume a
  write succeeded; verify with a follow-up read.
- **Lockdown mode.** `issue_read:get` and `pull_request_read:get` may return
  errors for authors lacking push access, and some comment/review content is
  filtered. Handle missing fields gracefully.
- **Pagination.** `list_*` and `search_*` tools paginate. Always check whether
  more pages exist before concluding "no results."
- **Rate limits.** GitHub API rate limits apply. On `403`/secondary-rate-limit
  responses, back off rather than retrying immediately.
- **Token scope errors.** A `404` on a private resource usually means the PAT
  lacks access, not that the resource is missing. See
  [references/setup.md](references/setup.md) for required scopes.
- **Owner/repo required.** Most tools fail without `owner` and `repo`. Resolve
  these explicitly instead of guessing from the local working directory.

## Reference Files

- [references/toolsets.md](references/toolsets.md) - full toolset & tool catalog
- [references/setup.md](references/setup.md) - `GITHUB_PAT` setup, scopes, troubleshooting
