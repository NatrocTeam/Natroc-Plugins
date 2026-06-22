# GitHub MCP Setup & Authentication

## 1. Create a Personal Access Token

The MCP server authenticates with a GitHub PAT passed as
`Authorization: Bearer ${GITHUB_PAT}`.

**Fine-grained PAT (recommended):**

- Repository access: select only the repositories you need.
- Permissions:
  - **Contents**: Read and write (files, commits, branches, releases/tags)
  - **Pull requests**: Read and write
  - **Issues**: Read and write
  - **Actions**: Read (and write if triggering runs)
  - **Metadata**: Read (always required)

**Classic PAT (broad):** the `repo` scope covers most operations; add
`workflow` for Actions and `read:org` for organization data.

## 2. Export the Token

```bash
export GITHUB_PAT="github_pat_xxxxxxxxxxxxxxxxxxxx"
```

> Never hardcode the token in `.mcp.json` or commit it to git. Always use the
> `${GITHUB_PAT}` environment variable expansion.

## 3. Verify the Connection

1. Enable the plugin so the `github` MCP server starts.
2. Run `/mcp` and confirm the `github` server appears.
3. Call `get_me` (`mcp__plugin_github_github__get_me`) - a successful response
   confirms the token is valid and the server is reachable.

## Troubleshooting

| Symptom                                   | Likely Cause / Fix                                                |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `401 Unauthorized`                        | Missing/invalid/expired `GITHUB_PAT`. Regenerate the token.       |
| `403` + secondary rate limit              | Too many requests. Back off and retry later.                      |
| `404` on a private repo                   | PAT lacks access to that repository/resource. Grant access.       |
| Write tools "succeed" but nothing changes | Server is in read-only mode (`GITHUB_READ_ONLY=1`).               |
| Tool not found                            | Wrong name or its toolset isn't enabled. Check `GITHUB_TOOLSETS`. |
| Filtered/empty comments on PR/issue       | Lockdown mode active for untrusted authors.                       |

## Security Notes

- Use the **least-privilege** scope necessary for the task.
- Rotate tokens regularly and revoke unused ones.
- Prefer fine-grained PATs over classic tokens for production use.
