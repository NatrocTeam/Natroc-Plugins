#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path.cwd()

DEPENDENCY_SIGNALS = [
    ("react", "React", "frameworks"),
    ("next", "Next.js", "frameworks"),
    ("vue", "Vue", "frameworks"),
    ("nuxt", "Nuxt", "frameworks"),
    ("svelte", "Svelte", "frameworks"),
    ("@angular/core", "Angular", "frameworks"),
    ("express", "Express", "frameworks"),
    ("fastify", "Fastify", "frameworks"),
    ("@nestjs/core", "NestJS", "frameworks"),
    ("hono", "Hono", "frameworks"),
    ("prisma", "Prisma", "database_orm"),
    ("drizzle-orm", "Drizzle ORM", "database_orm"),
    ("jest", "Jest", "testing"),
    ("vitest", "Vitest", "testing"),
    ("playwright", "Playwright", "testing"),
    ("cypress", "Cypress", "testing"),
]


def discover_files(root: Path) -> dict[str, Path]:
    return {
        str(path.relative_to(root)): path
        for path in root.rglob("*")
        if path.is_file() and ".git" not in path.parts and len(path.parts) < 8
    }


def empty_signals() -> dict[str, object]:
    return {
        "package_manager": None,
        "languages": [],
        "frameworks": [],
        "database_orm": [],
        "testing": [],
        "deployment": [],
        "evidence_files": [],
    }


def append_if_present(signals: dict[str, object], key: str, value: str) -> None:
    signals[key].append(value)


def detect_package_manager(files: dict[str, Path], signals: dict[str, object]) -> None:
    for lockfile, manager in [
        ("pnpm-lock.yaml", "pnpm"),
        ("yarn.lock", "yarn"),
        ("package-lock.json", "npm"),
    ]:
        if lockfile in files:
            signals["package_manager"] = manager
            signals["evidence_files"].append(lockfile)
            return


def detect_package_json(files: dict[str, Path], signals: dict[str, object]) -> None:
    if "package.json" not in files:
        return

    signals["languages"].append("JavaScript/TypeScript")
    signals["evidence_files"].append("package.json")
    try:
        package_json = json.loads(files["package.json"].read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return

    deps = {
        **package_json.get("dependencies", {}),
        **package_json.get("devDependencies", {}),
    }
    for dependency, label, target in DEPENDENCY_SIGNALS:
        if dependency in deps:
            append_if_present(signals, target, label)


def detect_other_files(files: dict[str, Path], signals: dict[str, object]) -> None:
    if "pyproject.toml" in files or "requirements.txt" in files:
        signals["languages"].append("Python")
        signals["evidence_files"].extend(
            item for item in ["pyproject.toml", "requirements.txt"] if item in files
        )

    single_file_signals = [
        ("go.mod", "languages", "Go"),
        ("Cargo.toml", "languages", "Rust"),
        ("Dockerfile", "deployment", "Docker"),
        ("prisma/schema.prisma", "database_orm", "Prisma"),
    ]
    for filename, target, label in single_file_signals:
        if filename in files:
            signals[target].append(label)
            signals["evidence_files"].append(filename)

    if "docker-compose.yml" in files or "compose.yml" in files:
        signals["deployment"].append("Docker Compose")


def main() -> None:
    files = discover_files(ROOT)
    signals = empty_signals()
    detect_package_manager(files, signals)
    detect_package_json(files, signals)
    detect_other_files(files, signals)
    print(json.dumps(signals, indent=2))


if __name__ == "__main__":
    main()
