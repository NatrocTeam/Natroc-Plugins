# SDK Selection

Use this reference before editing code. The goal is to choose the smallest
OpenAI SDK surface that solves the user's task without asking avoidable
questions.

## First Inspection

Inspect the repository before choosing an SDK:

- `package.json`, lockfiles, framework config, and existing imports for
  TypeScript or JavaScript projects.
- `pyproject.toml`, `requirements*.txt`, `uv.lock`, `poetry.lock`, and existing
  imports for Python projects.
- Existing environment naming such as `OPENAI_API_KEY`, `OPENAI_MODEL`,
  `AZURE_OPENAI_ENDPOINT`, project-specific config modules, or secret managers.
- Test stack and mocking style.
- Server/client boundaries. Never put a normal OpenAI API key in public browser
  code, mobile bundles, or static frontend assets.

## Choose The Client SDK When

Use the OpenAI Client SDK when the task is a direct API integration:

- Generate text or structured output with the Responses API.
- Maintain an existing Chat Completions integration.
- Stream model output from one request.
- Send multimodal input such as text plus images.
- Use embeddings, files, images, audio, videos, moderation, evals, vector
  stores, containers, conversations, skills, or admin APIs.
- Verify webhooks.
- Use Realtime API WebSocket sessions directly.
- Integrate Azure OpenAI through the SDK's Azure client.
- Build a thin server route, job worker, CLI, or background task that owns its
  own request loop.

Packages:

- TypeScript/JavaScript: `openai`
- Python: `openai`

## Choose The Agents SDK When

Use the OpenAI Agents SDK when the task is an agent workflow rather than one API
call:

- The model should call local functions or external tools.
- A manager agent should invoke specialist agents as tools.
- A triage agent should hand off the conversation to another agent.
- The workflow needs guardrails for input, output, or tool calls.
- The app needs session-backed memory, server-managed conversation state,
  tracing, or resumable human approval.
- The agent should run against files in an isolated workspace or sandbox.
- The app needs structured final outputs from an agent loop.

Packages:

- TypeScript/JavaScript: `@openai/agents` plus `zod`
- Python: `openai-agents`

## When Both Apply

It is common to use both:

- Use the Client SDK for direct platform resources such as file upload, webhook
  parsing, conversations, or vector store setup.
- Use the Agents SDK for the interactive workflow that consumes those resources.
- Keep client construction centralized so API key, base URL, organization,
  project, retries, timeouts, and logging are consistent.

## Language Decision

Use the language already dominant in the touched area:

- If the request targets a Node, Next.js, Express, Vite, Deno, Bun, or
  Cloudflare Worker code path, use TypeScript/JavaScript.
- If the request targets FastAPI, Flask, Django, Celery, a Python CLI, or data
  processing code, use Python.
- If both exist, follow the files the user mentioned or the app boundary the
  feature belongs to.
- If language cannot be inferred and both stacks are present, prefer the stack
  where OpenAI is already imported.

## Ask Only When Required

Do not ask for:

- SDK choice when the project/request clearly implies it.
- Install command choice when the package manager is obvious.
- Model name when the project already has a config/env pattern.
- API key value. Wire the code to environment or existing secret config.
- Whether to add basic error handling, timeouts, and tests.

Ask a concise question only when:

- The user must choose a business policy, permission model, data retention
  policy, or approval boundary.
- Multiple app roots are equally plausible and editing the wrong one would be
  risky.
- No model/config convention exists and the implementation cannot be made
  configurable without changing product behavior.

## Default Implementation Rules

- Prefer the Responses API for new model generation flows unless maintaining an
  existing Chat Completions path.
- Keep API keys server-side. Do not enable browser-side Client SDK use for
  public apps.
- Read API key and model from environment or the project's config system.
- Use streaming only when the UI, CLI, or transport consumes incremental events.
- Log request IDs on failures and include them in error telemetry.
- Configure timeouts and rely on SDK retries unless the app already has a retry
  policy.
- Verify webhook signatures against the raw request body before parsing JSON.
- Do not swallow SDK exceptions. Convert them into app-level errors with useful
  status codes or retry behavior.
- Add tests around request shape, streamed event handling, webhook verification,
  tool behavior, and failure paths.

## Quick Decision Matrix

| Requirement                        | SDK                                                   |
| ---------------------------------- | ----------------------------------------------------- |
| One prompt in, one response out    | Client SDK                                            |
| JSON extraction from one prompt    | Client SDK Responses API                              |
| Streaming text from one request    | Client SDK                                            |
| Function tools with an agent loop  | Agents SDK                                            |
| Handoffs between specialists       | Agents SDK                                            |
| Server-managed conversation state  | Either; Agents SDK when tool loop is needed           |
| Webhook verification               | Client SDK                                            |
| Realtime text/audio WebSocket      | Client SDK direct, Agents SDK for realtime agents     |
| File search/vector store setup     | Client SDK setup, Agents SDK agent usage when agentic |
| Workspace/file editing by an agent | Agents SDK sandbox agent                              |
