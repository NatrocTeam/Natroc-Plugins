---
name: react-typescript-types
description: Use this skill when choosing or explaining React and TypeScript types, including ReactNode, React.JSX.Element, CSSProperties, ComponentProps, ElementType, refs, utility types, inference, compatibility, declaration merging, enums, namespaces, and TSX behavior.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
  version: "1.0.0"
---

# React TypeScript Types

## Workflow

1. Use this skill for the type-selection rules below.
2. If detailed references or concrete TSX examples are needed, activate
   `$react-typescript` and load its local `references/react-types.md`,
   `references/typescript-core.md`, `references/typescript-jsx.md`,
   `references/refs.md`, or `assets/examples/types/` material.
3. Prefer the narrowest type that matches the API contract.

## Defaults

- Use `React.ReactNode` for renderable values and `React.JSX.Element` for a
  single JSX element return/value.
- Use `React.CSSProperties` for style object props.
- Use `React.ComponentPropsWithoutRef<T>` or
  `React.ComponentPropsWithRef<T>` to mirror intrinsic or component props.
- Use `Omit`, `Pick`, `Extract`, `Exclude`, `NonNullable`, and `ReturnType`
  before writing custom utility types.
- Avoid `object`, `{}`, and `Object` for exact object contracts.
- Prefer string literal unions over enums for React props unless runtime enum
  objects are intentionally needed.

## Validation

- Run typecheck after changing public type exports or utility aliases.
- Check editor hovers or generated declarations for public library APIs when
  the repo supports declaration output.
