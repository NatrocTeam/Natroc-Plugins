#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()
IGNORED_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".next",
    ".nuxt",
    ".svelte-kit",
    "vendor",
}


def file_size(path: Path) -> int | None:
    try:
        return path.stat().st_size
    except OSError:
        return None


def collect_files(root: Path) -> list[dict[str, object]]:
    files = []
    for path in root.rglob("*"):
        if path.is_file() and not any(part in IGNORED_DIRS for part in path.parts):
            files.append(
                {
                    "path": str(path.relative_to(root)),
                    "size": file_size(path),
                }
            )
    return files


def main() -> None:
    files = collect_files(ROOT)
    payload = {
        "root": str(ROOT),
        "files": files[:5000],
        "truncated": len(files) > 5000,
    }
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
