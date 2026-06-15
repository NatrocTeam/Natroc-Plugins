# Direct Answer Example

## User request

How do I revert the last commit without losing the changes?

## Weak AI-style answer

There are several ways to revert the last commit in Git. The choice depends on your specific requirements. One common approach is to use `git reset`, while another option involves `git revert`. Each method has its own advantages and disadvantages depending on the situation.

## Human-style answer

Use `git reset HEAD~1` to undo the last commit while keeping the changes in your working directory.

```bash
git reset HEAD~1
```

If you want to completely remove the commit and discard the changes, use `--hard` instead. But be careful - that is not reversible.

## Notes

A good direct answer should:

- answer the question first, not open with "there are several ways"
- show the command immediately
- explain the important caveat right after
- avoid fake balance between options when one answer is clearly better
