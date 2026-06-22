---
name: github-commit
description: >
  Create and update files and push commits to a GitHub repository through the
  GitHub MCP server. Use this skill when the user wants to commit changes,
  add or edit a file, push multiple files at once, create a branch before
  committing, or inspect commit history on GitHub (not the local git CLI).
  Triggers include "commit to GitHub", "create a file in the repo",
  "push files", "update README on GitHub", "create a branch", or
  "show recent commits".
license: MIT
compatibility: Requires the github MCP server (see ../github-mcp/SKILL.md) and a GITHUB_PAT with Contents read/write permission.
---

# GitHub Commit Skill

Create commits on GitHub directly through MCP - without a local clone. This
covers single-file edits, multi-file commits, branch creation, and reading
commit history.

> This skill uses the `github` MCP server. Tools are called as
> `mcp__plugin_github_github__<tool_name>`. See
> [../github-mcp/SKILL.md](../github-mcp/SKILL.md) for setup and tool naming.

## Overview

**Relevant tools (`repos` toolset):**

| Tool                    | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `get_file_contents`     | Read a file + obtain its current `sha`       |
| `create_or_update_file` | Commit a single file (create or update)      |
| `delete_file`           | Remove a single file in one commit           |
| `push_files`            | Commit **multiple** files in a single commit |
| `create_branch`         | Create a new branch before committing        |
| `list_branches`         | List branches / verify a base branch exists  |
| `list_commits`          | Read commit history of a branch              |
| `get_commit`            | Read details (files, stats) of one commit    |

## Prerequisites

1. The `github` MCP server is connected (verify with `get_me`).
2. The PAT has **Contents: Read and write** on the target repository.
3. You know the `owner`, `repo`, and target `branch`.

## Step-by-Step: Update a Single File

1. **Read the current file** with `get_file_contents` to obtain its `sha`.
   Updating an existing file **requires** the current blob `sha`; omitting it
   causes a `409` conflict.
2. **Prepare the new content** (plain UTF-8 text; the tool handles encoding).
3. **Commit** with `create_or_update_file`, passing `owner`, `repo`, `path`,
   `content`, a clear `message`, the `branch`, and the `sha` from step 1.
4. **Verify** by re-reading the file or calling `list_commits`.

## Step-by-Step: Commit Multiple Files

1. (Optional) **Create a branch** with `create_branch` if committing to a new
   feature branch.
2. **Push all files together** with `push_files`, providing a `files` array
   (each item `{ path, content }`) and a single `message`. This produces one
   atomic commit - preferred over multiple `create_or_update_file` calls.
3. **Verify** with `get_commit` on the returned commit `sha`.

## Step-by-Step: Read Commit History

1. Call `list_commits` with `owner`, `repo`, and `sha` (branch name or commit).
2. For details on a specific commit, call `get_commit` with its `sha`.

## Example Input / Output

**Read a file to get its sha**

Tool: `get_file_contents`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "path": "README.md",
  "ref": "main"
}
```

Response (truncated):

```json
{
  "path": "README.md",
  "sha": "3b18e512dba79e4c8300dd08aeb37f8e728b8dad",
  "encoding": "base64",
  "content": "..."
}
```

**Update that file**

Tool: `create_or_update_file`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "path": "README.md",
  "message": "docs: clarify installation steps",
  "content": "# Hello World\n\nUpdated installation instructions.\n",
  "branch": "main",
  "sha": "3b18e512dba79e4c8300dd08aeb37f8e728b8dad"
}
```

Response (truncated):

```json
{
  "commit": {
    "sha": "7638417db6d59f3c431d3e1f261cc637155684cd",
    "message": "docs: clarify installation steps",
    "html_url": "https://github.com/octocat/hello-world/commit/7638417"
  }
}
```

**Push multiple files in one commit**

Tool: `push_files`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "branch": "feature/onboarding",
  "message": "feat: add onboarding guide and config",
  "files": [
    { "path": "docs/onboarding.md", "content": "# Onboarding\n..." },
    { "path": "config/app.json", "content": "{\n  \"feature\": true\n}\n" }
  ]
}
```

For more end-to-end recipes (new branch + commit, delete file, conventional
commit messages), see [examples/commit-flows.md](examples/commit-flows.md).

## Commit Message Guidance

Prefer **Conventional Commits**: `type(scope): summary`.

- `feat:` new feature · `fix:` bug fix · `docs:` documentation
- `refactor:`, `test:`, `chore:`, `perf:`, `ci:`, `build:`
- Keep the summary under ~72 chars; add a body for the "why" when non-trivial.

## Edge Cases & Gotchas

- **`sha` is mandatory for updates.** Updating an existing file without the
  current `sha` fails with `409 Conflict`. Always read first.
- **Creating vs updating.** Omit `sha` only when creating a brand-new file at a
  path that does not yet exist.
- **Prefer `push_files` for multiple files.** Sequential `create_or_update_file`
  calls create multiple commits and can race against each other's `sha`.
- **Branch must exist.** `create_or_update_file` / `push_files` fail if the
  `branch` doesn't exist - create it first with `create_branch`.
- **Protected branches.** Pushes to protected branches (e.g. `main` with
  required reviews) may be rejected. Commit to a feature branch and open a PR
  (see the `github-pr` skill).
- **Content is plain text in / base64 out.** Pass `content` as plain UTF-8;
  `get_file_contents` returns base64 that must be decoded before editing.
- **Read-only mode.** If the server is read-only, write tools are skipped
  silently - verify the commit landed via `list_commits`.
- **Large/binary files.** The Contents API is unsuitable for very large or
  binary blobs; use Git LFS or an upload flow instead.

## Reference Files

- [examples/commit-flows.md](examples/commit-flows.md) - full commit recipes
- [../github-mcp/SKILL.md](../github-mcp/SKILL.md) - server setup & tool naming
