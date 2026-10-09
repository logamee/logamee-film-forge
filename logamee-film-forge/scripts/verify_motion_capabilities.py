#!/usr/bin/env python3
"""Verify that the public motion capability manifest has real runtime files."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def as_list(value: object) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list) and all(isinstance(item, str) for item in value):
        return value
    raise TypeError(f"expected a path string or list of path strings, got {value!r}")


def main() -> int:
    script = Path(__file__).resolve()
    skill_root = script.parents[1]
    runtime_root = skill_root / "resources" / "motion-runtime"
    manifest_path = runtime_root / "motion-capabilities.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    errors: list[str] = []

    styles = manifest.get("materialRecipes", [])
    grammars = manifest.get("animationGrammars", [])
    clips = manifest.get("parameterizedClips", [])
    if len(styles) != 35:
        errors.append(f"expected 35 material recipes, found {len(styles)}")
    if len(grammars) != 9:
        errors.append(f"expected 9 animation grammars, found {len(grammars)}")
    if len(clips) != 8:
        errors.append(f"expected 8 parameterized clips, found {len(clips)}")

    for category, records in (
        ("material recipe", styles),
        ("animation grammar", grammars),
    ):
        ids = [record.get("id") for record in records]
        if len(ids) != len(set(ids)):
            errors.append(f"{category} IDs are not unique")
        for record in records:
            for reference in as_list(record.get("runtime")):
                if not (runtime_root / reference).exists():
                    errors.append(f"{category} {record.get('id')}: missing {reference}")
            demo = record.get("demo")
            if demo and not (runtime_root / demo).exists():
                errors.append(f"{category} {record.get('id')}: missing demo {demo}")

    for reference in clips:
        if not (runtime_root / reference).exists():
            errors.append(f"parameterized clip missing {reference}")

    for pattern in manifest.get("compositionPatterns", []):
        for reference in as_list(pattern.get("runtime")):
            candidate = (
                runtime_root / reference
                if not reference.startswith("../")
                else skill_root / reference.removeprefix("../")
            )
            if not candidate.exists():
                errors.append(f"composition pattern {pattern.get('id')}: missing {reference}")

    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors), file=sys.stderr)
        return 1

    print(json.dumps({
        "result": "passed",
        "materialRecipes": len(styles),
        "animationGrammars": len(grammars),
        "parameterizedClips": len(clips),
        "assetRoutes": len(manifest.get("assetRoutes", [])),
        "transitionFamilies": len(manifest.get("transitionFamilies", [])),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
