import { ErrorBoundary } from "../components/ErrorBoundary";
import { FormEvents } from "../components/FormEvents";
import { TypedButtonExample } from "../components/TypedButton";
import { CounterPanel, CounterProvider } from "../hooks/ReducerContext";
import { UseRefInput } from "../hooks/UseRefInput";
import { AlertExamples } from "../patterns/DiscriminatedUnion";
import { PolymorphicBoxExample } from "../patterns/PolymorphicBox";

export function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <main>
        <TypedButtonExample />
        <FormEvents />
        <UseRefInput />
        <CounterProvider>
          <CounterPanel />
        </CounterProvider>
        <PolymorphicBoxExample />
        <AlertExamples />
      </main>
    </ErrorBoundary>
  );
}
