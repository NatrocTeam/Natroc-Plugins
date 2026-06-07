#!/usr/bin/env python3
from __future__ import annotations

from _common import (
    VERIFY_FAILURE_PATTERNS,
    command_from_event,
    emit,
    find_text,
    has_secret,
    load_state,
    matches_any,
    read_event,
    redact,
    save_state,
    tool_name,
)


def exit_failed(event: dict[str, object]) -> bool:
    exit_code = str(event.get("exit_code") or event.get("exitCode") or "0")
    return exit_code not in {"0", "None", ""}


def result_failed(event: dict[str, object], text: str) -> bool:
    return matches_any(text, VERIFY_FAILURE_PATTERNS) or exit_failed(event)


def record_verification(
    state: dict[str, object],
    tool: str,
    command: str,
    text: str,
    failed: bool,
) -> None:
    verification = state.setdefault(
        "last_verification",
        {"commands": [], "failed": []},
    )
    if tool == "Bash" and command:
        verification["commands"].append(command[:500])
    if failed:
        verification["failed"].append(
            {
                "tool": tool,
                "command": command[:500],
                "summary": redact(text[:1200]),
            }
        )


def result_message(text: str, failed: bool) -> str:
    if has_secret(text):
        return (
            "The last tool output appears to contain a secret. Redact it in any "
            "user-visible report and do not repeat it verbatim."
        )
    if failed:
        return (
            "The last tool result appears to have failed. Do not claim verification "
            "PASS. Include the failed command/result in the Fix Report."
        )
    return (
        "Tool result recorded. If this was verification, include the command and "
        "result in the final report."
    )


def main() -> None:
    event = read_event()
    state = load_state()
    tool = tool_name(event)
    command = command_from_event(event)
    text = find_text(event)
    failed = result_failed(event, text)

    record_verification(state, tool, command, text, failed)
    save_state(state)
    emit(
        {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": result_message(text, failed),
            }
        }
    )


if __name__ == "__main__":
    main()
