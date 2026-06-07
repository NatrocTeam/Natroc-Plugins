# Client SDK Feature Playbook

This playbook tells agents how to implement common direct OpenAI API features.
Use it after choosing the Client SDK.

## Universal Implementation Procedure

1. Identify runtime: Node, edge, Python server, worker, CLI, or browser.
2. Confirm package and version:
   - TypeScript: `package.json`, lockfile, local type declarations.
   - Python: `pyproject.toml`, lockfile, installed package metadata when needed.
3. Locate existing config and secret patterns.
4. Create or reuse a shared client module.
5. Implement the feature with request-specific functions small enough to test.
6. Convert SDK errors into app-level behavior.
7. Add focused tests with mocked SDK boundary.
8. Run typecheck/tests/lint/build.

## Text Generation With Responses

Use when:

- New generation feature.
- Multimodal input.
- Structured output.
- You want response IDs or server-managed continuation.

Design:

- Function signature should accept domain input, not raw SDK params, unless you
  are building an SDK wrapper library.
- Keep model selection configurable.
- Put durable instructions in code/config, not user input.
- Return a domain object or string, not the whole SDK response, unless callers
  need metadata.

TypeScript outline:

```ts
export async function summarizeTicket(ticket: Ticket): Promise<string> {
  const response = await openai.responses.create({
    model: config.openai.summaryModel,
    instructions: "Summarize support tickets for an internal support team.",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: ticket.subject },
          { type: "input_text", text: ticket.body },
        ],
      },
    ],
  });

  logger.info({ requestId: response._request_id }, "OpenAI summary created");
  return response.output_text;
}
```

Python outline:

```python
def summarize_ticket(ticket: Ticket) -> str:
    response = client.responses.create(
        model=settings.openai_summary_model,
        instructions="Summarize support tickets for an internal support team.",
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": ticket.subject},
                    {"type": "input_text", "text": ticket.body},
                ],
            }
        ],
    )
    logger.info("OpenAI summary created", extra={"request_id": response._request_id})
    return response.output_text
```

Tests:

- Request includes expected model and input.
- Empty/invalid domain input fails before SDK call when appropriate.
- SDK error converts to expected app error.
- Request ID is logged or propagated.

## Structured Data Extraction

Use structured output facilities rather than parsing prose.

Design:

- Define schema near the domain use case.
- Validate at the SDK/API boundary and again at application boundary if needed.
- Include refusal/empty states if product behavior needs them.
- Add tests for invalid/missing fields.

Agent rule:

- If the installed SDK version has an official helper for schemas, use it.
- If local types show a different shape, adapt to installed types.
- Do not invent helper names.

## Streaming Text

Use when:

- UI needs incremental rendering.
- CLI should print as tokens/events arrive.
- Long responses should avoid waiting for completion.

Design:

- Separate stream creation from event translation.
- Emit app-level events, not raw SDK internals, unless the caller expects raw
  events.
- Handle cancellation.
- Persist final output only after completion or with an explicit partial-output
  policy.

Event loop rules:

- Check event type explicitly.
- Ignore or log unknown event types.
- Handle terminal events.
- Handle SDK exceptions outside the iteration.

Tests:

- Event translation.
- Unknown event does not crash.
- Cancellation closes stream/response if runtime supports it.
- Partial stream error reports useful state.

## Chat Completions Maintenance

Use when:

- Existing code already uses Chat Completions.
- The user asks for a targeted fix.
- Migration risk is outside requested scope.

Rules:

- Preserve roles and message ordering.
- Preserve existing tool/function calling behavior unless migrating.
- Handle missing `choices[0]` and missing content.
- Keep model configurable.
- Add tests for request shape.

Migration to Responses:

- Do only when requested or required by a feature.
- Add regression tests around prompt/message behavior before migration.
- Map developer/system instruction behavior deliberately.
- Verify streaming and tool behavior because event shapes differ.

## Embeddings

Use when:

- Creating vectors for search, clustering, recommendation, or similarity.

Rules:

- Normalize input preprocessing.
- Batch within API and app limits.
- Store model name/version with vector rows.
- Do not silently mix vectors from different models in one index unless the
  index supports that design.
- Add retry/idempotency for ingestion jobs.

Tests:

- Input normalization.
- Empty input handling.
- Batch splitting.
- Store call includes embedding and metadata.

## Files And Vector Workflows

Use files when API endpoints require uploaded file resources. Use vector stores
when retrieval/search resources are needed.

Rules:

- Validate file extension, MIME type, size, ownership, and purpose before
  upload.
- Use streams/paths rather than reading huge files into memory where possible.
- Store returned file IDs with domain records when later operations need them.
- Poll or wait for processing only in workers/jobs, not latency-sensitive routes,
  unless the product explicitly expects synchronous waiting.
- Add cleanup behavior for abandoned uploads when required.

## Webhooks

Implementation procedure:

1. Configure route to expose raw body.
2. Construct or reuse client with `webhookSecret` / environment.
3. Call unwrap/verify on raw body and request headers.
4. Dispatch on `event.type`.
5. Make each handler idempotent.
6. Return success only after the event is accepted or safely ignored.
7. Return failure for invalid signature.

Do not:

- Parse body before verification.
- Re-stringify parsed JSON for verification.
- Use user-supplied event type without validation.
- Log secrets or entire sensitive event payloads.

Framework notes:

- Next.js route handlers can use `await request.text()`.
- Express often needs raw body middleware for the webhook route.
- Flask can use `request.get_data(as_text=True)`.
- FastAPI can use `await request.body()` and decode if the SDK expects string.

## Realtime

Use when:

- Bidirectional low-latency text/audio conversation is required.
- The application can manage WebSocket lifecycle.

Server/browser rules:

- Normal API key stays server-side.
- If browser connects directly, issue short-lived or scoped credentials through
  a server endpoint according to the current platform pattern.
- Do not expose long-lived API keys.

Operational rules:

- Define reconnect/backoff behavior.
- Handle server `error` events.
- Handle session update acknowledgement where the app depends on it.
- Separate audio capture/playback from SDK connection code.
- Test event dispatch without a live microphone.

## Images, Audio, And Videos

Rules:

- Validate user-uploaded media before sending.
- Keep generated media storage policy explicit.
- Avoid logging base64 or binary payloads.
- For speech/audio output, stream to file/response according to framework
  conventions.
- For image/video generation, store output metadata and content references
  according to product retention rules.

## Admin And Organization APIs

Use only in trusted server-side admin tools or automation.

Rules:

- Require explicit permissions in the app.
- Avoid placing admin operations in user-facing request paths.
- Log audit metadata without secrets.
- Add dry-run mode when changing roles, keys, rate limits, certificates, data
  retention, spend alerts, or permissions.
- Do not expose admin API results to unauthorized users.

## Workload Identity

Use workload identity when long-lived API keys are inappropriate in cloud
automation.

Common providers:

- Kubernetes service account token.
- Azure managed identity.
- Google Cloud metadata identity token.
- Custom token provider.

Rules:

- Treat `apiKey` and `workloadIdentity` as mutually exclusive.
- Set identity provider ID and service account ID from config.
- Use token refresh buffers that match deployment expectations.
- Test provider failure separately from OpenAI API failure.
