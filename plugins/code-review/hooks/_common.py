from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

DEFAULT_STATE: Dict[str, Any] = {
    "mode": "review-only",
    "fix_approved": False,
    "approved_findings": [],
    "review_report_generated": False,
    "last_verification": {"commands": [], "failed": []},
    "last_denied_tool": None,
    "last_prompt_intent": None,
}

SECRET_PATTERNS = [
    re.compile(r"sk-proj-[A-Za-z0-9_\-]{16,}"),
    re.compile(r"sk-[A-Za-z0-9_\-]{16,}"),
    re.compile(
        r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?[^\s'\"]{12,}"
    ),
    re.compile(r"-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
]

DESTRUCTIVE_COMMAND_PATTERNS = [
    r"\brm\s+-rf\b",
    r"\bgit\s+reset\s+--hard\b",
    r"\bgit\s+clean\s+-fdx\b",
    r"\bgit\s+push\s+--force\b",
    r"\bgit\s+push\s+--force-with-lease\b",
    r"\bgit\s+checkout\s+--\s+\.\b",
    r"\bgit\s+restore\s+\.\b",
    r"\bnpm\s+publish\b",
    r"\bpnpm\s+publish\b",
    r"\byarn\s+publish\b",
    r"\bdocker\s+system\s+prune\b",
    r"\bdocker\s+volume\s+rm\b",
    r"\bsudo\s+rm\b",
    r"\bchmod\s+-R\s+777\b",
    r"\b(curl|wget)\b.*\|\s*(sh|bash)\b",
]

SENSITIVE_EDIT_PATTERNS = [
    r"(^|/)node_modules/",
    r"(^|/)dist/",
    r"(^|/)build/",
    r"(^|/)coverage/",
    r"(^|/)\.next/",
    r"(^|/)\.nuxt/",
    r"(^|/)\.svelte-kit/",
    r"(^|/)vendor/",
    r"(^|/)generated/",
    r"(^|/)\.env(\..*)?$",
    r"\.(pem|key|crt|p12|pfx)$",
]

VERIFY_FAILURE_PATTERNS = [
    r"(?i)\bfailed\b",
    r"(?i)\berror\b",
    r"(?i)\bexception\b",
    r"(?i)test(s)? failed",
    r"(?i)type error",
    r"(?i)lint error",
    r"(?i)build failed",
    r"(?i)vulnerabilit(y|ies)",
]


def read_event() -> Dict[str, Any]:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {"_raw": raw}
    return data if isinstance(data, dict) else {"value": data}


def emit(obj: Dict[str, Any]) -> None:
    print(json.dumps(obj, indent=2))


def plugin_data_dir() -> Path:
    base = (
        os.environ.get("PLUGIN_DATA")
        or os.environ.get("CLAUDE_PLUGIN_DATA")
        or str(Path.home() / ".code-review-plugin-data")
    )
    path = Path(base)
    path.mkdir(parents=True, exist_ok=True)
    return path


def state_path() -> Path:
    return plugin_data_dir() / "code-review-state.json"


def load_state() -> Dict[str, Any]:
    path = state_path()
    if not path.exists():
        state = DEFAULT_STATE.copy()
        save_state(state)
        return state
    try:
        loaded = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        loaded = {}
    state = DEFAULT_STATE.copy()
    if isinstance(loaded, dict):
        state.update(loaded)
    return state


def save_state(state: Dict[str, Any]) -> None:
    state_path().write_text(
        json.dumps(state, indent=2, sort_keys=True),
        encoding="utf-8",
    )


def has_secret(text: str) -> bool:
    return any(pattern.search(text or "") for pattern in SECRET_PATTERNS)


def redact(text: str) -> str:
    value = text or ""
    for pattern in SECRET_PATTERNS:
        value = pattern.sub("[REDACTED_SECRET]", value)
    return value


def find_text(obj: Any, keys: List[str] | None = None) -> str:
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        if keys:
            for key in keys:
                value = obj.get(key)
                if isinstance(value, str):
                    return value
        return "\n".join(
            find_text(value)
            for value in obj.values()
            if isinstance(value, (str, dict, list))
        )
    if isinstance(obj, list):
        return "\n".join(find_text(item) for item in obj)
    return ""


def tool_name(event: Dict[str, Any]) -> str:
    return str(
        event.get("tool_name")
        or event.get("toolName")
        or event.get("tool")
        or ""
    )


def command_from_event(event: Dict[str, Any]) -> str:
    tool_input = event.get("tool_input") or event.get("toolInput") or event.get("input") or event
    if isinstance(tool_input, dict):
        return str(
            tool_input.get("command")
            or tool_input.get("cmd")
            or tool_input.get("script")
            or find_text(tool_input, ["command", "cmd"])
        )
    return str(tool_input)


def file_paths_from_event(event: Dict[str, Any]) -> List[str]:
    text = find_text(event)
    paths: List[str] = []
    extensions = (
        "ts|tsx|js|jsx|py|go|rs|java|php|rb|cs|json|yaml|yml|toml|env|lock|"
        "md|sql|prisma|vue|svelte|astro|css|scss|html|pem|key|crt|p12|pfx"
    )
    pattern = rf"(?:^|\s)([\w./\\-]+\.({extensions}))"
    for match in re.finditer(pattern, text):
        paths.append(match.group(1).strip())
    return list(dict.fromkeys(paths))[:50]


def matches_any(text: str, patterns: List[str]) -> bool:
    return any(
        re.search(pattern, text or "", flags=re.IGNORECASE | re.MULTILINE)
        for pattern in patterns
    )


def classify_intent(prompt: str) -> str:
    lowered = (prompt or "").lower()
    apply_terms = [
        "apply patch",
        "apply fix",
        "apply fixes",
        "apply the fix",
        "fix all",
        "fix selected",
        "fix finding",
        "fix findings",
    ]
    suggest_terms = [
        "suggest fix",
        "fix plan",
        "provide a solution",
        "how to fix",
        "do not change files",
        "patch proposal",
    ]
    review_terms = [
        "review",
        "audit",
        "check code",
        "code-review",
        "security gate",
        "release gate",
        "strict mode",
        "production-ready",
    ]
    if any(term in lowered for term in apply_terms):
        return "apply-fix"
    if any(term in lowered for term in suggest_terms):
        return "suggest-fix"
    if any(term in lowered for term in review_terms):
        return "review-only"
    return "unknown"


def output_context(message: str, event: str) -> Dict[str, Any]:
    return {"hookSpecificOutput": {"hookEventName": event, "additionalContext": message}}
