# Client SDK API Surface

This file maps the major OpenAI Client SDK surfaces an agent should recognize
when reading or writing code. It is intentionally local and self-contained.

## Canonical Client Names

TypeScript and JavaScript:

- Package: `openai`
- Main client: `OpenAI`
- Async model: normal JavaScript `Promise` APIs.
- Streaming model: async iterable returned by streaming calls.
- Azure client: `AzureOpenAI`

Python:

- Package: `openai`
- Sync client: `OpenAI`
- Async client: `AsyncOpenAI`
- Streaming model: sync iterable or async iterable depending on client.
- Azure client: `AzureOpenAI`

## Core Resources

Use these surfaces for normal application development:

| Product need                      | TypeScript shape                                        | Python shape                                            | Notes                                            |
| --------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| New text or multimodal generation | `client.responses.create(...)`                          | `client.responses.create(...)`                          | Prefer this for new work.                        |
| Existing chat style integration   | `client.chat.completions.create(...)`                   | `client.chat.completions.create(...)`                   | Keep when maintaining existing code.             |
| Embeddings                        | `client.embeddings.create(...)`                         | `client.embeddings.create(...)`                         | Store vectors in your database/vector store.     |
| Files                             | `client.files.create/retrieve/list/delete/content(...)` | `client.files.create/retrieve/list/delete/content(...)` | Use native file abstractions.                    |
| Images                            | `client.images.generate/edit/createVariation(...)`      | `client.images.generate/edit/create_variation(...)`     | Method names follow language casing.             |
| Audio transcription               | `client.audio.transcriptions.create(...)`               | `client.audio.transcriptions.create(...)`               | Use file input appropriate to runtime.           |
| Audio translation                 | `client.audio.translations.create(...)`                 | `client.audio.translations.create(...)`                 | Convert speech to translated text.               |
| Text-to-speech                    | `client.audio.speech.create(...)`                       | `client.audio.speech.create(...)`                       | Returns response/content stream style output.    |
| Moderation                        | `client.moderations.create(...)`                        | `client.moderations.create(...)`                        | Use for policy checks, not as only safety layer. |
| Models                            | `client.models.list/retrieve/delete(...)`               | `client.models.list/retrieve/delete(...)`               | Delete only where supported.                     |
| Webhooks                          | `client.webhooks.unwrap/verifySignature(...)`           | `client.webhooks.unwrap/verify_signature(...)`          | Requires raw body.                               |
| Realtime                          | `OpenAIRealtimeWebSocket` or client realtime helpers    | `client.realtime.connect(...)`                          | Handle event loop and error events.              |
| Conversations                     | `client.conversations...`                               | `client.conversations...`                               | Server-managed conversation state.               |
| Evals                             | `client.evals...`                                       | `client.evals...`                                       | Evaluation workflows and runs.                   |
| Containers                        | `client.containers...`                                  | `client.containers...`                                  | Managed container resources.                     |
| Skills                            | `client.skills...`                                      | `client.skills...`                                      | Skill resource create/list/update/delete.        |
| Videos                            | `client.videos...`                                      | `client.videos...`                                      | Video generation/editing surfaces where enabled. |

## Responses Resource

Typical methods:

- `create`: create a model response.
- `retrieve`: fetch a response by ID.
- `delete`: delete a stored response where supported.
- `cancel`: cancel an in-progress response where supported.
- `inputItems.list`: list input items for a response.
- `inputTokens.create`: count or inspect input token behavior where supported.

Implementation rules:

- Use `instructions` for high-level behavior that belongs with the request.
- Use `input` for the user/task payload.
- Use multimodal input content arrays when text plus images/files are needed.
- Use `stream: true` only when the caller consumes events.
- Use structured output features when the app needs typed JSON.
- Avoid regex extraction from prose for business-critical data.
- Store or forward `response.id` if later continuation, retrieval, cancellation,
  or audit requires it.

## Chat Completions Resource

Typical methods:

- `create`
- `retrieve`
- `update`
- `list`
- `delete`
- `messages.list` for stored messages where supported.

Implementation rules:

- Use this primarily to maintain existing code.
- Preserve existing `messages` construction behavior unless intentionally
  migrating.
- Prefer `developer` messages for app instructions in modern examples.
- Handle `choices[0].message.content` being missing or null.
- If streaming, consume chunks according to the existing app abstraction.

## Files And Uploads

TypeScript accepted file forms include:

- Node `fs.ReadStream`
- Web `File`
- fetch `Response`
- SDK `toFile` helper

Python accepted file forms include:

