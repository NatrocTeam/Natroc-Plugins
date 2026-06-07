# SDK Selection

Use this reference to choose between the Anthropic Client SDK and Claude Agent
SDK without asking the user.

## Package Map

| Purpose                         | TypeScript/JavaScript            | Python             | Baseline runtime          |
| ------------------------------- | -------------------------------- | ------------------ | ------------------------- |
| Direct Claude API calls         | `@anthropic-ai/sdk`              | `anthropic`        | Node.js 18+, Python 3.9+  |
| Programmatic Claude Code agents | `@anthropic-ai/claude-agent-sdk` | `claude-agent-sdk` | Node.js 18+, Python 3.10+ |

## Choose the Client SDK When

Use the Client SDK when the app needs direct API access:

- Generate text with Messages API.
- Stream one model response.
- Count tokens before a request.
- Use message batches.
- List or retrieve models.
- Send images, PDFs, documents, text blocks, citations, or mixed content.
- Use structured output helpers.
- Run a model tool loop through Messages API.
- Use server tools such as web search, web fetch, code execution, text editor,
  memory/search tools, or beta server tools.
- Call Anthropic through a provider-specific package/client such as Bedrock,
  Vertex AI, AWS, Azure, or Foundry.
- Build backend wrappers for an app route or service.

Client SDK code generally has this shape:

```text
application code -> Anthropic client -> Claude API -> application response
```

## Choose the Claude Agent SDK When

Use the Claude Agent SDK when the app needs Claude Code-style behavior:

- Inspect a codebase.
- Edit files.
- Run commands.
- Use built-in Claude Code tools.
- Attach custom tools or MCP servers.
- Apply hooks before/after tool use.
- Maintain multi-turn agent sessions.
- Resume, fork, mirror, or store session transcripts.
- Run an autonomous workspace workflow.
- Build an internal coding agent, review bot, migration bot, repair bot, or
  local development assistant.

Agent SDK code generally has this shape:

```text
application code -> Agent SDK subprocess/session -> Claude Code capabilities -> workspace effects
```

## Use Both When

Use both SDKs when the workflow has two distinct layers:

- Client SDK prepares, summarizes, or classifies input, then Agent SDK executes
  workspace tasks.
- Client SDK handles user-facing chat, then Agent SDK runs background
  remediation.
- Client SDK handles direct platform resources, while Agent SDK handles codebase
  editing or shell/file work.

Keep the boundaries clear. Do not wrap every direct API call in Agent SDK just
because tools exist; use Agent SDK only when the agent loop itself is needed.

## Language Selection

Select TypeScript/JavaScript when:

- the target app uses `package.json`.
- existing server code is `.ts`, `.tsx`, `.js`, or `.mjs`.
- the repository already imports `@anthropic-ai/sdk` or
  `@anthropic-ai/claude-agent-sdk`.
- the integration belongs in a Node.js route, worker, CLI, server action, or
  backend service.

Select Python when:

- the target app uses `pyproject.toml`, `requirements.txt`, Poetry, uv, pip, or
  Python package metadata.
- existing server code is `.py`.
- the repository already imports `anthropic` or `claude_agent_sdk`.
- the integration belongs in FastAPI, Flask, Django, Celery, a Python CLI, a
  notebook-adjacent workflow, or a Python worker.

If both languages exist, inspect the requested feature path. For example, a
Next.js route should use TypeScript even if the repository also has Python
scripts.

## Runtime Boundary Selection

Direct Client SDK requests belong in:

- backend route handlers.
- server actions that do not bundle secrets into clients.
- workers and jobs.
- CLI tools.
- trusted desktop processes.

They do not belong in:

- browser/client components.
- mobile app binaries containing API keys.
- public static scripts.
- untrusted plugins where users can read bundled secrets.

Agent SDK workflows belong in trusted processes that can intentionally grant
workspace permissions:

- local developer tools.
- internal automation workers.
- CI jobs with bounded credentials.
- hosted products with explicit sandbox and approval policy.

Do not run Agent SDK with broad file/shell access in a multi-tenant hosted
product without tenant isolation, sandboxing, and transcript/log retention
policy.

## Model Selection

Use existing model config when present. Common environment variable names:

- `ANTHROPIC_MODEL`
- `CLAUDE_MODEL`
- framework-specific config objects.

When no model config exists, pick a reasonable default only if the user did not
request a specific model and the codebase convention permits defaults. Prefer
making model configurable rather than hardcoding a single model in application
logic.

## Secret Selection

Use `ANTHROPIC_API_KEY` for direct Anthropic API access unless the repository
already has a different convention.

Provider variants may use provider credentials instead of `ANTHROPIC_API_KEY`:

- AWS credentials/region for Bedrock or AWS packages.
- Google credentials/project/region for Vertex AI.
- Azure endpoint/key or identity for Azure variants.
- Foundry-specific config for Foundry variants.

Never ask the user to paste a key into chat. Wire code to environment/config.

## Package Installation Decisions

Follow the repository package manager:

- `pnpm` if `pnpm-lock.yaml` exists.
- `yarn` if `yarn.lock` exists and no stronger local convention exists.
- `npm` if `package-lock.json` exists or no lockfile exists.
- `uv` if `uv.lock` or `pyproject.toml` with uv conventions exists.
- Poetry if `poetry.lock` exists.
- pip/requirements if `requirements.txt` is the convention.

Do not add duplicate SDK packages if one already exists. Update code to use the
installed package shape unless the user asked for an upgrade.

## Fast Decision Matrix

| User asks for                   | Use                         | Notes                                                               |
| ------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| "generate a response"           | Client SDK                  | `messages.create`                                                   |
| "stream chat tokens"            | Client SDK                  | `messages.stream` or streaming create                               |
| "return JSON"                   | Client SDK                  | structured output helpers or tool schema                            |
| "let Claude call my function"   | Client SDK or Agent SDK     | Client SDK for model tool loop; Agent SDK for workspace agent tools |
| "read/edit files and run tests" | Agent SDK                   | configure `cwd`, permissions, tools, sandbox                        |
| "build a coding agent"          | Agent SDK                   | use `query()` or `ClaudeSDKClient`                                  |
| "audit this SDK code"           | Review skill                | existing-code validation mode                                       |
| "Bedrock/Vertex/Azure"          | Client SDK provider variant | check feature support differences                                   |
