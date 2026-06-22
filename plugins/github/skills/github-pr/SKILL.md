---
name: github-pr
description: >
  Manage the full pull request lifecycle on GitHub through the GitHub MCP
  server - create, list, search, read, review, update, and merge PRs. Use this
  skill when the user mentions pull requests or PRs, asks to "open a PR",
  "review a pull request", "merge a PR", "see PR diff/files/checks",
  "request a Copilot review", or "update the PR title/body/base".
license: MIT
compatibility: Requires the github MCP server (see ../github-mcp/SKILL.md) and a GITHUB_PAT with Pull requests read/write permission.
---

# GitHub Pull Request Skill

Drive pull requests end-to-end through MCP: from opening a PR off a feature
branch, to reading its diff and checks, leaving reviews, and merging.

> Tools are called as `mcp__plugin_github_github__<tool_name>`. See
> [../github-mcp/SKILL.md](../github-mcp/SKILL.md) for setup and tool naming.

## Overview

**Relevant tools (`pull_requests` + `copilot` toolsets):**

| Tool                                | Purpose                                                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_pull_request`               | Open a new PR                                                                                                                                   |
| `list_pull_requests`                | List PRs (filter by state, base, head)                                                                                                          |
| `search_pull_requests`              | Search PRs with GitHub query syntax                                                                                                             |
| `pull_request_read`                 | Read a PR (`get`, `get_diff`, `get_files`, `get_status`, `get_commits`, `get_reviews`, `get_comments`, `get_review_comments`, `get_check_runs`) |
| `update_pull_request`               | Edit title/body/base/state                                                                                                                      |
| `update_pull_request_branch`        | Update PR branch with latest base                                                                                                               |
| `merge_pull_request`                | Merge a PR (merge/squash/rebase)                                                                                                                |
| `pull_request_review_write`         | Create/submit/delete a review                                                                                                                   |
| `add_comment_to_pending_review`     | Add a line comment to a pending review                                                                                                          |
| `add_reply_to_pull_request_comment` | Reply to an existing review comment                                                                                                             |
| `request_copilot_review`            | Request an automated Copilot review                                                                                                             |

## Prerequisites

1. The `github` MCP server is connected (verify with `get_me`).
2. The PAT has **Pull requests: Read and write** (and **Contents** to push the
   branch the PR is based on).
3. The head branch already exists and contains commits (use the
   `github-commit` skill to create it).

## Step-by-Step: Open a Pull Request

1. **Ensure the head branch exists** and differs from the base. If not, commit
   first (see the `github-commit` skill).
2. **Create the PR** with `create_pull_request`: `owner`, `repo`, `title`,
   `head` (feature branch), `base` (e.g. `main`), and a descriptive `body`.
   Set `draft: true` for a work-in-progress PR.
3. **Capture the PR number** from the response for follow-up actions.
4. (Optional) **Request review** via `request_copilot_review` or assign human
   reviewers.

## Step-by-Step: Review a Pull Request

1. **Read the PR** with `pull_request_read` method `get` for metadata.
2. **Inspect changes** with method `get_diff` or `get_files`.
3. **Check CI** with method `get_check_runs` / `get_status`.
4. **Leave a review** with `pull_request_review_write` (method `create` then
   `submit`, with `event` = `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`). Add
   line comments via `add_comment_to_pending_review` before submitting.

## Step-by-Step: Merge a Pull Request

1. **Confirm mergeability** with `pull_request_read` method `get_status` /
   `get_check_runs` (checks green, no conflicts, required reviews satisfied).
2. **Merge** with `merge_pull_request`, choosing `merge_method`:
   `merge`, `squash`, or `rebase`.
3. **Verify** the PR state is `closed`/`merged`.

## Example Input / Output

**Create a PR**

Tool: `create_pull_request`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "title": "feat: add onboarding guide",
  "head": "feature/onboarding",
  "base": "main",
  "body": "## Summary\n- Adds onboarding docs\n\n## Testing\n- Manual review",
  "draft": false
}
```

Response (truncated):

```json
{
  "number": 42,
  "state": "open",
  "html_url": "https://github.com/octocat/hello-world/pull/42",
  "head": { "ref": "feature/onboarding" },
  "base": { "ref": "main" }
}
```

**Read the diff**

Tool: `pull_request_read`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "method": "get_diff"
}
```

**Merge with squash**

Tool: `merge_pull_request`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "merge_method": "squash",
  "commit_title": "feat: add onboarding guide (#42)"
}
```

Response (truncated):

```json
{
  "merged": true,
  "sha": "6dcb09b5b57875f334f61aebed695e2e4193db5e",
  "message": "Pull Request successfully merged"
}
```

For review workflows, draft PRs, conflict resolution, and Copilot reviews, see
[examples/pr-flows.md](examples/pr-flows.md).

## Edge Cases & Gotchas

- **`head` must contain commits.** Creating a PR with no diff between `head`
  and `base` returns `422 No commits between ...`.
- **Cross-fork PRs.** For PRs from a fork, `head` is `owner:branch`. Ensure the
  PAT can read the fork.
- **Merge blocked.** `merge_pull_request` fails if checks are failing, reviews
  are required, or the branch is out of date - call `update_pull_request_branch`
  to sync with base, then retry.
- **Merge method availability.** A repo may disable `merge`, `squash`, or
  `rebase`. Pick an allowed method or the call returns `405`.
- **Review state machine.** `pull_request_review_write` uses pending → submit.
  Adding comments to a non-pending review fails; create the review first.
- **Draft PRs can't be merged** until marked ready for review (via
  `update_pull_request`).
- **Lockdown mode** may filter review/comment content from untrusted authors -
  handle missing fields gracefully.
- **Pagination** applies to `list_pull_requests` and the `get_files`/
  `get_commits` methods of `pull_request_read`.

## Reference Files

- [examples/pr-flows.md](examples/pr-flows.md) - review, draft, conflict, Copilot flows
- [../github-mcp/SKILL.md](../github-mcp/SKILL.md) - server setup & tool naming
- [../github-commit/SKILL.md](../github-commit/SKILL.md) - creating the head branch
