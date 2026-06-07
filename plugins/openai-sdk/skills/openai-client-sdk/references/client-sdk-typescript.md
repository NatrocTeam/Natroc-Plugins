# Client SDK TypeScript

Use this when implementing the `openai` package in TypeScript or JavaScript.

## Runtime And Install

- Install with `npm install openai`, or the equivalent package manager command.
- TypeScript 4.9+ is supported.
- Node.js 20 LTS or later is supported.
- Deno, Bun, Cloudflare Workers, Vercel Edge Runtime, Nitro, and Jest node
  environment are supported.
- Browser use is disabled by default because normal API keys must not ship to
  users. Do not set `dangerouslyAllowBrowser` in public applications.
- React Native is not supported by this Client SDK.

## Client Construction

```ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 60_000,
});
```

Prefer a shared client module instead of constructing ad hoc clients in every
route. Add `organization`, `project`, `baseURL`, custom `fetch`, or
`fetchOptions` only when the project already needs them.

## Responses API

Use Responses for new text or multimodal generation.

```ts
const response = await openai.responses.create({
  model: process.env.OPENAI_MODEL ?? "gpt-5.5",
  instructions: "Answer as a concise product support assistant.",
  input: "Explain how refunds work.",
});

return response.output_text;
```

For structured output, prefer the official structured output fields available
in the current SDK version or the project's existing helper wrappers. Do not
parse model text with fragile regular expressions when the API can return a
typed structure.

## Chat Completions

Chat Completions remains supported and is appropriate when maintaining an
existing chat-completions code path.

```ts
const completion = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL ?? "gpt-5.5",
  messages: [
    { role: "developer", content: "Answer in one paragraph." },
    { role: "user", content: "What changed in the order?" },
  ],
});

return completion.choices[0]?.message?.content ?? "";
```

Do not migrate a working Chat Completions path unless the requested feature
needs Responses-only behavior.

## Streaming

Use `stream: true` when the caller consumes incremental events.

```ts
const stream = await openai.responses.create({
  model: process.env.OPENAI_MODEL ?? "gpt-5.5",
  input: "Write three release note bullets.",
  stream: true,
});

for await (const event of stream) {
  // Handle event.type and event payload explicitly in app code.
  console.log(event);
}
```

In web frameworks, convert events into the framework's streaming response
format. Test cancellation and partial-output behavior.

## Files

File upload parameters accept `File`, fetch `Response`, Node `fs.ReadStream`,
or the SDK `toFile` helper.

```ts
import fs from "node:fs";

await openai.files.create({
  file: fs.createReadStream("input.jsonl"),
  purpose: "fine-tune",
});
```

Use `fs.createReadStream()` for Node files. In non-Node runtimes, use the
runtime's `File`, `Blob`, or `Response` surface.

## Webhooks

Verify against the raw body string before JSON parsing.

```ts
const body = await request.text();
const event = openai.webhooks.unwrap(body, request.headers);

switch (event.type) {
  case "response.completed":
    break;
  case "response.failed":
    break;
  default:
    break;
}
```

If the framework parses body automatically, configure the route to preserve the
raw body. Return `400` for invalid signatures.

## Realtime

Use Realtime when the app needs low-latency text/audio interaction over
WebSocket.

```ts
import { OpenAIRealtimeWebSocket } from "openai/realtime/websocket";

const rt = new OpenAIRealtimeWebSocket({
  model: process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime-2",
});

rt.on("response.output_text.delta", (event) => {
  process.stdout.write(event.delta);
});
```

Handle connection lifecycle, reconnect strategy, and server error events in
application code.

## Errors And Request IDs

The SDK throws subclasses of `OpenAI.APIError` for API failures.

```ts
try {
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.5",
    input: "Ping",
  });
  console.log(response._request_id);
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    console.error({
      requestId: error.request_id,
      status: error.status,
      name: error.name,
    });
  }
  throw error;
}
```

Common status mappings include `400 BadRequestError`, `401
AuthenticationError`, `403 PermissionDeniedError`, `404 NotFoundError`, `422
UnprocessableEntityError`, `429 RateLimitError`, `>=500 InternalServerError`,
and connection errors without an HTTP status.

## Retries, Timeouts, And Pagination

- The SDK retries connection errors, 408, 409, 429, and 5xx responses 2 times
  by default.
- Set `maxRetries` globally or per request.
- Default timeout is 10 minutes. Configure lower values for web routes.
- List methods are async iterable.

```ts
for await (const job of openai.fineTuning.jobs.list({ limit: 20 })) {
  console.log(job.id);
}
```

## Azure OpenAI

Use `AzureOpenAI` instead of `OpenAI` for Azure OpenAI resources. Azure API
shape can differ from the core API shape, so types may not always match
perfectly.

```ts
import { AzureOpenAI } from "openai";

const client = new AzureOpenAI({
  apiVersion: process.env.OPENAI_API_VERSION,
  azureADTokenProvider,
});
```

Use deployment names where Azure expects deployments, and keep Azure endpoint,
API version, and credentials in environment or existing app config.
