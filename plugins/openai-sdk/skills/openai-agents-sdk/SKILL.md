---
name: openai-agents-sdk
description: This skill should be used when implementing, debugging, validating, auditing, or reviewing OpenAI Agents SDK workflows in TypeScript, JavaScript, or Python, including agents, tools, handoffs, agents as tools, guardrails, sessions, tracing, streaming, human approval, sandbox agents, and production agent orchestration.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
---

# OpenAI Agents SDK

## Purpose

Use this skill as Agents SDK documentation for both development and validation
work:

- TypeScript/JavaScript package: `@openai/agents` with `zod`.
- Python package: `openai-agents`.

Use the Client SDK skill instead when the task is only a direct API call without
an agent loop.

## Start Here

1. Inspect the project language, runtime, dependency files, and existing agent
   abstractions.
2. Read `../openai-sdk/references/agent-usage-modes.md` to choose development
   documentation mode or existing-code validation documentation mode.
3. Read `../openai-sdk/references/sdk-selection.md` if SDK choice is not obvious.
4. Read the detailed Agents SDK references:
   - `../openai-agents-sdk/references/agents-sdk-api-surface.md`
   - `../openai-agents-sdk/references/agents-sdk-feature-playbook.md`
   - `../openai-agents-sdk/references/agents-sdk-tools-handoffs-guardrails.md`
5. Read the language reference:
   - TypeScript/JavaScript: `../openai-agents-sdk/references/agents-sdk-typescript.md`
   - Python: `../openai-agents-sdk/references/agents-sdk-python.md`
6. Read `../openai-sdk/references/framework-recipes.md` when integrating agents into web
   routes, workers, CLIs, edge, browser, or server frameworks.
7. Read `../openai-sdk-production-review/references/security-privacy.md` for tool permissions, trace data,
   logs, secrets, tenant isolation, and retention.
8. Read `../openai-sdk-production-review/references/failure-modes.md` when debugging agent loops,
   sessions, handoffs, tools, streaming, or sensitive data problems.
9. Read `../openai-sdk-production-review/references/testing-patterns.md` before adding tests.
10. Read `../openai-sdk-production-review/references/production-checklist.md` for production paths.

## Development and Validation Duties

In development mode, use these references to build the smallest correct Agents
SDK workflow, choose a clear orchestration pattern, add safe tool boundaries,
choose one state strategy, test deterministic seams, and verify the change.

In validation mode, use these references to check existing Agents SDK code for
orchestration fit, tool schema quality, tool error behavior, approvals,
guardrails, handoffs, sessions, tracing sensitivity, sandbox boundaries,
streaming event handling, max-turn limits, and tests. Lead with concrete
findings and do not patch code unless requested.

## Architecture Rules

- Use a plain `Agent` for prompt, tools, handoffs, guardrails, and normal
  conversation state.
- Use `SandboxAgent` only when the agent needs an isolated workspace, file
  inspection, shell commands, patches, snapshots, or sandbox memory.
- Use handoffs when a specialist should take over the conversation.
- Use agents as tools when a manager should stay in control.
- Use direct `Runner.run()` inside a tool only when `agent.asTool()` /
  `agent.as_tool()` is too limiting.
- Pick one memory strategy per conversation: manual history, session,
  server-managed conversation, or previous response chaining.
- Bound `maxTurns` in user-facing flows.
- Add tool timeouts, error handlers, and concurrency controls for risky tools.
- Treat tracing as observability, not a data dump. Configure sensitive-data
  behavior deliberately.

## Required Knowledge Checklist

Before editing code, be able to answer:

- Why is this an Agents SDK workflow instead of a direct Client SDK call?
- Which orchestration pattern is correct: plain agent, tools, handoffs, agents
  as tools, guardrails, sessions, or sandbox?
- Which state strategy is used, and is it singular?
- Which tools can mutate state, spend money, send messages, run shell/file
  operations, or access sensitive data?
- Which approvals, permission checks, guardrails, timeouts, and max-turn limits
  are required?
- What deterministic tests cover tools, schemas, handoffs, guardrails, sessions,
  and failure paths?

## Tool Rules

- Tool names must be stable and descriptive.
- Tool descriptions must say what the tool does and when to use it.
- Tool schemas must validate required fields and constraints.
- Tools that mutate state, spend money, send messages, run shell commands, or
  touch private data need approval, guardrails, permissions, or clear internal
  policy checks.
- Function tool errors should return model-usable messages when recovery is
  possible, and throw when the application must abort.

## TypeScript Quick Pattern

```ts
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up order status when the user asks about an order.",
  parameters: z.object({ orderId: z.string().min(1) }),
  execute: async ({ orderId }) => ({ orderId, status: "processing" }),
});

const agent = new Agent({
  name: "Order Agent",
  instructions: "Use tools for order-specific questions.",
  model: process.env.OPENAI_MODEL ?? "gpt-5.5",
  tools: [lookupOrder],
});

const result = await run(agent, "Check order ord_123", { maxTurns: 5 });
console.log(result.finalOutput);
```

## Python Quick Pattern

```python
import os
from agents import Agent, Runner, function_tool

@function_tool
async def lookup_order(order_id: str) -> dict[str, str]:
    """Look up order status when the user asks about an order."""
    return {"order_id": order_id, "status": "processing"}

agent = Agent(
    name="Order Agent",
    instructions="Use tools for order-specific questions.",
    model=os.environ.get("OPENAI_MODEL", "gpt-5.5"),
    tools=[lookup_order],
)

result = await Runner.run(agent, "Check order ord_123", max_turns=5)
print(result.final_output)
```

## Testing Targets

Test:

- Tool behavior as normal functions.
- Tool schemas and validation.
- Guardrail pass/fail paths.
- Handoff routing prompts/config.
- Session or conversation state strategy.
- Streaming events when used.
- Error handlers and max-turn fallback.

## Output Standard

Report the chosen agent pattern, language package, files changed, safety gates,
state strategy, and verification result.
