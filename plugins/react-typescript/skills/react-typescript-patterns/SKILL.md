---
name: react-typescript-patterns
description: Use this skill when implementing reusable React TypeScript patterns such as wrapper components, polymorphic as props, generic components, discriminated unions, mutually exclusive props, render props, typed errors, and library-facing APIs.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
  version: "1.0.0"
---

# React TypeScript Patterns

## Workflow

1. Use this skill for reusable pattern decision rules below.
2. If detailed references or concrete TSX examples are needed, activate
   `$react-typescript` and load its local `references/patterns.md`,
   `references/components.md`, `references/react-types.md`,
   `references/typescript-core.md`, or `assets/examples/patterns/` material.
3. Prefer a simpler component split before introducing a highly generic type.

## Defaults

- Prefer composition over highly generic polymorphic APIs in application code.
- Use polymorphic `as` only when the component genuinely needs to render
  different element or component types.
- Use discriminated unions for mutually exclusive visual states and async
  states.
- Use `never` to forbid props that do not belong to a union branch.
- Use runtime validation for constraints TypeScript cannot express, especially
  child component identity.
- Keep public library types augmentable and avoid leaking internal helper
  aliases unless they are part of the API.

## Validation

- Run typecheck after adding generic or polymorphic component APIs.
- Include representative valid and invalid call sites for discriminated unions
  or mutually exclusive props when the project has type-level tests.
