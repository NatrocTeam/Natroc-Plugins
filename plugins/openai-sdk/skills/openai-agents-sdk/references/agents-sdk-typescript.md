# Agents SDK TypeScript

Use this when implementing `@openai/agents` in TypeScript or JavaScript.

## Runtime And Install

- Node.js 22 or later is the primary runtime.
- Deno and Bun are supported.
- Install with `npm install @openai/agents zod`.
- Use the Client SDK separately when the app also needs direct platform
  resources such as file upload, webhook parsing, or admin APIs.

## Basic Agent

```ts
import { Agent, run } from "@openai/agents";

const agent = new Agent({
  name: "Support Assistant",
  instructions: "Answer customer support questions clearly and concisely.",
  model: process.env.OPENAI_MODEL ?? "gpt-5.5",
});

const result = await run(agent, "How do refunds work?");
console.log(result.finalOutput);
```

## Function Tools

Use Zod schemas for strict tool inputs.

```ts
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up an order by ID when the user asks about order status.",
  parameters: z.object({ orderId: z.string().min(1) }),
  execute: async ({ orderId }) => {
    return { orderId, status: "processing" };
  },
});

const agent = new Agent({
  name: "Order Agent",
  instructions: "Use tools for order-specific questions.",
  tools: [lookupOrder],
});

const result = await run(agent, "Check order ord_123");
```

Keep tools small, explicit, and side-effect aware. Add approvals or guardrails
around high-impact tools.

## Hosted And Built-In Tools

The SDK supports hosted OpenAI tools through Responses models, local/runtime
execution tools, function tools, agents as tools, MCP servers, sandbox
capabilities, and an experimental Codex tool.

Use hosted tools when execution should happen on OpenAI infrastructure. Use
local runtime tools when your application owns execution. Use sandbox agents
when filesystem or shell access should occur in an isolated workspace.

## Handoffs Vs Agents As Tools

Use handoffs when a specialist should take over the conversation.

```ts
const billingAgent = new Agent({
  name: "Billing Agent",
  handoffDescription: "Handles billing and invoice questions.",
  instructions: "Resolve billing questions accurately.",
});

const triageAgent = new Agent({
  name: "Triage Agent",
  instructions: "Route billing questions to the billing specialist.",
  handoffs: [billingAgent],
});
```

Use `agent.asTool()` when a manager should stay in control and call specialists
behind the scenes.

## Running Agents

Agents run through `run()` or a reusable `Runner`.

The runner loop:

1. Calls the current agent's model.
2. Returns final output if there are no tool calls or handoffs.
3. Executes tool calls and loops again.
4. Switches agent on handoff and loops again.
5. Throws when `maxTurns` is exceeded unless disabled.

Use `stream: true` when the UI or transport consumes streaming events. Consume
the stream fully and handle raw model events, run item events, and agent update
events deliberately.

## State And Memory

Choose one strategy per conversation:

- `result.history` for manual local history.
- `session` for SDK-managed storage.
- `conversationId` for OpenAI Conversations API state.
- `previousResponseId` for lightweight Responses API continuation.

Do not mix client-managed history with server-managed state unless the app has
explicit reconciliation logic.

## Guardrails

- Input guardrails run for the first agent in a chain.
- Output guardrails run for the final-output agent.
- Tool guardrails run around function tool invocations.
- Use non-parallel input guardrails when you must block model calls before
  spending tokens or executing tools.

## Sandbox Agents

Use `SandboxAgent` when the agent needs a workspace, filesystem tools, shell
commands, stateful sandbox sessions, snapshots, or mounted skills.

Start with local sandbox clients for development and configure hosted or Docker
clients only when the deployment supports them. Do not use a sandbox agent for
a simple prompt-response task.

## Production Defaults

- Reuse a `Runner` when the app needs shared model provider or tracing config.
- Set `workflowName`, trace metadata, and sensitive-data handling deliberately.
- Cap `maxTurns` for user-facing workflows.
- Add tool timeouts and concurrency limits for expensive local tools.
- Add tests for tool schemas, handoffs, guardrails, streamed events, and
  failure recovery.
