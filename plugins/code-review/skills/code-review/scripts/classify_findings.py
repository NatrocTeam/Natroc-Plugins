#!/usr/bin/env python3
from __future__ import annotations

import json
import sys

ORDER = {
    "Blocker": 0,
    "Critical": 1,
    "High": 2,
    "Medium": 3,
    "Low": 4,
    "Info": 5,
    "Unverified": 6,
}


def normalize_findings(payload: object) -> list[dict[str, object]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        return payload.get("findings", [])
    return []


def sort_findings(findings: list[dict[str, object]]) -> list[dict[str, object]]:
    return sorted(
        findings,
        key=lambda item: (
            ORDER.get(item.get("severity", "Unverified"), 99),
            item.get("finding_id", ""),
        ),
    )


def main() -> None:
    findings = normalize_findings(json.load(sys.stdin))
    print(json.dumps(sort_findings(findings), indent=2))


if __name__ == "__main__":
    main()
