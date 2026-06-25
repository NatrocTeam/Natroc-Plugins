# Next.js Plugin

`nextjs` is a skill pack and subagent for building, upgrading, debugging,
reviewing, and researching Next.js applications with App Router, React Server
Components, and the latest Next.js features.

Agents use this plugin for Next.js conventions, patterns, upgrade paths, and
production hardening - with a dedicated subagent that fetches official
`nextjs.org/docs` pages (via `llms.txt` index + per-topic fetch) when
comprehensive documentation context is needed.

## What's Included

This plugin provides five skills and one subagent:

| Component               | Type     | Description                                                                                                                                                                                                                                                                         |
| ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next-best-practices`   | Skill    | File conventions, RSC boundaries, async patterns, runtime selection, directives, functions, error handling, data patterns, route handlers, metadata, image/font optimization, bundling, scripts, hydration errors, suspense boundaries, parallel routes, self-hosting, debug tricks |
| `next-cache-components` | Skill    | Next.js 16 Cache Components - PPR, `use cache` directive, `cacheLife`, `cacheTag`, `updateTag`, cache invalidation, migration from `unstable_cache`                                                                                                                                 |
| `next-docs`             | Skill    | Fetches official Next.js 16 documentation live from nextjs.org via llms.txt index + per-topic WebFetch — Getting Started, Guides, API Reference, Glossary, Architecture, and Community resources                                                                                    |
| `next-upgrade`          | Skill    | Structured upgrade workflow with codemods, version-specific migration guides (v14 → v15 → v16), and dependency management                                                                                                                                                           |
| `next-production`       | Skill    | Production security hardening with 37 checkpoints for Server Actions, Route Handlers, Data Access Layer, auth/session, CSP, SSRF, uploads, rate limits, audit logging, CI/CD, and deployment readiness                                                                              |
| `nextjs-docs`           | Subagent | Documentation researcher that fetches llms.txt, then WebFetches matching `nextjs.org/docs` pages and returns structured context to the main agent session                                                                                                                           |

## Prerequisites

- A Next.js project (App Router recommended)
- Node.js 18+ (Node.js 20+ for Next.js 16 Cache Components)

## Installation

### Claude Code CLI

Install from the Natroc Plugins marketplace:

```
/codex plugin:install nextjs
```

Or add the marketplace to your Claude Code configuration.

### Codex

Add the marketplace source or install directly from the plugin directory.

## Usage

### General Next.js Development

When building or reviewing Next.js code, invoke the main best-practices skill:

```
Use $nextjs Next.js best practices for this App Router page.
```

### Cache Components (Next.js 16+)

For Partial Prerendering and Cache Components:

```
Use $nextjs next-cache-components to set up PPR with use cache.
```

### Documentation Lookup

To fetch specific Next.js docs (API reference, guides, glossary) live from `nextjs.org`:

```
Use $nextjs next-docs to look up the cacheLife API.
```

### Documentation Research (Subagent)

For comprehensive documentation gathering - fetches the `llms.txt` index and matching `nextjs.org/docs` pages, returning structured context to your main session:

```
Use the nextjs-docs subagent to gather full Next.js 16 API reference context for building a new route handler.
```

### Production Security

To audit or harden a Next.js app for production:

```
Use $nextjs next-production to review this app for production security.
```

### Upgrading Next.js

To upgrade a project:

```
Use $nextjs next-upgrade to upgrade from Next.js 15 to 16.
```

## Plugin Structure

```
plugins/nextjs/
├── .codex-plugin/plugin.json           # Codex manifest
├── .claude-plugin/plugin.json          # Claude Code manifest
├── assets/
│   └── nextjs.svg                      # Plugin icon
├── README.md                           # This file
├── agents/
│   └── docs.md                         # nextjs-docs documentation researcher subagent
├── skills/
│   ├── next-best-practices/            # Core best-practices skill
│   │   ├── SKILL.md
│   │   ├── file-conventions.md
│   │   ├── rsc-boundaries.md
│   │   ├── async-patterns.md
│   │   ├── runtime-selection.md
│   │   ├── directives.md
│   │   ├── functions.md
│   │   ├── error-handling.md
│   │   ├── data-patterns.md
│   │   ├── route-handlers.md
│   │   ├── metadata.md
│   │   ├── image.md
│   │   ├── font.md
│   │   ├── bundling.md
│   │   ├── scripts.md
│   │   ├── hydration-error.md
│   │   ├── suspense-boundaries.md
│   │   ├── parallel-routes.md
│   │   ├── self-hosting.md
│   │   └── debug-tricks.md
│   ├── next-cache-components/          # Cache Components skill (Next.js 16+)
│   │   └── SKILL.md
│   ├── next-docs/                      # Documentation lookup skill (llms.txt + live WebFetch)
│   │   └── SKILL.md
│   ├── next-production/                # Production security skill
│   │   ├── SKILL.md
│   │   ├── evals/
│   │   │   └── evals.json
│   │   └── references/
│   │       ├── nextjs-secure-patterns.md
│   │       ├── production-security-checklist.md
│   │       └── review-report-template.md
│   └── next-upgrade/
│       └── SKILL.md
```
