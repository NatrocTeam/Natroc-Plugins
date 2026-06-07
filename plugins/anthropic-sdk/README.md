# Anthropic SDK

`anthropic-sdk` is a self-contained Codex and Claude Code plugin for building,
debugging, reviewing, and hardening software with Anthropic Claude Client SDKs
and Claude Agent SDKs in TypeScript/JavaScript and Python.

Agents use this plugin as bundled documentation for two primary tasks:

1. Development documentation: build or modify software that uses the Anthropic
   Client SDK, the Claude Agent SDK, or both.
2. Existing-code validation documentation: inspect, validate, audit, and review
   code that already uses the Anthropic Client SDK, the Claude Agent SDK, or
   both.

The plugin is self-contained at usage time. Agents should read the bundled
skills and references inside this folder, infer the target language/framework
from the repository, and only ask the user when a product decision, policy
boundary, secret value, or ambiguous app root cannot be inferred safely.

## What It Includes

- 4 bundled skills:
  - `anthropic-sdk` - router and architecture entrypoint.
  - `anthropic-client-sdk` - TypeScript/JavaScript and Python Client SDK
    implementation.
  - `anthropic-agent-sdk` - TypeScript/JavaScript and Python Claude Agent SDK
    implementation.
  - `anthropic-sdk-production-review` - correctness, security, and production
    review.
- 3 Claude Code root agents:
  - `anthropic-client-sdk-engineer`
  - `anthropic-agent-sdk-engineer`
  - `anthropic-sdk-reviewer`
- Local references for SDK selection, Client SDK API surface, Client SDK
  TypeScript/Python patterns, Claude Agent SDK TypeScript/Python patterns,
  tools, streaming, structured output, provider variants, security, testing,
  failure modes, and production readiness.
- A dedicated agent usage contract that defines development documentation mode
  and existing-code validation documentation mode.
- Codex skill metadata in `skills/*/agents/openai.yaml`.

## Reference Coverage

The plugin includes detailed local references for:

- SDK selection and no-question rules.
- Agent usage modes for development docs and existing-code validation docs.
- Client SDK API surface and resource method map.
- Messages API, streaming helpers, token counting, batches, models, and beta
  resources.
- TypeScript Client SDK patterns for `@anthropic-ai/sdk`.
- Python Client SDK patterns for `anthropic`, `Anthropic`, and
  `AsyncAnthropic`.
- Tool use loops, TypeScript tool runners, Python `@beta_tool`, structured
  tool errors, server tools, and structured output parsing.
- Claude Agent SDK API surface for `query()`, `ClaudeAgentOptions`,
  `ClaudeSDKClient`, permissions, built-in tools, MCP servers, hooks, sessions,
  session stores, resume/fork behavior, sandboxing, and error handling.
- TypeScript Agent SDK usage with `@anthropic-ai/claude-agent-sdk`.
- Python Agent SDK usage with `claude-agent-sdk`.
- Provider variants for Amazon Bedrock, Vertex AI, AWS, Azure, and Foundry
  where the SDK package exposes dedicated clients.
- Security/privacy rules for API keys, browser boundaries, server tools,
  code/file execution, session transcripts, hooks, logs, and customer data.
- Testing and validation patterns for new implementations and existing code.
- Failure-mode diagnosis and production readiness.

## Agent Usage Contract

Agents using this plugin should:

1. Treat the plugin as the local documentation source for Anthropic SDK
   development and Anthropic SDK validation work.
2. Select the usage mode without asking:
   - Development documentation mode when the user asks to build, add, modify,
     migrate, debug, or wire Anthropic SDK behavior.
   - Existing-code validation documentation mode when the user asks to validate,
     review, audit, check, harden, release-gate, or assess code that already
     uses Anthropic SDK packages.
3. Inspect the project first: package manager, runtime, framework,
   dependencies, existing Anthropic usage, tests, and environment conventions.
4. Choose the SDK without asking when the request is clear:
   - Client SDK for direct Claude API calls, Messages API, streaming, token
     counting, batches, models, multimodal content, structured output, server
     tools, or provider-specific clients.
   - Claude Agent SDK for programmatic Claude Code agents that inspect/edit
     files, run commands, use built-in tools, call custom tools, attach MCP
     servers, apply hooks, maintain sessions, or operate over a workspace.
5. Prefer the repository's existing language, framework, test, and config
   patterns.
6. Keep API keys server-side and read secrets from environment/config.
7. Add error handling, request IDs where exposed, timeouts/retries, streaming
   cleanup, permission boundaries, and tests when the change touches production
   paths.
8. For validation work, lead with evidence-based findings and specific fixes
   instead of general explanations.
9. Avoid sending users to external docs for routine implementation details; use
   this plugin's bundled local references first.

## Plugin Structure

```text
anthropic-sdk/
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
├── agents/
├── assets/
└── skills/
    ├── anthropic-sdk/
    │   └── references/
    ├── anthropic-client-sdk/
    │   └── references/
    ├── anthropic-agent-sdk/
    │   └── references/
    └── anthropic-sdk-production-review/
        └── references/
```

## Install/Use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install anthropic-sdk@natroc-plugins
  ```

### Claude Desktop & Claude Web (claude.ai)

Open `Customize` in the left panel and click `+` icon, then select `Create
plugin` > `Add marketplace`.

- Add marketplace from a repository

  ```
  NatrocTeam/Natroc-Plugins
  ```

### Codex CLI

- Add marketplace

  ```
  codex plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin
  ```
  codex plugin add anthropic-sdk@natroc-plugins
  ```

### Codex Desktop

- Add marketplace

  Source

  ```
  NatrocTeam/Natroc-Plugins
  ```

  Git ref (optional)

  ```
  main
  ```

## LISENSE

MIT
