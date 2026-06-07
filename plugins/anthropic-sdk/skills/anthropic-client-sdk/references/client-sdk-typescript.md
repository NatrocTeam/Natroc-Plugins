# Client SDK TypeScript

Use this reference for `@anthropic-ai/sdk` in Node.js TypeScript/JavaScript
applications. The SDK targets server-side Node.js 18+.

## Installation

Use the repository's package manager:

```sh
npm install @anthropic-ai/sdk
```

Use `pnpm add`, `yarn add`, or the existing package manager equivalent when the
lockfile indicates one.

## Basic Client

```ts
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

The `apiKey` option can be omitted when `ANTHROPIC_API_KEY` is available in the
environment, but explicit config is often clearer in application wrappers.

## Basic Message

```ts
const message = await anthropic.messages.create({
  model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
  max_tokens: 1024,
  system: "Respond as a concise backend engineering assistant.",
  messages: [
    {
      role: "user",
      content: "Summarize the failure mode in this log.",
    },
  ],
});

const text = message.content
  .filter((block) => block.type === "text")
  .map((block) => block.text)
  .join("");
```

Do not cast `message.content` to `string`. It is an array of content blocks.

## Framework Wrapper Pattern

Prefer a small server-side wrapper:

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function completeWithClaude(input: {
  prompt: string;
  system?: string;
}) {
  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
    max_tokens: 1024,
    system: input.system,
    messages: [{ role: "user", content: input.prompt }],
  });

  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
```

This wrapper gives tests a stable seam without exposing SDK details throughout
the app.

## Streaming Helper

Use `messages.stream` when the app needs helper events and final aggregation:

```ts
const stream = anthropic.messages.stream({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a short release note." }],
});

stream.on("text", (delta) => {
  process.stdout.write(delta);
});

const finalText = await stream.finalText();
```

When handling HTTP streaming, connect request cancellation to `stream.abort()`
or an abort signal where the local SDK supports it.

Use `messages.create({ stream: true, ... })` when an async iterable of raw
stream events is preferred and the app handles accumulation.

## Structured Output

When supported by the installed SDK, use Zod:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const Result = z.object({
  title: z.string(),
  risk: z.enum(["low", "medium", "high"]),
});

const message = await anthropic.messages.parse({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Classify this issue: ..." }],
  output_config: {
    format: zodOutputFormat(Result),
  },
});

const parsed = message.parsed_output;
```

Use raw JSON Schema helper when Zod is not part of the project.

## Tool Runner

When supported by the installed SDK, use beta tool helpers for typed automatic
tool loops:

```ts
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const getWeather = betaZodTool({
  name: "get_weather",
  description: "Get current weather for a city.",
  inputSchema: z.object({
    location: z.string(),
  }),
  run: async ({ location }) => `Weather in ${location}: foggy`,
});

const finalMessage = await anthropic.beta.messages.toolRunner({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Weather in San Francisco?" }],
  tools: [getWeather],
});
```

Use `ToolError` where the helper supports structured tool error responses.

## Web Search Example Shape

Server tools are passed in `tools` with server-defined names/types:

```ts
const message = await anthropic.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Find recent public information." }],
  tools: [
    {
      name: "web_search",
      type: "web_search_20250305",
    },
  ],
});
```

Treat web results as untrusted external content. Do not feed them into
privileged tools without validation.

## Count Tokens

```ts
const count = await anthropic.messages.countTokens({
  model: "claude-sonnet-4-5",
  messages: [{ role: "user", content: "How large is this request?" }],
});
```

Use token counting before sending large history, file summaries, or expensive
batch items.

## Batches

```ts
const batch = await anthropic.messages.batches.create({
  requests: [
    {
      custom_id: "item-1",
      params: {
        model: "claude-sonnet-4-5",
        max_tokens: 256,
        messages: [{ role: "user", content: "Summarize item 1." }],
      },
    },
  ],
});
```

Persist `batch.id` and `custom_id` mapping. Process result variants explicitly.

## Error Handling

Catch SDK errors at the boundary:

```ts
try {
  return await completeWithClaude({ prompt });
} catch (error) {
  // Log sanitized metadata only.
  throw new Error("Claude request failed");
}
```

Do not log raw prompt, response content, tool input, file blocks, or API keys.

## Validation Notes

Check local package types when using:

- beta helpers.
- provider variant packages.
- `messages.parse`.
- beta server tools.
- request option names.

The correct implementation should match installed local types, not assumptions
from memory.
