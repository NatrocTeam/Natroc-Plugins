---
name: react-typescript-components
description: Use this skill when typing React TypeScript components, props, JSX returns, children, default props, class components, error boundaries, portals, and DOM event handlers. Prefer this for component API design and component-focused code review.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
  version: "1.0.0"
---

# React TypeScript Components

## Workflow

1. Use this skill for the component-facing decision rules below.
2. If detailed references or concrete TSX examples are needed, activate
   `$react-typescript` and load its local `references/components.md`,
   `references/react-types.md`, `references/forms-events.md`, or
   `assets/examples/components/` material.
3. Follow the target repository's existing component style before introducing
   a new local pattern.

## Defaults

- Use normal function components unless class lifecycle APIs or error
  boundaries are required.
- Prefer explicit prop aliases over inline prop objects once a component has
  more than one or two props.
- Prefer `ComponentPropsWithoutRef` for DOM wrappers that do not expose refs.
- Prefer default parameter values over `defaultProps` for function components.
- Keep class component state and props generics explicit.
- Use error boundaries as class components unless the host app already wraps a
  library abstraction around them.

## Validation

- Run the repository's typecheck or build when component props, event types, or
  JSX signatures change.
- For public component APIs, include at least one valid usage and one rejected
  invalid usage in tests or type-level examples when the project supports it.
