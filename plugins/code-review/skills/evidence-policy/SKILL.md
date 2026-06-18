---
name: evidence-policy
description: Use when enforcing review finding requirements file evidence, docs basis, impact, fix, confidence, and unverified classification.
---

# Evidence Policy

A finding must have finding_id, severity, category, file, evidence, docs_basis, impact, suggested_fix, and confidence. Security findings must include attack path or abuse case. If a required field is missing, downgrade to Unverified or remove the finding.

## Required references

Read plugin-level references when needed:

- `../code-review/references/audit-principles.md`
- `../code-review/references/evidence-policy.md`
- `../code-review/references/severity-model.md`
- `../code-review/references/docs-source-priority.md`
- `../code-review/references/fix-policy.md`
- `../code-review/references/report-format.md`
