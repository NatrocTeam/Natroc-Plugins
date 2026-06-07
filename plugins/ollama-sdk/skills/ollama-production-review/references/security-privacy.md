# Security And Privacy

Use this reference for cloud API keys, local daemon exposure, browser
boundaries, tool execution, logs, and model data handling.

## Secrets

- Treat `OLLAMA_API_KEY` as a server-side secret.
- Do not place direct cloud API bearer tokens in public browser code.
- Do not log `Authorization` headers.
- Do not include API keys in prompts, tool arguments, model output, traces, or
  user-visible errors.
- Explicit authorization headers override Python env-derived bearer headers;
  verify that override is intentional.

## Local Daemon Exposure

Default local daemon usage should stay on localhost. Exposing a daemon to a
network interface changes the security model:

- Any reachable client may be able to run model requests.
- Model lifecycle endpoints can pull, create, copy, or delete models.
- Inputs may include private prompts or files/images.
- Long-running generations can consume compute.

Before exposing remote host behavior, require explicit product/security intent,
network controls, and permissions.

## Browser Boundary

Browser usage is possible through `ollama/browser`, but review:

- Is the browser expected to reach a local daemon?
- Are CORS/network policies understood?
- Are cloud API keys absent from browser bundles?
- Can untrusted browser users trigger expensive model operations?
- Does browser code leak prompt/image content to logs?

Server-side proxy patterns are safer for direct cloud API credentials.

## Tool Execution

Tool calls are application code execution requests. The model does not execute
tools by itself, but app code can make tool calls dangerous.

For every tool:

- Allowlist function names.
- Validate and cast arguments.
- Check tenant/user permissions.
- Add approval for high-impact actions.
- Set timeouts for network or shell actions.
- Return compact, non-secret results.
- Log audit metadata without prompt secrets.

High-impact tools:

- Shell or file operations.
- Database mutations.
- Payments or billing.
- Sending messages/emails.
- Pulling/deleting/pushing models.
- Accessing private user or tenant data.

## Structured Outputs

Treat all model output as untrusted:

- Parse JSON safely.
- Validate against schema.
- Handle invalid output without leaking stack traces.
- Do not execute structured output as code.
- Do not use structured output to bypass permissions.

## Images And Files

When sending image/file data:

- Validate file existence.
- Validate size and type.
- Confirm user owns or can access the file.
- Avoid logging base64 data.
- Avoid retaining private content longer than product policy allows.

## Web Search And Web Fetch

Web search and fetch can send user data to cloud services:

- Confirm product policy allows it.
- Redact sensitive query content when required.
- Validate URLs and block internal/private network targets when user-controlled.
- Treat fetched content as untrusted.
- Bound fetched content before model input.

## Production Logging

Log:

- Host mode: local, remote, cloud.
- Model name.
- Request IDs or app correlation IDs.
- Timing and failure category.
- Model lifecycle action status.

Do not log:

- Authorization headers.
- Raw private prompts by default.
- Base64 image content.
- Tool arguments containing secrets.
- Full fetched pages when sensitive.
