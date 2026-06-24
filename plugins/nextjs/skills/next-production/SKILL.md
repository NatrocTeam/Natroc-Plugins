---
name: next-production
description: Use this skill when building, reviewing, hardening, or refactoring a Next.js App Router / React application for production security, reliability, and deployment readiness. Covers use client/use server boundaries, Server Actions, Route Handlers, Data Access Layer, auth/session cookies, validation, CSP/security headers, CORS/CSRF, image/SVG config, logging, rate limits, caching, uploads, SSRF, env secrets, CI/CD, dependency audits, and 37 production checkpoints.
license: MIT
compatibility:
  - nextjs
  - react
metadata:
  version: "1.0.0"
  category: "software-engineering"
  tags:
    - nextjs
    - react
    - app-router
    - security
    - production
---

# Next Production Skill

## Purpose

Use this skill to design, review, or refactor a Next.js App Router application so it is closer to production-ready security, reliability, and maintainability.

The skill focuses on these boundaries:

- Client Components: UI interaction only.
- Server Components: server rendering and safe DTO consumption.
- Server Actions: public mutation endpoints that require validation, authentication, authorization, rate limits, and audit logs.
- Route Handlers: public HTTP endpoints that require method, origin, body, auth, permission, cache, and error controls.
- Data Access Layer: `server-only`, close to database, minimal field selection, and permission enforcement.

## When to activate

Activate this skill when the user asks about any of these tasks:

- Next.js production setup, security hardening, App Router architecture, or secure React patterns.
- Correct use of `"use client"`, `"use server"`, Server Components, Server Actions, or Route Handlers.
- Auth, session, cookies, roles, permissions, CORS, CSRF, CSP, security headers, rate limiting, logging, file upload, SSRF, environment secrets, caching, CI/CD, dependency audit, or deployment checklist.
- Reviewing an existing Next.js repository for production-readiness.
- Creating production-ready examples, templates, folder structures, or code snippets for Next.js.

## Core workflow

1. Identify whether the task is a new implementation, audit, migration, or bug/security review.
2. Determine the runtime and routing model: App Router, Pages Router, serverless, Node runtime, Edge runtime, reverse proxy, CDN, or custom server.
3. Inspect the current project structure if files are available. Prefer reading `package.json`, `next.config.*`, `src/app/**`, `src/lib/**`, `src/data/**`, `middleware.ts`, `proxy.ts`, `.env.example`, and CI files.
4. Apply the 37 production checkpoints below.
5. For code output, prefer small, copyable, production-oriented files rather than a single giant example.
6. For reviews, return findings by severity: Critical, High, Medium, Low, and Improvement.
7. Never treat UI hiding, route grouping, or client-side checks as security. Final enforcement must happen on the server.
8. If the project is not available, provide a safe reference architecture and explain assumptions.

## Required 37 checkpoints

Use these checkpoints as the main production review list.

1. Use `"use client"` only for components that need browser APIs, state, effects, event handlers, or client-only hooks.
2. Use `"use server"` only for Server Functions/Actions, not as a marker for ordinary Server Components.
3. Treat every Server Action as a public mutation endpoint that can be called directly.
4. Validate every Server Action input with a schema such as Zod.
5. Require authentication inside Server Actions that read or mutate private data.
6. Check authorization and ownership inside Server Actions or the Data Access Layer.
7. Apply rate limits to sensitive Server Actions such as login, create, update, delete, invite, payment, and password reset.
8. Validate Route Handler method, content type, body size, and body shape.
9. For cookie-based Route Handlers, validate request origin or use an explicit CSRF strategy.
10. Never perform state-changing mutations from GET requests or during render.
11. Put database, auth, session, payment, email, and secret logic in `server-only` modules.
12. Never pass raw database records to Client Components.
13. Return DTOs with minimal safe fields from the Data Access Layer.
14. Never expose secrets with the `NEXT_PUBLIC_` prefix.
15. Validate environment variables at boot and fail fast when production config is invalid.
16. Use HttpOnly, Secure, SameSite, Path, and Max-Age/Expires on session cookies.
17. Store session tokens hashed in the database or session store.
18. Rate limit login and password reset flows.
19. Hash passwords with Argon2id, bcrypt, or scrypt, never plain SHA hashing.
20. Do not return stack traces, SQL errors, provider errors, or raw exception messages to users.
21. Redact passwords, tokens, cookies, authorization headers, secrets, and PII from logs.
22. Add Content Security Policy appropriate to the app.
23. Add security headers such as X-Content-Type-Options, Referrer-Policy, X-Frame-Options or frame-ancestors, Permissions-Policy, and HSTS in production HTTPS.
24. Restrict `next/image` remote sources with exact `remotePatterns`.
25. Do not allow SVG uploads or SVG optimization unless CSP and download behavior are explicitly safe.
26. Never use wildcard CORS with credentials.
27. Validate upload MIME type, extension, size, filename, storage key, and access policy.
28. Protect server-side URL fetching from SSRF with allowlists, private-IP blocking, redirect validation, timeout, and response-size limits.
29. Use `Cache-Control: no-store` or dynamic rendering for private user-specific responses.
30. Audit and update dependencies, especially Next.js, React, auth, crypto, image, markdown, upload, and database packages.
31. Use React taint APIs or equivalent discipline as an extra guard against leaking sensitive objects to Client Components when appropriate.
32. Read secrets only in server-only files and design for secret rotation.
33. Use ORM/query-builder parameterization or safe raw queries; never concatenate user input into SQL.
34. Protect business logic with transactions, unique constraints, row locks where needed, and state transition validation.
35. Add CI checks for lint, typecheck, test, build, dependency audit, and secret scanning.
36. Add audit logging for sensitive events: login, logout, failed auth, role change, billing, token creation, data export, delete, invite, and permission changes.
37. Document production deployment assumptions: runtime, domains, reverse proxy, HTTPS, cookies, environment variables, database migrations, backup, monitoring, and rollback.

