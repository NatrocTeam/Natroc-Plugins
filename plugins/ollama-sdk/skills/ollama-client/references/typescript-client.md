# TypeScript Client

Use this reference for JavaScript and TypeScript code that uses the official
`ollama` package.

## Install And Imports

Install:

```sh
npm install ollama
```

Default server-side import:

```ts
import ollama from "ollama";
import { Ollama } from "ollama";
```

Browser import:

```ts
import ollama from "ollama/browser";
```

Use the browser import only for browser-compatible usage. Do not include direct
cloud API keys in browser bundles.

## Client Construction

Use the default client for simple local daemon usage:

```ts
import ollama from "ollama";

const response = await ollama.chat({
  model: "llama3.1",
  messages: [{ role: "user", content: "Why is the sky blue?" }],
});
```

Use a custom client for explicit host, custom fetch, proxy mode, or headers:

```ts
import { Ollama } from "ollama";

export const ollama = new Ollama({
  host: process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434",
  headers: process.env.OLLAMA_API_KEY
    ? { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` }
    : undefined,
});
```

For direct cloud API access:

```ts
const cloud = new Ollama({
  host: "https://ollama.com",
  headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
});
```

Keep the cloud API key server-side.

## Chat

Use `chat` for message history, tool calls, and multi-turn workflows:

```ts
const response = await ollama.chat({
  model: process.env.OLLAMA_MODEL ?? "llama3.1",
  messages: [
    { role: "system", content: "Answer concisely." },
    { role: "user", content: "Summarize this incident." },
  ],
  options: { temperature: 0 },
});

const text = response.message.content;
```

## Generate

Use `generate` for single prompt flows:

```ts
const response = await ollama.generate({
  model: process.env.OLLAMA_MODEL ?? "llama3.1",
  prompt: "Write a one-sentence summary.",
  options: { temperature: 0 },
});

const text = response.response;
```

Use `raw: true` only when intentionally bypassing model templates.

## Streaming

Streaming returns an async iterator:

```ts
const stream = await ollama.chat({
  model: "llama3.1",
  messages: [{ role: "user", content: "Explain streams." }],
  stream: true,
});

for await (const part of stream) {
  process.stdout.write(part.message.content ?? "");
}
```

Abort behavior:

- `ollama.abort()` aborts all active streamed requests on that client instance.
- For independent timeouts, create one client per stream.
- Catch `AbortError` or fetch/stream errors in user-facing code.

## Structured Output

Pass JSON schema through `format`, then parse and validate the returned content:

```ts
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const Schema = z.object({
  title: z.string(),
  priority: z.enum(["low", "medium", "high"]),
});

const response = await ollama.chat({
  model: "llama3.1",
  messages: [{ role: "user", content: "Extract a ticket title and priority." }],
  format: zodToJsonSchema(Schema),
  options: { temperature: 0 },
});

const parsed = Schema.parse(JSON.parse(response.message.content ?? "{}"));
```

Do not trust the model string just because a schema was supplied.

## Tools

Define tools with JSON schema, inspect `response.message.tool_calls`, execute
only allowlisted functions, append tool results, then call `chat` again.

```ts
const getOrderTool = {
  type: "function",
  function: {
    name: "getOrder",
    description: "Look up an order by ID.",
    parameters: {
      type: "object",
      required: ["orderId"],
      properties: {
        orderId: { type: "string", description: "Order ID" },
      },
    },
  },
};

const response = await ollama.chat({
  model: "llama3.1",
  messages,
  tools: [getOrderTool],
});

const tools = {
  getOrder: async (args: { orderId: string }) => ({ status: "processing" }),
};

for (const call of response.message.tool_calls ?? []) {
  if (call.function.name !== "getOrder") throw new Error("Unexpected tool");
  const result = await tools.getOrder({
    orderId: String(call.function.arguments.orderId),
  });
  messages.push(response.message);
  messages.push({
    role: "tool",
    content: JSON.stringify(result),
    tool_name: call.function.name,
  });
}
```

Validate arguments with a schema before executing side effects.

## Images

Message and generate images may be `Uint8Array` or base64 strings. Node usage
can also encode file paths. Browser usage should pass bytes or base64 data.

```ts
const response = await ollama.chat({
  model: "llava",
  messages: [
    { role: "user", content: "Describe this image.", images: [imageBytes] },
  ],
});
```

## Embeddings

Use `embed` for embeddings:

```ts
const response = await ollama.embed({
  model: "nomic-embed-text",
  input: ["first document", "second document"],
});

const vectors = response.embeddings;
```

Store model name and embedding dimensions with vector records.

## Model Lifecycle

TypeScript supports lifecycle calls:

```ts
await ollama.pull({ model: "llama3.1", stream: false });
const models = await ollama.list();
const info = await ollama.show({ model: "llama3.1" });
const running = await ollama.ps();
```

Important limitation: TypeScript `create` does not support the Python `files`
parameter, and Node `create` rejects `from` values that resolve to local paths.

## Validation Checklist

- Uses `ollama/browser` only in browser code.
- No cloud API key in public client code.
- Custom client host is configurable and safe.
- Streaming iterator is consumed and errors are handled.
- Tool calls are allowlisted and arguments are validated.
- Structured output is parsed and validated.
- Tests use fake fetch or client mocks rather than live model text.
