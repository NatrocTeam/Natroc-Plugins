type AlertProps =
  | {
      status: "success";
      message: string;
      retry?: never;
    }
  | {
      status: "error";
      message: string;
      retry: () => void;
    }
  | {
      status: "loading";
      message?: never;
      retry?: never;
    };

export function Alert(props: AlertProps) {
  switch (props.status) {
    case "success":
      return <p role="status">{props.message}</p>;
    case "error":
      return (
        <div role="alert">
          <p>{props.message}</p>
          <button onClick={props.retry} type="button">
            Try again
          </button>
        </div>
      );
    case "loading":
      return <p role="status">Loading...</p>;
    default:
      return assertNever(props);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled alert props: ${JSON.stringify(value)}`);
}

export function AlertExamples() {
  return (
    <>
      <Alert message="Saved" status="success" />
      <Alert
        message="Could not save"
        retry={() => console.log("retry")}
        status="error"
      />
      <Alert status="loading" />
    </>
  );
}
