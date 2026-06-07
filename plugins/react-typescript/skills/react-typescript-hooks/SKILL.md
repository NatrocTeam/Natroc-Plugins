---
name: react-typescript-hooks
description: Use this skill when typing React hooks in TypeScript, including useState, useReducer, useContext, useMemo, useCallback, useRef, effects, custom hooks, reducer actions, dispatch values, and provider patterns.
license: MIT
metadata:
  author: PT Kelana Tech Solutions
  version: "1.0.0"
---

# React TypeScript Hooks

## Workflow

1. Use this skill for the hook-facing decision rules below.
2. If detailed references or concrete TSX examples are needed, activate
   `$react-typescript` and load its local `references/hooks.md`,
   `references/context.md`, `references/refs.md`, or
   `assets/examples/hooks/` material.
3. Follow the target repository's state-management conventions before adding a
   new provider or reducer abstraction.

## Defaults

- Let `useState` infer concrete primitive/object states.
- Use explicit unions for status-like state and nullable state.
- Type reducer state, action, and return value; use exhaustive switches.
- Memoize context values when object identity can cause avoidable re-renders.
- For mutable refs, include `null` in the type argument when the initial value
  is `null`.
- Write custom hooks with named return objects when there are three or more
  returned values.

## Validation

- Run typecheck after reducer, context, or ref changes.
- Manually inspect reducer switches for exhaustive handling.
- Verify custom hooks do not hide required provider errors behind nullable
  returns unless the API intentionally allows missing providers.
