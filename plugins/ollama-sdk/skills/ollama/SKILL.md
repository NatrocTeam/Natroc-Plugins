---
name: ollama
description: This skill should be used when the user asks to build, modify, debug, validate, audit, or review software that uses Ollama in TypeScript, JavaScript, or Python. It is the self-contained documentation entrypoint for Ollama development and existing-code validation, including local daemon, cloud API, chat, generate, streaming, tools, structured outputs, embeddings, model lifecycle, and production review.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# Ollama

## Purpose

Use this skill as the main entrypoint for agents using this plugin as Ollama
documentation. It supports two primary use cases:

1. Development documentation for building or modifying software that uses the
   official Ollama TypeScript or Python client.
2. Existing-code validation documentation for inspecting, validating, auditing,
   or reviewing code that already uses the official Ollama clients.

Route work between client integration, runtime/model lifecycle, and production
review, then read the local references bundled in this plugin. Do not require
repository-local documentation outside this plugin during normal use.

## Usage Modes

Use development documentation mode when the user asks to build, add, implement,
wire, migrate, modernize, debug, or fix Ollama behavior. In this mode, inspect
the repository, choose the correct language/runtime surface, implement the
smallest correct change, and verify it.

Use existing-code validation documentation mode when the user asks to validate,
review, audit, check, harden, release-gate, assess, or confirm correctness of
code already using Ollama packages. In this mode, inspect code evidence first,
compare the implementation against the bundled references, report findings
ordered by severity, and do not patch code unless requested.

Read `../ollama/references/agent-usage-modes.md` whenever the task mode is
ambiguous, when both development and validation are requested, or when another
agent needs a precise handoff contract.

## Required Workflow

1. Select the usage mode:
   - Development documentation mode for new or modified Ollama behavior.
   - Existing-code validation documentation mode for code that already exists.
2. Inspect the project before choosing an implementation:
   - TypeScript/JavaScript: `package.json`, lockfiles, framework files,
     existing `ollama` imports, Node/browser/edge runtime.
   - Python: `pyproject.toml`, `requirements*.txt`, lockfiles, framework files,
     existing `ollama` imports, sync/async framework style.
   - Runtime boundary: local daemon, remote daemon, direct cloud API, server
     route, background worker, CLI, browser code, or edge runtime.
   - Existing config: `OLLAMA_HOST`, `OLLAMA_API_KEY`, model env names, headers,
     timeouts, logging, and test style.
3. Read `../ollama/references/agent-usage-modes.md` and
   `../ollama/references/sdk-selection.md`.
4. Choose the smallest specific skill:
   - `ollama-client` for TypeScript/Python client code.
   - `ollama-runtime` for daemon, host, cloud, and model lifecycle work.
   - `ollama-production-review` for audits, hardening, and regression checks.
5. Load the required reading set for the current task from the map below.
6. Implement or review using the repository's existing patterns.
7. Verify with the repository's tests, typecheck, lint, or smallest available
   equivalent.

## Surface Decision Rules

Use client integration docs for:

- `chat` and `generate`.
- Streaming chat/generate output.
- Structured output with JSON format or JSON schema.
- Tool calls and function-tool loops.
- Thinking mode, logprobs, and top logprobs.
- Multimodal image input.
- Image generation request parameters.
- Embeddings through `embed`.
- Browser import behavior and Python async clients.
- Web search/fetch client calls.

Use runtime docs for:

- Local daemon availability and connection failures.
- `host` and `OLLAMA_HOST`.
- Model lifecycle: `pull`, `push`, `create`, `create_blob`, `copy`, `delete`,
  `list`, `show`, `ps`, `version`.
- Local cloud-model offload after sign-in/pull.
- Direct cloud API host and bearer headers.
- Model warmup, cold starts, model deletion, and remote daemon exposure.

Use production review docs for:

- Existing code validation.
- Security review.
- Streaming/cancellation review.
- Tool safety review.
- Structured output parsing review.
- Runtime and model lifecycle review.
- Test coverage review.

## Autonomy Rules

