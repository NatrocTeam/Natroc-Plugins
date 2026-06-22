---
name: github-releases
description: >
  Read and manage GitHub releases and tags through the GitHub MCP server.
  Use this skill when the user asks to "list releases", "get the latest
  release", "find a release by tag", "show tags", "what's the current
  version", or wants to prepare release notes for a repository on GitHub.
license: MIT
compatibility: Requires the github MCP server (see ../github-mcp/SKILL.md) and a GITHUB_PAT with Contents read (and write to create release tags/files).
---

# GitHub Releases Skill

Inspect and prepare GitHub releases and tags through MCP - list past releases,
fetch the latest, look up a release by tag, and gather the inputs needed to
draft release notes.

> Tools are called as `mcp__plugin_github_github__<tool_name>`. See
> [../github-mcp/SKILL.md](../github-mcp/SKILL.md) for setup and tool naming.

## Overview

**Relevant tools (`repos` toolset):**

| Tool                 | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `list_releases`      | List a repository's releases (newest first)    |
| `get_latest_release` | Get the most recent **non-prerelease** release |
| `get_release_by_tag` | Get a specific release by its tag name         |
| `list_tags`          | List all tags                                  |
| `get_tag`            | Get details for one tag (commit it points to)  |
| `list_commits`       | Gather commits since a tag for release notes   |

> **Note:** The GitHub MCP `repos` toolset focuses on **reading** releases and
> tags. To _publish_ a brand-new release entry, pair this skill with the
> `github-commit` skill (commit a `CHANGELOG`/notes file and create the tag),
> or use the GitHub web UI / REST API for the formal "create release" step.
> See [references/release-notes.md](references/release-notes.md).

## Prerequisites

1. The `github` MCP server is connected (verify with `get_me`).
2. The PAT can read the repository (and write Contents if committing notes).
3. You know the `owner` and `repo`.

## Step-by-Step: Inspect Releases

1. **List releases** with `list_releases` to see history and current version.
2. **Get the latest** with `get_latest_release` for the newest stable release.
3. **Look up a specific version** with `get_release_by_tag` (e.g. `v1.2.0`).

## Step-by-Step: Prepare Release Notes

1. **Find the previous release tag** via `get_latest_release` or
   `list_releases`.
2. **Resolve the tag's commit** with `get_tag`.
3. **Collect commits since that tag** with `list_commits` (using the branch
   `sha`), then group them by Conventional Commit type into a changelog.
4. **Persist the notes** (e.g. update `CHANGELOG.md`) using the
   `github-commit` skill, and create the version tag.

See [references/release-notes.md](references/release-notes.md) for a full
template and the publish flow.

## Example Input / Output

**List releases**

Tool: `list_releases`

```json
{ "owner": "octocat", "repo": "hello-world", "perPage": 10 }
```

Response (truncated):

```json
[
  {
    "tag_name": "v1.2.0",
    "name": "1.2.0",
    "draft": false,
    "prerelease": false,
    "published_at": "2026-06-01T10:00:00Z"
  },
  {
    "tag_name": "v1.1.0",
    "name": "1.1.0",
    "draft": false,
    "prerelease": false,
    "published_at": "2026-05-01T10:00:00Z"
  }
]
```

**Get the latest release**

Tool: `get_latest_release`

```json
{ "owner": "octocat", "repo": "hello-world" }
```

Response (truncated):

```json
{
  "tag_name": "v1.2.0",
  "name": "1.2.0",
  "body": "## What's Changed\n- feat: ...\n",
  "html_url": "https://github.com/octocat/hello-world/releases/tag/v1.2.0"
}
```

**Get a release by tag**

Tool: `get_release_by_tag`

```json
{ "owner": "octocat", "repo": "hello-world", "tag": "v1.1.0" }
```

## Edge Cases & Gotchas

- **`get_latest_release` ignores prereleases and drafts.** It returns the most
  recent **published, non-prerelease** release. Use `list_releases` to include
  prereleases/drafts.
- **Tag vs release.** A tag can exist without a release. `get_tag`/`list_tags`
  work on raw git tags; `*_release` tools work on release entries.
- **No releases yet.** `get_latest_release` returns `404` when a repo has no
  published releases - fall back to `list_tags` or commit history.
- **Tag naming.** Match the repository's convention (e.g. `v1.2.0` vs `1.2.0`).
  `get_release_by_tag` requires the exact tag string.
- **Creating releases via MCP.** The `repos` read tools don't publish a release
  entry. To ship one, commit notes/tag with the `github-commit` skill or use
  the REST API; verify afterward with `get_release_by_tag`.
- **Read-only mode** blocks any write step (committing notes / creating tags).
- **Pagination** applies to `list_releases` and `list_tags`.

## Reference Files

- [references/release-notes.md](references/release-notes.md) - notes template & publish flow
