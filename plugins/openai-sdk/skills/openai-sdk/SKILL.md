---
name: openai-sdk
description: This skill should be used when the user asks to build, modify, debug, validate, audit, or review software that uses the OpenAI Client SDK or OpenAI Agents SDK in TypeScript, JavaScript, or Python. It is the self-contained documentation entrypoint for both SDK development and existing-code validation; use the bundled local references and infer implementation choices from the repository before asking the user.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# OpenAI SDK

## Purpose

This is the main entrypoint for agents using this plugin as OpenAI SDK
documentation. It supports two primary use cases:

1. Development documentation for building or modifying software that uses the
   OpenAI Client SDK, OpenAI Agents SDK, or both.
2. Existing-code validation documentation for inspecting, validating, auditing,
   or reviewing code that already uses the OpenAI Client SDK, OpenAI Agents
   SDK, or both.

Route work between the Client SDK and Agents SDK, then read the local references
bundled in this plugin. Do not require repository-local documentation outside
this plugin during normal use.

## Usage Modes

Use development documentation mode when the user asks to build, add, implement,
wire, migrate, modernize, debug, or fix OpenAI SDK behavior. In this mode,
inspect the repository, choose the correct SDK and language, implement the
smallest correct change, and verify it.

Use existing-code validation documentation mode when the user asks to validate,
review, audit, check, harden, release-gate, assess, or confirm correctness of
code already using OpenAI SDK packages. In this mode, inspect code evidence
first, compare the implementation against the bundled references, report
findings ordered by severity, and do not patch code unless requested.

Read `../openai-sdk/references/agent-usage-modes.md` whenever the task mode is
ambiguous, when both development and validation are requested, or when another
agent needs a precise handoff contract.

## Required Workflow

1. Select the usage mode:
   - Development documentation mode for new or modified SDK behavior.
   - Existing-code validation documentation mode for code that already exists.
2. Inspect the project before choosing an SDK:
   - TypeScript/JavaScript: `package.json`, lockfiles, framework files, existing
     `openai` or `@openai/agents` imports.
   - Python: `pyproject.toml`, `requirements*.txt`, lockfiles, framework files,
     existing `openai` or `agents` imports.
   - Runtime boundary: server route, background worker, CLI, browser code,
     mobile app, or sandbox/workspace job.
   - Existing config: API key env names, model env names, base URLs, Azure
     config, retries, timeouts, logging, and test style.
3. Read `../openai-sdk/references/agent-usage-modes.md` and
   `../openai-sdk/references/sdk-selection.md`.
4. Choose the smallest specific skill:
   - `openai-client-sdk` for direct API calls.
   - `openai-agents-sdk` for agent workflows.
   - `openai-sdk-production-review` for audits, hardening, and regression
     checks.
5. Load the required reading set for the current task from the map below.
6. Implement or review using the repository's existing patterns.
7. Verify with the repository's tests, typecheck, lint, or smallest available
   equivalent.

## SDK Decision Rules

Use the Client SDK for:

- Responses API calls.
- Existing Chat Completions integrations.
- Streaming a single request.
- Embeddings, files, images, audio, videos, vector stores, evals, containers,
  conversations, moderation, skills, and admin APIs.
- Webhook verification.
- Realtime API WebSocket flows.
- Azure OpenAI client usage.

Use the Agents SDK for:

- Tool-calling loops.
- Handoffs between specialist agents.
- Agents as tools behind an orchestrator.
- Guardrails.
- Sessions and multi-turn memory.
- Tracing and run observability.
- Human-in-the-loop pause/resume.
- Sandbox agents that inspect or edit a workspace.

Use both when a workflow needs direct platform setup plus an agent loop, such
as uploading files with the Client SDK and then using an Agents SDK workflow to
operate on them.

## Autonomy Rules

Do not ask the user for choices that can be inferred safely:

- Language: follow the target files and existing imports.
- Package manager: follow the lockfile and existing scripts.
- SDK: use the decision rules above.
- API key: wire to environment/config; never ask for the key value.
- Tests: use the existing test framework.
- Model: use existing config/env conventions when present.

Ask only when the user must choose a product policy, model policy, data
retention policy, approval boundary, or when multiple app roots are equally
plausible and editing the wrong one would be risky.

## Non-Negotiable Safety Rules

