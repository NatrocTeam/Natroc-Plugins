# TypeScript JSX And TSX

## Basic Requirements

To use JSX with TypeScript:

1. Put JSX in `.tsx` files.
2. Set the TypeScript `jsx` compiler option.
3. Ensure React JSX runtime types are available.

Common JSX modes:

| Mode           | Use                                            |
| -------------- | ---------------------------------------------- |
| `react-jsx`    | Modern automatic React runtime                 |
| `react-jsxdev` | Development automatic runtime                  |
| `react`        | Classic runtime emitting `React.createElement` |
| `preserve`     | Framework or bundler transforms JSX later      |
| `react-native` | Preserve-like mode for React Native output     |

## Assertions In TSX

Do not use angle-bracket assertions in `.tsx`:

```tsx
const value = input as HTMLInputElement;
```

Angle brackets look like JSX tags and create parsing ambiguity.

## Intrinsic Elements

Lowercase JSX names are intrinsic elements:

```tsx
<button type="button" />
```

Their props come from `React.JSX.IntrinsicElements`.

You can extract native props:

```tsx
type ButtonProps = React.JSX.IntrinsicElements["button"];
```

In React code, `ComponentPropsWithoutRef<"button">` is usually clearer.

## Value-Based Elements

Uppercase JSX names refer to values in scope:

```tsx
function SaveButton(props: { label: string }) {
  return <button>{props.label}</button>;
}

<SaveButton label="Save" />;
```

TypeScript checks component props from the function parameter or class props.

## Function Components In JSX

A function component must accept a props object and return something assignable
to the configured JSX element rules. In React apps, plain functions are enough:

```tsx
function Badge({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}
```

## Class Components In JSX

Class component JSX checks rely on the instance type. For React components,
extend `React.Component<Props, State>` or `React.PureComponent<Props, State>`.

## Attribute Type Checking

For intrinsic elements, TypeScript checks attributes against the intrinsic
element's prop type. For components, it checks against the component's props.

If a prop appears missing on a native wrapper, check whether the wrapper used a
too-broad type like `HTMLAttributes` instead of `ComponentPropsWithoutRef`.

## JSX Namespace

Modern React type definitions expose JSX types through `React.JSX`. Older
global `JSX` references still appear in older code and third-party types.

Prefer `React.JSX.Element` in new React TypeScript code when you need the JSX
element type explicitly.
