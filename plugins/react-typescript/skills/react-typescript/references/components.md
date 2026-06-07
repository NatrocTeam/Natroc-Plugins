# Components

## Function Components

Prefer normal function components:

```tsx
type BannerProps = {
  title: string;
  tone?: "info" | "warning" | "success";
};

export function Banner({ title, tone = "info" }: BannerProps) {
  return <section data-tone={tone}>{title}</section>;
}
```

Return types are usually inferred. Add an explicit return type when it catches
real mistakes:

```tsx
export function IconLabel({ label }: { label: string }): React.JSX.Element {
  return <span>{label}</span>;
}
```

`React.FC` is mostly stylistic in modern React + TypeScript. Prefer plain
functions unless the codebase consistently uses `React.FC` or you specifically
want that interface for external components.

## Props: Type Or Interface

Both work. Useful default:

- `type` for local app component props, especially unions and intersections.
- `interface` for exported library/public API props that consumers may augment
  or extend.

Avoid:

```tsx
type BadProps = {};
type AlsoBad = Object;
```

`{}` and `Object` mean non-nullish values, not an exactly empty object. Use a
named object shape or a better model for the API.

## Common Prop Shapes

```tsx
type UserCardProps = {
  id: string;
  name: string;
  disabled?: boolean;
  status: "idle" | "loading" | "ready" | "error";
  tags: string[];
  metadata: Record<string, string>;
  onSelect: (id: string) => void;
  onRename?: (nextName: string) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};
```

Use callbacks with domain parameters when possible. Use React event types when
the event object is part of the component API.

## Children

Use `React.ReactNode` when the component accepts anything React can render:

```tsx
type PanelProps = {
  heading: string;
  children?: React.ReactNode;
};
```

Use `React.JSX.Element` only for a single element value:

```tsx
type RequiresElementProps = {
  trigger: React.JSX.Element;
};
```

TypeScript cannot reliably enforce that children are instances of a specific
component. If the exact child identity matters, use explicit props, composition
APIs, or runtime validation.

## Mirroring DOM Props

For a wrapper around a native element:

```tsx
type ButtonProps = {
  variant?: "primary" | "quiet";
} & React.ComponentPropsWithoutRef<"button">;

export function Button({ variant = "primary", ...buttonProps }: ButtonProps) {
  return <button data-variant={variant} {...buttonProps} />;
}
```

Use `ComponentPropsWithoutRef` when refs are not forwarded. Use
`ComponentPropsWithRef` when refs are part of the component contract.

Avoid `React.HTMLProps` for precise wrappers because it can widen attributes
like button `type` to plain `string`. `React.HTMLAttributes` is also too broad
for many element-specific props.

## Default Props

For function components, prefer parameter defaults:

```tsx
type GreetingProps = {
  age?: number;
};

export function Greeting({ age = 21 }: GreetingProps) {
  return <p>Age: {age}</p>;
}
```

For class components, default in `render` or use `static defaultProps` with
care. If exporting consumer-facing prop types from a component with defaults,
remember that the internal prop contract may differ from the external JSX
contract.

## Class Components

Class components are still useful for error boundaries and legacy lifecycle
code:

```tsx
type CounterProps = {
  label: string;
};

type CounterState = {
  count: number;
};

class Counter extends React.Component<CounterProps, CounterState> {
  state: CounterState = { count: 0 };

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.props.label}: {this.state.count}
      </button>
    );
  }
}
```

Annotating `state` helps TypeScript infer `this.state` consistently.

## Error Boundaries

React error boundaries are class components. Type props and state explicitly:

```tsx
type BoundaryProps = {
  fallback: React.ReactNode;
  children: React.ReactNode;
};

type BoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  BoundaryProps,
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
```

Use `unknown` for caught values unless the code narrows them.

## Portals

Portals often need non-null DOM elements. Prefer clear checks over unchecked
casts when the element may be missing:

```tsx
function getPortalRoot(id: string): HTMLElement {
  const root = document.getElementById(id);
  if (!root) {
    throw new Error(`Missing portal root: ${id}`);
  }
  return root;
}
```

## Concurrent React And Suspense

TypeScript usually does not need special types for Suspense boundaries. The
important API design work is:

- Model async UI state as discriminated unions when it is local.
- Keep fallback props typed as `React.ReactNode`.
- Keep thrown promises, resource loaders, and framework-specific data APIs
  isolated behind typed functions.
