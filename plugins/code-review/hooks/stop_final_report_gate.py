#!/usr/bin/env python3
from __future__ import annotations

from _common import emit, find_text, load_state, read_event, save_state

REPORT_TERMS = ["verdict", "review mode", "stack detected", "evidence", "finding", "fix"]
FIX_DECISION_TERMS = [
    "fix semua",
    "fix selected",
    "selected finding",
    "nanti dulu",
    "defer",
    "fix all",
]


def output(message: str) -> None:
    emit({"hookSpecificOutput": {"hookEventName": "Stop", "additionalContext": message}})


def block(reason: str) -> None:
    emit({"decision": "block", "reason": reason})


def is_review_report(text: str) -> bool:
    return "code review report" in text or "review report" in text


def missing_report_terms(text: str) -> list[str]:
    return [term for term in REPORT_TERMS if term not in text]


def includes_fix_decision(text: str) -> bool:
    return any(term in text for term in FIX_DECISION_TERMS)


def handle_review_report(text: str, state: dict[str, object]) -> None:
    missing = missing_report_terms(text)
    if missing:
        block(
            "Continue the response. The Code Review Report is missing required "
            f"sections/terms: {', '.join(missing)}."
        )
        return

    if not includes_fix_decision(text):
        block(
            "Continue the response. After the review report, ask whether the user "
            "wants to fix all findings, fix selected finding IDs, or defer fixes."
        )
        return

    state["review_report_generated"] = True
    save_state(state)
    output("Final review report passed the basic code-review report gate.")


def handle_fix_report(text: str, state: dict[str, object]) -> None:
    failures = state.get("last_verification", {}).get("failed", [])
    invalid_pass = failures and "pass" in text and "pass with warnings" not in text
    if invalid_pass and "fail" not in text:
        block(
            "Continue the response. Verification recorded failed commands, so the "
            "Fix Report verdict must not be PASS."
        )
        return
    output("Final fix report passed the basic code-review report gate.")


def main() -> None:
    state = load_state()
    message = find_text(
        read_event(),
        ["last_assistant_message", "lastAssistantMessage", "message", "content"],
    ).lower()

    if is_review_report(message):
        handle_review_report(message, state)
    elif "fix report" in message:
        handle_fix_report(message, state)
    else:
        output("No code-review final report detected; no code-review report gate applied.")


if __name__ == "__main__":
    main()
