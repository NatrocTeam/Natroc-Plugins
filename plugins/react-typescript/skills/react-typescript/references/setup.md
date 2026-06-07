# Setup And Project Baseline

## Assumptions

Use this reference when creating or reviewing a React TypeScript project,
checking `.tsx` setup, or deciding compiler defaults.

The common baseline is:

- React with TypeScript type definitions installed.
- Files that contain JSX use the `.tsx` extension.
- TypeScript is configured with a JSX mode compatible with the bundler or
  framework.
- DOM libraries are present in `tsconfig` unless the target is not a browser.
- Type checking runs separately from fast sandbox previews when needed.

## Adding React Types To An Existing Project

The needed type packages are normally:

```bash
npm install --save-dev @types/react @types/react-dom
```

For libraries or framework-managed apps, follow the repository's package
manager and dependency policy. Do not force npm when the repo uses pnpm, yarn,
or bun.

## TSConfig Checklist

Prefer strict settings unless the existing codebase is intentionally looser:

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "noEmit": true,
    "skipLibCheck": true
  }
}
```

Notes:

- `jsx: "react-jsx"` is the usual automatic runtime for modern React apps.
- `jsx: "preserve"` is common when a framework or bundler owns the JSX
  transform.
- Library packages may need a different emit setup and declaration output.
- `lib` must include DOM types for browser components and DOM event types.
- `skipLibCheck` is common in app code to avoid third-party type noise, but
  libraries may choose stricter checks.

## File Extensions

- Use `.tsx` for files containing JSX.
- Use `.ts` for hooks, reducers, utilities, and types that do not contain JSX.
- In `.tsx`, use `value as Type` for assertions. Angle-bracket assertions
  conflict with JSX parsing.

## Starter And Migration Guidance

For new apps:

- Prefer the framework's TypeScript template when the project already uses a
  framework.
- For custom Vite-like apps, ensure React, React DOM, TypeScript, and the
  relevant plugin or compiler are installed together.

For existing JavaScript React apps:

- Convert leaf components first.
- Add prop types before touching business logic.
- Convert shared hooks and utilities after their callers have clear types.
- Keep runtime behavior unchanged while adding types.
- Avoid broad `any`; use `unknown`, explicit unions, or temporary local helper
  types with a cleanup note in code review.

## Verification Commands

Use the repository's scripts if present. Typical commands:

```bash
npm run typecheck
npm test
npm run build
```

If no scripts exist, inspect `package.json`, lockfiles, and framework config
before inventing commands.
