# React TypeScript Plugin

A local-first skill pack for building, reviewing, migrating, and debugging React
code written in TypeScript.

The plugin gives an agent a focused React + TypeScript reference surface for
component APIs, hooks, context, DOM events, refs, React utility types, TSX
behavior, and reusable component patterns. It is designed to keep answers tied
to the bundled local references and examples instead of sending users to broad
external documentation during coding work.

It is packaged for Claude Code and Codex through `.claude-plugin/plugin.json`
and `.codex-plugin/plugin.json`.

## What's Included

This plugin provides:

- **Main skill** - `$react-typescript` for general React TypeScript work.
- **Focused helper skills** - Smaller entrypoints for components, hooks, types,
  and reusable patterns.
- **Local references** - Topic-based Markdown docs under
  `skills/react-typescript/references/`.
- **TSX examples** - Small examples under
  `skills/react-typescript/assets/examples/`.
- **Subagents** - Claude Markdown and Codex TOML agents for implementation and
  type-safety review workflows.
- **Agent metadata** - OpenAI-facing display names, short descriptions, default
  prompts, and implicit invocation policy for each skill.

It does not currently include MCP servers, commands, hooks, or runtime scripts.

## Skills

| Skill                          | Use it for                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$react-typescript`            | Main entrypoint for React TypeScript setup, components, hooks, context, events, refs, utility types, TSX behavior, and patterns.                                                                        |
| `$react-typescript-components` | Component props, JSX returns, children, default props, class components, error boundaries, portals, and DOM event handlers.                                                                             |
| `$react-typescript-hooks`      | `useState`, `useReducer`, `useContext`, `useMemo`, `useCallback`, `useRef`, effects, custom hooks, reducer actions, dispatch values, and provider patterns.                                             |
| `$react-typescript-types`      | `ReactNode`, `React.JSX.Element`, `CSSProperties`, `ComponentProps`, `ElementType`, refs, TypeScript utility types, inference, compatibility, declaration merging, enums, namespaces, and TSX behavior. |
| `$react-typescript-patterns`   | Wrapper components, polymorphic `as` props, generic components, discriminated unions, mutually exclusive props, render props, typed errors, and library-facing APIs.                                    |

## How It Works

The main workflow is intentionally narrow:

1. Start with `skills/react-typescript/references/index.md`.
2. Load only the smallest reference set that matches the user's task.
3. Prefer concrete files from `skills/react-typescript/assets/examples/` when a
   TSX example is more useful than prose.
4. Follow the target repository's existing React and TypeScript conventions
   before introducing a new local pattern.
5. When code changes are made, verify with the repository's typecheck, tests, or
   build command when available.

The local references are based on React's official TypeScript guidance,
TypeScript's official JSX and language documentation, and established React
TypeScript patterns. During plugin use, the bundled files are the primary
working reference.

## Reference Map

| File                            | Covers                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `references/setup.md`           | Project setup, `.tsx`, `tsconfig`, strictness, compiler options, migration notes, and verification commands.                                                                                                 |
| `references/components.md`      | Function components, prop typing, `children`, DOM prop mirroring, default props, class components, error boundaries, portals, and Suspense notes.                                                            |
| `references/hooks.md`           | `useState`, async state, reducers, context notes, `useMemo`, `useCallback`, `useRef`, effects, and custom hooks.                                                                                             |
| `references/context.md`         | Context defaults, nullable context, guarded custom hooks, provider props, reducer plus context, and common mistakes.                                                                                         |
| `references/forms-events.md`    | Inline handlers, extracted handlers, form submit events, uncontrolled inputs, common React event types, and event prop design.                                                                               |
| `references/refs.md`            | DOM refs, React 19 ref-as-prop, React 18 `forwardRef`, `createRef`, generic refs, and imperative handles.                                                                                                    |
| `references/react-types.md`     | `React.ReactNode`, `React.JSX.Element`, `React.CSSProperties`, event types, prop extraction, component types, ref types, class component types, and portal utilities.                                        |
| `references/typescript-jsx.md`  | TSX requirements, JSX compiler modes, assertions, intrinsic elements, value-based elements, JSX prop checking, and `React.JSX`.                                                                              |
| `references/typescript-core.md` | Utility types, inference, compatibility, declaration merging, enums, decorators, iterators, mixins, namespaces, symbols, triple-slash directives, and variable declarations.                                 |
| `references/patterns.md`        | Native wrappers, component wrappers, generic components, polymorphic components, discriminated union props, `never` exclusions, all-or-nothing props, render props, error modeling, and library API choices. |
| `references/examples.md`        | Catalog of all bundled examples.                                                                                                                                                                             |

## Examples

Bundled examples are small and intended to be adapted to the target repository's
style:

| Example                                           | Demonstrates                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `assets/examples/components/TypedButton.tsx`      | DOM prop mirroring, `ComponentPropsWithoutRef`, `ReactNode`, default `button` type, and typed click handling. |
| `assets/examples/components/FormEvents.tsx`       | Controlled input state, `ChangeEventHandler`, `FormEventHandler`, `FormData`, and `currentTarget`.            |
| `assets/examples/components/ErrorBoundary.tsx`    | Class component error boundary with typed props, state, and `ErrorInfo`.                                      |
| `assets/examples/hooks/ReducerContext.tsx`        | Reducer action union, exhaustive reducer handling, provider, guarded context hook, and typed dispatch.        |
| `assets/examples/hooks/UseRefInput.tsx`           | DOM refs, nullable ref typing, extracted change handlers, and form submit handling.                           |
| `assets/examples/types/ReactUtilityTypes.tsx`     | `ComponentPropsWithoutRef`, `Omit`, `ReactNode`, `CSSProperties`, `ElementType`, and `ReturnType`.            |
| `assets/examples/patterns/PolymorphicBox.tsx`     | Generic `as` component with prop extraction and a constrained own-props model.                                |
| `assets/examples/patterns/DiscriminatedUnion.tsx` | Discriminated union props, `never` exclusions, and exhaustive rendering.                                      |
| `assets/examples/app/App.tsx`                     | A mini app that imports several example components together.                                                  |

The example app includes a strict TSX baseline in
`assets/examples/app/tsconfig.json` and a minimal package file in
`assets/examples/app/package.json`.

## Usage Examples

Ask for the main skill when the task spans several React TypeScript areas:

```text
Use $react-typescript to review this component and its hook types.
```

Use a focused helper skill when the task is narrow:

```text
Use $react-typescript-components to type this wrapper component API.
Use $react-typescript-hooks to type this reducer and provider.
Use $react-typescript-types to choose the right React return type.
Use $react-typescript-patterns to design these mutually exclusive props.
```

## Decision Rules

The plugin's default guidance is:

- Use normal function components unless class lifecycle APIs or error boundaries
  are required.
- Use `type` for local app props and `interface` for public, augmentable library
  surfaces unless the repository has a stronger convention.
- Use `React.ReactNode` for renderable values and `React.JSX.Element` for a
  single JSX element value or explicit return contract.
- Use `React.ComponentPropsWithoutRef<T>` or
  `React.ComponentPropsWithRef<T>` when mirroring native or component props.
- Let `useState` infer concrete initial values, and add explicit types for
  nullable, empty, or union state.
- Use discriminated unions for reducer actions, async UI state, and mutually
  exclusive props.
- Use `createContext<T | null>(null)` plus a guarded custom hook when a context
  has no safe default.
- Use React 19 ref-as-prop only when the project version and type definitions
  support it. Use `forwardRef` for React 18 and earlier.
- In `.tsx`, use `value as Type` assertions instead of angle-bracket assertions.

## Validation

When this plugin is used to change code, prefer the target repository's own
commands:

```bash
npm run typecheck
npm test
npm run build
```

If those scripts do not exist, inspect `package.json`, lockfiles, and framework
configuration before inventing commands. For public component APIs, include
representative valid and invalid usage examples when the project supports
type-level tests.

## Installation

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install react-typescript@natroc-plugins
  ```

