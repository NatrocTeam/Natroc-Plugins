# Production Checklist

Use this checklist before shipping or reviewing Ollama code.

## Configuration

- [ ] Host behavior is explicit for local, CI, staging, and production.
- [ ] Model name comes from project config or a deliberate product choice.
- [ ] `OLLAMA_API_KEY` is server-side only.
- [ ] Direct cloud API host uses bearer header only on trusted server paths.
- [ ] Browser imports do not include cloud credentials.
- [ ] Timeouts or cancellation behavior are appropriate for route/worker type.

## Runtime

- [ ] Missing daemon produces actionable error.
- [ ] Missing model produces actionable setup/preflight error.
- [ ] Model pull/create/delete/copy/push actions are not accidental request-path
      side effects.
- [ ] Long lifecycle operations use progress streams or background jobs.
- [ ] Remote daemon exposure is intentional and reviewed.
- [ ] Cloud model usage has product approval and fallback/error behavior.

## Client Behavior

- [ ] Chat/generate response shape is correct for the method used.
- [ ] Streaming code consumes chunks, handles errors, and supports cancellation.
- [ ] Structured output is parsed and schema-validated.
- [ ] Tool calls are allowlisted, validated, permission checked, and audited.
- [ ] Tool results are appended before final chat response.
- [ ] Images/files are validated before sending.
- [ ] Embeddings use `embed` for new code.
- [ ] Thinking/logprobs fields are optional and model-gated.

## Security And Privacy

- [ ] No authorization header or API key in logs.
- [ ] Private prompts/images/tool args are not logged by default.
- [ ] User-controlled web fetch URLs are validated.
- [ ] Fetched/search content is treated as untrusted.
- [ ] Tool side effects have user/tenant permissions.
- [ ] Model lifecycle operations have permissions.

## Testing

- [ ] Unit tests do not require live Ollama.
- [ ] Stream fixtures cover normal chunks and errors.
- [ ] Structured output tests cover invalid JSON and schema mismatch.
- [ ] Tool tests cover unknown tools and invalid args.
- [ ] Host/model failure paths are tested.
- [ ] Live integration tests are gated by env vars.

## Release Notes

- [ ] Document required model(s).
- [ ] Document local daemon or cloud requirements.
- [ ] Document setup/pull steps outside hot request paths.
- [ ] Document any remote host or cloud policy change.
