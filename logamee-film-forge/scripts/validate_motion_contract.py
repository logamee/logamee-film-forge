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
from urllib.parse import urlparse, unquote


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


def local_script_files(root: Path, html: str) -> list[Path]:
    """Resolve local <script src> files, including project symlinks."""
    files: list[Path] = []
    for source in re.findall(r"<script\b[^>]*\bsrc=['\"]([^'\"]+)['\"]", html, re.I):
        parsed = urlparse(source)
        if parsed.scheme or parsed.netloc:
            continue
        relative = unquote(parsed.path).lstrip("/")
        if ".." in Path(relative).parts:
            continue
        candidate = root / relative
        if candidate.is_file():
            files.append(candidate)
    return files


def registered_unit_ids(code: str) -> list[str]:
    """Read IDs from the ERAS registry, not from cue references."""
    match = re.search(
        r"window\.ERAS\s*=\s*\[(.*?)(?:\n\];|\n\];?)",
        code,
        re.S,
    )
    if not match:
        return []
    return re.findall(
        r"^\s*unitId\s*:\s*['\"]([^'\"]+)['\"]",
        match.group(1),
        re.M,
    )


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

    html = read(root / "motion.html")
    project_code_files = sorted(
        path for path in (root / "motion-code").rglob("*")
        if path.is_file() and path.suffix in {".js", ".mjs", ".ts"}
    ) if (root / "motion-code").is_dir() else []
    script_files = local_script_files(root, html)
    code_files = sorted(set(project_code_files + script_files))
    code = "\n".join([html, *[read(path) for path in code_files]])
    for api in REQUIRED_APIS:
        if not re.search(rf"\b{re.escape(api)}\b", code):
            errors.append(f"motion runtime API is missing: {api}")

    if "<canvas" not in html and "<svg" not in html:
        errors.append("motion.html has no Canvas or SVG render surface")
    if "motion-code" not in html:
        warnings.append("motion.html does not visibly load motion-code files; verify its loader")

    unit_ids = registered_unit_ids(code)
    duplicates = sorted({item for item in unit_ids if unit_ids.count(item) > 1})
    if duplicates:
        warnings.append(f"duplicate registered motion-unit IDs found: {', '.join(duplicates)}")

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
            "runtimeFiles": [
                str(path.relative_to(root))
                for path in code_files
                if path.is_relative_to(root.resolve())
            ],
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
