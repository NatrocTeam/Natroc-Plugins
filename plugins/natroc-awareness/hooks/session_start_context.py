#!/usr/bin/env python3
"""Inject compact Natroc plugin routing context at session start."""

from __future__ import annotations

import json
import os
from pathlib import Path

MAX_PLUGINS = 40
MAX_SKILLS_PER_PLUGIN = 6
MAX_KEYWORDS_PER_PLUGIN = 6


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def plugin_root() -> Path:
    env_root = os.environ.get("CLAUDE_PLUGIN_ROOT") or os.environ.get(
        "CODEX_PLUGIN_ROOT",
    )
    if env_root:
        return Path(env_root).resolve()

    return Path(__file__).resolve().parents[1]


def plugin_manifests(plugin_dir: Path) -> list[dict]:
    manifests = []
    for relative_path in (
        ".codex-plugin/plugin.json",
        ".claude-plugin/plugin.json",
    ):
        manifest = load_json(plugin_dir / relative_path)
        if manifest.get("name"):
            manifests.append(manifest)

    return manifests


def manifest_for(plugin_dir: Path) -> dict:
    merged: dict = {}

    for manifest in reversed(plugin_manifests(plugin_dir)):
        merged.update({key: value for key, value in manifest.items() if value})

        if isinstance(manifest.get("interface"), dict):
            interface = merged.get("interface", {})
            interface.update(manifest["interface"])
            merged["interface"] = interface

    if merged.get("name"):
        return merged

    return {}


def is_plugin_dir(path: Path) -> bool:
    return bool(manifest_for(path))


def bounded_children(path: Path) -> list[Path]:
    try:
        children = [child for child in path.iterdir() if child.is_dir()]
    except OSError:
        return []

    return sorted(children, key=lambda item: item.name.lower())[:200]


def discover_plugin_dirs(root: Path) -> list[Path]:
    containers = [
        root,
        root.parent,
        root.parent.parent,
    ]

    discovered: dict[str, Path] = {}

    for container in containers:
        for child in bounded_children(container):
            if child.name.startswith("."):
                continue

            if is_plugin_dir(child):
                name = manifest_for(child).get("name")
                if name:
                    discovered.setdefault(name, child)
                continue

            for grandchild in bounded_children(child):
                if is_plugin_dir(grandchild):
                    name = manifest_for(grandchild).get("name")
                    if name:
                        discovered.setdefault(name, grandchild)

    if is_plugin_dir(root):
        name = manifest_for(root).get("name")
        if name:
            discovered.setdefault(name, root)

    return list(discovered.values())[:MAX_PLUGINS]


def marketplace_root(marketplace_path: Path) -> Path:
    normalized = marketplace_path.as_posix()

    if normalized.endswith("/.claude-plugin/marketplace.json"):
        return marketplace_path.parent.parent

    if normalized.endswith("/.agents/plugins/marketplace.json"):
        return marketplace_path.parent.parent.parent

    return marketplace_path.parent


def discover_marketplace_paths(root: Path) -> list[Path]:
    candidates: list[Path] = []

    for base in (root, root.parent, root.parent.parent, root.parent.parent.parent):
        candidates.append(base / ".claude-plugin" / "marketplace.json")
        candidates.append(base / ".agents" / "plugins" / "marketplace.json")

    seen: set[Path] = set()
    paths: list[Path] = []

    for candidate in candidates:
        try:
            resolved = candidate.resolve()
        except OSError:
            continue

        if resolved in seen or not resolved.is_file():
            continue

        seen.add(resolved)
        paths.append(resolved)

    return paths


def source_path_for(entry: dict) -> str:
    source = entry.get("source")

    if isinstance(source, str):
        return source

    if isinstance(source, dict) and source.get("source") == "local":
        path_value = source.get("path")
        if isinstance(path_value, str):
            return path_value

    return ""


def marketplace_entries(root: Path) -> dict[str, dict]:
    entries_by_name: dict[str, dict] = {}

    for marketplace_path in discover_marketplace_paths(root):
        data = load_json(marketplace_path)
        plugins = data.get("plugins", [])
        if not isinstance(plugins, list):
            continue

        base = marketplace_root(marketplace_path)

        for entry in plugins:
            if not isinstance(entry, dict) or not isinstance(entry.get("name"), str):
                continue

            name = entry["name"]
            source_path = source_path_for(entry)
            plugin_dir = (base / source_path).resolve() if source_path else None

            entries_by_name.setdefault(
                name,
                {
                    "name": name,
                    "description": entry.get("description", ""),
                    "category": entry.get("category", ""),
                    "version": entry.get("version", ""),
                    "source": source_path,
                    "pluginDir": plugin_dir,
                },
            )

    return entries_by_name


