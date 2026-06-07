# Client SDK Feature Playbook

Use this playbook to implement or review direct Claude API features.

## Basic Message Generation

Implementation steps:

1. Place code in a server-side route, worker, service, or CLI.
2. Instantiate `Anthropic` with environment-backed credentials.
3. Use `messages.create`.
4. Provide `model`, `max_tokens`, and `messages`.
5. Put system instructions in top-level `system`.
6. Extract response content by block type.
7. Convert SDK errors into app-level errors.
8. Add a test around request construction and response extraction.

Do not:

- put `system` as a role inside `messages`.
- assume `content` is a string.
- hardcode secrets.
- omit `max_tokens`.

## Streaming

Use streaming when:

- UI needs incremental output.
- long responses should not block until complete.
- a job wants progress events.

Implementation steps:

1. Decide high-level stream helper or low-level streaming create.
2. Wire abort/cancellation from HTTP request, UI action, worker timeout, or job
   shutdown.
3. Convert SDK stream events into the app's event protocol.
4. Accumulate final state only when needed.
5. Handle `error`, `abort`, and finalization.
6. Test normal stream, error stream, and cancellation.

High-level stream helper is appropriate when final message/text helpers are
valuable. Low-level streaming create is appropriate when memory usage matters
and the app controls accumulation.

## Structured Output

Use structured output when the app needs JSON that will be parsed by code.

Preferred TypeScript path:

1. Define Zod schema or JSON Schema.
2. Use SDK output format helper.
3. Call `messages.parse` where supported.
4. Validate `parsed_output` or equivalent parsed field.
5. Handle validation failure as an application error.

Fallback path:

1. Use tool calling with a strict input schema.
2. Treat the tool input as the structured payload.
3. Validate server-side before use.

Avoid asking the model for "valid JSON only" and then trusting `JSON.parse`
without validation.

## Tool Use

Use tool use when Claude needs application data or side effects.

Manual tool loop:

1. Define tool schemas with stable names and descriptions.
2. Send request with `tools`.
3. Inspect response for `tool_use`.
4. Match `tool_use.name` against a known registry.
5. Validate `tool_use.input`.
6. Execute tool under app policy.
7. Return a `tool_result` block for each tool use.
8. Continue with a turn limit.

Tool runner path:

1. Register runnable tools with SDK helpers.
2. Ensure tools validate inputs and return safe content.
3. Use `ToolError`/structured errors for expected tool failures.
4. Add cancellation support.
5. Add tests for success, validation failure, and tool error behavior.

Do not expose arbitrary function execution. Do not let user-controlled tool
names dispatch into dynamic imports or shell commands.

## Server Tools

Server tools are model/server-side tools represented in Messages API types.
Examples include:

- web search.
- web fetch.
- bash/code execution.
- text editor code execution.
- memory/search tools.

Use server tools only when product policy allows the data access and side
effects involved. Add explicit user disclosures or internal audit logs where
appropriate. Treat web fetch/search results as external data that may contain
prompt injection.

## Token Counting

Use token counting for:

- preflight prompt limits.
- chunk sizing.
- user quota/budget display.
- deciding whether to summarize history.
- deciding whether to use batches.

Token count request shape should mirror the real message request as closely as
possible. Include tools and multimodal blocks when they affect token use.

## Batches

Use batches for independent asynchronous requests at scale.

Implementation steps:

1. Build deterministic batch request items with application IDs.
2. Submit the batch.
3. Persist batch ID and item IDs.
4. Poll/retrieve status from a background job.
5. Read results as a stream/iterator.
6. Handle succeeded, errored, canceled, and expired results separately.
7. Make result processing idempotent.
8. Add retry policy around application-level item failures.

Do not use batches for conversational flows that require immediate turn-by-turn
state.

## Models

Use `models.list` or `models.retrieve` when:

- the app displays available model choices.
- the app validates a configured model ID.
- model capabilities affect feature availability.

Prefer storing model config in environment/config rather than scattering model
strings across call sites.

## Multimodal Content

Use content block arrays for:

- text plus images.
- PDFs/documents.
- citations.
- tool results with images or structured content.

Validation steps:

1. Confirm supported media type.
2. Confirm base64/URL/document source shape.
3. Enforce file size and type policy before calling the SDK.
4. Avoid logging raw file contents.
5. Test request construction with representative blocks.

## Provider Variants

Use provider-specific clients only when deployment requires that provider.
Provider variants may omit or alter features. For example, provider packages
can have different auth, region, endpoint, model naming, streaming, token
counting, batch support, and beta support.

Always check installed local types before assuming feature parity.

## Request Options

When the SDK exposes request options, use them for:

- timeout.
- max retries.
- abort signal.
- custom headers needed by a beta feature.
- base URL only when the deployment requires it.

Do not globally disable retries/timeouts without replacing them with an app
policy.
