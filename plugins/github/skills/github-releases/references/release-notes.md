# Release Notes - Template & Publish Flow

All tools are called as `mcp__plugin_github_github__<tool_name>`.

## Gathering Inputs

1. Get the previous release tag:

```json
// get_latest_release
{ "owner": "octocat", "repo": "hello-world" }
```

2. Resolve the tag's commit:

```json
// get_tag
{ "owner": "octocat", "repo": "hello-world", "tag": "v1.2.0" }
```

3. List commits on the release branch to find everything since that tag:

```json
// list_commits
{ "owner": "octocat", "repo": "hello-world", "sha": "main", "perPage": 100 }
```

Stop collecting once you reach the commit the previous tag points to.

## Release Notes Template

Group commits by Conventional Commit type:

```markdown
## v1.3.0 - 2026-06-22

### ✨ Features

- feat(api): add pagination to user listing (#51)

### 🐛 Fixes

- fix(auth): handle expired token refresh (#54)

### 📚 Documentation

- docs: expand onboarding guide (#42)

### 🔧 Maintenance

- chore(deps): bump dependencies (#56)

**Full Changelog**: https://github.com/octocat/hello-world/compare/v1.2.0...v1.3.0
```

## Publishing the Notes

The MCP `repos` toolset reads releases but does not create release entries.
Two supported paths:

### Path A - Commit a CHANGELOG (via the `github-commit` skill)

1. Read existing `CHANGELOG.md` for its `sha` (`get_file_contents`).
2. Prepend the new section and commit (`create_or_update_file`).
3. Optionally create the version tag branch/commit reference.

### Path B - Formal GitHub Release

Use the GitHub web UI or REST API (`POST /repos/{owner}/{repo}/releases`) to
publish a release tied to the tag, pasting the generated notes as the body.

## Verifying

After publishing, confirm the release exists:

```json
// get_release_by_tag
{ "owner": "octocat", "repo": "hello-world", "tag": "v1.3.0" }
```

## Versioning Reminder (SemVer)

| Bump  | When                                           |
| ----- | ---------------------------------------------- |
| MAJOR | Breaking changes (`feat!` / `BREAKING CHANGE`) |
| MINOR | New backward-compatible features (`feat`)      |
| PATCH | Backward-compatible bug fixes (`fix`)          |