## Recommended project structure

Use this structure when creating or refactoring a production Next.js App Router code inside a `src/` directory:

```txt
project-folder/
├─ src/
│   ├─ app/
│   │   ├─ layout.tsx
│   │   ├─ favicon.ico
│   │   ├─ globals.css
│   │   ├─ (auth)/
│   │   │   ├─ login/
│   │   │   │   ├─ page.tsx
│   │   │   │   ├─ actions.ts
│   │   │   │   └─ .....
│   │   │   ├─ register/
│   │   │   │   ├─ page.tsx
│   │   │   │   ├─ actions.ts
│   │   │   │   └─ .....
│   │   │   ├─ layout.tsx
│   │   │   └─ .....
│   │   ├─ (dashboard)/
│   │   │   ├─ profile/
│   │   │   │   ├─ page.tsx
│   │   │   │   └─ .....
│   │   │   ├─ settings/
│   │   │   │   ├─ page.tsx
│   │   │   │   └─ .....
│   │   │   ├─ layout.tsx
│   │   │   └─ .....
│   │   └─ .....
│   ├─ components/
│   │   ├─ ui/
│   │   │   ├─ button.tsx
│   │   │   └─ .....
│   │   ├─ auth/
│   │   │   ├─ login/
│   │   │   │   ├─ background.tsx
│   │   │   │   ├─ card.tsx
│   │   │   │   ├─ form.tsx
│   │   │   │   └─ ....
│   │   │   ├─ register/
│   │   │   │   ├─ background.tsx
│   │   │   │   ├─ card.tsx
│   │   │   │   ├─ form.tsx
│   │   │   │   └─ ....
│   │   │   ├─ login.ts
│   │   │   ├─ register.ts
│   │   │   └─ .....
│   │   └─ .....
│   └─ .....
├─ public/
│   ├─ file.svg
│   ├─ vercel.svg
│   └─ .....
├─ .gitignore
├─ next.config.ts
├─ package.json
├─ README.md
├─ tsconfig.json
└─ .....
```

For Next.js versions before 16, `middleware.ts` may be present instead of `proxy.ts`. Do not rename files blindly; check the project version first.

## Secure code patterns

### Server-only Data Access Layer

```ts
import "server-only";

import { requireUser } from "@/data/auth";
import { db } from "@/lib/db";

export async function getProjectsForCurrentUser() {
  const user = await requireUser();

  return db.project.findMany({
    where: user.role === "ADMIN" ? {} : { ownerId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
```

### Server Action

```ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/data/auth";
import { createProjectForCurrentUser } from "@/data/projects";
import { rateLimit } from "@/lib/rate-limit";
import { CreateProjectSchema } from "@/validation/project";

export async function createProjectAction(_state: unknown, formData: FormData) {
  const user = await requireUser();

  await rateLimit({
    key: `create-project:${user.id}`,
    limit: 10,
    windowSeconds: 60,
  });

  const parsed = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await createProjectForCurrentUser(parsed.data);
  revalidatePath("/dashboard/projects");

  return { ok: true };
}
```

### Client Component

```tsx
"use client";

import { useActionState } from "react";
import { createProjectAction } from "./actions";

export function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(createProjectAction, {
    ok: false,
  });

  return (
    <form action={formAction}>
      <input name="name" required maxLength={80} />
      <textarea name="description" maxLength={500} />
      {state.fieldErrors?.name ? <p>{state.fieldErrors.name[0]}</p> : null}
      <button disabled={pending}>Create</button>
    </form>
  );
}
```

## When to read references

Read `references/production-security-checklist.md` when the user asks for a full checklist, production audit, or detailed hardening plan.

Read `references/nextjs-secure-patterns.md` when the user asks for code examples, architecture, folder structure, auth/session, DAL, Server Actions, Route Handlers, CSP, uploads, SSRF, or CI.

Read `references/review-report-template.md` when reviewing a user repository or producing an audit report.

## Output format for reviews

Use this structure:

```md
# Next.js Production Review

## Summary

- Overall status: Pass / Needs work / High risk
- Biggest risk:
- Production readiness score: X/100

## Critical findings

## High findings

## Medium findings

## Low findings

## Recommended patches

## 37-point checklist result

## Final release blockers
```

## Refusal and safety boundary

Do not help bypass authentication, hide malicious behavior, steal secrets, weaken production controls, disable audit logs for abuse, or exploit a real target. Provide defensive alternatives such as secure configuration, patch guidance, detection, and hardening steps.
