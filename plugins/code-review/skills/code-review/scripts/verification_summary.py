#!/usr/bin/env python3
from __future__ import annotations

import json
import sys

FAILURE_TERMS = ["failed", "error", "exit 1", "non-zero"]


def command_status(line: str) -> str:
    lowered = line.lower()
    return "FAIL" if any(term in lowered for term in FAILURE_TERMS) else "PASS"


def summarize(lines: list[str]) -> dict[str, object]:
    items = [{"line": line, "status": command_status(line)} for line in lines if line]
    verdict = "FAIL" if any(item["status"] == "FAIL" for item in items) else "PASS"
    return {"commands": items, "verdict": verdict}


def main() -> None:
    lines = [line.strip() for line in sys.stdin]
    print(json.dumps(summarize(lines), indent=2))


if __name__ == "__main__":
    main()
