---
name: ollama-runtime
description: This skill should be used when implementing, debugging, validating, auditing, or reviewing Ollama runtime behavior, including local daemon access, OLLAMA_HOST, model pull/push/create/copy/delete/list/show/ps/version, model availability, model warmup, cloud models, direct cloud API host configuration, web search, web fetch, and deployment boundaries.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# Ollama Runtime

## Purpose

Use this skill as Ollama runtime documentation for both development and
validation work. Apply it to daemon, host, model lifecycle, cloud, and
operational behavior.

Use `ollama-client` instead when the task is mainly request construction for
chat, generate, embeddings, tools, structured output, or streaming content.

## Start Here

1. Inspect project deployment and runtime boundaries.
2. Read `../ollama/references/agent-usage-modes.md`.
3. Read `../ollama-runtime/references/runtime-and-models.md`.
4. Read `../ollama-runtime/references/cloud-and-web-apis.md` for cloud models, cloud API,
   web search, or web fetch.
5. Read `../ollama-production-review/references/security-privacy.md` before changing host exposure,
   headers, cloud credentials, or model lifecycle automation.
6. Read `../ollama-production-review/references/failure-modes.md` for connection, model, and stream
   diagnostics.
7. Read `../ollama-production-review/references/testing-patterns.md` before adding tests.
8. Read language references when runtime code uses a client:
   - `../ollama-client/references/typescript-client.md`
   - `../ollama-client/references/python-client.md`

## Runtime Rules

- Default local host behavior is `http://127.0.0.1:11434`.
- `OLLAMA_HOST` can control Python client default host behavior. TypeScript
  code should use explicit config or project config conventions.
- Do not expose a daemon to a remote network without explicit intent and
  security review.
- Do not pull large models inside hot request paths unless product behavior
  explicitly requires it.
- Treat `pull`, `push`, `create`, `delete`, and `copy` as operational actions,
  not normal per-request behavior.
- Use `list`/`show`/`ps` for preflight, status pages, diagnostics, and runtime
  validation.
- Use `create_blob` in Python when custom model creation needs local GGUF/blob
  upload behavior.
- Remember that TypeScript `create` does not support local `files`, and Node
  `create` rejects local path usage through `from`.
- Keep direct cloud API bearer headers server-side.

## Development and Validation Duties

In development mode, add runtime behavior deliberately: host config, model
preflight, model lifecycle command, progress streaming, cloud API client, or
diagnostic endpoint. Verify with mocked tests or gated live checks.

In validation mode, check whether existing code assumes a local daemon in
production, exposes unsafe hosts, pulls models per request, deletes/copies
models without explicit intent, hides connection failures, or leaks cloud API
keys.

## Runtime Checklist

- Which host will be used in local dev, CI, staging, and production?
- Does the code use local daemon, remote daemon, cloud via local Ollama, or
  direct cloud API?
- What happens when the daemon is down?
- What happens when the configured model is missing?
- Is model pulling explicit and safe?
- Are cloud API keys kept out of public clients?
- Are long-running lifecycle operations streamed or run in background jobs?
- Are destructive operations protected by permissions?
- Are tests deterministic without requiring local models?

## Output Standard

Report runtime type, host/model assumptions, files changed, operational safety
decisions, and verification result.
