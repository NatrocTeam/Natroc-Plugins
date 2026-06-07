---
name: using-natroc-plugins
description: Load and use Natroc plugin awareness for routing user tasks to installed Natroc plugins and skills. Use at session start, when deciding whether a Natroc plugin applies, when the user asks what Natroc plugins are installed or available, or when building/updating Natroc plugin awareness, marketplaces, hooks, plugin metadata, or skill routing.
---

# Using Natroc Plugins

Use this skill as a routing layer before loading detailed plugin documentation.

## Core rule

Match the user's request to installed Natroc plugins first, then load only the specific skill, manifest, hook, agent, reference, or README that is relevant.

Do not read every plugin file just to decide what applies.

## Routing workflow

1. Check the session-start inventory if it is present in context.
2. If the inventory is missing or incomplete, inspect nearby marketplace files and plugin manifests.
3. Distinguish detected installed plugins from nearby marketplace entries.
4. Pick the most specific plugin before a generic workflow plugin.
5. Invoke the relevant skill or tool before answering when the runtime supports skill activation.
6. If more than one plugin applies, use process/workflow plugins first, then implementation plugins.

## Routing priorities

- Plugin development request: use `plugin-dev-claude`, `plugin-dev-codex`, or `natroc-awareness` based on the target platform.
- Code review, audit, security, or fix workflow: use `code-review`.
- React TypeScript implementation: use `react-typescript`.
- Animation work: use `motion`.
- Expo or React Native: use `expo`.
- OpenAI SDK work: use `openai-sdk`.
- Anthropic SDK work: use `anthropic-sdk`.
- Ollama SDK or local model work: use `ollama-sdk`.
- Documentation lookup through Context7: use `context7`.
- 21st.dev Magic UI or logo search: use `21st`.
- Bybit exchange tasks: use `bybit`.
- Writing that needs a natural user voice: use `human-context-writer`.
- TypeScript/JavaScript language server setup: use `typescript-lsp`.

## Installed vs known

Use precise language:

- "Detected installed" means the hook or agent found a plugin manifest near the current plugin root.
- "Available in the nearby Natroc marketplace" means the plugin appears in `.claude-plugin/marketplace.json` or `.agents/plugins/marketplace.json`, but was not confirmed as an installed sibling plugin.
- Do not tell the user a plugin is installed if it is only known from marketplace metadata.

## Context discipline

Keep session-start context compact.

Load full plugin details only after the user task points to a plugin. For example:

- Read `.claude-plugin/marketplace.json` or `.agents/plugins/marketplace.json` to discover current marketplace entries.
- Read `plugins/<plugin-name>/README.md` for install behavior or user-facing capability.
- Read `plugins/<plugin-name>/.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` for metadata.
- Read `plugins/<plugin-name>/skills/<skill-name>/SKILL.md` only when that skill applies.
- Read hook files only when debugging lifecycle behavior.

## If no plugin matches

Say that no detected Natroc plugin clearly matches the task. Then proceed with normal repository or runtime guidance without inventing a plugin capability.
