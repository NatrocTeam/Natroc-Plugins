# Agents SDK API Surface

This file maps the major OpenAI Agents SDK concepts across TypeScript and
Python. Use it to recognize existing code and choose correct implementation
surfaces.

## Package And Imports

TypeScript/JavaScript:

- Main package: `@openai/agents`
- Common imports: `Agent`, `Runner`, `run`, `tool`, `handoff`
- Schema package: `zod`
- Sandbox imports: `@openai/agents/sandbox`
- Local sandbox clients: `@openai/agents/sandbox/local`
- Extensions package for experimental Codex tool:
  `@openai/agents-extensions/experimental/codex`

Python:

- Main package: `agents` from the `openai-agents` distribution.
- Common imports: `Agent`, `Runner`, `RunConfig`, `function_tool`,
  `handoff`, `ModelSettings`
- Schema package: usually `pydantic`
- Sandbox imports: `agents.sandbox`
- Extensions package for experimental Codex tool:
  `agents.extensions.experimental.codex`

## Agent

Purpose:

- Defines an LLM-backed worker with name, instructions, tools, handoffs,
  guardrails, output type, model settings, and hooks.

TypeScript common fields:

- `name`
- `instructions`
- `prompt`
- `handoffDescription`
- `handoffs`
- `model`
- `modelSettings`
- `tools`
- `mcpServers`
- `mcpConfig`
- `inputGuardrails`
- `outputGuardrails`
- `outputType`
- `toolUseBehavior`
- `resetToolChoice`

Python common fields:

- `name`
- `instructions`
- `prompt`
- `handoff_description`
- `handoffs`
- `model`
- `model_settings`
- `tools`
- `mcp_servers`
- `mcp_config`
- `input_guardrails`
- `output_guardrails`
- `output_type`
- `hooks`
- `tool_use_behavior`
- `reset_tool_choice`

Rules:

- Name should be human-readable and stable.
- Instructions should define role, domain, constraints, and tool policy.
- Use `outputType` / `output_type` when callers require structured data.
- Keep agent definitions close to the workflow they serve or in a dedicated
  agent module.

## Runner / run

Purpose:

- Executes a turn, including model calls, tool calls, handoffs, guardrails,
  sessions, streaming, tracing, and error handling.

TypeScript:

- `run(agent, input, options?)` for simple cases.
- `new Runner(config).run(agent, input, options?)` for reusable/global config.

Python:

- `await Runner.run(agent, input, ...)`
- `Runner.run_sync(agent, input, ...)`
- `Runner.run_streamed(agent, input, ...)`

Runner loop:

1. Call current agent model.
2. If final output, return.
3. If tool calls, execute tools and loop.
4. If handoff, switch current agent and loop.
5. If max-turn limit reached, throw or use configured error handler.

## Run Options / RunConfig

Common runtime controls:

- Model override.
- Model provider.
- Model settings.
- Max turns.
- Context object.
- Session.
- Conversation ID.
- Previous response ID.
- Streaming.
- Signal/cancellation.
- Tracing.
- Input/output guardrails.
- Handoff input filter.
- Model input filter.
- Tool execution concurrency.
- Tool error formatter.
- Error handlers.
- Sandbox config.

Rules:

- Use run-level overrides for deployment/runtime concerns.
- Use agent-level config for durable agent identity and behavior.
- Keep max turns bounded for user-facing workflows.
- Use context for app dependencies and state that tools need.

## Context

Purpose:

- App-owned dependency injection and state passed to tools, guardrails, and
  handoffs.

Use context for:

- Current user/tenant.
- Database/services.
- Feature flags.
- Request IDs.
- Permission data.
- Mutable thread IDs only when the SDK feature explicitly expects mutable
  context.

Do not use context for:

- Secrets that the model might see through tool arguments.
- Large data dumps that should be retrieved by tools.

## Function Tools

TypeScript:

- `tool({ name, description, parameters, execute, ... })`
- Parameters commonly use Zod.

Python:

- `@function_tool`
- Optional overrides for name, description, timeout, error handling, deferred
  loading, and guardrails.
- Function signature/docstring helps build schema.

Rules:

- Use strict schemas.
- Keep output concise.
- Add timeout for remote/slow calls.
- Add approval/guardrail for side effects.
- Test tool function outside model loop.

## Hosted Tools

Hosted OpenAI tools may include:

- Web search.
- File search.
- Code interpreter.
- Image generation.
- Hosted MCP.
- Tool search.

