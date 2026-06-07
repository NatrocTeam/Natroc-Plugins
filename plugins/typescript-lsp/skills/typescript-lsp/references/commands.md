# Commands (`workspace/executeCommand`)

All custom commands the server registers. Invoke through the standard LSP `workspace/executeCommand` request:

```json
{
  "command": "<command>",
  "arguments": [
    /* see below */
  ]
}
```

## `_typescript.goToSourceDefinition`

Jump past `.d.ts` to the underlying source definition. Requires TypeScript ≥ 4.7.

| Argument index | Type          | Purpose                               |
| -------------- | ------------- | ------------------------------------- |
| `0`            | `DocumentUri` | URI of the file containing the cursor |
| `1`            | `Position`    | Cursor position `{ line, character }` |

**Returns:** `Location[] | null`

```json
{
  "command": "_typescript.goToSourceDefinition",
  "arguments": ["file:///abs/path/file.ts", { "line": 12, "character": 9 }]
}
```

## `_typescript.organizeImports`

Sort and/or remove unused imports for a single file.

| Argument index | Type                                                     | Purpose                |
| -------------- | -------------------------------------------------------- | ---------------------- |
| `0`            | `string`                                                 | File system path       |
| `1`            | `{ mode?: "All" \| "SortAndCombine" \| "RemoveUnused" }` | Optional mode override |

**Returns:** `void` (changes are applied as a workspace edit by the server).

```json
{
  "command": "_typescript.organizeImports",
  "arguments": ["/abs/path/file.ts", { "mode": "All" }]
}
```

## `_typescript.applyRefactoring`

Apply a refactoring action returned by `textDocument/codeAction`. Pass the tsserver `GetEditsForRefactorRequestArgs` payload as a single argument.

| Argument index | Type                             | Purpose                              |
| -------------- | -------------------------------- | ------------------------------------ |
| `0`            | `GetEditsForRefactorRequestArgs` | Refactor identifier + range + action |

When the refactor is interactive (e.g. `Move to file`) and the client passed `supportsMoveToFileCodeAction: true`, include `interactiveRefactorArguments.targetFile` in the args.

**Returns:** `void`

## `_typescript.applyRenameFile`

Update all imports across the workspace when a file is renamed or moved.

| Argument index | Type                                       | Purpose               |
| -------------- | ------------------------------------------ | --------------------- |
| `0`            | `{ sourceUri: string; targetUri: string }` | Old and new file URIs |

**Returns:** `void`

```json
{
  "command": "_typescript.applyRenameFile",
  "arguments": [
    {
      "sourceUri": "file:///abs/path/old.ts",
      "targetUri": "file:///abs/path/new.ts"
    }
  ]
}
```

## `typescript.tsserverRequest`

Escape hatch — forward an arbitrary tsserver request. Use only when no higher-level LSP method or command covers the use case.

| Argument index | Type          | Purpose                                                   |
| -------------- | ------------- | --------------------------------------------------------- |
| `0`            | `string`      | tsserver command name (e.g. `"navtree"`, `"projectInfo"`) |
| `1`            | `any`         | tsserver arguments object                                 |
| `2`            | `ExecuteInfo` | Execution metadata (optional fields)                      |

**`ExecuteInfo`:**

| Field             | Type                           | Default | Notes                                            |
| ----------------- | ------------------------------ | ------- | ------------------------------------------------ |
| `executionTarget` | `0` (semantic) \| `1` (syntax) | `0`     | Pick which tsserver instance handles the request |
| `expectsResult`   | `boolean`                      | `true`  | Whether to wait for and return a response        |
| `isAsync`         | `boolean`                      | `false` | Mark request as async (long-running)             |
| `lowPriority`     | `boolean`                      | `true`  | Schedule below interactive requests              |

**Returns:** the raw tsserver response (when `expectsResult` is `true`).

## `_typescript.configurePlugin`

Push runtime configuration to a registered tsserver plugin.

| Argument index | Type     | Purpose              |
| -------------- | -------- | -------------------- |
| `0`            | `string` | Plugin name          |
| `1`            | `any`    | Plugin configuration |

**Returns:** `void`

```json
{
  "command": "_typescript.configurePlugin",
  "arguments": ["typescript-styled-plugin", { "tags": ["css", "styled"] }]
}
```

---

## Discovering more commands

`textDocument/codeAction` responses may carry tsserver-driven commands (quick fixes, refactors). Always prefer to invoke the `command` returned in the code action over hand-crafting one — the server constructs the correct arguments based on tsserver's response.
