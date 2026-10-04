#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
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
    "Usage: node render_deck_incrementally.mjs --html=<deck.html> [--dry-run]"
  );
}

const htmlPath = path.resolve(htmlArg);
const projectRoot = path.dirname(htmlPath);
const htmlName = path.basename(htmlPath);
if (!fs.existsSync(htmlPath)) throw new Error(`HTML file not found: ${htmlPath}`);

const fps = Number(option("--fps", "24"));
const width = Number(option("--width", "1920"));
const height = Number(option("--height", "1080"));
const crf = Number(option("--crf", "20"));
const preset = option("--preset", "veryfast");
const expectedUnits = option("--expect-units")
  ? Number(option("--expect-units"))
  : null;
const verifyUnit = option("--verify-local-invalidation");
const dryRun = hasFlag("--dry-run") || Boolean(verifyUnit);
const outputPath = path.resolve(
  projectRoot,
  option("--output", `render/${path.parse(htmlName).name}-motion-review.mp4`)
);
const cacheDir = path.resolve(
  projectRoot,
  option("--cache-dir", `render-cache/${path.parse(htmlName).name}-motion-v4`)
);
const renderManifestPath = path.resolve(
  projectRoot,
  option("--render-manifest", "render-manifest.motion-preview.json")
);
const timelineManifestPath = path.resolve(
  projectRoot,
  option("--timeline-manifest", "timeline-manifest.motion-preview.json")
);
const renderSettings = {
  width,
  height,
  fps,
  codec: "h264",
  pixelFormat: "yuv420p",
  preset,
  crf,
  audio: false
};
const rendererSchema = "logamee-deck-incremental-render-v3";
const compositeSchema = "logamee-deck-composite-segment-v1";
const overlaySchema = "logamee-deck-chrome-overlay-v1";
const errors = [];
const failedRequests = [];
const audioRequests = [];

if (![fps, width, height, crf].every(Number.isFinite) || fps <= 0 || width <= 0 || height <= 0) {
  throw new Error("fps, width, height, and crf must be valid positive numbers.");
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
const promoteCacheArtifact = (temporary, destination, label) => {
  if (fs.existsSync(destination)) {
    throw new Error(
      `Refusing to replace existing ${label} cache artifact: ${destination}`
    );
  }
  fs.renameSync(temporary, destination);
};
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
  ".otf": "font/otf"
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
      "cache-control": "no-store"
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
      candidates.push(pathToFileURL(path.resolve(configured)).href);
    }
  }

  for (const resolveFrom of [projectRoot, process.cwd(), path.dirname(process.execPath)]) {
    try {
      candidates.push(requireFromScript.resolve("playwright", { paths: [resolveFrom] }));
    } catch {}
  }

  candidates.push("playwright");
  for (const candidate of [...new Set(candidates)]) {
    try {
      const importTarget = fs.existsSync(candidate)
        ? pathToFileURL(path.resolve(candidate)).href
        : candidate;
      return await import(importTarget);
    } catch {}
  }

  throw new Error(
    "Playwright is required. Install it in the current Node environment or set PLAYWRIGHT_MODULE to a module path."
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
        path.join(process.env.LOCALAPPDATA || "", "ms-playwright")
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
          candidates.push(path.join(
            directory,
            `chrome-headless-shell-win32-${architecture}`,
            "chrome-headless-shell.exe"
          ));
        }
      }
      if (entry.startsWith("chromium-")) {
        for (const architecture of ["arm64", "x64"]) {
          candidates.push(path.join(
            directory,
            `chrome-mac-${architecture}`,
            "Chromium.app/Contents/MacOS/Chromium"
          ));
          candidates.push(path.join(
            directory,
            `chrome-linux-${architecture}`,
            "chrome"
          ));
          candidates.push(path.join(
            directory,
            `chrome-win-${architecture}`,
            "chrome.exe"
          ));
        }
      }
    }
  }
  return candidates.filter((candidate) => fs.existsSync(candidate));
};

