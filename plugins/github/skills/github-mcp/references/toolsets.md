# GitHub MCP Server - Toolset & Tool Catalog

The GitHub MCP server groups tools into **toolsets**. The default toolset
(when none is configured) enables `context`, `repos`, `issues`,
`pull_requests`, and `users`. Use the `all` toolset to enable everything.

All tool names below are called with the plugin prefix:
`mcp__plugin_github_github__<tool_name>`.

## Server Endpoints

| Item                       | Value                                           |
| -------------------------- | ----------------------------------------------- |
| Remote server URL          | `https://api.githubcopilot.com/mcp`             |
| GHE Cloud (data residency) | `https://copilot-api.YOURSUBDOMAIN.ghe.com/mcp` |
| Auth header                | `Authorization: Bearer ${GITHUB_PAT}`           |

## Configuration Mechanisms

| Mechanism          | Flag / Env / Header                          |
| ------------------ | -------------------------------------------- |
| Toolset allow-list | `--toolsets` / `GITHUB_TOOLSETS`             |
| Specific tools     | `--tools` / `GITHUB_TOOLS`                   |
| Read-only mode     | `--read-only` / `GITHUB_READ_ONLY=1`         |
| Lockdown mode      | `--lockdown-mode` / `GITHUB_LOCKDOWN_MODE=1` |

## context

- `get_me` - authenticated user details
- `get_teams`
- `get_team_members`

## repos

- `get_file_contents`
- `create_or_update_file`
- `delete_file`
- `push_files` - commit multiple files at once
- `create_branch`
- `list_branches`
- `get_commit`
- `list_commits`
- `search_code`
- `search_commits`
- `search_repositories`
- `create_repository`
- `fork_repository`
- `list_repository_collaborators`
- `get_latest_release`
- `get_release_by_tag`
- `list_releases`
- `get_tag`
- `list_tags`

## issues

- `list_issues`
- `search_issues`
- `issue_read` - methods: `get`, `get_comments`, `get_sub_issues`, `get_labels`
- `issue_write` - methods: `create`, `update`
- `add_issue_comment`
- `sub_issue_write` - methods: `add`, `remove`, `reprioritize`
- `list_issue_types`
- `list_issue_fields`
- `get_label`

## pull_requests

- `create_pull_request`
- `list_pull_requests`
- `search_pull_requests`
- `update_pull_request`
- `update_pull_request_branch`
- `merge_pull_request`
- `pull_request_read` - methods: `get`, `get_diff`, `get_status`, `get_files`,
  `get_commits`, `get_review_comments`, `get_reviews`, `get_comments`,
  `get_check_runs`
- `pull_request_review_write` - `create`, `submit`, `delete`
- `add_comment_to_pending_review`
- `add_reply_to_pull_request_comment`

## actions

- `actions_list`
- `actions_get`
- `actions_run_trigger`
- `get_job_logs`

## copilot

- `request_copilot_review`
- `assign_copilot_to_issue`
- `create_pull_request_with_copilot` _(remote only)_

## labels

- `list_label`
- `get_label`
- `label_write` - `create`, `update`, `delete`

## users / orgs

- `search_users`
- `search_orgs`

## Other Toolsets

`code_quality`, `code_security`, `dependabot`, `discussions`, `gists`, `git`,
`notifications`, `projects`, `secret_protection`, `security_advisories`,
`stargazers`, `copilot_spaces`, `github_support_docs_search`.

See the official `github/github-mcp-server` documentation for the full,
authoritative list and per-tool argument schemas.
