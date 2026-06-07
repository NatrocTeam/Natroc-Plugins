# TypeScript Core For React Work

## Utility Types

Use built-in utility types before inventing custom ones:

| Utility          | React TypeScript use                           |
| ---------------- | ---------------------------------------------- |
| `Partial<T>`     | patch objects, optional override maps          |
| `Required<T>`    | internal normalized props after defaults       |
| `Readonly<T>`    | immutable config or reducer state contracts    |
| `Pick<T, K>`     | expose part of a prop object                   |
| `Omit<T, K>`     | wrap DOM props while replacing one prop        |
| `Exclude<T, U>`  | remove union members                           |
| `Extract<T, U>`  | select union members                           |
| `NonNullable<T>` | remove `null` and `undefined` after validation |
| `Parameters<T>`  | mirror function parameter types                |
| `ReturnType<T>`  | mirror hook or factory result types            |
| `Awaited<T>`     | unwrap async loader results                    |

Example:

```tsx
type NativeButtonProps = React.ComponentPropsWithoutRef<"button">;

type IconButtonProps = Omit<NativeButtonProps, "children"> & {
  label: string;
  icon: React.ReactNode;
};
```

## Type Inference

Let inference carry obvious values:

```tsx
const [enabled, setEnabled] = useState(false);
```

Guide inference for empty, nullable, generic, and union values:

```tsx
const [items, setItems] = useState<Item[]>([]);
const [user, setUser] = useState<User | null>(null);
```

Best common type inference can widen arrays if members do not share enough
shape. Add a type annotation when a collection has an intended union:

```tsx
const states: RequestState<User>[] = [
  { status: "idle" },
  { status: "success", data: user },
];
```

## Type Compatibility

TypeScript is structurally typed. If two values have compatible shapes, they
can often be assigned even if their names differ. This is useful for props but
can surprise library authors.

Function parameter checking is stricter under `strictFunctionTypes`, but React
event types still have historical compatibility behavior. Prefer exact handler
types at public boundaries.

## Declaration Merging

Interfaces with the same name can merge. This is useful for library and
environment augmentation:

```ts
declare global {
  interface Window {
    analyticsQueue?: Array<{ event: string }>;
  }
}
```

Use declaration merging sparingly in app code. Prefer module-local types when
augmentation is not required.

For advanced generic `forwardRef` library scenarios, module augmentation can
adjust React type declarations, but this should be a deliberate library choice.

## Enums

Prefer string literal unions for React props:

```ts
type Size = "sm" | "md" | "lg";
```

Use `enum` only when a runtime object is needed or the codebase already uses
enums consistently. `const enum` can create build-tool compatibility concerns
in libraries.

## Decorators

Decorators are a TypeScript/JavaScript class feature, not a typical React
component typing tool. If a project uses decorators:

- Confirm the compiler settings and runtime transform.
- Keep decorator effects visible in types; decorators do not automatically
  change TypeScript's view of an instance.
- Avoid introducing decorators into React components unless the framework or
  codebase already depends on them.

## Iterators And Generators

Iterables matter when accepting flexible collections:

```ts
function toArray<T>(items: Iterable<T>): T[] {
  return Array.from(items);
}
```

React children can be arrays and iterable-like structures, but component APIs
are usually clearer with `T[]` unless lazy iteration is intentional.

Generators are useful for data processing utilities, not typical component
render loops.

## Mixins

TypeScript mixins model class composition. In React code, prefer hooks and
composition. Use mixins only in legacy class-heavy systems or library code
where class composition is already the pattern.

## Namespaces

Namespaces are older TypeScript organization tools. Prefer ES modules for
React apps.

Namespaces are still relevant for:

- declaration files,
- global augmentations,
- custom JSX namespace work,
- legacy TypeScript code.

## Namespaces And Modules

Do not wrap ES module exports in namespaces just to group code. Use folders,
files, and named exports.

For public libraries, model module boundaries with package exports and
declaration files instead of namespaces unless compatibility requires them.

## Symbols

`symbol` values are unique primitive keys. Use `unique symbol` for strongly
typed tokens:

```ts
declare const fieldToken: unique symbol;

type FieldId = typeof fieldToken;
```

Symbols are rare in React component props but useful in registries, internal
metadata, and strongly typed dependency tokens.

## Triple-Slash Directives

Triple-slash directives are preprocessing instructions for declaration files
and older projects:

```ts
/// <reference types="node" />
```

Prefer `types`, `typeRoots`, imports, and normal module resolution in modern
React projects. Use triple-slash directives only when maintaining declaration
files or legacy typing surfaces.

## Variable Declarations

Prefer `const` by default and `let` when reassignment is required. Avoid `var`.

Reasons:

- `const` prevents accidental reassignment.
- `let` is block-scoped.
- `var` is function-scoped and can produce closure and loop bugs.

For React state, do not mutate `const` objects in place. Use state setters and
immutable updates.
