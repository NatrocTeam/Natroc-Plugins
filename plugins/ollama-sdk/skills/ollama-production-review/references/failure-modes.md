# Failure Modes

Use this file when debugging Ollama issues or reviewing production code.

## Cannot Connect To Ollama

Symptoms:

- Python `ConnectionError`.
- TypeScript fetch/network error.
- Message says local Ollama is not downloaded, running, or accessible.

Likely causes:

- Daemon not running.
- Wrong `OLLAMA_HOST`.
- Container cannot reach host machine.
- Remote host blocked by firewall.
- HTTPS/HTTP scheme mismatch.

Fixes:

- Validate host at startup.
- Surface an actionable setup error.
- In CI, skip live tests unless explicitly enabled.
- Do not silently fall back to cloud unless product policy allows it.

## Model Not Found

Symptoms:

- Response error with 404-like status.
- Generation fails for configured model.

Likely causes:

- Model not pulled.
- Wrong tag.
- Cloud model not signed in/pulled for local offload.
- Direct cloud API uses different model tag.

Fixes:

- Use `list` or `show` for preflight.
- Provide setup command or setup job.
- Avoid automatic pull in hot request path.
- Keep model config centralized.

## Streaming Hangs Or Leaks

Symptoms:

- Request never completes.
- User disconnect leaves backend work running.
- TypeScript `abort()` cancels more streams than expected.

Likely causes:

- Iterator not consumed.
- No cancellation/abort propagation.
- Multiple streams share one client when independent abort is needed.
- Stream error not handled.

Fixes:

- Consume all chunks.
- Add cancellation handling.
- Use one client per independently aborted TypeScript stream.
- Wrap streaming loops in error handling.

## Structured Output Invalid

Symptoms:

- JSON parse error.
- Missing fields.
- Wrong types.
- App crashes after using model output.

Likely causes:

- Code trusted `format` as validation.
- Temperature too high for extraction.
- Prompt asks for incompatible output.
- Schema too broad or too strict.

Fixes:

- Parse and validate.
- Return domain-specific validation errors.
- Set deterministic options.
- Add tests for invalid output.

## Tool Calls Unsafe Or Wrong

Symptoms:

- Unknown tool executed.
- Arguments wrong type.
- Side effects happen without permission.
- Final answer ignores tool result.

Likely causes:

- Dynamic dispatch by model-provided tool name.
- Missing argument validation.
- Tool result not appended to messages.
- Tool output too large or unhelpful.

Fixes:

- Allowlist tools.
- Validate/cast args.
- Add permission checks.
- Append tool result message and call chat again.
- Test unknown and invalid tool calls.

## Browser Cloud Key Exposure

Symptoms:

- `OLLAMA_API_KEY` appears in frontend env or bundle.
- `Authorization` header created in browser code.

Fixes:

- Move cloud API calls server-side.
- Use a server route or backend worker.
- Redact logs and rotate exposed key if necessary.

## Python Async Blocking

Symptoms:

- FastAPI async route stalls under load.
- Event loop blocked.

Likely causes:

- Sync `Client` called directly in async code.

Fixes:

- Use `AsyncClient`.
- Or explicitly run sync work in a worker thread if required by app design.

## Web Fetch SSRF Risk

Symptoms:

- User-provided URL sent to web fetch without validation.

Fixes:

- Validate scheme and hostname.
- Block internal/private network ranges.
- Apply allowlists for sensitive apps.
- Bound fetched content.
