# Commit Flow Recipes

All tools are called as `mcp__plugin_github_github__<tool_name>`. Examples
show the short name and JSON arguments.

## Recipe 1 - New Branch + Single Commit

1. Create the branch from a base branch:

```json
// create_branch
{
  "owner": "octocat",
  "repo": "hello-world",
  "branch": "feature/badge",
  "from_branch": "main"
}
```

2. Commit a file to it:

```json
// create_or_update_file
{
  "owner": "octocat",
  "repo": "hello-world",
  "path": "README.md",
  "message": "docs: add CI badge",
  "content": "# Hello World\n\n![CI](https://example.com/badge.svg)\n",
  "branch": "feature/badge"
}
```

> No `sha` is required here only if `README.md` does not yet exist on the new
> branch. If it does, read it first and pass its `sha`.

## Recipe 2 - Multi-File Atomic Commit

```json
// push_files
{
  "owner": "octocat",
  "repo": "hello-world",
  "branch": "feature/api",
  "message": "feat(api): add user endpoints and tests",
  "files": [
    {
      "path": "src/api/users.ts",
      "content": "export const listUsers = () => {}\n"
    },
    {
      "path": "src/api/users.test.ts",
      "content": "test('listUsers', () => {})\n"
    },
    { "path": "docs/api/users.md", "content": "# Users API\n" }
  ]
}
```

## Recipe 3 - Update an Existing File Safely

1. Read for the current `sha`:

```json
// get_file_contents
{
  "owner": "octocat",
  "repo": "hello-world",
  "path": "package.json",
  "ref": "main"
}
```

2. Commit the edit with that `sha`:

```json
// create_or_update_file
{
  "owner": "octocat",
  "repo": "hello-world",
  "path": "package.json",
  "message": "chore: bump version to 1.2.0",
  "content": "{\n  \"name\": \"hello-world\",\n  \"version\": \"1.2.0\"\n}\n",
  "branch": "main",
  "sha": "PASTE_SHA_FROM_STEP_1"
}
```

## Recipe 4 - Delete a File

```json
// delete_file
{
  "owner": "octocat",
  "repo": "hello-world",
  "path": "legacy/old-config.yml",
  "message": "chore: remove deprecated config",
  "branch": "main"
}
```

## Recipe 5 - Inspect Recent History

```json
// list_commits
{ "owner": "octocat", "repo": "hello-world", "sha": "main", "perPage": 10 }
```

```json
// get_commit
{
  "owner": "octocat",
  "repo": "hello-world",
  "sha": "7638417db6d59f3c431d3e1f261cc637155684cd"
}
```

## Conventional Commit Cheat Sheet

| Type       | When to use                     |
| ---------- | ------------------------------- |
| `feat`     | A new feature                   |
| `fix`      | A bug fix                       |
| `docs`     | Documentation only              |
| `refactor` | Code change, no behavior change |
| `test`     | Adding/fixing tests             |
| `chore`    | Tooling, deps, housekeeping     |
| `perf`     | Performance improvement         |
| `ci`       | CI/CD configuration             |
