# Security and Privacy

Use this reference for every Anthropic SDK implementation or review.

## Secrets

Protect:

- `ANTHROPIC_API_KEY`.
- provider credentials.
- API keys for tools called by Claude.
- MCP server credentials.
- session store credentials.
- database credentials used by tools.

Rules:

- read secrets from environment/config.
- never hardcode secrets.
- never ask the user to paste secrets into chat.
- never expose secrets in browser/client bundles.
- redact secrets from logs and errors.
- avoid storing secrets in prompts, transcripts, memory stores, files, or batch
  metadata.

## Browser Boundary

Direct Client SDK calls with privileged API keys belong on trusted server-side
boundaries. Browser/client code should call an application backend that enforces
auth, rate limits, tenant scoping, and prompt/content policy.

Review for:

- `NEXT_PUBLIC_` or similar exposed env variables.
- client components importing SDK packages.
- frontend code calling Claude API directly.
- mobile binaries containing API keys.

## Data Minimization

Send only required data to Claude:

- remove unnecessary secrets.
- summarize or redact logs.
- avoid sending full files when snippets are enough.
- strip PII unless needed and permitted.
- avoid sending tenant data across boundaries.

## Logging

Safe logs:

- SDK surface name.
- sanitized request ID.
- model name.
- latency.
- status category.
- token counts.
- retry count.
- sanitized error class.

Avoid logging:

- full prompts.
- full responses.
- tool inputs/results.
- uploaded file content.
- session transcripts.
- API keys.
- provider credentials.
- raw webhook bodies before redaction.

## Tool Execution

Tools are a major risk boundary.

Client SDK tool rules:

- define strict schemas.
- validate input server-side.
- authorize tool actions.
- bound output size.
- use structured errors.
- isolate destructive operations.

Agent SDK tool rules:

- set `cwd`.
- limit turns.
- separate auto-approval from blocking.
- use `disallowed_tools` for blocked tools.
- use hooks/permission callbacks for dynamic decisions.
- sandbox shell/file execution where possible.
- audit sanitized tool metadata.

## Shell and File Access

Treat shell/file tools as high risk:

- `Bash`.
- `Write`.
- `Edit`.
- text editor/code execution tools.
- custom command tools.

Hosted products require:

- tenant-isolated workspace.
- path allowlist.
- command allowlist or denylist.
- sandboxing.
- user approval for destructive actions.
- timeout and output limits.
- cleanup after job completion.

## Web Search and Web Fetch

Web content is untrusted. It can contain prompt injection or malicious
instructions.

Rules:

- do not let web content override system/developer instructions.
- do not route web content into destructive tools without policy checks.
- cite or store sources according to product policy.
- treat external data as tainted.

## Sessions and Transcripts

Agent SDK sessions can contain:

- prompts.
- code snippets.
- tool inputs/results.
- file contents.
- command outputs.
- user data.

Rules:

- scope transcripts by tenant/project/user.
- define retention.
- support deletion where policy requires it.
- encrypt at rest when storing sensitive content.
- avoid cross-tenant resume.
- validate resume IDs.
- avoid logging transcript entries.

## MCP Servers

MCP servers can expose powerful tools and secrets.

Review:

- server command/URL is trusted.
- environment variables are necessary and scoped.
- tool names are expected.
- startup failure is handled.
- untrusted project MCP config is not inherited in hosted products.
- server output is treated as untrusted.

## Provider Variants

Cloud provider variants add provider IAM/service account risk.

Rules:

- use least privilege.
- scope region/project/account.
- avoid shared credentials across tenants.
- monitor quota and rate limits.
- do not assume provider errors are safe to expose.
