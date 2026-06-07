#!/usr/bin/env python3
from __future__ import annotations

from _common import (
    DESTRUCTIVE_COMMAND_PATTERNS,
    SENSITIVE_EDIT_PATTERNS,
    command_from_event,
    emit,
    file_paths_from_event,
    load_state,
    matches_any,
    read_event,
    save_state,
    tool_name,
)

EDIT_TOOLS = {"apply_patch", "Edit", "Write"}
DEPENDENCY_COMMAND_PATTERNS = [
    r"\b(npm|pnpm|yarn)\s+(install|add)\b",
    r"\bpip\s+install\b",
    r"\bpoetry\s+add\b",
    r"\bgo\s+get\b",
    r"\bcargo\s+add\b",
]


def is_dependency_change(command: str) -> bool:
    return matches_any(command, DEPENDENCY_COMMAND_PATTERNS)


def touches_sensitive_path(paths: list[str]) -> bool:
    return any(matches_any(path, SENSITIVE_EDIT_PATTERNS) for path in paths)


def denial_reason(
    tool: str,
    command: str,
    paths: list[str],
    fix_approved: bool,
) -> str | None:
    if tool in EDIT_TOOLS and not fix_approved:
        return (
            "Blocked: file edits are not allowed before explicit fix approval. "
            "Produce a review report and ask the user first."
        )
    if matches_any(command, DESTRUCTIVE_COMMAND_PATTERNS):
        return (
            "Blocked: destructive command is not allowed during code-review "
            "without explicit, scoped user approval."
        )
    if tool == "Bash" and is_dependency_change(command) and not fix_approved:
        return (
            "Blocked: dependency installation/addition requires explicit fix "
            "approval and a documented fix plan."
        )
    if paths and touches_sensitive_path(paths) and tool in EDIT_TOOLS and not fix_approved:
        return (
            "Blocked: attempted edit touches generated, dependency, environment, "
            "or secret-sensitive files before approval."
        )
    return None


def emit_denial(tool: str, reason: str, state: dict[str, object]) -> None:
    state["last_denied_tool"] = {"tool": tool, "reason": reason}
    save_state(state)
    emit(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        }
    )


def emit_allow() -> None:
    emit(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "additionalContext": (
                    "Tool use allowed by code-review policy. Keep actions scoped, "
                    "evidence-based, and mapped to review/fix intent."
                ),
            }
        }
    )


def main() -> None:
    event = read_event()
    state = load_state()
    tool = tool_name(event)
    command = command_from_event(event)
    paths = file_paths_from_event(event)
    reason = denial_reason(tool, command, paths, bool(state.get("fix_approved")))

    if reason:
        emit_denial(tool, reason, state)
    else:
        emit_allow()


if __name__ == "__main__":
    main()
