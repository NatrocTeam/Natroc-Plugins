# Client SDK Python

Use this when implementing the `openai` package in Python.

## Runtime And Install

- Install with `pip install openai`, `uv add openai`, Poetry, or the repository's
  existing Python package manager.
- Python 3.9 or newer is required.
- The SDK provides sync and async clients.
- Request parameters are typed dictionaries. Responses are Pydantic models with
  helpers such as `.to_json()` and `.to_dict()`.

## Client Construction

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    max_retries=2,
    timeout=60.0,
)
```

For async code:

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
```

Use context managers in services or scripts where explicit connection cleanup
matters.

## Responses API

Use Responses for new model generation flows.

```python
response = client.responses.create(
    model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
    instructions="Answer as a concise product support assistant.",
    input="Explain how refunds work.",
)

return response.output_text
```

For multimodal input, provide content items such as `input_text` and
`input_image`. For local images, read bytes and encode as a data URL when the
API call needs inline image content.

## Chat Completions

Use Chat Completions when maintaining an existing chat-completions flow.

```python
completion = client.chat.completions.create(
    model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
    messages=[
        {"role": "developer", "content": "Answer in one paragraph."},
        {"role": "user", "content": "What changed in the order?"},
    ],
)

return completion.choices[0].message.content or ""
```

## Async Usage

Async calls mirror sync calls but require `await`.

```python
async def generate() -> str:
    response = await client.responses.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
        input="Write three release note bullets.",
    )
    return response.output_text
```

For high-concurrency async workloads, the SDK can use an `aiohttp` backend when
installed with the relevant optional dependency.

## Streaming

```python
stream = client.responses.create(
    model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
    input="Write a short status update.",
    stream=True,
)

for event in stream:
    print(event)
```

Async streaming:

```python
stream = await async_client.responses.create(
    model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
    input="Write a short status update.",
    stream=True,
)

async for event in stream:
    print(event)
```

Map event types explicitly. Test cancellation and partial output paths.

## Files

File upload parameters accept bytes, `PathLike`, or tuple forms.

```python
from pathlib import Path

client.files.create(file=Path("input.jsonl"), purpose="fine-tune")
```

The async client reads `PathLike` contents asynchronously.

## Webhooks

Verify the raw request body before JSON parsing.

```python
request_body = request.get_data(as_text=True)
event = client.webhooks.unwrap(request_body, request.headers)
```

Use `verify_signature()` when the app wants verification and parsing as
separate steps.

## Realtime

Use the async realtime connection for low-latency text/audio interaction.

```python
async with client.realtime.connect(
    model=os.environ.get("OPENAI_REALTIME_MODEL", "gpt-realtime-2")
) as connection:
    await connection.session.update(
        session={"type": "realtime", "output_modalities": ["text"]}
    )
    await connection.conversation.item.create(
        item={
            "type": "message",
            "role": "user",
            "content": [{"type": "input_text", "text": "Say hello"}],
        }
    )
    await connection.response.create()
```

Realtime API error events do not automatically raise SDK exceptions. Handle
`event.type == "error"` inside the event loop.

## Errors And Request IDs

All SDK errors inherit from `openai.APIError`.

```python
import openai

try:
    response = client.responses.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
        input="Ping",
    )
    print(response._request_id)
except openai.APIConnectionError as exc:
    raise RuntimeError("OpenAI API connection failed") from exc
except openai.RateLimitError as exc:
    raise RuntimeError("OpenAI API rate limit reached") from exc
except openai.APIStatusError as exc:
    print(exc.request_id)
    print(exc.status_code)
    raise
```

If a request fails with an API status error, read `exc.request_id`; successful
object responses expose `_request_id`.

## Retries, Timeouts, And Pagination

- The SDK retries connection errors, 408, 409, 429, and 5xx responses 2 times
  by default.
- Configure globally with `max_retries` or per request through
  `client.with_options(max_retries=...)`.
- Default timeout is 10 minutes. Configure lower values for web routes.
- List methods auto-paginate.

```python
for job in client.fine_tuning.jobs.list(limit=20):
    print(job.id)
```

Async list methods support `async for`.

## Azure OpenAI

Use `AzureOpenAI` for Azure OpenAI resources. Azure endpoint, deployment, API
version, API key, and Entra ID token providers can be configured through
constructor options or environment variables.

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_version=os.environ["OPENAI_API_VERSION"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
)
```

Azure API shape differs from the core API shape, so static types may not always
perfectly match returned values.
