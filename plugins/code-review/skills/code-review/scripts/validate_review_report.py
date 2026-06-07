#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REQUIRED_SECTIONS = [
    "# Code Review Report",
    "## Verdict",
    "## Review Mode",
    "## Stack Detected",
    "## Evidence Policy",
    "## Findings",
]
FIX_DECISION_TERMS = ["fix all", "fix semua", "defer", "nanti dulu", "fix selected"]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("file", nargs="?")
    return parser.parse_args()


def read_input(path: str | None) -> str:
    if path:
        return Path(path).read_text(encoding="utf-8")
    return sys.stdin.read()


def main() -> int:
    text = read_input(parse_args().file)
    lowered = text.lower()
    missing = [section for section in REQUIRED_SECTIONS if section.lower() not in lowered]
    needs_fix_question = not any(term in lowered for term in FIX_DECISION_TERMS)
    payload = {
        "valid": not missing and not needs_fix_question,
        "missing_sections": missing,
        "missing_fix_question": needs_fix_question,
    }
    print(json.dumps(payload, indent=2))
    return 1 if missing or needs_fix_question else 0


if __name__ == "__main__":
    sys.exit(main())
