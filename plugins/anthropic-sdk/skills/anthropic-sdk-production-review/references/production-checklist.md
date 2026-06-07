# Production Checklist

Use this checklist before shipping Anthropic SDK code.

## Client SDK

- [ ] SDK package matches language: `@anthropic-ai/sdk` or `anthropic`.
- [ ] Runtime meets minimum: Node.js 18+ or Python 3.9+.
- [ ] API key is server-side and environment/config backed.
- [ ] No API keys or provider credentials in browser bundles.
- [ ] Model is configurable or follows repository convention.
- [ ] `max_tokens` is explicit.
- [ ] System instructions use top-level `system`.
- [ ] Messages use valid roles.
- [ ] Content extraction is block-type aware.
- [ ] Multimodal blocks are validated for type and size.
- [ ] Streaming has abort, error, and finalization handling.
- [ ] Structured output is schema-validated.
- [ ] Tool schemas are strict and named by action.
- [ ] Tool loops have turn limits.
- [ ] Tool errors are safe and intentional.
- [ ] Token counting is used where prompt size matters.
- [ ] Batch processing is idempotent.
- [ ] Provider variant feature support is checked.
- [ ] SDK errors are converted to app errors without leaking content.
- [ ] Tests cover request construction and failure paths.

## Claude Agent SDK

- [ ] SDK package matches language:
      `@anthropic-ai/claude-agent-sdk` or `claude-agent-sdk`.
- [ ] Runtime meets minimum: Node.js 18+ or Python 3.10+.
- [ ] Agent process runs in a trusted boundary.
- [ ] `cwd` is explicit and validated.
- [ ] `max_turns`/`maxTurns` is set for production workflows.
- [ ] Built-in tool availability is deliberate.
- [ ] Auto-approved tools are minimal.
- [ ] Blocked tools are configured with
      `disallowed_tools`/`disallowedTools`.
- [ ] Broad `permission_mode`/`permissionMode` is justified by product policy.
- [ ] Hooks or permission callbacks enforce dynamic policy.
- [ ] Shell/file tools are sandboxed or approval-gated.
- [ ] MCP servers are explicit and trusted.
- [ ] Custom tools validate input and authorization.
- [ ] Session resume validates ownership.
- [ ] Session store keys include tenant/project scope.
- [ ] Transcript retention/deletion is defined.
- [ ] Streams/subprocesses are cancelled on shutdown.
- [ ] Errors do not expose transcripts or tool inputs.
- [ ] Tests cover options, hooks, custom tools, sessions, and error handling.

## Security

- [ ] Secrets are redacted from logs.
- [ ] Prompts/responses/tool inputs are not logged without policy.
- [ ] Web search/fetch content is treated as untrusted.
- [ ] Code execution has policy controls.
- [ ] Multi-tenant data is scoped.
- [ ] Retention policy is documented.
- [ ] Live API tests are gated by env vars.
- [ ] Provider credentials have least privilege.

## Reliability

- [ ] Timeouts exist for user-facing paths.
- [ ] Retry policy matches app standards.
- [ ] Rate limit behavior is user-safe.
- [ ] Long-running jobs persist state.
- [ ] Batch result processing is idempotent.
- [ ] Session store operations have timeouts.
- [ ] Cancellation closes streams/processes.
- [ ] Observability includes sanitized status, latency, model, and error class.

## Release Gate

Do not ship if any of these are true:

- API keys are exposed client-side.
- Agent SDK shell/file tools run in hosted products without approval/sandbox.
- Session resume can cross tenants.
- Tool schemas permit arbitrary command execution without policy.
- Streaming endpoints leak resources after disconnect.
- Structured output is trusted without validation in a critical path.
- Provider variant calls rely on unsupported resources.
- No tests cover the SDK wrapper or permission policy.
