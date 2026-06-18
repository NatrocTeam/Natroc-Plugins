# Xquik

`xquik` is a skill-only Claude Code and Codex plugin for X data automation
workflows that use Xquik.

Agents use this plugin to choose the right public Xquik surface for the user's
task: REST API, SDKs, MCP, webhooks, or the installable Xquik skill. The plugin
does not ship a separate MCP server or credential helper.

## What It Includes

- 1 bundled skill: `xquik`
- Public source reference:
  `https://github.com/Xquik-dev/x-twitter-scraper`
- Public docs reference: `https://docs.xquik.com`
- Package reference: `x-developer`

## Agent Usage Contract

Agents using this plugin should:

1. Read the user's workflow goal before choosing an integration surface.
2. Use Xquik's public docs and source examples as source truth.
3. Prefer the published SDK or REST API for app code.
4. Use MCP only when the user is connecting an agent tool surface.
5. Keep credentials in the user's environment or approved secret store.
6. Never ask the user to paste secret values into chat.
7. Never invent endpoints, response fields, pricing, limits, or capabilities.
8. Validate package names and versions before recommending install commands.

## Install/Use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install xquik@natroc-plugins
  ```

### Codex CLI

- Add marketplace

  ```
  codex plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  codex plugin add xquik@natroc-plugins
  ```

## References

- Docs: `https://docs.xquik.com`
- Source: `https://github.com/Xquik-dev/x-twitter-scraper`
- Package: `x-developer`
