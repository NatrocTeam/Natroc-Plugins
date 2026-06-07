#!/usr/bin/env python3
from __future__ import annotations

import re
import sys

SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_\-]{16,}"),
    re.compile(r"sk-proj-[A-Za-z0-9_\-]{16,}"),
    re.compile(r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*[\'\"]?[^\s\'\"]{12,}"),
    re.compile(
        r"-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----.*?"
        r"-----END (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----",
        re.S,
    ),
]


def redact(text: str) -> str:
    for pattern in SECRET_PATTERNS:
        text = pattern.sub("[REDACTED_SECRET]", text)
    return text


def main() -> None:
    print(redact(sys.stdin.read()), end="")


if __name__ == "__main__":
    main()
