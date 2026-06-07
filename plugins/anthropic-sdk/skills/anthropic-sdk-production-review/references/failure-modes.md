# Failure Modes

Use this reference to diagnose Anthropic SDK bugs and review findings.

## Authentication Failures

Symptoms:

- unauthorized response.
- missing API key.
- provider credential error.
- local tests pass but deployment fails.

Check:

- environment variable name.
- server/client boundary.
- deployment secret configuration.
- provider credential chain.
- region/project/endpoint.
- key redaction in logs.

Fix:

- wire credentials through environment/config.
- keep SDK calls server-side.
- add startup/config validation.

## Invalid Request

Symptoms:

- request rejected.
- message shape error.
- missing required parameter.
- model not found.

Check:

- `model`.
- `max_tokens`.
- message roles.
- top-level `system`.
- content block shape.
- tool schema shape.
- beta headers/resources.
- provider-specific model ID.

Fix:

- align request construction with local SDK types.
- add request construction tests.

## System Prompt Misplacement

Symptoms:

- API rejects `system` role.
- system instructions ignored.

Check:

- `messages` array includes `{ role: "system" }`.

Fix:

- move system instructions to top-level `system`.

## Content Extraction Bugs

Symptoms:

- `[object Object]` appears in UI.
- no output despite successful response.
- crash when non-text block appears.

Check:

- code assumes `message.content` is string.
- code blindly accesses `content[0].text`.

Fix:

- filter content blocks by type.
- handle tool use, citations, and non-text blocks explicitly.

## Streaming Hangs or Leaks

Symptoms:

- HTTP responses never finish.
- memory grows.
- process keeps running after disconnect.
- partial output missing final state.

Check:

- abort handling.
- finalization path.
- error events.
- stream close/dispose.
- accumulation size.
- cancellation propagation.

Fix:

- wire abort signal.
- handle error/abort/end.
- test client disconnect.

## Structured Output Failures

Symptoms:

- JSON parse exceptions.
- missing fields.
- invalid enum.
- downstream database/type errors.

Check:

- app relies on prompt-only JSON.
- no schema validation.
- schema allows extra fields.
- parser ignores validation errors.

Fix:

- use SDK structured output helpers where available.
- use tool schema.
- validate output before use.

## Tool Loop Failures

Symptoms:

- infinite tool calls.
- unknown tool name.
- tool result rejected.
- model never produces final text.

Check:

- max tool turns.
- tool name registry.
- input schema validation.
- `tool_result` block shape.
- tool use ID matching.
- error result handling.

Fix:

- add turn limit.
- validate and dispatch from explicit registry.
- return structured tool errors.

## Provider Feature Mismatch

Symptoms:

- direct SDK code works but provider deployment fails.
- batches/token counting unavailable.
- streaming behavior differs.

Check:

- provider client import.
- provider local types.
- model ID format.
- unsupported resource calls.
- provider auth/region.

Fix:

- isolate provider-specific wrapper.
- feature-detect via local types/config.
- add provider-specific tests.

## Agent SDK Tool Permission Bug

Symptoms:

- agent uses a tool that developer thought was disabled.
- `allowed_tools` list did not block other tools.

Check:

- code treats `allowed_tools`/`allowedTools` as a toolset restriction.
- `disallowed_tools` is missing.
- strict `tools` option is absent where supported.
- permission mode is broad.

Fix:

- add explicit blocking.
- use strict tool availability option if supported.
- add hooks/permission callbacks.
- add tests for blocked tools.

## Agent SDK Wrong Workspace

Symptoms:

- agent reads/edits wrong project.
- CI job modifies checkout root unexpectedly.
- hosted product crosses tenant workspace.

Check:

- missing `cwd`.
- process cwd changes.
- user-supplied path not validated.
- symlink/path traversal.

Fix:

- set `cwd` explicitly.
- resolve and validate workspace path.
- enforce tenant/project scope.

## Agent SDK Session Leak

Symptoms:

- user sees another user's context.
- resume loads wrong transcript.
- session store grows without deletion.

Check:

- session key lacks tenant/project scope.
- resume ID not authorized.
- retention undefined.
- delete/fork behavior missing.

Fix:

- scope keys.
- validate resume ownership.
- define retention/deletion.
- test cross-tenant isolation.

## MCP Server Failure

Symptoms:

- agent cannot find tool.
- server startup timeout.
- untrusted tool appears.
- secrets leak to MCP process.

Check:

- MCP config source.
- server command/URL.
- env vars.
- startup logs.
- tool names.
- product policy for inherited project config.

Fix:

- configure MCP explicitly.
- pass only required env vars.
- handle startup failure.
- block untrusted config.
