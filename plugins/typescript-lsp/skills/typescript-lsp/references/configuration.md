# Configuration Reference

Configuration arrives in two layers:

1. **`initializationOptions`** — passed once in the `initialize` request. Cannot change without restart.
2. **`workspace/didChangeConfiguration`** — pushed at any time. Carries per-language settings (`typescript.*`, `javascript.*`).

The server also fires `workspace/configuration` requests to pull file-specific values (e.g. formatter `tabSize`).

---

## `initializationOptions`

Top-level fields:

| Field                               | Type       | Purpose                                                                               |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `hostInfo`                          | `string`   | Identifies the client (`"vscode"`, `"neovim"`, ...). Forwarded to tsserver telemetry. |
| `completionDisableFilterText`       | `boolean`  | Omit `filterText` on completion items.                                                |
| `disableAutomaticTypingAcquisition` | `boolean`  | Disable fetching `@types/*` packages for JS projects.                                 |
| `maxTsServerMemory`                 | `number`   | V8 old-space size for tsserver (MB).                                                  |
| `npmLocation`                       | `string`   | Path to `npm` (for typing acquisition).                                               |
| `locale`                            | `string`   | Language for tsserver error messages.                                                 |
| `plugins`                           | `object[]` | TSServer plugins. Each entry: `{ name, location, languages? }`.                       |
| `preferences`                       | `object`   | TSServer behavior knobs (see below).                                                  |
| `supportsHoverVerbosity`            | `boolean`  | Opt in to progressive hover detail (TS 5.9+).                                         |
| `supportsMoveToFileCodeAction`      | `boolean`  | Enable interactive "Move to file" refactor.                                           |
| `tsserver`                          | `object`   | Process / logging config (see below).                                                 |

### `initializationOptions.tsserver`

| Field                  | Values                                                               | Notes                                                       |
| ---------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `path`                 | string                                                               | Path to `tsserver.js` _or_ the TypeScript `lib/` directory. |
| `fallbackPath`         | string                                                               | Used when `path` and workspace `node_modules` both miss.    |
| `logDirectory`         | string                                                               | Where to write tsserver logs. Default: workspace `.log/`.   |
| `logVerbosity`         | `"off"` \| `"terse"` \| `"normal"` \| `"requestTime"` \| `"verbose"` | Per-request log detail.                                     |
| `trace`                | `"off"` \| `"messages"` \| `"verbose"`                               | LSP↔tsserver wire trace.                                    |
| `useClientFileWatcher` | boolean                                                              | Delegate file watching to the client (TS 5.4.4+).           |
| `useSyntaxServer`      | `"auto"` \| `"never"`                                                | Use a dedicated syntax-only tsserver process.               |

### `initializationOptions.preferences`

Grouped by purpose. All optional.

**Quote / import style**

| Field                             | Values                                                                   |
| --------------------------------- | ------------------------------------------------------------------------ |
| `quotePreference`                 | `"auto"` \| `"single"` \| `"double"`                                     |
| `importModuleSpecifierPreference` | `"shortest"` \| `"project-relative"` \| `"relative"` \| `"non-relative"` |
| `importModuleSpecifierEnding`     | `"auto"` \| `"minimal"` \| `"index"` \| `"js"`                           |
| `jsxAttributeCompletionStyle`     | `"auto"` \| `"braces"` \| `"none"`                                       |

**Auto-imports**

| Field                                   | Notes                                         |
| --------------------------------------- | --------------------------------------------- |
| `autoImportFileExcludePatterns`         | Globs to skip when scanning for auto-imports. |
| `autoImportSpecifierExcludeRegexes`     | Regex patterns to exclude.                    |
| `includeCompletionsForModuleExports`    | Search across modules in completion list.     |
| `includeCompletionsForImportStatements` | Emit auto-import completion entries.          |
| `includePackageJsonAutoImports`         | `"auto"` \| `"on"` \| `"off"`.                |
| `preferTypeOnlyAutoImports`             | Prefer `import type` syntax when applicable.  |

**Completions**

- `includeCompletionsWithSnippetText`
- `includeCompletionsWithInsertText`
- `includeAutomaticOptionalChainCompletions`
- `includeCompletionsWithClassMemberSnippets`
- `includeCompletionsWithObjectLiteralMethodSnippets`
- `useLabelDetailsInCompletionEntries`
- `allowIncompleteCompletions`

**Organize imports** (mirrors tsserver flags)

- `organizeImportsIgnoreCase`: `"auto"` \| boolean
- `organizeImportsCollation`: `"ordinal"` \| `"unicode"`
- `organizeImportsLocale` (default `"en"`)
- `organizeImportsNumericCollation`
- `organizeImportsAccentCollation`
- `organizeImportsCaseFirst`: `"upper"` \| `"lower"` \| `false`
- `organizeImportsTypeOrder`: `"last"` \| `"inline"` \| `"first"`

**Inlay hints** (also exposed via `[language].inlayHints.*`)

- `includeInlayParameterNameHints`: `"none"` \| `"literals"` \| `"all"`
- `includeInlayParameterNameHintsWhenArgumentMatchesName`
- `includeInlayFunctionParameterTypeHints`
- `includeInlayVariableTypeHints`
- `includeInlayVariableTypeHintsWhenTypeMatchesName`
- `includeInlayPropertyDeclarationTypeHints`
- `includeInlayFunctionLikeReturnTypeHints`
- `includeInlayEnumMemberValueHints`
- `interactiveInlayHints` (TS 5.2.2+)

