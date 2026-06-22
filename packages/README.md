<div align="center">

# Natroc Plugins

**Cross-platform CLI for managing Natroc plugins - works on Windows, Linux, and macOS.**

</div>

---

## Quick Start

```bash
# Install globally
npm install -g @natroc/plugins

# List all available plugins
natroc-plugins list

# Get help
natroc-plugins --help
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
pnpm install

# Build
pnpm run build

# Build output
#   dist/index.js   - bundled CLI with shebang
```

### Build output

```
  natroc-plugins build

  ✓ Entry:    src/index.js (3.3 KB)
  ⋯ Bundling...
  ✓ Built:    dist/index.js (22.1 KB)
  ✓ Duration: 45 ms
  ✓ Modules:  8 bundled

  Build complete.
```

## Publish

```bash
# Build then publish to npm
pnpm run build
npm publish
```

Or create a **GitHub Release** - the CI workflow publishes automatically.

## Requirements

- Node.js 18+
- pnpm (for development)

## License

This package is part of the Natroc Plugins repository and is licensed under the [MIT License](./LICENSE).
