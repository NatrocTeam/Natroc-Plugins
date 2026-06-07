---
name: openai-client-sdk
description: This skill should be used when implementing, debugging, migrating, validating, auditing, or reviewing direct OpenAI Client SDK usage in TypeScript, JavaScript, or Python, including Responses API, Chat Completions, streaming, files, webhooks, Realtime, errors, retries, pagination, Azure OpenAI, and secure server-side API key handling.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# OpenAI Client SDK

## Purpose

Use this skill as Client SDK documentation for both development and validation
work. Apply it to direct OpenAI API integrations through the official Client
SDKs:

- TypeScript/JavaScript package: `openai`
- Python package: `openai`

This skill is not for multi-agent orchestration. If the request needs tools,
handoffs, guardrails, sessions, tracing, or sandbox agents, use
`openai-agents-sdk`.

## Start Here

1. Inspect the target language, runtime, and dependency files.
2. Read `../openai-sdk/references/agent-usage-modes.md` to choose development
   documentation mode or existing-code validation documentation mode.
3. Read `../openai-sdk/references/sdk-selection.md` if SDK choice is not already
   obvious.
4. Read the detailed Client SDK references:
   - `../openai-client-sdk/references/client-sdk-api-surface.md`
   - `../openai-client-sdk/references/client-sdk-feature-playbook.md`
5. Read the language reference:
   - TypeScript/JavaScript: `../openai-client-sdk/references/client-sdk-typescript.md`
   - Python: `../openai-client-sdk/references/client-sdk-python.md`
6. Read `../openai-sdk/references/framework-recipes.md` when touching framework routes,
   workers, CLIs, edge, or browser boundaries.
7. Read `../openai-sdk/references/migration-and-modernization.md` for Chat Completions
   to Responses, Azure, or SDK version changes.
8. Read `../openai-sdk-production-review/references/security-privacy.md` for every production path.
9. Read `../openai-sdk-production-review/references/testing-patterns.md` before adding tests.
10. For production or security-sensitive paths, also read
    `../openai-sdk-production-review/references/production-checklist.md`.

## Development and Validation Duties

In development mode, use these references to build the smallest correct Client
SDK integration, preserve repository conventions, add deterministic tests, and
verify the change.

In validation mode, use these references to check existing Client SDK code for
SDK surface correctness, server-side secret boundaries, raw webhook body usage,
streaming cleanup, Realtime lifecycle handling, timeout/retry behavior, request
ID propagation, Azure configuration, and tests. Lead with concrete findings and
do not patch code unless requested.

## Implementation Rules

- Prefer the Responses API for new model generation.
- Keep Chat Completions when maintaining an existing chat-completions path.
- Centralize client construction when the app has shared config.
- Use existing model/config/env conventions. If none exist, make the model
  configurable instead of hardcoding product behavior.
- Never place normal API keys in public browser or mobile code.
- Configure realistic timeouts for web routes and workers.
- Preserve request IDs in logs or error telemetry when useful.
- Verify webhooks with the raw body.
- Use SDK file helpers and native file streams instead of manually building
  multipart requests.
- For streaming, map event types explicitly and test cancellation/partial
  output.
- For Realtime, handle connection lifecycle and `error` events.

## Required Knowledge Checklist

Before editing code, be able to answer:

- Which runtime executes this code?
- Is the API key definitely server-side?
- Which Client SDK resource/method is the smallest correct surface?
- Is this new work using Responses unless there is a reason not to?
- Does the feature need streaming, structured output, files, webhooks, Realtime,
  Azure, or admin permissions?
- What timeout/retry behavior applies?
- Where will request IDs be logged or returned?
- What tests will prove request shape and failure behavior?

## TypeScript Quick Patterns

Use `OpenAI` from `openai` for core API calls.

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60_000,
});

const response = await client.responses.create({
  model: process.env.OPENAI_MODEL ?? "gpt-5.5",
  instructions: "Answer clearly.",
  input: "Summarize this support ticket.",
});

console.log(response.output_text);
```

Handle SDK errors with `OpenAI.APIError` and log request IDs when present.

## Python Quick Patterns

Use `OpenAI` or `AsyncOpenAI` from `openai`.

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    timeout=60.0,
)

response = client.responses.create(
    model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
    instructions="Answer clearly.",
    input="Summarize this support ticket.",
)

print(response.output_text)
```

Catch `openai.APIConnectionError`, `openai.RateLimitError`, and
`openai.APIStatusError` where the app needs user-visible error behavior.

## Review Checklist

Before finishing, check:

- Secrets are server-side.
- The right API surface was chosen.
- Streaming, webhooks, and Realtime handlers handle failure paths.
- SDK errors are converted into app-level behavior.
- Request IDs are available for debugging.
- Tests cover request shape and edge cases.
- No unsupported runtime is used.

## Output Standard

Report the language, API surface, files changed, config assumptions, and
verification result. If you did not run tests, say exactly why.
