# Next.js Plugin

`nextjs` is a local-first skill pack for building, upgrading, debugging, and
reviewing Next.js applications with App Router, React Server Components, and
the latest Next.js features.

Agents use this plugin as a local reference for Next.js conventions, patterns,
and upgrade paths - no external documentation needed during development work.

## What's Included

This plugin provides four skills:

| Skill                   | Description                                                                                                                                                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next-best-practices`   | File conventions, RSC boundaries, async patterns, runtime selection, directives, functions, error handling, data patterns, route handlers, metadata, image/font optimization, bundling, scripts, hydration errors, suspense boundaries, parallel routes, self-hosting, debug tricks |
| `next-cache-components` | Next.js 16 Cache Components - PPR, `use cache` directive, `cacheLife`, `cacheTag`, `updateTag`, cache invalidation, migration from `unstable_cache`                                                                                                                                 |
| `next-docs`             | Curated index of official Next.js 16.2.9 documentation — Getting Started, Guides, API Reference, Glossary, Architecture, and Community resources                                                                                                                                    |
| `next-upgrade`          | Structured upgrade workflow with codemods, version-specific migration guides (v14 → v15 → v16), and dependency management                                                                                                                                                           |

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

To find specific Next.js docs (API reference, guides, glossary):

```
Use $nextjs next-docs to look up the cacheLife API.
```

### Upgrading Next.js

To upgrade a project:

```
Use $nextjs next-upgrade to upgrade from Next.js 15 to 16.
```

## Plugin Structure

```
plugins/nextjs/
├── .codex-plugin/plugin.json          # Codex manifest
├── .claude-plugin/plugin.json          # Claude Code manifest
├── assets/
│   └── nextjs.svg                      # Plugin icon
├── README.md                           # This file
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
│   ├── next-docs/                       # Documentation lookup skill
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── Getting-Started.md
│   │       ├── Guides.md
│   │       ├── API-Reference.md
│   │       ├── Glossary.md
│   │       ├── Architecture.md
│   │       └── Community.md
│   └── next-upgrade/                   # Upgrade workflow skill
│       └── SKILL.md
```
