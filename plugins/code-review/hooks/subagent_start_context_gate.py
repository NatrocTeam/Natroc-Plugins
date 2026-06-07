#!/usr/bin/env python3
from __future__ import annotations

from _common import emit, find_text, read_event

BASE_POLICY = (
    "Code-review subagent policy: use evidence-first findings. Required fields: "
    "finding_id, severity, category, file, evidence, docs_basis, impact, "
    "suggested_fix, confidence. No evidence means Unverified. No docs means no "
    "hard framework claim. "
)

CONTEXT_BY_AGENT = [
    (
        "security",
        "For security findings, include attack_path, affected_boundary, abuse_case, "
        "and cite OWASP or official framework security docs when possible.",
    ),
    (
        "frontend",
        "Check framework conventions, rendering correctness, state, data fetching, "
        "forms, accessibility, XSS risk, and client-side secret exposure.",
    ),
    (
        "backend",
        "Check auth, authorization, validation, error handling, logging, idempotency, "
        "file upload, API behavior, and business logic.",
    ),
    (
        "database",
        "Check schema constraints, indexes, transaction boundaries, migration safety, "
        "N+1 queries, and data consistency.",
    ),
    (
        "dependency",
        "Check lockfiles, suspicious packages, install scripts, vulnerable/outdated "
        "packages, and supply-chain risks.",
    ),
]
FIX_CONTEXT = (
    "For fixes, produce minimal patches mapped to finding IDs. Do not refactor "
    "unrelated code or suppress failures to make checks pass."
)
DEFAULT_CONTEXT = "Keep output concise, structured, and usable by the orchestrator."


def agent_name(event: dict[str, object]) -> str:
    value = event.get("agent_type") or event.get("agentType")
    return str(value or find_text(event, ["agent_type", "agentType"])).lower()


def context_for_agent(name: str) -> str:
    for marker, context in CONTEXT_BY_AGENT:
        if marker in name:
            return context
    if "fix" in name or "implementer" in name:
        return FIX_CONTEXT
    return DEFAULT_CONTEXT


def main() -> None:
    name = agent_name(read_event())
    emit(
        {
            "hookSpecificOutput": {
                "hookEventName": "SubagentStart",
                "additionalContext": BASE_POLICY + context_for_agent(name),
            }
        }
    )


if __name__ == "__main__":
    main()
