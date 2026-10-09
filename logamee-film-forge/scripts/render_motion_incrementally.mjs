#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
import { performance } from "node:perf_hooks";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const option = (name, fallback = undefined) => {
  const value = args.find((argument) => argument.startsWith(`${name}=`));
  return value ? value.slice(name.length + 1) : fallback;
};
const hasFlag = (name) => args.includes(name);
const htmlArg = option("--html");

if (!htmlArg) {
  throw new Error(
    "Usage: node render_motion_incrementally.mjs --html=<motion.html> [--dry-run]"
  );
}

const htmlPath = path.resolve(htmlArg);
const projectRoot = path.dirname(htmlPath);
const htmlName = path.basename(htmlPath);
if (!fs.existsSync(htmlPath)) throw new Error(`HTML file not found: ${htmlPath}`);

const fps = Number(option("--fps", "60"));
const width = Number(option("--width", "1920"));
const height = Number(option("--height", "1080"));
const crf = Number(option("--crf", "18"));
const preset = option("--preset", "veryfast");
const audioArg = option("--audio");
const audioPath = audioArg
  ? path.resolve(projectRoot, audioArg)
  : null;
const dryRun = hasFlag("--dry-run") || Boolean(option("--verify-local-invalidation"));
const verifyUnit = option("--verify-local-invalidation");
const outputPath = path.resolve(
  projectRoot,
  option("--output", `render/${path.parse(htmlName).name}.mp4`)
);
const cacheDir = path.resolve(
  projectRoot,
  option("--cache-dir", `render-cache/${path.parse(htmlName).name}-motion-v1`)
);
const renderManifestPath = path.resolve(
  projectRoot,
  option("--render-manifest", "render-manifest.motion.json")
);
const timelineManifestPath = path.resolve(
  projectRoot,
  option("--timeline-manifest", "timeline-manifest.motion.json")
);

const renderSettings = {
  width,
  height,
  fps,
  codec: "h264",
  pixelFormat: "yuv420p",
  preset,
  crf,
};
const rendererSchema = "logamee-motion-incremental-render-v3";
const errors = [];
const failedRequests = [];
const audioRequests = [];

if (![fps, width, height, crf].every(Number.isFinite) || fps <= 0 || width <= 0 || height <= 0) {
  throw new Error("fps, width, height, and crf must be valid positive numbers.");
}
if (audioPath && !fs.existsSync(audioPath)) {
  throw new Error(`Audio file not found: ${audioPath}`);
}
for (const target of [outputPath, cacheDir, renderManifestPath, timelineManifestPath]) {
  if (!target.startsWith(`${projectRoot}${path.sep}`)) {
    throw new Error(`Refusing to write outside the HTML project directory: ${target}`);
  }
}
if (!dryRun && fs.existsSync(outputPath)) {
  throw new Error(`Refusing to overwrite existing output: ${outputPath}`);
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const hashFile = (file) => sha256(fs.readFileSync(file));
const readJson = (file) => {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Cannot parse existing manifest ${file}: ${error.message}`);
  }
};
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  fs.renameSync(temporary, file);
};
const promote = (temporary, destination, label) => {
  if (fs.existsSync(destination)) {
    throw new Error(`Refusing to replace existing ${label} cache artifact: ${destination}`);
  }
  fs.renameSync(temporary, destination);
};
const safeId = (id) => String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
const mediaType = (file) => ({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
}[path.extname(file).toLowerCase()] || "application/octet-stream");

const server = http.createServer((request, response) => {
  let relative;
  try {
    relative = decodeURIComponent(
      new URL(request.url || "/", "http://127.0.0.1").pathname
    ).replace(/^\/+/, "");
  } catch {
    response.writeHead(400).end();
    return;
  }
  const file = path.resolve(projectRoot, relative || htmlName);
  if (file !== projectRoot && !file.startsWith(`${projectRoot}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "content-type": mediaType(file),
      "content-length": stat.size,
      "cache-control": "no-store",
    });
    fs.createReadStream(file).pipe(response);
  });
});

const requireFromScript = createRequire(import.meta.url);
const loadPlaywright = async () => {
  const configured = process.env.PLAYWRIGHT_MODULE;
  const candidates = [];
  if (configured) {
    candidates.push(configured);
    if (fs.existsSync(configured)) {
      const configuredPath = path.resolve(configured);
      const configuredEntry = fs.statSync(configuredPath).isDirectory()
        ? path.join(configuredPath, "index.mjs")
        : configuredPath;
      candidates.push(pathToFileURL(configuredEntry).href);
    }
  }
  for (const resolveFrom of [projectRoot, process.cwd(), path.dirname(process.execPath)]) {
    try {
      candidates.push(requireFromScript.resolve("playwright", { paths: [resolveFrom] }));
    } catch {}
  }
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const globalRoots = [
    path.join(home, ".nvm", "versions", "node"),
    "/usr/local/lib/node_modules",
    "/opt/homebrew/lib/node_modules",
  ];
  for (const root of globalRoots) {
    if (!fs.existsSync(root)) continue;
    const versions = root.endsWith(`${path.sep}node`)
      ? fs.readdirSync(root).sort().reverse().map((entry) => path.join(root, entry, "lib", "node_modules"))
      : [root];
    for (const modulesRoot of versions) {
      candidates.push(path.join(modulesRoot, "playwright", "index.mjs"));
    }
  }
  candidates.push("playwright");
  for (const candidate of [...new Set(candidates)]) {
    try {
      const importTarget = fs.existsSync(candidate)
        ? pathToFileURL(path.resolve(candidate)).href
        : candidate;
      const imported = await import(importTarget);
      if (imported?.chromium) return imported;
      if (imported?.default?.chromium) return imported.default;
    } catch {}
  }
  throw new Error(
    "Playwright is required. Install it in the current Node environment or set PLAYWRIGHT_MODULE."
  );
};

