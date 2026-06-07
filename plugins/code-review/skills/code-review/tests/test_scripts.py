from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"


def run_script(name: str, input_text: str = "", *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPTS / name), *args],
        input=input_text,
        text=True,
        capture_output=True,
        check=False,
    )


def test_classify_findings_orders_by_severity() -> None:
    payload = {
        "findings": [
            {"finding_id": "low", "severity": "Low"},
            {"finding_id": "critical", "severity": "Critical"},
        ]
    }

    result = run_script("classify_findings.py", json.dumps(payload))

    assert result.returncode == 0
    findings = json.loads(result.stdout)
    assert [item["finding_id"] for item in findings] == ["critical", "low"]


def test_patch_scope_checker_flags_out_of_scope_files() -> None:
    patch = "\n".join(
        [
            "+++ b/src/allowed.py",
            "+++ b/other/file.py",
        ]
    )

    result = run_script("patch_scope_checker.py", patch, "--allowed", "src/")

    assert result.returncode == 1
    payload = json.loads(result.stdout)
    assert payload["outside_allowed_scope"] == ["other/file.py"]


def test_redact_secrets_masks_common_secret_shapes() -> None:
    result = run_script("redact_secrets.py", "api_key = 'abcdefghijklmnop'\n")

    assert result.returncode == 0
    assert "[REDACTED_SECRET]" in result.stdout
    assert "abcdefghijklmnop" not in result.stdout


def test_validate_review_report_requires_fix_decision() -> None:
    report = "\n".join(
        [
            "# Code Review Report",
            "## Verdict",
            "## Review Mode",
            "## Stack Detected",
            "## Evidence Policy",
            "## Findings",
        ]
    )

    result = run_script("validate_review_report.py", report)

    assert result.returncode == 1
    payload = json.loads(result.stdout)
    assert payload["missing_fix_question"] is True


if __name__ == "__main__":
    test_classify_findings_orders_by_severity()
    test_patch_scope_checker_flags_out_of_scope_files()
    test_redact_secrets_masks_common_secret_shapes()
    test_validate_review_report_requires_fix_decision()
