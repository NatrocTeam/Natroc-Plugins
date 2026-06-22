# Pull Request Flow Recipes

All tools are called as `mcp__plugin_github_github__<tool_name>`.

## Recipe 1 - Find Open PRs Needing Review

```json
// list_pull_requests
{
  "owner": "octocat",
  "repo": "hello-world",
  "state": "open",
  "base": "main",
  "perPage": 20
}
```

Or with search syntax:

```json
// search_pull_requests
{ "query": "repo:octocat/hello-world is:pr is:open review:required" }
```

## Recipe 2 - Full Review with Line Comments

1. Read the changed files:

```json
// pull_request_read
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "method": "get_files"
}
```

2. Start a review and add a line comment:

```json
// pull_request_review_write
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "method": "create"
}
```

```json
// add_comment_to_pending_review
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "path": "src/api/users.ts",
  "line": 12,
  "body": "Consider extracting this into a helper."
}
```

3. Submit the review:

```json
// pull_request_review_write
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "method": "submit",
  "event": "REQUEST_CHANGES",
  "body": "A few changes requested."
}
```

## Recipe 3 - Request an Automated Copilot Review

```json
// request_copilot_review
{ "owner": "octocat", "repo": "hello-world", "pullNumber": 42 }
```

## Recipe 4 - Resolve an Out-of-Date Branch, Then Merge

1. Check status:

```json
// pull_request_read
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "method": "get_status"
}
```

2. Update the branch with latest base:

```json
// update_pull_request_branch
{ "owner": "octocat", "repo": "hello-world", "pullNumber": 42 }
```

3. Merge:

```json
// merge_pull_request
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "merge_method": "squash"
}
```

## Recipe 5 - Promote a Draft PR and Edit Metadata

```json
// update_pull_request
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "draft": false,
  "title": "feat: add onboarding guide (ready)",
  "base": "develop"
}
```

## Recipe 6 - Reply to a Review Comment

```json
// add_reply_to_pull_request_comment
{
  "owner": "octocat",
  "repo": "hello-world",
  "pullNumber": 42,
  "commentId": 123456,
  "body": "Fixed in the latest commit."
}
```

## Notes

- `pullNumber` is the PR number (e.g. `42`), not the internal node id.
- For approvals use `event: "APPROVE"`; for plain comments use `"COMMENT"`.
- Merge methods must be enabled on the repository (`merge`, `squash`, `rebase`).
