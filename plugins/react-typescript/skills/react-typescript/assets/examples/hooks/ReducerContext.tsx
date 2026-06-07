import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

type CounterState = {
  count: number;
};

type CounterAction =
  | { type: "increment"; by: number }
  | { type: "decrement"; by: number }
  | { type: "reset" };

type CounterContextValue = {
  state: CounterState;
  dispatch: Dispatch<CounterAction>;
};

const initialState: CounterState = {
  count: 0,
};

const CounterContext = createContext<CounterContextValue | null>(null);

function assertNever(value: never): never {
  throw new Error(`Unhandled counter action: ${JSON.stringify(value)}`);
}

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
      return initialState;
    default:
      return assertNever(action);
  }
}

export function CounterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CounterContext.Provider value={value}>{children}</CounterContext.Provider>
  );
}

export function useCounter() {
  const value = useContext(CounterContext);
  if (!value) {
    throw new Error("useCounter must be used inside CounterProvider");
  }
  return value;
}

export function CounterPanel() {
  const { state, dispatch } = useCounter();

  return (
    <section>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "decrement", by: 1 })}>
        Decrement
      </button>
      <button onClick={() => dispatch({ type: "increment", by: 1 })}>
        Increment
      </button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </section>
  );
}
