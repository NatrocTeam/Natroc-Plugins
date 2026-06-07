# Python Client

Use this reference for Python code that uses the official `ollama` package.

## Install And Imports

Install:

```sh
pip install ollama
```

Common imports:

```python
import ollama
from ollama import Client, AsyncClient
from ollama import ChatResponse, GenerateResponse
```

Use module-level helpers for simple synchronous scripts. Use `Client` for
configurable synchronous applications. Use `AsyncClient` for async frameworks.

## Client Construction

Default client behavior:

- Host is parsed from `OLLAMA_HOST` when present.
- Otherwise host defaults to local Ollama at `http://127.0.0.1:11434`.
- If `OLLAMA_API_KEY` exists and no explicit authorization header is supplied,
  the Python client adds `Authorization: Bearer <OLLAMA_API_KEY>`.

Custom client:

```python
import os
from ollama import Client

client = Client(
    host=os.environ.get("OLLAMA_HOST"),
    headers={"x-app": "my-service"},
)
```

Direct cloud API:

```python
client = Client(
    host="https://ollama.com",
    headers={"Authorization": "Bearer " + os.environ["OLLAMA_API_KEY"]},
)
```

All extra keyword arguments are passed to `httpx.Client` or
`httpx.AsyncClient`. Use that for timeout/proxy/client customization.

## Chat

```python
from ollama import chat

response = chat(
    model="llama3.1",
    messages=[{"role": "user", "content": "Why is the sky blue?"}],
    options={"temperature": 0},
)

print(response.message.content)
print(response["message"]["content"])
```

Responses support attribute access and dict-style access.

## Generate

```python
from ollama import generate

response = generate(
    model="llama3.1",
    prompt="Summarize this ticket.",
    options={"temperature": 0},
)

print(response.response)
```

## Async Client

Use `AsyncClient` in async routes and async workers:

```python
from ollama import AsyncClient

client = AsyncClient()

async def summarize(text: str) -> str:
    response = await client.chat(
        model="llama3.1",
        messages=[{"role": "user", "content": text}],
    )
    return response.message.content or ""
```

Async streaming:

```python
async for part in await client.chat(
    model="llama3.1",
    messages=[{"role": "user", "content": "Explain streams."}],
    stream=True,
):
    print(part.message.content or "", end="", flush=True)
```

Close long-lived clients when the application lifecycle ends:

```python
await client.close()
```

`Client` and `AsyncClient` can be used as context managers.

## Streaming

Sync streaming:

```python
stream = client.generate(model="llama3.1", prompt="Tell me a story.", stream=True)
for part in stream:
    print(part.response or "", end="", flush=True)
```

Streaming can raise `ResponseError` if an error appears during the stream.
Wrap user-facing streams in error handling.

## Structured Output

Use Pydantic schemas through `model_json_schema()`, then parse and validate the
returned JSON:

```python
import json
from pydantic import BaseModel
from ollama import Client

class Ticket(BaseModel):
    title: str
    priority: str

client = Client()
response = client.chat(
    model="llama3.1",
    messages=[{"role": "user", "content": "Extract title and priority."}],
    format=Ticket.model_json_schema(),
    options={"temperature": 0},
)

ticket = Ticket.model_validate_json(response.message.content or "{}")
```

## Tools

Python functions can be passed as tools when they have type hints and useful
Google-style docstrings:

```python
def lookup_order(order_id: str) -> dict[str, str]:
    """Look up an order by ID.

    Args:
      order_id: Order ID.
    """
    return {"order_id": order_id, "status": "processing"}

messages = [{"role": "user", "content": "Where is order ord_123?"}]
response = client.chat(model="llama3.1", messages=messages, tools=[lookup_order])
```

Manual tool dictionaries are also supported. After receiving tool calls:

1. Check `response.message.tool_calls`.
2. Confirm the function name is allowlisted.
3. Validate and cast arguments.
4. Execute the local function.
5. Append `response.message`.
6. Append a `role: "tool"` message with `tool_name`.
7. Call `chat` again for the final answer.

Tool arguments may not conform exactly to expected types. Cast and validate
before use.

## Images

Image input can be base64, bytes, or file paths. If a string looks like an image
file path but does not exist, validation can raise an error. For production,
validate user file existence, size, type, and permissions before passing paths.

## Embeddings

Use `embed` for new embedding work:

```python
response = client.embed(
    model="nomic-embed-text",
    input=["first document", "second document"],
)

vectors = response.embeddings
```

`embeddings` exists but is deprecated in favor of `embed`.

## Errors

Handle:

- `ollama.ResponseError`: non-success response or stream error. Includes
  `error` and `status_code`.
- `ConnectionError`: client cannot connect to Ollama.
- `ValueError`: invalid images or missing bearer auth for some cloud web APIs.

Example:

```python
import ollama

try:
    response = ollama.chat(model="llama3.1", messages=[{"role": "user", "content": "Hi"}])
except ollama.ResponseError as exc:
    if exc.status_code == 404:
        raise RuntimeError("Configured model is not available") from exc
    raise
except ConnectionError as exc:
    raise RuntimeError("Ollama is not running or not reachable") from exc
```

## Validation Checklist

- Async frameworks use `AsyncClient`.
- Cloud API keys are not exposed in public clients or logs.
- `OLLAMA_HOST` behavior is intentional.
- Missing daemon/model behavior is handled.
- Streaming errors are handled.
- Structured output is schema-validated after parsing.
- Tool calls are allowlisted and arguments are validated.
- New embedding code uses `embed`.
- Tests mock httpx/client calls and gate live Ollama integration tests.
