---
name: ollama-production-review
description: This skill should be used when validating, reviewing, hardening, testing, auditing, or release-gating existing Ollama TypeScript or Python client code for production readiness, security, correctness, runtime behavior, streaming, tool safety, structured outputs, host exposure, cloud API keys, model lifecycle, and failure handling.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# Ollama Production Review

## Purpose

Use this skill as validation documentation for Ollama code that already exists.
Apply it before release, during an audit, or after a bug report. Lead with
concrete findings, not a general explanation. Only report issues that have code
evidence, reproducible behavior, or a clear missing safety control.

## Required References

1. `../ollama/references/agent-usage-modes.md`
2. `../ollama-production-review/references/production-checklist.md`
3. `../ollama-production-review/references/testing-patterns.md`
4. `../ollama-production-review/references/security-privacy.md`
5. `../ollama-production-review/references/failure-modes.md`
6. The relevant API/runtime references:
   - `../ollama-client/references/api-surface.md`
   - `../ollama-client/references/client-feature-playbook.md`
   - `../ollama-runtime/references/runtime-and-models.md`
   - `../ollama-runtime/references/cloud-and-web-apis.md`
   - `../ollama-client/references/tools-and-structured-outputs.md`
7. The relevant language reference:
   - `../ollama-client/references/typescript-client.md`
   - `../ollama-client/references/python-client.md`

## Review Scope

Check the relevant areas:

- Client construction and config.
- Local daemon, remote daemon, and direct cloud API boundaries.
- Cloud API key handling and browser/client boundaries.
- Chat vs generate choice.
- Streaming and abort/cancellation behavior.
- Structured output parsing and validation.
- Tool-call allowlists, argument validation, and tool-result messages.
- Image input and generated image output handling.
- Embeddings API choice.
- Thinking/logprobs feature gating and model support.
- Model lifecycle: pull, push, create, create_blob, delete, copy, list, show,
  ps, version.
- Runtime behavior when daemon is down or model is missing.
- Sync vs async Python client usage.
- Node vs browser TypeScript import usage.
- Tests and mocks.

## Severity Model

- Critical: cloud API key exposed in browser, remote daemon exposed without
  intended controls, destructive lifecycle action without permission, unsafe
  tool execution with side effects, or cross-tenant data leak.
- High: production path likely to fail when daemon/model is unavailable,
  automatic model pulls in hot paths, unbounded stream/resource leak, blocking
  sync client in async server path, or unsafe remote host config.
- Medium: missing stream cancellation, missing structured output validation,
  missing error mapping, weak timeout behavior, legacy embeddings use in new
  code, or missing edge-case tests.
- Low: duplicated client construction, unclear model config, incomplete
  diagnostics, non-blocking observability gap, or maintainability issue.

## Review Process

1. Identify language, client package, runtime, host config, model config, and
   code entrypoints.
2. Inspect secrets and host boundaries first.
3. Inspect request construction, streaming, tool calls, structured outputs,
   embeddings, model lifecycle, or cloud API behavior based on the code path.
4. Inspect tests and failure paths.
5. Produce findings ordered by severity.
6. If asked to fix, implement only the requested/safe scope and verify.

## Output Format

```text
Findings

1. [Severity] Title
   File: path:line
   Evidence: concrete code behavior
   Impact: user/system impact
   Fix: specific change

Open Questions
- Only include if required.

Verification
- Commands run and result, or why not run.
```

If there are no findings, say so clearly and list remaining test gaps or
unverified runtime assumptions.
