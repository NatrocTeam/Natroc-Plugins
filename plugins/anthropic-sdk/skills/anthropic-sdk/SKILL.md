---
name: anthropic-sdk
description: This skill should be used when the user asks to build, modify, debug, validate, audit, or review software that uses the Anthropic Client SDK or Claude Agent SDK in TypeScript, JavaScript, or Python. It is the self-contained documentation entrypoint for both SDK development and existing-code validation; use the bundled local references and infer implementation choices from the repository before asking the user.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# Anthropic SDK

## Purpose

Use this skill as the main entrypoint for Anthropic SDK documentation inside
this plugin. Support two primary use cases:

1. Development documentation for building or modifying software that uses the
   Anthropic Client SDK, Claude Agent SDK, or both.
2. Existing-code validation documentation for inspecting, validating, auditing,
   or reviewing code that already uses the Anthropic Client SDK, Claude Agent
   SDK, or both.

Route work between the Client SDK and Claude Agent SDK, then read the local
references bundled in this plugin. Do not require repository-local
documentation outside this plugin during normal use.

## Usage Modes

Use development documentation mode when the user asks to build, add, implement,
wire, migrate, modernize, debug, or fix Anthropic SDK behavior. In this mode,
inspect the repository, choose the correct SDK and language, implement the
smallest correct change, and verify it.

Use existing-code validation documentation mode when the user asks to validate,
review, audit, check, harden, release-gate, assess, or confirm correctness of
code already using Anthropic SDK packages. In this mode, inspect code evidence
first, compare the implementation against the bundled references, report
findings ordered by severity, and do not patch code unless requested.

Read `../anthropic-sdk/references/agent-usage-modes.md` whenever the task mode is
ambiguous, when both development and validation are requested, or when another
agent needs a precise handoff contract.

## Required Workflow

1. Select the usage mode:
   - Development documentation mode for new or modified SDK behavior.
   - Existing-code validation documentation mode for code that already exists.
2. Inspect the project before choosing an SDK:
   - TypeScript/JavaScript: `package.json`, lockfiles, framework files, existing
     `@anthropic-ai/sdk` or `@anthropic-ai/claude-agent-sdk` imports.
   - Python: `pyproject.toml`, `requirements*.txt`, lockfiles, framework files,
     existing `anthropic` or `claude_agent_sdk` imports.
   - Runtime boundary: server route, background worker, CLI, desktop process,
     hosted product, browser code, or workspace job.
   - Existing config: API key env names, model env names, provider credentials,
     base URLs, retries, timeouts, logging, and test style.
3. Read `../anthropic-sdk/references/agent-usage-modes.md` and
   `../anthropic-sdk/references/sdk-selection.md`.
4. Choose the smallest specific skill:
   - `anthropic-client-sdk` for direct Claude API calls.
   - `anthropic-agent-sdk` for programmatic Claude Code agent workflows.
   - `anthropic-sdk-production-review` for audits, hardening, and regression
     checks.
5. Load the required reading set for the current task from the map below.
6. Implement or review using the repository's existing patterns.
7. Verify with the repository's tests, typecheck, lint, or smallest available
   equivalent.

## SDK Decision Rules

Use the Client SDK for:

- Messages API calls.
- Single-request or request/response streaming.
- Structured JSON outputs with schema helpers.
- Tool use through Messages API, TypeScript tool runners, or Python
  `@beta_tool`/`tool_runner`.
- Server tools such as web search, web fetch, bash/code execution, text editor,
  memory/search tools, and tool result handling when the direct Messages API is
  the desired abstraction.
- Token counting.
- Message batches.
- Model listing/retrieval.
- Multimodal content such as text, image, PDF/document blocks, citations, and
  content block arrays.
- Provider-specific clients such as Bedrock, Vertex, AWS, Azure, and Foundry
  variants when the installed package exposes them.

Use the Claude Agent SDK for:

- Programmatic agents with Claude Code capabilities.
- Workspace inspection, file editing, command execution, and multi-step coding
  workflows.
- Built-in Claude Code tools with explicit permission behavior.
- Custom tools implemented in-process or through MCP servers.
- Hooks that deterministically inspect or block tool calls.
- Interactive sessions with `ClaudeSDKClient`.
- Session resume, session stores, transcript mirroring, session forking, or
  long-running conversations.
- Sandboxed shell/file execution and hosted agent policy boundaries.

Use both when a workflow needs direct Claude API setup plus an agent loop, such
as summarizing user input with the Client SDK and then starting an Agent SDK
workflow to inspect/edit a repository.

## Autonomy Rules

Do not ask the user for choices that can be inferred safely:

