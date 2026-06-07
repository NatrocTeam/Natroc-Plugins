import { useRef, useState } from "react";
import type { ChangeEventHandler, FormEventHandler } from "react";

export function UseRefInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValue(event.currentTarget.value);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} onChange={handleChange} value={value} />
      <button type="submit">Focus again</button>
    </form>
  );
}
