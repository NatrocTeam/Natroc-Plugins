import { useState } from "react";
import type { ChangeEventHandler, FormEventHandler } from "react";

type LoginFormState = {
  email: string;
  password: string;
};

export function FormEvents() {
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  const updateField: ChangeEventHandler<HTMLInputElement> = (event) => {
    const field = event.currentTarget.name as keyof LoginFormState;
    const { value } = event.currentTarget;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    console.log({ email, password });
  };

  return (
    <form onSubmit={submitForm}>
      <label>
        Email
        <input
          autoComplete="email"
          name="email"
          onChange={updateField}
          type="email"
          value={form.email}
        />
      </label>
      <label>
        Password
        <input
          autoComplete="current-password"
          name="password"
          onChange={updateField}
          type="password"
          value={form.password}
        />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}