### Claude Desktop & Claude Web (claude.ai)

Open `Customize` in the left panel and click `+` icon, then select `Create
plugin` > `Add marketplace`.

- Add marketplace from a repository

  ```
  NatrocTeam/Natroc-Plugins
  ```

### Codex CLI

- Add marketplace

  ```
  codex plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin
  ```
  codex plugin add react-typescript@natroc-plugins
  ```

### Codex Desktop

- Add marketplace

  Source

  ```
  NatrocTeam/Natroc-Plugins
  ```

  Git ref (optional)

  ```
  main
  ```

## Repository Status

The current `plugins/react-typescript` directory contains the complete skill,
reference, example, subagent, and Codex UI metadata files described above. The
Claude Code manifest points to `./skills/` and the Claude Markdown agents. The
Codex manifest points to `./skills/`, while Codex TOML agents live under
`agents/`.

## Files

```text
plugins/react-typescript/
|-- .claude-plugin/plugin.json
|-- .codex-plugin/plugin.json
|-- agents/
|   |-- react-typescript-component-engineer.md
|   |-- react-typescript-component-engineer.toml
|   |-- react-typescript-type-reviewer.md
|   `-- react-typescript-type-reviewer.toml
|-- README.md
`-- skills/
    |-- react-typescript/
    |   |-- SKILL.md
    |   |-- agents/openai.yaml
    |   |-- assets/examples/
    |   `-- references/
    |-- react-typescript-components/
    |-- react-typescript-hooks/
    |-- react-typescript-patterns/
    `-- react-typescript-types/
```

## License

MIT
