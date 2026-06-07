# Client SDK API Surface

This reference summarizes the direct Anthropic Claude Client SDK surface used by
the plugin.

## Packages

| Language              | Package             | Primary client | Async client                                      |
| --------------------- | ------------------- | -------------- | ------------------------------------------------- |
| TypeScript/JavaScript | `@anthropic-ai/sdk` | `Anthropic`    | async by default through promises/async iterables |
| Python                | `anthropic`         | `Anthropic`    | `AsyncAnthropic`                                  |

## Core Client Construction

TypeScript:

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

Python:

```python
from anthropic import Anthropic

client = Anthropic()
```

The Python and TypeScript clients read `ANTHROPIC_API_KEY` from the environment
by default when the app does not pass `api_key`/`apiKey` explicitly.

## Messages

Messages API is the primary direct Claude API surface.

TypeScript:

- `client.messages.create({ ...params }) -> Message`
- `client.messages.stream(body, options?) -> MessageStream`
- `client.messages.countTokens({ ...params }) -> MessageTokensCount`

Python:

- `client.messages.create(**params) -> Message`
- `client.messages.stream(...) -> MessageStreamManager`
- `client.messages.count_tokens(**params) -> MessageTokensCount`

Common request parameters:

- `model`
- `max_tokens`
- `messages`
- `system`
- `tools`
- `tool_choice`
- `metadata`
- `stream`
- multimodal content blocks
- structured output config where supported by the installed SDK

Common response fields:

- `id`
- `type`
- `role`
- `content`
- `model`
- `stop_reason`
- `stop_sequence`
- `usage`

## Message Roles

Use message roles:

- `user`
- `assistant`

Do not use a message role named `system`. Put system instructions in the
top-level `system` parameter.

## Content Blocks

Message content is an array of blocks. Common blocks include:

- text blocks.
- image blocks.
- document/PDF blocks.
- tool use blocks.
- tool result blocks.
- server tool use/result blocks.
- thinking/redacted thinking blocks where enabled.
- citation blocks/location metadata.

Do not assume `message.content` is a plain string. Extract text by filtering for
text blocks.

## Streaming

TypeScript supports two common streaming modes:

- `client.messages.stream(...)`: high-level `MessageStream` with events,
  accumulated snapshots, `finalMessage()`, `finalText()`, `abort()`, and async
  iteration.
- `client.messages.create({ stream: true, ... })`: lower-level async iterable
  that uses less memory because it does not accumulate a final message object.

Python supports streaming managers around `client.messages.stream(...)` and
async equivalents for `AsyncAnthropic`.

Use streaming when the UI or job can process partial output. Add cancellation
handling for disconnected HTTP clients, aborted jobs, and user cancellation.

## Token Counting

Use token counting before expensive or constrained requests:

TypeScript:

```ts
const count = await client.messages.countTokens({
  model,
  messages,
});
```

Python:

```python
count = client.messages.count_tokens(
    model=model,
    messages=messages,
)
```

Use token counting for admission control, prompt splitting, model selection,
budget estimates, and preflight validation. Do not use rough character counts
when the SDK exposes exact token counting for the request shape.

## Batches

Use message batches for asynchronous workloads with many independent requests.

TypeScript:

- `client.messages.batches.create({ ...params })`
- `client.messages.batches.retrieve(messageBatchID)`
- `client.messages.batches.list({ ...params })`
- `client.messages.batches.delete(messageBatchID)`
- `client.messages.batches.cancel(messageBatchID)`
- `client.messages.batches.results(messageBatchID)`

Python:

- `client.messages.batches.create(**params)`
- `client.messages.batches.retrieve(message_batch_id)`
- `client.messages.batches.list(**params)`
- `client.messages.batches.delete(message_batch_id)`
- `client.messages.batches.cancel(message_batch_id)`
- `client.messages.batches.results(message_batch_id)`

Batch result handling should account for succeeded, errored, canceled, and
expired individual responses.

## Models

Use model listing/retrieval when the app needs model metadata rather than a
hardcoded model string.

TypeScript:

- `client.models.retrieve(modelID, params?)`
- `client.models.list(params?)`

Python:

- `client.models.retrieve(model_id)`
- `client.models.list(**params)`

## Tools

Client SDK tool use can be manual or helper-driven.

Manual loop:

1. Send a request with `tools`.
2. Inspect response content for `tool_use`.
3. Execute safe matching tool in application code.
4. Send a new user message containing `tool_result` blocks.
5. Continue until the model produces final text or the app reaches limits.

Helper loop:

- TypeScript: `client.beta.messages.toolRunner(...)` where supported.
- Python: `client.beta.messages.tool_runner(...)` with `@beta_tool` functions.

Use tool helpers when local SDK version supports them and the app can register
safe tool schemas.

## Structured Output

The TypeScript SDK exposes structured output helpers such as Zod and JSON
Schema output formats in supported versions. Prefer these helpers over
regex/string parsing when the application requires typed JSON.

Python support should be verified against installed local types. When a helper
is unavailable, prefer a tool schema or explicit JSON schema prompt plus strict
validation in application code.

## Beta Surface

The SDK exposes beta resources under `client.beta`. Treat beta resources as
version-sensitive:

- inspect local package types before using.
- document required beta headers or version markers where the app passes them.
- add tests around request construction.
- avoid making stable-product guarantees around beta-only behavior.

Common beta areas include messages, batches, models, files, sessions, agents,
memory stores, environments, skills, webhooks, credentials, vaults, and user
profiles.

## Error Types

Shared error types include authentication, permission, billing, invalid request,
not found, rate limit, overloaded, gateway timeout, and generic API errors.

Application wrappers should:

- preserve enough context for debugging.
- avoid leaking prompts, files, transcripts, or credentials.
- expose retryable/non-retryable classification where useful.
- log request IDs when exposed by the SDK/runtime.
