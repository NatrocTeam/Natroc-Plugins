# Tools And Structured Outputs

Use this reference when implementing or validating model tool calls or
structured output behavior with Ollama.

## Structured Output Contract

Ollama clients support `format` as either:

- `"json"` for JSON-mode style output.
- A JSON schema object for structured output.

The model still returns a string. Application code must parse and validate that
string.

TypeScript pattern:

```ts
const response = await ollama.chat({
  model,
  messages,
  format: jsonSchema,
  options: { temperature: 0 },
});

const value = Schema.parse(JSON.parse(response.message.content ?? "{}"));
```

Python pattern:

```python
response = client.generate(
    model=model,
    prompt=prompt,
    format=Schema.model_json_schema(),
    options={"temperature": 0},
)

value = Schema.model_validate_json(response.response or "{}")
```

Validation rules:

- Catch JSON parse errors.
- Catch schema validation errors.
- Do not use partial data after validation failure.
- Keep user-controlled text out of trusted schema definitions.
- Use low temperature for deterministic extraction.

## Tool Definition Contract

Ollama chat tools use function-style schemas:

```json
{
  "type": "function",
  "function": {
    "name": "lookup_order",
    "description": "Look up order status.",
    "parameters": {
      "type": "object",
      "required": ["order_id"],
      "properties": {
        "order_id": {
          "type": "string",
          "description": "Order ID."
        }
      }
    }
  }
}
```

Tool schema standards:

- Stable function names.
- Clear descriptions saying when the tool should be used.
- Required fields for necessary arguments.
- Enums or constrained strings for known domains.
- No broad arbitrary object unless necessary.
- Compact output that the model can use.

## Tool Execution Loop

Do not expect the model to execute tools. Application code executes them.

Loop:

1. Send chat request with tools.
2. Inspect returned `tool_calls`.
3. Validate each function name.
4. Validate and cast arguments.
5. Enforce permission/tenant checks.
6. Execute local function.
7. Append assistant message with tool calls.
8. Append tool result message with `role: "tool"`.
9. Call chat again to get final response.

Tool result messages:

- Include only fields the model needs.
- Avoid huge raw JSON.
- Include error messages that are concise and recoverable.
- Do not include secrets.

## Python Callable Tools

Python can convert callables into tool schemas. For reliable schemas:

- Use type annotations.
- Use clear docstrings.
- Prefer Google-style docstrings with `Args`.
- Validate arguments again inside the function.

Example:

```python
def add_two_numbers(a: int, b: int) -> int:
    """Add two numbers.

    Args:
      a: First number.
      b: Second number.
    """
    return int(a) + int(b)
```

The cast is intentional because returned tool-call arguments may not conform
exactly to schema.

## TypeScript Tool Safety

Use a runtime validator for arguments:

```ts
const Args = z.object({ orderId: z.string().min(1) });

for (const call of response.message.tool_calls ?? []) {
  if (call.function.name !== "lookupOrder") throw new Error("Unexpected tool");
  const args = Args.parse(call.function.arguments);
  const result = await lookupOrder(args);
  messages.push({
    role: "tool",
    content: JSON.stringify(result),
    tool_name: call.function.name,
  });
}
```

## Validation Findings To Look For

High-risk patterns:

- `availableFunctions[tool.function.name](tool.function.arguments)` with no
  allowlist check.
- Tool arguments passed directly to database, shell, network, or payment code.
- Tool result includes secrets or private data unrelated to the user.
- Tool loop never appends tool results before final chat call.
- Structured output is parsed with `JSON.parse` but not schema-validated.
- Invalid structured output crashes user-facing route with raw stack trace.
- Python tool functions rely only on annotations and do not cast/validate.

Recommended tests:

- Tool call with valid arguments.
- Unknown tool name.
- Invalid argument type.
- Tool error converted to model-usable result.
- Structured output valid JSON.
- Structured output invalid JSON.
- Structured output schema mismatch.
