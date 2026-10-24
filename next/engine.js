'use strict';
/* AI 八堂课 · 动画引擎 v2（深空全息）
   分层：far / mid / near（视差 + 景深）· glow（泛光）· hud（文字）
   后期：调色、暗角、胶片颗粒；支持转场（光圈、扫光、推镜、溶解）与自适应画质。 */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  o2: x => 1 - (1 - x) * (1 - x), o3: x => 1 - Math.pow(1 - x, 3), o4: x => 1 - Math.pow(1 - x, 4),
  oX: x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x), i2: x => x * x, i3: x => x * x * x,
  io3: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, ioS: x => -(Math.cos(Math.PI * x) - 1) / 2,
  oB: (x, s = 1.6) => { x = clamp(x); const c = s + 1; return 1 + c * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  oEl: x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -9 * x) * Math.sin((x * 9 - .75) * TAU / 3) + 1; },
};
const pulse = (t, a, b) => Math.sin(Math.PI * seg(t, a, b));
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const _rgb = {};
function rgb(h) { if (_rgb[h]) return _rgb[h]; const n = parseInt(h.slice(1), 16); return (_rgb[h] = [n >> 16, n >> 8 & 255, n & 255]); }
function col(h, a = 1) { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a < 0 ? 0 : a > 1 ? 1 : +a.toFixed(3)})`; }
function mix(a, b, p) { const x = rgb(a), y = rgb(b); return '#' + [0, 1, 2].map(i => Math.round(lerp(x[i], y[i], clamp(p))).toString(16).padStart(2, '0')).join(''); }

/* ---------- 文字 ---------- */
const FONT = { serif: 'AI8Serif', sans: 'AI8Sans', smiley: 'AI8Smiley', inter: 'AI8Inter', interd: 'AI8InterD', mono: 'AI8Mono' };
/* 小字自动放大，保证手机上也看得清（最小 11px） */
const fsz = size => Math.max(11, size * (1 + .65 * clamp((26 - size) / 16)));
/* 手机横屏很矮（高 340–430px）：小字被放大到 11px 后，按 v 算的行距会挤在一起。凡是上下叠放的文字，行距都按放大后的字号取较大值 */
const shortLand = S => !S.P && S.H < 560;
/* 场景标题的几何（标签行 + 大标题），H.head 和版面 LAY 共用 */
function headGeo(S) {
  const v = S.v, ls = v * 1.3, sz = v * (S.P ? 3.8 : 4.4), f1 = fsz(ls), f2 = fsz(sz);
  const X = S.P ? S.W * .075 : S.W * .06, Y = S.P ? S.H * .094 : S.H * (shortLand(S) ? .085 : .1);
  const Y2 = Y + Math.max(v * 3.6, f1 * .5 + f2 * .47 + 2);
  return { X, Y, Y2, sz, bottom: Y2 + f2 * .5 };
}
function fnt(f, size, w = 400) { return `${w} ${fsz(size).toFixed(2)}px "${FONT[f] || f}","AI8Sans","PingFang SC","Hiragino Sans GB",sans-serif`; }
function TW(x, s, o) {
  x.save(); x.font = fnt(o.f || 'sans', o.size || 16, o.w || 400); let w = x.measureText(s).width;
  if (o.tr) { const ch = [...s]; w = ch.reduce((p, c) => p + x.measureText(c).width, 0) + o.tr * (o.size || 16) * (ch.length - 1); }
  x.restore(); return w;
}
function T(x, s, X, Y, o) {
  const f = o.f || 'sans', size = o.size || 16, w = o.w || 400, a = o.a ?? 1, al = o.al || 'left', tr = o.tr || 0;
  if (a <= 0.003 || !s) return 0;
  const g = o.sh && x.__g ? x.__g : null;
  x.save(); x.font = fnt(f, size, w); x.textBaseline = o.bl || 'middle'; x.fillStyle = col(o.c || '#ffffff', a);
  if (g) { g.save(); g.font = x.font; g.textBaseline = x.textBaseline; g.fillStyle = col(o.sh.c || '#000000', Math.min(1, (o.sh.a ?? .5) * a * 1.5)); if (x.__gm) x.__gm(); }
  let wd;
  if (!tr) { x.textAlign = al; x.fillText(s, X, Y); if (g) { g.textAlign = al; g.fillText(s, X, Y); } wd = x.measureText(s).width; }
  else {
    const ch = [...s], ws = ch.map(c => x.measureText(c).width), sp = tr * size;
    wd = ws.reduce((p, q) => p + q, 0) + sp * (ch.length - 1);
    let xx = al === 'center' ? X - wd / 2 : al === 'right' ? X - wd : X; x.textAlign = 'left'; if (g) g.textAlign = 'left';
    ch.forEach((c, i) => { x.fillText(c, xx, Y); if (g) g.fillText(c, xx, Y); xx += ws[i] + sp; });
  }
  if (g) g.restore(); x.restore(); return wd;
}
/* 让文字不超过 maxW：返回合适的字号 */
function fit(x, s, maxW, o) { let size = o.size; for (let i = 0; i < 5; i++) { const w = TW(x, s, { ...o, size }); if (w <= maxW) break; size *= Math.max(.5, maxW / w * .97); } return size; }
/* 逐字出现：p 0→1，每个字带上浮与透明 */
function TReveal(x, s, X, Y, o, p) {
  const ch = [...s], n = ch.length; if (p <= 0) return 0;
  const g = o.sh && x.__g ? x.__g : null;
  x.save(); x.font = fnt(o.f || 'sans', o.size || 16, o.w || 400); x.textBaseline = 'middle'; x.textAlign = 'left';
  if (g) { g.save(); g.font = x.font; g.textBaseline = 'middle'; g.textAlign = 'left'; }
  const ws = ch.map(c => x.measureText(c).width), sp = (o.tr || 0) * (o.size || 16), tot = ws.reduce((a, b) => a + b, 0) + sp * (n - 1);
  let xx = o.al === 'center' ? X - tot / 2 : o.al === 'right' ? X - tot : X;
  ch.forEach((c, i) => {
    const qi = E.o3(clamp((p * (n + 3) - i) / 3));
    if (qi > 0) { const yy = Y + (1 - qi) * (o.size || 16) * .35; x.globalAlpha = (o.a ?? 1) * qi; x.fillStyle = col(o.c || '#ffffff', 1); x.fillText(c, xx, yy); if (g) { g.globalAlpha = Math.min(1, (o.a ?? 1) * qi * (o.sh.a ?? .5) * 1.5); g.fillStyle = col(o.sh.c || '#000000', 1); g.fillText(c, xx, yy); } }
    xx += ws[i] + sp;
  });
  if (g) g.restore(); x.restore(); return tot;
}
const GLYPH = '01#$%&*+<>/\\=?ABCDEFGHJKLMNPRSTUVXYZ';
function decode(s, p, seed = 0) {
  const ch = [...s], n = ch.length, k = Math.floor(clamp(p) * (n + 1)); if (k >= n) return s;
  const r = rng(seed + Math.floor(performance.now() / 70));
  return ch.map((c, i) => i < k || c === ' ' ? c : (i < k + 6 ? GLYPH[Math.floor(r() * GLYPH.length)] : '')).join('');
}
function richTokens(x, s, o) {
  const segs = []; let kw = false, buf = '';
  for (const ch of s) { if (ch === '{' || ch === '}') { if (buf) segs.push([buf, kw]); buf = ''; kw = ch === '{'; } else buf += ch; }
  if (buf) segs.push([buf, kw]);
  x.save(); x.font = fnt(o.f || 'sans', o.size, o.w || 400); const toks = [];
  for (const [t, k] of segs) for (const m of t.match(/[A-Za-z0-9][A-Za-z0-9.%+\-]*|./gu)) toks.push({ s: m, k, w: x.measureText(m).width });
  x.restore(); return toks;
}
const NO_START = '，。、；：？！”’）》」』…·,.;:?!)%';
function richLines(x, s, maxW, o) {
  const toks = richTokens(x, s, o), lines = []; let cur = [], cw = 0;
  for (const tk of toks) {
    if (cw + tk.w > maxW && cur.length && !NO_START.includes(tk.s)) { while (cur.length && cur[cur.length - 1].s === ' ') cur.pop(); lines.push(cur); cur = []; cw = 0; if (tk.s === ' ') continue; }
    cur.push(tk); cw += tk.w;
  }
  if (cur.length) lines.push(cur); return lines;
}
function rich(x, s, X, Y, maxW, o) {
  const lines = richLines(x, s, maxW, o), lh = o.lh || o.size * 1.5, a = o.a ?? 1;
  const y0 = o.vb === 'bottom' ? Y - (lines.length - 1) * lh : o.vb === 'center' ? Y - (lines.length - 1) * lh / 2 : Y;
  x.save(); x.font = fnt(o.f || 'sans', o.size, o.w || 400); x.textBaseline = 'middle'; x.textAlign = 'left';
  lines.forEach((ln, li) => {
    const lw = ln.reduce((p, c) => p + c.w, 0), yy = y0 + li * lh; let xx = o.al === 'center' ? X - lw / 2 : o.al === 'right' ? X - lw : X;
    for (const c of ln) {
      x.fillStyle = col(c.k ? (o.kc || o.c) : o.c, a);
      x.fillText(c.s, xx, yy); xx += c.w;
    }
  });
  x.restore(); return { n: lines.length, h: lines.length * lh };
}
function rrect(x, X, Y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function softDisc(x, X, Y, r, c, a, edge = .92) {
  if (r <= 0 || a <= 0) return; const g = x.createRadialGradient(X, Y, 0, X, Y, r);
  g.addColorStop(0, col(c, a * .5)); g.addColorStop(edge * .85, col(c, a * .72)); g.addColorStop(edge, col(c, a)); g.addColorStop(1, col(c, 0));
  x.fillStyle = g; x.fillRect(X - r, Y - r, 2 * r, 2 * r);
}
function haze(x, X, Y, r, c, a) {
  if (r <= 0 || a <= 0) return; const g = x.createRadialGradient(X, Y, 0, X, Y, r);
  g.addColorStop(0, col(c, a)); g.addColorStop(.4, col(c, a * .45)); g.addColorStop(1, col(c, 0));
  x.fillStyle = g; x.fillRect(X - r, Y - r, 2 * r, 2 * r);
}

/* ---------- 舞台 ---------- */
const K = {
  name: 'holo', bg0: '#03050b',
  c: { pri: '#45E3FF', priHi: '#C2F7FF', sec: '#7B5CFF', acc: '#FF4FD8', accHi: '#FFB3F1', ink: '#EAF6FF', mute: '#8597B4', dim: '#33415a', line: '#1c2944', gold: '#FFC86B', red: '#FF5A6E', ok: '#5CFFB0', cold: '#A9BED3' },
  depth: { far: .3, near: 1.9 }, blur: { far: .6, near: 5 }, glow: 1.1, vig: .62, vigC: '#00000c', grain: .06, grainOp: 'overlay', tint: ['#3d5cff', .06],
};
/* 舞台：每组画面由 6 张叠放的画布组成（远景/中景/近景/泛光/文字/文字光晕），
   颗粒、调色、暗角、模糊、泛光和转场遮罩都交给 GPU（CSS）完成，画布只画内容。 */
class Stage {
  constructor(root, opts = {}) {
    this.root = root; this.k = K; this.q = 1; this.S = { stage: this }; this.opts = opts; this.fno = 0;
    root.classList.add('film'); root.innerHTML = '';
    this.stacks = [this.mkStack(0)]; if (!opts.single) this.stacks.push(this.mkStack(1));
    this.fx = this.mkCv('fx'); root.appendChild(this.fx.cv);
    for (const c of ['tint', 'vig', 'grain']) { const d = document.createElement('div'); d.className = 'post p-' + c; root.appendChild(d); this['p' + c] = d; }
    this.applyLook();
  }
  mkCv(cls) { const c = document.createElement('canvas'); c.className = cls; return { cv: c, ctx: c.getContext('2d') }; }
  mkStack(i) {
    const el = document.createElement('div'); el.className = 'stack'; if (i) el.hidden = true;
    const L = {}; for (const n of ['far', 'mid', 'near', 'glow', 'hud', 'hglow']) { L[n] = this.mkCv('ly ly-' + n); el.appendChild(L[n].cv); }
    L.mid.ctx.__g = L.glow.ctx; L.near.ctx.__g = L.glow.ctx; L.far.ctx.__g = L.glow.ctx; L.hud.ctx.__g = L.hglow.ctx;
    this.root.appendChild(el); return { el, L, farKey: '', dirty: {} };
  }
  applyLook() {
    const k = this.k, r = this.root.style;
    this.ptint.style.display = k.tint ? '' : 'none'; if (k.tint) { this.ptint.style.background = k.tint[0]; this.ptint.style.opacity = k.tint[1]; }
    this.pvig.style.display = k.vig > 0 ? '' : 'none'; this.pvig.style.opacity = Math.min(1, k.vig / .62);
    this.pgrain.style.display = k.grain > 0 ? '' : 'none'; this.pgrain.style.opacity = k.grain;
    if (k.grain > 0 && !Stage.grainURL) {
      const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), im = x.createImageData(256, 256), rr = rng(7);
      for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rr() + rr() + rr() - 1.5) * 118; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      x.putImageData(im, 0, 0); Stage.grainURL = c.toDataURL('image/png');
    }
    if (k.grain > 0) this.pgrain.style.backgroundImage = `url(${Stage.grainURL})`;
  }
  resize(W, H, dpr) {
    this.W = W; this.H = H; this.dpr = dpr; const m = .06, fs = dpr * .5;
    for (const s of this.stacks) {
      for (const n in s.L) {
        const c = s.L[n].cv;
        if (n === 'far') { c.width = Math.round(W * (1 + 2 * m) * fs); c.height = Math.round(H * (1 + 2 * m) * fs); Object.assign(c.style, { left: -m * W + 'px', top: -m * H + 'px', width: W * (1 + 2 * m) + 'px', height: H * (1 + 2 * m) + 'px' }); }
        else { const sc = n === 'glow' || n === 'hglow' ? .25 : 1; c.width = Math.max(1, Math.round(W * dpr * sc)); c.height = Math.max(1, Math.round(H * dpr * sc)); Object.assign(c.style, { left: '0px', top: '0px', width: W + 'px', height: H + 'px' }); }
      }
      s.farKey = ''; s.dirty = { near: 1, glow: 1, hglow: 1 };
    }
    this.fx.cv.width = Math.round(W * dpr * .5); this.fx.cv.height = Math.round(H * dpr * .5); Object.assign(this.fx.cv.style, { width: W + 'px', height: H + 'px' });
    const r = this.root.style, mn = Math.min(W, H);
    r.setProperty('--gblur', Math.max(3, mn * .011).toFixed(1) + 'px'); r.setProperty('--hblur', Math.max(2.5, mn * .009).toFixed(1) + 'px');
    r.setProperty('--nblur', (this.q < .7 ? 0 : Math.max(1.5, mn * this.k.blur.near / 540)).toFixed(1) + 'px'); r.setProperty('--fblur', (mn * this.k.blur.far / 540).toFixed(2) + 'px');
  }
  camT(x, c, dz, s) {
    const d = this.dpr * s, z = 1 + (c.z - 1) * dz, cx = this.W / 2 + (c.ox || 0), cy = this.H / 2 + (c.oy || 0), r = (c.r || 0) * dz;
    const cs = Math.cos(r) * z, sn = Math.sin(r) * z, tx = cx + c.x * dz, ty = cy + c.y * dz;
    x.setTransform(d * cs, d * sn, -d * sn, d * cs, d * (cx - cs * tx + sn * ty), d * (cy - sn * tx - cs * ty));
  }
  begin(si, cam, t) {
    const s = this.stacks[si], { W, H } = this, P = H > W * 1.05, k = this.k, S = this.S;
    Object.assign(S, { W, H, P, k, t, u: Math.min(W, H) / 100, v: P ? W / 56 : H / 100, stage: this, stack: s });
    const c = Object.assign({ x: 0, y: 0, z: 1, r: 0 }, cam || {}), L = s.L;
    for (const n of ['mid', 'near', 'glow', 'hud', 'hglow']) {
      if ((n === 'near' || n === 'glow' || n === 'hglow') && !s.dirty[n]) continue;
      const l = L[n], x = l.ctx; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, l.cv.width, l.cv.height); s.dirty[n] = 0;
    }
    this.camT(L.mid.ctx, c, 1, 1); this.camT(L.near.ctx, c, k.depth.near, 1); this.camT(L.glow.ctx, c, 1, .25);
    L.hud.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); L.hglow.ctx.setTransform(this.dpr * .25, 0, 0, this.dpr * .25, 0, 0);
    const fz = 1 + (c.z - 1) * k.depth.far; L.far.cv.style.transform = `translate(${(-c.x * k.depth.far * fz).toFixed(2)}px,${(-c.y * k.depth.far * fz).toFixed(2)}px) scale(${fz.toFixed(4)})`;
    const fsc = this.dpr * .5; L.far.ctx.setTransform(fsc, 0, 0, fsc, .06 * W * fsc, .06 * H * fsc);
    S.cam = c; S.map = (px, py, dz = 1) => { const z = 1 + (c.z - 1) * dz; return [z * (px - (W / 2 + c.x * dz)) + W / 2, z * (py - (H / 2 + c.y * dz)) + H / 2, z]; };
    S.far = L.far.ctx; S.mid = L.mid.ctx; S.hud = L.hud.ctx;
    Object.defineProperty(S, 'near', { configurable: true, get() { s.dirty.near = 1; return L.near.ctx; } });
    Object.defineProperty(S, 'glow', { configurable: true, get() { s.dirty.glow = 1; return L.glow.ctx; } });
    L.mid.ctx.__gm = L.near.ctx.__gm = () => { s.dirty.glow = 1; }; L.hud.ctx.__gm = () => { s.dirty.hglow = 1; };
    return S;
  }
  frame(A, B = null, p = 0, tr = null) {
    const s0 = this.stacks[0], s1 = this.stacks[1];
    let S = this.begin(0, A.cam, A.t); A.draw(S);
    if (B && s1) { S = this.begin(1, B.cam, B.t); B.draw(S); s1.el.hidden = false; this.reveal(clamp(p), tr || { type: 'fade' }, s0, s1); }
    else { if (s1 && !s1.el.hidden) s1.el.hidden = true; this.plain(s0); }
    if (this.k.grain > 0) { const r = rng(++this.fno * 977 + 13); this.pgrain.style.backgroundPosition = `${(r() * 256) | 0}px ${(r() * 256) | 0}px`; }
  }
  plain(s0) {
    const st = s0.el.style; if (st.zIndex || st.opacity || st.transform) { st.zIndex = ''; st.opacity = ''; st.transform = ''; }
    if (this.fxOn) { const x = this.fx.ctx; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.fx.cv.width, this.fx.cv.height); this.fxOn = false; }
    if (this.stacks[1]) { const s1 = this.stacks[1].el.style; s1.clipPath = s1.webkitClipPath = ''; s1.opacity = ''; }
  }
  reveal(p, tr, s0, s1) {
    const W = this.W, H = this.H, C = this.k.c, st0 = s0.el.style, st1 = s1.el.style, type = tr.type || 'fade';
    st0.zIndex = ''; st0.opacity = ''; st0.transform = ''; st1.clipPath = st1.webkitClipPath = ''; st1.opacity = '';
    const x = this.fx.ctx, d = this.dpr * .5; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, this.fx.cv.width, this.fx.cv.height); x.setTransform(d, 0, 0, d, 0, 0); this.fxOn = true;
    const glowLine = (path, c) => { const w = Math.min(W, H) * .02; for (const [lw, a] of [[w * 3, .12], [w, .35], [w * .25, .95]]) { path(); x.strokeStyle = col(c, a * Math.sin(Math.PI * p)); x.lineWidth = lw; x.stroke(); } };
    if (type === 'fade') { st1.opacity = E.ioS(p).toFixed(3); x.fillStyle = col(C.pri, .06 * Math.sin(Math.PI * p)); x.fillRect(0, 0, W, H); }
    else if (type === 'iris') {
      const cx = (tr.x ?? .5) * W, cy = (tr.y ?? .5) * H, R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * E.io3(p) * 1.02;
      st1.clipPath = st1.webkitClipPath = `circle(${R.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      glowLine(() => { x.beginPath(); x.arc(cx, cy, Math.max(.1, R), 0, TAU); }, tr.c || C.pri);
    } else if (type === 'wipe') {
      const ang = tr.ang ?? -.35, L = W + H, off = lerp(-L * .6, L * .6, E.io3(p)), cx = W / 2 + Math.cos(ang) * off, cy = H / 2 + Math.sin(ang) * off, nx = Math.cos(ang), ny = Math.sin(ang), tx = -ny * L, ty = nx * L;
      const pts = [[cx + tx, cy + ty], [cx - tx, cy - ty], [cx - tx - nx * L * 2, cy - ty - ny * L * 2], [cx + tx - nx * L * 2, cy + ty - ny * L * 2]];
      st1.clipPath = st1.webkitClipPath = 'polygon(' + pts.map(q => q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px').join(',') + ')';
      glowLine(() => { x.beginPath(); x.moveTo(cx + tx, cy + ty); x.lineTo(cx - tx, cy - ty); }, tr.c || C.pri);
    } else if (type === 'zoom') { const sc = 1 + E.i2(p) * .35; st0.zIndex = '3'; st0.transform = `scale(${sc.toFixed(4)})`; st0.opacity = (1 - E.io3(p)).toFixed(3); }
  }
}
/* ---------- 深空全息 · 绘图套件 ---------- */
const H = {
  _stars: null,
  stars(n = 260) { if (!this._stars) { const r = rng(91); this._stars = Array.from({ length: n }, () => [r(), r(), r(), r()]); } return this._stars; },
  /* 背景：o.cold 0..1 冷寂，o.hue 'gold' 等 */
  bg(S, t, o = {}) {
    const st = S.stack, key = [S.W, S.H, Math.round((o.cold || 0) * 12), o.hue || '', o.neb ?? 1, o.starA ?? 1, o.n1x ?? '', o.n1y ?? '', o.n2x ?? '', o.n2y ?? '', o.moon ? o.moon.map(q => Math.round(q)).join(',') : ''].join('|');
    if (st && st.farKey === key) return; if (st) st.farKey = key;
    const x = S.far, { W, H: h, k } = S, cold = Math.round((o.cold || 0) * 12) / 12, C = k.c;
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, x.canvas.width, x.canvas.height); x.restore();
    let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, mix('#050816', '#0a0d12', cold)); g.addColorStop(1, mix('#020309', '#06070a', cold));
    x.fillStyle = g; x.fillRect(-W * .3, -h * .3, W * 1.6, h * 1.6);
    const sat = 1 - cold * .85;
    haze(x, W * (o.n1x ?? .82), h * (o.n1y ?? .1), W * .62, o.hue === 'gold' ? '#7a4a10' : mix('#4b2bd6', '#3a4a5e', cold), .30 * (o.neb ?? 1));
    haze(x, W * (o.n2x ?? .06), h * (o.n2y ?? .95), W * .55, mix('#0a86ad', '#2c3e50', cold), .24 * (o.neb ?? 1));
    if (sat > .2) haze(x, W * .55, -h * .05, W * .38, o.hue === 'gold' ? C.gold : C.acc, .07 * sat * (o.neb ?? 1));
    for (const s of this.stars()) {
      const a = (.15 + s[2] * .7 * (.6 + .4 * Math.sin(s[3] * 20))) * (o.starA ?? 1);
      x.fillStyle = col(s[3] < .8 ? '#ffffff' : (cold > .5 ? '#cfe3ff' : C.pri), a);
      const sz = s[2] < .9 ? 1.2 : 2; x.fillRect(s[0] * W * 1.3 - W * .15, s[1] * h * 1.2 - h * .1, sz, sz);
    }
    if (o.moon) { const [mx, my, mr] = o.moon; haze(x, mx, my, mr * 7, '#9fc4ff', .2); const mg = x.createRadialGradient(mx - mr * .3, my - mr * .3, mr * .1, mx, my, mr); mg.addColorStop(0, '#ffffff'); mg.addColorStop(1, '#cfe2ff'); x.beginPath(); x.arc(mx, my, mr, 0, TAU); x.fillStyle = mg; x.fill(); }
  },
  /* 地面极坐标网格（mid 层） */
  floor(S, cx, cy, R, tilt, a = 1, c) {
    const m = S.mid, C = c || S.k.c.pri; m.save(); m.lineWidth = .8;
    for (let q = 0; q < 9; q++) { const rr = R * (1 + q * .22); m.beginPath(); m.ellipse(cx, cy, rr, rr * tilt, 0, 0, TAU); m.strokeStyle = col(C, .15 * (1 - q / 9) * a); m.stroke(); }
    for (let q = 0; q < 36; q++) {
      const th = q / 36 * TAU, c1 = Math.cos(th), s1 = Math.sin(th), x1 = cx + c1 * R, y1 = cy + s1 * R * tilt, x2 = cx + c1 * R * 2.9, y2 = cy + s1 * R * tilt * 2.9;
      const gr = m.createLinearGradient(x1, y1, x2, y2); gr.addColorStop(0, col(C, .13 * a)); gr.addColorStop(1, col(C, 0));
      m.beginPath(); m.moveTo(x1, y1); m.lineTo(x2, y2); m.strokeStyle = gr; m.stroke();
    }
    m.restore();
  },
  /* 平面 HUD 网格 */
  grid(x, X, Y, w, h, step, c, a = .12) {
    x.save(); x.lineWidth = .7; x.strokeStyle = col(c, a); x.beginPath();
    for (let gx = X; gx <= X + w + .1; gx += step) { x.moveTo(gx, Y); x.lineTo(gx, Y + h); }
    for (let gy = Y; gy <= Y + h + .1; gy += step) { x.moveTo(X, gy); x.lineTo(X + w, gy); }
    x.stroke(); x.restore();
  },
  /* 玻璃面板 */
  panel(S, x, X, Y, w, h, o = {}) {
    const C = S.k.c, a = o.a ?? 1, c = o.c || C.pri; if (a <= 0) return;
    x.save(); x.globalAlpha = a;
    rrect(x, X, Y, w, h, o.r ?? 6);
    const g = x.createLinearGradient(X, Y, X + w * .4, Y + h); g.addColorStop(0, 'rgba(70,120,190,.20)'); g.addColorStop(1, 'rgba(10,18,40,.55)');
    x.fillStyle = g; x.fill(); x.strokeStyle = col(c, .35); x.lineWidth = 1; x.stroke();
    const l = Math.min(w, h) * .14; x.strokeStyle = col(c, .95); x.lineWidth = 1.4; x.beginPath();
    for (const [cx, cy, sx, sy] of [[X, Y, 1, 1], [X + w, Y, -1, 1], [X, Y + h, 1, -1], [X + w, Y + h, -1, -1]]) { x.moveTo(cx, cy + sy * l); x.lineTo(cx, cy); x.lineTo(cx + sx * l, cy); }
    x.stroke();
    if (o.head) T(x, o.head, X + S.v * 1.2, Y + Math.max(S.v * 1.6, fsz(S.v * 1.05) * .5 + S.v * .5), { f: 'mono', size: S.v * 1.05, w: 500, c, tr: .08, a: .9 });
    x.restore();
    if (o.glow !== false) { const gx = S.glow; gx.save(); gx.globalAlpha = a; rrect(gx, X, Y, w, h, o.r ?? 6); gx.strokeStyle = col(c, .35); gx.lineWidth = 2; gx.stroke(); gx.restore(); }
  },
  chip(S, x, s, X, Y, o = {}) {
    const C = S.k.c, v = S.v, size = o.size || v * 1.7, a = o.a ?? 1, c = o.hot ? C.acc : (o.c || C.pri); if (a <= 0) return 0;
    const fs = fsz(size), tw = TW(x, s, { f: o.f || 'sans', size, w: o.w || 500 }), pw = tw + fs * 1.3, ph = fs * 1.9, xx = o.al === 'center' ? X - pw / 2 : o.al === 'right' ? X - pw : X;
    x.save(); x.globalAlpha = a; rrect(x, xx, Y - ph / 2, pw, ph, ph / 2); x.fillStyle = o.hot ? 'rgba(60,8,58,.75)' : 'rgba(6,20,40,.7)'; x.fill(); x.strokeStyle = col(c, .85); x.lineWidth = 1; x.stroke(); x.restore();
    T(x, s, xx + pw / 2, Y + fs * .04, { f: o.f || 'sans', size, w: o.w || 500, c: o.hot ? C.accHi : (o.tc || C.ink), al: 'center', a });
    if (o.glow !== false) { const gx = S.glow; gx.save(); gx.globalAlpha = a; rrect(gx, xx, Y - ph / 2, pw, ph, ph / 2); gx.strokeStyle = col(c, .6); gx.lineWidth = 2; gx.stroke(); gx.restore(); }
    return pw;
  },
  /* 神经元光球 */
  node(S, X, Y, r, o = {}) {
    const C = S.k.c, x = o.x || S.mid, lit = o.lit ?? 1, c = o.c || C.pri, a = o.a ?? 1; if (a <= 0 || r <= 0) return;
    x.save(); x.globalAlpha = a;
    const g = x.createRadialGradient(X - r * .3, Y - r * .35, r * .1, X, Y, r);
    g.addColorStop(0, col(mix('#0d1a2e', '#ffffff', .25 + lit * .6), 1)); g.addColorStop(.55, col(mix('#0a1426', c, .2 + lit * .6), 1)); g.addColorStop(1, col(mix('#050a14', c, .15 + lit * .25), 1));
    x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fillStyle = g; x.fill();
    x.strokeStyle = col(c, .5 + lit * .5); x.lineWidth = Math.max(1, r * .08); x.stroke();
    x.restore();
    if (lit > 0.02) { const gx = S.glow; gx.save(); gx.globalAlpha = a * lit; gx.beginPath(); gx.arc(X, Y, r * 1.25, 0, TAU); gx.fillStyle = col(c, .9); gx.fill(); gx.restore(); }
  },
  /* 连线 + 流动光点 */
  link(S, x1, y1, x2, y2, o = {}) {
    const C = S.k.c, x = o.x || S.mid, w = o.w ?? 1.5, c = o.c || C.pri, a = o.a ?? 1, p = o.p ?? 1; if (a <= 0 || p <= 0) return;
    const bx = (x1 + x2) / 2 + (o.bend || 0) * -(y2 - y1), by = (y1 + y2) / 2 + (o.bend || 0) * (x2 - x1);
    const pt = q => { const u = 1 - q; return [u * u * x1 + 2 * u * q * bx + q * q * x2, u * u * y1 + 2 * u * q * by + q * q * y2]; };
    x.save(); x.globalAlpha = a; x.lineCap = 'round'; x.beginPath(); x.moveTo(x1, y1);
    const steps = 24; for (let i = 1; i <= steps; i++) { const q = i / steps * p; const [px, py] = pt(q); x.lineTo(px, py); }
    x.strokeStyle = col(c, .75); x.lineWidth = w; x.stroke(); x.restore();
    const gx = S.glow; gx.save(); gx.globalAlpha = a * .8; gx.lineCap = 'round'; gx.beginPath(); gx.moveTo(x1, y1);
    for (let i = 1; i <= steps; i++) { const [px, py] = pt(i / steps * p); gx.lineTo(px, py); } gx.strokeStyle = col(c, .6); gx.lineWidth = w + 1.5; gx.stroke(); gx.restore();
    if (o.flow) {
      const n = o.n || 3; for (let i = 0; i < n; i++) {
        const q = ((S.t * o.flow + i / n) % 1); if (q > p) continue; const [px, py] = pt(q), rr = (o.dot || w * 1.6);
        x.save(); x.globalAlpha = a; x.beginPath(); x.arc(px, py, rr, 0, TAU); x.fillStyle = col(o.dc || C.priHi, .95); x.fill(); x.restore();
        gx.save(); gx.globalAlpha = a; gx.beginPath(); gx.arc(px, py, rr * 2.2, 0, TAU); gx.fillStyle = col(o.dc || C.priHi, .9); gx.fill(); gx.restore();
      }
    }
  },
  rings(S, X, Y, r0, r1, t, o = {}) {
    const C = S.k.c, x = o.x || S.mid, c = o.c || C.pri, n = o.n || 3, tilt = o.tilt ?? 1, a = o.a ?? 1; if (t < 0 || a <= 0) return;
    for (let q = 0; q < n; q++) {
      const ph = (((t * (o.speed || .5)) + q / n) % 1 + 1) % 1, rr = Math.max(.1, lerp(r0, r1, E.o2(ph))), al = (1 - ph) * .85 * a; if (al <= 0) continue;
      x.beginPath(); x.ellipse(X, Y, rr, rr * tilt, 0, 0, TAU); x.strokeStyle = col(c, al); x.lineWidth = o.w || 1.2; x.stroke();
      S.glow.beginPath(); S.glow.ellipse(X, Y, rr, rr * tilt, 0, 0, TAU); S.glow.strokeStyle = col(c, al); S.glow.lineWidth = 2; S.glow.stroke();
    }
  },
  /* 大号年份读数（右上角 HUD） */
  year(S, t, y, o = {}) {
    const x = S.hud, C = S.k.c, v = S.v, a = (o.a ?? 1) * E.o3(seg(t, o.at ?? .2, (o.at ?? .2) + .7)); if (a <= 0) return;
    const p = seg(t, o.at ?? .2, (o.at ?? .2) + 1.0), s = o.from !== undefined ? String(Math.round(lerp(o.from, y, E.o3(p)))) : decode(String(y), p * 1.4, y);
    const X = S.P ? S.W - S.v * 3.4 : S.W - S.W * .06, Y = S.P ? S.H * .075 : S.H * .115;
    T(x, 'YEAR', X, Y - v * 2.9, { f: 'mono', size: v * 1.0, w: 500, c: C.mute, al: 'right', tr: .3, a: a * .8 });
    T(x, s, X, Y + v * .7, { f: 'interd', size: v * (S.P ? 4.6 : 5.6), w: 700, c: o.c || C.priHi, al: 'right', a, sh: { c: o.c || C.pri, a: .7, b: 22 } });
  },
  /* 场景标题（左上） */
  head(S, t, tag, name, o = {}) {
    const x = S.hud, C = S.k.c, v = S.v, a1 = E.o3(seg(t, .15, .8)), a2 = E.o3(seg(t, .3, 1.1)), dy = (1 - a2) * v * 1.2;
    const { X, Y, Y2: Y2s, sz } = headGeo(S);
    T(x, decode(tag, seg(t, .15, .9) * 1.3, 7), X, Y, { f: 'mono', size: v * 1.3, w: 500, c: C.pri, tr: .08, a: a1 * (o.a ?? 1) });
    const Y2 = Y2s + dy, oo = { f: 'smiley', size: sz, w: 400, a: a2 * .55 * (o.a ?? 1) };
    T(x, name, X - 1.5, Y2, { ...oo, c: C.acc }); T(x, name, X + 1.5, Y2, { ...oo, c: C.pri });
    T(x, name, X, Y2, { f: 'smiley', size: sz, w: 400, c: C.ink, a: a2 * (o.a ?? 1), sh: { c: C.pri, a: .5, b: 16 } });
  },
  /* 计数 */
  count(v0, v1, p, fmt = n => Math.round(n).toLocaleString('en-US')) { return fmt(lerp(v0, v1, E.o3(clamp(p)))); },
  /* 线条图标 */
  icon(x, name, X, Y, s, c, a = 1, lw = 1.4) {
    if (a <= 0) return; x.save(); x.translate(X, Y); x.scale(s / 24, s / 24); x.lineWidth = lw * 24 / s; x.lineJoin = 'round'; x.lineCap = 'round'; x.strokeStyle = col(c, a); x.fillStyle = col(c, a); x.beginPath();
    const P = new Path2D(ICON[name] || ICON.dot); x.stroke(P); x.restore();
  },
};
/* 24×24 线条图标路径（原创绘制） */
const ICON = {
  dot: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  cat: 'M5 9 L6 3 L10 7 H14 L18 3 L19 9 Q21 14 17 18 Q12 21 7 18 Q3 14 5 9 Z M9.5 12h.01 M14.5 12h.01 M10.5 15.5 Q12 16.5 13.5 15.5',
  dog: 'M6 5 Q3 6 3 11 L5 12 L6 8 M18 5 Q21 6 21 11 L19 12 L18 8 M6 6 Q12 2 18 6 Q20 13 16 18 Q12 21 8 18 Q4 13 6 6 Z M9.5 11h.01 M14.5 11h.01 M11 15 h2 L12 16 Z',
  car: 'M3 15 L5 9 Q6 7 8 7 H16 Q18 7 19 9 L21 15 V18 H3 Z M3 15 H21 M7 18 v1.5 M17 18 v1.5 M6.5 12.5 h.01 M17.5 12.5 h.01',
  flower: 'M12 10 Q9 4 12 3 Q15 4 12 10 Q18 7 19 10 Q18 13 12 11 Q15 17 12 18 Q9 17 12 11 Q6 13 5 10 Q6 7 12 10 M12 18 V22 M12 20 Q9 19 8 17',
  bird: 'M3 12 Q8 7 13 11 L21 8 L17 13 Q15 19 8 18 Q4 17 3 12 Z M14 10.5 h.01',
  cup: 'M5 8 H16 V15 Q16 19 12 19 H9 Q5 19 5 15 Z M16 10 H18 Q20 10 20 12.5 Q20 15 17 15 M8 3 Q9 4.5 8 6 M12 3 Q13 4.5 12 6',
  house: 'M3 11 L12 4 L21 11 M5 9.5 V20 H19 V9.5 M10 20 V14 H14 V20',
  tree: 'M12 3 L18 12 H14 L19 18 H5 L10 12 H6 Z M12 18 V22',
  gpu: 'M2 7 H22 V17 H2 Z M5 17 V20 M9 17 V20 M13 17 V20 M8 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M16 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  paper: 'M5 3 H16 L19 6 V21 H5 Z M8 8 H16 M8 11.5 H16 M8 15 H13',
  boat: 'M3 15 H21 L18 19 H6 Z M12 15 V4 L18 13 H12 M4 21 Q8 20 12 21 Q16 22 20 21',
  person: 'M12 8m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0 M5 21 Q5 14 12 14 Q19 14 19 21',
  medal: 'M8 3 L12 10 L16 3 M12 15m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0 M12 12.5 L12.9 14.4 L15 14.6 L13.4 16 L13.9 18 L12 17 L10.1 18 L10.6 16 L9 14.6 L11.1 14.4 Z',
  chat: 'M4 5 H20 V16 H11 L6 20 V16 H4 Z M8 10.5h.01 M12 10.5h.01 M16 10.5h.01',
  book: 'M3 5 Q7 3 12 6 Q17 3 21 5 V19 Q17 17 12 20 Q7 17 3 19 Z M12 6 V20',
  bench: 'M3 10 H21 M3 13 H21 M5 13 V19 M19 13 V19 M5 10 V7 M19 10 V7',
  globe: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M3 12 H21 M12 3 Q16 7 16 12 Q16 17 12 21 Q8 17 8 12 Q8 7 12 3',
  snow: 'M12 3 V21 M4.2 7.5 L19.8 16.5 M4.2 16.5 L19.8 7.5 M10 5 L12 7 L14 5 M10 19 L12 17 L14 19',
};
async function loadFonts() {
  const L = ['400 20px AI8Sans', '500 20px AI8Sans', '700 20px AI8Sans', '900 20px AI8Sans', '400 20px AI8Smiley', '600 20px AI8Inter', '700 20px AI8InterD', '900 20px AI8InterD', '400 20px AI8Mono', '500 20px AI8Mono'];
  await Promise.all(L.map(f => document.fonts.load(f, '测试AI08').catch(() => 0)));
  try { await document.fonts.ready; } catch (e) { }
}