const launchBrowser = async (chromium) => {
  const args = [
    "--autoplay-policy=no-user-gesture-required",
    "--mute-audio",
    "--disable-dev-shm-usage"
  ];
  const bundledExecutable = (() => {
    try {
      return chromium.executablePath();
    } catch {
      return undefined;
    }
  })();
  const candidates = [undefined, bundledExecutable, ...findBrowserExecutable()]
    .filter((candidate, index, all) => candidate === undefined || all.indexOf(candidate) === index);
  let lastError;
  for (const executablePath of candidates) {
    try {
      return await chromium.launch({
        headless: true,
        ...(executablePath ? { executablePath } : {}),
        args
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Could not launch Chromium: ${lastError?.message || "unknown error"}`);
};

const runFfmpeg = (commandArgs, inputFrames = null, progressLabel = "") => new Promise(
  (resolve, reject) => {
    const child = spawn("ffmpeg", commandArgs, {
      stdio: [inputFrames ? "pipe" : "ignore", "ignore", "pipe"]
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr = `${stderr}${chunk.toString()}`.slice(-8000);
    });
    const closePromise = new Promise((childResolve, childReject) => {
      child.once("error", childReject);
      child.once("close", (code) => {
        if (code === 0) childResolve();
        else childReject(new Error(
          `FFmpeg ${progressLabel || "operation"} exited ${code}: ${stderr}`
        ));
      });
    });
    const writeFrames = async () => {
      try {
        for (const frame of inputFrames || []) {
          if (child.stdin.destroyed) throw new Error("FFmpeg input pipe closed early.");
          try {
            if (child.stdin.write(frame)) continue;
          } catch (error) {
            if (error.code !== "EPIPE") throw error;
            await closePromise;
            return;
          }
          if (!child.stdin.writableEnded) {
            await new Promise((drainResolve, drainReject) => {
              const onDrain = () => {
                child.stdin.off("error", onError);
                drainResolve();
              };
              const onError = (error) => {
                child.stdin.off("drain", onDrain);
                if (error.code === "EPIPE") {
                  closePromise.then(drainResolve, drainReject);
                  return;
                }
                drainReject(error);
              };
              child.stdin.once("drain", onDrain);
              child.stdin.once("error", onError);
            });
          }
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

const probeVideo = (file, countFrames = true) => {
  const streamFields = [
    "codec_type", "codec_name", "width", "height", "pix_fmt",
    "avg_frame_rate", "duration", "nb_frames"
  ];
  if (countFrames) streamFields.push("nb_read_frames");
  const entries = `stream=${streamFields.join(",")}:format=duration,size`;
  const output = execFileSync("ffprobe", [
    "-v", "error",
    ...(countFrames ? ["-count_frames"] : []),
    "-show_entries", entries,
    "-of", "json",
    file
  ], { encoding: "utf8" });
  return JSON.parse(output);
};

const validateSegment = (file, expectedFrames) => {
  if (!fs.existsSync(file) || fs.statSync(file).size < 2048) {
    return { valid: false, reason: "missing-or-truncated" };
  }
  try {
    const probe = probeVideo(file);
    const video = probe.streams?.find((stream) => stream.codec_type === "video");
    const valid = video?.codec_name === "h264"
      && video.width === width
      && video.height === height
      && video.pix_fmt === "yuv420p"
      && video.avg_frame_rate === `${fps}/1`
      && Number(video.nb_read_frames) === expectedFrames
      && !probe.streams.some((stream) => stream.codec_type === "audio");
    return {
      valid,
      reason: valid ? null : "media-contract-mismatch",
      video,
      bytes: Number(probe.format?.size || fs.statSync(file).size)
    };
  } catch (error) {
    return { valid: false, reason: `probe-failed: ${error.message}` };
  }
};

const validateOverlay = (file) => {
  if (!fs.existsSync(file) || fs.statSync(file).size < 128) {
    return { valid: false, reason: "missing-or-truncated" };
  }
  try {
    const probe = JSON.parse(execFileSync("ffprobe", [
      "-v", "error",
      "-select_streams", "v:0",
      "-show_entries", "stream=codec_name,width,height,pix_fmt",
      "-of", "json",
      file
    ], { encoding: "utf8" }));
    const image = probe.streams?.[0];
    const valid = image?.codec_name === "png"
      && image.width === width
      && image.height === height
      && ["rgba", "bgra", "argb", "abgr", "gbrap", "ya8"].includes(image.pix_fmt);
    return {
      valid,
      reason: valid ? null : "overlay-contract-mismatch",
      image,
      bytes: fs.statSync(file).size
    };
  } catch (error) {
    return { valid: false, reason: `probe-failed: ${error.message}` };
  }
};

const hashFile = (file) => sha256(fs.readFileSync(file));
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
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText || "request failed"
    });
  });
  page.on("request", (request) => {
    if (/\.(wav|mp3|m4a|aac|ogg|opus)(?:$|[?#])/i.test(request.url())) {
      audioRequests.push(request.url());
    }
  });

  const pageUrl = `http://127.0.0.1:${serverAddress.port}/${encodeURIComponent(htmlName)}`
    + "?motionPreview=1&render=1";
  await page.goto(pageUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.deckReady === true);
  const readiness = await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => null))
    );
    return {
      deckReady: window.deckReady === true,
      rendererSchema: window.deckRendererSchema || null,
      state: window.getDeckState?.(),
      failedImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src)
    };
  });
  if (!readiness.deckReady || !readiness.state?.motionPreviewMode) {
    throw new Error(`The HTML did not enter no-audio motion mode: ${JSON.stringify(readiness)}`);
  }
  if (readiness.failedImages.length) {
    throw new Error(`Images failed to load: ${readiness.failedImages.join(", ")}`);
  }
  if (readiness.rendererSchema !== "logamee-deck-unit-v3") {
    throw new Error(
      "The HTML is missing the stable per-unit renderer contract; update its unit IDs and seek API."
    );
  }

  if (verifyUnit) {
    const found = await page.evaluate((unitId) => {
      const slide = document.querySelector(`.slide[data-unit-id="${CSS.escape(unitId)}"]`);
      const heading = slide?.querySelector(".slide-title");
      if (!slide || !heading) return false;
      heading.textContent += " [cache-isolation-check]";
      return true;
    }, verifyUnit);
    if (!found) throw new Error(`Cannot find a titled unit for isolation check: ${verifyUnit}`);
  }

  const sharedData = await page.evaluate(() => {
    const stage = document.querySelector("#stage").cloneNode(true);
    stage.className = "stage";
    stage.querySelectorAll(".slide").forEach((slide) => slide.remove());
    stage.querySelector("#slides-root")?.replaceChildren();
    const subtitle = stage.querySelector("#subtitle");
    if (subtitle) {
      subtitle.textContent = "";
      subtitle.classList.remove("visible");
    }
    stage.querySelector("#review-note-body")?.replaceChildren();
    stage.removeAttribute("style");
    stage.querySelector(".progress-track span")?.removeAttribute("style");
    return {
      shell: stage.outerHTML,
      inlineStyles: [...document.querySelectorAll("style")].map((style) => style.textContent),
      sharedResources: [
        ...document.querySelectorAll("script[src],link[rel='stylesheet'][href]")
      ].map((element) => element.src || element.href),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      }
    };
  });
  const units = await page.evaluate(() => window.getDeckRenderUnits());
  if (!Array.isArray(units) || units.length === 0) {
    throw new Error("The HTML returned no render units.");
  }
  if (expectedUnits !== null && units.length !== expectedUnits) {
    throw new Error(`Expected ${expectedUnits} units, but HTML exposed ${units.length}.`);
  }
  const ids = units.map((unit) => unit.id);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error(`Every render unit needs a unique stable ID: ${ids.join(", ")}`);
  }
  if (verifyUnit && !ids.includes(verifyUnit)) {
    throw new Error(`Isolation target is not a stable unit ID: ${verifyUnit}`);
  }

  const baseOrigin = `http://127.0.0.1:${serverAddress.port}`;
  const resolveLocalAsset = (reference) => {
    if (reference.startsWith("data:")) {
      return { inline: sha256(reference), description: "inline-data" };
    }
    const url = new URL(reference, pageUrl);
    if (url.origin !== baseOrigin) {
      throw new Error(
        `External render dependency cannot be fingerprinted locally: ${url.href}`
      );
    }
    const file = path.resolve(projectRoot, decodeURIComponent(url.pathname).replace(/^\/+/, ""));
    if (!file.startsWith(`${projectRoot}${path.sep}`)) {
      throw new Error(`Asset resolves outside the project root: ${reference}`);
    }
    if (!fs.existsSync(file)) throw new Error(`Render asset is missing: ${file}`);
    return { file, sha256: hashFile(file) };
  };

  const sharedAssetHashes = {};
  for (const reference of new Set([
    ...sharedData.sharedResources,
    ...sharedData.inlineStyles.flatMap((css) => {
      const matches = css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g);
      return [...matches]
        .map((match) => match[1])
        .filter((reference) => (
          reference
          && !reference.startsWith("data:")
          && !reference.startsWith("#")
          && !reference.startsWith("%23")
        ));
    })
  ])) {
    const resolved = resolveLocalAsset(reference);
    sharedAssetHashes[reference] = resolved.sha256
      ? resolved.sha256
      : resolved.inline || sha256(resolved.external);
  }

  const computedSharedSignature = sha256(JSON.stringify({
    rendererSchema,
    htmlRendererSchema: readiness.rendererSchema,
    settings: renderSettings,
    shell: sha256(sharedData.shell),
    styles: sharedData.inlineStyles.map(sha256),
    sharedAssetHashes,
    viewport: sharedData.viewport
  }));
  const oldRenderManifest = readJson(renderManifestPath);
  const sourceHtmlSha256 = hashFile(htmlPath);
  const canReuseManifestSharedSignature = (
    oldRenderManifest?.sourceHtml === path.relative(projectRoot, htmlPath)
    && oldRenderManifest?.sourceHtmlSha256 === sourceHtmlSha256
    && oldRenderManifest?.rendererSchema === rendererSchema
    && JSON.stringify(oldRenderManifest?.settings) === JSON.stringify(renderSettings)
    && typeof oldRenderManifest.sharedSignature === "string"
  );
  const sharedSignature = canReuseManifestSharedSignature
    ? oldRenderManifest.sharedSignature
    : computedSharedSignature;
  const unitRecords = [];
  const pageCount = Math.max(0, units.length - 1);
  for (const unit of units) {
    const assetHashes = {};
    for (const reference of unit.assetUrls) {
      const resolved = resolveLocalAsset(reference);
      assetHashes[reference] = resolved.sha256
        ? resolved.sha256
        : resolved.inline || sha256(resolved.external);
    }
    const frameCount = Math.max(1, Math.ceil(unit.durationSeconds * fps));
    const signaturePayload = {
      rendererSchema,
      sharedSignature,
      id: unit.id,
      revision: unit.revision,
      markupDigest: unit.markupDigest,
      animationDigest: unit.animationDigest,
      narration: unit.narration,
      caption: unit.caption,
      assetHashes,
      durationSeconds: unit.durationSeconds,
      frameCount,
      settings: renderSettings
    };
    const signature = sha256(JSON.stringify(signaturePayload));
    const safeId = unit.id.replace(/[^a-zA-Z0-9_-]/g, "_");
    const pageNumber = unit.index === 0 ? null : unit.index;
    const overlayPayload = {
      schema: overlaySchema,
      sharedSignature,
      id: unit.id,
      pageOrder: unit.index,
      pageNumber,
      pageCount,
      progress: pageNumber === null || pageCount === 0 ? 0 : pageNumber / pageCount,
      viewport: sharedData.viewport,
      settings: renderSettings
    };
    const overlaySignature = sha256(JSON.stringify(overlayPayload));
    const compositePayload = {
      schema: compositeSchema,
      contentSignature: signature,
      overlaySignature,
      settings: renderSettings
    };
    const compositeSignature = sha256(JSON.stringify(compositePayload));
    unitRecords.push({
      ...unit,
      pageNumber,
      pageCount,
      frameCount,
      durationFrames: frameCount,
      encodedDurationSeconds: frameCount / fps,
      startFrame: 0,
      endFrame: frameCount,
      signature,
      signaturePayload,
      contentPath: path.join(
        cacheDir,
        "content",
        safeId,
        `${signature}.mp4`
      ),
      overlaySignature,
      overlayPayload,
      overlayPath: path.join(
        cacheDir,
        "overlays",
        safeId,
        `${overlaySignature}.png`
      ),
      compositeSignature,
      compositePayload,
      segmentPath: path.join(
        cacheDir,
        "composed",
        safeId,
        `${compositeSignature}.mp4`
      )
    });
  }

  let nextFrame = 0;
  for (const record of unitRecords) {
    record.startFrame = nextFrame;
    nextFrame += record.frameCount;
    record.endFrame = nextFrame;
  }
  const renderPlan = [];
  for (const record of unitRecords) {
    const previous = oldRenderManifest?.units?.find((unit) => unit.id === record.id);
    const contentValidation = validateSegment(record.contentPath, record.frameCount);
    const overlayValidation = validateOverlay(record.overlayPath);
    const compositeValidation = validateSegment(record.segmentPath, record.frameCount);
    const invalidExistingEntries = [
      [record.contentPath, contentValidation, "content"],
      [record.overlayPath, overlayValidation, "overlay"],
      [record.segmentPath, compositeValidation, "composite"]
    ].filter(([file, validation]) => fs.existsSync(file) && !validation.valid);
    if (invalidExistingEntries.length) {
      throw new Error(
        `Invalid cache artifacts exist and will be preserved: ${JSON.stringify(
          invalidExistingEntries.map(([file, validation, layer]) => ({
            layer,
            path: path.relative(projectRoot, file),
            reason: validation.reason
          }))
        )}`
      );
    }
    const cacheState = (validation, file, previousSignature, currentSignature, label) => {
      if (validation.valid) return { cache: "hit", reason: null };
      if (fs.existsSync(file)) return { cache: "miss", reason: validation.reason };
      if (previousSignature && previousSignature !== currentSignature) {
        return { cache: "miss", reason: `${label}-dependency-signature-changed` };
      }
      return { cache: "miss", reason: "cache-file-missing" };
    };
    const contentState = cacheState(
      contentValidation,
      record.contentPath,
      previous?.contentSignature || previous?.signature,
      record.signature,
      "content"
    );
    const overlayState = cacheState(
      overlayValidation,
      record.overlayPath,
      previous?.overlaySignature,
      record.overlaySignature,
      "overlay"
    );
    const compositeState = cacheState(
      compositeValidation,
      record.segmentPath,
      previous?.compositeSignature,
      record.compositeSignature,
      "composite"
    );
    renderPlan.push({
      id: record.id,
      index: record.index,
      page: record.pageNumber,
      durationSeconds: record.durationSeconds,
      frameCount: record.frameCount,
      content: {
        ...contentState,
        path: path.relative(projectRoot, record.contentPath),
        signature: record.signature,
        validation: contentValidation
      },
      overlay: {
        ...overlayState,
        path: path.relative(projectRoot, record.overlayPath),
        signature: record.overlaySignature,
        validation: overlayValidation
      },
      composite: {
        ...compositeState,
        path: path.relative(projectRoot, record.segmentPath),
        signature: record.compositeSignature,
        validation: compositeValidation
      }
    });
  }

  if (verifyUnit) {
    const contentUnexpected = renderPlan.filter((entry) => (
      entry.content.cache !== (entry.id === verifyUnit ? "miss" : "hit")
    ));
    const overlayUnexpected = renderPlan.filter((entry) => entry.overlay.cache !== "hit");
    const compositeUnexpected = renderPlan.filter((entry) => (
      entry.composite.cache !== (entry.id === verifyUnit ? "miss" : "hit")
    ));
    if (
      contentUnexpected.length
      || overlayUnexpected.length
      || compositeUnexpected.length
    ) {
      throw new Error(
        `Unit-isolation check failed: ${JSON.stringify({
          content: contentUnexpected.map((entry) => ({
            id: entry.id,
            expected: entry.id === verifyUnit ? "miss" : "hit",
            actual: entry.content.cache,
            reason: entry.content.reason
          })),
          overlay: overlayUnexpected.map((entry) => ({
            id: entry.id,
            expected: "hit",
            actual: entry.overlay.cache,
            reason: entry.overlay.reason
          })),
          composite: compositeUnexpected.map((entry) => ({
          id: entry.id,
            expected: entry.id === verifyUnit ? "miss" : "hit",
            actual: entry.composite.cache,
            reason: entry.composite.reason
          }))
        })}`
      );
    }
    console.log(JSON.stringify({
      result: "passed",
      test: "single-unit dependency change",
      changedUnit: verifyUnit,
      contentCacheHits: renderPlan
        .filter((entry) => entry.content.cache === "hit")
        .map((entry) => entry.id),
      contentCacheMisses: renderPlan
        .filter((entry) => entry.content.cache === "miss")
        .map((entry) => ({ id: entry.id, reason: entry.content.reason })),
      overlayCacheHits: renderPlan
        .filter((entry) => entry.overlay.cache === "hit")
        .map((entry) => entry.id),
      compositeCacheHits: renderPlan
        .filter((entry) => entry.composite.cache === "hit")
        .map((entry) => entry.id),
      compositeCacheMisses: renderPlan
        .filter((entry) => entry.composite.cache === "miss")
        .map((entry) => ({ id: entry.id, reason: entry.composite.reason })),
      note: "The change was applied in the browser only; project HTML and persistent cache files were not modified."
    }, null, 2));
    process.exitCode = 0;
  } else if (dryRun) {
    console.log(JSON.stringify({
      result: "plan-only",
      sourceHtml: path.relative(projectRoot, htmlPath),
      units: unitRecords.length,
      totalFrames: nextFrame,
      durationSeconds: nextFrame / fps,
      sharedSignature,
      contentCacheHits: renderPlan.filter((entry) => entry.content.cache === "hit").length,
      contentCacheMisses: renderPlan.filter((entry) => entry.content.cache === "miss").length,
      overlayCacheHits: renderPlan.filter((entry) => entry.overlay.cache === "hit").length,
      overlayCacheMisses: renderPlan.filter((entry) => entry.overlay.cache === "miss").length,
      compositeCacheHits: renderPlan.filter((entry) => entry.composite.cache === "hit").length,
      compositeCacheMisses: renderPlan.filter((entry) => entry.composite.cache === "miss").length,
      plan: renderPlan.map((entry) => ({
        id: entry.id,
        index: entry.index,
        page: entry.page,
        durationSeconds: entry.durationSeconds,
        frameCount: entry.frameCount,
        contentCache: entry.content.cache,
        contentReason: entry.content.reason,
        overlayCache: entry.overlay.cache,
        overlayReason: entry.overlay.reason,
        compositeCache: entry.composite.cache,
        compositeReason: entry.composite.reason
      }))
    }, null, 2));
  } else {
    const runStarted = performance.now();
    const renderedUnits = [];
    const pageErrorsBeforeRender = errors.length;
    for (const [position, record] of unitRecords.entries()) {
      const plan = renderPlan[position];
      const unitResult = {
        id: record.id,
        content: {
          cache: plan.content.cache,
          reason: plan.content.reason,
          path: path.relative(projectRoot, record.contentPath),
          signature: record.signature,
          frames: record.frameCount,
          bytes: plan.content.validation.bytes || 0,
          renderSeconds: 0
        },
        overlay: {
          cache: plan.overlay.cache,
          reason: plan.overlay.reason,
          path: path.relative(projectRoot, record.overlayPath),
          signature: record.overlaySignature,
          bytes: plan.overlay.validation.bytes || 0,
          captureSeconds: 0
        },
        composite: {
          cache: plan.composite.cache,
          reason: plan.composite.reason,
          path: path.relative(projectRoot, record.segmentPath),
          signature: record.compositeSignature,
          frames: record.frameCount,
          bytes: plan.composite.validation.bytes || 0,
          renderSeconds: 0
        },
        frames: record.frameCount
      };

      if (plan.content.cache === "miss") {
        fs.mkdirSync(path.dirname(record.contentPath), { recursive: true });
        const temporaryContent = `${record.contentPath}.tmp-${process.pid}`;
        if (fs.existsSync(temporaryContent)) {
          throw new Error(`Refusing to overwrite an incomplete content render: ${temporaryContent}`);
        }
        await page.evaluate(async (id) => {
          window.setDeckRenderOverlayMode(false);
          await window.prepareDeckUnit(id);
        }, record.id);
        const frameBuffers = [];
        const contentStarted = performance.now();
        for (let frame = 0; frame < record.frameCount; frame += 1) {
          const localTime = frame / fps;
          await page.evaluate(({ id, time }) => window.seekDeckUnit(id, time), {
            id: record.id,
            time: localTime
          });
          frameBuffers.push(await page.screenshot({
            type: "png",
            animations: "disabled"
          }));
        }
        await runFfmpeg([
          "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
          "-f", "image2pipe", "-framerate", String(fps),
          "-vcodec", "png", "-i", "pipe:0",
          "-frames:v", String(record.frameCount),
          "-an",
          "-c:v", "libx264", "-preset", preset, "-crf", String(crf),
          "-r", String(fps), "-fps_mode", "cfr", "-pix_fmt", "yuv420p",
          "-movflags", "+faststart",
          "-f", "mp4",
          temporaryContent
        ], frameBuffers, `${record.id} content`);
        const contentValidation = validateSegment(
          temporaryContent,
          record.frameCount
        );
        if (!contentValidation.valid) {
          throw new Error(
            `Rendered content ${record.id} failed validation: ${JSON.stringify(contentValidation)}`
          );
        }
        promoteCacheArtifact(temporaryContent, record.contentPath, "content");
        unitResult.content.bytes = contentValidation.bytes;
        unitResult.content.renderSeconds = (performance.now() - contentStarted) / 1000;
        console.log(
          `[${position + 1}/${unitRecords.length}] rendered page content ${record.id} `
          + `(${record.frameCount} frames)`
        );
        frameBuffers.length = 0;
      }

      if (plan.overlay.cache === "miss") {
        fs.mkdirSync(path.dirname(record.overlayPath), { recursive: true });
        const temporaryOverlay = `${record.overlayPath}.tmp-${process.pid}`;
        if (fs.existsSync(temporaryOverlay)) {
          throw new Error(`Refusing to overwrite an incomplete overlay: ${temporaryOverlay}`);
        }
        await page.evaluate(async ({ id, pageNumber, pageCount: count }) => {
          window.setDeckRenderOverlayMode(false);
          await window.prepareDeckUnit(id);
          window.setDeckRenderOverlayMode(true, {
            pageNumber,
            pageCount: count
          });
          await document.fonts.ready;
        }, {
          id: record.id,
          pageNumber: record.pageNumber,
          pageCount: record.pageCount
        });
        const overlayStarted = performance.now();
        const overlayBuffer = await page.locator("#stage").screenshot({
          type: "png",
          omitBackground: true,
          animations: "disabled"
        });
        fs.writeFileSync(temporaryOverlay, overlayBuffer, { flag: "wx" });
        const overlayValidation = validateOverlay(temporaryOverlay);
        if (!overlayValidation.valid) {
          throw new Error(
            `Rendered overlay ${record.id} failed validation: ${JSON.stringify(overlayValidation)}`
          );
        }
        promoteCacheArtifact(temporaryOverlay, record.overlayPath, "overlay");
        unitResult.overlay.bytes = overlayValidation.bytes;
        unitResult.overlay.captureSeconds = (performance.now() - overlayStarted) / 1000;
        console.log(
          `[${position + 1}/${unitRecords.length}] captured page-order overlay ${record.id}`
        );
        await page.evaluate(() => window.setDeckRenderOverlayMode(false));
      }

      if (plan.composite.cache === "miss") {
        fs.mkdirSync(path.dirname(record.segmentPath), { recursive: true });
        const temporaryComposite = `${record.segmentPath}.tmp-${process.pid}`;
        if (fs.existsSync(temporaryComposite)) {
          throw new Error(`Refusing to overwrite an incomplete composite: ${temporaryComposite}`);
        }
        const compositeStarted = performance.now();
        await runFfmpeg([
          "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
          "-i", record.contentPath,
          "-loop", "1", "-framerate", String(fps), "-i", record.overlayPath,
          "-filter_complex",
          "[0:v][1:v]overlay=0:0:format=auto:shortest=1,format=yuv420p[video]",
          "-map", "[video]",
          "-frames:v", String(record.frameCount),
          "-an",
          "-c:v", "libx264", "-preset", preset, "-crf", String(crf),
          "-r", String(fps), "-fps_mode", "cfr", "-pix_fmt", "yuv420p",
          "-movflags", "+faststart",
          "-f", "mp4",
          temporaryComposite
        ], null, `${record.id} overlay composite`);
        const compositeValidation = validateSegment(
          temporaryComposite,
          record.frameCount
        );
        if (!compositeValidation.valid) {
          throw new Error(
            `Composited segment ${record.id} failed validation: ${JSON.stringify(compositeValidation)}`
          );
        }
        promoteCacheArtifact(temporaryComposite, record.segmentPath, "composite");
        unitResult.composite.bytes = compositeValidation.bytes;
        unitResult.composite.renderSeconds = (
          performance.now() - compositeStarted
        ) / 1000;
        console.log(
          `[${position + 1}/${unitRecords.length}] composed final page segment ${record.id}`
        );
      }

      renderedUnits.push(unitResult);
      if (errors.length > pageErrorsBeforeRender) {
        throw new Error(`Browser error while rendering ${record.id}: ${errors.join("; ")}`);
      }
    }

    const outputTemporary = `${outputPath}.tmp-${process.pid}`;
    if (fs.existsSync(outputTemporary)) {
      throw new Error(`Refusing to overwrite incomplete assembled output: ${outputTemporary}`);
    }
    const concatInput = unitRecords.map((record) => {
      const escaped = record.segmentPath.replaceAll("'", "'\\''");
      return `file 'file://${escaped}'`;
    }).join("\n") + "\n";
    const concatProcess = spawn("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
      "-protocol_whitelist", "file,pipe,crypto,data",
      "-f", "concat", "-safe", "0", "-i", "pipe:0",
      "-map", "0:v:0", "-an", "-c:v", "copy",
      "-movflags", "+faststart",
      "-f", "mp4",
      outputTemporary
    ], { stdio: ["pipe", "ignore", "pipe"] });
    let concatError = "";
    concatProcess.stderr.on("data", (chunk) => {
      concatError = `${concatError}${chunk.toString()}`.slice(-8000);
    });
    const concatDone = new Promise((resolve, reject) => {
      concatProcess.once("error", reject);
      concatProcess.once("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg concat failed (${code}): ${concatError}`));
      });
    });
    concatProcess.stdin.end(concatInput);
    await concatDone;

    execFileSync("ffmpeg", [
      "-hide_banner", "-v", "error", "-i", outputTemporary,
      "-f", "null", "-"
    ], { stdio: "pipe" });
    const finalProbe = probeVideo(outputTemporary);
    const video = finalProbe.streams?.find((stream) => stream.codec_type === "video");
    const finalFrames = Number(video?.nb_read_frames);
    if (
      video?.codec_name !== "h264"
      || video.width !== width
      || video.height !== height
      || video.pix_fmt !== "yuv420p"
      || video.avg_frame_rate !== `${fps}/1`
      || finalFrames !== nextFrame
      || finalProbe.streams.some((stream) => stream.codec_type === "audio")
    ) {
      throw new Error(
        `Assembled video failed its stream contract: ${JSON.stringify(finalProbe.streams)}`
      );
    }
    const outputFrame = execFileSync("ffmpeg", [
      "-hide_banner", "-v", "error", "-i", outputTemporary,
      "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"
    ], { maxBuffer: width * height * 3 + 1024 });
    let sampleCount = 0;
    let sampleSum = 0;
    let sampleSquareSum = 0;
    for (let offset = 0; offset + 2 < outputFrame.length; offset += 3000) {
      const luminance = 0.2126 * outputFrame[offset]
        + 0.7152 * outputFrame[offset + 1]
        + 0.0722 * outputFrame[offset + 2];
      sampleCount += 1;
      sampleSum += luminance;
      sampleSquareSum += luminance * luminance;
    }
    const sampleVariance = sampleCount
      ? sampleSquareSum / sampleCount - (sampleSum / sampleCount) ** 2
      : 0;
    if (outputFrame.length < width * height * 3 || sampleVariance < 20) {
      throw new Error(`First output frame appears blank: variance=${sampleVariance}`);
    }
    fs.renameSync(outputTemporary, outputPath);

    const contentCacheHits = renderedUnits
      .filter((unit) => unit.content.cache === "hit").length;
    const contentCacheMisses = renderedUnits
      .filter((unit) => unit.content.cache === "miss").length;
    const overlayCacheHits = renderedUnits
      .filter((unit) => unit.overlay.cache === "hit").length;
    const overlayCacheMisses = renderedUnits
      .filter((unit) => unit.overlay.cache === "miss").length;
    const compositeCacheHits = renderedUnits
      .filter((unit) => unit.composite.cache === "hit").length;
    const compositeCacheMisses = renderedUnits
      .filter((unit) => unit.composite.cache === "miss").length;

    const timelineManifest = {
      schema: "logamee-timeline-manifest-v1",
      format: "deck",
      reviewMode: "no-audio-motion-demonstration",
      sourceHtml: path.relative(projectRoot, htmlPath),
      sourceHtmlSha256: hashFile(htmlPath),
      generatedAt: new Date().toISOString(),
      settings: renderSettings,
      totalFrames: nextFrame,
      totalDurationSeconds: nextFrame / fps,
      units: unitRecords.map((record) => ({
        id: record.id,
        pageOrder: record.index,
        displayPage: record.pageNumber,
        sourceSlide: record.sourceSlide,
        label: record.label,
        durationSeconds: record.durationSeconds,
        encodedDurationSeconds: record.encodedDurationSeconds,
        frameCount: record.frameCount,
        startFrame: record.startFrame,
        endFrame: record.endFrame,
        subtitle: record.caption,
        contentSignature: record.signature,
        overlaySignature: record.overlaySignature,
        compositeSignature: record.compositeSignature,
        hasAudio: false
      }))
    };
    const renderManifest = {
      schema: "logamee-render-manifest-v1",
      rendererSchema,
      generatedAt: new Date().toISOString(),
      sourceHtml: path.relative(projectRoot, htmlPath),
      sourceHtmlSha256: hashFile(htmlPath),
      sharedSignature,
      settings: renderSettings,
      output: path.relative(projectRoot, outputPath),
      outputSha256: hashFile(outputPath),
      totalFrames: nextFrame,
      totalDurationSeconds: Number(finalProbe.format.duration),
      cacheLayers: {
        content: { hits: contentCacheHits, misses: contentCacheMisses },
        overlay: { hits: overlayCacheHits, misses: overlayCacheMisses },
        composite: { hits: compositeCacheHits, misses: compositeCacheMisses }
      },
      renderedUnitCount: contentCacheMisses,
      reusedUnitCount: contentCacheHits,
      units: unitRecords.map((record, index) => ({
        id: record.id,
        index: record.index,
        contentSignature: record.signature,
        overlaySignature: record.overlaySignature,
        compositeSignature: record.compositeSignature,
        content: path.relative(projectRoot, record.contentPath),
        overlay: path.relative(projectRoot, record.overlayPath),
        segment: path.relative(projectRoot, record.segmentPath),
        frameCount: record.frameCount,
        contentCache: renderedUnits[index]?.content.cache,
        overlayCache: renderedUnits[index]?.overlay.cache,
        compositeCache: renderedUnits[index]?.composite.cache
      })),
      unitResults: renderedUnits,
      browserErrors: errors,
      failedRequests,
      audioRequests,
      validation: {
        fullDecode: "passed",
        frameCount: finalFrames,
        expectedFrameCount: nextFrame,
        firstFrameLuminanceVariance: Number(sampleVariance.toFixed(2)),
        contentCacheHits,
        contentCacheMisses,
        overlayCacheHits,
        overlayCacheMisses,
        compositeCacheHits,
        compositeCacheMisses,
        audioStream: "none",
        streams: finalProbe.streams,
        outputBytes: Number(finalProbe.format.size)
      },
      totalRenderAndAssemblySeconds: (performance.now() - runStarted) / 1000
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
      units: unitRecords.length,
      contentCacheHits,
      contentCacheMisses,
      overlayCacheHits,
      overlayCacheMisses,
      compositeCacheHits,
      compositeCacheMisses,
      durationSeconds: renderManifest.totalDurationSeconds,
      totalRenderAndAssemblySeconds: renderManifest.totalRenderAndAssemblySeconds,
      fullDecode: "passed",
      audioStream: "none",
      timelineManifest: path.relative(projectRoot, timelineManifestPath),
      renderManifest: path.relative(projectRoot, renderManifestPath)
    }, null, 2));
  }
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  if (server.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
}
