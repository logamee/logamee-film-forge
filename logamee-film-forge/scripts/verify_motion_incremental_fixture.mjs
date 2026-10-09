#!/usr/bin/env node

/**
 * Create a tiny disposable Motion project and verify the incremental contract:
 * first render misses, a repeated plan hits, and one unit change invalidates
 * only that unit plus the boundary that depends on it.
 *
 * The fixture is created under the system temporary directory and is removed
 * after the assertions finish. It never touches a user project.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const renderer = path.join(scriptDir, "render_motion_incrementally.mjs");
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "logamee-motion-fixture-"));
const htmlPath = path.join(fixtureRoot, "motion.html");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>html,body{margin:0;overflow:hidden;background:#101114}canvas{display:block}</style>
</head>
<body>
  <canvas id="c" width="320" height="180"></canvas>
  <script>
    const canvas = document.querySelector("#c");
    const ctx = canvas.getContext("2d");
    const units = [
      { unitId: "intro", title: "Intro", start: 0, duration: 0.5, boundaryDuration: 0 },
      {
        unitId: "middle",
        title: "Middle",
        start: 0.5,
        duration: 0.5,
        boundaryDuration: 0.1,
        transition: { type: "cut", duration: 0.1 }
      },
      {
        unitId: "outro",
        title: "Outro",
        start: 1,
        duration: 0.5,
        boundaryDuration: 0.1,
        transition: { type: "cut", duration: 0.1 }
      }
    ];
    window.__total = 1.5;
    window.__ready = true;
    window.motionReady = true;
    window.__bootFailed = null;
    window.SUBTITLES = [];
    window.MOTION_RENDERER_SCHEMA = "fixture";
    window.MOTION_SHARED_REVISION = "fixture-1";
    window.getMotionRenderUnits = () => units.map(unit => ({
      ...unit,
      startFrame: Math.round(unit.start * 12),
      endFrame: Math.round((unit.start + unit.duration) * 12),
      contentStart: unit.boundaryDuration,
      contentDuration: unit.duration - unit.boundaryDuration,
      transitionDependsOn: unit.transition ? (
        unit.unitId === "outro" ? ["middle"] : ["intro"]
      ) : []
    }));
    window.prepareMotionUnit = async unitId => {
      if (!units.some(unit => unit.unitId === unitId)) throw new Error("unknown unit");
    };
    function draw(unitId, localTime, boundary) {
      const unit = units.find(item => item.unitId === unitId);
      if (!unit) throw new Error("unknown unit");
      const colors = { intro: "#e6b566", middle: "#6bb6a8", outro: "#b975a9" };
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = colors[unitId];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#101114";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(unitId + (boundary ? " boundary" : " content"), 18, 48);
      ctx.fillText(localTime.toFixed(3), 18, 88);
      ctx.fillRect(18 + Math.round(localTime * 90), 120, 42, 12);
    }
    window.seekMotionUnit = (unitId, localTime = 0) => {
      draw(unitId, Number(localTime) || 0, true);
      return { unitId, localTime };
    };
    window.seekMotionUnitContent = (unitId, localTime = 0) => {
      draw(unitId, Number(localTime) || 0, false);
      return { unitId, localTime };
    };
    window.seekMotion = seconds => {
      let active = units[0];
      for (const unit of units) if (seconds >= unit.start) active = unit;
      return window.seekMotionUnit(active.unitId, seconds - active.start);
    };
  </script>
</body>
</html>
`;

const run = (extraArgs) => {
  const output = execFileSync(process.execPath, [
    renderer,
    `--html=${htmlPath}`,
    "--fps=12",
    "--width=320",
    "--height=180",
    "--preset=ultrafast",
    "--crf=30",
    "--output=render/fixture.mp4",
    "--cache-dir=render-cache/fixture",
    "--render-manifest=render-manifest.json",
    "--timeline-manifest=timeline-manifest.json",
    ...extraArgs,
  ], { cwd: fixtureRoot, encoding: "utf8" });
  return JSON.parse(output);
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  fs.writeFileSync(htmlPath, html);
  const first = run([]);
  assert(first.result === "rendered", "first fixture render did not complete");
  assert(first.contentCacheMisses === 3, "first render should miss all content units");
  assert(first.cacheLayers.composite.misses.length === 3, "first render should miss all composites");
  assert(first.validation.fullDecode === "passed", "first render failed full decode");

  const plan = run(["--dry-run"]);
  assert(plan.result === "plan-only", "repeat fixture run was not a plan");
  assert(plan.cacheLayers.content.hits === 3, "repeat plan did not reuse all content units");
  assert(plan.cacheLayers.composite.hits === 3, "repeat plan did not reuse all composites");
  assert(plan.cacheLayers.boundary.hits === 2, "repeat plan did not reuse both boundary caches");

  const isolation = run(["--verify-local-invalidation=middle"]);
  assert(isolation.result === "passed", "unit isolation check did not pass");
  assert(
    JSON.stringify(isolation.changedUnits) === JSON.stringify(["middle", "outro"]),
    `unexpected affected units: ${JSON.stringify(isolation.changedUnits)}`
  );

  console.log(JSON.stringify({
    result: "passed",
    fixture: "motion-incremental",
    firstRender: {
      contentMisses: first.contentCacheMisses,
      compositeMisses: first.cacheLayers.composite.misses.length,
      fullDecode: first.validation.fullDecode,
    },
    repeatPlan: {
      contentHits: plan.cacheLayers.content.hits,
      boundaryHits: plan.cacheLayers.boundary.hits,
      compositeHits: plan.cacheLayers.composite.hits,
    },
    isolation: {
      changedUnit: "middle",
      changedUnits: isolation.changedUnits,
    },
  }, null, 2));
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
