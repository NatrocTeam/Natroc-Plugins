# Agents SDK Feature Playbook

This playbook tells agents how to implement OpenAI Agents SDK workflows.

## Universal Implementation Procedure

1. Identify language and runtime.
2. Confirm package:
   - TypeScript/JavaScript: `@openai/agents` and usually `zod`.
   - Python: `openai-agents`.
3. Decide pattern:
   - Plain agent.
   - Agent with tools.
   - Manager with agents as tools.
   - Triage with handoffs.
   - Guardrailed workflow.
   - Session-backed multi-turn workflow.
   - Sandbox agent.
4. Identify state strategy:
   - No memory.
   - Manual history.
   - SDK session.
   - OpenAI server-managed conversation.
   - Previous response chaining.
5. Identify safety boundaries:
   - Tool permissions.
   - Approval gates.
   - Guardrails.
   - Max turns.
   - Timeouts/concurrency.
   - Tracing sensitive-data policy.
6. Implement deterministic seams first: tools, validators, services, stores.
7. Add agent definitions and runner code.
8. Test deterministic seams and failure paths.
9. Run verification.

## Pattern Selection

Plain agent:

- Best when task is prompt-only with optional structured output.
- No tool side effects.
- No specialist routing.

Agent with function tools:

- Best when one agent can solve the task but needs app APIs or calculations.
- Keep tools cohesive and precise.

Manager with agents as tools:

- Best when one agent should own the final response and call specialists behind
  the scenes.
- Good for combining multiple specialist outputs.
- Manager can enforce global policy.

Handoffs:

- Best when a specialist should take over conversation ownership.
- Good for support triage, domain routing, or language/domain specialists.
- Handoff is represented to the model like a tool.

Guardrailed workflow:

- Best when input/output/tool behavior must be validated.
- Use blocking input guardrails for side-effect prevention.

Session-backed workflow:

- Best for multi-turn chat where the SDK should load/save history.
- Do not combine with server-managed continuation in the same run.

Sandbox agent:

- Best when the agent needs a filesystem workspace, shell, patches, skills,
  memory, snapshots, or long-running repo/document work.
- Not needed for normal app tool calls.

## Agent Definition Quality

Every production agent should have:

- A stable human-readable name.
- Clear instructions.
- Explicit model/config behavior or project config.
- Tool list or handoff list only when needed.
- Output type when the caller expects structured data.
- Guardrails when the workflow has policy or safety boundaries.
- Trace/workflow metadata when observability matters.

Instruction rules:

- Tell the agent when to use tools.
- Tell the agent what not to do.
- Put business policy in instructions only when it is stable and versioned with
  code.
- Keep secrets and credentials out of instructions.
- Do not use the model to enforce permissions that app code can enforce.

## Tool Design

Function tool anatomy:

- Name: stable, snake_case in Python or lower snake/camel by project convention.
- Description: action plus when-to-use.
- Parameters: strict schema with required fields.
- Execute function: small, testable, app-owned logic.
- Error behavior: model-usable message for recoverable failures, exception for
  hard aborts.
- Timeout: required for remote calls or slow operations.
- Approval/guardrail: required for high-impact side effects.

Tool categories:

- Read-only lookup: usually safe with schema validation and timeout.
- Mutating business action: permission check plus idempotency plus approval or
  policy gate.
- External API call: timeout, retry/backoff, error mapping.
- Shell/file/computer action: approval and sandbox/local boundary checks.
- Retrieval/search: result limit and data access check.

Bad tool patterns:

- `do_everything(input: string)`.
- Tool description that repeats the name but not when to use it.
- Tool returns huge raw JSON that the model must sift through.
- Tool hides permission errors as success.
- Tool can trigger payments/emails/deletes without approval.

## Handoffs

Use handoffs when the receiving agent should own the next part of the
conversation.

Design steps:

1. Create specialist agent with a narrow role.
2. Add `handoffDescription` / `handoff_description`.
3. Register one handoff per destination.
4. Add handoff input metadata only when useful for logging/routing context.
5. Add input filters when the receiving agent should not see full history.
6. Explain handoff availability in triage instructions.

Important constraints:

