# Security And Privacy

Use this reference for every production OpenAI SDK integration.

## Secret Handling

Hard rules:

- Never commit API keys.
- Never log API keys.
- Never send normal API keys to browser/mobile clients.
- Never include API keys in model prompts, tool arguments, traces, or error
  messages.
- Prefer secret managers or environment variables.

Detection cues:

- `sk-`-like values in source files.
- API keys in `.env.example` with real-looking values.
- `NEXT_PUBLIC_OPENAI_API_KEY` or equivalent public env names.
- Client-side imports of server OpenAI client modules.
- Debug logs that print headers or full request bodies.

Fix:

- Move OpenAI calls to server route/worker.
- Replace hardcoded value with secret config.
- Rotate exposed key outside code changes.
- Redact logs and traces.

## Data Minimization

Before sending data to OpenAI:

- Send only fields needed for the task.
- Redact secrets, tokens, passwords, private keys.
- Consider hashing or surrogate IDs for internal identifiers.
- Avoid sending full database rows when only a summary is needed.
- Use retrieval filters and permission checks before file/vector search.

## Webhooks

Security invariant:

- Signature verification must happen before trust.

Checklist:

- Raw body used.
- Invalid signature rejected.
- Replay/idempotency handled by event ID or domain key.
- Unknown events are non-fatal.
- Payload logs are redacted.
- Handlers check domain permissions before mutation.

## Agents Tools

Every tool must enforce app permissions in code.

Do not rely only on:

- Agent instructions.
- Model compliance.
- Tool names.
- Hidden prompt policy.

For sensitive tools:

- Validate caller/session permissions.
- Validate arguments.
- Require approval if high impact.
- Record audit metadata.
- Make operation idempotent.
- Return minimal output.

## Tracing And Logs

Decide whether traces can include:

- User input.
- Tool arguments.
- Tool output.
- Retrieved documents.
- Model outputs.
- Error bodies.

If not, disable sensitive trace data or add redaction before model/tool calls.

Logging rules:

- Log request IDs, status, latency, and operation name.
- Do not log full prompts by default.
- Do not log raw webhooks unless redacted.
- Do not log binary/base64 media payloads.

## Multi-Tenant Isolation

For SaaS apps:

- Tenant ID must be part of authorization checks.
- Vector/file lookup must filter by tenant/user permissions.
- Session IDs must be tenant-scoped.
- Tool calls must not accept arbitrary tenant/user IDs from the model without
  server-side authorization.
- Traces/logs should include tenant-safe identifiers only.

## Retention

Define:

- How long prompts/responses are stored.
- How long conversation sessions are stored.
- How uploaded files are cleaned up.
- How vector stores are deleted.
- How traces/logs are retained.
- How users/admins request deletion.

Agents should not invent retention policy; if absent and required by the
feature, ask the user or implement a conservative minimal-storage default.
