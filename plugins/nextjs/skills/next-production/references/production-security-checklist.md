# Production Security Checklist for Next.js App Router

Use this file for a full production-readiness pass. The checklist expands the 37 checkpoints from `SKILL.md`.

## A. Client/server boundary

1. `"use client"` appears only in components needing browser features.
2. Client Components do not import `db`, `env`, `cookies`, `headers`, `server-only`, payment SDKs with secrets, email providers, or private service modules.
3. `"use server"` appears only in Server Function/Action contexts.
4. Server Components are not unnecessarily converted into Client Components.
5. Props passed to Client Components are serializable and safe.

## B. Server Actions

6. Every mutation action has input validation.
7. Every private action calls `requireUser()` or equivalent.
8. Every object mutation checks ownership or role permission.
9. Sensitive actions have rate limits.
10. Actions return safe messages, not raw exception details.
11. Actions log sensitive events with redaction.
12. Actions use POST semantics through forms/actions, not GET side effects.

## C. Route Handlers

13. Route Handlers validate HTTP method.
14. JSON endpoints validate `content-type` where needed.
15. Body size is limited.
16. Body shape is validated.
17. Cookie-authenticated state-changing endpoints validate Origin or use CSRF tokens.
18. Private endpoints return `Cache-Control: no-store`.
19. CORS is allowlisted; wildcard CORS is not used with credentials.

## D. Data Access Layer

20. DAL files import `server-only`.
21. DAL performs auth or only exposes functions that require an authenticated context.
22. DAL enforces authorization close to the database query.
23. DAL returns DTOs with minimal safe fields.
24. Raw database records are not passed to UI.
25. Raw SQL is parameterized.

## E. Auth/session/password

26. Session cookies are HttpOnly, Secure in production, SameSite, Path-limited, and expiring.
27. Session tokens are hashed in storage.
28. Login and password reset are rate-limited.
29. Passwords are hashed with Argon2id, bcrypt, or scrypt.
30. Login errors avoid user enumeration.
31. Logout invalidates server-side session state.
32. Role changes and permission changes are audited.

## F. Environment/secrets

33. `.env.example` documents required variables without real secrets.
34. `NEXT_PUBLIC_` variables contain only public data.
35. Environment variables are parsed and validated at boot.
36. Secrets are read only from server-only modules.
37. Secret values are never logged or returned in errors.

## G. Headers/CSP/images

38. CSP is present and compatible with the app.
39. Frame protections are present through `frame-ancestors` or `X-Frame-Options`.
40. `X-Content-Type-Options: nosniff` is present.
41. `Referrer-Policy` is present.
42. `Permissions-Policy` is present.
43. HSTS is enabled only for production HTTPS.
44. `poweredByHeader` is disabled where appropriate.
45. `next/image` uses restricted `remotePatterns`.
46. SVG handling is intentionally configured and not enabled by accident.

## H. Uploads and external fetching

47. Uploads validate MIME, extension, size, and storage location.
48. User filenames are not used as trusted storage keys.
49. Public upload access is off by default.
50. Server-side URL fetches are protected from SSRF.
51. Fetch timeouts and response-size limits exist.
52. Redirects are revalidated.

## I. Cache and rendering

53. Private user data uses `no-store` or dynamic rendering.
54. Public data can use caching with explicit revalidation.
55. Sensitive route responses do not leak across users.
56. Revalidation is not exposed without auth and rate limits.

## J. Logging, monitoring, CI/CD

57. Logs redact secrets and tokens.
58. Critical security events are audited.
59. CI runs lint, typecheck, test, build, dependency audit, and secret scanning.
60. Dependency updates are automated or scheduled.
61. Database migrations are part of deployment.
62. Backup and restore are documented.
63. Rollback plan is documented.
64. Monitoring and alerting exist for errors, latency, auth failures, and abuse signals.

## Severity guidance

- Critical: direct auth bypass, secret exposure, arbitrary delete/update, SQL injection, RCE, SSRF to internal systems, public admin action.
- High: missing authorization on sensitive object access, token in localStorage, wildcard credentialed CORS, unsafe file upload, no CSRF/origin control on cookie-auth API.
- Medium: missing rate limits, weak logging, overly broad image domains, missing CSP, private data cache ambiguity.
- Low: missing documentation, incomplete `.env.example`, minor header gaps, inconsistent folder structure.
