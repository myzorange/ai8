'use strict';
/* AI 八堂课 · 动效手感 v1（取自「Claude 动效作品集」）
   只改“怎么动”，不改“长什么样”：配色、字体、照片、版面都用课程原来的。
   全部是时间的纯函数：拖进度条、跳转、倒放，同一时刻的画面永远一样（不用 Math.random）。

   spring  弹簧：冲过头再回来（入场、落位）
   squash  挤压拉伸：落地压扁、弹起拉长（有“重量”的东西）
   slam    大字砸入：从大到小落下，带过冲和拖影（关键词、数字）
   punch   推镜冲击：镜头往前一顶再弹回（切镜、重音）
   shake   镜头震动：衰减的确定性抖动
   smear   运动拖影：快速运动时在前几个时刻各画一遍，越早越淡
   tf      对一个元素做缩放/旋转/位移，同时作用在它的光晕层上，光晕不会错位
   whip    甩镜：两个镜头同时在画面里横向滑过（切镜卡在旁白的关键词上） */
const MO = {
  /* 弹簧预设 [刚度, 阻尼]：snappy 利落、bouncy 弹、pop 弹出、gentle 缓、wobbly 果冻 */
  P: { snappy: [380, 30], bouncy: [260, 13], pop: [300, 16], gentle: [120, 20], wobbly: [180, 8], slam: [520, 24] },
  /* 阻尼弹簧的阶跃响应（闭式解）：t 秒后从 0 走向 1，欠阻尼时冲过 1 再回来 */
  spring(t, k = 170, d = 18) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * Math.sqrt(k));
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  },
  sp(t, t0, p = 'bouncy') { const [k, d] = typeof p === 'string' ? MO.P[p] : p; return MO.spring(t - t0, k, d); },
  /* 落地挤压：t0 那一刻压到最扁，之后带几下衰减的回弹。返回 {sx, sy}，以元素底边为轴心用 */
  squash(t, t0, amt = 1, w = .085) {
    const q = (t - t0) / w, c = Math.abs(q) >= 1 ? 0 : Math.cos(q * Math.PI / 2) ** 2;
    const wob = t > t0 ? .1 * amt * Math.sin((t - t0) * 38) * Math.exp(-(t - t0) * 12) : 0;
    return { sx: 1 + .4 * c * amt - wob, sy: 1 - .34 * c * amt + wob };
  },
  /* 自由落体：t0 起从 y0 落到 y1，用时 d 秒；返回 {y, v(0..1 速度), done} */
  fall(t, t0, y0, y1, d = .26) { const s = clamp((t - t0) / d); return { y: lerp(y0, y1, s * s), v: s, done: s >= 1 }; },
  /* 确定性噪声 */
  hash(i, s = 1) { let a = (i * 374761393 + s * 668265263) | 0; a = Math.imul(a ^ (a >>> 13), 1274126177); return ((a ^ (a >>> 16)) >>> 0) / 4294967296; },
  noise(x, s = 1) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(MO.hash(i, s), MO.hash(i + 1, s), u) * 2 - 1; },
  shake(t, t0, amp, decay = .16, seed = 3) { if (t < t0) return [0, 0]; const a = amp * Math.exp(-(t - t0) / decay); return [a * MO.noise(t * 42, seed), a * MO.noise(t * 42, seed + 7)]; },
  punch(t, t0, amt = .06, p = 'snappy') { return t < t0 ? 0 : amt * (1 - MO.sp(t, t0, p)); },
  /* 大字砸入：从 from 倍落到 1；k 是弹簧进度（会略冲过 1）；a 是前 0.05 秒的显形 */
  slam(t, t0, from = 2.2, p = 'slam') { const k = MO.sp(t, t0, p); return { k, s: lerp(from, 1, k), a: clamp((t - t0) / .05) }; },
  /* 同一元素用到的画布：本层 + 它的光晕层 + 中景光晕层（BRK、CO 等会画到 S.glow） */
  ctxs(S, x) { const L = [x]; if (x.__g && !L.includes(x.__g)) L.push(x.__g); const g = S.glow; if (!L.includes(g)) L.push(g); return L; },
  /* 变换：以 (o.x, o.y) 为轴心缩放 o.sx/o.sy、旋转 o.r，再平移 o.dx/o.dy；画法照旧用原坐标 */
  tf(S, x, o, fn) {
    const L = MO.ctxs(S, x), X = o.x || 0, Y = o.y || 0, sx = o.sx ?? 1, sy = o.sy ?? 1;
    for (const c of L) { c.save(); c.translate(X + (o.dx || 0), Y + (o.dy || 0)); if (o.r) c.rotate(o.r); c.scale(sx, sy); c.translate(-X, -Y); }
    try { return fn(); } finally { for (let i = L.length - 1; i >= 0; i--) L[i].restore(); }
  },
  /* 整个镜头平移（甩镜）：中景、文字层和两层光晕一起动 */
  shift(S, dx, dy, fn) {
    const L = [S.mid, S.hud, S.hud.__g, S.glow];
    for (const c of L) { c.save(); c.translate(dx, dy); }
    try { return fn(); } finally { for (let i = L.length - 1; i >= 0; i--) L[i].restore(); }
  },
  /* 运动拖影：drawAt(tt, w) 画出 tt 时刻的样子，w 是这一份的透明度系数 */
  smear(t, n, dt, drawAt) { for (let i = n; i >= 1; i--) drawAt(t - i * dt, .42 * (1 - i / (n + 1))); return drawAt(t, 1); },
  /* 甩镜进度：以 tc 为中心、前后各 half 秒，慢—快—慢 */
  whip(t, tc, half = .13) { return E.io3(seg(t, tc - half, tc + half)); },
  /* 逐字下落入场：每个字从上方落下，落地挤压，s 是字的顺序间隔 */
  dropText(S, x, s, X, Y, t, t0, o = {}, gap = .045) {
    const ch = [...s], size = o.size || 16; x.save(); x.font = fnt(o.f || 'sans', size, o.w || 400);
    const ws = ch.map(c => x.measureText(c).width); x.restore();
    const sp = (o.tr || 0) * size, tot = ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1), fs = fsz(size);
    let xx = o.al === 'center' ? X - tot / 2 : o.al === 'right' ? X - tot : X;
    ch.forEach((c, i) => {
      const ti = t0 + i * gap, cx = xx + ws[i] / 2; xx += ws[i] + sp;
      if (c === ' ' || t < ti - .26) return;
      const draw = (tt, w) => {
        const f = MO.fall(tt, ti - .26, Y - fs * 2.2, Y, .26), q = MO.squash(tt, ti, .85);
        const st = f.done ? 1 : 1 + .35 * f.v;                       // 下落时纵向拉长
        MO.tf(S, x, { x: cx, y: Y + fs * .42, sx: q.sx / st, sy: q.sy * st }, () => T(x, c, cx, f.y, { ...o, al: 'center', tr: 0, a: (o.a ?? 1) * w * clamp((tt - ti + .26) / .06) }));
      };
      if (t < ti + .02) MO.smear(t, 3, .012, draw); else draw(t, 1);
    });
    return tot;
  },
};

