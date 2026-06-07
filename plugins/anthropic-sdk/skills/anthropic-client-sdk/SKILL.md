---
name: anthropic-client-sdk
description: This skill should be used when the user asks to implement, debug, migrate, validate, or review direct Anthropic Claude API code using @anthropic-ai/sdk in TypeScript/JavaScript or anthropic in Python. Trigger on Messages API, streaming, structured output, tool use, tool runners, token counting, batches, models, multimodal content, provider clients, or server-side Anthropic API wiring.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# Anthropic Client SDK

## Purpose

Use this skill for direct Claude API integrations with the Anthropic Client SDK.
Prefer the repository's existing runtime and framework patterns, then apply the
local references for the selected language.

Use `@anthropic-ai/sdk` for server-side TypeScript/JavaScript and `anthropic`
for Python. Treat Node.js 18+ and Python 3.9+ as the baseline runtime
requirements unless the repository already pins a stricter version.

## Required Workflow

1. Confirm development or validation mode from
   `../anthropic-sdk/references/agent-usage-modes.md`.
2. Inspect existing project shape:
   - TypeScript/JavaScript: `package.json`, lockfiles, framework routes,
     server/client boundaries, imports from `@anthropic-ai/sdk`.
   - Python: `pyproject.toml`, `requirements*.txt`, lockfiles, framework routes,
     imports from `anthropic`.
3. Read:
   - `../anthropic-client-sdk/references/client-sdk-api-surface.md`
   - `../anthropic-client-sdk/references/client-sdk-feature-playbook.md`
   - `../anthropic-client-sdk/references/tools-streaming-structured-output.md`
   - the relevant language reference.
4. Choose one primary Client SDK surface:
   - `messages.create` / `messages.create(...)` for direct calls.
   - `messages.stream` or streaming create for streamed output.
   - structured output parse helpers for JSON output.
   - `messages.countTokens` / `messages.count_tokens` for token estimation.
   - `messages.batches` for asynchronous batch workloads.
   - `beta.messages.toolRunner` / `client.beta.messages.tool_runner` for tool
     loops.
   - provider-specific client only when the repository is deployed through that
     provider.
5. Implement with explicit model, `max_tokens`, message list, system prompt
   placement, and typed content blocks.
6. Verify with local tests, typecheck, lint, or a focused smoke test.

## Implementation Rules

- Instantiate clients once per request context or shared service, following the
  app's dependency injection style.
- Read `ANTHROPIC_API_KEY` from environment/config by default.
- Keep API calls on server, worker, or trusted backend boundaries.
- Never hardcode API keys or provider credentials.
- Prefer strongly typed request/response wrappers at app boundaries.
- Treat `message.content` as an array of content blocks. Extract text only after
  checking block type.
- Represent system instructions with the top-level `system` request parameter.
- Include `max_tokens` on Messages API calls.
- Use schema helpers or explicit tool schemas when structured data matters.
- Close or abort streams when HTTP clients disconnect or jobs are cancelled.
- Convert SDK errors into app-specific errors without leaking prompts or
  secrets.

## Common Patterns

### TypeScript direct message

```ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
  max_tokens: 1024,
  system: "Answer using concise technical language.",
  messages: [{ role: "user", content: "Explain retries in this service." }],
});
```

### Python direct message

```python
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

message = client.messages.create(
    model=os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5"),
    max_tokens=1024,
    system="Answer using concise technical language.",
    messages=[{"role": "user", "content": "Explain retries in this service."}],
)
```

### Streaming decision

Use a high-level stream helper when the application needs accumulated final
messages, final text, text deltas, JSON deltas, event callbacks, or abort
control. Use low-level streaming create when memory must stay minimal and the
app can process raw chunks directly.

### Tool use decision

Use simple manual tool loops when the app needs full control over every
`tool_use` block and `tool_result` message. Use the SDK tool runner helpers when
the local package supports them and the app can register safe typed tools.

## Validation Checklist

For existing Client SDK code, check:

- Package name and import match language.
- Runtime meets SDK minimum.
- API key and provider credentials stay server-side.
- Request includes model and `max_tokens`.
- Messages use `user`/`assistant` roles; system instructions use top-level
  `system`.
- Multimodal inputs use content block arrays.
- Tool schemas have stable names, descriptions, JSON schemas, and error
  handling.
- Streaming code handles aborts, errors, and final message assembly.
- Structured output uses schema/parse helpers rather than brittle text parsing.
- Provider-specific clients do not assume unsupported features such as batches
  where provider packages omit them.
- Tests mock the SDK boundary and assert app-level behavior.

## Additional Resources

- `../anthropic-client-sdk/references/client-sdk-api-surface.md`
- `../anthropic-client-sdk/references/client-sdk-feature-playbook.md`
- `../anthropic-client-sdk/references/client-sdk-typescript.md`
- `../anthropic-client-sdk/references/client-sdk-python.md`
- `../anthropic-client-sdk/references/tools-streaming-structured-output.md`
- `../anthropic-client-sdk/references/providers-bedrock-vertex-azure.md`
- `../anthropic-sdk-production-review/references/security-privacy.md`
- `../anthropic-sdk-production-review/references/testing-patterns.md`
- `../anthropic-sdk-production-review/references/failure-modes.md`
