# Ollama SDK

`ollama-sdk` is a self-contained Codex and Claude Code plugin for building,
debugging, reviewing, and hardening software with the official Ollama
TypeScript and Python clients.

Agents use this plugin as bundled documentation for two primary tasks:

1. Development documentation: build or modify software that uses Ollama local
   models, Ollama cloud models, or the Ollama cloud API.
2. Existing-code validation documentation: inspect, validate, audit, and review
   code that already uses the Ollama TypeScript or Python client.

The plugin does not rely on repository-local documentation outside this plugin
at usage time. Agents should read the bundled skills and references inside this
folder, infer language/framework/runtime from the project, and only ask the
user when a product decision, model policy, remote host, or secret cannot be
inferred safely.

## What It Includes

- 4 bundled skills:
  - `ollama` - router and architecture entrypoint.
  - `ollama-client` - TypeScript and Python client implementation docs.
  - `ollama-runtime` - local daemon, host, model lifecycle, cloud, and runtime
    operations.
  - `ollama-production-review` - correctness, security, and production review.
- 3 Claude Code root agents:
  - `ollama-client-engineer`
  - `ollama-runtime-engineer`
  - `ollama-reviewer`
- Local references for usage modes, API surface, TypeScript client, Python
  client, feature playbooks, tools and structured outputs, runtime and model
  lifecycle, cloud and web APIs, testing, security, failure modes, and
  production readiness.
- Codex skill metadata in `skills/*/agents/openai.yaml`.

## Agent Usage Contract

Agents using this plugin should:

1. Treat the plugin as the local documentation source for Ollama development
   and Ollama validation work.
2. Select the usage mode without asking:
   - Development documentation mode when the user asks to build, add, modify,
     migrate, debug, or wire Ollama behavior.
   - Existing-code validation documentation mode when the user asks to validate,
     review, audit, check, harden, release-gate, or assess code that already
     uses Ollama packages.
3. Inspect the project first: package manager, runtime, framework,
   dependencies, existing Ollama usage, test style, and environment
   conventions.
4. Choose the correct surface without asking when the request is clear:
   - TypeScript package `ollama` for JavaScript, TypeScript, Node, browser, and
     edge-compatible client work.
   - Python package `ollama` for sync or async Python client work.
   - Runtime/model lifecycle operations for daemon host configuration, model
     availability, pull/create/copy/delete/show/ps, cloud API, web search, and
     web fetch behavior.
5. Prefer the repository's existing language and framework patterns.
6. Keep Ollama cloud API keys server-side and read secrets from
   environment/config.
7. Add error handling, stream cancellation/cleanup, model availability checks,
   request timeouts, deterministic tests, and production review when the change
   touches production paths.
8. For validation work, lead with evidence-based findings and specific fixes.
9. Avoid sending users to external docs for routine implementation details; use
   this plugin's bundled local references first.

## Reference Coverage

The plugin includes detailed local references for:

- Agent usage modes for development docs and existing-code validation docs.
- Client/runtime selection and no-question rules.
- Ollama TypeScript and Python API surface maps.
- Chat, generate, streaming, structured outputs, tools, thinking, logprobs,
  multimodal images, image generation, embeddings, and model lifecycle.
- Local daemon host configuration and `OLLAMA_HOST`.
- Ollama cloud model usage and cloud API headers.
- Web search and web fetch authentication.
- Framework recipes for routes, workers, CLIs, browser boundaries, and edge
  runtimes.
- Security, privacy, host exposure, local-network risks, cloud API keys, and
  tool safety.
- Testing with mocked HTTP clients, fake fetch, stream fixtures, and model
  lifecycle tests.
- Failure-mode diagnosis and production review.

## Plugin Structure

```text
ollama-sdk/
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
├── agents/
├── assets/
├── skills/
│   ├── ollama/
│   │   └── references/
│   ├── ollama-client/
│   │   └── references/
│   ├── ollama-runtime/
│   │   └── references/
│   └── ollama-production-review/
│       └── references/
```

## Install/Use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install ollama-sdk@natroc-plugins
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
  codex plugin add ollama-sdk@natroc-plugins
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
