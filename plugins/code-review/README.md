# Code Review

`code-review` is a strict, evidence-based Codex / Claude Code plugin for reviewing code and safely applying fixes after explicit user approval.

This plugin intentionally ships **without MCP**. Documentation grounding is handled through skills, references, project-local docs, and any built-in agent browsing/search tools available in the runtime.

## What it includes

- 20 skills for review and fix workflows.
- 6 Claude Code root agents for discovery, review, security audit, fix planning, patching, and verification.
- 6 lifecycle hooks for intent, tool, verification, subagent, and final report gates.
- Deterministic scripts under `skills/code-review/scripts/` for stack detection, report validation, secret redaction, command policy, and patch scope checks.
- Schemas and templates under `skills/code-review/` for consistent review/fix reports.

## Core rules

- No evidence, no finding.
- No docs, no framework claim.
- No automatic fix without explicit approval.
- No security severity without attack path.
- No PASS if verification failed.

## Typical flow

```text
User triggers code-review
→ agent loads plugin
→ review-only audit runs
→ Code Review Report is produced
→ agent asks: fix all / fix selected / defer
→ if approved: fix plan → patch → regression tests → verification → post-fix review → Fix Report
```

## Modes

- `review-only`: audit and report only.
- `suggest-fix`: propose fix plans, no file edits.
- `apply-fix`: patch only after explicit approval.
- `strict`: default evidence-first review.
- `release-gate`: fail merge/release on Blocker/Critical/High issues.
- `security-gate`: focus on OWASP/security-critical risks.

## Install/use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install code-review@natroc-plugins
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
  codex plugin add code-review@natroc-plugins
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

## Plugin structure compliance

This no-MCP build is structured around documented plugin surfaces: `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json`, root-level `agents/`, bundled `skills/`, plugin `hooks/hooks.json`, and visual `assets/`. Agent-facing references, scripts, schemas, and templates live under `skills/code-review/` so Claude Code loads them through the declared skills surface instead of relying on arbitrary root plugin folders. Each skill has a required `SKILL.md`; `skills/*/agents/openai.yaml` only uses documented skill metadata fields for Codex/OpenAI surfaces.
