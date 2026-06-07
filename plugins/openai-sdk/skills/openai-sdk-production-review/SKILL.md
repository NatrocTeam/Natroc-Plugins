---
name: openai-sdk-production-review
description: This skill should be used when validating, reviewing, hardening, testing, auditing, or release-gating existing OpenAI Client SDK or Agents SDK code for production readiness, security, correctness, observability, streaming behavior, webhook verification, tool safety, sessions, tracing, and failure handling.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# OpenAI SDK Production Review

## Purpose

Use this skill as validation documentation for OpenAI SDK code that already
exists. Apply it before release, during an audit, or after a bug report. Lead
with concrete findings, not a general explanation. Only report issues that have
code evidence, reproducible behavior, or a clear missing safety control.

## Required References

1. `../openai-sdk/references/agent-usage-modes.md`
2. `../openai-sdk-production-review/references/production-checklist.md`
3. `../openai-sdk-production-review/references/testing-patterns.md`
4. `../openai-sdk-production-review/references/security-privacy.md`
5. `../openai-sdk-production-review/references/failure-modes.md`
6. The relevant SDK API/playbook references:
   - `../openai-client-sdk/references/client-sdk-api-surface.md`
   - `../openai-client-sdk/references/client-sdk-feature-playbook.md`
   - `../openai-agents-sdk/references/agents-sdk-api-surface.md`
   - `../openai-agents-sdk/references/agents-sdk-feature-playbook.md`
   - `../openai-agents-sdk/references/agents-sdk-tools-handoffs-guardrails.md`
7. The relevant language reference:
   - `../openai-client-sdk/references/client-sdk-typescript.md`
   - `../openai-client-sdk/references/client-sdk-python.md`
   - `../openai-agents-sdk/references/agents-sdk-typescript.md`
   - `../openai-agents-sdk/references/agents-sdk-python.md`

## Review Scope

Check the relevant areas:

- Client construction and config.
- API key handling and server/client boundaries.
- Responses vs Chat Completions choice.
- Streaming and cancellation.
- Webhook raw body verification.
- Realtime error event handling.
- SDK error handling and request ID logging.
- Retries, timeouts, and rate limit behavior.
- File upload handling.
- Azure OpenAI configuration.
- Agents SDK tool schemas, tool errors, approvals, and guardrails.
- Handoffs vs agents-as-tools.
- Session or server-managed state strategy.
- Tracing sensitive-data policy.
- Sandbox workspace boundaries.
- Tests and mocks.

## Severity Model

- Critical: secret exposure, unsafe public API key use, destructive tool without
  approval/permission, webhook signature bypass, or data leak.
- High: production failure path likely to break core workflow, duplicate side
  effects on retry, missing idempotency for webhooks, unbounded agent/tool loop,
  or incorrect state strategy.
- Medium: missing request IDs, weak timeout behavior, missing edge-case tests,
  brittle structured output parsing, or incomplete streaming cleanup.
- Low: maintainability issue, unclear tool description, duplicated client
  construction, or non-blocking observability gap.

## Review Process

1. Identify SDK type, language, runtime, and code entrypoints.
2. Inspect config/secrets and server/client boundaries first.
3. Inspect request construction, streaming, webhook, Realtime, or agent workflow
   behavior based on the code path.
4. Inspect tests and failure paths.
5. Produce findings ordered by severity.
6. If asked to fix, implement only the requested/safe scope and verify.

## Output Format

Use this format:

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