- Language: follow the target files and existing imports.
- Package manager: follow the lockfile and existing scripts.
- SDK: use the decision rules above.
- API key: wire to environment/config; never ask for the key value.
- Tests: use the existing test framework.
- Model: use existing config/env conventions when present.
- Runtime root: infer from framework entrypoints unless multiple roots are
  equally plausible and editing the wrong root is risky.

Ask only when the user must choose a product policy, model policy, data
retention policy, approval boundary, tool permission boundary, deployment
target, or when multiple app roots are equally plausible.

## Non-Negotiable Safety Rules

- Keep `ANTHROPIC_API_KEY` server-side.
- Do not expose provider credentials in browser/client bundles.
- Use the top-level `system` parameter for Messages API system instructions;
  do not add a message with role `system`.
- Add explicit `max_tokens`.
- Add cancellation or cleanup for streaming endpoints and Agent SDK sessions.
- Treat `allowed_tools`/`allowedTools` as auto-approval controls, not complete
  toolset removal, unless local Agent SDK types also expose a strict built-in
  `tools` option and the code uses it deliberately.
- Use `disallowed_tools`/`disallowedTools`, hooks, permission callbacks,
  sandboxing, or app-level approval to block high-risk tools.
- Do not log prompts, responses, transcripts, tool inputs, file contents, or
  provider credentials unless the product has an explicit retention policy.
- Do not invent SDK APIs. If the project version is unclear, inspect installed
  package versions and local type definitions.

## Local Reference Map

Read these local references. Do not send the user to external docs for routine
implementation details.

Core routing:

- `../anthropic-sdk/references/agent-usage-modes.md` - exact agent contract for
  development documentation mode and existing-code validation documentation
  mode.
- `../anthropic-sdk/references/sdk-selection.md` - SDK selection, language/runtime
  inference, and no-question rules.
- `../anthropic-sdk-production-review/references/security-privacy.md` - secrets, privacy, tool execution,
  transcripts, logs, multi-tenant isolation, retention.
- `../anthropic-sdk-production-review/references/failure-modes.md` - debugging matrix for auth, messages,
  streaming, tools, provider variants, Agent SDK sessions, and sensitive data
  leaks.

Client SDK:

- `../anthropic-client-sdk/references/client-sdk-api-surface.md` - Client SDK resource and method
  map across TypeScript and Python.
- `../anthropic-client-sdk/references/client-sdk-feature-playbook.md` - implementation procedures
  for Messages API, streaming, structured output, token counting, batches,
  models, tools, server tools, and provider variants.
- `../anthropic-client-sdk/references/client-sdk-typescript.md` - TypeScript Client SDK patterns.
- `../anthropic-client-sdk/references/client-sdk-python.md` - Python Client SDK patterns.
- `../anthropic-client-sdk/references/tools-streaming-structured-output.md` - deep reference for
  streaming, tool loops, tool errors, and structured output.
- `../anthropic-client-sdk/references/platform-beta-resources.md` - beta resource map and usage
  boundaries.
- `../anthropic-client-sdk/references/providers-bedrock-vertex-azure.md` - provider-specific
  client guidance.

Agent SDK:

- `../anthropic-agent-sdk/references/agent-sdk-api-surface.md` - Claude Agent SDK concepts and
  API surface across TypeScript and Python.
- `../anthropic-agent-sdk/references/agent-sdk-feature-playbook.md` - implementation procedure
  and pattern selection for agent workflows.
- `../anthropic-agent-sdk/references/agent-sdk-typescript.md` - TypeScript Agent SDK patterns.
- `../anthropic-agent-sdk/references/agent-sdk-python.md` - Python Agent SDK patterns.

Cross-cutting:

- `../anthropic-sdk-production-review/references/testing-patterns.md` - local testing strategies.
- `../anthropic-sdk-production-review/references/production-checklist.md` - production hardening checklist.

## Required Reading By Task

- Direct generation, streaming, structured output, token counting, batches,
  models, server tools, or provider clients:
  `agent-usage-modes.md`, `sdk-selection.md`, `client-sdk-api-surface.md`,
  `client-sdk-feature-playbook.md`, one language-specific Client SDK reference,
  `tools-streaming-structured-output.md`, `security-privacy.md`, and
  `testing-patterns.md`.
- Agent tools, hooks, MCP servers, sessions, session stores, resume, sandbox,
  or workspace automation:
  `agent-usage-modes.md`, `sdk-selection.md`, `agent-sdk-api-surface.md`,
  `agent-sdk-feature-playbook.md`, one language-specific Agent SDK reference,
  `security-privacy.md`, and `testing-patterns.md`.
- Provider-specific integration:
  `providers-bedrock-vertex-azure.md`, Client SDK language reference, and
  `failure-modes.md`.
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
