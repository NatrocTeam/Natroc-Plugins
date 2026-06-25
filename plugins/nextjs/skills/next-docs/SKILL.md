---
name: next-docs
description: A skill to fetch official Next.js 16 documentation from nextjs.org. WebFetch the llms.txt index to discover all available pages, then WebFetch the specific pages needed per topic.
allowed-tools: Read WebFetch(domain:nextjs.org) WebSearch
---

# Next.js Documentation

> Next.js 16.2.9 — the React framework for building full-stack web applications. Use this skill to fetch live documentation from `nextjs.org/docs` rather than relying on stale local files.

## How to Use This Skill

This skill does **not** bundle documentation locally. All documentation is fetched live from `nextjs.org/docs` using two steps:

1. **Fetch the LLM index** — WebFetch `https://nextjs.org/docs/llms.txt` to get the complete, machine-readable index of every App Router documentation page with its URL and description. This is always up to date with the latest Next.js release.

2. **Fetch per-topic pages** — WebFetch the specific `nextjs.org/docs` pages that match the user's question. Fetch the full page content, not just the first section.

> **CRITICAL: Always append `.md` when fetching Next.js documentation pages.** The nextjs.org server returns **clean Markdown content** when the URL ends with `.md`. Without the `.md` suffix, the server returns **full HTML** (navigation bar, scripts, stylesheets, footer) which wastes tens of thousands of tokens and is unusable for AI consumption.
>
> Example:
>
> - `https://nextjs.org/docs/app/getting-started/installation` → ❌ Full HTML page (~100KB+)
> - `https://nextjs.org/docs/app/getting-started/installation.md` → ✅ Clean Markdown (~5KB)
>
> The `llms.txt` index lists URLs **without** `.md`. You must append `.md` to every URL you extract from the index before calling WebFetch. The Pages Router llms.txt (`/docs/pages/llms.txt`) has the same requirement.

### Quick Lookup by User Need

| When the user asks about…                                                                                            | Fetch from llms.txt section |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| New project, routing, layouts, server/client components, data fetching, caching basics                               | Getting Started             |
| Auth, forms, env vars, self-hosting, testing, streaming, ISR, internationalization, PWA, view transitions, migrating | Guides                      |
| Specific APIs, directives, components, file conventions, functions, hooks, config, CLI                               | API Reference               |
| Terminology: App Router, Cache Components, PPR, RSC Payload, Streaming, Suspense, Hydration                          | Glossary                    |
| Compiler internals, Fast Refresh, browser support, accessibility                                                     | Architecture                |
| Community projects, Rspack                                                                                           | Community                   |

### Workflow

1. **Fetch llms.txt** — WebFetch `https://nextjs.org/docs/llms.txt` to discover all available App Router documentation pages.
2. **Identify the topic** — match the user's question to one of the categories above.
3. **Find the matching URL** — use the llms.txt index to find the exact URL for the topic.
4. **Append `.md` to the URL** — every URL from llms.txt must have `.md` appended before fetching. Example: `/docs/app/getting-started/installation` becomes `https://nextjs.org/docs/app/getting-started/installation.md`.
5. **Fetch the official page** — WebFetch the matching `nextjs.org/docs` page(s) with the `.md` suffix. Fetch the full content, not just the first section.
6. **Return the result** — provide the fetched documentation directly, with the source URL.

### When NOT to Use

- You already have the Next.js best-practices skill (`next-best-practices`) loaded — it contains opinionated guidance that may answer the question directly.
- You need code examples for a specific library — use the `context7` skill instead to fetch current docs.
- The task is about caching or upgrading — the `next-cache-components` and `next-upgrade` skills have dedicated workflows for those.

## Optional

- [Pages Router llms.txt](https://nextjs.org/docs/pages/llms.txt): Index of all Pages Router documentation.
