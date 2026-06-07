---
name: react-typescript
description: Use this skill when building, reviewing, migrating, or debugging React code written in TypeScript, including TSX components, typed props, hooks, context, DOM events, refs, React utility types, and reusable component patterns. Use the bundled local references and examples instead of external docs.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
  version: "1.0.0"
---

# React TypeScript

## Purpose

Use this skill as the main entrypoint for React + TypeScript work. It provides
a local, self-contained guide for choosing React types, designing component
APIs, typing hooks and context, handling refs/events, and applying reusable
patterns.

Do not send the user to external docs. Load the bundled local references and
examples below instead.

## Start Here

1. Read `references/index.md` first to choose the smallest relevant local
   reference set.
2. Load only the local reference files needed for the task.
3. Prefer examples from `assets/examples/` when the user needs concrete TSX.
4. Follow the target repository's existing React and TypeScript conventions
   before introducing a new local pattern.
5. When editing code, verify with the repository's typecheck, tests, or build
   command when available.

## Local Reference Map

- `references/setup.md` - project setup, `.tsx`, `tsconfig`, strictness,
  compiler options, and migration notes.
- `references/components.md` - component props, function components, class
  components, default props, error boundaries, portals, and children.
- `references/hooks.md` - `useState`, `useReducer`, `useMemo`, `useCallback`,
  `useRef`, effects, custom hooks, and reducer/context combinations.
- `references/context.md` - typed context, nullable context, provider values,
  and custom context hooks.
- `references/forms-events.md` - DOM events, form submissions, typed handlers,
  uncontrolled form targets, and event aliases.
- `references/refs.md` - React 19 ref-as-prop, `forwardRef`, `createRef`,
  generic refs, imperative handles, and immutable ref types.
- `references/react-types.md` - `ReactNode`, `React.JSX.Element`,
  `CSSProperties`, `ComponentProps`, `ElementType`, `ComponentType`, and event
  helper types.
- `references/typescript-jsx.md` - TSX parsing, JSX modes, JSX namespace,
  intrinsic elements, value-based elements, and `as` assertions.
- `references/typescript-core.md` - utility types, inference, compatibility,
  declaration merging, enums, decorators, iterators, namespaces, symbols,
  triple-slash directives, and variable declarations.
- `references/patterns.md` - wrapper components, polymorphic `as`, generic
  components, discriminated unions, mutually exclusive props, render props,
  error modeling, and library API choices.
- `references/examples.md` - catalog of all local TSX examples in
  `assets/examples/`.

## Decision Rules

- Type component props with `type` for local app components and `interface`
  for public, augmentable library surfaces unless the surrounding codebase has
  a stronger convention.
- Prefer normal function components with inferred return types. Add
  `React.JSX.Element` only when the return contract needs to catch accidental
  non-JSX returns.
- Type `children` as `React.ReactNode` when anything renderable is accepted.
  Use `React.JSX.Element` or a tuple only when the API intentionally restricts
  the shape.
- For DOM wrapper components, start with
  `React.ComponentPropsWithoutRef<"button">` or
  `React.ComponentPropsWithRef<"input">` rather than broad HTML prop types.
- For `useState`, rely on inference for concrete initial values and provide a
  type argument for nullable, empty, or union state.
- For reducers, use discriminated unions and annotate the reducer return type.
- For context with no meaningful default, use `createContext<T | null>(null)`
  plus a custom hook that throws when the provider is missing.
- For React 19+ components that expose DOM refs, accept `ref` as a prop. For
  React 18 and earlier, use `forwardRef`.
- In `.tsx`, use `value as Type` assertions, not angle-bracket assertions.

## Related Local Helper Skills

- Use `$react-typescript-components` for props, JSX, events, class components,
  error boundaries, and default props.
- Use `$react-typescript-hooks` for state, reducer, context, memoization, refs,
  and custom hooks.
- Use `$react-typescript-types` for React type selection and TypeScript utility
  types.
- Use `$react-typescript-patterns` for reusable components, polymorphism,
  generic components, discriminated unions, and prop constraints.
