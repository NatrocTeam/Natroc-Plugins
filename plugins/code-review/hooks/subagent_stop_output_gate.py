#!/usr/bin/env python3
from __future__ import annotations

from _common import emit, find_text, read_event

REQUIRED_TERMS = ["severity", "evidence", "docs", "impact", "fix"]
SECURITY_TERMS = [
    "xss",
    "csrf",
    "injection",
    "auth",
    "authorization",
    "access control",
    "secret",
    "ssrf",
]


def missing_required_terms(text: str) -> list[str]:
    lowered = text.lower()
    return [term for term in REQUIRED_TERMS if term not in lowered]


def has_security_claim(text: str) -> bool:
    lowered = text.lower()
    return any(term in lowered for term in SECURITY_TERMS)


def has_attack_path(text: str) -> bool:
    lowered = text.lower()
    return "attack" in lowered or "abuse" in lowered


def block(reason: str) -> None:
    emit({"decision": "block", "reason": reason})


def main() -> None:
    text = find_text(read_event())
    missing = missing_required_terms(text)

    if missing:
        block(
            "Run one more focused pass. The subagent output is missing required "
            f"evidence-policy terms: {', '.join(missing)}. Add evidence or move "
            "claims to Unverified."
        )
        return

    if has_security_claim(text) and not has_attack_path(text):
        block(
            "Run one more focused pass. Security-related findings must include "
            "an attack path or abuse case, or be downgraded to Unverified."
        )
        return

    emit(
        {
            "hookSpecificOutput": {
                "hookEventName": "SubagentStop",
                "additionalContext": (
                    "Subagent output passed the basic code-review evidence gate."
                ),
            }
        }
    )


if __name__ == "__main__":
    main()