const findBrowserExecutable = () => {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const configuredCache = process.env.PLAYWRIGHT_BROWSERS_PATH;
  const cacheDirectories = configuredCache && configuredCache !== "0"
    ? [configuredCache]
    : [
        path.join(home, "Library/Caches/ms-playwright"),
        path.join(home, ".cache/ms-playwright"),
        path.join(process.env.LOCALAPPDATA || "", "ms-playwright"),
      ];
  const candidates = [];
  for (const cache of [...new Set(cacheDirectories.filter(Boolean))]) {
    if (!fs.existsSync(cache)) continue;
    for (const entry of fs.readdirSync(cache)) {
      const directory = path.join(cache, entry);
      if (entry.startsWith("chromium_headless_shell-")) {
        for (const architecture of ["arm64", "x64"]) {
          candidates.push(path.join(
            directory,
            `chrome-headless-shell-mac-${architecture}`,
            "chrome-headless-shell"
          ));
          candidates.push(path.join(
            directory,
            `chrome-headless-shell-linux-${architecture}`,
            "chrome-headless-shell"
          ));
        }
      }
      if (entry.startsWith("chromium-")) {
        candidates.push(path.join(
          directory,
          "chrome-mac/Chromium.app/Contents/MacOS/Chromium"
        ));
        candidates.push(path.join(directory, "chrome-linux/chrome"));
      }
    }
  }
  return candidates.filter((candidate) => fs.existsSync(candidate));
};

const launchBrowser = async (chromium) => {
  const argsForBrowser = [
    "--autoplay-policy=no-user-gesture-required",
    "--mute-audio",
    "--disable-dev-shm-usage",
  ];
  const bundledExecutable = (() => {
    try {
      return chromium.executablePath();
    } catch {
      return undefined;
    }
  })();
  const candidates = [undefined, bundledExecutable, ...findBrowserExecutable()]
    .filter((candidate, index, all) => (
      candidate === undefined || all.indexOf(candidate) === index
    ));
  let lastError;
  for (const executablePath of candidates) {
    try {
      return await chromium.launch({
        headless: true,
        ...(executablePath ? { executablePath } : {}),
        args: argsForBrowser,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Could not launch Chromium: ${lastError?.message || "unknown error"}`);
};

const runFfmpeg = (commandArgs, inputFrames = null, label = "") => new Promise(
  (resolve, reject) => {
    const child = spawn("ffmpeg", commandArgs, {
      stdio: [inputFrames ? "pipe" : "ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk.toString()}`.slice(-10000);
    });
    const closePromise = new Promise((childResolve, childReject) => {
      child.once("error", childReject);
      child.once("close", (code) => {
        if (code === 0) childResolve();
        else childReject(new Error(
          `FFmpeg ${label || "operation"} exited ${code}: ${stderr}`
        ));
      });
    });
    const writeFrames = async () => {
      try {
        for (const frame of inputFrames || []) {
          if (child.stdin.destroyed) throw new Error("FFmpeg input pipe closed early.");
          if (child.stdin.write(frame)) continue;
          await once(child.stdin, "drain");
        }
        if (!child.stdin.writableEnded) child.stdin.end();
        await closePromise;
        resolve();
      } catch (error) {
        if (!child.stdin.destroyed) child.stdin.destroy();
        closePromise.catch(() => {});
        reject(error);
      }
    };
    if (inputFrames) writeFrames();
    else closePromise.then(resolve, reject);
  }
);

const probeMedia = (file) => JSON.parse(execFileSync("ffprobe", [
  "-v", "error",
  "-count_frames",
  "-show_entries",
  "stream=codec_type,codec_name,width,height,pix_fmt,avg_frame_rate,duration,nb_read_frames:format=duration,size",
  "-of", "json",
  file,
], { encoding: "utf8" }));

const validateSegment = (file, expectedFrames) => {
  if (!fs.existsSync(file) || fs.statSync(file).size < 2048) {
    return { valid: false, reason: "missing-or-truncated" };
  }
  try {
    const probe = probeMedia(file);
    const video = probe.streams?.find((stream) => stream.codec_type === "video");
    const valid = video?.codec_name === "h264"
      && Number(video.width) === width
      && Number(video.height) === height
      && video.pix_fmt === "yuv420p"
      && video.avg_frame_rate === `${fps}/1`
      && Number(video.nb_read_frames) === expectedFrames
      && !probe.streams.some((stream) => stream.codec_type === "audio");
    return {
      valid,
      reason: valid ? null : "media-contract-mismatch",
      video,
      bytes: Number(probe.format?.size || fs.statSync(file).size),
    };
  } catch (error) {
    return { valid: false, reason: `probe-failed: ${error.message}` };
  }
};

const concatVideoFiles = (files, destination, label) => new Promise(
  (resolve, reject) => {
    if (!files.length) {
      reject(new Error(`Cannot concatenate an empty video list for ${label}.`));
      return;
    }
    if (files.length === 1) {
      try {
        fs.copyFileSync(files[0], destination);
        resolve();
      } catch (error) {
        reject(error);
      }
      return;
    }
    const inputArgs = files.flatMap((file) => ["-i", file]);
    const inputLabels = files.map((_, index) => `[${index}:v:0]`).join("");
    const filterGraph = `${inputLabels}concat=n=${files.length}:v=1:a=0,format=yuv420p[v]`;
    const process = spawn("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
      ...inputArgs,
      "-filter_complex", filterGraph,
      "-map", "[v]", "-an",
      "-c:v", "libx264",
      "-preset", preset,
      "-crf", String(crf),
      "-r", String(fps),
      "-fps_mode", "cfr",
      "-pix_fmt", "yuv420p",
      "-video_track_timescale", "15360",
      "-movflags", "+faststart",
      "-f", "mp4",
      destination,
    ], { stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    process.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk.toString()}`.slice(-10000);
    });
    process.once("error", reject);
    process.once("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg ${label} failed (${code}): ${stderr}`));
        return;
      }
      if (!fs.existsSync(destination) || fs.statSync(destination).size < 2048) {
        reject(new Error(
          `FFmpeg ${label} reported success but produced no usable file: ${destination}`
        ));
        return;
      }
      resolve();
    });
  }
);

