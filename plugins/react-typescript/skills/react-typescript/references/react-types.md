# React Types

## `React.ReactNode`

Use for anything React can render:

```tsx
type CardProps = {
  title: string;
  children?: React.ReactNode;
};
```

It includes strings, numbers, elements, fragments, arrays of renderable values,
`null`, `undefined`, and booleans.

## `React.JSX.Element`

Use for a single JSX element value or explicit component return:

```tsx
type TriggerProps = {
  icon: React.JSX.Element;
};
```

It is narrower than `ReactNode`. A component can render more than a JSX element,
so `ReactNode` is often better for `children`.

## `React.CSSProperties`

Use for style object props:

```tsx
type BoxProps = {
  style?: React.CSSProperties;
};
```

Prefer semantic style props for design-system components when style pass
through is not desired.

## Event Types

Use event object types:

```tsx
React.ChangeEvent<HTMLInputElement>;
React.MouseEvent<HTMLButtonElement>;
```

Use handler aliases:

```tsx
React.ChangeEventHandler<HTMLInputElement>;
React.MouseEventHandler<HTMLButtonElement>;
```

Handler aliases are useful for props and extracted callbacks.

## Component Prop Extraction

Use `ComponentPropsWithoutRef` for native wrappers that do not forward refs:

```tsx
type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "quiet";
};
```

Use `ComponentPropsWithRef` when refs are part of the API:

```tsx
type InputProps = React.ComponentPropsWithRef<"input">;
```

Use `ComponentProps<typeof SomeComponent>` to mirror another component's props
when you do not control that component.

## Component And Element Types

Use `React.ElementType` when a prop accepts intrinsic elements or components:

```tsx
type PolymorphicProps = {
  as?: React.ElementType;
};
```

Use `React.ComponentType<Props>` when it must be a React component accepting a
known prop shape:

```tsx
type RouteProps = {
  component: React.ComponentType<{ id: string }>;
};
```

## Ref Types

Common ref types:

```tsx
React.Ref<HTMLInputElement>;
React.RefObject<HTMLInputElement | null>;
React.MutableRefObject<number | null>;
React.RefAttributes<HTMLButtonElement>;
```

Prefer `React.Ref<T>` for public props that accept callback refs or object
refs. Prefer `useRef<T | null>(null)` for internal DOM refs.

## Class Component Types

Useful but less common:

- `React.Component<Props, State>` for class components.
- `React.PureComponent<Props, State>` for shallow-prop/state optimized class
  components.
- `React.ComponentClass<Props>` for APIs that accept a class component
  constructor.

## Portal And Element Utilities

- `React.ReactPortal` is specific to portals. Most APIs should accept
  `ReactNode` unless they truly need a portal value.
- `React.ReactElement` is useful when cloning or inspecting element props, but
  it is not the usual type for `children`.
- `React.JSXElementConstructor<Props>` is useful for low-level JSX/library
  typing.
