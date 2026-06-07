---
name: code-review
description: Strict orchestrator for evidence-based code audit and safe fix workflow. Use when the user asks to review, audit, check, security-review, release-gate, or fix code after review.
---

# Code Review Orchestrator

Use this skill first for any code-review request.

Workflow:

1. Detect requested mode: review-only, suggest-fix, apply-fix, strict, release-gate, or security-gate.
2. Run codebase discovery before judging code.
3. Ground framework/tool claims in official docs or authoritative sources when tools are available.
4. Delegate to domain skills/subagents when scope is broad.
5. Produce a Review Report before applying any patch.
6. Ask whether to fix all findings, selected finding IDs, or defer fixes.
7. If fixes are approved, run fix-planning, patch-implementation, regression-test-generation, fix-verification, and post-fix-review.

Hard rules:

- No evidence, no finding.
- No docs, no framework claim.
- No automatic fix without explicit user approval.
- No PASS verdict if verification failed or was not run.
- Redact secrets.

## Required references

Read plugin-level references when needed:

- `references/audit-principles.md`
- `references/evidence-policy.md`
- `references/severity-model.md`
- `references/docs-source-priority.md`
- `references/fix-policy.md`
- `references/report-format.md`