- Keep API keys server-side.
- Do not enable public browser access with normal API keys.
- Verify webhook signatures against raw request bodies.
- Add request ID logging or propagation for failure paths.
- Use SDK/API structured output features instead of brittle text parsing when
  structured data is required.
- Add explicit tool schemas and descriptions for Agents SDK tools.
- Gate destructive or high-impact tools with approval, permission checks, or
  guardrails.
- Do not invent SDK APIs. If the project version is unclear, inspect installed
  package versions and local type definitions.

## Local Reference Map

Read these local references. Do not send the user to external docs for routine
implementation details.

Core routing:

- `../openai-sdk/references/agent-usage-modes.md` - exact agent contract for
  development documentation mode and existing-code validation documentation
  mode.
- `../openai-sdk/references/sdk-selection.md` - SDK selection, language/runtime
  inference, and no-question rules.
- `../openai-sdk-production-review/references/security-privacy.md` - secrets, privacy, traces, logs,
  multi-tenant isolation, retention.
- `../openai-sdk-production-review/references/failure-modes.md` - debugging matrix for auth, rate limit,
  streaming, webhooks, sessions, handoffs, and sensitive data leaks.

Client SDK:

- `../openai-client-sdk/references/client-sdk-api-surface.md` - Client SDK resource and method
  map across TypeScript and Python.
- `../openai-client-sdk/references/client-sdk-feature-playbook.md` - detailed implementation
  procedures for Responses, structured output, streaming, webhooks, Realtime,
  files, embeddings, media, admin, workload identity.
- `../openai-client-sdk/references/client-sdk-typescript.md` - TypeScript Client SDK patterns.
- `../openai-client-sdk/references/client-sdk-python.md` - Python Client SDK patterns.

Agents SDK:

- `../openai-agents-sdk/references/agents-sdk-api-surface.md` - Agents SDK concepts and API
  surface across TypeScript and Python.
- `../openai-agents-sdk/references/agents-sdk-feature-playbook.md` - implementation procedure
  and pattern selection for agent workflows.
- `../openai-agents-sdk/references/agents-sdk-tools-handoffs-guardrails.md` - deep reference
  for tools, handoffs, guardrails, sessions, tracing.
- `../openai-agents-sdk/references/agents-sdk-typescript.md` - TypeScript Agents SDK patterns.
- `../openai-agents-sdk/references/agents-sdk-python.md` - Python Agents SDK patterns.

Cross-cutting:

- `../openai-sdk/references/framework-recipes.md` - Next.js, Express, FastAPI, Flask,
  worker, CLI, edge, browser recipes.
- `../openai-sdk/references/migration-and-modernization.md` - Chat Completions to
  Responses, Client SDK to Agents SDK, SDK upgrades, Azure migrations.
- `../openai-sdk-production-review/references/production-checklist.md` - production hardening checklist.
- `../openai-sdk-production-review/references/testing-patterns.md` - local testing strategies.

## Required Reading By Task

- Direct generation, streaming, files, webhooks, Realtime, or Azure:
  `agent-usage-modes.md`, `sdk-selection.md`, `client-sdk-api-surface.md`,
  `client-sdk-feature-playbook.md`, one language-specific Client SDK reference,
  `security-privacy.md`, `testing-patterns.md`.
- Agent tools, handoffs, guardrails, sessions, tracing, sandbox, or HITL:
  `agent-usage-modes.md`, `sdk-selection.md`, `agents-sdk-api-surface.md`,
  `agents-sdk-feature-playbook.md`,
  `agents-sdk-tools-handoffs-guardrails.md`, one language-specific Agents SDK
  reference, `security-privacy.md`, `testing-patterns.md`.
- Framework implementation:
  relevant SDK playbook plus `framework-recipes.md`.
- Migration:
  `migration-and-modernization.md`, old/new SDK references, and
  `testing-patterns.md`.
- Production review:
  `agent-usage-modes.md`, `production-checklist.md`, `failure-modes.md`,
  `security-privacy.md`, and the relevant SDK API/playbook references.

## Output Standard

For implementation work, report:

- Files changed.
- SDK surface used and why.
- Secret/config assumptions.
- Verification run and result.
- Any remaining production follow-up.

For review work, lead with findings. Include file paths, impact, evidence, and
specific fixes. If no issue is found, say that clearly and name any test gaps.
