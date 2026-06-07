# LSP Features

What the server announces and how each feature behaves on top of `tsserver`.

## Code Actions

The server advertises these top-level code action kinds. Pass them in `textDocument/codeAction` `context.only` to filter, or trigger them on save via the client's `codeActionsOnSave` mechanism.

| Kind                            | Effect                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `source.fixAll.ts`              | Auto-fix safe issues (unreachable code, missing `await`, missing interfaces) |
| `source.removeUnused.ts`        | Remove unused variable declarations                                          |
| `source.addMissingImports.ts`   | Add `import` statements for unresolved symbols                               |
| `source.removeUnusedImports.ts` | Remove import bindings the file does not use                                 |
| `source.sortImports.ts`         | Sort imports alphabetically (no removal)                                     |
| `source.organizeImports.ts`     | Sort imports _and_ remove unused ones                                        |

In addition, the server exposes all `quickfix.*` and `refactor.*` actions produced by tsserver for the current selection.

## Code Lens

Toggle through `workspace/didChangeConfiguration`:

- `typescript.implementationsCodeLens.enabled` (and `javascript.*`)
- `typescript.referencesCodeLens.enabled`
- `typescript.referencesCodeLens.showOnAllFunctions`

Lenses resolve to reference / implementation counts and behave as navigation targets when invoked.

## Inlay Hints

Inlay hint visibility is controlled by `[language].inlayHints.*` settings (see [configuration.md](configuration.md)). Common levers:

- `includeInlayParameterNameHints`: `none` | `literals` | `all`
- `includeInlayFunctionParameterTypeHints`
- `includeInlayVariableTypeHints` (+ `WhenTypeMatchesName` suppressor)
- `includeInlayPropertyDeclarationTypeHints`
- `includeInlayFunctionLikeReturnTypeHints`
- `includeInlayEnumMemberValueHints`
- `interactiveInlayHints` (TS 5.2.2+) — hint parts become hoverable / clickable

## Hover

Standard `textDocument/hover` returns Markdown with signature, JSDoc, and source link when available.

**Progressive verbosity (TS 5.9+):** the client opts in by passing `supportsHoverVerbosity: true` in `initializationOptions`. Requests may then include `verbosityLevel: number`; responses include `canIncreaseVerbosityLevel: boolean`, letting the UI offer "Show more". Cap the maximum hover length via `preferences.maximumHoverLength` (default 500).

## Signature Help

Triggered on `(`, `,`, and `<`. Returns overload list, parameter labels, and JSDoc for the active parameter.

## Completions

Behavior is driven by `preferences.*` (see [configuration.md](configuration.md)). Notable settings:

- `quotePreference`: `auto` | `single` | `double`
- `includeCompletionsForModuleExports`: enable cross-module symbol search
- `includeCompletionsForImportStatements`: emit auto-import completions
- `includeCompletionsWithInsertText`: required for snippet-style entries
- `includeCompletionsWithClassMemberSnippets`: full member declarations
- `includeCompletionsWithObjectLiteralMethodSnippets`
- `jsxAttributeCompletionStyle`: `auto` | `braces` | `none`
- `includeAutomaticOptionalChainCompletions`
- `useLabelDetailsInCompletionEntries`
- `allowIncompleteCompletions`: resolve module names lazily for faster first response

Client-side, `completions.completeFunctionCalls` decides whether the inserted snippet includes parameter placeholders.

## Diagnostics

- `diagnostics.ignoredCodes`: numeric array of TS error codes to suppress (per language namespace).
- `diagnostics.eagerClear`: clear stale diagnostics immediately on edit instead of waiting for the next tsserver response.

Diagnostics flow through `textDocument/publishDiagnostics`. The server also batches `suggestionDiagnostics` (the squiggly "consider doing X" entries).

## Semantic Tokens

The server provides `textDocument/semanticTokens/full` and `range` based on tsserver's encoded classifications. No extra configuration needed.

## Symbols, Navigation, and Hierarchy

Supported requests:

- `textDocument/documentSymbol` (hierarchical)
- `workspace/symbol`
- `textDocument/definition`
- `textDocument/typeDefinition`
- `textDocument/implementation`
- `textDocument/references`
- `textDocument/declaration`
- `textDocument/prepareCallHierarchy` + `callHierarchy/incomingCalls` + `outgoingCalls`
- `textDocument/prepareTypeHierarchy` + `typeHierarchy/supertypes` + `subtypes`
- `textDocument/foldingRange`
- `textDocument/selectionRange`
- `textDocument/documentHighlight`
- `textDocument/linkedEditingRange`

For "jump past `.d.ts` to the real source", prefer the `_typescript.goToSourceDefinition` command (see [commands.md](commands.md)).

## Rename

- `textDocument/prepareRename` validates the symbol.
- `textDocument/rename` returns the workspace edit.
- Tune via `preferences.allowRenameOfImportPath` and `preferences.providePrefixAndSuffixTextForRename`.

## Formatting

Supports `textDocument/formatting`, `textDocument/rangeFormatting`, and `textDocument/onTypeFormatting`. All format options are configured under `[language].format.*` (see [configuration.md](configuration.md)). The server also requests file-specific options via `workspace/configuration` (e.g. `tabSize`, `insertSpaces`).

## File Watching

By default the server watches files itself. Set `tsserver.useClientFileWatcher: true` (TS 5.4.4+) to delegate watching to the client via `workspace/didChangeWatchedFiles` — recommended for large projects, network drives, and clients with native watchers.

## Notifications & Custom Methods

- **`$/typescriptVersion`** — sent post-initialization with the resolved tsserver version and source.
- **`workspace/configuration`** — server pulls per-file editor settings on demand.
- **`window/showMessage` / `window/showMessageRequest`** — used for surfacing tsserver errors or interactive prompts.

## Interactive Refactorings

To enable interactive destinations for `Move to file`, the client must:

1. Pass `supportsMoveToFileCodeAction: true` in `initializationOptions`.
2. When applying the action, execute `_typescript.applyRefactoring` with `interactiveRefactorArguments.targetFile` set to the user-chosen path.

Otherwise the refactor falls back to non-interactive behavior.

## TSServer Plugins

Plugins registered through `initializationOptions.plugins` (each `{ name, location, languages? }`) are loaded by tsserver. Configure them at runtime by executing the `_typescript.configurePlugin` command with `[pluginName, configuration]`.
