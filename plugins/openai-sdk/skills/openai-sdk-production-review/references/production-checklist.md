# Production Checklist

Use this checklist before shipping or reviewing OpenAI SDK code.

## Secrets And Configuration

- API keys are read from environment, secret manager, or existing secure config.
- API keys are never committed, logged, exposed to browsers, or sent to mobile
  clients.
- Model names, timeouts, retry counts, base URLs, organization IDs, project IDs,
  and Azure settings are configurable where production needs vary by
  environment.
- Browser-side SDK use is not enabled for public applications.

## Architecture

- Direct API calls use the Client SDK.
- Agentic loops use the Agents SDK.
- Shared clients/runners are centralized.
- Server routes do not instantiate expensive clients repeatedly when a shared
  instance is safe.
- Long-running jobs are moved out of request/response paths when needed.
- Streaming endpoints handle cancellation and partial output.

## Reliability

- SDK retries are understood and not accidentally multiplied by outer retry
  loops.
- Web routes use realistic timeouts.
- Batch jobs and workers have backoff and idempotency where retries can repeat
  side effects.
- Rate limit and 5xx failures are surfaced clearly.
- Request IDs are logged on success/failure paths where useful.

## Webhooks

- Signature verification uses the raw request body.
- JSON parsing happens after verification.
- Invalid signatures return a failure status.
- Event handlers are idempotent.
- Unknown event types are ignored or logged without crashing.

## Agents SDK

- Tools have precise names, descriptions, schemas, and return values.
- Side-effect tools have approval gates, permission checks, or guardrails.
- Tool timeouts and concurrency limits are configured when tools can hang or
  overload dependencies.
- Handoffs and agents-as-tools are chosen deliberately.
- `maxTurns` is bounded for user-facing flows.
- State strategy is singular: manual history, session, `conversation_id`, or
  `previous_response_id`.
- Tracing sensitive-data behavior is deliberate.
- Sandbox agents are used only when isolated workspace behavior is required.

## Data Handling

- Prompts and tool outputs avoid unnecessary sensitive data.
- Logs redact secrets and private user data.
- Stored conversation history has a retention policy.
- Tests include representative malformed input and API failure behavior.

## Type And Schema Safety

- TypeScript code passes typecheck.
- Python code passes the repository's linter/type checker when available.
- Structured outputs use SDK/API schema features instead of brittle text parsing.
- Tool schemas use Zod/Pydantic or JSON Schema with clear required fields.

## Verification

- Unit tests mock SDK calls at the boundary.
- Integration tests are optional and gated by an explicit environment variable.
- Streaming tests cover event order and cancellation where applicable.
- Webhook tests use raw-body fixtures and invalid signature cases.
- Agents tests cover tool selection, handoff routing, guardrail trips, and
  max-turn fallback.
