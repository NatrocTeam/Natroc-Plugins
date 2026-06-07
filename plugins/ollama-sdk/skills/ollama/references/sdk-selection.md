# Client And Runtime Selection

Use this reference to decide which Ollama surface owns a task.

## Client Integration

Use client integration when the task concerns app code that sends requests to
Ollama:

- `chat` for conversational message history, tool calls, and multi-turn flows.
- `generate` for single-prompt generation, fill-in-middle, raw prompting,
  multimodal generate, and image generation parameters.
- `embed` for embeddings.
- `webSearch`/`web_search` and `webFetch`/`web_fetch` for cloud web APIs.
- Streaming for chat/generate or pull/create progress.
- Structured output and JSON schema validation.
- TypeScript import, browser import, Python `Client`, or Python `AsyncClient`.

## Runtime And Model Lifecycle

Use runtime docs when the task concerns the Ollama daemon, host, model inventory,
or cloud access:

- Local daemon availability.
- `host`, `OLLAMA_HOST`, explicit remote host, direct cloud host.
- Model pull, push, create, create blob, copy, delete, list, show, ps, version.
- Model preflight, warmup, or missing model behavior.
- Cloud model offload via local Ollama after sign-in/pull.
- Direct cloud API access with bearer headers.
- Daemon exposure and network boundary review.

## TypeScript vs Python

Use TypeScript/JavaScript when the repo has:

- `package.json` with `ollama` dependency.
- `.ts`, `.tsx`, `.js`, `.mjs`, or `.cjs` code importing `ollama`.
- Node, browser, edge, worker, or frontend code.

Use Python when the repo has:

- `pyproject.toml`, `requirements*.txt`, `uv.lock`, or `poetry.lock` with
  `ollama`.
- Python code importing `ollama`, `Client`, `AsyncClient`, `chat`, `generate`,
  or `embed`.
- FastAPI, Flask, Django, Celery, scripts, notebooks, or worker code.

## Sync vs Async Python

Use `Client` or module-level functions in synchronous code.

Use `AsyncClient` in async frameworks and jobs:

- FastAPI async routes.
- Async workers.
- Async CLIs.
- Any code already using `async def` and `await`.

Do not call sync `Client` methods directly inside high-throughput async routes
unless the app intentionally runs them in a threadpool.

## Node vs Browser TypeScript

Use the default `ollama` import in Node or server-side TypeScript:

```ts
import ollama from "ollama";
import { Ollama } from "ollama";
```

Use `ollama/browser` only for browser usage:

```ts
import ollama from "ollama/browser";
```

Do not include direct cloud API bearer tokens in browser code. Browser local
daemon access also requires a deliberate runtime and network policy.

## No-Question Defaults

Use these defaults when no project-specific convention exists:

- Host: local-only `http://127.0.0.1:11434`.
- Model config variable: follow existing config; otherwise use a clearly named
  config/env hook such as `OLLAMA_MODEL`.
- Cloud API key variable: `OLLAMA_API_KEY`, server-side only.
- Structured output: pass a JSON schema, parse the string, and validate it.
- Tests: mock the client or HTTP layer; gate live Ollama tests behind an env
  var.

Ask the user before:

- Switching a local-only flow to direct cloud API.
- Exposing a local daemon remotely.
- Pulling or deleting models automatically.
- Choosing a model where no convention exists and the choice changes product
  behavior.