const resolveLocalFile = (reference, pageUrl, baseOrigin) => {
  if (!reference) return { kind: "empty", value: "" };
  if (String(reference).startsWith("data:")) {
    return { kind: "inline", value: sha256(String(reference)) };
  }
  const url = new URL(String(reference), pageUrl);
  if (url.origin !== baseOrigin) {
    throw new Error(`External render dependency cannot be fingerprinted locally: ${url.href}`);
  }
  const file = path.resolve(
    projectRoot,
    decodeURIComponent(url.pathname).replace(/^\/+/, "")
  );
  if (!file.startsWith(`${projectRoot}${path.sep}`)) {
    throw new Error(`Render dependency resolves outside project root: ${reference}`);
  }
  if (!fs.existsSync(file)) throw new Error(`Render dependency is missing: ${file}`);
  return {
    kind: "file",
    file,
    relative: path.relative(projectRoot, file),
    sha256: hashFile(file),
  };
};

const normalizeReference = (reference, pageUrl, baseOrigin) => {
  if (!reference || String(reference).startsWith("data:")) return null;
  try {
    const url = new URL(String(reference), pageUrl);
    if (url.origin !== baseOrigin) return null;
    const file = path.resolve(
      projectRoot,
      decodeURIComponent(url.pathname).replace(/^\/+/, "")
    );
    if (!file.startsWith(`${projectRoot}${path.sep}`)) return null;
    return fs.existsSync(file) ? file : null;
  } catch {
    return null;
  }
};

const signatureFor = (payload) => sha256(JSON.stringify(payload));
const dependencyClosure = (records, targetId) => {
  const affected = new Set([targetId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const record of records) {
      if (affected.has(record.id)) continue;
      if (
        record.dependsOn.some((dependency) => affected.has(dependency))
        || record.transitionDependsOn.some((dependency) => affected.has(dependency))
      ) {
        affected.add(record.id);
        changed = true;
      }
    }
  }
  return affected;
};

const buildRecords = ({
  units,
  sharedSignature,
  sharedAssetHashes,
  pageUrl,
  baseOrigin,
  subtitleData,
  mutationTarget = null,
}) => {
  const records = units.map((unit, index) => {
    const start = Number.isFinite(Number(unit.start)) ? Number(unit.start) : 0;
    const duration = Number(unit.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error(`Motion unit ${unit.unitId} has an invalid duration: ${unit.duration}`);
    }
    // Allocate frames from absolute boundaries instead of rounding each
    // duration independently. This prevents cumulative drift such as a
    // nominal 20-second timeline becoming 599 frames.
    const startFrame = Math.round(start * fps);
    const endFrame = Math.round((start + duration) * fps);
    const frameCount = Math.max(1, endFrame - startFrame);
    const requestedBoundaryDuration = Number(
      unit.boundaryDuration ?? unit.transition?.duration ?? 0
    );
    const boundaryDuration = Math.min(
      duration,
      Number.isFinite(requestedBoundaryDuration)
        ? Math.max(0, requestedBoundaryDuration)
        : 0
    );
    const boundaryFrameCount = boundaryDuration > 0
      ? Math.min(frameCount, Math.max(1, Math.ceil(boundaryDuration * fps)))
      : 0;
    const contentFrameCount = frameCount - boundaryFrameCount;
    const contentStartSeconds = boundaryFrameCount / fps;
    const localSubtitles = subtitleData
      .filter((subtitle) => (
        Number(subtitle.end ?? subtitle.t1 ?? 0) > start
        && Number(subtitle.start ?? subtitle.t0 ?? 0) < start + duration
      ))
      .map((subtitle) => ({
        start: Math.max(0, Number(subtitle.start ?? subtitle.t0 ?? 0) - start),
        end: Math.min(
          duration,
          Number(subtitle.end ?? subtitle.t1 ?? 0) - start
        ),
        text: subtitle.text || subtitle.caption || "",
      }));
    const sourceFiles = {};
    for (const reference of unit.sourceFiles || []) {
      const resolved = resolveLocalFile(reference, pageUrl, baseOrigin);
      sourceFiles[reference] = resolved.kind === "file"
        ? { path: resolved.relative, sha256: resolved.sha256 }
        : resolved;
    }
    const assetFiles = {};
    for (const reference of unit.assets || []) {
      const resolved = resolveLocalFile(reference, pageUrl, baseOrigin);
      assetFiles[reference] = resolved.kind === "file"
        ? { path: resolved.relative, sha256: resolved.sha256 }
        : resolved;
    }
    const dependencyIds = [...new Set(
      (unit.dependsOn || []).filter((dependency) => (
        units.some((candidate) => candidate.unitId === dependency)
      ))
    )];
    const transitionDependencyIds = [...new Set(
      [
        ...(unit.transitionDependsOn || []),
        ...(unit.transition?.dependsOn || []),
      ].filter((dependency) => (
        units.some((candidate) => candidate.unitId === dependency)
      ))
    )];
    const basePayload = {
      schema: rendererSchema,
      sharedSignature,
      id: unit.unitId,
      revision: unit.renderRevision || 0,
      title: unit.title || "",
      durationSeconds: duration,
      motionDurationSeconds: Number(unit.motionDuration ?? duration),
      frameCount,
      boundaryDurationSeconds: boundaryDuration,
      boundaryFrameCount,
      contentFrameCount,
      contentStartSeconds,
      style: unit.style || null,
      grammar: unit.grammar || null,
      route: unit.route || null,
      sourceFiles,
      assetFiles,
      dependencies: unit.dependencies || [],
      narration: unit.narration || "",
      caption: unit.caption || localSubtitles,
      subtitles: localSubtitles,
      settings: renderSettings,
    };
    if (mutationTarget === unit.unitId) {
      basePayload.testMutation = "local-invalidation-check";
    }
    return {
      id: unit.unitId,
      index,
      title: unit.title || "",
      start,
      duration,
      frameCount,
      motionDuration: Number(unit.motionDuration ?? duration),
      boundaryDuration,
      boundaryFrameCount,
      contentFrameCount,
      contentStartSeconds,
      end: start + duration,
      transition: unit.transition || null,
      dependsOn: dependencyIds,
      transitionDependsOn: transitionDependencyIds,
      sourceFiles,
      assetFiles,
      basePayload,
      sharedAssetHashes,
    };
  });
  const byId = new Map(records.map((record) => [record.id, record]));
  const resolving = new Set();
  const resolveSignature = (record) => {
    if (record.signature) return record.signature;
    if (resolving.has(record.id)) {
      throw new Error(`Cyclic motion-unit dependency detected at ${record.id}`);
    }
    resolving.add(record.id);
    const dependencySignatures = record.dependsOn.map((dependency) => {
      const dependencyRecord = byId.get(dependency);
      return dependencyRecord
        ? { id: dependency, signature: resolveSignature(dependencyRecord) }
        : { id: dependency, signature: `external:${dependency}` };
    });
    record.signature = signatureFor({
      ...record.basePayload,
      dependencySignatures,
    });
    resolving.delete(record.id);
    return record.signature;
  };
  for (const record of records) resolveSignature(record);
  for (const record of records) {
    const transitionSignatures = record.transitionDependsOn.map((dependency) => {
      const dependencyRecord = byId.get(dependency);
      return dependencyRecord
        ? { id: dependency, signature: dependencyRecord.signature }
        : { id: dependency, signature: `external:${dependency}` };
    });
    const previousRecord = records[record.index - 1] || null;
    record.boundarySignature = record.boundaryFrameCount > 0
      ? signatureFor({
          schema: "logamee-motion-boundary-v2",
          id: record.id,
          transition: record.transition,
          durationSeconds: record.boundaryDuration,
          frameCount: record.boundaryFrameCount,
          contentSignature: record.signature,
          fromContentSignature: previousRecord?.signature || null,
          dependencySignatures: transitionSignatures,
          settings: renderSettings,
        })
      : null;
    record.contentCachePath = record.contentFrameCount > 0
      ? path.join(
          cacheDir,
          "content",
          safeId(record.id),
          `${record.signature}.mp4`
        )
      : null;
    record.boundaryCachePath = record.boundaryFrameCount > 0
      ? path.join(
          cacheDir,
          "boundary",
          safeId(record.id),
          `${record.boundarySignature}.mp4`
        )
      : null;
    record.compositeSignature = signatureFor({
      schema: "logamee-motion-composite-v1",
      id: record.id,
      contentSignature: record.signature,
      boundarySignature: record.boundarySignature,
      frameCount: record.frameCount,
      settings: renderSettings,
    });
    record.compositeCachePath = path.join(
      cacheDir,
      "composite",
      safeId(record.id),
      `${record.compositeSignature}.mp4`
    );
    record.startFrame = records
      .slice(0, record.index)
      .reduce((sum, previous) => sum + previous.frameCount, 0);
    record.endFrame = record.startFrame + record.frameCount;
  }
  return records;
};

