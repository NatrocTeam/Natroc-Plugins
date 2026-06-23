<div align="center">

# Natroc Plugins

**Cross-platform CLI for managing Natroc plugins — works on Windows, Linux, and macOS.**

</div>

---

## Quick Start

```bash
# No install required — run from anywhere
npx @natroc/plugins list

# Register all plugins to ZCode
npx @natroc/plugins zcode add

# Install plugins to ZCode
npx @natroc/plugins zcode install

# Install a specific plugin
npx @natroc/plugins zcode install --<plugin-name>
```

## Commands

| Command                          | Description                               |
| -------------------------------- | ----------------------------------------- |
| `natroc-plugins list`, `ls`      | Show all registered plugins with versions |
| `natroc-plugins zcode`           | Manage ZCode plugin integration           |
| `natroc-plugins --version`, `-v` | Show package version                      |
| `natroc-plugins --help`, `-h`    | Show usage help                           |

### ZCode Commands

| Command                                 | Description                                     |
| --------------------------------------- | ----------------------------------------------- |
| `natroc-plugins zcode add`              | Register and cache all Natroc plugins for ZCode |
| `natroc-plugins zcode install`          | Interactive install plugins to ZCode cache      |
| `natroc-plugins zcode install --<name>` | Install a specific plugin by name               |

## Development

```bash
# Install dependencies
cd packages
pnpm install

# Build
pnpm run build
```

### Build output

```
  natroc-plugins build

  ✓ Entry:    src/index.js (3.7 KB)
  ⋯ Bundling...
  ✓ Built:    dist/index.js (25.1 KB)
  ✓ Duration: 34 ms
  ✓ Modules:  9 bundled
  ✓ Plugins:  23 plugin(s) copied

  Build complete.
```

## Publish

```bash
# Build then publish to npm
cd packages
pnpm run build
npm publish
```

Or create a **GitHub Release** — the CI workflow publishes automatically.

## Requirements

- Node.js 18+

## License

This package is part of the Natroc Plugins repository and is licensed under the [MIT License](./LICENSE).
