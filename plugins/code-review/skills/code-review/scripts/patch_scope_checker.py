#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allowed", action="append", default=[])
    parser.add_argument("patch", nargs="?")
    return parser.parse_args()


def read_patch(path: str | None) -> str:
    if path:
        return Path(path).read_text(encoding="utf-8")
    return sys.stdin.read()


def changed_files(patch_text: str) -> list[str]:
    return re.findall(r"^\+\+\+ b/(.+)$", patch_text, flags=re.M)


def outside_allowed_scope(files: list[str], allowed: list[str]) -> list[str]:
    if not allowed:
        return []
    return [
        filename
        for filename in files
        if not any(filename.startswith(scope) or filename == scope for scope in allowed)
    ]


def main() -> int:
    args = parse_args()
    files = changed_files(read_patch(args.patch))
    outside = outside_allowed_scope(files, args.allowed)
    print(
        json.dumps(
            {
                "files_changed": files,
                "outside_allowed_scope": outside,
                "valid": not outside,
            },
            indent=2,
        )
    )
    return 1 if outside else 0


if __name__ == "__main__":
    sys.exit(main())
