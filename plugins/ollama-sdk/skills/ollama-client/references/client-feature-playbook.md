# Client Feature Playbook

Use this reference to implement or validate common Ollama client features.

## Direct Chat

Use chat when a conversation history matters:

1. Build message history as ordered messages.
2. Include system/developer-like instructions as `role: "system"` only when the
   app has a clear instruction boundary.
3. Configure model through existing config.
4. Use `options.temperature = 0` for deterministic extraction/classification.
5. Handle empty response content.
6. Test request shape and error mapping.

Validation checks:

- Messages preserve intended order.
- User data is not mixed into trusted system instructions.
- Model name is configurable.
- Failure paths are user-appropriate.

## Generate

Use generate when there is one prompt rather than a chat transcript:

1. Pass `model` and `prompt`.
2. Use `system` only when overriding model system prompt intentionally.
3. Use `template`/`raw` only when repository needs template-level control.
4. Use `suffix` for fill-in-middle style behavior.
5. Use `stream` only when caller consumes the iterator.
6. Parse `response.response`, not chat `message.content`.

Validation checks:

- Chat code does not accidentally call generate when it needs tool calls or
  message history.
- Generate code does not assume chat response shape.

## Streaming Chat Or Generate

Implementation steps:

1. Enable stream with `stream: true` or `stream=True`.
2. Iterate over all chunks.
3. Extract the right field:
   - Chat: `part.message.content`.
   - Generate: `part.response`.
4. Handle final chunks and empty chunks.
5. Handle iterator errors.
6. Provide cancellation/abort path for user-facing streams.
7. Do not store partial output as complete data until stream completes unless
   the product expects partial state.

Validation checks:

- Iterator is actually consumed.
- Errors inside the stream are caught.
- TypeScript abort behavior is understood: `abort()` affects all active streams
  on the same client.
- Long streams do not leak connections.

## Structured Outputs

Implementation steps:

1. Define a schema with Zod, Pydantic, or a manual JSON schema.
2. Pass schema as `format`.
3. Set low temperature where deterministic extraction is expected.
4. Parse returned JSON string from `message.content` or `response.response`.
5. Validate parsed output against the same schema.
6. Return domain-specific validation errors to the app.

Validation checks:

- Supplying `format` is not treated as sufficient validation.
- Invalid JSON is handled.
- Missing required fields are handled.
- Parsed data is not used before validation.

## Tool Calls

Implementation steps:

1. Define narrow tool schemas and descriptions.
2. Submit tools in a chat request.
3. Inspect `response.message.tool_calls`.
4. For each tool call:
   - Check the tool name against an allowlist.
   - Validate and cast arguments.
   - Enforce permissions for side effects.
   - Execute the local function.
   - Append assistant tool-call message.
   - Append a tool result message.
5. Call chat again to let the model produce the final answer.

Validation checks:

- Tool names are not dispatched dynamically without an allowlist.
- Tool arguments are not trusted.
- Side-effecting tools have permissions and audit logs.
- Tool results are compact and model-usable.
- Multiple tool calls are handled deliberately.

## Embeddings

Implementation steps:

1. Use `embed`.
2. Accept a string or list of strings.
3. Configure embedding model through project config.
4. Store model name and dimension with vectors.
5. Avoid mixing embeddings from different models without an index migration.
6. Test vector length and request shape, not semantic similarity in unit tests.

Validation checks:

- New Python code does not use deprecated `embeddings`.
- Batch input is handled correctly.
- Truncation behavior is explicit when documents may exceed context.

## Multimodal Images

Implementation steps:

1. Use a model that supports images.
2. Accept image bytes, base64, or file paths according to language/runtime.
3. Validate file existence, file type, size, and ownership before sending.
4. Avoid logging base64 image data.
5. Test request shape with a tiny fixture.

Validation checks:

- Missing image files do not produce unclear errors.
- Browser paths are not passed where bytes/base64 are required.
- Private image data is not logged.

## Thinking And Logprobs

Implementation steps:

1. Enable `think` only for models that support it.
2. Decide whether thinking content can be logged or shown.
3. Enable `logprobs` and `top_logprobs` only when the product needs token
   probabilities and the model supports them.
4. Handle absence of fields gracefully.

Validation checks:

- Code does not require `thinking` or `logprobs` when model support is optional.
- Sensitive thinking content is not stored without policy.

## Web Search And Web Fetch

Implementation steps:

1. Use cloud API credentials through server-side env/config.
2. Pass bearer authorization headers.
3. Validate user-provided URLs before web fetch.
4. Limit result count.
5. Treat fetched content as untrusted.

Validation checks:

- No browser-exposed bearer token.
- Python sync web search/fetch has bearer auth header or `OLLAMA_API_KEY`.
- Inputs are validated and logged safely.
