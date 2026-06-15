# Integrating Magic Components Into a Project

Guidance for merging generated 21st.dev Magic snippets into a typical React project (Next.js App Router, Vite, or CRA) using TypeScript, Tailwind CSS, and shadcn/ui conventions.

## Pre-flight Checklist

Before integrating any generated snippet, confirm:

- [ ] The project uses **TypeScript** (Magic returns TSX by default).
- [ ] **Tailwind CSS** is installed and configured (`tailwind.config.{js,ts}` exists).
- [ ] **shadcn/ui** primitives are already in use, or the user is open to introducing them.
- [ ] The destination directory follows project convention (e.g., `src/components/`, `src/components/ui/`, `app/_components/`).
- [ ] The component name does not clash with an existing file.

## Standard Integration Steps

### 1. Read the Returned Snippet

The Magic tool returns:

- The component source (TSX).
- A list of imports (some may need installation).
- Apply-instructions describing where the component should live.

### 2. Verify Imports

Check every import in the snippet:

- **Already in the project** - leave the import as-is.
- **shadcn/ui primitives missing** - run `npx shadcn@latest add <component>` to install (with the user's permission).
- **Third-party packages missing** - confirm with the user before adding new dependencies. Check the latest version with `npm view <pkg> version` before installing.
- **Lucide / react-icons / Heroicons** - match the icon library already used by the project. Replace if necessary.

### 3. Place the File

Use the directory that matches similar components:

- shadcn-flavored project → `src/components/ui/` for primitives, `src/components/` for feature components.
- Next.js App Router → `app/_components/` or per-route `_components/` folder.
- Vite default → `src/components/`.

Name the file in the project's existing convention (`kebab-case.tsx` vs `PascalCase.tsx`).

### 4. Align Styling

- Use the project's Tailwind theme tokens (colors, spacing, radii). Replace hardcoded values with theme tokens when an equivalent exists.
- Keep the project's `cn()` / `clsx` utility if used. Replace inline class-name concatenation with the existing helper.
- Respect dark-mode strategy (`darkMode: "class"` vs `media`). Magic returns class-based dark mode by default.

### 5. Type Safety

- Verify prop types compile under the project's `tsconfig.json`.
- If the project uses Zod, convert input validation to Zod schemas where appropriate.
- Add explicit return types if the project enforces them.

### 6. Server vs Client Component Boundary (Next.js App Router)

- If the snippet uses hooks (`useState`, `useEffect`, etc.), it is a **client component** - add `"use client"` at the top.
- If it is purely presentational (no hooks, no event handlers), it can stay as a **server component**.

### 7. Accessibility Sanity Check

- Buttons have accessible labels (or `aria-label`).
- Icons have `aria-hidden="true"` if decorative.
- Form fields are wired with `label` + `htmlFor` or `aria-labelledby`.
- Focus states are visible (Tailwind `focus-visible:` utilities).

### 8. Final Polish

- Run the project's linter and type checker.
- Open the dev server and verify the component renders without console errors.
- Test responsive behavior at common breakpoints (sm, md, lg, xl) if relevant.

## Common Patterns

### Replacing Hardcoded Colors

Magic may emit literal colors. Map them to the project's theme:

```diff
- className="bg-[#0070f3] text-white"
+ className="bg-primary text-primary-foreground"
```

### Replacing Heroicons with Lucide

```diff
- import { ChevronRightIcon } from "@heroicons/react/24/outline";
+ import { ChevronRight } from "lucide-react";
```

### Wrapping for shadcn `cn()` Helper

```diff
- className={`p-4 ${disabled ? "opacity-50" : ""}`}
+ className={cn("p-4", disabled && "opacity-50")}
```

## What Not to Do

- ❌ Drop the entire generated file into the project without reading the imports.
- ❌ Introduce a new icon library when one already exists.
- ❌ Install new dependencies without checking the latest version (`npm view <pkg> version`) and confirming with the user.
- ❌ Override the project's Tailwind theme to fit a generated color.
- ❌ Rewrite working components nearby just to "match style".

## When Things Go Wrong

- **Type errors after paste** - usually missing imports or stricter `tsconfig`. Fix imports first, then types.
- **Styling looks off** - likely a missing Tailwind plugin (e.g., `@tailwindcss/forms`) or a mismatched theme token.
- **Animations missing** - Magic may use `framer-motion`. Confirm with the user before adding the dependency.
- **Component depends on shadcn primitives not installed** - run `npx shadcn@latest add <name>` (with the user's permission).
