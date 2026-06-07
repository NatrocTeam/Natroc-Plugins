# Testing Patterns

Use this reference when adding or validating tests for Ollama integrations.

## Test Layers

Prefer deterministic unit tests in normal CI:

- Mock the TypeScript client, custom fetch, or HTTP layer.
- Mock the Python client or `httpx`/test server layer.
- Assert request shape, stream parsing, error mapping, and validation behavior.
- Avoid depending on live model text.

Use gated integration tests for live Ollama:

- Require an env var such as `OLLAMA_INTEGRATION=1`.
- Require `OLLAMA_MODEL`.
- Skip when daemon is unavailable.
- Keep prompts short and assertions structural.

## TypeScript Tests

Useful seams:

- Inject `new Ollama({ fetch: fakeFetch })`.
- Mock module import `ollama`.
- Test streaming by returning newline-delimited JSON chunks.
- Test abort behavior with one client per stream.
- Test browser import separately when app bundles browser code.

Request-shape assertions:

- `/api/chat` receives `model`, `messages`, `tools`, `stream`.
- `/api/generate` receives `model`, `prompt`, `format`, `images`, `options`.
- `/api/embed` receives `model`, `input`, `truncate`, `dimensions`.
- `/api/pull` and `/api/create` receive `stream` when progress is expected.

## Python Tests

Useful seams:

- Mock `Client.chat`, `Client.generate`, or `Client.embed`.
- Use `pytest_httpserver` or an equivalent local HTTP server.
- Use `AsyncClient` tests with async test support.
- Test both attribute access and dict-style access only when app relies on both.

Request-shape assertions:

- Chat sends `tools: []` when no tools are passed.
- `format` serializes Pydantic JSON schema.
- Image paths/bytes serialize to base64.
- `create(from_=...)` serializes `from`.
- `OLLAMA_API_KEY` becomes bearer auth only when no explicit header exists.

## Streaming Fixtures

Chat stream fixture:

```json
{"model":"dummy","message":{"role":"assistant","content":"Hello "}}
{"model":"dummy","message":{"role":"assistant","content":"world"}}
```

Generate stream fixture:

```json
{"model":"dummy","response":"Hello "}
{"model":"dummy","response":"world"}
```

Progress stream fixture:

```json
{"status":"pulling manifest"}
{"status":"verifying sha256 digest"}
{"status":"success"}
```

Test stream errors by including an error chunk or failing the response.

## Structured Output Tests

Test:

- Valid JSON matching schema.
- Invalid JSON string.
- Valid JSON with missing required field.
- Valid JSON with wrong type.
- App-level error message after validation failure.

Do not snapshot large model text. Snapshot schemas or normalized app results
instead.

## Tool Tests

Test:

- Known tool with valid arguments.
- Unknown tool name.
- Invalid argument type.
- Tool function error.
- Side-effect permission denied.
- Multiple tool calls.
- Final chat call includes tool result messages.

## Runtime Tests

Test:

- Host config is read from environment/config.
- Cloud API headers are server-side only.
- Missing daemon maps to actionable error.
- Missing model maps to setup/preflight error.
- Pull/create progress is streamed or backgrounded.
- Delete/copy/push require explicit permission path.

## Integration Test Gate

Example policy:

- Unit tests always run without Ollama.
- Integration tests run only when `OLLAMA_INTEGRATION=1`.
- Integration tests require a small configured model.
- Integration tests do not pull models unless the test is specifically for setup
  workflow.
