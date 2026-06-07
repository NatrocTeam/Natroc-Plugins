# API Surface

This reference maps the official Ollama TypeScript and Python clients to their
major request/response surfaces.

## TypeScript Client

Package: `ollama`

Common imports:

```ts
import ollama from "ollama";
import { Ollama } from "ollama";
import ollamaBrowser from "ollama/browser";
```

Default host: `http://127.0.0.1:11434`.

Custom client:

```ts
const client = new Ollama({
  host: "http://127.0.0.1:11434",
  headers: { Authorization: "Bearer token" },
});
```

Method map:

| Feature           | TypeScript method            | Returns                             |
| ----------------- | ---------------------------- | ----------------------------------- |
| Chat              | `ollama.chat(request)`       | `ChatResponse` or async iterator    |
| Generate          | `ollama.generate(request)`   | `GenerateResponse` or iterator      |
| Pull model        | `ollama.pull(request)`       | `ProgressResponse` or iterator      |
| Push model        | `ollama.push(request)`       | `ProgressResponse` or iterator      |
| Create model      | `ollama.create(request)`     | `ProgressResponse` or iterator      |
| Delete model      | `ollama.delete(request)`     | `StatusResponse`                    |
| Copy model        | `ollama.copy(request)`       | `StatusResponse`                    |
| List models       | `ollama.list()`              | `ListResponse`                      |
| Show model        | `ollama.show(request)`       | `ShowResponse`                      |
| Embed             | `ollama.embed(request)`      | `EmbedResponse`                     |
| Legacy embeddings | `ollama.embeddings(request)` | `EmbeddingsResponse`                |
| Running models    | `ollama.ps()`                | model list                          |
| Server version    | `ollama.version()`           | `VersionResponse`                   |
| Web search        | `ollama.webSearch(request)`  | `WebSearchResponse`                 |
| Web fetch         | `ollama.webFetch(request)`   | `WebFetchResponse`                  |
| Abort streams     | `ollama.abort()`             | aborts all active streams on client |

Important TypeScript notes:

- Streaming is enabled with `stream: true`.
- Streaming returns an abortable async iterator.
- `abort()` aborts all active streamed requests on that client instance. Use one
  client per independently controlled stream when needed.
- Node `Ollama.create()` rejects `from` values that resolve to local paths.
- TypeScript `create` does not support a `files` parameter.
- Images can be `Uint8Array` or base64 strings. Node client also handles file
  paths through `encodeImage`.

## Python Client

Package: `ollama`

Common imports:

```python
import ollama
from ollama import Client, AsyncClient
from ollama import ChatResponse, GenerateResponse
```

Default host: parsed from `OLLAMA_HOST` if set; otherwise local host
`http://127.0.0.1:11434`.

The Python client automatically adds `Authorization: Bearer <OLLAMA_API_KEY>`
when `OLLAMA_API_KEY` exists and no explicit authorization header is supplied.

Method map:

| Feature           | Python sync method                 | Async method                     |
| ----------------- | ---------------------------------- | -------------------------------- |
| Chat              | `client.chat(...)`                 | `await client.chat(...)`         |
| Generate          | `client.generate(...)`             | `await client.generate(...)`     |
| Embed             | `client.embed(...)`                | `await client.embed(...)`        |
| Legacy embeddings | `client.embeddings(...)`           | `await client.embeddings(...)`   |
| Pull model        | `client.pull(...)`                 | `await client.pull(...)`         |
| Push model        | `client.push(...)`                 | `await client.push(...)`         |
| Create model      | `client.create(...)`               | `await client.create(...)`       |
| Create blob       | `client.create_blob(path)`         | `await client.create_blob(path)` |
| List models       | `client.list()`                    | `await client.list()`            |
| Show model        | `client.show(model)`               | `await client.show(model)`       |
| Delete model      | `client.delete(model)`             | `await client.delete(model)`     |
| Copy model        | `client.copy(source, destination)` | `await client.copy(...)`         |
| Running models    | `client.ps()`                      | `await client.ps()`              |
| Web search        | `client.web_search(...)`           | `await client.web_search(...)`   |
| Web fetch         | `client.web_fetch(...)`            | `await client.web_fetch(...)`    |

Module-level helpers such as `ollama.chat(...)` and `ollama.generate(...)` are
available for simple synchronous use.

Important Python notes:

- Streaming is enabled with `stream=True`.
- Sync streaming returns an iterator.
- Async streaming returns an async iterator.
- `ResponseError` is raised for non-success responses or streaming errors.
- `ConnectionError` is raised when the client cannot connect to Ollama.
- `embed` is preferred for new embedding work; `embeddings` is deprecated.
- Python functions passed as tools are converted into tool schemas when they
  have usable type annotations and Google-style docstrings.
- Message and response objects support attribute access and dict-style access.

## Core Request Fields

Chat request:

- `model`: model name.
- `messages`: message history.
- `stream`: return stream iterator when true.
- `format`: `json` or JSON schema object.
- `keep_alive`: duration to keep model loaded.
- `tools`: function-tool schemas or Python callables.
- `think`: boolean or `low`/`medium`/`high` where supported.
- `logprobs`: return token log probabilities where supported.
- `top_logprobs`: number of alternative logprobs.
- `options`: runtime/model options.

Generate request:

- `model`: model name.
- `prompt`: prompt text.
- `suffix`: text after inserted text for fill-in-middle style behavior.
- `system`: override system prompt.
- `template`: override prompt template.
- `raw`: bypass template.
- `images`: multimodal image data.
- `format`: `json` or JSON schema object.
- `stream`: return stream iterator when true.
- `think`, `logprobs`, `top_logprobs`, `keep_alive`, `options`.
- `width`, `height`, `steps`: experimental image generation fields.

Embed request:

- `model`: embedding-capable model.
- `input`: string or list of strings.
- `truncate`: whether to truncate to model context.
- `dimensions`: optional output dimension truncation where supported.
- `keep_alive`, `options`.

## Common Response Fields

Generation/chat response timing fields commonly include:

- `model`
- `created_at`
- `done`
- `done_reason`
- `total_duration`
- `load_duration`
- `prompt_eval_count`
- `prompt_eval_duration`
- `eval_count`
- `eval_duration`

Chat response includes `message`.

Generate response includes `response`, optional `thinking`, optional `context`,
optional `logprobs`, and optional image fields.

Embed response includes `embeddings`.

Progress response includes `status`, optional `digest`, optional `total`, and
optional `completed`.
