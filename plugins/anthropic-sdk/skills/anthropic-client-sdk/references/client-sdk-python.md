# Client SDK Python

Use this reference for the `anthropic` Python package. The SDK targets Python
3.9+.

## Installation

Use the repository's package manager:

```sh
pip install anthropic
```

Use Poetry, uv, pip-tools, or requirements files when the repository already
uses them.

## Basic Client

```python
from anthropic import Anthropic

client = Anthropic()
```

The client reads `ANTHROPIC_API_KEY` from the environment by default. Passing
`api_key=os.environ.get("ANTHROPIC_API_KEY")` is also valid when the app prefers
explicit construction.

## Basic Message

```python
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

message = client.messages.create(
    model=os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5"),
    max_tokens=1024,
    system="Respond as a concise backend engineering assistant.",
    messages=[
        {"role": "user", "content": "Summarize the failure mode in this log."}
    ],
)

text = "".join(
    block.text for block in message.content if getattr(block, "type", None) == "text"
)
```

Do not assume `message.content` is a string.

## Async Client

Use `AsyncAnthropic` in async frameworks:

```python
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

message = await client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Summarize this event."}],
)
```

Use the async client in FastAPI, async workers, and any code that already runs
inside an event loop.

## Wrapper Pattern

```python
from dataclasses import dataclass
from anthropic import Anthropic

@dataclass(frozen=True)
class ClaudeCompletion:
    text: str
    stop_reason: str | None

class ClaudeService:
    def __init__(self, client: Anthropic | None = None) -> None:
        self._client = client or Anthropic()

    def complete(self, prompt: str) -> ClaudeCompletion:
        message = self._client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(
            block.text
            for block in message.content
            if getattr(block, "type", None) == "text"
        )
        return ClaudeCompletion(text=text, stop_reason=message.stop_reason)
```

This pattern supports unit tests with a fake client.

## Streaming

Use `client.messages.stream(...)` for high-level streaming. In async code, use
the async client and async stream manager available in the installed package.

Streaming implementation should:

- handle errors.
- close streams.
- stop when the caller disconnects.
- accumulate final text only when needed.
- test normal, error, and cancellation behavior.

## Python Tools

Use `@beta_tool` to define tools where the installed SDK supports helper
tooling:

```python
from anthropic import beta_tool

@beta_tool
def sum_numbers(left: int, right: int) -> str:
    """Add two integers.

    Args:
        left: First integer.
        right: Second integer.
    """

    return str(left + right)
```

For async clients, use `@beta_async_tool` and `async def`.

Run automatic tool loops with:

```python
runner = client.beta.messages.tool_runner(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    tools=[sum_numbers],
    messages=[{"role": "user", "content": "What is 9 + 10?"}],
)

for message in runner:
    print(message)
```

Use `ToolError` for intentional structured tool failures.

## Count Tokens

```python
count = client.messages.count_tokens(
    model="claude-sonnet-4-5",
    messages=[{"role": "user", "content": "How large is this request?"}],
)
```

Use this for preflight validation instead of character-count heuristics.

## Batches

```python
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "item-1",
            "params": {
                "model": "claude-sonnet-4-5",
                "max_tokens": 256,
                "messages": [{"role": "user", "content": "Summarize item 1."}],
            },
        }
    ]
)
```

Persist the batch ID and custom IDs. Process result variants explicitly.

## Error Handling

Catch SDK exceptions at service boundaries. Known error categories include:

- authentication.
- permission.
- billing.
- invalid request.
- not found.
- rate limit.
- overloaded.
- gateway timeout.
- generic API errors.

Convert to app-specific errors without logging prompts, responses, tool inputs,
files, or credentials.

## Validation Notes

For Python code review, verify:

- `Anthropic` vs `AsyncAnthropic` matches the framework.
- event loop is not blocked by sync SDK calls in async routes.
- tool docstrings and type hints produce correct schemas.
- `ToolError` is used for expected tool failures.
- response block extraction is type-aware.
- provider variants are imported intentionally.
