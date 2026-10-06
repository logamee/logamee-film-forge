// y1/y2/y3 示例片的中性讲解员接入层。
// window.PRESENTER_MODE:
//   procedural（默认）：纯代码角色，避免项目依赖任何私有素材；
//   frames：用户提供帧库后启用，素材放在 demos/_shared/presenter/；
//   rig：使用 lib/rig_presenter.js 的可编程 FK 骨架。
(() => {
const { clamp, lerp } = U;
const H = window.PRESENTER = {};
const MODE = () => window.PRESENTER_MODE || 'procedural';
H.mode = MODE;
const PNG = n => `demos/_shared/presenter/${n}.png`;
const FRAME_ASSETS = ['frame_0', 'frame_1', 'frame_2', 'line'].map(PNG);
if (MODE() === 'frames') window.EXTRA_ASSETS = (window.EXTRA_ASSETS || []).concat(FRAME_ASSETS);
const img = p => window.IMG[p];
const has = p => !!img(p);

// 把一张图按「脚底中心」放到 (x, y)，高 h；face=-1 水平翻转
const place = (c, im, x, y, h, face = 1, anchorY = 0.97) => {
  const w = im.width * h / im.height; c.save(); c.translate(x, y); if (face < 0) c.scale(-1, 1); c.drawImage(im, -w / 2, -h * anchorY, w, h); c.restore();
};

// ---------- A：极简几何 Q 版 ----------
// 原点 = 两脚之间地面；单位高 1 ≈ 全身高；opt.style: 'flat'（无描边，同色深一档做阴影）| 'line'（白底黑线）| 'print'（平涂＋细黑线）
H.geo = (c, x, y, h, { face = 1, t = 0, style = 'flat', point = true, ink = '#1d1b19' } = {}) => {
  const s = h / 100; c.save(); c.translate(x, y); c.scale(face * s, s);
  const bob = Math.sin(t * 6.5) * 0.8;
  const line = style !== 'flat', lw = style === 'line' ? 2.2 : 1.4;
  const P = { skin: '#ffd8bd', skinSh: '#f2b493', hat: '#ffffff', hatSh: '#dfe3ef', tee: '#ffffff', teeSh: '#e3e6f0', shorts: '#d8c7a6', shortsSh: '#bfa982', shoe: '#ffffff', hair: '#1f1b2e', glass: '#1f1b2e', cheek: 'rgba(255,128,120,.45)' };
  if (style === 'line') Object.assign(P, { skin: '#fbfbf8', skinSh: '#fbfbf8', hatSh: '#fbfbf8', tee: '#fbfbf8', teeSh: '#fbfbf8', shorts: '#fbfbf8', shortsSh: '#fbfbf8', cheek: 'rgba(239,114,38,.35)' });
  // 扁平分面：先铺深一档，再把本色往左上挪 2.5 单位盖回去，右下留一条阴影带（和 Y1 的 flat 同一招）
  const shape = (path, fill, sh) => { if (sh && sh !== fill) { c.save(); c.clip(path); c.fillStyle = sh; c.fill(path); c.translate(-2.5, -2); c.fillStyle = fill; c.fill(path); c.restore(); } else { c.fillStyle = fill; c.fill(path); } if (line) { c.strokeStyle = ink; c.lineWidth = lw; c.stroke(path); } };
  const rr = (x0, y0, w, hh, r) => { const p = new Path2D(); p.roundRect(x0, y0, w, hh, r); return p; };
  const el = (cx, cy, rx, ry) => { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); return p; };
  c.lineJoin = 'round'; c.lineCap = 'round';
  // 腿＋洞洞鞋
  for (const lx of [-7, 7]) { shape(rr(lx - 3, -14, 6, 12, 3), P.skin, P.skinSh); shape(el(lx + 2.5, -2, 7.5, 4), P.shoe, P.hatSh); }
  c.fillStyle = ink; for (const lx of [-7, 7]) for (const [dx, dy] of [[-1, -3], [2, -3.5], [5, -2.5]]) { c.beginPath(); c.arc(lx + 2.5 + dx, -2 + dy + 1, 0.8, 0, 7); c.fill(); }
  c.translate(0, bob);
  shape(rr(-12, -26, 24, 13, 4), P.shorts, P.shortsSh);                      // 短裤
  // 远侧手臂（自然下垂，手表）
  shape(rr(-15, -42, 6, 16, 3), P.skin, P.skinSh); c.fillStyle = ink; c.fillRect(-15.5, -30, 7, 3);
  shape(rr(-14, -46, 28, 22, 7), P.tee, P.teeSh);                            // T 恤
  // 近侧手臂：指向前方（point）或下垂
  if (point) { c.save(); c.translate(10, -42); c.rotate(-1.35 + Math.sin(t * 3.4) * 0.06); shape(rr(-3.2, 0, 6.4, 20, 3.2), P.skin, P.skinSh); shape(el(0, 21, 3.6, 3.6), P.skin); c.restore(); }
  else shape(rr(9, -42, 6, 16, 3), P.skin, P.skinSh);
  // 头：正面大圆脸（头身比约 1:1.2）。正面比侧面好画、也更好认：帽檐下一圈刘海、两只耳朵、圆眼镜居中
  c.translate(0, -66); c.rotate(Math.sin(t * 2.1) * 0.03);
  for (const ex of [-19, 19]) shape(el(ex, 4, 3.6, 4.6), P.skin, P.skinSh);   // 耳
  shape(el(0, 2, 19, 18.5), P.skin, P.skinSh);                               // 脸
  const crown = new Path2D(); crown.moveTo(-17, -9); crown.bezierCurveTo(-17, -33, 17, -33, 17, -9); crown.closePath();
  const brim = new Path2D(); brim.ellipse(0, -9, 29, 7, 0, 0, Math.PI * 2);
  shape(brim, P.hat, P.hatSh); shape(crown, P.hat, P.hatSh);
  // 刘海＋鬓角：画在帽檐之后，从帽檐下沿露出一排黑发（光头感就是少了这一排）
  c.fillStyle = P.hair; c.beginPath(); c.moveTo(-19.5, -4); c.lineTo(19.5, -4); c.lineTo(19, 5); c.lineTo(16.5, 1); c.lineTo(13, -0.5); c.lineTo(9, 1.5); c.lineTo(5, -1); c.lineTo(0, 1); c.lineTo(-5, -1.5); c.lineTo(-9, 1); c.lineTo(-13, -1); c.lineTo(-16.5, 1.5); c.lineTo(-19, 5); c.closePath(); c.fill();
  shape(brim, P.hat, P.hatSh);
  if (!line) { c.fillStyle = P.hatSh; c.beginPath(); c.ellipse(0, -9.5, 17, 2.2, 0, 0, Math.PI * 2); c.fill(); }   // 帽身与帽檐交界的一道暗线（色块，不是描边）
  // 圆眼镜＋眼睛（眨眼 0.12s/3.2s）
  const blink = (t % 3.2) > 3.08;
  c.strokeStyle = P.glass; c.lineWidth = 1.8; for (const ex of [-7.5, 7.5]) { c.beginPath(); c.arc(ex, 3, 6, 0, 7); c.stroke(); }
  c.beginPath(); c.moveTo(-1.5, 3); c.lineTo(1.5, 3); c.stroke();
  c.fillStyle = P.glass; for (const ex of [-7.5, 7.5]) { if (blink) c.fillRect(ex - 2.2, 3, 4.4, 1.1); else { c.beginPath(); c.ellipse(ex, 3.4, 1.8, 2.3, 0, 0, 7); c.fill(); } }
  c.fillStyle = P.cheek; for (const ex of [-11, 11]) { c.beginPath(); c.ellipse(ex, 10.5, 3.2, 1.9, 0, 0, 7); c.fill(); }
  const m = 0.4 + 0.6 * Math.max(0, Math.sin(t * 9));                       // 嘴：说话时开合
  c.fillStyle = '#c4473f'; c.beginPath(); c.ellipse(0, 12.5, 2.8, 0.9 + 1.7 * m, 0, 0, 7); c.fill();
  c.restore();
};

// ---------- 每片的接入点 ----------
// Y1 镜 3：讲解员站在草坡左侧指向黑猫（脚底 (470,900)，全身约 440px）
H.y1 = (g, ft, flatFn) => {
  const m = MODE();
  if (m === 'procedural') return H.geo(g, 470, 900, 440, { face: 1, t: ft, style: 'flat' });
  if (m === 'frames' && Y1.SHOTS && has(PNG('frame_0'))) {
    // 帧库是可选输入：由项目提供姿势帧，运行时只负责锚定、回弹和时序。
    const l = ft - Y1.SHOTS.s3[0], k = l < 1.25 ? 1 : l < 2.3 ? 0 : 2, t0 = [0, 1.25, 2.3][[1, 0, 2].indexOf(k)];
    const pop = l - t0 < 0.14 && t0 > 0 ? 1 + 0.06 * Math.sin((l - t0) / 0.14 * Math.PI) : 1;
    const br = 1 + 0.012 * Math.sin(ft * 5.2);
    g.save(); g.translate(470, 905); g.scale(1 / Math.sqrt(br * pop), br * pop); place(g, img(PNG('frame_' + k)), 0, 0, 450, 1); g.restore(); return true;
  }
  return false;
};
// Y2 镜 3：剪纸贴纸，画进 sp（之后统一垫白边、阴影），脚底 (1500,1040)，面朝左
H.y2 = (g, st) => {
  const m = MODE();
  if (m === 'procedural') return H.geo(g, 1500, 1040, 560, { face: -1, t: st, style: 'print', ink: '#171716' }), true;
  if (m === 'frames' && has(PNG('frame_0'))) { const k = Math.floor(st * 12); g.save(); g.translate(1500, 1015); g.rotate(((k * 7919) % 13 - 6) * 0.0012); g.filter = 'grayscale(1) contrast(1.25) brightness(1.04)'; place(g, img(PNG('frame_0')), 20, 8, 520, -1); g.restore(); return true; }
  return false;
};
// Y3 镜 3：被之字形笔触揭开的那张画（世界坐标，脚底 (fx, fy)，高 hh）
H.y3 = (g, fx, fy, hh, ft) => {
  const m = MODE();
  if (m === 'procedural') return H.geo(g, fx, fy, hh, { face: 1, t: ft, style: 'line', ink: '#0A0503' }), true;
  if (m === 'frames' && has(PNG('line'))) { g.save(); g.globalCompositeOperation = 'multiply'; place(g, img(PNG('line')), fx, fy + 4, hh * 1.08, 1); g.restore(); return true; }
  return false;
};
})();