**Refactor / rename**

- `disableSuggestions`
- `allowTextChangesInNewFiles`
- `allowRenameOfImportPath`
- `providePrefixAndSuffixTextForRename`
- `provideRefactorNotApplicableReason`
- `lazyConfiguredProjectsFromExternalProject`

**Hover / docs**

- `displayPartsForJSDoc`
- `generateReturnInDocTemplate`
- `maximumHoverLength` (default `500`, TS 5.9+)
- `excludeLibrarySymbolsInNavTo`

---

## `workspace/didChangeConfiguration`

The settings payload is namespaced by language. Mirror everything under both `typescript.*` and `javascript.*` unless you specifically want different behavior per language.

```json
{
  "typescript": {
    "format": {
      /* see below */
    },
    "inlayHints": {
      /* see below */
    },
    "implementationsCodeLens": { "enabled": true },
    "referencesCodeLens": { "enabled": true, "showOnAllFunctions": false },
    "preferences": {
      /* same shape as initializationOptions.preferences */
    }
  },
  "javascript": {
    /* mirror */
  },
  "completions": { "completeFunctionCalls": true },
  "diagnostics": {
    "ignoredCodes": [],
    "eagerClear": true
  },
  "implicitProjectConfiguration": {
    "checkJs": false,
    "experimentalDecorators": false,
    "module": "ESNext",
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "target": "ES2020"
  }
}
```

### `[language].format.*`

Indentation: `baseIndentSize`, `indentSize`, `tabSize`, `convertTabsToSpaces`, `indentStyle`.

Spacing:

- `insertSpaceAfterCommaDelimiter`
- `insertSpaceAfterConstructor`
- `insertSpaceAfterFunctionKeywordForAnonymousFunctions`
- `insertSpaceAfterKeywordsInControlFlowStatements`
- `insertSpaceAfterOpeningAndBeforeClosingEmptyBraces`
- `insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces`
- `insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces`
- `insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets`
- `insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis`
- `insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces`
- `insertSpaceAfterSemicolonInForStatements`
- `insertSpaceAfterTypeAssertion`
- `insertSpaceBeforeAndAfterBinaryOperators`
- `insertSpaceBeforeFunctionParenthesis`
- `insertSpaceBeforeTypeAnnotation`

Other: `newLineCharacter`, `semicolons` (`"ignore"` \| `"insert"` \| `"remove"`), `trimTrailingWhitespace`, `placeOpenBraceOnNewLineForControlBlocks`, `placeOpenBraceOnNewLineForFunctions`.

### `[language].inlayHints.*`

Same field names as the `preferences.includeInlay*` listed above. The `workspace/didChangeConfiguration` form takes precedence over `initializationOptions` when both are set.

### Code Lens

- `[language].implementationsCodeLens.enabled`
- `[language].referencesCodeLens.enabled`
- `[language].referencesCodeLens.showOnAllFunctions`

### Diagnostics

- `diagnostics.ignoredCodes`: numeric array of TS error codes (e.g. `[6133, 7016]`).
- `diagnostics.eagerClear`: clear stale diagnostics immediately on edit.

### Implicit project (files without `tsconfig` / `jsconfig`)

`implicitProjectConfiguration.{checkJs, experimentalDecorators, module, strictFunctionTypes, strictNullChecks, target}`.

---

## Recommended starter payloads

**`initializationOptions`** for an editor with full feature support:

```json
{
  "hostInfo": "my-editor",
  "preferences": {
    "quotePreference": "auto",
    "importModuleSpecifierPreference": "shortest",
    "importModuleSpecifierEnding": "minimal",
    "includeCompletionsForModuleExports": true,
    "includeCompletionsForImportStatements": true,
    "includeCompletionsWithInsertText": true,
    "includeAutomaticOptionalChainCompletions": true,
    "allowIncompleteCompletions": true,
    "allowRenameOfImportPath": true,
    "providePrefixAndSuffixTextForRename": true,
    "provideRefactorNotApplicableReason": true,
    "displayPartsForJSDoc": true
  },
  "tsserver": {
    "logVerbosity": "off",
    "trace": "off",
    "useSyntaxServer": "auto",
    "useClientFileWatcher": false
  },
  "supportsHoverVerbosity": true,
  "supportsMoveToFileCodeAction": true
}
```

**`workspace/didChangeConfiguration`** baseline:

```json
{
  "typescript": {
    "inlayHints": {
      "includeInlayParameterNameHints": "literals",
      "includeInlayFunctionParameterTypeHints": false,
      "includeInlayVariableTypeHints": false,
      "includeInlayPropertyDeclarationTypeHints": false,
      "includeInlayFunctionLikeReturnTypeHints": false,
      "includeInlayEnumMemberValueHints": true
    },
    "implementationsCodeLens": { "enabled": false },
    "referencesCodeLens": { "enabled": false }
  },
  "javascript": {
    "inlayHints": {
      "includeInlayParameterNameHints": "literals"
    }
  },
  "completions": { "completeFunctionCalls": true },
  "diagnostics": { "eagerClear": true }
}
```
