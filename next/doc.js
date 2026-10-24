'use strict';
/* AI 八堂课 · 纪录片套件 v3
   真实照片：推拉（Ken Burns）、2.5D 视差（人物抠像在前、背景在后）、档案胶片质感（闪烁、划痕、暗角）
   全息叠加：框选、注释引线、扫描光、时间地点戳、档案卡、引语卡
   文献复原：报纸、论文首页、书本、网页（只还原标题和原文措辞，画面上标「复原示意」） */

/* ---------- 图片 ---------- */
const IMG = {
  base: 'img/', R: {},
  meta() { return typeof IMGS !== 'undefined' ? IMGS : {}; },
  one(src) {
    return new Promise(res => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => { const d = im.decode ? im.decode().catch(() => 0) : Promise.resolve(); Promise.race([d, new Promise(r => setTimeout(r, 1200))]).then(() => res(im)); };  /* 页面在后台时 decode() 可能一直不返回，最多等 1.2 秒 */
      im.onerror = () => res(null); im.src = src;
    });
  },
  /* 按出场顺序载入；onp(已完成比例) */
  async load(ids, onp) {
    const M = this.meta(), q = typeof VER !== 'undefined' ? '?v=' + VER : ''; let done = 0;
    const step = () => { done++; if (onp) onp(done / ids.length); };
    const work = ids.map(id => async () => {
      if (this.R[id] || !M[id]) { step(); return; }
      const m = M[id], r = { w: m.w, h: m.h, nw: m.nw, g: m.g, fc: m.fc || [.5, .5] };
      if (m.fg) { const [fg, bg] = await Promise.all([this.one(this.base + id + '_fg.webp' + q), this.one(this.base + id + '_bg.webp' + q)]); r.fg = fg; r.bg = bg; r.ok = !!(fg && bg); }
      else { r.im = await this.one(this.base + id + '.webp' + q); r.ok = !!r.im; }
      this.R[id] = r; step();
    });
    let i = 0; const lanes = Array.from({ length: 6 }, async () => { while (i < work.length) await work[i++](); });
    await Promise.all(lanes);
  },
  get(id) { const r = this.R[id]; return r && r.ok ? r : null; },
};

/* 把图片窗口 (sx,sy,vw,vh) 画进矩形 R；窗口超出图片的部分自动裁掉（兼容 Safari） */
function drawWin(x, img, iw, ih, sx, sy, vw, vh, R) {
  const x0 = Math.max(0, sx), y0 = Math.max(0, sy), x1 = Math.min(iw, sx + vw), y1 = Math.min(ih, sy + vh);
  if (x1 - x0 < .5 || y1 - y0 < .5) return;
  const kx = R.w / vw, ky = R.h / vh;
  x.drawImage(img, x0, y0, x1 - x0, y1 - y0, R.x + (x0 - sx) * kx, R.y + (y0 - sy) * ky, (x1 - x0) * kx, (y1 - y0) * ky);
}
const _scr = rng(77), SCRATCH = Array.from({ length: 64 }, () => [_scr(), _scr(), _scr()]);

/* 照片。R={x,y,w,h}；o: p 推拉进度 0..1，z0/z1 缩放，f0/f1 焦点（图片坐标 0..1），depth 视差强度，
   a 透明度，r 圆角，rev 自上而下扫描显影 0..1，frame 全息边框，cred 署名，vig 暗角，scan 扫描光进度，contain 完整显示
   返回 { map(u,v) → 屏幕坐标 }，用来把标注钉在照片里的物体上 */
