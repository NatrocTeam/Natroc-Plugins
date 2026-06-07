# Cloud And Web APIs

Use this reference for Ollama cloud models, direct cloud API access, web search,
and web fetch.

## Cloud Models Via Local Ollama

Cloud models can be used through the local Ollama workflow:

1. User signs in with Ollama CLI.
2. User pulls a cloud model tag.
3. Application uses the cloud model tag through the normal local client.

Client code remains normal:

```ts
const response = await ollama.chat({
  model: "gpt-oss:120b-cloud",
  messages: [{ role: "user", content: "Explain quantum computing." }],
  stream: true,
});
```

```python
for part in client.chat(
    model="gpt-oss:120b-cloud",
    messages=[{"role": "user", "content": "Explain quantum computing."}],
    stream=True,
):
    print(part.message.content or "", end="", flush=True)
```

Runtime implications:

- Cloud model availability depends on sign-in and pull state.
- Latency and availability differ from local models.
- Product policy should decide when cloud offload is acceptable.

## Direct Cloud API

Direct cloud API uses `https://ollama.com` and bearer auth.

TypeScript:

```ts
import { Ollama } from "ollama";

const client = new Ollama({
  host: "https://ollama.com",
  headers: { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` },
});
```

Python:

```python
import os
from ollama import Client

client = Client(
    host="https://ollama.com",
    headers={"Authorization": "Bearer " + os.environ["OLLAMA_API_KEY"]},
)
```

Security rules:

- Keep `OLLAMA_API_KEY` server-side.
- Do not log authorization headers.
- Do not include bearer tokens in browser bundles.
- Do not let user input choose arbitrary authorization headers.

## Python Authorization Behavior

The Python client automatically uses `OLLAMA_API_KEY` as a bearer token if:

- `OLLAMA_API_KEY` exists in the environment.
- No explicit authorization header was supplied.

Explicit authorization headers override the env-derived token.

Python sync `web_search` and `web_fetch` require an authorization header with a
Bearer token. Without it, they raise `ValueError`.

## TypeScript Authorization Behavior

TypeScript client sends configured headers. Provide `Authorization` explicitly
for direct cloud API or cloud web APIs.

Do not assume the TypeScript client will read `OLLAMA_API_KEY` automatically.

## Web Search

TypeScript:

```ts
const result = await client.webSearch({
  query: "latest internal policy summary",
  maxResults: 3,
});
```

Python:

```python
result = client.web_search("what is ollama?", max_results=3)
```

Validation:

- Query is non-empty.
- Result count is bounded.
- Bearer auth is present.
- Search result content is treated as untrusted.
- User privacy policy allows sending query to cloud service.

## Web Fetch

TypeScript:

```ts
const page = await client.webFetch({ url: "https://example.com" });
```

Python:

```python
page = client.web_fetch("https://example.com")
```

Validation:

- URL is valid and allowed.
- SSRF protections exist if user controls URL.
- Bearer auth is present for cloud web API.
- Fetched content is treated as untrusted.
- Response content is bounded before passing to a model or logs.

## Review Findings To Look For

- `OLLAMA_API_KEY` embedded in frontend env var or JavaScript bundle.
- Direct cloud `Authorization` header created in browser code.
- Web fetch accepts arbitrary internal URLs from users.
- Cloud model tags used without product approval or fallback behavior.
- No distinction between local daemon failures and cloud API failures.
- Tests require real cloud credentials in normal CI.
