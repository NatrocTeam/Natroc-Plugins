# Agent Usage Modes

Use this reference whenever an agent needs to decide how `openai-sdk` should be
used for an OpenAI SDK task. This plugin is a bundled documentation corpus for
agents. It is not a runtime dependency, not a package wrapper, and not a reason
to ask the user for routine SDK decisions that can be inferred from the
repository.

The plugin has two primary modes:

1. Development documentation mode: use the bundled docs to build, modify,
   migrate, debug, or fix software that uses the OpenAI Client SDK, the OpenAI
   Agents SDK, or both.
2. Existing-code validation documentation mode: use the bundled docs to
   validate, review, audit, harden, or release-gate code that already uses the
   OpenAI Client SDK, the OpenAI Agents SDK, or both.

## Mode Selection

Select development documentation mode when the user asks for:

- Build an OpenAI feature.
- Add OpenAI to an app.
- Implement text generation, structured output, streaming, webhooks, Realtime,
  files, embeddings, images, audio, vector stores, evals, admin APIs, or Azure
  OpenAI.
- Implement agents, tools, handoffs, guardrails, sessions, tracing, human
  approval, sandbox agents, or workspace agents.
- Migrate Chat Completions to Responses.
- Add tests around a new OpenAI SDK path.
- Fix a bug where the expected outcome is a patch.

Select existing-code validation documentation mode when the user asks for:

- Validate existing OpenAI SDK code.
- Review or audit an OpenAI implementation.
- Check whether Client SDK usage is correct.
- Check whether Agents SDK orchestration is correct.
- Check API key safety, webhook verification, streaming correctness, Realtime
  lifecycle, retries, timeouts, request IDs, tool safety, guardrails, handoffs,
  sessions, traces, sandbox boundaries, or tests.
- Determine if code is production ready.
- Find bugs in existing SDK usage before making changes.

If the user asks both to validate and fix, validate first. Report findings, then
patch only the requested scope. If the user says "fix it" after a review, apply
the smallest changes needed for the confirmed findings and verify them.

## Shared First Steps

Always inspect the repository before choosing implementation details:

1. Identify the app root, package manager, lockfile, dependency files, and test
   commands.
2. Identify language and runtime: TypeScript, JavaScript, Python, web route,
   server action, worker, CLI, edge runtime, browser, mobile, or sandbox.
3. Search for existing SDK imports:
   - TypeScript/JavaScript Client SDK: `openai`.
   - TypeScript/JavaScript Agents SDK: `@openai/agents`.
   - Python Client SDK: `openai`.
   - Python Agents SDK: `openai-agents` package and `agents` imports.
4. Identify config conventions: `OPENAI_API_KEY`, model env vars, base URLs,
   Azure variables, organization/project IDs, timeout/retry config, logging, and
   tracing.
5. Identify existing test style, mocks, fixtures, and integration test gates.
6. Identify security boundary: server-only code, public browser code, mobile
   code, tenant boundary, user permissions, and data retention expectations.

Do not ask the user for API key values. Do not ask which package manager,
language, or test framework to use when the repository already answers it. Do
not ask whether to add normal error handling, request IDs, timeouts, validation,
or deterministic tests for production-facing SDK code.

Ask only when a business or product policy cannot be inferred safely:

- Model policy when no project convention exists and the choice affects cost,
  latency, quality, or compliance.
- Data retention or tracing policy when sensitive data may be stored or logged.
- Tool approval policy for state-changing or expensive Agents SDK tools.
- Tenant or permission model when the tool/code can access another user's data.
- App root when multiple roots are equally plausible and editing the wrong one
  would be risky.

## SDK Selection

Use the Client SDK when the code needs direct OpenAI API calls:

- Responses API.
- Chat Completions maintenance.
- Structured output for a single request.
- Streaming from a single model request.
- Embeddings.
- Files and uploads.
- Images, audio, video, moderation, evals, vector stores, containers,
  conversations, skills, and admin APIs.
- Webhook verification.
- Realtime WebSocket flows.
- Azure OpenAI client usage.

Use the Agents SDK when the code needs an agent loop:

- Tools or function calling controlled by an agent runtime.
- Handoffs between specialist agents.
- Agents exposed as tools behind a manager.
- Guardrails.
- Sessions or multi-turn workflow state.
- Tracing of runs, tool calls, handoffs, and workflow events.
- Human approval or pause/resume.
- Sandbox/workspace agents that inspect files, run commands, apply patches, or
  preserve workspace state.