/* 甩镜时给整组画面加一点模糊（GPU 做，便宜）；每帧开始先清掉，跳进度也不会残留 */
MO.blur = (S, px) => { const el = S.stack && S.stack.el; if (el) el.style.filter = px > .3 ? `blur(${px.toFixed(1)}px)` : ''; };
(function () {
  const b0 = Stage.prototype.begin;
  Stage.prototype.begin = function (si, cam, t) { const s = this.stacks[si]; if (s && s.el.style.filter) s.el.style.filter = ''; return b0.call(this, si, cam, t); };
})();

/* 场景标题（左上）：原来是淡入上浮；改成弹簧落位，粉/青两层错位先张开再合拢 */
(function () {
  const head0 = H.head;
  H.head = function (S, t, tag, name, o = {}) {
    const x = S.hud, C = S.k.c, v = S.v, a1 = E.o3(seg(t, .15, .6)), k = MO.sp(t, .28, 'bouncy');
    if (k <= 0 && a1 <= 0) return;
    const { X, Y, Y2: Y2s, sz } = headGeo(S), dy = (1 - k) * v * 2.4, a2 = clamp(k * 1.6) * (o.a ?? 1);
    T(x, decode(tag, seg(t, .15, .9) * 1.3, 7), X, Y, { f: 'mono', size: v * 1.3, w: 500, c: C.pri, tr: .08, a: a1 * (o.a ?? 1) });
    const Y2 = Y2s + dy, spread = 1.5 + 9 * (1 - MO.sp(t, .28, 'snappy')), oo = { f: 'smiley', size: sz, w: 400, a: a2 * .55 };
    T(x, name, X - spread, Y2, { ...oo, c: C.acc }); T(x, name, X + spread, Y2, { ...oo, c: C.pri });
    T(x, name, X, Y2, { f: 'smiley', size: sz, w: 400, c: C.ink, a: a2, sh: { c: C.pri, a: .5, b: 16 } });
  };
  H.head.original = head0;
})();
