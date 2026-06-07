# Agent Usage Modes

Use this reference whenever an agent needs to decide how `ollama` should be used
for an Ollama task. This plugin is a bundled documentation corpus for agents. It
is not a runtime dependency and not a reason to ask the user for routine client
or runtime decisions that can be inferred from the repository.

The plugin has two primary modes:

1. Development documentation mode: use the bundled docs to build, modify,
   migrate, debug, or fix software that uses the official Ollama TypeScript or
   Python client.
2. Existing-code validation documentation mode: use the bundled docs to
   validate, review, audit, harden, or release-gate code that already uses
   Ollama.

## Mode Selection

Select development documentation mode when the user asks for:

- Build an Ollama feature.
- Add local LLM support to an app.
- Implement chat, generate, streaming, embeddings, images, tools, structured
  output, thinking, logprobs, web search, or web fetch.
- Configure an Ollama client for local daemon, remote daemon, or cloud API.
- Add model lifecycle behavior such as pull, create, copy, delete, show, ps, or
  version.
- Fix a bug where the expected outcome is a patch.

Select existing-code validation documentation mode when the user asks for:

- Validate existing Ollama code.
- Review or audit an Ollama implementation.
- Check host exposure, cloud API key handling, stream handling, tool-call
  safety, structured output parsing, model lifecycle behavior, browser boundary,
  Python async usage, or tests.
- Determine if code is production ready.
- Find bugs in existing Ollama usage before making changes.

If the user asks both to validate and fix, validate first. Report findings, then
patch only the requested scope.

## Shared First Steps

Always inspect the repository before choosing details:

1. Identify app root, package manager, lockfile, dependency files, and test
   commands.
2. Identify language and runtime: TypeScript, JavaScript, Node, browser, edge,
   Python sync service, Python async service, worker, CLI, or local script.
3. Search for existing imports:
   - TypeScript/JavaScript: `ollama`, `Ollama`, `ollama/browser`.
   - Python: `ollama`, `Client`, `AsyncClient`, `chat`, `generate`, `embed`.
4. Identify config conventions: `OLLAMA_HOST`, `OLLAMA_MODEL`,
   `OLLAMA_API_KEY`, headers, model names, timeout behavior, logging, and
   integration test gates.
5. Identify runtime policy: local daemon only, remote daemon, cloud models via
   local Ollama, or direct cloud API.
6. Identify test style, mocks, fake fetch/httpx usage, and live Ollama gates.
7. Identify security boundary: server-only code, browser code, tenant boundary,
   user permissions, and data-retention expectations.

Do not ask the user for API key values. Do not ask which package manager,
language, or test framework to use when the repository already answers it. Do
not ask whether to add normal error handling, stream cleanup, model
availability checks, or deterministic tests for production-facing code.

Ask only when a business or product policy cannot be inferred safely:

- Model policy when no project convention exists and the choice affects cost,
  latency, quality, local hardware, or cloud usage.
- Cloud-vs-local policy when code could run either locally or through direct
  cloud API.
- Remote host exposure when a daemon may be reachable outside localhost.
- Tool approval policy for state-changing or expensive tool functions.
- App root when multiple roots are equally plausible and editing the wrong one
  would be risky.

## Development Documentation Mode

Purpose: use plugin references as implementation docs while writing or changing
code. The output should be a working patch, plus verification and concise
engineering notes.

Development workflow:

1. Read this file and `sdk-selection.md`.
2. Choose client integration, runtime/model lifecycle, or both.
3. Read `api-surface.md`.
4. Read the relevant feature playbook.
5. Read the relevant language reference.
6. Read runtime/cloud references when host, model lifecycle, or credentials are
   touched.
7. Read security/privacy guidance for every production path.
8. Read testing patterns before adding or updating tests.
9. Implement using repository conventions.
10. Verify with the smallest meaningful command: typecheck, tests, lint, build,
    or a targeted script.

Development standards:

- Prefer official clients over ad hoc HTTP calls unless repository conventions
  already use REST directly.
- Keep direct cloud API credentials server-side.
- Keep local daemon defaults local-only unless a remote host is explicitly
  configured.
- Make model and host configurable when existing code has config conventions.
- Consume streaming iterators fully and handle errors.
- Validate structured output after parsing.
- Validate tool names and arguments before execution.
- Avoid automatic model lifecycle operations inside hot request paths unless
  explicitly intended.
- Test request shape and deterministic behavior without requiring live model
  output in normal CI.

Development output should include:

- Files changed.
- Client/runtime surface used and why.
- Host/model/API-key assumptions.
- Safety decisions for browser boundary, tools, cloud, daemon exposure,
  streaming, and lifecycle operations.
- Verification command and result.
- Remaining follow-up only when it matters.

## Existing-Code Validation Documentation Mode

Purpose: use plugin references as validation docs while inspecting code that
already exists. The output should be evidence-based findings, not a broad
tutorial. Do not change files unless the user asks for fixes.

Validation workflow:

1. Inventory every Ollama entrypoint in the requested scope.
2. Classify each entrypoint as client integration, runtime/model lifecycle, or
   cloud/web API behavior.
3. Identify language, package version when possible, runtime boundary, host
   config, model config, and credential source.
4. Read this file, `production-checklist.md`, `security-privacy.md`,
   `failure-modes.md`, `testing-patterns.md`, and relevant client/runtime
   references.
5. Compare code behavior against reference expectations.
6. Record only findings with code evidence, reproducible behavior, missing
   safety control, or missing test coverage that creates real risk.
7. Order findings by severity.
8. Provide specific fixes that fit repository style.
9. Report verification commands run, or explain why validation was static only.

Validation dimensions:

- Package/import: official client, correct browser/Node import, correct Python
  sync/async client.
- Host: local default, `OLLAMA_HOST`, explicit host, proxy mode, or cloud host.
- Credentials: no `OLLAMA_API_KEY` in browser bundles or logs.
- Model: configured model, missing-model behavior, lifecycle ownership.
- Request shape: correct chat/generate/embed/tool/format parameters.
- Streaming: event iteration, cancellation/abort, terminal chunks, errors.
- Tools: allowlisted names, argument validation, tool-result messages.
- Structured output: schema passed to `format`, JSON parsed and validated.
- Embeddings: `embed` preferred for new code.
- Runtime: daemon down, model load latency, pulls, deletes, copies, creates.
- Tests: deterministic mocks, stream fixtures, integration gates.

Severity guidance:

- Critical: cloud API key exposed in public code, unsafe remote daemon exposure,
  destructive lifecycle operation without permission, unsafe tool execution, or
  cross-tenant data leak.
- High: likely production failure when daemon/model is unavailable, automatic
  large model pull in request path, unbounded stream/resource leak, blocking
  sync Python client inside async service, or wrong host/cloud boundary.
- Medium: missing structured output validation, incomplete stream cleanup,
  missing error mapping, weak timeout behavior, legacy embeddings in new code,
  or important missing tests.
- Low: unclear model config, duplicated client construction, incomplete
  diagnostics, or maintainability issue.

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
