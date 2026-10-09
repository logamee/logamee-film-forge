#!/usr/bin/env python3
"""Extract separate pose frames from a green-screen or white-board strip.

    python3 key_split.py poses.png --out motion-code/assets/pose
    python3 key_split.py line-art.png --white --out motion-code/assets/line

The split is based on columns that contain visible subject pixels. Keep the
original order; the runtime decides the playback cadence.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def subject_mask(image: np.ndarray, white: bool) -> np.ndarray:
    red, green, blue = image[..., 0], image[..., 1], image[..., 2]
    if white:
        near_white = np.minimum(np.minimum(red, green), blue)
        alpha = 1 - np.clip((near_white - 225) / 25, 0, 1)
        colored = np.max(image, axis=2) - np.min(image, axis=2) > 40
        return (alpha > 0.1) | colored
    excess = green - np.maximum(red, blue)
    alpha = 1 - np.clip((excess - 30) / 70, 0, 1)
    return alpha > 0.05


def runs(columns: np.ndarray, min_width: int, gap: int) -> list[tuple[int, int]]:
    result: list[tuple[int, int]] = []
    cursor = 0
    while cursor < len(columns):
        if not columns[cursor]:
            cursor += 1
            continue
        start = cursor
        while cursor < len(columns) and columns[max(0, cursor - gap + 1): cursor + 1].any():
            cursor += 1
        if cursor - start >= min_width:
            result.append((start, cursor))
        cursor += 1
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("source")
    parser.add_argument("--out", required=True, help="output prefix, without frame number")
    parser.add_argument("--pick", type=int)
    parser.add_argument("--white", action="store_true")
    parser.add_argument("--min-width", type=int, default=40)
    parser.add_argument("--gap", type=int, default=12)
    args = parser.parse_args()
    image = np.asarray(Image.open(args.source).convert("RGB"))
    mask = subject_mask(image, args.white)
    spans = runs(mask.any(axis=0), args.min_width, args.gap)
    if not spans:
        raise SystemExit("no pose spans found")
    prefix = Path(args.out)
    for index, (x0, x1) in enumerate(spans):
        if args.pick is not None and index != args.pick:
            continue
        rows = mask[:, x0:x1].any(axis=1)
        ys = np.where(rows)[0]
        if not len(ys):
            continue
        crop = image[ys.min(): ys.max() + 1, x0:x1]
        name = str(prefix) if args.pick is not None else f"{prefix}_{index}"
        Image.fromarray(crop).save(f"{name}.png")
        print(index, x0, x1, int(ys.min()), int(ys.max()) + 1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
