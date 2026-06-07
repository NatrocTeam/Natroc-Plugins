---
name: patch-implementation
description: Use when applying minimal safe patches after explicit approval while preserving public API and avoiding unrelated refactors.
---

# Patch Implementation

Use only in apply-fix mode after explicit approval. Patch root cause, keep scope minimal, preserve style, do not rewrite unrelated code, do not add dependencies unless justified, and do not suppress failures.

## Required references

Read plugin-level references when needed:

- `../code-review/references/audit-principles.md`
- `../code-review/references/evidence-policy.md`
- `../code-review/references/severity-model.md`
- `../code-review/references/docs-source-priority.md`
- `../code-review/references/fix-policy.md`
- `../code-review/references/report-format.md`
