---
name: using-natroc-plugins
description: MANDATORY automatic routing layer for Natroc plugins. Use at session start and BEFORE handling any user request to discover installed Natroc plugins, skills, agents, workflow agents, commands, hooks, and connectors, then route to the best matching capability without waiting for the user to name it.
---

<EXTREMELY-IMPORTANT>
The user does NOT need to mention a plugin, skill, agent, subagent, workflow,
command, hook, or connector by name. You MUST perform Natroc capability discovery
and routing yourself before handling any user request.

If the user's task matches ANY Natroc plugin capability, you MUST invoke or load
that capability BEFORE responding or taking any other action. This is not
optional. This is not negotiable. You cannot rationalize your way out of this.

Natroc-awareness is a DOMAIN ROUTING layer. Superpowers and similar systems are
PROCESS layers (how to work). You need BOTH. Using a process skill does NOT
satisfy the domain routing requirement.
</EXTREMELY-IMPORTANT>

# Using Natroc Plugins - Mandatory Domain Routing

## Core Rule

**Route before work.** Before answering, planning, exploring files, running tools,
editing code, reviewing, debugging, writing docs, or otherwise acting on a user
request, first check whether an installed or nearby Natroc capability applies.

The routing decision is the agent's responsibility. Do not wait for the user to
type a plugin name, skill name, command name, `$skill`, `@agent`, or any other
manual trigger.

## Mandatory Capability Discovery

For every user request, the agent MUST check what Natroc plugin capabilities are
available before acting. This applies even when the request looks simple,
general, or unrelated at first glance.

The availability check MUST cover:

- Installed or nearby Natroc plugins from marketplace files and plugin manifests.
- Skills under `plugins/<plugin-name>/skills/`.
- Root `agents/` entries, including subagents, reviewers, implementers, workflow agents, and role agents when a plugin ships them.
- Commands under `plugins/<plugin-name>/commands/`.
- Hooks under `plugins/<plugin-name>/hooks/` when lifecycle behavior is relevant.
- Connector and integration metadata such as `.mcp.json` or `.app.json` when present.
- Relevant skill-local `agents/`, `references/`, `scripts/`, and `templates/` only after a specific skill applies.

Do this as a compact metadata pass first. Read names, descriptions, keywords,
categories, paths, and folder names before loading full documents. Load full
README, skill, agent, command, hook, workflow, reference, script, or template
content only after the user's task points to that capability.

## No Explicit Trigger Required

The following are all equivalent from a routing perspective:

- The user explicitly says "use the React TypeScript skill".
- The user asks a React TypeScript question without naming any skill.
- The user asks for a review and a code-review agent exists.
- The user asks for a fix and a patch/fix workflow agent exists.
- The user asks about a tool that has a plugin, command, MCP connector, or hook.

In every case, infer the domain, discover available Natroc capabilities, and use
the best match automatically. If a runtime exposes a formal Skill, Agent,
Command, Connector, or workflow invocation mechanism, use it. If the runtime only
exposes files, read the relevant local instructions and apply them directly.

## Routing Workflow

1. Run the mandatory capability discovery check.
2. Identify the user's task domain, action type, tool names, framework names, API names, files, and likely workflow.
3. Check whether session-start context already contains useful Natroc plugin routing information.
4. If routing information is missing or incomplete, inspect nearby marketplace files and plugin manifests.
5. Inspect capability names and lightweight metadata for matching skills, agents, workflow agents, commands, hooks, connectors, references, scripts, and templates.
6. **Invoke or load the matching plugin skill, agent, command, workflow agent, hook guidance, connector capability, or supporting artifact BEFORE doing the task itself.**
7. If multiple capabilities apply, use the most specific capability first. Process/workflow capabilities first, then implementation capabilities.
8. If NO plugin capability matches, proceed without inventing plugin capabilities. Mention the absence only when it helps the user understand the approach.

## Routing Red Flags - STOP if you think:

