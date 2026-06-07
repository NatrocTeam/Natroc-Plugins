# Safe Command Policy

Forbidden without explicit scoped approval: rm -rf, git reset --hard, git clean -fdx, git push --force, git push --force-with-lease, npm/pnpm/yarn publish, docker system prune, curl/wget piped to shell, dependency installs during review-only mode.
