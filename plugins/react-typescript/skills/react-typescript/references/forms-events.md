# Forms And Events

## Inline Handlers

Inline DOM handlers usually get contextual types:

```tsx
<button
  onClick={(event) => {
    event.currentTarget.disabled = true;
  }}
>
  Save
</button>
```

Use this when the handler is short and does not need to be reused.

## Extracted Handlers

When extracting, type the event parameter:

```tsx
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  setValue(event.currentTarget.value);
}
```

Or type the handler itself:

```tsx
const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
  setValue(event.currentTarget.value);
};
```

The handler alias is often cleaner when passing callbacks as props.

## Submit Events

For form submissions:

```tsx
const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email") ?? "");
};
```

Use `currentTarget` for the element the handler is attached to. `target` can
refer to a descendant.

## Uncontrolled Named Inputs

For small uncontrolled forms, `FormData` is often safer than asserting a custom
target shape. If custom target access is used, keep the assertion local:

```tsx
const target = event.target as typeof event.target & {
  email: { value: string };
};
```

Prefer controlled inputs or `FormData` for larger forms.

## Common React Event Types

| Event type                              | Common use                                     |
| --------------------------------------- | ---------------------------------------------- |
| `React.ChangeEvent<HTMLInputElement>`   | input, select, textarea value changes          |
| `React.MouseEvent<HTMLButtonElement>`   | click and pointer-like mouse events            |
| `React.KeyboardEvent<HTMLInputElement>` | key interactions                               |
| `React.FocusEvent<HTMLInputElement>`    | focus and blur                                 |
| `React.FormEvent<HTMLFormElement>`      | form submission or form-level handling         |
| `React.PointerEvent<HTMLElement>`       | pointer input across mouse, pen, touch         |
| `React.SyntheticEvent`                  | fallback base event when exact type is unknown |

## Component Event Props

Expose domain-specific callbacks when possible:

```tsx
type UserRowProps = {
  user: User;
  onSelect: (userId: string) => void;
};
```

Expose React event callbacks when consumers need the event:

```tsx
type SearchInputProps = {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};
```

## Return Types

Event handlers usually return `void`. Avoid relying on returned values from
event handlers; React will not use them for flow control.
