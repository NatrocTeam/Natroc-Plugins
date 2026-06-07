# Agent Usage Modes

This plugin has two explicit usage modes. Select the mode without asking the
user unless the request itself is contradictory.

## Mode 1: Development Documentation

Use development documentation mode when the user asks to:

- build a new Anthropic integration.
- add Claude generation, streaming, tool use, or structured output.
- add a Claude Agent SDK workflow.
- modify existing code.
- debug failing Anthropic SDK behavior.
- migrate code to newer SDK patterns.
- wire SDK behavior into a route, worker, CLI, desktop process, or service.

In this mode, act as an implementation agent:

1. Inspect the repository before deciding.
2. Choose Client SDK or Agent SDK using `sdk-selection.md`.
3. Choose TypeScript/JavaScript or Python from the target code.
4. Read the relevant API/playbook references.
5. Make the smallest correct code change.
6. Add or update tests when the touched path is production-facing.
7. Run available validation.
8. Report files changed, SDK surface used, secret/config assumptions, and
   validation results.

Development mode is allowed to edit code. It is still not allowed to invent
user policy decisions, secrets, product requirements, or deployment assumptions.

## Mode 2: Existing-Code Validation Documentation

Use existing-code validation documentation mode when the user asks to:

- validate Anthropic SDK code.
- review or audit an implementation.
- check whether code is safe to ship.
- harden production behavior.
- investigate risk, reliability, security, tests, or correctness.
- produce a release gate assessment.

In this mode, act as a reviewer:

1. Inspect code evidence before making claims.
2. Identify package, language, runtime boundary, and SDK surface.
3. Compare implementation against the bundled references.
4. Report findings first, ordered by severity.
5. Include file paths, evidence, impact, and specific fixes.
6. Separate confirmed bugs from open questions and missing tests.
7. Do not patch code unless the user explicitly asks for fixes.

Validation mode should not produce broad tutorials. It should produce an
evidence-based review with concrete technical defects or a clear statement that
no issues were found.

## No-Question Contract

Do not ask the user for information that can be inferred safely from the
repository:

- language and framework.
- package manager.
- SDK package.
- existing model config and environment variable naming.
- test runner and lint/typecheck commands.
- server/client boundary.
- existing wrapper or service layer pattern.

Ask only when:

- multiple app roots are equally plausible and editing the wrong one is risky.
- the user must choose a product policy, model policy, data retention policy,
  approval boundary, or deployment target.
- the task requires a real secret value.
- the repository has conflicting implementations and the correct target cannot
  be inferred from the request.

## Mode Transitions

If the user asks to "review and fix", first run validation mode and list
findings, then switch to development mode for the confirmed fixes.

If the user asks to "make it production ready", inspect first. If no code
exists, use development mode. If code exists, start in validation mode, identify
gaps, then implement only the gaps that are clearly inside the user's request.

If the user asks "is this correct?", stay in validation mode and do not edit.

If the user asks "add Anthropic SDK support", use development mode.

## Required Context Before Acting

For every Anthropic SDK task, inspect at least:

- dependency manifest and lockfile.
- runtime/framework entrypoint.
- existing Anthropic imports or wrappers.
- environment/config conventions.
- tests covering the target code.

For Agent SDK tasks, also inspect:

- workspace root assumptions.
- file and shell permissions.
- MCP configuration.
- session/transcript storage.
- hosted product boundaries.
- cancellation and lifecycle management.

## Handoff Format Between Agents

When handing work to another agent, include:

- selected mode.
- selected SDK.
- selected language.
- exact files inspected.
- references loaded.
- implementation or validation status.
- open questions only if they block correctness.

Example:

```text
Mode: development documentation
SDK: Client SDK
Language: TypeScript
References: sdk-selection.md, client-sdk-api-surface.md,
client-sdk-typescript.md, tools-streaming-structured-output.md
Files inspected: package.json, src/server/claude.ts, src/routes/chat.ts
Decision: use messages.stream with abort handling in the route.
Open questions: none.
```
