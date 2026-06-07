# Patterns

## Wrapping A Native Element

Use `ComponentPropsWithoutRef` for wrappers without refs:

```tsx
type ButtonProps = {
  variant?: "primary" | "quiet";
} & React.ComponentPropsWithoutRef<"button">;

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return <button data-variant={variant} {...props} />;
}
```

Use `ComponentPropsWithRef` or `forwardRef` when the wrapper exposes refs.

## Wrapping Another Component

Extract props from a component you do not own:

```tsx
type BaseProps = React.ComponentProps<typeof BaseCard>;

type ProductCardProps = Omit<BaseProps, "title"> & {
  product: Product;
};
```

Use `Omit` when replacing or controlling a prop.

## Generic Components

Use generic props when the component renders arbitrary typed data:

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => React.Key;
};

export function List<T>({ items, renderItem, getKey }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

Avoid generic components when a concrete domain type would be clearer.

## Polymorphic Components

Use polymorphic `as` APIs when rendering different element/component types is
core to the component:

```tsx
type BoxProps<TAs extends React.ElementType> = {
  as?: TAs;
  padding?: "none" | "sm" | "md";
} & Omit<React.ComponentPropsWithoutRef<TAs>, "as">;
```

Keep this pattern out of simple app components. Composition is often easier to
understand:

```tsx
function LinkButton(props: React.ComponentPropsWithoutRef<"a">) {
  return <a data-button {...props} />;
}
```

## Discriminated Union Props

Use a discriminant field for mutually exclusive states:

```tsx
type AlertProps =
  | { status: "success"; message: string; retry?: never }
  | { status: "error"; message: string; retry: () => void };
```

This prevents impossible combinations and narrows automatically in branches.

## Mutually Exclusive Props With `never`

Use `never` to forbid props in a branch:

```tsx
type LinkAction =
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void };
```

This works best when the component has a small number of branches. For larger
APIs, consider splitting components.

## All Or Nothing Props

Prefer grouping optional required sets:

```tsx
type AvatarProps = {
  image?: {
    src: string;
    alt: string;
  };
};
```

This is clearer than trying to type an exactly empty object.

## Render Props

Use render props only when hooks or composition do not fit:

```tsx
type DataLoaderProps<T> = {
  data: T;
  children: (data: T) => React.ReactNode;
};
```

Prefer custom hooks for reusable stateful logic.

## Error Modeling

For recoverable outcomes, return typed results instead of throwing:

```ts
type ParseResult<T> = { ok: true; value: T } | { ok: false; error: Error };
```

Throw for exceptional conditions and boundaries. Return unions for expected UI
states that the caller must handle.

## Library API Choices

For reusable packages:

- Keep public prop interfaces stable and named.
- Prefer `interface` for augmentable public contracts.
- Avoid exporting internal helper types unless consumers need them.
- Be explicit about ref support.
- Keep generic types understandable in editor hovers.
