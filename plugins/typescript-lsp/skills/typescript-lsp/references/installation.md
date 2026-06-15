# Installation & CLI

`typescript-language-server` is distributed via npm. It depends on the `typescript` package at runtime (it spawns `tsserver` from it).

## Runtime requirements

- **Node.js** 18+ (LTS recommended).
- **`typescript`** package - either bundled with the install, supplied per-project via `node_modules`, or located through `tsserver.path` / `tsserver.fallbackPath`.

## Install methods

### Global (recommended for editor-wide use)

```bash
npm install -g typescript-language-server typescript
```

```bash
yarn global add typescript-language-server typescript
```

```bash
pnpm add -g typescript-language-server typescript
```

### Per-project (recommended for monorepos / version-pinning)

```bash
npm install --save-dev typescript-language-server typescript
```

Then launch via the local binary:

```bash
npx typescript-language-server --stdio
```

### Verify install

```bash
typescript-language-server --version
```

## CLI flags

| Flag                  | Default | Description                                                             |
| --------------------- | ------- | ----------------------------------------------------------------------- |
| `--stdio`             | -       | Communicate over stdin/stdout. Required when launched by an LSP client. |
| `--log-level <level>` | `3`     | Verbosity: `4` = log, `3` = info, `2` = warn, `1` = error.              |
| `-V`, `--version`     | -       | Print version and exit.                                                 |
| `-h`, `--help`        | -       | Print usage and exit.                                                   |

The server has no `--socket` / `--port` mode - `--stdio` is the only supported transport.

## tsserver discovery order

When the server needs to start `tsserver`, it resolves the TypeScript install in this order:

1. `tsserver.path` from `initializationOptions` (explicit override)
2. `typescript` package found in the workspace's `node_modules`
3. `tsserver.fallbackPath` from `initializationOptions`
4. The `typescript` package shipped/resolved next to `typescript-language-server` itself

If none is found, the server fails to initialize.

## Editor / client integration

Most LSP clients only need:

- **Command:** `typescript-language-server`
- **Args:** `["--stdio"]`
- **Language IDs to register:** `typescript`, `typescriptreact`, `javascript`, `javascriptreact`
- **File extensions:** `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs`, `.cjs`
- **Root markers:** `tsconfig.json`, `jsconfig.json`, `package.json`, `.git/`

Send TypeScript / JavaScript settings via `workspace/didChangeConfiguration` once the server is initialized (see [configuration.md](configuration.md)).

## Logging

- Set `tsserver.logVerbosity` (e.g. `"verbose"`) and optionally `tsserver.logDirectory` to capture tsserver logs to disk.
- Set `tsserver.trace` (`"messages"` or `"verbose"`) to log the LSP↔tsserver wire traffic.
- The server itself respects `--log-level` for its own output.

## Upgrades

The server is updated frequently. To pick up new TypeScript versions or LSP capabilities:

```bash
npm update -g typescript-language-server typescript
```

For per-project installs, bump the `devDependencies` entries instead.
