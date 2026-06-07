# Hooks

## useState

Let TypeScript infer simple state:

```tsx
const [enabled, setEnabled] = useState(false);
```

Add a type argument for nullable, empty, or union state:

```tsx
type Status = "idle" | "loading" | "success" | "error";

const [status, setStatus] = useState<Status>("idle");
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<Item[]>([]);
```

Avoid pretending an empty object is already a full value:

```tsx
const [user, setUser] = useState<User>({} as User);
```

Only use that assertion when initialization is guaranteed immediately and
consumers cannot observe the placeholder. Prefer `User | null` with a guard.

## Async Or Request State

Use discriminated unions instead of several loosely related booleans:

```tsx
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

This makes rendering exhaustive and prevents impossible states like
`loading: true` with stale `data`.

## useReducer

Type state, actions, and reducer return value:

```tsx
type CounterState = {
  count: number;
};

type CounterAction =
  | { type: "increment"; by: number }
  | { type: "decrement"; by: number }
  | { type: "reset" };

const initialCounterState: CounterState = { count: 0 };

function counterReducer(
  state: CounterState,
  action: CounterAction,
): CounterState {
  switch (action.type) {
    case "increment":
      return { count: state.count + action.by };
    case "decrement":
      return { count: state.count - action.by };
    case "reset":
      return initialCounterState;
    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}
```

Annotating the reducer return type keeps accidental partial returns visible.

## useContext

See `context.md` for provider patterns. The short version:

- Use a default value when one is semantically correct.
- Use `T | null` when there is no safe default.
- Hide the nullable check in a custom hook.

## useMemo

Return type is usually inferred:

```tsx
const visibleItems = useMemo(
  () => items.filter((item) => item.visible),
  [items],
);
```

Add a type argument only when it clarifies a public contract or catches a
mistake:

```tsx
const value = useMemo<ProviderValue>(
  () => ({ user, signOut }),
  [user, signOut],
);
```

Do not use `useMemo` just to satisfy TypeScript. Use it for identity-sensitive
values or expensive calculations.

## useCallback

Inline callbacks often receive contextual event types. Extracted callbacks
need explicit parameters or React handler aliases:

```tsx
const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
  (event) => {
    setValue(event.currentTarget.value);
  },
  [],
);
```

For domain callbacks, type the domain parameter instead of leaking DOM events:

```tsx
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

## useRef

For DOM refs:

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);
```

When reading:

```tsx
inputRef.current?.focus();
```

For mutable instance values:

```tsx
const timeoutId = useRef<number | null>(null);
```

Do not store render-derived data in refs just to avoid state; refs do not
trigger re-renders.

## Effects

Effects rarely need extra type annotations. Type the values they close over:

```tsx
useEffect(() => {
  const controller = new AbortController();

  loadUser(userId, controller.signal).catch((error: unknown) => {
    if (error instanceof Error) {
      setError(error);
    }
  });

  return () => controller.abort();
}, [userId]);
```

Return cleanup functions, not promises. Define async functions inside the
effect body when needed.

## Custom Hooks

Use object returns for multi-value APIs:

```tsx
type UseDisclosureResult = {
  open: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
};
```

Use tuple returns when the hook intentionally mirrors built-in hook ergonomics.
Annotate tuple returns with `as const` or an explicit tuple type.
