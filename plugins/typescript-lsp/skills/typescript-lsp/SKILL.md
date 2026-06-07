---
name: typescript-lsp
description: Use when working with TypeScript or JavaScript code that needs language-server features — go-to-definition, find references, rename symbol, organize imports, code actions, refactorings, inlay hints, diagnostics, hover information, or configuring typescript-language-server. Covers .ts, .tsx, .js, .jsx, .mts, .cts, .mjs, .cjs files. Apply when the user mentions tsserver, LSP, IntelliSense, type errors, auto-import, "fix all", quote style, import sorting, or tsconfig-driven behavior.
license: MIT
compatibility: Requires Node.js >= 18 and the `typescript-language-server` and `typescript` npm packages installed (globally or per-project).
metadata:
  author: PT Kelana Tech Solutions
  version: "1.0"
  upstream: https://github.com/typescript-language-server/typescript-language-server
---

# TypeScript Language Server

## Overview

`typescript-language-server` is a thin Language Server Protocol (LSP) wrapper around Microsoft's `tsserver`. It exposes TypeScript / JavaScript code intelligence (completions, diagnostics, refactorings, rename, code actions, inlay hints, etc.) over LSP so any LSP-capable client can drive it.

**Core principle:** the server is a transport — all semantic behavior comes from `tsserver`. Configuration is layered: editor settings → LSP `initializationOptions` → `workspace/didChangeConfiguration` → per-project `tsconfig.json` / `jsconfig.json`.

## When to Use

Use this skill when the task involves any of the following:

- Running, launching, or installing `typescript-language-server`
- Configuring `initializationOptions`, `preferences`, `tsserver`, or per-language settings (`typescript.*`, `javascript.*`)
- Driving LSP features: completions, hover, signature help, document symbols, workspace symbols, go-to-definition, references, implementations, type definition, rename, formatting, semantic tokens
- Producing or consuming code actions: `source.fixAll.ts`, `source.organizeImports.ts`, `source.sortImports.ts`, `source.addMissingImports.ts`, `source.removeUnusedImports.ts`, `source.removeUnused.ts`
- Triggering custom `workspace/executeCommand` operations (e.g. `_typescript.goToSourceDefinition`, `_typescript.organizeImports`, `_typescript.applyRefactoring`, `_typescript.applyRenameFile`, `typescript.tsserverRequest`, `_typescript.configurePlugin`)
- Tuning inlay hints, auto-imports, quote style, import organization
- Suppressing diagnostics by code, increasing `tsserver` memory, configuring logging, or attaching `tsserver` plugins
- Debugging tsserver behavior (logs, trace, syntax server, file watching)

**Do NOT use this skill for:** authoring `tsconfig.json` semantics, the TypeScript language itself, build tooling (tsc, esbuild, swc, vite), or non-LSP IDE integrations.

## File Coverage

| Extension | Language ID       |
| --------- | ----------------- |
| `.ts`     | `typescript`      |
| `.tsx`    | `typescriptreact` |
| `.mts`    | `typescript`      |
| `.cts`    | `typescript`      |
| `.js`     | `javascript`      |
| `.jsx`    | `javascriptreact` |
| `.mjs`    | `javascript`      |
| `.cjs`    | `javascript`      |

## Quick Reference

### Launch

```bash
typescript-language-server --stdio
```

Useful flags:

| Flag                 | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `--stdio`            | Required transport when launching from an LSP client |
| `--log-level <1..4>` | 4=log, 3=info (default), 2=warn, 1=error             |
| `-V`, `--version`    | Print version                                        |
| `-h`, `--help`       | Print CLI help                                       |

### Minimal `initializationOptions`

```json
{
  "hostInfo": "my-editor",
  "preferences": {
    "includeCompletionsForModuleExports": true,
    "includeCompletionsWithInsertText": true,
    "quotePreference": "auto",
    "importModuleSpecifierPreference": "shortest"
  },
  "tsserver": {
    "logVerbosity": "off",
    "useSyntaxServer": "auto"
  }
}
```

### Most-used commands (`workspace/executeCommand`)

| Command                            | Purpose                                            |
| ---------------------------------- | -------------------------------------------------- |
| `_typescript.goToSourceDefinition` | Jump past `.d.ts` to the actual source (TS 4.7+)   |
| `_typescript.organizeImports`      | Sort + remove unused imports for a file            |
| `_typescript.applyRefactoring`     | Execute a specific refactoring action              |
| `_typescript.applyRenameFile`      | Update imports after a file rename/move            |
| `typescript.tsserverRequest`       | Forward an arbitrary tsserver request              |
| `_typescript.configurePlugin`      | Pass configuration to a registered tsserver plugin |

### Most-used code action kinds

`source.fixAll.ts`, `source.organizeImports.ts`, `source.sortImports.ts`, `source.addMissingImports.ts`, `source.removeUnusedImports.ts`, `source.removeUnused.ts`.

## Detailed References

Load these on demand — do not read them all up front.

- [Installation & CLI](references/installation.md) — install methods, runtime requirements, every CLI flag
- [LSP Features](references/lsp-features.md) — code actions, code lens, inlay hints, hover verbosity, semantic tokens, file watching
- [Configuration](references/configuration.md) — full `initializationOptions`, `tsserver`, `preferences`, and `workspace/didChangeConfiguration` schema
- [Commands](references/commands.md) — every supported `workspace/executeCommand` with arguments and return types

## Common Pitfalls

| Symptom                                             | Cause                                                                     | Fix                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `Cannot find tsserver`                              | `typescript` not installed alongside the server                           | Install `typescript` globally or set `tsserver.path` / `tsserver.fallbackPath`                  |
| Auto-imports missing from `node_modules`            | `disableAutomaticTypingAcquisition: true` or no `package.json`            | Re-enable typing acquisition or add `package.json`                                              |
| Inlay hints not appearing                           | Client never sent `inlayHints.*` settings or capability not advertised    | Send `workspace/didChangeConfiguration` with `[language].inlayHints.*`                          |
| `Move to file` refactor is non-interactive          | Client did not set `supportsMoveToFileCodeAction: true`                   | Pass it in `initializationOptions` and supply `interactiveRefactorArguments.targetFile`         |
| Stale diagnostics after edit                        | `diagnostics.eagerClear` not enabled                                      | Enable it via `workspace/didChangeConfiguration`                                                |
| OOM on large monorepos                              | Default V8 heap too small                                                 | Increase `maxTsServerMemory` (MB)                                                               |
| Diagnostics codes you want hidden keep appearing    | Codes not in `diagnostics.ignoredCodes` for the right language namespace  | Add numeric codes under both `typescript.diagnostics.ignoredCodes` and `javascript.*` as needed |
| Rename misses import paths                          | `allowRenameOfImportPath` disabled                                        | Set it to `true` in `preferences`                                                               |
| Go-to-definition lands on `.d.ts` instead of source | Using `textDocument/definition` rather than the source-definition command | Execute `_typescript.goToSourceDefinition` (TS 4.7+)                                            |

## Upstream Documentation

- README: <https://github.com/typescript-language-server/typescript-language-server>
- Configuration: <https://github.com/typescript-language-server/typescript-language-server/blob/master/docs/configuration.md>
- Code actions in tsserver: <https://github.com/microsoft/TypeScript/wiki>
