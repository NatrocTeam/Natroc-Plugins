# Runtime And Models

Use this reference for daemon, host, model lifecycle, and operational behavior.

## Host Defaults

Default local Ollama host is:

```text
http://127.0.0.1:11434
```

Python client host behavior:

- Uses explicit `Client(host=...)` when provided.
- Otherwise reads `OLLAMA_HOST`.
- Otherwise defaults to local host.
- Parses bare hostnames, ports, HTTP/HTTPS URLs, domains, paths, and IPv6 into
  full URLs with ports.

TypeScript client behavior:

- Default client uses local host.
- Custom `new Ollama({ host })` formats host values.
- `proxy: true` suppresses direct host formatting behavior.
- Headers can be attached to every request.

## Local Daemon

Development code should assume a local daemon only when:

- The project is a local developer tool.
- The deployment environment explicitly runs Ollama next to the app.
- Tests are gated or mocked.

Production apps should handle:

- Daemon not running.
- Host unreachable.
- Missing model.
- Slow model load.
- Stream interruption.
- Model memory pressure.

## Model Lifecycle Methods

Use lifecycle methods deliberately:

- `pull`: download model. Can stream progress.
- `push`: upload model. Can stream progress.
- `create`: create custom model from a base, template, system, params, messages,
  adapters, quantize, and in Python files/blob digests.
- `create_blob`: Python helper to upload local file blob and return a digest.
- `copy`: copy model tag/name.
- `delete`: delete model.
- `list`: list local models.
- `show`: inspect model metadata, details, template, parameters, capabilities.
- `ps`: list running models.
- `version`: TypeScript server version method.

Do not run destructive lifecycle operations without explicit user or product
intent.

## Pull/Create Progress

`pull`, `push`, and `create` can stream progress. Use progress streaming for
user-visible setup commands or background jobs:

TypeScript:

```ts
const progress = await ollama.pull({ model: "llama3.1", stream: true });
for await (const part of progress) {
  console.log(part.status, part.completed, part.total);
}
```

Python:

```python
for part in client.pull("llama3.1", stream=True):
    print(part.status, part.completed, part.total)
```

Avoid progress streaming in normal web request paths unless the endpoint is
designed for long-running setup.

## Create Model Differences

Python `create` supports:

- `model`
- `from_` serialized as `from`
- `files`
- `adapters`
- `template`
- `license`
- `system`
- `parameters`
- `messages`
- `quantize`
- `stream`

Python `create_blob(path)` computes a SHA-256 digest, uploads the file to
`/api/blobs/<digest>`, and returns the digest string.

TypeScript `create` supports model creation fields but does not support the
Python `files` parameter. The Node client also rejects a `from` value that
resolves to a local path.

## Model Availability Pattern

Use this pattern in production setup or startup diagnostics:

1. Read configured model name.
2. Call `list` or `show`.
3. If missing, report a clear setup error or enqueue a setup action.
4. Do not pull automatically in every request.
5. For CLIs/setup scripts, stream `pull` progress.

## Cloud Models Via Local Ollama

Cloud model offload through local Ollama typically uses:

1. User signs in once with the CLI.
2. User pulls a cloud model tag.
3. Application uses the cloud model tag normally through local Ollama.

From app code, this looks like normal local client usage with a cloud model
name. Still treat latency, availability, and model policy as product decisions.

## Direct Cloud API

Direct cloud API uses:

- Host: `https://ollama.com`.
- Bearer authorization header.
- Server-side `OLLAMA_API_KEY`.

Do not use direct cloud API keys from public browser code.

## Runtime Validation Checklist

- Host configuration is explicit and environment-aware.
- Local-only default is not accidentally exposed remotely.
- Cloud host requires server-side bearer header.
- Missing daemon is mapped to actionable app error.
- Missing model is mapped to setup/preflight behavior.
- Pull/create/delete/copy actions are not accidental request-path side effects.
- Model lifecycle operations are permission protected.
- Long operations use background jobs or progress streams.
- Tests do not require local Ollama unless gated.
