# Testing Patterns

Use this reference to test Anthropic SDK development and validation work.

## Test Levels

Use the smallest meaningful test first:

- unit tests for app wrappers and request construction.
- integration tests with mocked SDK clients.
- contract tests for tool schemas and session stores.
- streaming tests for cancellation and event conversion.
- live API smoke tests only when explicitly gated by environment variables.

Do not run live API tests by default in CI unless the repository already has a
secure convention.

## Client SDK Unit Tests

Test:

- client wrapper uses configured model.
- `max_tokens` is passed.
- system prompt uses top-level `system`.
- messages use correct roles.
- content block extraction handles non-text blocks.
- structured output validation errors are handled.
- SDK errors convert to app errors.
- retries/timeouts are configured where expected.

Mock the SDK boundary rather than calling the network.

## Streaming Tests

Test:

- normal text deltas.
- final message/text extraction.
- stream error.
- caller cancellation.
- abort signal propagation.
- no writes after response close.
- memory does not grow unexpectedly for long streams.

A good HTTP streaming test simulates client disconnect and asserts SDK abort or
cleanup was called.

## Tool Tests

Test:

- valid tool call.
- unknown tool name.
- invalid tool input.
- expected tool error.
- unexpected exception converted safely.
- output size limit.
- authorization failure.
- too many tool turns.

For Python `@beta_tool`, test that the generated schema includes required
fields and descriptions when local helpers expose `.to_dict()`.

## Structured Output Tests

Test:

- valid parsed output.
- missing required field.
- extra field when schema is strict.
- invalid enum.
- malformed JSON fallback.
- app rejects unvalidated output.

Do not rely on model live behavior for schema validation tests. Mock the SDK
response and validate application behavior.

## Batches Tests

Test:

- batch request item construction.
- custom ID mapping.
- status polling/retrieval.
- succeeded result processing.
- errored result processing.
- canceled/expired behavior.
- idempotent result handling.

Live batch tests should be explicitly gated and should use small fixtures.

## Provider Variant Tests

Test:

- provider client construction.
- region/project/endpoint.
- model ID format.
- auth source selection.
- unsupported feature fallback.
- provider-specific error mapping.

Do not use real cloud credentials in unit tests.

## Agent SDK Option Tests

Test option construction:

- `cwd` is expected.
- `max_turns`/`maxTurns` is bounded.
- allowed tools match policy.
- disallowed tools block known risks.
- permission mode is not overly broad.
- MCP servers are explicit.
- sandbox settings match deployment policy.

These tests can run without starting a real agent.

## Agent SDK Stream Tests

Test:

- assistant text extraction.
- result message handling.
- process error handling.
- JSON decode/parse error handling.
- user cancellation.
- client close/dispose.

Mock the SDK iterator or client.

## Hook Tests

Test hooks as pure functions where possible:

- safe Bash command allowed.
- blocked Bash pattern denied.
- write outside workspace denied.
- missing tool input handled.
- denial reason is clear.
- hook does not leak secrets.

## Session Store Tests

Test:

- append/load ordering.
- resume materialization.
- project/tenant key isolation.
- delete behavior.
- list sessions/subkeys if implemented.
- append failure.
- timeout.
- corrupt transcript handling.

Use SDK conformance helpers when the installed package provides them.

## Review Validation Commands

Run only commands that exist in the repository:

- TypeScript: lint, typecheck, unit tests, focused test file.
- Python: pytest, type checker, formatter check, focused test file.
- Markdown/JSON: formatter and JSON parse checks.

If a validation command is unavailable, state that it was not run.