Use both when direct platform work and agent orchestration are both required.
Examples: upload files with the Client SDK and let an Agents SDK workflow reason
over them; verify webhooks with the Client SDK and enqueue an Agents SDK
workflow; create vector resources directly and expose retrieval through a tool.

## Development Documentation Mode

Purpose: use plugin references as implementation docs while writing or changing
code. The output should be a working patch, plus verification and concise
engineering notes.

Development workflow:

1. Read this file and `sdk-selection.md`.
2. Choose Client SDK, Agents SDK, or both.
3. Read the relevant API surface reference.
4. Read the relevant feature playbook.
5. Read the relevant language reference.
6. Read framework recipes when touching routes, workers, CLIs, edge runtimes, or
   browser boundaries.
7. Read security/privacy guidance for every production path.
8. Read testing patterns before adding or updating tests.
9. Implement using repository conventions.
10. Verify with the smallest meaningful command: typecheck, tests, lint, build,
    or a targeted script.

Development standards for Client SDK work:

- Prefer Responses API for new model generation unless maintaining an existing
  Chat Completions path.
- Keep API keys server-side and read them from environment/config.
- Centralize client creation when the app already has shared service patterns.
- Keep model selection configurable unless a project convention already exists.
- Use structured outputs when application code needs structured data.
- Avoid brittle parsing of natural-language text when the API can return typed
  data.
- Configure timeout behavior appropriate for the runtime.
- Preserve request IDs in logs, telemetry, or returned errors where useful.
- Verify webhooks with the raw body, not parsed JSON.
- Handle streaming event types explicitly and test cancellation or partial
  output.
- Handle Realtime connection lifecycle and `error` events.
- Use SDK file helpers and native file streams rather than hand-built multipart
  payloads.
- Gate live integration tests with environment variables; keep normal tests
  deterministic.

Development standards for Agents SDK work:

- Use a plain agent for normal prompt, tool, handoff, and guardrail workflows.
- Use handoffs when a specialist should take over the conversation.
- Use agents as tools when a manager should remain in control.
- Use sandbox agents only when workspace/file/shell/snapshot behavior is
  required.
- Give tools stable names, narrow schemas, precise descriptions, and bounded
  output.
- Add permission checks, approvals, guardrails, or all three for tools that
  mutate state, spend money, send messages, run shell/file/computer actions, or
  access private data.
- Choose exactly one state strategy unless existing code deliberately
  reconciles multiple strategies.
- Bound max turns in user-facing flows.
- Configure trace data handling deliberately; do not treat traces as safe by
  default.
- Test tools as normal functions, then test schema, handoff, guardrail, session,
  streaming, and max-turn behavior.

Development output should include:

- Files changed.
- SDK surface used and why.
- Config/secrets assumptions.
- Safety decisions for tools, traces, webhooks, streaming, and runtime boundary.
- Verification command and result.
- Remaining follow-up only when it matters.

## Existing-Code Validation Documentation Mode

Purpose: use plugin references as validation docs while inspecting code that
already exists. The output should be evidence-based findings, not a broad
tutorial. Do not change files unless the user asks for fixes.

Validation workflow:

1. Inventory every OpenAI SDK entrypoint in the requested scope.
2. Classify each entrypoint as Client SDK, Agents SDK, or both.
3. Identify language, package version when possible, runtime boundary, and
   config source.
4. Read this file, `production-checklist.md`, `security-privacy.md`,
   `failure-modes.md`, `testing-patterns.md`, and the relevant SDK references.
5. Compare code behavior against the reference expectations.
6. Record only findings with code evidence, reproducible behavior, missing
   safety control, or missing test coverage that creates real risk.
7. Order findings by severity.
8. Provide specific fixes that fit the repository's existing style.
9. Report verification commands run, or explain why validation was static only.

Validation dimensions for Client SDK code:

- SDK surface: correct resource/method for the feature.
- Package version: code uses APIs available to the installed SDK.
- Client construction: correct API key, base URL, Azure config, timeout, retry,
  organization/project, and shared client pattern.
- Runtime boundary: no normal API key in public browser/mobile code.
- Model/config: follows project conventions and avoids hardcoded product policy
  unless deliberate.
- Request shape: correct input/message structure, attachments, files, tool
  options, response format, and metadata.
- Structured output: uses schema-backed output when application code expects
  structured data.
