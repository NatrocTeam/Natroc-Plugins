# Context

## Context With A Real Default

Use a real default when it is meaningful:

```tsx
type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<Theme>("system");
```

Consumers can call `useContext(ThemeContext)` without null checks because the
default is valid behavior outside a provider.

## Context With No Safe Default

Use `null` in the context type and remove it in a custom hook:

```tsx
type Session = {
  userId: string;
  email: string;
};

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return session;
}
```

This keeps provider errors close to the cause and lets consumers receive
`Session` instead of `Session | null`.

## Provider Props

Type provider `children` as `React.ReactNode`:

```tsx
type SessionProviderProps = {
  children: React.ReactNode;
  initialSession: Session;
};
```

If provider value is an object, memoize it when identity matters:

```tsx
const value = useMemo(() => ({ session, signOut }), [session, signOut]);
```

## Reducer Plus Context

For shared state, split state and dispatch contexts only when consumers often
need one without the other. Otherwise one context is simpler:

```tsx
type CounterContextValue = {
  state: CounterState;
  dispatch: React.Dispatch<CounterAction>;
};
```

Use `React.Dispatch<Action>` for reducer dispatch values that cross component
boundaries.

## Common Mistakes

- Creating context with `{}` as a fake default and casting later.
- Exporting the raw context when all consumers should use a guarded hook.
- Recreating object provider values on every render when many subscribers are
  sensitive to identity.
- Putting unrelated global state in one large provider instead of composing
  smaller providers.
