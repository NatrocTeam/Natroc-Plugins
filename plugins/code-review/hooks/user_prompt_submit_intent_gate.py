#!/usr/bin/env python3
from __future__ import annotations

from _common import (
    classify_intent,
    emit,
    find_text,
    has_secret,
    load_state,
    output_context,
    read_event,
    save_state,
)

MESSAGES = {
    "apply-fix": (
        "Code-review mode detected: apply-fix. Before editing files, map every "
        "change to finding IDs, create a fix plan, keep patches minimal, run "
        "verification, and produce a Fix Report."
    ),
    "suggest-fix": (
        "Code-review mode detected: suggest-fix. Do not edit files. Produce fix "
        "plans or patch proposals mapped to finding IDs, then ask for explicit "
        "approval before applying changes."
    ),
    "review-only": (
        "Code-review mode detected: review-only. Do not edit files. Produce a "
        "Review Report first, then ask whether the user wants to fix all "
        "findings, selected finding IDs, or defer fixes."
    ),
    "unknown": (
        "Code-review policy loaded. If this becomes a review task, audit first "
        "and never apply fixes without explicit user approval."
    ),
}


def update_state(intent: str) -> None:
    state = load_state()
    state["last_prompt_intent"] = intent
    if intent in {"review-only", "suggest-fix", "apply-fix"}:
        state["mode"] = intent
    if intent == "apply-fix":
        # User memberi instruksi terapkan-perbaikan -> izinkan edit (gate dilepas).
        state["fix_approved"] = True
    else:
        state["fix_approved"] = False
        state["approved_findings"] = []
    save_state(state)


def main() -> None:
    event = read_event()
    prompt = find_text(event, ["prompt", "userPrompt", "message"])
    intent = classify_intent(prompt)
    update_state(intent)

    if has_secret(prompt):
        emit(
            {
                "decision": "block",
                "reason": (
                    "The prompt appears to include a secret or private key. "
                    "Redact it before running code-review."
                ),
            }
        )
        return

    emit(output_context(MESSAGES.get(intent, MESSAGES["unknown"]), "UserPromptSubmit"))


if __name__ == "__main__":
    main()
