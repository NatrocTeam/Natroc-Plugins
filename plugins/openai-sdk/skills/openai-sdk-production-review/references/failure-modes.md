# Failure Modes And Fixes

Use this file when debugging OpenAI SDK issues or reviewing production code.

## Authentication Failure

Symptoms:

- 401 errors.
- Works locally but fails in deployment.
- Browser bundle contains missing env var.

Likely causes:

- Missing `OPENAI_API_KEY`.
- Wrong secret name in deployment.
- Secret exposed as public env var but not available server-side.
- Azure and core OpenAI env vars mixed incorrectly.

Fix:

- Verify secret exists in runtime.
- Keep key server-side.
- Use Azure-specific client/config for Azure.
- Add startup config validation.

## Permission Failure

Symptoms:

- 403 errors.
- Model/resource exists but request denied.

Likely causes:

- Project lacks model/tool/resource permission.
- Admin API key scope insufficient.
- Azure deployment permissions differ.

Fix:

- Surface clear app error.
- Check project/org configuration.
- Do not retry aggressively; permission failures are not transient.

## Bad Request

Symptoms:

- 400 errors.
- Model behavior error in Agents SDK.
- Structured output validation fails.

Likely causes:

- Wrong request shape.
- Unsupported field for installed SDK/API version.
- Tool schema invalid.
- Chat/Responses payloads mixed.
- Reasoning/history items replayed incorrectly.

Fix:

- Inspect installed SDK types/version.
- Reduce to minimal request.
- Validate schema with local typechecker/tests.
- For Agents SDK replay issues, consider reasoning item ID policy where
  supported.

## Rate Limit

Symptoms:

- 429 errors.
- Intermittent failures under load.

Fix:

- Use SDK retries.
- Add app-level queue/backoff for batch jobs.
- Reduce concurrency.
- Cache or batch where safe.
- Return retryable status to callers.
- Avoid retrying non-idempotent mutations without idempotency.

## Timeout

Symptoms:

- Web route times out.
- SDK timeout exception.
- Streaming starts but never completes.

Fix:

- Set route-appropriate SDK timeout.
- Move long work to worker.
- Stream output if product supports it.
- Add tool timeouts in Agents SDK.
- Add cancellation handling.

## Streaming Breakage

Symptoms:

- UI hangs.
- Partial output lost.
- Unknown event crashes handler.

Fix:

- Translate event types explicitly.
- Add default unknown-event branch.
- Flush terminal event.
- Persist partial output only by policy.
- Test stream with fake event iterator.

## Webhook Verification Failure

Symptoms:

- Valid-looking webhook rejected.
- Invalid webhook accepted.
- Verification works locally but not in framework.

Likely causes:

- Parsed body used instead of raw body.
- Body was re-stringified.
- Headers not passed in expected shape.
- Wrong webhook secret.

Fix:

- Configure raw body.
- Use unwrap/verify directly.
- Test with raw fixture.
- Return failure on invalid signatures.

## Realtime Connection Failure

Symptoms:

- WebSocket closes.
- Error events arrive but app ignores them.
- Browser cannot connect securely.

Fix:

- Handle `error` events.
- Add reconnect/backoff.
- Use server-issued ephemeral/scoped auth for browser.
- Keep normal API keys server-side.
- Separate audio device errors from SDK connection errors.

## Agents Tool Loop

Symptoms:

- Agent repeatedly calls same tool.
- Max turns exceeded.
- Tool result not enough for model to finish.

Fix:

- Improve tool description and return shape.
- Add `toolUseBehavior` / equivalent when tool result should be final.
- Add max-turn fallback.
- Reset forced tool choice after tool call where configurable.
- Return clear failure messages from tools.

## Handoff Misrouting

Symptoms:

- Triage agent chooses wrong specialist.
- Specialist receives too much irrelevant history.

Fix:

- Add precise handoff descriptions.
- Add examples in instructions.
- Use input filters.
- Split overlapping specialists.
- Add tests around routing prompts/config.

## Session Duplication

Symptoms:

- Conversation history duplicated.
- Agent repeats old content.
- Server-managed continuation conflicts with session memory.

Fix:

- Choose one state strategy.
- Do not mix SDK sessions with `conversation_id` or `previous_response_id` in
  the same run unless explicitly supported.
- Trim or compact history.
- Inspect what items are persisted.

## Sensitive Data Leak

Symptoms:

- API key appears in trace/log/tool output.
- User private data shown to wrong tenant.

Fix:

- Stop logging raw prompts/payloads.
- Redact before tool/model calls.
- Enforce tenant permissions before retrieval/tool execution.
- Rotate exposed keys.
- Add tests for redaction and tenant filters.
