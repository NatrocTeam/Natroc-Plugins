#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REQUIRED_FIELDS = [
    "finding_id",
    "severity",
    "category",
    "file",
    "evidence",
    "docs_basis",
    "impact",
    "suggested_fix",
    "confidence",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", nargs="?")
    return parser.parse_args()


def read_input(path: str | None) -> str:
    if path:
        return Path(path).read_text(encoding="utf-8")
    return sys.stdin.read()


def normalize_items(payload: object) -> list[dict[str, object]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        return payload.get("findings", [])
    return []


def validate_items(items: list[dict[str, object]]) -> list[dict[str, object]]:
    errors = []
    for index, item in enumerate(items):
        missing = [field for field in REQUIRED_FIELDS if not item.get(field)]
        if missing:
            errors.append({"index": index, "missing": missing})
    return errors


def main() -> int:
    try:
        data = json.loads(read_input(parse_args().file))
    except json.JSONDecodeError as error:
        print(json.dumps({"valid": False, "error": f"Invalid JSON: {error}"}, indent=2))
        return 1

    errors = validate_items(normalize_items(data))
    print(json.dumps({"valid": not errors, "errors": errors}, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
