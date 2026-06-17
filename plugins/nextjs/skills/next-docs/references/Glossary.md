# [Glossary](https://nextjs.org/docs/app/glossary.md)

A glossary of common terms used in Next.js.

---

# A

## App Router

The Next.js router introduced in version 13, built on top of React Server Components. It uses file-system based routing and supports layouts, nested routing, loading states, error handling, and more. Learn more in the [App Router documentation](https://nextjs.org/docs/app.md).

# B

## Build time

The stage when your application is being compiled. During build time, Next.js transforms your code into optimized files for production, generates static pages, and prepares assets for deployment. See the [`next build` CLI reference](https://nextjs.org/docs/app/api-reference/cli/next.md) on line 120.

# C

## Cache Components

A feature that enables component and function-level caching using the [`"use cache"` directive](https://nextjs.org/docs/app/api-reference/directives/use-cache.md). Cache Components allows you to mix static, cached, and dynamic content within a single route by prerendering a static HTML shell that's served immediately, while dynamic content streams in when ready. Configure cache duration with [`cacheLife()`](https://nextjs.org/docs/app/api-reference/functions/cacheLife.md), tag cached data with [`cacheTag()`](https://nextjs.org/docs/app/api-reference/functions/cacheTag.md), and invalidate on-demand with [`updateTag()`](https://nextjs.org/docs/app/api-reference/functions/updateTag.md). Learn more in the [Cache Components guide](https://nextjs.org/docs/app/getting-started/caching.md).

## Catch-all Segments

Dynamic route segments that can match multiple URL parts using the `[...folder]/page.js` syntax. These segments capture all remaining URL segments and are useful for implementing features like documentation sites or file browsers. Learn more in [Dynamic Route Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes.md) on line 89.

## Client Bundles

JavaScript bundles sent to the browser. Next.js splits these automatically based on the [module graph](#module-graph) to reduce initial payload size and load only the necessary code for each page.

## Client Component

A React component that runs in the browser. In Next.js, Client Components can also be rendered on the server during initial page generation. They can use state, effects, event handlers, and browser APIs, and are marked with the [`"use client"` directive](#use-client-directive) at the top of a file. Learn more in [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components.md).

## Client-side navigation

A navigation technique where the page content updates dynamically without a full page reload. Next.js uses client-side navigation with the [`<Link>` component](https://nextjs.org/docs/app/api-reference/components/link.md), keeping shared layouts interactive and preserving browser state. Learn more in [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating.md) on line 141.

## Client Cache

An in-memory cache in the browser that stores [RSC Payload](#rsc-payload) for visited and prefetched routes. During [client-side navigation](#client-side-navigation), Next.js serves cached [layouts](#layout) and [loading states](#loading-ui) instantly without a server request. Pages are not cached by default but are reused during browser back/forward navigation.

The client cache is cleared on page refresh. It can be invalidated programmatically with [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag.md), [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath.md), [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag.md), [`router.refresh`](https://nextjs.org/docs/app/api-reference/functions/use-router.md), [`cookies.set`](https://nextjs.org/docs/app/api-reference/functions/cookies.md), or [`cookies.delete`](https://nextjs.org/docs/app/api-reference/functions/cookies.md).

You can configure the client cache duration with [`staleTimes`](https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes.md) globally, or per-route via the `stale` property in [`cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife.md) (recommended) on line 251.

## Code Splitting

The process of dividing your application into smaller JavaScript chunks based on routes. Instead of loading all code upfront, only the code needed for the current route is loaded, reducing initial load time. Next.js automatically performs code splitting based on routes. Learn more in the [Package Bundling guide](https://nextjs.org/docs/app/guides/package-bundling.md).

# D

## Dynamic rendering

When a component is rendered at request time rather than [build time](#build-time). A component becomes dynamic when it uses [Request-time APIs](#request-time-apis).

## Dynamic route segments

[Route segments](#route-segment) that are generated from data at request time. Created by wrapping a folder name in square brackets (e.g., `[slug]`), they allow you to create routes from dynamic data like blog posts or product pages. Learn more in [Dynamic Route Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes.md).

# E

## Environment Variables

Configuration values accessible at build time or request time. In Next.js, variables prefixed with `NEXT_PUBLIC_` are exposed to the browser, while others are only available server-side. Learn more in [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables.md).

## Error Boundary

A React component that catches JavaScript errors in its child component tree and displays a fallback UI. In Next.js, create an [`error.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/error.md) to automatically wrap a route segment in an error boundary. Learn more in [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling.md).

# F

## Font Optimization

Automatic font optimization using [`next/font`](https://nextjs.org/docs/app/api-reference/components/font.md). Next.js self-hosts fonts, eliminates layout shift, and applies best practices for performance. Works with Google Fonts and local font files. Learn more in [Fonts](https://nextjs.org/docs/app/getting-started/fonts.md).

## File-system caching

A Turbopack feature that stores compiler artifacts on disk between runs, reducing work across `next dev` or `next build` commands for significantly faster compile times. Learn more in [Turbopack FileSystem Caching](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackFileSystemCache.md).

# H

## Hydration

React's process of attaching event handlers to the DOM to make server-rendered static HTML interactive. During hydration, React reconciles the server-rendered markup with the client-side JavaScript. Learn more in [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components.md) on line 103.

# I

## Import Aliases

Custom path mappings that provide shorthand references for frequently used directories. Import aliases reduce the complexity of relative imports and make code more readable and maintainable. Learn more in [Absolute Imports and Module Path Aliases](https://nextjs.org/docs/app/getting-started/installation.md) on line 299.

## Incremental Static Regeneration (ISR)

A technique that allows you to update static content without rebuilding the entire site. ISR enables you to use static generation on a per-page basis while revalidating pages in the background as traffic comes in. Learn more in the [ISR guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration.md).

> **Good to know**: In Next.js, ISR is also known as [Revalidation](#revalidation).

## Intercepting Routes

A routing pattern that allows loading a route from another part of your application within the current layout. Useful for displaying content (like modals) without the user switching context, while keeping the URL shareable. Learn more in [Intercepting Routes](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes.md).

## Image Optimization

Automatic image optimization using the [`<Image>` component](https://nextjs.org/docs/app/api-reference/components/image.md). Next.js optimizes images on-demand, serves them in modern formats like WebP, and automatically handles lazy loading and responsive sizing. Learn more in [Images](https://nextjs.org/docs/app/getting-started/images.md).

# L

## Layout

UI that is shared between multiple pages. Layouts preserve state, remain interactive, and do not re-render on navigation. Defined by exporting a React component from a [`layout.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/layout.md). Learn more in [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages.md).

## Loading UI

Fallback UI shown while a [route segment](#route-segment) is loading. Created by adding a [`loading.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/loading.md) to a folder, which automatically wraps the page in a [Suspense boundary](#suspense-boundary). Learn more in [Loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading.md).

# M

## Module Graph

A graph of file dependencies in your app. Each file (module) is a node, and import/export relationships form the edges. Next.js analyzes this graph to determine optimal bundling and code-splitting strategies. Learn more in [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components.md) on line 187.

## Metadata

Information about a page used by browsers and search engines, such as title, description, and Open Graph images. In Next.js, define metadata using the [`metadata` export](https://nextjs.org/docs/app/api-reference/functions/generate-metadata.md) or [`generateMetadata` function](https://nextjs.org/docs/app/api-reference/functions/generate-metadata.md) in layout or page files. Learn more in [Metadata and OG Images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images.md).

## Memoization

Caching the return value of a function so that calling the same function multiple times during a render pass (request) only executes it once. In Next.js, `fetch` `GET` requests with the same URL and options are automatically memoized across Server Components, layouts, pages, and `generateMetadata`/`generateStaticParams` (but not [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route.md) since they are not part of the React component tree).

For non-`fetch` operations, use the React [`cache`](https://react.dev/reference/react/cache.md) function. Learn more in the [`fetch` API reference](https://nextjs.org/docs/app/api-reference/functions/fetch.md).

## Middleware

See [Proxy](#proxy).

# N

## Not Found

A special component shown when a route doesn't exist or when the [`notFound()` function](https://nextjs.org/docs/app/api-reference/functions/not-found.md) is called. Created by adding a [`not-found.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/not-found.md) to your app directory. Learn more in [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling.md) on line 154.

# P

## Private Folders

Folders prefixed with an underscore (e.g., `_components`) that are excluded from the routing system. These folders are used for code organization and shared utilities without creating accessible routes. Learn more in [Private Folders](https://nextjs.org/docs/app/getting-started/project-structure.md) on line 184.

## Page

UI that is unique to a route. Defined by exporting a React component from a [`page.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/page.md) within the `app` directory. Learn more in [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages.md).

## Parallel Routes

A pattern that allows simultaneously or conditionally rendering multiple pages within the same layout. Created using named slots with the `@folder` convention, useful for dashboards, modals, and complex layouts. Learn more in [Parallel Routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes.md).

## Partial Prerendering (PPR)

A rendering optimization that combines prerendering and dynamic rendering in a single route. The static shell is served immediately while dynamic content streams in when ready, providing the best of both rendering strategies. Learn more in [Cache Components](https://nextjs.org/docs/app/getting-started/caching.md).

## Prefetching

Loading a route in the background before the user navigates to it. Next.js automatically prefetches routes linked with the [`<Link>` component](https://nextjs.org/docs/app/api-reference/components/link.md) when they enter the viewport, making navigation feel instant. Learn more in the [Prefetching guide](https://nextjs.org/docs/app/guides/prefetching.md).

## Prerendering

When a component is rendered at [build time](#build-time) or in the background during [revalidation](#revalidation). The result is HTML and [RSC Payload](#rsc-payload), which can be cached and served from a CDN. Prerendering is the default for components that don't use [Request-time APIs](#request-time-apis).

## Proxy

A file ([`proxy.js`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy.md)) that runs code on the server before request is completed. Used to implement server-side logic like logging, redirects, and rewrites. Formerly known as Middleware. Learn more in the [Proxy guide](https://nextjs.org/docs/app/getting-started/proxy.md).

# R

## Redirect

Sending users from one URL to another. In Next.js, redirects can be configured in [`next.config.js`](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects.md), returned from [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy.md), or triggered programmatically with the [`redirect()` function](https://nextjs.org/docs/app/api-reference/functions/redirect.md). Learn more in [Redirecting](https://nextjs.org/docs/app/guides/redirecting.md).

## Request-time APIs

Functions that access request-specific data, causing a component to opt into [dynamic rendering](#dynamic-rendering). These include:

- [`cookies()`](https://nextjs.org/docs/app/api-reference/functions/cookies.md) - Access request cookies
- [`headers()`](https://nextjs.org/docs/app/api-reference/functions/headers.md) - Access request headers
- [`searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page.md) on line 76 - Access URL query parameters
- [`draftMode()`](https://nextjs.org/docs/app/api-reference/functions/draft-mode.md) - Enable or check draft mode

## Runtime rendering

See [Dynamic rendering](#dynamic-rendering).

## Revalidation

The process of updating cached data. Can be time-based (using [`cacheLife()`](https://nextjs.org/docs/app/api-reference/functions/cacheLife.md) to set cache duration) or on-demand (using [`cacheTag()`](https://nextjs.org/docs/app/api-reference/functions/cacheTag.md) to tag data, then [`updateTag()`](https://nextjs.org/docs/app/api-reference/functions/updateTag.md) to invalidate). Learn more in [Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching.md).

## Rewrite

Mapping an incoming request path to a different destination path without changing the URL in the browser. Configured in [`next.config.js`](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites.md) or returned from [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy.md). Useful for proxying to external services or legacy URLs.

## Route Groups

A way to organize routes without affecting the URL structure. Created by wrapping a folder name in parentheses (e.g., `(marketing)`), route groups help organize related routes and enable per-group [layouts](#layout). Learn more in [Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups.md).

## Route Handler

A function that handles HTTP requests for a specific route, defined in a [`route.js` file](https://nextjs.org/docs/app/api-reference/file-conventions/route.md). Route Handlers use the Web Request and Response APIs and can handle `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` methods. Learn more in [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers.md).

## Route Segment

A part of the URL path (between two slashes) defined by a folder in the `app` directory. Each folder represents a segment in the URL structure. Learn more in [Project Structure](https://nextjs.org/docs/app/getting-started/project-structure.md).

## RSC Payload

The React Server Component Payload-a compact binary representation of the rendered React Server Components tree. Contains the rendered result of Server Components, placeholders for Client Components, and props passed between them. Learn more in [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components.md) on line 103.

# S

## Server Component

The default component type in the App Router. Server Components render on the server, can fetch data directly, and don't add to the client JavaScript bundle. They cannot use state or browser APIs. Learn more in [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components.md).

## Server Action

A [Server Function](#server-function) that is passed to a Client Component as a prop or bound to a form action. Server Actions are commonly used for form submissions and data mutations. Learn more in [Server Actions and Mutations](https://nextjs.org/docs/app/getting-started/mutating-data.md).

## Server Function

An asynchronous function that runs on the server, marked with the [`"use server"` directive](https://nextjs.org/docs/app/api-reference/directives/use-server.md). Server Functions can be invoked from Client Components. When passed as a prop to a Client Component or bound to a form action, they are called [Server Actions](#server-action). Learn more in [React Server Functions](https://react.dev/reference/rsc/server-functions.md).

## Static Export

A deployment mode that generates a fully static site with HTML, CSS, and JavaScript files. Enabled by setting `output: 'export'` in `next.config.js`. Static exports can be hosted on any static file server without a Node.js server. Learn more in [Static Exports](https://nextjs.org/docs/app/guides/static-exports.md).

## Static rendering

See [Prerendering](#prerendering).

## Static Assets

Files such as images, fonts, videos, and other media that are served directly without processing. Static assets are typically stored in the `public` directory and referenced by their relative paths. Learn more in [Static Assets](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder.md).

## Static Shell

The prerendered HTML structure of a page that's served immediately to the browser. With [Partial Prerendering](#partial-prerendering-ppr), the static shell includes all statically renderable content plus [Suspense boundary](#suspense-boundary) fallbacks for dynamic content that streams in later.

## Streaming

A technique that allows the server to send parts of a page to the client as they become ready, rather than waiting for the entire page to render. Enabled automatically with [`loading.js`](https://nextjs.org/docs/app/api-reference/file-conventions/loading.md) or manual `<Suspense>` boundaries. Learn more in the [Streaming guide](https://nextjs.org/docs/app/guides/streaming.md).

## Suspense boundary

A React [`<Suspense>`](https://react.dev/reference/react/Suspense.md) component that wraps async content and displays fallback UI while it loads. In Next.js, Suspense boundaries define where the [static shell](#static-shell) ends and [streaming](#streaming) begins, enabling [Partial Prerendering](#partial-prerendering-ppr).

# T

## Turbopack

A fast, Rust-based bundler built for Next.js. Turbopack is the default bundler for `next dev` and available for `next build`. It provides significantly faster compilation times compared to Webpack. Learn more in [Turbopack](https://nextjs.org/docs/app/api-reference/turbopack.md).

## Tree Shaking

The process of removing unused code from your JavaScript bundles during the build process. Next.js automatically tree-shakes your code to reduce bundle sizes. Learn more in the [Package Bundling guide](https://nextjs.org/docs/app/guides/package-bundling.md).

# U

## `"use cache"` Directive

A directive that marks a component or function as cacheable. It can be placed at the top of a file to indicate that all exports in the file are cacheable, or inline at the top of a function or component to mark that specific scope as cacheable. Learn more in the [`"use cache"` reference](https://nextjs.org/docs/app/api-reference/directives/use-cache.md).

## `"use client"` Directive

A special React directive that marks the boundary between server and client code. It must be placed at the top of a file, before any imports or other code. It indicates that React Components, helper functions, variable declarations, and all imported dependencies should be included in the [client bundle](#client-bundles). Learn more in the [`"use client"` reference](https://nextjs.org/docs/app/api-reference/directives/use-client.md).

## `"use server"` Directive

A directive that marks a function as a [Server Function](#server-function) that can be called from client-side code. It can be placed at the top of a file to indicate that all exports in the file are Server Functions, or inline at the top of a function to mark that specific function. Learn more in the [`"use server"` reference](https://nextjs.org/docs/app/api-reference/directives/use-server.md).

# V

## Version skew

## After a new version of your application is deployed, clients that are still active may reference JavaScript, CSS, or data from an older build. This mismatch between client and server versions is called version skew, and it can cause missing assets, Server Action errors, and navigation failures. Next.js uses [`deploymentId`](https://nextjs.org/docs/app/api-reference/config/next-config-js/deploymentId.md) to detect and handle version skew. Learn more in [Self-Hosting - Version Skew](https://nextjs.org/docs/app/guides/self-hosting.md) on line 208.

For a semantic overview of all documentation, see [/docs/sitemap.md](https://nextjs.org/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](https://nextjs.org/docs/llms.txt)
