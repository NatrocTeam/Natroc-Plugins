# GitHub Writing Example

## Commit message

```text
feat(plugin): add batch plugin installation
```

## Pull request description

This PR adds support for installing multiple plugins in one command.

Before this change, users had to install plugins one by one. That worked, but it became annoying when setting up a new agent from scratch.

Now users can run:

```bash
awesome-agent install plugin-a plugin-b plugin-c
```

The command validates each plugin, skips invalid entries, and shows a summary at the end.

## Notes

Good GitHub writing should:

- say what changed
- explain why it matters
- include commands or examples when useful
- avoid vague claims like "improves developer experience"
