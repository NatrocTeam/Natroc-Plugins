# Agents SDK Python

Use this when implementing `openai-agents` in Python.

## Runtime And Install

- Python 3.10 or newer is required.
- Install with `pip install openai-agents`, `uv add openai-agents`, or the
  repository's existing Python package manager.
- Optional extras are available for voice and additional session backends.

## Basic Agent

```python
import asyncio
import os
from agents import Agent, Runner

agent = Agent(
    name="Support Assistant",
    instructions="Answer customer support questions clearly and concisely.",
    model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
)

async def main() -> None:
    result = await Runner.run(agent, "How do refunds work?")
    print(result.final_output)

asyncio.run(main())
```

Use `Runner.run_sync()` only in synchronous entrypoints. Use
`Runner.run_streamed()` when the caller consumes streamed events.

## Function Tools

Use `@function_tool` for normal Python functions. Type annotations and
docstrings become the tool schema and descriptions.

```python
from agents import Agent, Runner, function_tool

@function_tool
async def lookup_order(order_id: str) -> dict[str, str]:
    """Look up an order by ID when the user asks about order status."""
    return {"order_id": order_id, "status": "processing"}

agent = Agent(
    name="Order Agent",
    instructions="Use tools for order-specific questions.",
    tools=[lookup_order],
)

result = await Runner.run(agent, "Check order ord_123")
```

Use Pydantic `Field` or `Annotated` when arguments need constraints or
descriptions. Add timeouts for async tools that can hang.

## Hosted And Runtime Tools

The SDK supports hosted OpenAI tools, local runtime tools, function calling,
agents as tools, and an experimental Codex tool.

Start with:

- Hosted tools for web search, file search, code interpreter, hosted MCP, image
  generation, and tool search.
- Function tools for app-owned APIs and business logic.
- Agents as tools when a manager must retain control.
- Handoffs when a specialist should take over.
- Sandbox agents when work must happen in a configured filesystem workspace.

## Handoffs

Use handoffs when the receiving agent should own the rest of that conversation
segment.

```python
billing_agent = Agent(
    name="Billing Agent",
    handoff_description="Handles billing and invoice questions.",
    instructions="Resolve billing questions accurately.",
)

triage_agent = Agent(
    name="Triage Agent",
    instructions="Route billing questions to the billing specialist.",
    handoffs=[billing_agent],
)
```

Use `handoff(...)` for custom handoff metadata, input filters, or conditional
availability.

## Agents As Tools

Use `agent.as_tool()` when an orchestrator should call specialists while keeping
control of the user-facing response.

```python
tool = billing_agent.as_tool(
    tool_name="billing_helper",
    tool_description="Answer billing and invoice questions.",
)
```

For advanced orchestration, implement a normal `@function_tool` that calls
`Runner.run()` directly.

## Running Agents

Runner methods:

- `Runner.run()` returns an async `RunResult`.
- `Runner.run_sync()` wraps async execution for sync entrypoints.
- `Runner.run_streamed()` returns a streaming result.

The loop calls the model, executes tools, follows handoffs, and stops when a
final output is produced. Set `max_turns` deliberately for user-facing systems.

## State And Memory

Choose one strategy per conversation:

- `result.to_input_list()` for manual history.
- `session` for SDK-managed storage such as SQLite or custom sessions.
- `conversation_id` for OpenAI Conversations API state.
- `previous_response_id` for lightweight Responses API continuation.

Session persistence cannot be combined with server-managed conversation settings
in the same run. Choose one approach per call.

## Guardrails And Run Config

Use `RunConfig` for per-run settings:

- Global model or model settings.
- Tool execution concurrency.
- Input/output guardrails.
- Handoff input filters.
- Tracing flags and metadata.
- Model input filters for redaction or history trimming.
- Reasoning item ID policy when replayed reasoning items trigger provider
  validation errors.

Input guardrails run on the first input, output guardrails run on final output,
and tool guardrails wrap function tool calls.

## Sandbox Agents

Use `SandboxAgent` when the agent must inspect files, run commands, apply
patches, or preserve workspace state. Configure a manifest, capabilities, and a
sandbox client. Do not use sandbox agents for simple in-process tool workflows.

## Production Defaults

- Use async entrypoints for web servers and workers.
- Cap turns, tool timeouts, and local tool concurrency.
- Convert SDK exceptions into app-level responses.
- Set tracing workflow names and sensitive-data policy.
- Test tool schemas, handoffs, guardrails, sessions, streaming, and retry paths.