/* 照片太窄、署名放不下时：先去掉"摄于某年 / 今日"这类说明，再把名字缩成首字母（完整署名在学习资料页） */
function credFit(x, s, maxW, size) {
  const tw = q => TW(x, q, { f: 'mono', size, w: 500 }); if (tw(s) <= maxW) return s;
  let q = s.split(' · ').filter(p => !/摄于|今日|诺贝尔|藏品|版画|校舍/.test(p)).join(' · ') || s; if (tw(q) <= maxW) return q;
  return q.split(' · ').map(p => /^\p{Lu}\p{Ll}+( \p{Lu}[\p{Ll}'-]+)+$/u.test(p) ? p.replace(/^(\p{Lu})\p{Ll}+/u, '$1.') : p).join(' · ');
}
function PH(S, x, id, R, o = {}) {
  const r = IMG.get(id), a = o.a ?? 1, C = S.k.c, v = S.v;
  if (!r || a <= 0.003 || R.w < 2 || R.h < 2) return null;
  const iw = r.w, ih = r.h, p = clamp(o.p ?? .5), e = (o.ease || E.ioS)(p);
  const z = lerp(o.z0 ?? 1.03, o.z1 ?? 1.12, e), f0 = o.f0 || [.5, .5], f1 = o.f1 || f0;
  const fx = lerp(f0[0], f1[0], e), fy = lerp(f0[1], f1[1], e);
  let base = o.contain ? Math.min(R.w / iw, R.h / ih) : Math.max(R.w / iw, R.h / ih);
  if (r.nw && o.cap !== false && !(R.w >= S.W - 1 && R.h >= S.H - 1)) {   // 原图很小：按原始分辨率限制显示尺寸，宁可小一点也不糊
    const up = base * Math.max(o.z0 ?? 1.03, o.z1 ?? 1.12) * (S.dpr || (S.stage && S.stage.dpr) || 1) * iw / r.nw, mx = o.maxUp || 1.8;
    if (up > mx) { const f = mx / up; R = { x: R.x + R.w * (1 - f) / 2, y: R.y + R.h * (1 - f) / 2, w: R.w * f, h: R.h * f }; base *= f; }
  }
  const s = base * z, vw = R.w / s, vh = R.h / s;
  let sx = fx * iw - vw / 2, sy = fy * ih - vh / 2;
  sx = vw <= iw ? clamp(sx, 0, iw - vw) : (iw - vw) / 2; sy = vh <= ih ? clamp(sy, 0, ih - vh) : (ih - vh) / 2;
  const map = (u, w) => [R.x + (u * iw - sx) * s, R.y + (w * ih - sy) * s];
  const rev = o.rev ?? 1; if (rev <= 0) return { map, s, R };
  const arch = r.g === 'arch' || r.g === 'archc' || r.g === 'doc';
  x.save();
  rrect(x, R.x, R.y, R.w, R.h * (rev < 1 ? E.io3(rev) : 1), o.r ?? v * .45); x.clip();
  const fl = arch && o.flick !== false ? 1 - .04 * (.5 + .5 * Math.sin(S.t * 23.7) * Math.sin(S.t * 7.3 + 1)) : 1;
  x.globalAlpha = a * fl;
  if (o.bgc) { x.fillStyle = o.bgc; x.fillRect(R.x, R.y, R.w, R.h); }
  if (r.fg) {
    drawWin(x, r.bg, iw, ih, sx, sy, vw, vh, R);
    const d = o.depth ?? .8, zf = 1 + d * (.012 + .05 * e), [cu, cv] = r.fc, [cX, cY] = map(cu, cv), shx = d * R.w * .016 * (e - .5) * (o.dir ?? 1);
    x.save(); x.translate(cX + shx, cY); x.scale(s * zf, s * zf); x.drawImage(r.fg, -cu * iw, -cv * ih, iw, ih); x.restore();
  } else drawWin(x, r.im, iw, ih, sx, sy, vw, vh, R);
  x.globalAlpha = a;
  if (arch && o.scratch !== false) {                       // 胶片划痕与灰尘
    const fr = Math.floor(S.t * 12); const rr = rng(fr * 31 + 7);
    for (let i = 0; i < 2; i++) { if (rr() < .55) continue; const sxp = R.x + rr() * R.w; x.fillStyle = col('#ffffff', .07 + rr() * .08); x.fillRect(sxp, R.y, Math.max(1, v * .08), R.h); }
    for (let i = 0; i < 5; i++) { const q = SCRATCH[(fr * 5 + i) % SCRATCH.length]; if (q[2] < .6) continue; x.fillStyle = col(q[2] < .8 ? '#000000' : '#ffffff', .35); x.beginPath(); x.arc(R.x + q[0] * R.w, R.y + q[1] * R.h, v * (.08 + q[2] * .12), 0, TAU); x.fill(); }
  }
  const vg = o.vig ?? .5; if (vg > 0) {
    const g = x.createRadialGradient(R.x + R.w / 2, R.y + R.h / 2, Math.min(R.w, R.h) * .3, R.x + R.w / 2, R.y + R.h / 2, Math.hypot(R.w, R.h) * .56);
    g.addColorStop(0, 'rgba(2,4,12,0)'); g.addColorStop(1, col('#02040c', vg)); x.fillStyle = g; x.fillRect(R.x, R.y, R.w, R.h);
  }
  if (o.scan !== undefined && o.scan > 0 && o.scan < 1) {  // 扫描光
    const L = R.w + R.h, c0 = lerp(-.25, 1.25, o.scan) * L, g = x.createLinearGradient(R.x + c0 - R.h * .5 - v * 6, R.y, R.x + c0 - R.h * .5 + v * 6, R.y + R.h);
    g.addColorStop(0, 'rgba(120,240,255,0)'); g.addColorStop(.5, 'rgba(170,250,255,.28)'); g.addColorStop(1, 'rgba(120,240,255,0)');
    x.globalCompositeOperation = 'lighter'; x.fillStyle = g; x.fillRect(R.x, R.y, R.w, R.h); x.globalCompositeOperation = 'source-over';
  }
  if (o.cred && o.credY) {                                  // 全屏照片：署名放在字幕上方、避开刘海
    const f = fsz(v * .95), cx0 = R.x + Math.max(v * 1.1, S.W * .055), cr = credFit(x, o.cred, R.w - cx0 * 2, v * .95), tw = TW(x, cr, { f: 'mono', size: v * .95, w: 500 });
    x.fillStyle = 'rgba(0,0,8,.5)'; x.fillRect(cx0 - f * .45, o.credY - f * .85, tw + f * .9, f * 1.7);
    T(x, cr, cx0, o.credY, { f: 'mono', size: v * .95, w: 500, c: '#dfeaf6', a: a * .9 });
  } else if (o.cred) {
    const g = x.createLinearGradient(0, R.y + R.h - v * 4.5, 0, R.y + R.h); g.addColorStop(0, 'rgba(0,0,8,0)'); g.addColorStop(1, 'rgba(0,0,8,.62)');
    x.fillStyle = g; x.fillRect(R.x, R.y + R.h - v * 4.5, R.w, v * 4.5);
    T(x, credFit(x, o.cred, R.w - v * 2.2, v * .95), R.x + v * 1.1, R.y + R.h - v * 1.3, { f: 'mono', size: v * .95, w: 500, c: '#dfeaf6', a: a * .85 });
  }
  x.restore();
  if (rev < 1) {                                           // 显影扫描线
    const yy = R.y + R.h * E.io3(rev); x.save(); x.globalAlpha = a; x.fillStyle = col(C.priHi, .95); x.fillRect(R.x, yy - 1, R.w, 2); x.restore();
    const gx = S.glow; gx.save(); gx.globalAlpha = a; gx.fillStyle = col(C.pri, 1); gx.fillRect(R.x, yy - v * .5, R.w, v); gx.restore(); S.stack && (S.stack.dirty.glow = 1);
  }
  if (o.frame) BRK(S, x, R.x - v * .7, R.y - v * .7, R.w + v * 1.4, R.h + v * 1.4, o.frame === true ? 1 : o.frame, { a, c: o.fc });
  return { map, s, R };
}
/* 全息框角 */
function BRK(S, x, X, Y, w, h, p, o = {}) {
  const C = S.k.c, c = o.c || C.pri, a = (o.a ?? 1) * clamp(p * 1.5), l = Math.min(w, h) * (o.l ?? .12) * E.o3(clamp(p)); if (a <= 0 || l <= 0) return;
  const seg4 = g => { g.beginPath(); for (const [cx, cy, sx, sy] of [[X, Y, 1, 1], [X + w, Y, -1, 1], [X, Y + h, 1, -1], [X + w, Y + h, -1, -1]]) { g.moveTo(cx, cy + sy * l); g.lineTo(cx, cy); g.lineTo(cx + sx * l, cy); } };
  x.save(); x.globalAlpha = a; x.strokeStyle = col(c, .95); x.lineWidth = Math.max(1.2, S.v * .17); seg4(x); x.stroke();
  if (o.rect) { x.strokeStyle = col(c, .28); x.lineWidth = 1; x.strokeRect(X, Y, w, h); }
  x.restore();
  const g = S.glow; g.save(); g.globalAlpha = a; g.strokeStyle = col(c, .9); g.lineWidth = 3; seg4(g); g.stroke(); g.restore();
}
/* 框选：p 0→1 框角伸出，再出现细线框 */
function BOX(S, x, X, Y, w, h, p, o = {}) { if (p <= 0) return; BRK(S, x, X, Y, w, h, p, { ...o, rect: true, l: o.l ?? .22 }); }
/* 注释：从点 A 引线到标签位置 B；p 0→1 先画线后出标签。返回标签框 */
function CO(S, x, A, B, p, title, sub, o = {}) {
  if (p <= 0 || !A) return null;
  const C = S.k.c, v = S.v, c = o.c || C.pri, a = o.a ?? 1, side = o.side || (B[0] >= A[0] ? 1 : -1);
  const K = [B[0] - side * Math.min(Math.abs(B[0] - A[0]) * .4, v * 6), B[1]];
  const L1 = Math.hypot(K[0] - A[0], K[1] - A[1]), L2 = Math.abs(B[0] - K[0]), lp = E.o3(seg(p, 0, .5)) * (L1 + L2);
  const path = g => { g.beginPath(); g.moveTo(A[0], A[1]); if (lp <= L1) g.lineTo(lerp(A[0], K[0], lp / Math.max(1, L1)), lerp(A[1], K[1], lp / Math.max(1, L1))); else { g.lineTo(K[0], K[1]); g.lineTo(lerp(K[0], B[0], (lp - L1) / Math.max(1, L2)), B[1]); } };
  x.save(); x.globalAlpha = a; x.strokeStyle = col(c, .92); x.lineWidth = Math.max(1, v * .15); path(x); x.stroke();
  x.fillStyle = col(c, 1); x.beginPath(); x.arc(A[0], A[1], v * .42, 0, TAU); x.fill();
  const rp = (S.t * .8 + (o.ph || 0)) % 1; x.strokeStyle = col(c, (1 - rp) * .8); x.lineWidth = 1; x.beginPath(); x.arc(A[0], A[1], v * (.5 + rp * 1.8), 0, TAU); x.stroke();
  x.restore();
  const g = S.glow; g.save(); g.globalAlpha = a; g.strokeStyle = col(c, .8); g.lineWidth = 3; path(g); g.stroke(); g.beginPath(); g.arc(A[0], A[1], v * .8, 0, TAU); g.fillStyle = col(c, .9); g.fill(); g.restore();
  const la = E.o3(seg(p, .42, 1)); if (la <= 0 || !title) return null;
  const ts = o.size || v * (S.P ? 1.9 : 2.05), ss = o.ss || v * 1.05, f1 = fsz(ts), f2 = fsz(ss);
  const tw = TW(x, title, { f: 'sans', size: ts, w: 700 }), sw = sub ? TW(x, sub, { f: 'mono', size: ss, w: 500, tr: .12 }) : 0;
  const pad = v * 1.05, bw = Math.max(tw, sw) + pad * 2, bh = f1 * 1.22 + (sub ? f2 * 1.55 : 0) + pad * 1.15;
  let bx = side > 0 ? B[0] : B[0] - bw; bx = clamp(bx, v * .8, S.W - bw - v * .8); const by = clamp(B[1] - bh / 2, v * .8, S.H - bh - v * .8);
  x.save(); x.globalAlpha = a * la; rrect(x, bx, by, bw, bh, v * .35); x.fillStyle = 'rgba(5,12,28,.8)'; x.fill(); x.strokeStyle = col(c, .5); x.lineWidth = 1; x.stroke(); x.restore();
  T(x, title, bx + pad, by + pad * .58 + f1 * .62, { f: 'sans', size: ts, w: 700, c: C.ink, a: a * la, sh: { c, a: .25 } });
  if (sub) T(x, sub, bx + pad, by + bh - pad * .55 - f2 * .55, { f: 'mono', size: ss, w: 500, c, tr: .12, a: a * la });
  return { x: bx, y: by, w: bw, h: bh };
}
/* 注释标签框的高度（有副标题时），竖着排几个标签时用来定间距 */
function coH(S, o = {}) { const v = S.v; return fsz(o.size || v * (S.P ? 1.9 : 2.05)) * 1.22 + fsz(o.ss || v * 1.05) * 1.55 + v * 1.05 * 1.15; }
/* 小标签（数据标签） */
function TAG(S, x, s, X, Y, p, o = {}) {
  if (p <= 0) return 0; const C = S.k.c, v = S.v, c = o.c || C.pri, size = o.size || v * 1.25, a = (o.a ?? 1) * E.o3(clamp(p)), f = fsz(size);
  const tw = TW(x, s, { f: o.f || 'mono', size, w: o.w || 500, tr: o.tr ?? .1 }), pw = tw + f * 1.2, ph = f * 1.85, xx = o.al === 'center' ? X - pw / 2 : o.al === 'right' ? X - pw : X;
  x.save(); x.globalAlpha = a; x.fillStyle = o.fill || 'rgba(4,12,26,.78)'; x.fillRect(xx, Y - ph / 2, pw, ph); x.strokeStyle = col(c, .55); x.lineWidth = 1; x.strokeRect(xx, Y - ph / 2, pw, ph); x.restore();
  T(x, s, xx + f * .6, Y + f * .04, { f: o.f || 'mono', size, w: o.w || 500, c: o.tc || c, tr: o.tr ?? .1, a });
  return pw;
}
/* 版面：横屏左图右文；竖屏上图下文。字幕区留空 */
/* 时间地点戳两行的字号与行距（第二行与第一行的中心距按放大后的字号取较大值） */
function stampGeo(S) { const v = S.v, s1 = v * (S.P ? 1.05 : 1.2), s2 = v * (S.P ? 1.85 : 2.3), d = Math.max(v * (S.P ? 2.3 : 2.7), fsz(s1) * .5 + fsz(s2) * .5 + 1.5); return { s1, s2, d, bottom: d + fsz(s2) * .55 }; }
function LAY(S) {
  const { W, H: h, P, v } = S;
  if (!P) {
    const top = Math.max(h * .175, headGeo(S).bottom + v * 1.2), bot = h * .815;
    return { P, top, bot, main: { x: W * .055, y: top, w: W * .545, h: bot - top }, side: { x: W * .64, y: top + h * .03, w: W * .31, h: bot - top - h * .03 },
      wide: { x: W * .055, y: top, w: W * .89, h: bot - top }, mid: { x: W * .2, y: top, w: W * .6, h: bot - top }, stamp: { x: W * .945, y: h * .085, al: 'right' } };
  }
  const hy = headGeo(S).Y2, sy = Math.max(h * .163, hy + v * 3.2), top = Math.max(h * .2, sy + Math.max(v * 4.4, stampGeo(S).bottom + v * .8)), mh = Math.min(h * .31, (h * .79 - top) * .5), bot = h * .79;
  return { P, top, bot, main: { x: W * .05, y: top + h * .015, w: W * .9, h: mh }, side: { x: W * .06, y: top + h * .02 + mh + h * .03, w: W * .88, h: bot - (top + h * .05 + mh) },
    wide: { x: W * .05, y: top + h * .02, w: W * .9, h: bot - top - h * .02 }, mid: { x: W * .05, y: top + h * .02, w: W * .9, h: bot - top - h * .02 }, stamp: { x: W * .075, y: sy, al: 'left' } };
}
/* 时间地点戳 */
function STAMP(S, t, t0, l1, l2, o = {}) {
  const p = seg(t, t0, t0 + .9); if (p <= 0) return; const G = LAY(S), x = S.hud, C = S.k.c, v = S.v, a = E.o3(p) * (o.a ?? 1), X = G.stamp.x, Y = G.stamp.y, al = G.stamp.al;
  const sg = stampGeo(S);
  T(x, decode(l1, p * 1.4, 11), X, Y, { f: 'mono', size: sg.s1, w: 500, c: C.pri, tr: .14, al, a, sh: { c: C.pri, a: .5 } });
  if (l2) TReveal(x, l2, X, Y + sg.d, { f: 'sans', size: sg.s2, w: 700, c: C.ink, al, sh: { c: C.pri, a: .3 }, a: o.a ?? 1 }, seg(t, t0 + .2, t0 + 1.2));
}
/* 镜头切换：在 [a,b] 期间显示，带淡入淡出 */
function shots(t, list, fi = .32, fo = .32) {
  for (const [a0, a1, fn] of list) {
    if (t < a0 - .001 || t > a1 + fo) continue;
    const al = Math.min(E.ioS(clamp((t - a0) / fi)), E.ioS(clamp((a1 + fo - t) / fo)));
    if (al > 0.003) fn(al, t - a0, Math.max(.1, a1 - a0));
  }
}
/* 档案卡：照片（可选）+ 姓名 + 英文名 + 几行事实 */
function IDC(S, x, R, o, p) {
  if (p <= 0) return; const C = S.k.c, v = S.v, a = E.o3(clamp(p)) * (o.a ?? 1), dy = (1 - E.o3(clamp(p))) * v * 1.6, Y = R.y + dy;
  x.save(); x.globalAlpha = a; rrect(x, R.x, Y, R.w, R.h, v * .5); x.fillStyle = 'rgba(6,14,30,.82)'; x.fill(); x.strokeStyle = col(o.c || C.pri, .45); x.lineWidth = 1; x.stroke(); x.restore();
  BRK(S, x, R.x, Y, R.w, R.h, p, { a: a * .9, c: o.c, l: .1 });
  const ph = R.h - v * 1.6, pw = o.img ? Math.min(ph * .82, R.w * .36) : 0, px = R.x + v * .8, py = Y + v * .8;
  if (o.img) {
    PH(S, x, o.img, { x: px, y: py, w: pw, h: ph }, { p: o.kp ?? .5, z0: 1.05, z1: 1.1, f0: o.f || [.5, .32], a, r: v * .3, vig: .3, depth: .5, scratch: false });
  } else if (o.noimg) {
    x.save(); x.globalAlpha = a; rrect(x, px, py, ph * .8, ph, v * .3); x.fillStyle = 'rgba(69,227,255,.05)'; x.fill(); x.setLineDash([3, 4]); x.strokeStyle = col(C.mute, .5); x.stroke(); x.setLineDash([]); x.restore();
    T(x, o.noimg, px + ph * .4, py + ph / 2, { f: 'sans', size: v * 1.05, w: 500, c: C.mute, al: 'center', a });
  }
  const tx = px + (o.img ? pw : o.noimg ? ph * .8 : 0) + v * (o.img || o.noimg ? 1.6 : .6), tw = R.x + R.w - tx - v;
  const n1 = fit(x, o.name, tw, { f: 'sans', size: v * (S.P ? 2.5 : 2.8), w: 700 }), lines = o.lines || [];
  const g1 = fsz(n1), g2 = fsz(v * 1.1), g3 = fsz(v * 1.45), tot = g1 + (o.en ? g2 * 1.6 : 0) + lines.length * g3 * 1.5;
  let yy = Y + R.h / 2 - tot / 2 + g1 / 2;
  T(x, o.name, tx, yy, { f: 'sans', size: n1, w: 700, c: C.ink, a, sh: { c: C.pri, a: .3 } }); yy += g1 / 2;
  if (o.en) { yy += g2 * .9; T(x, o.en, tx, yy, { f: 'mono', size: v * 1.1, w: 500, c: o.c || C.pri, tr: .1, a }); yy += g2 * .7; }
  lines.forEach((s, i) => { yy += g3 * 1.5; const la = a * E.o3(seg(p, .4 + i * .15, .9 + i * .15)); T(x, s, tx, yy - g3 * .5, { f: 'sans', size: fit(x, s, tw, { f: 'sans', size: v * 1.45, w: 500 }), w: 500, c: '#c9d8ee', a: la }); });
}
/* 引语卡 */
function QUOTE(S, x, R, text, src, p, o = {}) {
  if (p <= 0) return; const C = S.k.c, v = S.v, a = E.o3(clamp(p)) * (o.a ?? 1), c = o.c || C.acc, dy = (1 - E.o3(clamp(p))) * v * 1.4;
  const size = o.size || v * (S.P ? 2.1 : 2.4), pad = v * 2, lines = richLines(x, text, R.w - pad * 2, { f: 'sans', size, w: 700 }), lh = fsz(size) * 1.5;
  const hh = Math.max(R.h || 0, lines.length * lh + pad * 2.4 + (src ? v * 2.6 : 0)), Y = R.y + dy;
  x.save(); x.globalAlpha = a; rrect(x, R.x, Y, R.w, hh, v * .5); x.fillStyle = 'rgba(14,6,26,.84)'; x.fill(); x.strokeStyle = col(c, .5); x.lineWidth = 1; x.stroke(); x.restore();
  T(x, '“', R.x + pad * .45, Y + pad * .9, { f: 'serif', size: v * 6, w: 700, c, a: a * .9 });
  rich(x, text, R.x + pad, Y + pad * 1.2 + lh * .5, R.w - pad * 2, { f: 'sans', size, w: 700, c: C.ink, kc: C.accHi, lh, a });
  if (src) T(x, src, R.x + pad, Y + hh - pad * .9, { f: 'mono', size: v * 1.05, w: 500, c: col(c, 1), tr: .06, a: a * .9 });
  BRK(S, x, R.x, Y, R.w, hh, p, { c, a: a * .9, l: .08 });
  return hh;
}
/* 「复原示意」标签 */
function RECON(S, x, X, Y, p, s = '复原示意') { TAG(S, x, s, X, Y, p, { c: S.k.c.gold, f: 'sans', w: 700, tr: .12, size: S.v * 1.15, fill: 'rgba(40,26,4,.78)' }); }

/* ---------- 文献复原：画在离屏画布上，缓存 ---------- */
const DOC = {
  cache: {},
  paper(x, w, h, tone) {
    const pp = IMG.get('PAPER'); if (pp) { const pt = x.createPattern(pp.im, 'repeat'); x.fillStyle = pt; x.fillRect(0, 0, w, h); } else { x.fillStyle = '#e4dac6'; x.fillRect(0, 0, w, h); }
    if (tone) { x.fillStyle = tone; x.fillRect(0, 0, w, h); }
    const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .2, w / 2, h / 2, Math.hypot(w, h) * .6); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,40,10,.22)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  },
  /* 文字工具：t(文字, x, y, 字号, 粗细, 颜色, 横向压缩, 对齐) */
  tx(x, s, X, Y, size, w, c, sx = 1, al = 'left', fam = 'AI8Serif') {
    x.save(); x.font = `${w} ${size}px "${fam}","Noto Serif CJK SC","Songti SC",serif`; x.fillStyle = c; x.textBaseline = 'alphabetic'; x.textAlign = al;
    x.translate(X, Y); x.scale(sx, 1); x.fillText(s, 0, 0); const m = x.measureText(s).width * sx; x.restore(); return m;
  },
  bars(x, X, Y, w, n, lh, seed, c = 'rgba(40,34,24,.26)') { const r = rng(seed); for (let i = 0; i < n; i++) { const ww = i === n - 1 ? w * (.35 + r() * .3) : w * (.86 + r() * .14); x.fillStyle = c; x.fillRect(X, Y + i * lh, ww, lh * .42); } return Y + n * lh; },
  /* kind: nyt / nature / attn / book / web；返回 {cv, w, h, mk:{名字:[x,y,w,h]}} */
  get(kind, W) {
    W = Math.round(W / 8) * 8; const key = kind + W; if (this.cache[key]) return this.cache[key];
    if (!IMG.get('PAPER') && kind !== 'book' && kind !== 'web') return null;
    const dpr = Math.min(2, (window.devicePixelRatio || 1)), mk = {}; let H = W * 1.25;
    if (kind === 'book') H = W * 1.42; if (kind === 'web') H = W * .78; if (kind === 'nature' || kind === 'attn') H = W * 1.3;
    const cv = document.createElement('canvas'); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); const x = cv.getContext('2d'); x.scale(dpr, dpr);
    const u = W / 100, ink = '#1d1a14';
    if (kind === 'nyt') {
      this.paper(x, W, H); x.fillStyle = ink; x.fillRect(u * 6, u * 6, W - u * 12, u * .5); x.fillRect(u * 6, u * 7.4, W - u * 12, u * .18);
      let y = u * 20; this.tx(x, 'NEW NAVY DEVICE', u * 6, y, u * 10.4, 900, ink, .78); y += u * 10.8; this.tx(x, 'LEARNS BY DOING', u * 6, y, u * 10.4, 900, ink, .78);
      mk.head = [u * 5, u * 10, W - u * 10, u * 22];
      y += u * 7; this.tx(x, 'Psychologist Shows Embryo of Computer', u * 6, y, u * 4.1, 700, '#2a251b', .86); y += u * 4.9; this.tx(x, 'Designed to Read and Grow Wiser', u * 6, y, u * 4.1, 700, '#2a251b', .86);
      mk.sub = [u * 5, y - u * 9, W - u * 10, u * 11];
      y += u * 5.4; this.tx(x, 'WASHINGTON, July 7', u * 6, y, u * 2.6, 600, '#3b3427'); y += u * 2.6;
      y = this.bars(x, u * 6, y + u * 1.6, W - u * 12, 3, u * 3.4, 11);
      const qy = y + u * 2.6; this.tx(x, '... expects will be able to walk, talk, see, write,', u * 6, qy, u * 3.15, 600, '#1b1710'); this.tx(x, 'reproduce itself and be conscious of its existence.', u * 6, qy + u * 4.4, u * 3.15, 600, '#1b1710');
      mk.q = [u * 5.4, qy - u * 3.4, W - u * 11, u * 9.2];
      y = this.bars(x, u * 6, qy + u * 7.2, W - u * 12, 3, u * 3.4, 12);
      const cy = y + u * 2.4; this.tx(x, 'It is expected to be finished in about a year', u * 6, cy, u * 3.15, 600, '#1b1710'); this.tx(x, 'at a cost of $100,000.', u * 6, cy + u * 4.4, u * 3.15, 600, '#1b1710');
      mk.cost = [u * 5.4, cy - u * 3.4, W - u * 11, u * 9.2];
      y = this.bars(x, u * 6, cy + u * 7.2, W - u * 12, Math.max(2, Math.floor((H - cy - u * 14) / (u * 3.4))), u * 3.4, 13);
    } else if (kind === 'nature') {
      this.paper(x, W, H, 'rgba(255,255,255,.18)');
      this.tx(x, 'NATURE  VOL. 323  ·  9 OCTOBER 1986', u * 7, u * 9, u * 2.4, 600, '#4a4236', 1, 'left', 'AI8Mono'); x.fillStyle = '#4a4236'; x.fillRect(u * 7, u * 11, W - u * 14, u * .25);
      let y = u * 21; this.tx(x, 'Learning representations', u * 7, y, u * 6.4, 700, ink, .92); y += u * 7.4; this.tx(x, 'by back-propagating errors', u * 7, y, u * 6.4, 700, ink, .92);
      mk.title = [u * 6, u * 14.5, W - u * 12, u * 16];
      y += u * 7; this.tx(x, 'David E. Rumelhart*, Geoffrey E. Hinton† & Ronald J. Williams*', u * 7, y, u * 2.75, 600, '#2a251b', .9); mk.auth = [u * 6, y - u * 3, W - u * 12, u * 4.4];
      y += u * 6; x.fillStyle = 'rgba(40,34,24,.12)'; x.fillRect(u * 7, y - u * 1, W - u * 14, u * 20);
      this.bars(x, u * 9, y + u * 2, W - u * 18, 5, u * 3.4, 21, 'rgba(40,34,24,.3)'); y += u * 24;
      const cw = (W - u * 18) / 2; this.bars(x, u * 7, y, cw, Math.floor((H - y - u * 6) / (u * 3.2)), u * 3.2, 22); this.bars(x, u * 11 + cw, y, cw, Math.floor((H - y - u * 6) / (u * 3.2)), u * 3.2, 23);
    } else if (kind === 'attn') {
      this.paper(x, W, H, 'rgba(255,255,255,.38)');
      let y = u * 16; this.tx(x, 'Attention Is All You Need', W / 2, y, u * 6.4, 700, ink, .92, 'center'); mk.title = [u * 8, y - u * 6.4, W - u * 16, u * 8.6];
      const au = ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'];
      y += u * 7; au.forEach((s, i) => { const cx = W * (.17 + (i % 4) * .22), yy = y + Math.floor(i / 4) * u * 6.4; this.tx(x, s, cx, yy, u * 2.35, 600, '#2a251b', .9, 'center'); if (s.startsWith('Aidan')) mk.gomez = [cx - u * 9, yy - u * 2.6, u * 18, u * 3.6]; });
      y += u * 15; this.tx(x, 'Abstract', W / 2, y, u * 3, 700, ink, 1, 'center'); y += u * 3;
      y = this.bars(x, u * 14, y + u * 1.5, W - u * 28, 7, u * 3.2, 31);
      this.tx(x, 'arXiv:1706.03762', u * 3.2, H * .62, u * 2.3, 600, 'rgba(60,50,40,.6)', 1, 'left', 'AI8Mono'); mk.arx = [u * 2, H * .6, u * 26, u * 3.6];
      this.tx(x, '1  Introduction', u * 8, y + u * 4, u * 3, 700, ink); this.bars(x, u * 8, y + u * 7, W - u * 16, Math.floor((H - y - u * 12) / (u * 3.2)), u * 3.2, 32);
    } else if (kind === 'book') {
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2a3446'); g.addColorStop(1, '#151b26'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 0, u * 6, H); x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(u * 6, 0, u * .6, H);
      const gold = '#d8c08a'; x.strokeStyle = 'rgba(216,192,138,.5)'; x.lineWidth = u * .3; x.strokeRect(u * 12, u * 10, W - u * 20, H - u * 20);
      this.tx(x, 'PERCEPTRONS', u * 56, H * .36, u * 10, 700, gold, .86, 'center'); mk.title = [u * 14, H * .27, W - u * 24, u * 13];
      this.tx(x, 'Marvin Minsky', u * 56, H * .5, u * 4.2, 600, '#c9b685', .95, 'center'); this.tx(x, 'Seymour Papert', u * 56, H * .5 + u * 6, u * 4.2, 600, '#c9b685', .95, 'center');
      this.tx(x, '1969', u * 56, H * .82, u * 4, 600, 'rgba(216,192,138,.75)', 1, 'center', 'AI8Mono');
    } else if (kind === 'web') {
      x.fillStyle = '#f5f3ee'; x.fillRect(0, 0, W, H); x.fillStyle = '#d9d6cf'; x.fillRect(0, 0, W, u * 6); ['#e06c5e', '#e7b84f', '#69b56b'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(u * (4 + i * 3.4), u * 3, u * 1.1, 0, TAU); x.fill(); });
      x.fillStyle = '#fff'; x.fillRect(u * 16, u * 1.4, W - u * 22, u * 3.2); this.tx(x, 'incompleteideas.net/IncIdeas/BitterLesson.html', u * 18, u * 4, u * 1.9, 500, '#666', 1, 'left', 'AI8Mono');
      let y = u * 17; this.tx(x, 'The Bitter Lesson', u * 8, y, u * 6.4, 700, '#111', 1); mk.title = [u * 7, y - u * 6.4, u * 60, u * 8.4];
      y += u * 5.6; this.tx(x, 'Rich Sutton  ·  March 13, 2019', u * 8, y, u * 2.6, 500, '#555', 1, 'left', 'AI8Mono');
      y += u * 7; this.tx(x, '... general methods that leverage computation', u * 8, y, u * 3.2, 600, '#222', .96); mk.q = [u * 7.4, y - u * 3.4, u * 74, u * 4.8];
      this.tx(x, 'are ultimately the most effective ...', u * 8, y + u * 4.6, u * 3.2, 600, '#222', .96);
      this.bars(x, u * 8, y + u * 9, W - u * 16, Math.floor((H - y - u * 12) / (u * 3.4)), u * 3.4, 41, 'rgba(0,0,0,.14)');
    }
    return (this.cache[key] = { cv, w: W, h: H, mk });
  },
  /* 投影预先画好一次（每帧实时模糊阴影在 Safari 上很贵） */
  shadow(d, v) {
    const k = Math.round(v * 10); if (d.sh && d.sh.k === k) return d.sh;
    const dpr = Math.min(2, window.devicePixelRatio || 1), pad = Math.ceil(v * 4 / dpr * 1.6), cv = document.createElement('canvas');
    cv.width = Math.ceil((d.w + pad * 2) * dpr); cv.height = Math.ceil((d.h + pad * 2) * dpr); const x = cv.getContext('2d');
    x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = v * 4; x.shadowOffsetX = cv.width; x.fillStyle = '#000'; x.fillRect(pad * dpr - cv.width, pad * dpr, d.w * dpr, d.h * dpr);  /* 方块画在画布外，只让它的影子落进来 */
    return (d.sh = { cv, pad, oy: v * 1.6 / dpr, k });
  },
  /* 画文献：R 中心放置，宽度 w，旋转 rot；hl: [{k:标记名, p:进度}] 荧光笔；返回 {map(x,y) 文献坐标→屏幕} */
  draw(S, x, kind, cx, cy, w, o = {}) {
    const d = this.get(kind, w); const a = o.a ?? 1; if (!d || a <= 0) return null;
    const rot = o.rot || 0, sc = o.sc || 1, cs = Math.cos(rot), sn = Math.sin(rot);
    const map = (px, py) => { const X = (px - d.w / 2) * sc, Y = (py - d.h / 2) * sc; return [cx + X * cs - Y * sn, cy + X * sn + Y * cs]; };
    x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot); x.scale(sc, sc);
    const sh = this.shadow(d, S.v); x.drawImage(sh.cv, -d.w / 2 - sh.pad, -d.h / 2 - sh.pad + sh.oy, d.w + sh.pad * 2, d.h + sh.pad * 2);
    x.drawImage(d.cv, -d.w / 2, -d.h / 2, d.w, d.h);
    for (const h of (o.hl || [])) { const m = d.mk[h.k]; if (!m || h.p <= 0) continue; x.fillStyle = h.c || 'rgba(69,227,255,.36)'; x.fillRect(m[0] - d.w / 2, m[1] - d.h / 2, m[2] * E.io3(clamp(h.p)), m[3]); }
    x.restore();
    return { map, d, box: k => { const m = d.mk[k]; if (!m) return null; const p1 = map(m[0], m[1]), p2 = map(m[0] + m[2], m[1] + m[3]); return { x: Math.min(p1[0], p2[0]), y: Math.min(p1[1], p2[1]), w: Math.abs(p2[0] - p1[0]), h: Math.abs(p2[1] - p1[1]), c: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2], r: [Math.max(p1[0], p2[0]), (p1[1] + p2[1]) / 2], l: [Math.min(p1[0], p2[0]), (p1[1] + p2[1]) / 2] }; } };
  },
};