Rules:

- Use hosted tools when provider-side execution is desired.
- Add result limits and filters.
- Tool search is for deferring large tool surfaces.
- Do not force deferred tool choice by name where the SDK disallows it.

## Tool Search

Purpose:

- Let the model load deferred function tools, namespaces, or hosted MCP tools
  only when needed.

Use when:

- Many tools inflate prompt/tool-schema tokens.
- Related tools can be grouped under namespaces.
- The model does not need all tools every turn.

Rules:

- Add exactly one tool-search helper when deferred surfaces require it.
- Prefer namespaces for groups of related functions.
- Keep namespaces small and coherent.
- Do not use for simple workflows with a few tools.

## Agents As Tools

Purpose:

- Expose a specialist agent as a callable tool while manager remains in charge.

TypeScript:

- `agent.asTool({ toolName, toolDescription, ... })`

Python:

- `agent.as_tool(tool_name=..., tool_description=..., ...)`

Advanced options may include:

- Structured input schema.
- Input builder.
- Custom output extractor.
- Nested streaming callback.
- Approval requirements.
- Conditional enablement.
- Runtime options.

Use when:

- Manager must combine multiple specialists.
- Specialist should not take over user conversation.

## Handoffs

Purpose:

- Transfer conversation control to another agent.

TypeScript:

- `handoffs: [agent]`
- `handoff({ agent, ... })` for customization.

Python:

- `handoffs=[agent]`
- `handoff(agent=..., ...)` for customization.

Customizable fields:

- Tool name override.
- Tool description override.
- Handoff callback.
- Handoff input schema.
- Input filter.
- Conditional enablement.
- Nested history behavior where supported.

Use when:

- Specialist should ask/follow up/finalize in its domain.

## Guardrails

Purpose:

- Validate or block inputs, outputs, or tool calls.

Guardrail types:

- Input guardrails.
- Output guardrails.
- Tool input guardrails.
- Tool output guardrails.

Rules:

- Input guardrails only run on first agent in chain.
- Output guardrails only run on final-output agent.
- Tool guardrails run on function tools, not hosted tools or handoff pipeline.
- Use blocking input guardrails to prevent side effects before model execution.

## Sessions

Purpose:

- Load and save conversation history automatically.

Python built-in examples:

- `SQLiteSession`
- `OpenAIConversationsSession`
- `OpenAIResponsesCompactionSession`
- Extension sessions such as Redis, SQLAlchemy, MongoDB, Dapr, encrypted, or
  advanced SQLite where installed.

TypeScript built-in examples:

- `OpenAIConversationsSession`
- `MemorySession`
- `OpenAIResponsesCompactionSession`
- Custom `Session` interface implementations.

Rules:

- Reuse same session for a conversation.
- Do not combine with server-managed continuation in the same run unless the
  SDK feature explicitly supports it.
- Add retention, pruning, or compaction for long histories.

## Tracing

Purpose:

- Observe model calls, tool calls, handoffs, and workflow behavior.

Configure:

- Workflow name.
- Trace ID/group ID.
- Metadata.
- Sensitive-data inclusion.
- Export API key if separate.

Rules:

- Do not let traces become an accidental sensitive data store.
- Use trace IDs in logs for debugging.

## SandboxAgent

Purpose:

- Agent with isolated workspace and sandbox-native capabilities.

Common concepts:

- Manifest/default manifest.
- Entries such as Git repo, local directory, mounted files.
- Capabilities: filesystem, shell, skills, memory, compaction.
- Sandbox client.
- Sandbox session/session state/snapshot.
- Run-as identity.

Rules:

- Use for workspace/repo/document tasks, not simple chat.
- Limit mounted data.
- Set network policy deliberately.
- Keep high-impact shell/file actions gated.

## Realtime Agents

Purpose:

- Voice or low-latency conversational agents with agent features.

Rules:

- Separate audio transport from agent policy.
- Handle connection lifecycle.
- Keep auth server-side or scoped.
- Add guardrails appropriate to live interaction.

## Experimental Codex Tool

Purpose:

- Let an Agents SDK workflow call Codex for workspace-scoped tasks.

Rules:

- Treat as experimental.
- Configure sandbox mode, working directory, thread options, turn options, and
  persistence deliberately.
- Tool inputs must include text or local image input according to SDK schema.
- Use only when delegating bounded workspace work to Codex is appropriate.
