// 10 秒样片：老朋友在咖啡桌边重逢。
// 复用 Skill 的 1930 橡皮管卡通场景，额外用全局叠加层组织一个小故事。
window.FILM_DURATION = 10;
window.PUNCH = 0;
window.RUBBERHOSE_FRIENDS_STORY = true;

const ink = '#141210';
const paper = '#f8f1df';
const mid = '#a39a84';
const dark = '#5e574b';
const accent = '#8b3f31';

function rr(c, x, y, w, h, r) {
  const p = new Path2D();
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  p.closePath();
  return p;
}

function stroke(c, width = 6) {
  c.strokeStyle = ink;
  c.lineWidth = width;
  c.lineJoin = 'round';
  c.lineCap = 'round';
}

function easeOut(p) {
  p = U.clamp(p);
  return 1 - Math.pow(1 - p, 3);
}

function bubble(c, x, y, w, h, text, p = 1, flip = false) {
  const q = easeOut(p);
  c.save();
  c.globalAlpha = q;
  c.translate(x + w / 2, y + h / 2);
  c.scale(0.84 + 0.16 * q, 0.84 + 0.16 * q);
  c.translate(-(x + w / 2), -(y + h / 2));
  c.fillStyle = paper;
  c.fill(rr(c, x, y, w, h, 24));
  stroke(c, 5);
  c.stroke(rr(c, x, y, w, h, 24));
  c.beginPath();
  if (flip) {
    c.moveTo(x + 32, y + h - 3);
    c.quadraticCurveTo(x + 6, y + h + 25, x - 10, y + h + 18);
    c.quadraticCurveTo(x + 10, y + h - 5, x + 32, y + h - 3);
  } else {
    c.moveTo(x + w - 36, y + h - 3);
    c.quadraticCurveTo(x + w + 2, y + h + 25, x + w + 15, y + h + 18);
    c.quadraticCurveTo(x + w - 2, y + h - 5, x + w - 36, y + h - 3);
  }
  c.fillStyle = paper;
  c.fill();
  c.stroke();
  c.fillStyle = ink;
  c.font = 'bold 34px "NotoSansSC"';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, x + w / 2, y + h / 2 + 2);
  c.restore();
}

function title(c, t) {
  const p = easeOut(U.clamp(t / 0.8));
  const fade = t > 1.8 ? 1 - U.clamp((t - 1.8) / 0.35) : 1;
  c.save();
  c.globalAlpha = p * fade;
  c.translate(960, 92 - (1 - p) * 28);
  c.fillStyle = paper;
  c.fill(rr(c, -184, -36, 368, 72, 18));
  stroke(c, 6);
  c.stroke(rr(c, -184, -36, 368, 72, 18));
  c.fillStyle = accent;
  c.font = '48px "Rye-400"';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('OLD FRIENDS', 0, 2);
  c.restore();
}

function clock(c, t) {
  const p = U.clamp((t - 0.15) / 0.45);
  const x = 1030;
  const y = 190;
  c.save();
  c.globalAlpha = 1 - U.clamp((t - 2.1) / 0.45);
  c.translate(x, y);
  c.scale(0.85 + 0.15 * easeOut(p), 0.85 + 0.15 * easeOut(p));
  c.fillStyle = paper;
  c.fill(rr(c, -68, -68, 136, 136, 18));
  stroke(c, 6);
  c.stroke(rr(c, -68, -68, 136, 136, 18));
  c.fillStyle = mid;
  c.beginPath();
  c.arc(0, 0, 48, 0, Math.PI * 2);
  c.fill();
  stroke(c, 4);
  c.stroke();
  c.fillStyle = ink;
  c.font = '28px "Rye-400"';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('WAIT', 0, -86);
  const a = -Math.PI / 2 + Math.min(t, 2.1) * Math.PI * 1.8;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(Math.cos(a) * 34, Math.sin(a) * 34);
  c.moveTo(0, 0);
  c.lineTo(Math.cos(a * 0.45) * 22, Math.sin(a * 0.45) * 22);
  c.stroke();
  c.restore();
}

function cookie(c, t) {
  const p = easeOut(U.clamp((t - 4.2) / 1.4));
  const x = 1150 - 520 * p;
  const y = 620 - Math.sin(p * Math.PI) * 44;
  c.save();
  c.globalAlpha = U.clamp((t - 4.05) / 0.25) * (1 - U.clamp((t - 6.6) / 0.3));
  c.translate(x, y);
  c.rotate(Math.sin(p * Math.PI * 4) * 0.12);
  c.fillStyle = '#b98555';
  c.beginPath();
  c.arc(0, 0, 28, 0, Math.PI * 2);
  c.fill();
  stroke(c, 5);
  c.stroke();
  c.fillStyle = dark;
  [[-9, -8], [11, -4], [-3, 10]].forEach(([dx, dy]) => {
    c.beginPath();
    c.arc(dx, dy, 4, 0, Math.PI * 2);
    c.fill();
  });
  c.restore();
}

function finish(c, t) {
  const p = easeOut(U.clamp((t - 7.4) / 0.8));
  if (p <= 0) return;
  c.save();
  c.globalAlpha = p;
  c.fillStyle = paper;
  c.fill(rr(c, 570, 780, 780, 150, 28));
  stroke(c, 7);
  c.stroke(rr(c, 570, 780, 780, 150, 28));
  c.fillStyle = accent;
  c.font = '56px "Rye-400"';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('SAME TABLE, SAME FRIENDS', 960, 842);
  c.fillStyle = ink;
  c.font = '34px "NotoSansSC"';
  c.fillText('老朋友，见面就好', 960, 892);
  c.restore();
}

window.ERAS = [
  {
    id: '33_rubberhose',
    dur: 10,
  },
];

window.GLOBAL_OVERLAY = (c, t) => {
  title(c, t);
  if (t < 2.45) clock(c, t);
  if (t >= 2.1 && t < 4.4) bubble(c, 210, 260, 290, 88, '我来了！', U.clamp((t - 2.1) / 0.45), true);
  if (t >= 3.7 && t < 6.9) cookie(c, t);
  if (t >= 5.1 && t < 7.7) bubble(c, 1360, 290, 300, 88, '迟到的饼干', U.clamp((t - 5.1) / 0.45));
  finish(c, t);
};
