# React TypeScript Local Reference Index

This directory is the local documentation surface for the
`react-typescript` plugin. Use these files instead of sending the user to
external documentation.

## How To Use This Reference

1. Start with the user's task.
2. Pick the smallest matching topic set below.
3. Load only those files.
4. Prefer examples from `assets/examples/` when code is more useful than
   explanation.

## Topic Map

| Task                                              | Read                                               |
| ------------------------------------------------- | -------------------------------------------------- |
| New project setup, `.tsx`, `tsconfig`, strictness | `setup.md`, `typescript-jsx.md`                    |
| Component props, children, function components    | `components.md`, `react-types.md`                  |
| Class components, default props, error boundaries | `components.md`                                    |
| Forms, DOM events, extracted handlers             | `forms-events.md`, `react-types.md`                |
| Hooks, reducer state, custom hooks                | `hooks.md`, `typescript-core.md`                   |
| Context providers and non-null consumers          | `context.md`, `hooks.md`                           |
| Refs, `forwardRef`, React 19 ref prop             | `refs.md`, `react-types.md`                        |
| `ReactNode`, `CSSProperties`, `ComponentProps`    | `react-types.md`                                   |
| JSX mode, intrinsic elements, TSX assertions      | `typescript-jsx.md`                                |
| Utility types and TypeScript language reference   | `typescript-core.md`                               |
| Wrapper, generic, polymorphic, union props        | `patterns.md`, `components.md`, `react-types.md`   |
| Concrete examples                                 | `examples.md`, then files under `assets/examples/` |

## Local Source Coverage

The bundled references cover these source topics:

- React TypeScript setup and project assumptions.
- React official TypeScript guidance for components, hooks, and common React
  types.
- React TypeScript Cheatsheet topics for props, function components, hooks,
  class components, default props, forms/events, context, error boundaries,
  concurrent React notes, patterns, refs, `ReactNode`, and `CSSProperties`.
- TypeScript Handbook topics for JSX, utility types, decorators, declaration
  merging, enums, iterators and generators, mixins, namespaces, namespaces vs
  modules, symbols, triple-slash directives, type compatibility, type
  inference, and variable declarations.

## Local-Only Contract

When using this plugin:

- Do not instruct the user to open a website for React TypeScript docs.
- Refer to local files by path.
- If a topic is missing, add or update a local reference file before relying
  on external material in the final answer.
