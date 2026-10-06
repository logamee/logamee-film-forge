#!/usr/bin/env python3
"""Turn a reference video into a code-oriented motion breakdown.

The output is a mechanism map, not a copying tool:

    uv run --with numpy,pillow python inspect_motion_reference.py \
      --video reference.mp4 --out breakdown

It writes probe metadata, contact sheets, candidate cut times, transition
contact sheets, motion heat maps, and one clean keyframe per detected segment.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def run(command: list[str]) -> bytes:
    result = subprocess.run(command, check=True, stdout=subprocess.PIPE)
    return result.stdout


def probe(video: Path) -> dict:
    payload = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_streams", "-show_format",
            "-of", "json", str(video),
        ],
        check=True,
        stdout=subprocess.PIPE,
        text=True,
    )
    return json.loads(payload.stdout)


def stream_info(metadata: dict) -> tuple[int, int, float, float]:
    stream = next(item for item in metadata["streams"] if item["codec_type"] == "video")
    num, den = stream["r_frame_rate"].split("/")
    fps = float(num) / float(den)
    duration = float(stream.get("duration") or metadata["format"]["duration"])
    return int(stream["width"]), int(stream["height"]), fps, duration


def frames(video: Path, width: int, height: int, pixel_format: str = "rgb24") -> np.ndarray:
    raw = run(
        [
            "ffmpeg", "-v", "error", "-i", str(video),
            "-vf", f"scale={width}:{height}",
            "-f", "rawvideo", "-pix_fmt", pixel_format, "-",
        ]
    )
    channels = 1 if pixel_format == "gray" else 3
    count = len(raw) // (width * height * channels)
    shape = (count, height, width, channels) if channels == 3 else (count, height, width)
    return np.frombuffer(raw[: count * width * height * channels], np.uint8).reshape(shape)


def save_contact_sheet(images: np.ndarray, times: list[float], path: Path, columns: int = 6) -> None:
    thumb_w, thumb_h = images.shape[2], images.shape[1]
    rows = (len(images) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * thumb_w, rows * (thumb_h + 20)), "white")
    draw = ImageDraw.Draw(sheet)
    for index, image in enumerate(images):
        x = (index % columns) * thumb_w
        y = (index // columns) * (thumb_h + 20)
        sheet.paste(Image.fromarray(image), (x, y + 20))
        draw.text((x + 4, y + 3), f"{times[index]:.2f}s", fill="black")
    sheet.save(path, quality=88)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--video", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--threshold", type=float, default=5.0)
    parser.add_argument("--debounce", type=int, default=12)
    args = parser.parse_args()

    video = Path(args.video).expanduser().resolve()
    out = Path(args.out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    (out / "contact-sheets").mkdir(exist_ok=True)
    (out / "transition-sheets").mkdir(exist_ok=True)
    (out / "motion-heatmaps").mkdir(exist_ok=True)
    (out / "keyframes").mkdir(exist_ok=True)

    metadata = probe(video)
    width, height, fps, duration = stream_info(metadata)
    small = frames(video, 480, 270)
    gray = frames(video, 192, 108, "gray").astype(np.float32)
    diff = np.abs(np.diff(gray, axis=0)).mean(axis=(1, 2))

    cuts: list[int] = []
    for index in range(1, len(diff)):
        if diff[index] > args.threshold and diff[index - 1] <= args.threshold:
            if not cuts or index - cuts[-1] > args.debounce:
                cuts.append(index)

    bounds = [0, *cuts, len(small)]
    keyframe_records = []
    for segment, (start, end) in enumerate(zip(bounds[:-1], bounds[1:]), start=1):
        key_index = max(start, end - 3)
        image = Image.fromarray(small[min(key_index, len(small) - 1)])
        key_path = out / "keyframes" / f"segment-{segment:02d}.png"
        image.save(key_path)
        keyframe_records.append({
            "segment": segment,
            "frame": key_index,
            "time": round(key_index / fps, 3),
            "path": str(key_path.relative_to(out)),
        })

        if end - start >= 4:
            start_motion = start + (round(0.35 * fps) if start else 0)
            end_motion = max(start_motion + 1, end - 2)
            sample = small[start_motion:end_motion].astype(np.float32)
            heat = np.abs(np.diff(sample, axis=0)).mean(axis=3).max(axis=0)
            heat_rgb = np.zeros((*heat.shape, 3), np.uint8)
            heat_rgb[..., 0] = np.clip(heat * 4, 0, 255)
            base = Image.fromarray(sample[0].astype(np.uint8)).convert("L").convert("RGB")
            overlay = Image.fromarray(heat_rgb)
            Image.blend(base, overlay, 0.58).save(
                out / "motion-heatmaps" / f"segment-{segment:02d}.jpg",
                quality=88,
            )

    for page, start in enumerate(range(0, len(small), round(fps / 4) * 30)):
        sample_indices = list(range(start, min(start + round(fps / 4) * 30, len(small)), round(fps / 4)))
        if not sample_indices:
            continue
        sample = small[sample_indices]
        save_contact_sheet(
            sample,
            [index / fps for index in sample_indices],
            out / "contact-sheets" / f"sheet-{page:02d}.jpg",
        )

    for index, cut in enumerate(cuts, start=1):
        selected = list(range(max(0, cut - 2), min(len(small), cut + 28), 2))
        if selected:
            save_contact_sheet(
                small[selected],
                [frame / fps for frame in selected],
                out / "transition-sheets" / f"transition-{index:02d}.jpg",
                columns=5,
            )

    report = {
        "source": str(video),
        "size": [width, height],
        "fps": fps,
        "duration": duration,
        "candidateCuts": [{"frame": frame, "time": round(frame / fps, 3)} for frame in cuts],
        "segments": keyframe_records,
        "method": {
            "threshold": args.threshold,
            "debounceFrames": args.debounce,
            "motionHeatmapWindow": "skip the first 0.35s of non-opening segments",
        },
    }
    (out / "breakdown.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
