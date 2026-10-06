#!/usr/bin/env python3
"""Validate the file-level contract of a Film Forge motion project.

This is a lightweight structural check. It does not replace browser rendering,
collision inspection, or final media QA.

    python validate_motion_contract.py --project /path/to/motion-project
    python validate_motion_contract.py --project /path/to/motion-project --out report.json
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


REQUIRED_FILES = (
    "project-config.md",
    "environment-check.md",
    "storyboard.md",
    "motion-logic.md",
    "motion.html",
)

REQUIRED_DIRS = ("motion-specs", "motion-code")
REQUIRED_APIS = (
    "getMotionRenderUnits",
    "prepareMotionUnit",
    "seekMotionUnit",
    "seekMotion",
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--project", required=True)
    parser.add_argument("--out")
    args = parser.parse_args()

    root = Path(args.project).expanduser().resolve()
    errors: list[str] = []
    warnings: list[str] = []

    if not root.is_dir():
        errors.append(f"project directory does not exist: {root}")
    config = read(root / "project-config.md")
    if config and not re.search(r"Production Format:\s*`?motion`?\b", config, re.I):
        errors.append("project-config.md does not declare Production Format: motion")

    for name in REQUIRED_FILES:
        if not (root / name).is_file():
            errors.append(f"missing required file: {name}")
    for name in REQUIRED_DIRS:
        directory = root / name
        if not directory.is_dir():
            errors.append(f"missing required directory: {name}/")
        elif not any(directory.iterdir()):
            errors.append(f"required directory is empty: {name}/")

    code_files = sorted(
        path for path in (root / "motion-code").rglob("*")
        if path.is_file() and path.suffix in {".js", ".mjs", ".ts"}
    ) if (root / "motion-code").is_dir() else []
    code = "\n".join(read(path) for path in code_files)
    for api in REQUIRED_APIS:
        if not re.search(rf"\b{re.escape(api)}\b", code):
            errors.append(f"motion runtime API is missing: {api}")

    html = read(root / "motion.html")
    if "<canvas" not in html and "<svg" not in html:
        errors.append("motion.html has no Canvas or SVG render surface")
    if "motion-code" not in html:
        warnings.append("motion.html does not visibly load motion-code files; verify its loader")

    unit_ids = re.findall(r"\b(?:unitId|id)\s*:\s*['\"]([^'\"]+)['\"]", code)
    duplicates = sorted({item for item in unit_ids if unit_ids.count(item) > 1})
    if duplicates:
        warnings.append(f"duplicate code-level unit IDs found: {', '.join(duplicates)}")

    specs = sorted((root / "motion-specs").glob("*")) if (root / "motion-specs").is_dir() else []
    if not specs:
        errors.append("motion-specs/ has no frozen unit specifications")

    report = {
        "project": str(root),
        "format": "motion",
        "status": "failed" if errors else "passed",
        "errors": errors,
        "warnings": warnings,
        "checked": {
            "requiredFiles": list(REQUIRED_FILES),
            "requiredDirectories": list(REQUIRED_DIRS),
            "runtimeFiles": [str(path.relative_to(root)) for path in code_files],
            "unitSpecCount": len(specs),
            "apis": list(REQUIRED_APIS),
        },
    }
    rendered = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        output = Path(args.out).expanduser().resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