def skill_dir_names(plugin_dir: Path) -> list[str]:
    skills_dir = plugin_dir / "skills"
    if not skills_dir.is_dir():
        return []

    names = []
    for child in bounded_children(skills_dir):
        if (child / "SKILL.md").is_file():
            names.append(child.name)

    return names[:MAX_SKILLS_PER_PLUGIN]


def list_values(value: object, limit: int) -> list[str]:
    if not isinstance(value, list):
        return []

    return [str(item) for item in value if item][:limit]


def best_description(manifest: dict, marketplace_entry: dict) -> str:
    interface = manifest.get("interface", {})

    for value in (
        interface.get("shortDescription") if isinstance(interface, dict) else "",
        manifest.get("description"),
        marketplace_entry.get("description"),
    ):
        if isinstance(value, str) and value.strip():
            return value.strip()

    return "No description found in plugin metadata."


def compact_plugin_line(
    name: str,
    manifest: dict,
    marketplace_entry: dict,
    plugin_dir: Path | None,
) -> str:
    route = best_description(manifest, marketplace_entry)
    skills = skill_dir_names(plugin_dir) if plugin_dir else []
    keywords = list_values(manifest.get("keywords"), MAX_KEYWORDS_PER_PLUGIN)

    parts = [f"- {name}: {route}"]

    if skills:
        parts.append(f"Skills: {', '.join(skills)}.")

    if keywords:
        parts.append(f"Keywords: {', '.join(keywords)}.")

    return " ".join(part for part in parts if part).strip()


def build_context(root: Path) -> str:
    plugin_dirs = discover_plugin_dirs(root)
    marketplace = marketplace_entries(root)

    detected: dict[str, dict] = {}
    detected_dirs: dict[str, Path] = {}

    for plugin_dir in plugin_dirs:
        manifest = manifest_for(plugin_dir)
        name = manifest.get("name")
        if not isinstance(name, str):
            continue
        detected[name] = manifest
        detected_dirs[name] = plugin_dir

    detected_names = sorted(detected)
    marketplace_names = sorted(marketplace)

    if detected_names:
        inventory_label = "Detected installed Natroc plugins near this plugin root"
        inventory_names = detected_names
    else:
        inventory_label = "No sibling Natroc plugin installs were detected. Natroc marketplace entries found nearby"
        inventory_names = marketplace_names

    route_names = detected_names or marketplace_names
    route_lines = []

    for name in route_names[:MAX_PLUGINS]:
        manifest = detected.get(name, {})
        entry = marketplace.get(name, {})
        plugin_dir = detected_dirs.get(name)

        if plugin_dir is None:
            entry_dir = entry.get("pluginDir")
            plugin_dir = entry_dir if isinstance(entry_dir, Path) and entry_dir.is_dir() else None
            if plugin_dir:
                manifest = manifest_for(plugin_dir)

        route_lines.append(compact_plugin_line(name, manifest, entry, plugin_dir))

    context_parts = [
        "You have Natroc Plugin Awareness.",
        f"{inventory_label}: {', '.join(inventory_names[:MAX_PLUGINS]) or 'none'}.",
        "This context is generated dynamically from nearby marketplace files, plugin manifests, and skill folder names.",
        "Use this as routing context only. Do not load every plugin file at startup.",
        "Before answering or editing, match the user's task to a detected Natroc plugin and invoke the relevant skill or tool when available.",
        "If a plugin appears only in marketplace metadata, describe it as available in the nearby Natroc marketplace, not confirmed installed.",
    ]

    if route_lines:
        context_parts.append("Dynamic routing summary:\n" + "\n".join(route_lines))

    context_parts.append(
        "For detailed routing, use the using-natroc-plugins skill or inspect only the matching plugin README, manifest, and skill files.",
    )

    return "\n\n".join(context_parts)


def emit_context(message: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "SessionStart",
                    "additionalContext": message,
                },
            },
            ensure_ascii=True,
        ),
    )


def main() -> None:
    try:
        root = plugin_root()
        emit_context(build_context(root))
    except Exception as error:  # noqa: BLE001 - hook must never break session start
        emit_context(
            "Natroc Plugin Awareness is installed, but the plugin inventory scan failed. "
            f"Use installed plugin manifests on demand. Error: {error}",
        )


if __name__ == "__main__":
    main()
