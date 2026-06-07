# Refs

## useRef For DOM Elements

Use `Element | null` when the initial value is `null`:

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);

function focusInput() {
  inputRef.current?.focus();
}
```

## React 19 Ref As Prop

In React 19+, function components can accept `ref` as a prop. For native
element wrappers:

```tsx
type InputProps = React.ComponentPropsWithRef<"input">;

export function TextInput(props: InputProps) {
  return <input {...props} />;
}
```

For custom props:

```tsx
type TextInputProps = {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
} & Omit<React.ComponentPropsWithoutRef<"input">, "children">;
```

Use this only when the project's React version and type definitions support
ref-as-prop.

## React 18 And Earlier: forwardRef

Use `forwardRef` for components that expose an inner DOM node:

```tsx
type ButtonProps = {
  children?: React.ReactNode;
  variant?: "primary" | "quiet";
} & React.ComponentPropsWithoutRef<"button">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", ...props }, ref) => (
    <button ref={ref} data-variant={variant} {...props} />
  ),
);
```

If you want the ref parameter to be immutable inside the render function, type
it as `React.Ref<T>`.

## createRef

`createRef` is mostly for class components:

```tsx
class FocusPanel extends React.PureComponent<Props> {
  private rootRef = React.createRef<HTMLDivElement>();

  render() {
    return <div ref={this.rootRef}>{this.props.children}</div>;
  }
}
```

Function components usually use `useRef`.

## Generic Components With Refs

Generic components are harder to combine with `forwardRef` because inference
can be lost. Prefer the simplest option that fits:

1. Pass a named ref prop such as `listRef` or `mRef`.
2. Use a wrapper component to preserve the generic API.
3. For library code, consider a typed call signature or declaration merging
   only when the API truly needs generic `forwardRef`.

Example with a named ref prop:

```tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  listRef?: React.Ref<HTMLUListElement>;
};

export function List<T>({ items, renderItem, listRef }: ListProps<T>) {
  return <ul ref={listRef}>{items.map((item) => renderItem(item))}</ul>;
}
```

## Imperative Handles

Use `useImperativeHandle` when the parent should not receive the raw DOM node:

```tsx
export type DialogHandle = {
  focusCloseButton: () => void;
};

export const Dialog = forwardRef<DialogHandle, DialogProps>((props, ref) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useImperativeHandle(ref, () => ({
    focusCloseButton() {
      closeButtonRef.current?.focus();
    },
  }));

  return <button ref={closeButtonRef}>Close</button>;
});
```

Keep imperative handles small and stable.
