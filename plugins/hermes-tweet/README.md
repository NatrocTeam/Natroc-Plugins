# Hermes Tweet Plugin

`hermes-tweet` is a skill-only Claude Code and Codex plugin for using the
native Hermes Agent X/Twitter plugin from Xquik.

Agents use this plugin to install, configure, test, and operate Hermes Tweet
without treating it as a generic X API wrapper. Hermes Tweet is a native Hermes
Agent plugin with `tweet_explore`, `tweet_read`, and approval-gated
`tweet_action` workflows.

## What's Included

- 1 bundled skill: `hermes-tweet`
- Source package: `https://github.com/Xquik-dev/hermes-tweet`
- Package reference: `hermes-tweet`
- Runtime surface: Hermes Agent plugin tools and bundled skill

## Agent Usage Contract

Agents using this plugin should:

1. Treat Hermes Tweet as a Hermes Agent plugin, not a direct HTTP client.
2. Use `tweet_explore` before choosing a read or action route.
3. Prefer `tweet_read` for public X/Twitter reads.
4. Use `tweet_action` only after explicit user approval.
5. Keep `HERMES_TWEET_ENABLE_ACTIONS=false` unless the session needs actions.
6. Keep `XQUIK_API_KEY` in the Hermes runtime environment.
7. Never ask the user to paste secret values into chat.
8. Verify Hermes Agent install and enablement commands before troubleshooting.

## Install/Use

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install hermes-tweet@natroc-plugins
  ```

### Codex CLI

- Add marketplace

  ```
  codex plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  codex plugin add hermes-tweet@natroc-plugins
  ```

### Hermes Agent Runtime

Install and enable the Hermes Agent plugin where Hermes code executes:

```
hermes plugins install Xquik-dev/hermes-tweet --enable
```

For PyPI-based installs:

```
uv pip install --python ~/.hermes/hermes-agent/venv/bin/python hermes-tweet
hermes plugins enable hermes-tweet
```

## References

- Hermes Tweet: `https://github.com/Xquik-dev/hermes-tweet#readme`
- PyPI: `https://pypi.org/project/hermes-tweet/`
- Hermes plugin guide:
  `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/guides/build-a-hermes-plugin.md`
- Hermes plugins guide:
  `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/plugins.md`
