---
name: ollama-client
description: This skill should be used when implementing, debugging, migrating, validating, auditing, or reviewing official Ollama TypeScript, JavaScript, or Python client usage, including chat, generate, streaming, tools, structured outputs, images, thinking, logprobs, embeddings, web search, web fetch, browser imports, sync clients, async clients, and secure cloud API handling.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# Ollama Client

## Purpose

Use this skill as Ollama client documentation for both development and
validation work. Apply it to code using the official clients:

- TypeScript/JavaScript package: `ollama`
- Python package: `ollama`

Use `ollama-runtime` instead when the task is mainly daemon setup, host
configuration, model lifecycle, local/cloud runtime behavior, or model
availability policy.

## Start Here

1. Inspect the target language, runtime, and dependency files.
2. Read `../ollama/references/agent-usage-modes.md` to choose development
   documentation mode or existing-code validation documentation mode.
3. Read `../ollama/references/sdk-selection.md` if client/runtime ownership is not
   obvious.
4. Read the detailed client references:
   - `../ollama-client/references/api-surface.md`
   - `../ollama-client/references/client-feature-playbook.md`
   - `../ollama-client/references/tools-and-structured-outputs.md`
5. Read the language reference:
   - TypeScript/JavaScript: `../ollama-client/references/typescript-client.md`
   - Python: `../ollama-client/references/python-client.md`
6. Read `../ollama-runtime/references/runtime-and-models.md` when touching host config,
   model lifecycle, local daemon assumptions, or model availability.
7. Read `../ollama-runtime/references/cloud-and-web-apis.md` when touching cloud models,
   cloud API headers, web search, or web fetch.
8. Read `../ollama-production-review/references/security-privacy.md` for every production path.
9. Read `../ollama-production-review/references/testing-patterns.md` before adding tests.
10. For production or security-sensitive paths, also read
    `../ollama-production-review/references/production-checklist.md`.

## Development and Validation Duties

In development mode, use these references to build the smallest correct Ollama
client integration, preserve repository conventions, add deterministic tests,
and verify the change.

In validation mode, use these references to check existing Ollama client code
for package/runtime correctness, host configuration, model configuration, cloud
API-key boundaries, streaming cleanup, tool-call safety, structured output
validation, embeddings API usage, Python sync/async fit, browser import usage,
and tests. Lead with concrete findings and do not patch code unless requested.

## Implementation Rules

- Use `chat` for conversational message history and tool calling.
- Use `generate` for single prompt completion, fill-in-middle, raw prompt
  templates, multimodal generate, and image generation parameters.
- Use `embed` for new embedding work. Treat `embeddings` as legacy.
- Use `stream: true` in TypeScript or `stream=True` in Python only when code
  consumes the iterator and handles errors.
- Use JSON schema or a schema library for structured outputs, then parse and
  validate returned JSON.
- Execute tool calls only after allowlisting tool names and validating
  arguments.
- Append tool responses to the message history before asking the model for the
  final answer.
- Keep cloud API bearer tokens server-side.
- Use `ollama/browser` for browser-only TypeScript usage, but do not include
  cloud API secrets in browser code.
- Use `AsyncClient` in async Python frameworks instead of blocking the event
  loop with sync calls.
- Configure model and host through environment/config when project conventions
  exist.

## Required Knowledge Checklist

Before editing code, be able to answer:

- Which runtime executes this code?
- Is the code local-only, cloud via local Ollama, or direct cloud API?
- Which package version and import style are present?
- Which method is the smallest correct surface?
- Is the model already pulled or configured elsewhere?
- Does the feature need streaming, tools, structured output, images, thinking,
  logprobs, embeddings, web search, or web fetch?
- What failure behavior applies when the daemon is down or the model is missing?
- What tests prove request shape, stream behavior, and failure behavior?

## TypeScript Quick Pattern

```ts
import { Ollama } from "ollama";

const client = new Ollama({
  host: process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434",
});

const response = await client.chat({
  model: process.env.OLLAMA_MODEL ?? "llama3.1",
  messages: [{ role: "user", content: "Summarize this ticket." }],
  options: { temperature: 0 },
});

console.log(response.message.content);
```

## Python Quick Pattern

```python
import os
from ollama import Client

client = Client(host=os.environ.get("OLLAMA_HOST"))

response = client.chat(
    model=os.environ.get("OLLAMA_MODEL", "llama3.1"),
    messages=[{"role": "user", "content": "Summarize this ticket."}],
    options={"temperature": 0},
)

print(response.message.content)
```

## Review Checklist

Before finishing, check:

- Host/model/API-key config follows project conventions.
- Browser code does not expose cloud API keys.
- Streaming loops handle iterator errors, cancellation, and terminal parts.
- Tool calls use allowlisted functions and validated arguments.
- Structured output is parsed and schema-validated.
- Python async frameworks use `AsyncClient`.
- Missing daemon/model behavior is handled.
- Tests mock client/fetch/httpx and avoid live model output in normal CI.

## Output Standard

Report the language, client surface, files changed, host/model assumptions, and
verification result. If tests were not run, say exactly why.
