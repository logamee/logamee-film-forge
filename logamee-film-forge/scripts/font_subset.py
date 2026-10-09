#!/usr/bin/env python3
# /// script
# dependencies = ["fonttools"]
# ///
"""Build a small WOFF subset and report missing glyphs.

Use a project-local font as input. The script never downloads a font and does
not decide which font a project should use:

    uv run font_subset.py --font ./NotoSansSC.ttf --out ./assets/main.woff \
      --scan ./motion-code --text "新增标签"

For a broad reusable Chinese subset, add ``--gb2312``. Font licenses remain
the responsibility of the project and must be recorded beside the font.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


BASE = (
    "0123456789０１２３４５６７８９ ，。、：；！？「」『』《》（）【】·—…～"
    "因果关系条件循环数据代码系统页面动画视频图像文字声音学习课程"
    "风格艺术手绘白板拼贴图表界面故事角色镜头转场字幕"
)
PUNCT = "，。、：；！？「」『』《》（）【】·—–…～“”‘’％＋－×÷→←↑↓▲▼≈±°✓"
STRING_LITERAL = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\]|\\.)*`")


def gb2312_characters() -> set[str]:
    result: set[str] = set()
    for high in range(0xB0, 0xF8):
        for low in range(0xA1, 0xFF):
            try:
                result.add(bytes([high, low]).decode("gb2312"))
            except UnicodeDecodeError:
                continue
    return result


def scan_js(directory: Path) -> set[str]:
    result: set[str] = set()
    for path in directory.rglob("*.js"):
        try:
            source = path.read_text(encoding="utf-8")
        except OSError:
            continue
        source = "\n".join(
            line for line in source.splitlines() if not line.lstrip().startswith("//")
        )
        for literal in STRING_LITERAL.findall(source):
            result.update(character for character in literal if ord(character) > 0x2E7F)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--font", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--scan", action="append", default=[])
    parser.add_argument("--text", default="")
    parser.add_argument("--gb2312", action="store_true")
    args = parser.parse_args()
    source_path = Path(args.font).expanduser().resolve()
    if not source_path.exists():
        raise SystemExit(f"font not found: {source_path}")
    characters = set(BASE) | set(args.text)
    for directory in args.scan:
        characters |= scan_js(Path(directory).expanduser().resolve())
    characters |= set(chr(code) for code in range(0x20, 0x7F))
    if args.gb2312:
        characters |= gb2312_characters() | set(PUNCT)

    font = TTFont(source_path)
    cmap = font.getBestCmap()
    missing = sorted(
        character
        for character in characters
        if not character.isspace() and ord(character) not in cmap
    )
    options = subset.Options()
    options.flavor = "woff"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(text="".join(sorted(characters)))
    subsetter.subset(font)
    destination = Path(args.out).expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff"
    font.save(destination)
    print(f"{destination}: {len(characters)} requested characters, {destination.stat().st_size // 1024} KB")
    if missing:
        print(f"source font is missing: {''.join(missing)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
