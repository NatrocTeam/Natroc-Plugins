---
name: using-natroc-plugins
description: MANDATORY routing layer for Natroc plugins. Invoke BEFORE any response or action when the user's task matches a Natroc plugin domain. Use at session start, when deciding whether a Natroc plugin applies, when the user asks what Natroc plugins are installed or available, or when building/updating Natroc plugin awareness, marketplaces, hooks, plugin metadata, or skill routing.
---

<EXTREMELY-IMPORTANT>
If the user's task matches ANY Natroc plugin domain, you MUST invoke that plugin's
skill BEFORE responding or taking any action. This is not optional. This is not
negotiable. You cannot rationalize your way out of this.

Natroc-awareness is a DOMAIN ROUTING layer. Superpowers and similar systems are
PROCESS layers (how to work). You need BOTH. Using a process skill does NOT satisfy
the domain routing requirement.
</EXTREMELY-IMPORTANT>

# Using Natroc Plugins - Mandatory Domain Routing

## Core Rule

**Match the user's request to installed Natroc plugins FIRST, then invoke the
relevant skill BEFORE answering, exploring, or editing.** Do not read every plugin
file to decide - use the session-start routing table or inspect manifests on demand.

## Routing Workflow

1. Check the session-start routing table if it is present in context.
2. If the inventory is missing or incomplete, inspect nearby marketplace files and plugin manifests.
3. Identify the task domain (code review? React? Expo? SDK work? docs lookup?).
4. **Invoke the matching plugin's skill BEFORE any other action.**
5. If multiple plugins apply, invoke the most specific one first. Process/workflow plugins first, then implementation plugins.
6. If NO plugin matches, say so and proceed without inventing plugin capabilities.

## Routing Red Flags - STOP if you think:

| Thought                             | Reality                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| "This is just a simple question"    | Questions are tasks. Route them.                                        |
| "Let me explore the codebase first" | Check the routing table BEFORE any tool use.                            |
| "I already know this domain"        | Plugin skills have current, structured guidance. Invoke them.           |
| "The plugin is overkill for this"   | Plugins exist to prevent mistakes. Use them.                            |
| "I'll just do it myself quickly"    | Undisciplined action wastes time. Plugins prevent this.                 |
| "Superpowers already covers this"   | Superpowers = process (HOW). Natroc = domain routing (WHICH). Use BOTH. |

## Routing Priorities - ABSOLUTE

**The session-start routing table is the SINGLE SOURCE OF TRUTH.** It is injected
dynamically by the `SessionStart` hook and lists every detected Natroc plugin with
its trigger keywords and the exact skill to invoke.

**To route a task:**

1. Read the "ROUTING TABLE" section in the session-start context (above).
2. Match the user's task to a plugin using its `For <triggers>` field.
3. Invoke the EXACT `plugin:skill` listed in that plugin's routing line.
4. If the routing table is missing, inspect nearby marketplace files and plugin
   manifests to build the routing picture on demand.

**Do NOT rely on a hardcoded plugin list** - the routing table is generated
dynamically from installed plugins and marketplace metadata. What is installed
today may differ tomorrow.

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
- Read hook files only when debugging lifecycle behavior.

## If No Plugin Matches

Say that no detected Natroc plugin clearly matches the task. Then proceed with normal repository or runtime guidance without inventing a plugin capability.
