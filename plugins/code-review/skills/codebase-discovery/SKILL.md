---
name: codebase-discovery
description: Use when identifying repo stack, structure, configs, entry points, package manager, framework, tests, database, or deployment before review.
---

# Codebase Discovery

Inspect repository structure and high-signal files before audit.

Priority files: package.json, lockfiles, tsconfig, framework configs, pyproject.toml, requirements.txt, go.mod, Cargo.toml, Dockerfile, compose files, CI workflows, database schemas, migrations, and test config.

Use `../code-review/scripts/detect_stack.py` and `../code-review/scripts/repo_inventory.py` when useful. Report uncertainty instead of guessing.

## Required references

Read plugin-level references when needed:

- `../code-review/references/audit-principles.md`
- `../code-review/references/evidence-policy.md`
- `../code-review/references/severity-model.md`
- `../code-review/references/docs-source-priority.md`
- `../code-review/references/fix-policy.md`
- `../code-review/references/report-format.md`