| Thought                              | Reality                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- |
| "This is just a simple question"     | Questions are tasks. Route them.                                        |
| "Let me explore the codebase first"  | Check routing sources BEFORE broad exploration.                         |
| "The user did not ask for a skill"   | The agent routes automatically. No explicit trigger is required.        |
| "This is probably not a plugin task" | Verify available Natroc capabilities before deciding that.              |
| "I already know this domain"         | Plugin skills have current, structured guidance. Invoke them.           |
| "The plugin is overkill for this"    | Plugins exist to prevent mistakes. Use them.                            |
| "I'll just do it myself quickly"     | Undisciplined action wastes time. Plugins prevent this.                 |
| "Superpowers already covers this"    | Superpowers = process (HOW). Natroc = domain routing (WHICH). Use BOTH. |

## Routing Sources - ABSOLUTE

**Marketplace files and plugin manifests are the source of truth.** The
`SessionStart` hook injects this bootstrap skill, but it does not need to scan
every plugin at startup. Build the routing picture on demand from nearby
marketplace files, manifests, and skill folder names.

**To route a task:**

1. Inspect `.claude-plugin/marketplace.json` or `.agents/plugins/marketplace.json` when present.
2. Check the relevant `plugins/<plugin-name>/.claude-plugin/plugin.json` or `.codex-plugin/plugin.json`.
3. Read folder and file names under `plugins/<plugin-name>/skills/`, `agents/`, `commands/`, and `hooks/`.
4. Check `.mcp.json`, `.app.json`, and skill-local `agents/` metadata when present and relevant.
5. Match the user's task to plugin descriptions, keywords, categories, skill names, agent names, command names, hook purpose, and connector metadata.
6. Invoke or load the exact `plugin:skill`, agent, workflow agent, command, hook guidance, or connector capability that best fits the task domain.

**Do NOT rely on a hardcoded plugin list** - build the routing picture
dynamically from installed plugins and marketplace metadata when needed. What is
installed today may differ tomorrow.

## Capability Selection Rules

- Prefer a specific capability over a general one.
- Prefer a workflow/process capability first when the task is review, audit, fix planning, patching, verification, release, migration, or debugging.
- Prefer a domain implementation skill when the task is about a framework, SDK, API, language, library, service, or product.
- Prefer a root agent or workflow agent when it defines a role that matches the task and the runtime supports agent delegation.
- Prefer a command when the user asks for a discrete plugin command action and the command exists.
- Prefer connector metadata when the task requires external tool access through MCP, app connectors, or integration configuration.
- If more than one capability is relevant, load the minimal set needed and state the order only when useful.
- Never invent capabilities, agent names, commands, hooks, connector tools, parameters, or files that are not present.

## Installed vs Known

Use precise language:

- **"Detected installed"** means the hook or agent found a plugin manifest near the current plugin root.
- **"Available in the nearby Natroc marketplace"** means the plugin appears in `.claude-plugin/marketplace.json` or `.agents/plugins/marketplace.json`, but was not confirmed as an installed sibling plugin.
- Do NOT tell the user a plugin is installed if it is only known from marketplace metadata.

## Context Discipline

Keep session-start context compact. Load full plugin details only after the user task points to a plugin:

- Read `.claude-plugin/marketplace.json` or `.agents/plugins/marketplace.json` to discover current marketplace entries.
- Read `plugins/<plugin-name>/README.md` for install behavior or user-facing capability.
- Read `plugins/<plugin-name>/.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` for metadata.
- Read `plugins/<plugin-name>/skills/<skill-name>/SKILL.md` ONLY when that skill applies.
- Read `plugins/<plugin-name>/agents/`, `commands/`, `hooks/`, `.mcp.json`, or `.app.json` only when the user's task points to those capabilities.
- Read skill-local `agents/`, `references/`, `scripts/`, and `templates/` only after that skill applies.
- Read hook files only when debugging lifecycle behavior.

## If No Plugin Matches

Say that no detected Natroc plugin clearly matches the task. Then proceed with normal repository or runtime guidance without inventing a plugin capability.