- Handoff input metadata does not replace the destination agent's normal input.
- Handoff metadata does not dynamically choose a different destination.
- Input guardrails apply to the first agent in the chain.
- Output guardrails apply to the final-output agent.
- Tool guardrails do not wrap the handoff call itself.

## Agents As Tools

Use agents as tools when a manager should keep control.

Design steps:

1. Build specialist agent.
2. Expose with `asTool()` / `as_tool()`.
3. Give the tool a specific name and description.
4. Decide whether the nested agent needs structured input.
5. Decide whether nested run streaming should be surfaced.
6. Use custom output extraction only when the manager needs a compressed or
   transformed specialist result.

Good use cases:

- Research manager calls search specialist and summarizer.
- Support manager calls billing/refund/order specialists but writes one final
  response.
- Data agent calls validation and enrichment subagents before returning JSON.

## Guardrails

Guardrail types:

- Input guardrails: run on initial user input.
- Output guardrails: run on final output.
- Tool input guardrails: run before custom function tool execution.
- Tool output guardrails: run after custom function tool execution.

Execution choices:

- Parallel input guardrails reduce latency but the model/tools may start before
  guardrail completion.
- Blocking input guardrails cost latency but prevent model/tool execution when
  blocked.

Use blocking mode when:

- Tool calls can mutate state.
- Token spend must be avoided for blocked requests.
- Safety policy requires no processing before validation.

Use tool guardrails when:

- Each tool call needs validation.
- Handoffs/managers mean agent-level input/output guardrails are insufficient.
- Tool output may contain secrets or policy-violating data.

## Sessions And State

Choose one memory strategy per conversation.

No memory:

- Single-turn tasks.
- Stateless API endpoints.

Manual history:

- App already owns message storage.
- You need provider-agnostic history.

SDK session:

- SDK should load/save history.
- You have a session backend or want built-in local storage.

Server-managed conversation:

- OpenAI should persist conversation state.
- Multiple workers/services need to reuse a conversation ID.

Previous response chaining:

- Lightweight continuation for Responses API without a full conversation
  resource.

Rules:

- Do not combine sessions with server-managed conversation settings in the same
  run unless the SDK explicitly supports the exact combination.
- Keep session IDs stable and tenant-scoped.
- Add retention and deletion behavior for stored conversation history.
- Use history trimming/compaction for long conversations.

## Streaming Agent Runs

Use streaming when:

- UI needs event-level updates.
- Tool progress should be visible.
- Long-running workflows need progress feedback.

Rules:

- Consume stream to completion.
- Handle raw model events, run item events, and agent update events.
- Persist final output only when complete unless partial persistence is a
  product requirement.
- For nested agents as tools, decide whether nested stream events are exposed or
  hidden.
- Test stream event translation without live model calls.

## Human-In-The-Loop

Use approval flows when:

- Tool mutates data.
- Tool spends money.
- Tool sends communication.
- Tool runs shell/file/computer actions.
- Compliance requires review.

Implementation rules:

- Surface interruptions to the application.
- Persist run state if approval can happen after process restart.
- Approve/reject specific interruptions, not all blindly.
- Give rejection messages the model can act on.
- Resume with the same state/session strategy.

## Sandbox Agents

Use only when workspace behavior matters.

Design decisions:

- Manifest: what files/repos/mounts are available.
- Capabilities: filesystem, shell, skills, memory, compaction.
- Sandbox client: local Unix, Docker, hosted provider, or other.
- Session/snapshot: how workspace state persists.
- Network policy: disabled, allowlist, or broader according to product policy.
- User identity: which user the sandbox runs as.

Rules:

- Keep destructive commands behind approval when appropriate.
- Mount only needed files.
- Avoid exposing secrets into sandbox environment unless required.
- Log command summaries, not secret-containing stdout.
- Test workspace setup without a live model when possible.

## Exceptions And Recovery

Common categories:

- Max turns exceeded.
- Model behavior error.
- Model refusal.
- Guardrail tripwire.
- Guardrail execution failure.
- Tool timeout.
- Tool call error.
- User/configuration error.

Rules:

- Convert expected errors into product-specific fallback output.
- Let programmer/config errors fail loudly in development.
- Preserve run state for resumable cases.
- Include trace IDs/request IDs where available.
- Avoid infinite retry loops around agent runs.
