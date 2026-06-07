# Testing Patterns

Use the repository's existing test framework first. These patterns show what to
test, not a mandatory library choice.

## Client SDK Unit Tests

Mock at the boundary where your application calls the SDK. Assert the request
shape and app behavior, not SDK internals.

TypeScript example shape:

```ts
const create = vi.fn().mockResolvedValue({
  output_text: "ok",
  _request_id: "req_test",
});

const client = { responses: { create } };

await service.generateSummary(client as never, "input");

expect(create).toHaveBeenCalledWith(
  expect.objectContaining({
    model: expect.any(String),
    input: "input",
  }),
);
```

Python example shape:

```python
client.responses.create.return_value.output_text = "ok"

result = service.generate_summary(client, "input")

client.responses.create.assert_called_once()
assert result == "ok"
```

## Streaming Tests

Represent streams as async iterables (TypeScript) or iterables/async iterables
(Python). Test:

- Event type filtering.
- Accumulated text or emitted chunks.
- Cancellation/cleanup if the app exposes cancellation.
- Error events for Realtime flows.

## Webhook Tests

Test these cases:

- Valid raw body and valid signature.
- Invalid signature returns a failure response.
- Body parsed before verification is not used.
- Unknown event type does not crash.
- Duplicate event is idempotent.

Do not build webhook tests that only pass parsed JSON to the handler if the real
framework receives raw bytes or strings.

## Agents SDK Tests

Test agent code around deterministic seams:

- Tool functions as normal functions.
- Tool schema generation or validation.
- Guardrail functions.
- Handoff routing rules in prompt/config.
- Session persistence behavior with fake stores.
- Max-turn/error handler fallbacks.

Use integration tests for live model behavior only when explicitly gated by an
environment variable such as `OPENAI_INTEGRATION_TEST=1`.

## Snapshot Guidance

Avoid snapshotting raw model text in normal tests. Prefer:

- Structured output schema validation.
- Tool call/request shape assertions.
- App-level state changes.
- Redacted trace/log payloads.

## Failure Paths

Add tests for:

- `429`/rate limit behavior.
- API connection timeout.
- SDK API status errors with request IDs.
- Tool timeout or exception.
- Guardrail tripwire.
- Invalid structured output.
- Webhook signature failure.
