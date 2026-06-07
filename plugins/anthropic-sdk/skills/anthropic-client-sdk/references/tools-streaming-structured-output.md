# Tools, Streaming, and Structured Output

This reference covers the most failure-prone Client SDK features.

## Streaming Concepts

Streaming emits incremental events rather than waiting for a complete response.
The app must decide whether to accumulate final state.

High-level stream helpers are useful when the app needs:

- connection event.
- text deltas.
- JSON deltas.
- content block snapshots.
- final message.
- final text.
- abort controls.
- event callbacks.

Low-level streaming create is useful when:

- memory usage matters.
- the app forwards raw events.
- the app has its own accumulator.

## Streaming Review Checklist

Check:

- abort on user disconnect.
- abort on job cancellation.
- timeout for stalled streams.
- error event handling.
- finalization path.
- no writes after HTTP response close.
- no unbounded accumulation for long output.
- no logging of sensitive deltas.
- tests for cancellation and stream errors.

## Manual Tool Loop

Manual tool loops are reliable when the app needs strict control.

Algorithm:

```text
messages = initial user messages
for turn in range(max_tool_turns):
    response = messages.create(model, max_tokens, messages, tools)
    tool_uses = response.content blocks with type tool_use
    if no tool_uses:
        return response
    tool_results = []
    for tool_use in tool_uses:
        validate tool_use.name against registry
        validate tool_use.input against schema
        execute under app policy
        append tool_result block
    messages += assistant response
    messages += user message with tool_result blocks
raise TooManyToolTurns
```

Manual loops must include a turn limit.

## Tool Schema Rules

Good tool schemas:

- use stable snake_case names.
- have a concise description.
- define `input_schema`/input schema as an object.
- include required fields.
- reject additional properties where supported.
- describe side effects.
- keep destructive operations separate from read-only operations.

Bad tool schemas:

- accept arbitrary strings and parse inside the tool.
- expose command execution directly.
- use user-facing display names as dispatch keys.
- omit required fields.
- hide destructive behavior in vague descriptions.

## Tool Result Rules

Tool result content should:

- correspond to a specific tool use ID.
- return structured content when possible.
- include intentional errors as tool error content.
- avoid raw stack traces.
- avoid secrets.
- avoid unbounded result size.

Use structured tool errors for expected failures. Unexpected exceptions should
be logged with sanitized metadata and converted to a safe error result.

## TypeScript Tool Runner

Use TypeScript tool runner helpers when the local SDK supports them and the app
can define safe typed tools.

Common helper pattern:

```ts
const tool = betaZodTool({
  name: "lookup_order",
  description: "Look up an order by ID.",
  inputSchema: z.object({ orderId: z.string() }),
  run: async ({ orderId }) => {
    return await lookupOrder(orderId);
  },
});
```

Review:

- schema is strict.
- `run` validates tenant/user authorization.
- tool errors are intentional and safe.
- cancellation is passed where available.
- no dynamic dispatch by user input.

## Python Tool Runner

Use `@beta_tool` for sync tools and `@beta_async_tool` for async tools.

The decorator inspects:

- function name.
- docstring description.
- typed arguments.
- argument docs.

Review:

- type hints exist for every argument.
- docstring accurately describes behavior.
- tool returns concise content.
- tool catches expected external-service failures.
- `ToolError` is used for expected tool failures.
- async tools use async I/O.

## Server Tools

Server tools are not application functions; they are tool definitions handled by
the model/provider side. Examples include web search, web fetch, code
execution, text editor, memory, and search tools.

Security rules:

- Treat web content as untrusted.
- Treat code execution as high risk.
- Do not combine external web content with internal destructive tools without a
  policy gate.
- Account for usage fields such as server tool request counts where exposed.
- Document whether server tools are enabled by product policy.

## Structured Output

Structured output should use schema validation.

Preferred order:

1. SDK structured output helpers.
2. Tool call schema where the model supplies arguments.
3. Strict JSON Schema plus application validation.
4. Last resort: prompt-only JSON with robust validation and retries.

Avoid:

- regex extraction from prose.
- trusting `JSON.parse` output without validation.
- silently accepting partial JSON.
- using structured output for content that is naturally free text.

## Zod Output Pattern

Use Zod when the TypeScript project already uses it or accepts the dependency.

```ts
const Classification = z.object({
  label: z.enum(["bug", "feature", "question"]),
  confidence: z.number().min(0).max(1),
});
```

Validate and type the result at the boundary. Do not pass unvalidated model
output into database writes or permission decisions.

## JSON Schema Output Pattern

Use raw JSON Schema when the app is language-agnostic or does not use Zod.

Ensure schemas:

- have `type: "object"` at the top.
- define `properties`.
- define `required`.
- restrict additional properties where supported.
- represent enums explicitly.

## Testing Tools and Streaming

Tests should cover:

- normal tool call.
- unknown tool name.
- invalid tool input.
- expected tool error.
- unexpected tool exception.
- too many tool turns.
- streaming normal completion.
- streaming error.
- caller cancellation.
- final text/message extraction.
- structured output validation failure.
