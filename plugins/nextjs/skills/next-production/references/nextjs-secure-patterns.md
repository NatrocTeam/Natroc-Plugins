# Next.js Secure Patterns

Use these patterns when generating production-ready examples.

## 1. Environment validation

```ts
import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  REDIS_URL: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) throw new Error("Invalid environment variables");
export const env = parsed.data;
```

## 2. Session cookie

```ts
import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const sessionCookieName =
  process.env.NODE_ENV === "production" ? "__Host-session" : "dev-session";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  // Save tokenHash, userId, expiresAt to database here.

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}
```

## 3. Authorization helper

```ts
import "server-only";

export function canUpdateProject(
  user: { id: string; role: string },
  project: { ownerId: string },
) {
  return user.role === "ADMIN" || project.ownerId === user.id;
}
```

## 4. Data Access Layer

```ts
import "server-only";

export async function updateProjectForCurrentUser(input: unknown) {
  const user = await requireUser();
  const data = UpdateProjectSchema.parse(input);

  const project = await db.project.findFirst({
    where: { id: data.id },
    select: { id: true, ownerId: true },
  });

  if (!project) throw new Error("Not found");
  if (!canUpdateProject(user, project)) throw new Error("Forbidden");

  return db.project.update({
    where: { id: data.id },
    data: { name: data.name, description: data.description || null },
    select: { id: true, name: true },
  });
}
```

## 5. Route Handler response helper

```ts
import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(
    { ok: true, data },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json(
    { ok: false, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
```

## 6. Origin check for cookie-auth Route Handlers

```ts
import "server-only";
import { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function assertSameOrigin(request: NextRequest) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return;

  const origin = request.headers.get("origin");
  const expected = process.env.APP_ORIGIN;

  if (!origin || !expected || origin !== expected) {
    throw new Error("Forbidden");
  }
}
```

## 7. Security headers in `next.config.ts`

```ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/images/**",
      },
    ],
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
```

## 8. CI scripts

```json
{
  "scripts": {
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "security:audit": "pnpm audit",
    "check": "pnpm lint && pnpm typecheck && pnpm security:audit && pnpm build"
  }
}
```
