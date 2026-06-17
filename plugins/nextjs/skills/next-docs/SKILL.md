---
name: next-docs
description: A skill to fetch documentation from the Next.js website.
---

# Next.js Documentation

> Reference and guides for Next.js 16.2.9 - the React framework for building full-stack web applications. Sections cover Getting Started, App Router, Architecture, and Community Resources.

doc-version: 16.2.9
doc-version-notes: Some features may have extended or refined behavior in minor or patch releases

## How to Use This Skill

This skill is a **curated index** of the official Next.js 16.2.9 documentation - it does not contain the full docs, but links you directly to the right page on `nextjs.org/docs`. Use it as a quick lookup table when you need to locate specific Next.js documentation.

### Quick Lookup by User Need

| When the user asks about…                                                                                                                                           | Open this reference             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| New project, routing, layouts, server/client components, data fetching, caching basics                                                                              | `references/Getting-Started.md` |
| Auth, forms, env vars, self-hosting, testing, streaming, ISR, internationalization, PWA, view transitions, migrating from CRA/Vite, upgrading versions              | `references/Guides.md`          |
| Specific APIs: `use cache`, `cacheLife`, `cacheTag`, `cookies`, `fetch`, `generateMetadata`, `revalidatePath`, `useRouter`, `next.config.js` options, CLI, Adapters | `references/API-Reference.md`   |
| Terminology: what is App Router, Cache Components, PPR, RSC Payload, Streaming, Suspense, Hydration, Version Skew                                                   | `references/Glossary.md`        |
| Compiler internals, Fast Refresh, browser support, accessibility                                                                                                    | `references/Architecture.md`    |
| Community projects (Rspack)                                                                                                                                         | `references/Community.md`       |

### Workflow

1. **Identify the topic** - match the user's question to one of the four reference categories above.
2. **Open the reference file** - read the relevant `.md` file in `references/` to find the exact link.
3. **Fetch the official page** - use the link to open or fetch the full documentation from `nextjs.org`.

### When NOT to Use

- You already have the Next.js best-practices skill (`next-best-practices`) loaded - it contains opinionated guidance that may answer the question directly.
- You need code examples for a specific library - use the `context7` skill instead to fetch current docs.
- The task is about caching or upgrading - the `next-cache-components` and `next-upgrade` skills have dedicated workflows for those.

## [Getting Started](./references/Getting-Started.md)

Learn how to create full-stack web applications with the Next.js App Router.

Getting Started documentation includes sections:

- Installation
- Project Structure
- Layouts and Pages
- Linking and Navigating
- Server and Client Components
- Fetching Data
- Mutating Data
- Caching
- Revalidating
- Error Handling
- CSS
- Image Optimization
- Font Optimization
- Metadata and OG images
- Route Handlers
- Proxy
- Deploying
- Upgrading

Read the full documentation for Getting Started [here](./references/Getting-Started.md).

## [Guides](./references/Guides.md)

Learn how to implement common patterns and real-world use cases using Next.js

Guides documentation includes sections:

- AI Coding Agents
- Analytics
- Authentication
- Backend for Frontend
- Caching (Previous Model)
- CDN Caching
- Content Security Policy
- CSS in JS
- Custom Server
- Data Security
- Debugging
- Deploying to Platforms
- Draft Mode
- Environment Variables
- Forms
- How Revalidation Works
- ISR
- Internationalization
- JSON LD
- Development Environment
- Next.js MCP Server
- MDX
- Memory Usage
- Migrating
  - App Router
  - Create React App
  - Vite
- Migrating to Cache Components
- Multi tenant
- Multi zones
- OpenTelimetry
- Package Bundling
- PPR Platform Guide
- Prefetching
- Preserving UI state
- Preventing Flash
- Production
- PWAs
- Public pages
- Redirecting
- Rendering Philosophy
- Sass
- Scripts
- Self Hosting
- SPAs
- Static Export
- Streaming
- Tailwind CSS V3
- Testing
  - Cypress
  - Jest
  - Playwright
  - Vitest
- Third Party Libraries
- Upgrading
  - Codemods
  - Version 14
  - Version 15
  - Version 16
- Videos
- View transitions

Read the full documentation for Guides [here](./references/Guides.md).

## [API Reference](https://nextjs.org/docs/app/api-reference)

Next.js API Reference for the App Router.

API Reference documentation includes sections:

- Directives
  - use cache
  - use cache: private
  - use cache: remote
  - use client
  - use server
- Components
  - Font
  - Form Component
  - Image Component
  - Link Component
  - Script Component
- File-system conventions
  - default.js
  - Dynamic Segments
  - error.js
  - forbidden.js
  - instrumentation.js
  - instrumentation-client.js
  - Intercepting Routes
  - layout.js
  - loading.js
  - mdx-components.js
  - not-found.js
  - page.js
  - Parallel Routes
  - proxy.js
  - public
  - route.js
    - dynamicParams
    - maxDuration
    - preferredRegion
    - runtime
  - Route Groups
  - src
  - template.js
  - unauthorized.js
  - Metadata Files
    - favicon, icon, and apple-icon
    - manifest.json
    - opengraph-image and twitter-image
    - robots.txt
    - sitemap.xml
  - Route Segment Config
    - dynamicParams
    - maxDuration
    - preferredRegion
    - runtime
- Functions
  - cacheLife
  - cacheTag
  - unstable_catchError
  - connection
  - cookies
  - draftMode
  - fetch
  - forbidden
  - generateImageMetadata
  - generateMetadata
  - generateSitemaps

And more 107 API references for functions and hooks.

Read the full documentation for API Reference [here](./references/API-Reference.md).

## [Glossary](./references/Glossary.md)

A glossary of common terms used in Next.js.

Read the full documentation for Glossary [here](./references/Glossary.md).

## [Architecture](./references/Architecture.md)

How Next.js Works

Architecture documentation includes sections:

- Accessibility
- Fast Refresh
- Next.js Compiler
- Supported Browsers

Read the full documentation for Architecture [here](./references/Architecture.md).

## [Community](./references/Community.md)

Get involved in the Next.js community.

- Rspack

Read the full documentation for Community [here](./references/Community.md).

## Optional

- Pages Router](https://nextjs.org/docs/pages/llms.txt): Index of all Pages Router documentation
