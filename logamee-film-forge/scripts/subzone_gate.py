#!/usr/bin/env python3
"""Find non-subtitle pixels entering a reserved subtitle band.

This is a screening aid for light, low-texture backgrounds. It complements
``qa_motion.py``: the latter tracks Canvas text bounds, while this tool also
sees dark graphic shapes, props, and strokes.
"""

from __future__ import annotations

import argparse
import subprocess

import numpy as np


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("video")
    parser.add_argument("--band", type=int, default=920)
    parser.add_argument("--fps", type=float, default=10)
    parser.add_argument("--threshold", type=int, default=150)
    args = parser.parse_args()
    height = 1080 - args.band
    command = [
        "ffmpeg", "-v", "error", "-i", args.video,
        "-vf", (
            f"fps={args.fps},scale=1920:1080,crop=1920:{height}:0:{args.band},"
            f"scale=960:{max(1, height // 2)}"
        ),
        "-f", "rawvideo", "-pix_fmt", "gray", "-",
    ]
    raw = subprocess.run(command, check=True, capture_output=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, max(1, height // 2), 960)
    hits = [
        (index / args.fps, int((frame < 95).sum()))
        for index, frame in enumerate(frames)
        if int((frame < 95).sum()) > args.threshold
    ]
    print(f"{len(frames)} frames, {len(hits)} hits")
    for timestamp, pixels in hits:
        print(f"{timestamp:7.2f}s  {pixels} dark pixels")
    return 1 if hits else 0


if __name__ == "__main__":
    raise SystemExit(main())
