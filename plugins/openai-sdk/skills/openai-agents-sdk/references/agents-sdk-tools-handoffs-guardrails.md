# Agents SDK Tools, Handoffs, Guardrails, And Sessions

This is the deep operational reference for non-trivial Agents SDK workflows.

## Tool Taxonomy

Hosted tools:

- Run alongside the OpenAI model.
- Useful for web search, file search, code interpreter, hosted MCP, image
  generation, and tool search.
- Your app configures the tool; OpenAI executes it.

Local/runtime tools:

- Executed by your app or configured runtime.
- Include function tools and local built-in execution tools.
- Require careful timeouts, permissions, and error behavior.

Agents as tools:

- A specialist agent becomes a callable tool.
- The manager remains responsible for final answer.

Handoffs:

- A specialist agent takes over conversation control.
- Modeled as tool-like routing to the model, but execution goes through the
  handoff pipeline.

Sandbox capabilities:

- Workspace-scoped shell/filesystem/skills/memory/compaction.
- Bound to sandbox session, not the whole app process.

## Tool Description Template

Good descriptions answer:

1. What does the tool do?
2. When should the model use it?
3. What are important constraints?

Template:

```text
Use this tool to [action] when [trigger]. It requires [inputs]. It returns
[output]. Do not use it for [non-goal].
```

Examples:

- `Look up an order by ID when the user asks about order status, shipping, or
delivery. Requires an order ID. Returns status and estimated delivery.`
- `Create a refund draft for human approval. Use only after verifying the order
and policy. Does not issue the refund directly.`

## Tool Schema Rules

Use narrow schemas:

- Prefer enums for known modes.
- Use minimum/maximum constraints for numbers.
- Use string format or regex constraints where project validators support them.
- Require all fields needed for execution.
- Use optional fields only when the tool has clear defaults.

Bad schemas:

- A single free-form `input` for everything.
- Arbitrary object without known properties.
- Hidden dependencies not visible in schema or context.

## Tool Return Rules

Return compact, model-usable results:

- Include the fields the model needs to decide next action.
- Avoid dumping huge raw API responses.
- Redact secrets and private data.
- Distinguish not found, permission denied, validation failed, and transient
  failures.

For recoverable failures, return a concise message the model can use. For hard
failures, throw so the app can handle them.

## Side Effect Classification

Read-only:

- Search, fetch, calculate, classify.
- Usually okay with schema validation and timeout.

Low-impact mutation:

- Draft creation, local cache update.
- Needs idempotency and tests.

High-impact mutation:

- Delete, send, charge, refund, deploy, execute shell, write files, change
  permissions.
- Needs approval or strong app-level permission checks.

Sensitive data access:

- Customer records, secrets, billing, auth, health, legal data.
- Needs authorization checks and redacted outputs.

## Handoff Design Checklist

Use handoff when:

- The specialist has its own conversation policy.
- The specialist should ask follow-up questions.
- The specialist should produce final output for its domain.

Do not use handoff when:

- The manager must combine multiple specialists.
- The specialist should only return data to the manager.
- You need tool guardrails around the delegation itself.

Required for each handoff target:

- Narrow specialist instructions.
- Clear handoff description.
- Triage instructions naming when to route.
- Optional input metadata for reason/priority/language.
- Optional input filter to remove irrelevant or sensitive history.

## Input Filter Use Cases

Use an input filter to:

- Remove tool call details before handoff.
- Summarize prior conversation before specialist sees it.
- Remove sensitive messages not needed by specialist.
- Keep only latest user request.
- Preserve domain context while dropping unrelated chatter.

Do not use input filters to hide data that app permissions should have blocked
before model execution.

## Guardrail Boundary Matrix

| Need                                                | Correct guardrail                                     |
| --------------------------------------------------- | ----------------------------------------------------- |
| Stop malicious initial prompt before tool execution | Blocking input guardrail                              |
| Validate final answer format/safety                 | Output guardrail                                      |
| Validate every tool argument                        | Tool input guardrail                                  |
| Redact or block tool output                         | Tool output guardrail                                 |
| Control handoff destination                         | Handoff availability/instructions, not tool guardrail |
| Enforce app permissions                             | App code, optionally plus guardrail                   |

## Session Strategy Matrix

| Strategy             | Use when                             | Avoid when                                      |
| -------------------- | ------------------------------------ | ----------------------------------------------- |
| No state             | Single turn                          | Follow-up questions matter                      |
| Manual history       | App already owns history             | You want SDK storage                            |
| SDK session          | SDK should load/save history         | You use server-managed continuation in same run |
| Conversation ID      | Multiple services share server state | You need provider-agnostic storage              |
| Previous response ID | Simple Responses continuation        | You need named conversation resource            |

## Long Conversation Rules

- Use retention limits.
- Use session input callbacks or model input filters for trimming.
- Use compaction when available and appropriate.
- Keep audit logs separate from prompt history.
- Avoid mixing generated tool outputs into future input when not needed.

## Trace Policy

Tracing is for observability, not storage of unrestricted sensitive data.

Decide:

- Workflow name.
- Group ID/thread ID.
- Trace metadata.
- Whether sensitive LLM/tool inputs and outputs can be included.
- How long traces are retained in your organization.

Rules:

- Disable or redact sensitive trace content for regulated workflows.
- Do not include API keys or credentials in tool arguments.
- Use request IDs/trace IDs in logs for supportability.
