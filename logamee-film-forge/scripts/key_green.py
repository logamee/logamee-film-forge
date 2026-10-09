#!/usr/bin/env python3
"""Extract green-screen subjects without losing their source-canvas position.

The result is a transparent PNG per input plus ``sprites.json`` metadata:

    python3 key_green.py raw/*.png --out motion-code/assets/sprites

This is an asset-preparation tool. It does not decide how a sprite moves in a
scene; the Motion Runtime owns anchors, scale, pose selection, and timing.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


def extract(path: Path, soft: float, hard: float, pad: int) -> tuple[Image.Image, dict]:
    image = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)
    red, green, blue = image[..., 0], image[..., 1], image[..., 2]
    green_excess = green - np.maximum(red, blue)
    alpha = 1 - np.clip((green_excess - soft) / max(1.0, hard - soft), 0, 1)
    corrected_green = np.where(
        green_excess > 0,
        np.minimum(green, np.maximum(red, blue) + 0.25 * np.clip(green_excess, 0, 30)),
        green,
    )
    rgba = np.dstack([red, corrected_green, blue, alpha * 255]).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(alpha > 0.05)
    if len(xs) == 0:
        raise ValueError("no non-green subject pixels found")
    x0 = max(0, int(xs.min()) - pad)
    y0 = max(0, int(ys.min()) - pad)
    x1 = min(image.shape[1], int(xs.max()) + pad + 1)
    y1 = min(image.shape[0], int(ys.max()) + pad + 1)
    cropped = Image.fromarray(rgba[y0:y1, x0:x1], "RGBA")
    metadata = {
        "x": x0,
        "y": y0,
        "w": x1 - x0,
        "h": y1 - y0,
        "sourceWidth": int(image.shape[1]),
        "sourceHeight": int(image.shape[0]),
        "anchor": {"x": (x1 - x0) / 2, "y": y1 - y0},
    }
    return cropped, metadata


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="+")
    parser.add_argument("--out", required=True)
    parser.add_argument("--soft", type=float, default=30)
    parser.add_argument("--hard", type=float, default=100)
    parser.add_argument("--pad", type=int, default=4)
    args = parser.parse_args()
    out = Path(args.out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    metadata_path = out / "sprites.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8")) if metadata_path.exists() else {}
    for raw in args.files:
        source = Path(raw).expanduser().resolve()
        try:
            image, record = extract(source, args.soft, args.hard, args.pad)
        except ValueError as error:
            print(f"skip {source.name}: {error}")
            continue
        name = source.stem
        image.save(out / f"{name}.png")
        metadata[name] = record
        print(f"{name}: {record}")
    metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