/* ---------- 数据小部件 ---------- */
const W3 = {
  /* 计数文字 */
  num(S, x, s, X, Y, size, o = {}) { const C = S.k.c; return T(x, s, X, Y, { f: o.f || 'interd', size, w: o.w || 700, c: o.c || C.priHi, al: o.al || 'left', a: o.a ?? 1, sh: { c: o.sc || C.pri, a: .55 } }); },
  /* 20×20 光电管网格；shape(i,j)→0..1 */
  grid(S, x, X, Y, w, shape, p, o = {}) {
    const C = S.k.c, n = o.n || 20, gap = w * .012, cell = (w - gap * (n + 1)) / n, a = o.a ?? 1; if (a <= 0) return;
    x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(4,12,26,.75)'; x.fillRect(X, Y, w, w); x.strokeStyle = col(C.pri, .35); x.lineWidth = 1; x.strokeRect(X, Y, w, w);
    /* 按亮度分 16 档，每档一次填充（Safari 的画布每次绘制都有固定开销，400 格逐个画会掉帧） */
    const B = 16, cells = Array.from({ length: B + 1 }, () => []), hot = Array.from({ length: B + 1 }, () => []);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const on = shape ? shape(i, j) : 0, q = clamp(p * (n + 6) - (i + j) * .5), lit = on * q, cx = X + gap + i * (cell + gap), cy = Y + gap + j * (cell + gap);
      const b = lit > .05 ? Math.max(1, Math.round(lit * B)) : 0; cells[b].push(cx, cy); if (lit > .3) hot[b].push(cx, cy);
    }
    for (let b = 0; b <= B; b++) { const L = cells[b]; if (!L.length) continue; x.fillStyle = b ? col(C.pri, .25 + .75 * b / B) : 'rgba(69,227,255,.07)'; x.beginPath(); for (let k = 0; k < L.length; k += 2) x.rect(L[k], L[k + 1], cell, cell); x.fill(); }
    const g = S.glow; g.save(); g.globalAlpha = a;
    for (let b = 1; b <= B; b++) { const L = hot[b]; if (!L.length) continue; g.fillStyle = col(C.pri, b / B * .8); g.beginPath(); for (let k = 0; k < L.length; k += 2) g.rect(L[k] - 1, L[k + 1] - 1, cell + 2, cell + 2); g.fill(); }
    g.restore(); x.restore();
  },
  /* 柱状图：items [[标签, 值, 颜色]]；max 轴上限 */
  bars(S, x, R, items, p, o = {}) {
    const C = S.k.c, v = S.v, a = o.a ?? 1, max = o.max || Math.max(...items.map(i => i[1])); if (a <= 0) return;
    const ax = R.x + v * 3.6, ay = R.y + R.h - v * 3.6, aw = R.w - v * 4.6, ah = R.h - v * 7.5;
    x.save(); x.globalAlpha = a; x.strokeStyle = col(C.mute, .5); x.lineWidth = 1; x.beginPath(); x.moveTo(ax, ay - ah); x.lineTo(ax, ay); x.lineTo(ax + aw, ay); x.stroke();
    (o.ticks || []).forEach(tv => { const yy = ay - ah * tv / max; x.strokeStyle = col(C.mute, .15); x.beginPath(); x.moveTo(ax, yy); x.lineTo(ax + aw, yy); x.stroke(); T(x, (o.fmt ? o.fmt(tv) : tv), ax - v * .6, yy, { f: 'mono', size: v * 1.05, c: C.mute, al: 'right', a }); });
    x.restore();
    const n = items.length, bw = aw / n * .5;
    items.forEach(([lab, val, c], i) => {
      const q = E.o3(seg(p, i * .18, .62 + i * .18)), bx = ax + aw / n * (i + .5) - bw / 2, bh = ah * val / max * q;
      x.save(); x.globalAlpha = a; x.fillStyle = col(c, .92); x.fillRect(bx, ay - bh, bw, bh); x.restore();
      if (c !== C.mute) { const g = S.glow; g.save(); g.globalAlpha = a * q; g.fillStyle = col(c, .8); g.fillRect(bx, ay - bh, bw, bh); g.restore(); }
      if (q > .02) T(x, (o.vfmt ? o.vfmt(val * q) : (val * q).toFixed(1)), bx + bw / 2, ay - bh - v * 2.2, { f: 'interd', size: v * (S.P ? 3.4 : 3.8), w: 700, c: c === C.mute ? C.ink : C.priHi, al: 'center', a: a * clamp(q * 3), sh: { c, a: .4 } });
      T(x, lab, bx + bw / 2, ay + v * 2, { f: 'sans', size: v * 1.6, w: 700, c: C.ink, al: 'center', a });
    });
    return { ax, ay, aw, ah, bw };
  },
  /* 折线：fn(q)→0..1 高度；p 画到哪 */
  curve(S, x, R, fn, p, c, o = {}) {
    if (p <= 0) return; const a = o.a ?? 1, n = 80; const pt = q => [R.x + R.w * q, R.y + R.h * (1 - fn(q))];
    const path = g => { g.beginPath(); for (let i = 0; i <= n; i++) { const q = i / n * p, [X, Y] = pt(q); i ? g.lineTo(X, Y) : g.moveTo(X, Y); } };
    x.save(); x.globalAlpha = a; x.strokeStyle = col(c, .95); x.lineWidth = o.w || S.v * .3; x.lineJoin = 'round'; path(x); x.stroke(); x.restore();
    const g = S.glow; g.save(); g.globalAlpha = a; g.strokeStyle = col(c, .8); g.lineWidth = (o.w || S.v * .3) + 3; path(g); g.stroke(); g.restore();
    return pt(p);
  },
  /* 坐标轴 */
  axes(S, x, R, a = 1, lx = '', ly = '') {
    const C = S.k.c, v = S.v; x.save(); x.globalAlpha = a; x.strokeStyle = col(C.mute, .45); x.lineWidth = 1; x.beginPath(); x.moveTo(R.x, R.y); x.lineTo(R.x, R.y + R.h); x.lineTo(R.x + R.w, R.y + R.h); x.stroke(); x.restore();
    if (lx) T(x, lx, R.x + R.w, R.y + R.h + v * 1.8, { f: 'sans', size: v * 1.25, w: 500, c: C.mute, al: 'right', a });
    if (ly) T(x, ly, R.x - v * .6, R.y - v * 1.2, { f: 'sans', size: v * 1.25, w: 500, c: C.mute, a });
  },
  /* 雪 */
  snow(S, t, amt, seed = 5) {
    if (amt <= 0) return; const x = S.near, { W, H: h, v } = S, r = rng(seed), B = 6, bk = Array.from({ length: B }, () => []);
    for (let i = 0; i < 140; i++) {
      const s0 = r(), s1 = r(), s2 = r(), s3 = r(), y = ((s1 + t * (.025 + .05 * s2)) % 1) * h * 1.1 - h * .05, xx = (s0 + Math.sin(t * .6 + s3 * 6) * .015) * W, rr = (.5 + s2 * 1.8) * v * .13;
      bk[Math.min(B - 1, Math.floor(s2 * B))].push(xx, y, rr);
    }
    for (let b = 0; b < B; b++) { const L = bk[b]; if (!L.length) continue; x.fillStyle = col('#e4f1ff', amt * (.25 + .55 * (b + .5) / B)); x.beginPath(); for (let k = 0; k < L.length; k += 3) { x.moveTo(L[k] + L[k + 2], L[k + 1]); x.arc(L[k], L[k + 1], L[k + 2], 0, TAU); } x.fill(); }
  },
  /* 全息印章 */
  seal(S, x, cx, cy, r, s, p, o = {}) {
    if (p <= 0) return; const C = S.k.c, c = o.c || C.red, k = E.oB(clamp(p), 2.2), sc = lerp(2.2, 1, Math.min(1, k)), a = clamp(p * 2.5) * (o.a ?? 1);
    x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(o.rot ?? -.12); x.scale(sc, sc);
    x.strokeStyle = col(c, .95); x.lineWidth = r * .07; x.strokeRect(-r * 1.35, -r * .55, r * 2.7, r * 1.1); x.lineWidth = r * .025; x.strokeRect(-r * 1.25, -r * .45, r * 2.5, r * .9);
    x.restore();
    T(x, s, cx, cy, { f: 'sans', size: r * .62, w: 900, c, al: 'center', a, tr: .12, sh: { c, a: .6 } });
  },
};
