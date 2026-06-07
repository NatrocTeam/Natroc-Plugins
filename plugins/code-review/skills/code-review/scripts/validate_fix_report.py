#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REQUIRED_SECTIONS = [
    "# Fix Report",
    "## Verdict",
    "## Findings Fixed",
    "## Files Changed",
    "## Fix Summary",
    "## Docs Basis",
    "## Verification Commands",
    "## Remaining Risks",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", nargs="?")
    return parser.parse_args()


def read_input(path: str | None) -> str:
    if path:
        return Path(path).read_text(encoding="utf-8")
    return sys.stdin.read()


def invalid_pass_verdict(text: str) -> bool:
    lowered = text.lower()
    return (
        "## verdict" in lowered
        and "pass" in lowered
        and ("failed" in lowered or "error" in lowered)
        and "pass with warnings" not in lowered
    )


def main() -> int:
    text = read_input(parse_args().file)
    lowered = text.lower()
    missing = [section for section in REQUIRED_SECTIONS if section.lower() not in lowered]
    invalid_pass = invalid_pass_verdict(text)
    payload = {
        "valid": not missing and not invalid_pass,
        "missing_sections": missing,
        "invalid_pass_with_failures": invalid_pass,
    }
    print(json.dumps(payload, indent=2))
    return 1 if missing or invalid_pass else 0


if __name__ == "__main__":
    sys.exit(main())
