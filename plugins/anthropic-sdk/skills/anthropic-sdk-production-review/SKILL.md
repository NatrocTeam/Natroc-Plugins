---
name: anthropic-sdk-production-review
description: This skill should be used when the user asks to validate, review, audit, harden, release-gate, or assess existing Anthropic Client SDK or Claude Agent SDK code. Trigger on security, correctness, streaming, tools, permissions, sessions, retries, provider variants, structured output, API key safety, missing tests, or production readiness.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# Anthropic SDK Production Review

## Purpose

Use this skill for existing-code validation. Focus on evidence-based review of
Anthropic Client SDK and Claude Agent SDK implementations. Do not patch code
unless the user explicitly asks for fixes.

## Required Workflow

1. Read `../anthropic-sdk/references/agent-usage-modes.md` and apply existing-code
   validation documentation mode.
2. Read:
   - `../anthropic-sdk-production-review/references/production-checklist.md`
   - `../anthropic-sdk-production-review/references/security-privacy.md`
   - `../anthropic-sdk-production-review/references/failure-modes.md`
   - `../anthropic-sdk-production-review/references/testing-patterns.md`
3. Identify SDK package and language:
   - Client SDK TypeScript/JavaScript: `@anthropic-ai/sdk`.
   - Client SDK Python: `anthropic`.
   - Agent SDK TypeScript/JavaScript: `@anthropic-ai/claude-agent-sdk`.
   - Agent SDK Python: `claude-agent-sdk`.
4. Read the relevant API/playbook references.
5. Inspect code evidence before writing a finding.
6. Lead with findings ordered by severity.

## Review Priorities

Check these first:

- API keys or provider credentials exposed in browser code, logs, test
  snapshots, exception messages, repository files, or telemetry.
- Messages API misuse: missing `max_tokens`, role `system` inside messages,
  untyped content extraction, malformed multimodal blocks, brittle structured
  parsing, or missing tool result handling.
- Streaming bugs: no abort path, no error handling, no finalization, memory
  growth from accumulated streams, or orphaned clients when users disconnect.
- Tool risks: unsafe tool schemas, tool input trust, unhandled `ToolError`,
  unrestricted server tools, code execution without policy, and missing audit
  logs.
- Agent SDK permission risks: confusing auto-approval with blocking, missing
  `disallowed_tools`, broad `permission_mode`, unbounded `max_turns`, risky
  `cwd`, unsafe MCP inheritance, weak hooks, missing sandbox, or unscoped
  session storage.
- Provider variants: assuming Bedrock/Vertex/Azure/Foundry clients support the
  same resources as the Anthropic API without checking local package behavior.
- Missing tests for wrappers, stream errors, tool calls, permissions, session
  resume, and provider failures.

## Severity Guidance

Use high severity for:

- Public exposure of API keys/provider credentials.
- Browser-side direct Client SDK calls with privileged keys.
- Agent SDK shell/file tools enabled in a hosted product without deliberate
  approval/sandbox policy.
- Destructive or exfiltration-capable tools without blocking or user approval.
- Session transcript leakage across tenants.
- Logging full prompts/responses/tool inputs where sensitive data is likely.

Use medium severity for:

- Missing stream cancellation in production routes.
- Missing `max_tokens`, timeout, retry, or error conversion on user-facing
  paths.
- Tool schemas too loose to validate required inputs.
- Structured output parsed with fragile string logic.
- Provider-specific feature mismatch likely to fail at runtime.
- Missing tests on SDK boundary wrappers.

Use low severity for:

- Inconsistent model/config naming.
- Non-critical observability gaps.
- Minor type looseness that does not affect runtime safety.

## Evidence Rules

- Cite file paths and lines.
- Explain the concrete behavior observed.
- Explain user/system impact.
- Provide a specific fix.
- Separate confirmed findings from open questions and test gaps.
- Do not report a theoretical risk as a confirmed bug without code evidence.

## Output Format

```text
Findings

1. [Severity] Title
   File: path:line
   Evidence: concrete code behavior
   Impact: user/system impact
   Fix: specific change

Open Questions
- Only include if a decision or missing context blocks certainty.

Verification
- Commands run and result, or why not run.

Residual Risk
- Mention only meaningful gaps such as live API behavior not exercised.
```

## Additional Resources

- `../anthropic-sdk-production-review/references/production-checklist.md`
- `../anthropic-sdk-production-review/references/security-privacy.md`
- `../anthropic-sdk-production-review/references/failure-modes.md`
- `../anthropic-sdk-production-review/references/testing-patterns.md`
- `../anthropic-client-sdk/references/client-sdk-api-surface.md`
- `../anthropic-client-sdk/references/client-sdk-feature-playbook.md`
- `../anthropic-agent-sdk/references/agent-sdk-api-surface.md`
- `../anthropic-agent-sdk/references/agent-sdk-feature-playbook.md`