let serverAddress;
let browser;
let context;

try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  execFileSync("ffprobe", ["-version"], { stdio: "ignore" });
  server.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  serverAddress = server.address();

  const { chromium } = await loadPlaywright();
  browser = await launchBrowser(chromium);
  context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText || "request failed",
    });
  });
  page.on("request", (request) => {
    if (/\.(wav|mp3|m4a|aac|ogg|opus)(?:$|[?#])/i.test(request.url())) {
      audioRequests.push(request.url());
    }
  });

  const baseOrigin = `http://127.0.0.1:${serverAddress.port}`;
  const pageUrl = `${baseOrigin}/${encodeURIComponent(htmlName)}?motionPreview=1&render=1`;
  await page.goto(pageUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => window.motionReady === true || window.__bootFailed,
    { timeout: 120000 }
  );
  const readiness = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      motionReady: window.motionReady === true,
      bootFailed: window.__bootFailed || null,
      canvas: {
        width: document.querySelector("#c")?.width || 0,
        height: document.querySelector("#c")?.height || 0,
      },
      total: window.__total || 0,
      rendererSchema: window.MOTION_RENDERER_SCHEMA || null,
      sharedRevision: window.MOTION_SHARED_REVISION || null,
      subtitles: Array.isArray(window.SUBTITLES) ? window.SUBTITLES : [],
      htmlScripts: [...document.querySelectorAll("script[src]")].map((script) => script.src),
      inlineStyles: [...document.querySelectorAll("style")].map((style) => style.textContent),
      sharedDependencies: Array.isArray(window.MOTION_SHARED_DEPENDENCIES)
        ? window.MOTION_SHARED_DEPENDENCIES
        : null,
    };
  });
  if (readiness.bootFailed) throw new Error(`Motion boot failed: ${readiness.bootFailed}`);
  if (!readiness.motionReady) throw new Error("The HTML did not expose window.motionReady=true.");
  if (readiness.canvas.width !== width || readiness.canvas.height !== height) {
    throw new Error(
      `Canvas size ${readiness.canvas.width}x${readiness.canvas.height} does not match `
      + `requested output ${width}x${height}.`
    );
  }

  const rawUnits = await page.evaluate(() => window.getMotionRenderUnits?.());
  if (!Array.isArray(rawUnits) || rawUnits.length === 0) {
    throw new Error("The HTML returned no motion render units.");
  }
  let fallbackStart = 0;
  const units = rawUnits.map((unit, index) => {
    const duration = Number(unit.duration);
    const start = Number.isFinite(Number(unit.start))
      ? Number(unit.start)
      : fallbackStart;
    fallbackStart = start + duration;
    return {
      ...unit,
      unitId: unit.unitId || unit.id || `unit-${index + 1}`,
      start,
      duration,
    };
  });
  const ids = units.map((unit) => unit.unitId);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error(`Every motion unit needs a unique stable ID: ${ids.join(", ")}`);
  }
  if (verifyUnit && !ids.includes(verifyUnit)) {
    throw new Error(`Isolation target is not a stable motion unit ID: ${verifyUnit}`);
  }

  const htmlSha256 = hashFile(htmlPath);
  const localUnitSourceFiles = new Set(
    units.flatMap((unit) => (
      (unit.sourceFiles || [])
        .map((reference) => normalizeReference(reference, pageUrl, baseOrigin))
        .filter(Boolean)
    ))
  );
  const sharedReferences = (
    Array.isArray(readiness.sharedDependencies)
      ? readiness.sharedDependencies
      : readiness.htmlScripts
  ).filter((reference) => (
    !localUnitSourceFiles.has(normalizeReference(reference, pageUrl, baseOrigin))
  ));
  const sharedAssetHashes = {};
  for (const reference of [
    ...sharedReferences,
    ...readiness.inlineStyles.flatMap((css) => {
      const matches = css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g);
      return [...matches]
        .map((match) => match[1])
        .filter((value) => (
          value
          && !value.startsWith("data:")
          && !value.startsWith("#")
          && !value.startsWith("%23")
        ));
    }),
  ]) {
    const resolved = resolveLocalFile(reference, pageUrl, baseOrigin);
    sharedAssetHashes[reference] = resolved.kind === "file"
      ? { path: resolved.relative, sha256: resolved.sha256 }
      : resolved;
  }
  const sharedSignature = signatureFor({
    schema: rendererSchema,
    runtimeSchema: readiness.rendererSchema,
    sharedRevision: readiness.sharedRevision,
    sharedAssetHashes,
    inlineStyles: readiness.inlineStyles.map((style) => sha256(style)),
    canvas: readiness.canvas,
    settings: renderSettings,
  });
  const subtitleData = readiness.subtitles;
  const baselineRecords = buildRecords({
    units,
    sharedSignature,
    sharedAssetHashes,
    pageUrl,
    baseOrigin,
    subtitleData,
  });
  const oldRenderManifest = readJson(renderManifestPath);
  const renderPlan = baselineRecords.map((record) => {
    const previous = oldRenderManifest?.units?.find((unit) => unit.id === record.id);
    const cacheLayer = (layer, file, expectedFrames, signature, previousSignature) => {
      if (!file || expectedFrames === 0) {
        return {
          cache: "not-required",
          reason: null,
          path: file ? path.relative(projectRoot, file) : null,
          signature,
          validation: null,
        };
      }
      const validation = validateSegment(file, expectedFrames);
      if (fs.existsSync(file) && !validation.valid) {
        throw new Error(
          `Invalid ${layer} cache artifact exists and will be preserved: `
          + `${path.relative(projectRoot, file)} (${validation.reason})`
        );
      }
      let reason = "cache-file-missing";
      if (previousSignature && previousSignature !== signature) {
        reason = `${layer}-signature-changed`;
      }
      return {
        cache: validation.valid ? "hit" : "miss",
        reason: validation.valid ? null : reason,
        path: path.relative(projectRoot, file),
        signature,
        validation,
      };
    };
    const content = cacheLayer(
      "content",
      record.contentCachePath,
      record.contentFrameCount,
      record.signature,
      previous?.contentSignature,
    );
    const boundary = cacheLayer(
      "boundary",
      record.boundaryCachePath,
      record.boundaryFrameCount,
      record.boundarySignature,
      previous?.boundarySignature,
    );
    const composite = cacheLayer(
      "composite",
      record.compositeCachePath,
      record.frameCount,
      record.compositeSignature,
      previous?.compositeSignature,
    );
    return {
      id: record.id,
      index: record.index,
      start: record.start,
      durationSeconds: record.duration,
      frameCount: record.frameCount,
      boundaryDurationSeconds: record.boundaryDuration,
      boundaryFrameCount: record.boundaryFrameCount,
      contentFrameCount: record.contentFrameCount,
      contentStartSeconds: record.contentStartSeconds,
      startFrame: record.startFrame,
      endFrame: record.endFrame,
      dependsOn: record.dependsOn,
      transitionDependsOn: record.transitionDependsOn,
      contentSignature: record.signature,
      boundarySignature: record.boundarySignature,
      compositeSignature: record.compositeSignature,
      content,
      boundary,
      composite,
    };
  });

  if (verifyUnit) {
    const mutatedRecords = buildRecords({
      units,
      sharedSignature,
      sharedAssetHashes,
      pageUrl,
      baseOrigin,
      subtitleData,
      mutationTarget: verifyUnit,
    });
    const baselineById = new Map(baselineRecords.map((record) => [record.id, record]));
    const changedIds = mutatedRecords
      .filter((record) => (
        record.signature !== baselineById.get(record.id).signature
        || record.boundarySignature !== baselineById.get(record.id).boundarySignature
        || record.compositeSignature !== baselineById.get(record.id).compositeSignature
      ))
      .map((record) => record.id);
    const expectedIds = [...dependencyClosure(baselineRecords, verifyUnit)];
    const changedSorted = [...changedIds].sort();
    const expectedSorted = [...expectedIds].sort();
    if (JSON.stringify(changedSorted) !== JSON.stringify(expectedSorted)) {
      throw new Error(
        `Unit-isolation check failed: expected ${expectedSorted.join(", ")}, `
        + `but signature mutation changed ${changedSorted.join(", ")}.`
      );
    }
    console.log(JSON.stringify({
      result: "passed",
      test: "single-motion-unit dependency change",
      changedUnit: verifyUnit,
      changedUnits: changedSorted,
      affectedTransitions: baselineRecords
        .filter((record) => record.transitionDependsOn.includes(verifyUnit))
        .map((record) => `boundary:${record.id}`),
      note: "The mutation was applied in memory; project files and persistent caches were not modified.",
    }, null, 2));
  } else if (dryRun) {
    console.log(JSON.stringify({
      result: "plan-only",
      sourceHtml: path.relative(projectRoot, htmlPath),
      units: baselineRecords.length,
      totalFrames: baselineRecords.reduce((sum, record) => sum + record.frameCount, 0),
      durationSeconds: baselineRecords.reduce((sum, record) => sum + record.frameCount, 0) / fps,
      sharedSignature,
      audio: audioPath ? {
        path: path.relative(projectRoot, audioPath),
        sha256: hashFile(audioPath),
      } : null,
      cacheLayers: {
        content: {
          hits: renderPlan.filter((entry) => entry.content.cache === "hit").length,
          misses: renderPlan
            .filter((entry) => entry.content.cache === "miss")
            .map((entry) => ({ unit: entry.id, reason: entry.content.reason })),
        },
        boundary: {
          hits: renderPlan.filter((entry) => entry.boundary.cache === "hit").length,
          misses: renderPlan
            .filter((entry) => entry.boundary.cache === "miss")
            .map((entry) => ({ unit: entry.id, reason: entry.boundary.reason })),
        },
        composite: {
          hits: renderPlan.filter((entry) => entry.composite.cache === "hit").length,
          misses: renderPlan
            .filter((entry) => entry.composite.cache === "miss")
            .map((entry) => ({ unit: entry.id, reason: entry.composite.reason })),
        },
      },
      plan: renderPlan,
    }, null, 2));
  } else {
    const runStarted = performance.now();
    const renderedUnits = [];
    const renderLayer = async (record, layer, cachePath, frameCount, timeForFrame) => {
      if (!cachePath || frameCount === 0) {
        return {
          cache: "not-required",
          path: cachePath ? path.relative(projectRoot, cachePath) : null,
          frames: 0,
          bytes: 0,
          renderSeconds: 0,
        };
      }
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      const temporary = `${cachePath}.tmp-${process.pid}`;
      if (fs.existsSync(temporary)) {
        throw new Error(`Refusing to overwrite incomplete ${layer} render: ${temporary}`);
      }
      const started = performance.now();
      const frames = [];
      for (let frame = 0; frame < frameCount; frame += 1) {
        await page.evaluate(({ id, time, mode }) => {
          if (mode === "boundary") return window.seekMotionUnit(id, time);
          return window.seekMotionUnitContent(id, time);
        }, {
          id: record.id,
          time: timeForFrame(frame),
          mode: layer,
        });
        // Capture the complete viewport, not only #c. Motion projects may use
        // DOM/SVG overlays for labels, subtitles, or semantic controls.
        frames.push(await page.screenshot({
          type: "png",
          animations: "disabled",
        }));
      }
      await runFfmpeg([
        "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
        "-f", "image2pipe", "-framerate", String(fps),
        "-vcodec", "png", "-i", "pipe:0",
        "-frames:v", String(frameCount),
        "-an",
        "-c:v", "libx264", "-preset", preset, "-crf", String(crf),
        "-r", String(fps), "-fps_mode", "cfr", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-f", "mp4",
        temporary,
      ], frames, `${record.id} ${layer}`);
      const validation = validateSegment(temporary, frameCount);
      if (!validation.valid) {
        throw new Error(
          `Rendered ${layer} ${record.id} failed validation: ${JSON.stringify(validation)}`
        );
      }
      promote(temporary, cachePath, `${layer} cache`);
      return {
        cache: "miss",
        path: path.relative(projectRoot, cachePath),
        frames: frameCount,
        bytes: validation.bytes || 0,
        renderSeconds: (performance.now() - started) / 1000,
      };
    };
    for (const [position, record] of baselineRecords.entries()) {
      const plan = renderPlan[position];
      let prepared = false;
      const ensurePrepared = async () => {
        if (prepared) return;
        await page.evaluate(async (id) => {
          await window.prepareMotionUnit(id);
        }, record.id);
        prepared = true;
      };
      if (plan.content.cache === "miss" || plan.boundary.cache === "miss") {
        await ensurePrepared();
      }
      const contentResult = plan.content.cache === "miss"
        ? await renderLayer(
            record,
            "content",
            record.contentCachePath,
            record.contentFrameCount,
            (frame) => record.contentStartSeconds + frame / fps,
          )
        : {
            cache: plan.content.cache,
            reason: plan.content.reason,
            path: plan.content.path,
            frames: record.contentFrameCount,
            bytes: plan.content.validation?.bytes || 0,
            renderSeconds: 0,
          };
      const boundaryResult = plan.boundary.cache === "miss"
        ? await renderLayer(
            record,
            "boundary",
            record.boundaryCachePath,
            record.boundaryFrameCount,
            (frame) => frame / fps,
          )
        : {
            cache: plan.boundary.cache,
            reason: plan.boundary.reason,
            path: plan.boundary.path,
            frames: record.boundaryFrameCount,
            bytes: plan.boundary.validation?.bytes || 0,
            renderSeconds: 0,
          };
      const componentFiles = [
        record.boundaryCachePath,
        record.contentCachePath,
      ].filter(Boolean);
      if (!componentFiles.every((file) => fs.existsSync(file))) {
        throw new Error(
          `Motion unit ${record.id} is missing a component cache: `
          + componentFiles.join(", ")
        );
      }
      let compositeResult;
      if (plan.composite.cache === "miss") {
        fs.mkdirSync(path.dirname(record.compositeCachePath), { recursive: true });
        const temporary = `${record.compositeCachePath}.tmp-${process.pid}`;
        if (fs.existsSync(temporary)) {
          throw new Error(`Refusing to overwrite incomplete composite render: ${temporary}`);
        }
        await concatVideoFiles(
          componentFiles,
          temporary,
          `${record.id} composite`,
        );
        const validation = validateSegment(temporary, record.frameCount);
        if (!validation.valid) {
          throw new Error(
            `Composite ${record.id} failed validation: ${JSON.stringify(validation)}`
          );
        }
        promote(temporary, record.compositeCachePath, "composite cache");
        compositeResult = {
          cache: "miss",
          reason: plan.composite.reason,
          path: path.relative(projectRoot, record.compositeCachePath),
          frames: record.frameCount,
          bytes: validation.bytes || 0,
          renderSeconds: 0,
        };
      } else {
        compositeResult = {
          cache: plan.composite.cache,
          reason: plan.composite.reason,
          path: plan.composite.path,
          frames: record.frameCount,
          bytes: plan.composite.validation?.bytes || 0,
          renderSeconds: 0,
        };
      }
      renderedUnits.push({
        id: record.id,
        content: {
          ...contentResult,
          signature: record.signature,
          frames: record.contentFrameCount,
        },
        boundary: {
          ...boundaryResult,
          signature: record.boundarySignature,
          frames: record.boundaryFrameCount,
        },
        composite: {
          ...compositeResult,
          signature: record.compositeSignature,
          frames: record.frameCount,
        },
      });
      if (
        contentResult.cache === "miss"
        || boundaryResult.cache === "miss"
        || compositeResult.cache === "miss"
      ) {
        console.error(
          `[${position + 1}/${baselineRecords.length}] rendered ${record.id} `
          + `(boundary ${record.boundaryFrameCount}, content ${record.contentFrameCount}, `
          + `total ${record.frameCount} frames)`
        );
      }
      if (errors.length || failedRequests.length || audioRequests.length) {
        throw new Error(
          `Browser error while rendering ${record.id}: `
          + JSON.stringify({ errors, failedRequests, audioRequests })
        );
      }
    }

    const assemblySignature = signatureFor({
      schema: "logamee-motion-silent-assembly-v1",
      units: baselineRecords.map((record) => ({
        id: record.id,
        compositeSignature: record.compositeSignature,
        frameCount: record.frameCount,
      })),
      settings: renderSettings,
    });
    const silentOutput = path.join(
      cacheDir,
      "assembly",
      `${assemblySignature}.silent.mp4`
    );
    let silentAssemblyCache = "hit";
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const finalTemporary = `${outputPath}.tmp-${process.pid}`;
    if (fs.existsSync(finalTemporary)) {
      throw new Error(`Refusing to overwrite an incomplete assembled output: ${finalTemporary}`);
    }
    if (!fs.existsSync(silentOutput)) {
      silentAssemblyCache = "miss";
      fs.mkdirSync(path.dirname(silentOutput), { recursive: true });
      const silentTemporary = `${silentOutput}.tmp-${process.pid}`;
      if (fs.existsSync(silentTemporary)) {
        throw new Error(`Refusing to overwrite an incomplete silent assembly: ${silentTemporary}`);
      }
      await concatVideoFiles(
        baselineRecords.map((record) => record.compositeCachePath),
        silentTemporary,
        "silent assembly",
      );
      promote(silentTemporary, silentOutput, "silent assembly");
    }

    const silentProbe = probeMedia(silentOutput);
    const silentVideo = silentProbe.streams?.find((stream) => stream.codec_type === "video");
    const totalFrames = baselineRecords.reduce((sum, record) => sum + record.frameCount, 0);
    const silentValidation = validateSegment(silentOutput, totalFrames);
    if (!silentValidation.valid) {
      throw new Error(
        `Assembled silent video failed its stream contract: ${JSON.stringify(silentValidation)}`
      );
    }
    if (!fs.existsSync(silentOutput)) {
      throw new Error(
        `Assembled silent video disappeared after validation: ${silentOutput}`
      );
    }

    let finalProbe;
    let finalOutputPath = finalTemporary;
    let audioVideoDeltaSeconds = null;
    if (audioPath) {
      const audioProbe = probeMedia(audioPath);
      const audioStream = audioProbe.streams?.find((stream) => stream.codec_type === "audio");
      const videoDuration = Number(silentProbe.format?.duration || 0);
      const audioDuration = Number(audioStream?.duration || audioProbe.format?.duration || 0);
      audioVideoDeltaSeconds = audioDuration - videoDuration;
      await runFfmpeg([
        "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
        "-i", silentOutput,
        "-i", audioPath,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        "-f", "mp4",
        finalTemporary,
      ], null, "audio mux");
      finalProbe = probeMedia(finalTemporary);
      if (Math.abs(audioVideoDeltaSeconds) > 0.35) {
        throw new Error(
          `Audio/video duration delta is too large: ${audioVideoDeltaSeconds.toFixed(3)}s`
        );
      }
    } else {
      if (!fs.existsSync(silentOutput)) {
        throw new Error(
          `Silent assembly is unavailable before final copy: ${silentOutput}`
        );
      }
      fs.copyFileSync(silentOutput, finalTemporary);
      finalProbe = probeMedia(finalTemporary);
    }
    execFileSync("ffmpeg", [
      "-hide_banner", "-v", "error", "-i", finalTemporary,
      "-f", "null", "-",
    ], { stdio: "pipe" });
    fs.renameSync(finalTemporary, outputPath);

    const finalVideo = finalProbe.streams?.find((stream) => stream.codec_type === "video");
    const finalAudio = finalProbe.streams?.find((stream) => stream.codec_type === "audio");
    const timelineManifest = {
      schema: "logamee-timeline-manifest-v2",
      format: "motion",
      reviewMode: audioPath ? "audio-mux-render" : "no-audio-motion-demonstration",
      sourceHtml: path.relative(projectRoot, htmlPath),
      sourceHtmlSha256: htmlSha256,
      generatedAt: new Date().toISOString(),
      settings: renderSettings,
      clockBasis: audioPath ? "audio-mux-after-approved-visual-timeline" : "deterministic-local-unit-time",
      totalFrames,
      totalDurationSeconds: totalFrames / fps,
      units: baselineRecords.map((record) => ({
        id: record.id,
        order: record.index,
        startSeconds: record.start,
        durationSeconds: record.duration,
        motionDurationSeconds: record.motionDuration,
        encodedDurationSeconds: record.frameCount / fps,
        frameCount: record.frameCount,
        startFrame: record.startFrame,
        endFrame: record.endFrame,
        boundaryStartFrame: record.startFrame,
        boundaryEndFrame: record.startFrame + record.boundaryFrameCount,
        contentStartFrame: record.startFrame + record.boundaryFrameCount,
        contentEndFrame: record.endFrame,
        boundaryDurationSeconds: record.boundaryDuration,
        contentDurationSeconds: record.contentFrameCount / fps,
        contentStartSeconds: record.contentStartSeconds,
        dependsOn: record.dependsOn,
        transitionDependsOn: record.transitionDependsOn,
        transition: record.transition,
        compositeSignature: record.compositeSignature,
        boundarySignature: record.boundarySignature,
        subtitle: record.basePayload.subtitles,
        contentSignature: record.signature,
        hasAudio: false,
      })),
    };
    const renderManifest = {
      schema: "logamee-render-manifest-v2",
      rendererSchema,
      generatedAt: new Date().toISOString(),
      sourceHtml: path.relative(projectRoot, htmlPath),
      sourceHtmlSha256: htmlSha256,
      sharedSignature,
      sharedRevision: readiness.sharedRevision,
      settings: renderSettings,
      output: path.relative(projectRoot, outputPath),
      outputSha256: hashFile(outputPath),
      silentAssembly: path.relative(projectRoot, silentOutput),
      totalFrames,
      totalDurationSeconds: Number(finalProbe.format?.duration || 0),
      audio: audioPath ? {
        source: path.relative(projectRoot, audioPath),
        sha256: hashFile(audioPath),
        stream: finalAudio ? "present" : "missing",
        durationDeltaSeconds: audioVideoDeltaSeconds,
      } : { stream: "none" },
      cacheLayers: {
        content: {
          hits: renderPlan.filter((entry) => entry.content.cache === "hit").length,
          misses: renderPlan
            .filter((entry) => entry.content.cache === "miss")
            .map((entry) => ({ unit: entry.id, reason: entry.content.reason })),
        },
        boundary: {
          hits: renderPlan.filter((entry) => entry.boundary.cache === "hit").length,
          misses: renderPlan
            .filter((entry) => entry.boundary.cache === "miss")
            .map((entry) => ({ unit: entry.id, reason: entry.boundary.reason })),
        },
        composite: {
          hits: renderPlan.filter((entry) => entry.composite.cache === "hit").length,
          misses: renderPlan
            .filter((entry) => entry.composite.cache === "miss")
            .map((entry) => ({ unit: entry.id, reason: entry.composite.reason })),
        },
      },
      renderedUnitCount: renderPlan.filter((entry) => (
        entry.content.cache === "miss"
        || entry.boundary.cache === "miss"
        || entry.composite.cache === "miss"
      )).length,
      reusedUnitCount: renderPlan.filter((entry) => (
        entry.content.cache !== "miss"
        && entry.boundary.cache !== "miss"
        && entry.composite.cache !== "miss"
      )).length,
      assembly: {
        cache: silentAssemblyCache,
        signature: assemblySignature,
        path: path.relative(projectRoot, silentOutput),
        frames: totalFrames,
        bytes: Number(silentProbe.format?.size || fs.statSync(silentOutput).size),
      },
      units: baselineRecords.map((record, index) => ({
        id: record.id,
        index: record.index,
        startFrame: record.startFrame,
        endFrame: record.endFrame,
        contentSignature: record.signature,
        boundarySignature: record.boundarySignature,
        compositeSignature: record.compositeSignature,
        content: record.contentCachePath
          ? path.relative(projectRoot, record.contentCachePath)
          : null,
        boundary: record.boundaryCachePath
          ? path.relative(projectRoot, record.boundaryCachePath)
          : null,
        composite: path.relative(projectRoot, record.compositeCachePath),
        frameCount: record.frameCount,
        contentCache: renderedUnits[index]?.content.cache || renderPlan[index].content.cache,
        contentCacheReason: renderedUnits[index]?.content.reason || renderPlan[index].content.reason,
        boundaryCache: renderedUnits[index]?.boundary.cache || renderPlan[index].boundary.cache,
        boundaryCacheReason: renderedUnits[index]?.boundary.reason || renderPlan[index].boundary.reason,
        compositeCache: renderedUnits[index]?.composite.cache || renderPlan[index].composite.cache,
        compositeCacheReason: renderedUnits[index]?.composite.reason || renderPlan[index].composite.reason,
      })),
      unitResults: renderedUnits,
      browserErrors: errors,
      failedRequests,
      audioRequests,
      validation: {
        fullDecode: "passed",
        frameCount: Number(finalVideo?.nb_read_frames || 0),
        expectedFrameCount: totalFrames,
        videoStream: finalVideo,
        audioStream: finalAudio || "none",
        outputBytes: Number(finalProbe.format?.size || fs.statSync(outputPath).size),
      },
      totalRenderAndAssemblySeconds: (performance.now() - runStarted) / 1000,
    };
    if (errors.length || failedRequests.length || audioRequests.length) {
      throw new Error(
        `Unexpected browser activity: ${JSON.stringify({ errors, failedRequests, audioRequests })}`
      );
    }
    writeJson(timelineManifestPath, timelineManifest);
    writeJson(renderManifestPath, renderManifest);
    console.log(JSON.stringify({
      result: "rendered",
      output: path.relative(projectRoot, outputPath),
      units: baselineRecords.length,
      contentCacheHits: renderManifest.cacheLayers.content.hits,
      contentCacheMisses: renderManifest.cacheLayers.content.misses.length,
      cacheLayers: renderManifest.cacheLayers,
      durationSeconds: renderManifest.totalDurationSeconds,
      fullDecode: "passed",
      validation: renderManifest.validation,
      audioStream: finalAudio ? "present" : "none",
      timelineManifest: path.relative(projectRoot, timelineManifestPath),
      renderManifest: path.relative(projectRoot, renderManifestPath),
    }, null, 2));
  }
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  if (server.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
}