Do not ask the user for choices that can be inferred safely:

- Language: follow target files and existing imports.
- Package manager: follow lockfile and scripts.
- Client package: use `ollama` for TypeScript/JavaScript/Python official client
  code when requested or already present.
- Host: use existing config; otherwise default to local-only client behavior.
- API key: wire cloud API credentials to environment/config; never ask for the
  key value.
- Tests: use the existing test framework.
- Model: use existing config/env conventions when present.

Ask only when the user must choose a product policy, model policy, remote host,
cloud-vs-local policy, data exposure boundary, or when multiple app roots are
equally plausible and editing the wrong one would be risky.

## Non-Negotiable Safety Rules

- Keep `OLLAMA_API_KEY` and direct cloud API bearer tokens server-side.
- Do not put cloud API keys in public browser bundles.
- Do not expose a local Ollama daemon on a network interface unless explicitly
  intended and reviewed.
- Validate tool-call names and arguments before executing application
  functions.
- Treat model output as untrusted data; parse and validate structured output.
- Do not run automatic model pulls in hot request paths unless explicitly
  intended.
- Do not delete or push models without an explicit user or product action.
- Do not invent client APIs. Inspect installed package versions and local type
  definitions when project version is unclear.

## Local Reference Map

Core routing:

- `../ollama/references/agent-usage-modes.md` - exact agent contract for
  development documentation mode and existing-code validation documentation
  mode.
- `../ollama/references/sdk-selection.md` - client/runtime selection,
  language/runtime inference, and no-question rules.
- `../ollama-production-review/references/security-privacy.md` - cloud API keys, local daemon
  exposure, browser boundaries, tool safety, logs, and privacy.
- `../ollama-production-review/references/failure-modes.md` - debugging matrix for connection,
  missing models, streaming, tools, structured output, and cloud API failures.

Client SDK:

- `../ollama-client/references/api-surface.md` - Ollama TypeScript/Python method and
  endpoint map.
- `../ollama-client/references/client-feature-playbook.md` - implementation procedures for
  chat, generate, streaming, embeddings, images, thinking, logprobs, and
  lifecycle calls.
- `../ollama-client/references/typescript-client.md` - TypeScript/JavaScript client
  patterns.
- `../ollama-client/references/python-client.md` - Python sync and async client patterns.
- `../ollama-client/references/tools-and-structured-outputs.md` - tool schemas,
  function-call loops, JSON format, schemas, and validation.

Runtime and production:

- `../ollama-runtime/references/runtime-and-models.md` - local daemon, host parsing, model
  lifecycle, model warmup, and runtime operations.
- `../ollama-runtime/references/cloud-and-web-apis.md` - cloud models, direct cloud API,
  web search, web fetch, and bearer headers.
- `../ollama-production-review/references/testing-patterns.md` - deterministic testing strategies.
- `../ollama-production-review/references/production-checklist.md` - production hardening checklist.

## Required Reading By Task

- Chat, generate, streaming, structured outputs, tools, images, embeddings, or
  logprobs: `agent-usage-modes.md`, `sdk-selection.md`, `api-surface.md`,
  `client-feature-playbook.md`, one language-specific client reference,
  `tools-and-structured-outputs.md`, `security-privacy.md`, and
  `testing-patterns.md`.
- Daemon, host, model availability, pull/create/delete/copy/show/list/ps, or
  cloud model behavior: `agent-usage-modes.md`, `runtime-and-models.md`,
  `cloud-and-web-apis.md`, `security-privacy.md`, `failure-modes.md`, and
  `testing-patterns.md`.
- Existing-code validation: `agent-usage-modes.md`,
  `production-checklist.md`, `failure-modes.md`, `security-privacy.md`, and
  the relevant API/language/runtime references.

## Output Standard

For implementation work, report:

- Files changed.
- Client/runtime surface used and why.
- Host/model/API-key assumptions.
- Verification run and result.
- Any remaining production follow-up.

For review work, lead with findings. Include file paths, impact, evidence, and
specific fixes. If no issue is found, say that clearly and name any test gaps.
