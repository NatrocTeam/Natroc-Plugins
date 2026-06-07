# Migration And Modernization

Use this when updating existing OpenAI code.

## General Migration Rules

1. Do not migrate more than requested.
2. Add regression tests before changing request shape.
3. Keep model/config behavior compatible unless the user asked to change it.
4. Preserve streaming behavior where callers depend on it.
5. Keep API keys and server/client boundaries unchanged or safer.
6. Run typecheck/tests after migration.

## Chat Completions To Responses

Migrate when:

- User asks to modernize.
- Needed feature is Responses-only.
- Existing code is already being refactored and tests exist.

Do not migrate when:

- User only asked for a small bug fix.
- Existing app depends on exact Chat Completions event or message behavior.
- Test coverage is too weak and migration risk is outside scope.

Mapping:

| Chat Completions              | Responses                                                     |
| ----------------------------- | ------------------------------------------------------------- |
| `messages` array              | `input` plus optional `instructions`                          |
| system/developer instructions | `instructions` or input items depending on app design         |
| `choices[0].message.content`  | `response.output_text`                                        |
| chat streaming chunks         | Responses stream events                                       |
| function/tool call loop       | Responses tool events or Agents SDK if loop should be managed |

Migration steps:

1. Snapshot current request construction with tests.
2. Introduce Responses request behind the same service function.
3. Map return value to existing domain response.
4. Update streaming event adapter if streaming.
5. Add failure-path tests.
6. Remove old path only after parity is verified.

## Direct Client SDK To Agents SDK

Migrate when:

- App manually loops model/tool calls.
- Multiple specialists or handoffs are emerging.
- Guardrails/session/tracing are being hand-rolled.
- Tool approval/resume is needed.

Do not migrate when:

- One direct API request is enough.
- Tool loop would add complexity without user value.

Migration steps:

1. Extract direct API prompt and business logic into an agent instruction.
2. Convert app functions into typed tools.
3. Choose manager/handoff pattern.
4. Choose memory strategy.
5. Add max-turn and error behavior.
6. Add tests around tools and routing.

## Assistants/Beta Surfaces To Modern Patterns

If code uses older assistant/thread/run beta-style surfaces:

- Do not remove it blindly.
- Identify whether the product needs persistent assistant resources, file
  search, tools, or thread state.
- Prefer Responses for new direct calls.
- Prefer Agents SDK for managed tool loops/handoffs/sessions.
- Preserve data migration and stored resource IDs if production data exists.

## SDK Version Upgrades

Before upgrade:

- Inspect changelog if available in repo/package.
- Check Node/Python runtime requirements.
- Check TypeScript/Python type changes.
- Check renamed methods or casing differences.
- Run lockfile update using project package manager.

After upgrade:

- Run typecheck.
- Run tests.
- Smoke test streaming/webhooks if touched.
- Verify deployment runtime compatibility.

## Azure Migration

When moving core OpenAI code to Azure:

- Replace core client with Azure client.
- Configure Azure endpoint and API version.
- Replace model IDs with deployment names where required.
- Use Azure identity/token provider where deployment expects it.
- Re-test response shapes and type assumptions.

When moving Azure code to core OpenAI:

- Replace Azure client with core client.
- Remove Azure endpoint/API version/deployment-specific config.
- Re-test type assumptions and model names.
