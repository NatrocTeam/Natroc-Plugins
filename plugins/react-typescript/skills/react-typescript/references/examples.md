# Local Examples

Examples live under `assets/examples/` relative to the primary skill root.
They are small TSX snippets intended for adapting to the target repository's
local style.

## Components

- `assets/examples/components/TypedButton.tsx` - DOM prop mirroring,
  `ComponentPropsWithoutRef`, `ReactNode`, and button event typing.
- `assets/examples/components/FormEvents.tsx` - controlled input,
  `ChangeEventHandler`, and `FormEventHandler`.
- `assets/examples/components/ErrorBoundary.tsx` - class component error
  boundary with typed props/state.

## Hooks

- `assets/examples/hooks/ReducerContext.tsx` - reducer action union,
  provider, custom context hook, and typed dispatch.
- `assets/examples/hooks/UseRefInput.tsx` - DOM refs and extracted event
  handlers.

## Types

- `assets/examples/types/ReactUtilityTypes.tsx` - `ComponentProps`,
  `Omit`, `ReactNode`, `CSSProperties`, `ElementType`, and `ReturnType`.

## Patterns

- `assets/examples/patterns/PolymorphicBox.tsx` - generic `as` component
  with prop extraction.
- `assets/examples/patterns/DiscriminatedUnion.tsx` - discriminated union
  props and `never` exclusions.

## Mini App

- `assets/examples/app/App.tsx` - imports several examples together.
- `assets/examples/app/package.json` - minimal local package metadata.
- `assets/examples/app/tsconfig.json` - strict TSX compiler baseline.