- `PathLike`
- bytes
- file tuple forms such as `(filename, contents, media_type)`

Rules:

- Do not manually construct multipart bodies unless the SDK surface cannot
  express the required input.
- Use file purpose values appropriate to the API being called.
- When uploading user files, validate size, type, and permissions before the SDK
  call.
- In async Python, `PathLike` file reads are handled asynchronously by the SDK.

## Webhooks

Critical invariant:

- The body must be the exact raw JSON string or bytes received from the HTTP
  request.
- Do not parse JSON before verification.
- Do not reconstruct JSON from parsed objects for verification.

TypeScript:

- `client.webhooks.unwrap(rawBody, headers)` verifies and parses.
- `client.webhooks.verifySignature(rawBody, headers)` verifies only.

Python:

- `client.webhooks.unwrap(raw_body, headers)` verifies and parses.
- `client.webhooks.verify_signature(raw_body, headers)` verifies only.

Webhook handler rules:

- Return a failure status for invalid signatures.
- Keep handlers idempotent because providers may retry events.
- Treat unknown event types as non-fatal.
- Do not log full payloads if they contain sensitive user data.

## Realtime

Use Realtime for low-latency text/audio interaction.

Recognize these event concepts:

- Client sends session updates.
- Client sends conversation items.
- Client starts responses.
- Server emits output deltas and completion events.
- Server can emit `error` events that must be handled without assuming the
  connection closes automatically.

Rules:

- Own connection lifecycle explicitly.
- Handle reconnect/backoff at the application layer.
- Keep browser token issuance server-side.
- Avoid putting normal API keys into frontend Realtime code.
- Test error event handling.

## Errors

TypeScript:

- Catch `OpenAI.APIError` for SDK/API errors.
- Useful fields include status, name, headers, and request ID when present.

Python:

- All SDK errors inherit from `openai.APIError`.
- `APIConnectionError` means the server could not be reached.
- `APIStatusError` means the server returned a non-2xx status.
- `RateLimitError` is a specific rate-limit status path.

Common status mapping:

| Status    | Meaning                                                     |
| --------- | ----------------------------------------------------------- |
| 400       | Bad request or invalid request shape.                       |
| 401       | Missing or invalid authentication.                          |
| 403       | Permission denied.                                          |
| 404       | Resource not found.                                         |
| 422       | Request syntactically valid but semantically unprocessable. |
| 429       | Rate limit or quota pressure.                               |
| 5xx       | Server-side issue or transient platform failure.            |
| No status | Connection, DNS, timeout, or transport failure.             |

## Retries And Timeouts

Default SDK behavior:

- Retries connection failures, 408, 409, 429, and 5xx responses.
- Default retry count is 2.
- Default timeout is long enough for model calls but often too long for web
  request handlers.

Rules:

- Configure shorter timeouts for API routes.
- Avoid stacking SDK retries with outer retries unless the operation is
  idempotent.
- For mutating operations, add idempotency or safe retry design before adding
  aggressive retry loops.

## Pagination

TypeScript:

- List responses are async iterable.
- Use `for await ... of` for all pages.
- Page objects support manual next-page helpers.

Python:

- Sync list responses are iterable.
- Async list responses support `async for`.
- Page objects expose next-page helpers where appropriate.

Rules:

- Do not fetch unbounded lists in request/response paths.
- Use `limit` and application-level caps.
- In admin/reporting jobs, persist cursors or progress if large scans can fail.

## Azure OpenAI

Use Azure-specific clients:

- TypeScript: `AzureOpenAI`
- Python: `AzureOpenAI`

Azure rules:

- Azure endpoint, deployment, API version, and credentials are separate config
  concerns.
- Azure API shape can differ from the core API shape; do not assume every type
  maps perfectly.
- When Azure expects deployment names, pass deployment names rather than public
  model IDs.
- Prefer managed identity/token provider when the deployment uses cloud identity.

## Advanced Client Configuration

TypeScript:

- `fetch`: replace fetch implementation.
- `fetchOptions`: pass runtime-specific options.
- `logger` and `logLevel`: control SDK logs.
- `baseURL`: override API base URL for compatible endpoints.

Python:

- `http_client`: pass customized HTTPX or aiohttp client.
- `base_url`: override API base URL for compatible endpoints.
- `with_options(...)`: per-request overrides.
- Context manager or `.close()` for explicit resource cleanup.

Logging rules:

- Debug logs can include sensitive request/response body data.
- Redact or disable sensitive logs in production.
- Do not enable verbose SDK logs globally without a retention policy.