- Streaming: handles event types, errors, cancellation, terminal events, and
  partial output.
- Webhooks: verifies signatures using raw body, timestamp/signature headers,
  and idempotency for side effects.
- Realtime: handles connection lifecycle, authentication boundary, session
  updates, audio/data events, and error events.
- Files/uploads: validates user file size, type, permissions, and ownership.
- Errors: maps SDK errors into app behavior without leaking secrets.
- Request IDs: exposes enough request metadata for debugging.
- Retries/idempotency: avoids duplicate side effects and handles rate limits.
- Tests: mock SDK calls deterministically and cover failure paths.

Validation dimensions for Agents SDK code:

- Orchestration fit: Agents SDK is justified over one direct Client SDK request.
- Pattern selection: plain agent, handoff, agents as tools, direct runner in
  tool, or sandbox agent is appropriate.
- Tool definitions: names, descriptions, schemas, required fields, enum/domain
  constraints, and output shape are clear.
- Tool safety: state-changing, expensive, messaging, shell/file/computer, and
  sensitive-data tools have permission checks, approvals, guardrails, timeouts,
  and audit metadata.
- Tool error behavior: recoverable errors return model-usable messages; hard
  failures abort when required.
- Handoffs: specialists have clear responsibilities and input filters where
  needed.
- Agents as tools: manager stays in control when that is the intended pattern.
- Guardrails: blocking vs parallel behavior matches safety requirements.
- Sessions/state: one state strategy is used; prompt history and audit logs are
  not confused.
- Tracing: sensitive data is redacted or tracing is configured to avoid leaking
  private content.
- Sandbox: workspace boundaries, snapshots, file permissions, shell controls,
  and cleanup are explicit.
- Streaming: raw model events, run-item events, and agent-update events are
  translated intentionally.
- Max turns: user-facing workflows cannot loop unbounded.
- Tests: deterministic tests cover tools, schemas, handoffs, guardrails,
  sessions, streaming, max turns, and failure paths.

Severity guidance:

- Critical: exposed API key, public normal-key browser usage, webhook signature
  bypass, destructive tool without permission/approval, cross-tenant data leak,
  or sensitive trace/log leakage.
- High: likely production failure in core workflow, duplicate side effects on
  retry, missing webhook idempotency, unbounded agent/tool loop, incorrect state
  strategy, or unsafe tool access to private data.
- Medium: weak timeout behavior, missing request IDs, brittle structured output
  parsing, incomplete streaming cleanup, missing error mapping, missing
  deterministic tests for important behavior.
- Low: unclear tool description, duplicated client construction, incomplete
  observability, maintainability issue, or non-blocking test gap.

Validation output should use findings-first structure:

```text
Findings

1. [Severity] Title
   File: path:line
   Evidence: concrete code behavior
   Impact: user/system impact
   Fix: specific change

Open Questions
- Only include if required to complete validation.

Verification
- Commands run and result, or why validation was static only.
```

If no finding is found, state that clearly. Still list relevant test gaps,
unverified runtime assumptions, or code paths outside the requested scope.

## Both SDKs In One Task

When a repository uses both SDKs, avoid forcing one global answer. Validate or
build each boundary separately:

- Client SDK code owns direct API resources, uploads, webhooks, Realtime,
  embeddings, media, admin operations, and simple generation.
- Agents SDK code owns tool loops, handoffs, guardrails, sessions, traces,
  human approval, and sandbox/workspace behavior.
- Shared config should avoid duplicate client construction unless there is a
  clear runtime boundary.
- Shared tests should avoid live model calls in normal CI.
- Shared logs/traces should redact secrets and private user data.

When both modes are present in one user request, sequence the work:

1. Validate existing code.
2. Identify findings or implementation gaps.
3. Patch only the requested or necessary scope.
4. Verify the patch.
5. Report remaining risks.

## Do Not Do These Things

- Do not ask the user to provide routine SDK documentation.
- Do not point the user to external docs for ordinary implementation details
  already covered by this plugin.
- Do not invent SDK methods when local package types or bundled references can
  be checked.
- Do not request API key values.
- Do not expose normal API keys to public clients.
- Do not treat model output as trusted data.
- Do not let an Agents SDK tool perform high-impact actions without an
  application-enforced safety boundary.
- Do not report hypothetical issues as confirmed findings.
- Do not patch code during validation mode unless the user asked for fixes.
