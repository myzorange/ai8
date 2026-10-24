'use strict';
/* 第 1 课 · 一个被等了 66 年的想法（纪录片版）· 公用工具 + 序 ~ 第五幕 */
const L1X = (() => {
  const C = K.c;
  const SG = (t, a, b) => E.o3(seg(t, a, b));
  /* 第 k 句的第 i 个画面节拍（共 n 个）开始的时刻 */
  const BT = (F, k, i, n) => i <= 0 ? F.cue(k) - .15 : F.cue(k) + (F.end(k) - F.cue(k)) * i / n;
  const CR = {
    A01: '佚名 · CC BY-SA 4.0', A02: '美国海军档案 330-PSA-80-60 · 公有领域', A03: 'Mark I 操作手册 1960 · 公有领域', A04: '罗森布拉特 1961 年报告 · 公有领域',
    A05: 'NASA 1957 · 公有领域', A06: 'NASA 兰利研究中心 · 公有领域', A07: 'Joi Ito · CC BY 2.0 · 摄于 2012', A08: 'Matematicamente.it · CC BY-SA 3.0',
    A09: '今日校舍 · Bxsstudent · 公有领域', A10: '摄于 2009 · Jeff Weese · CC BY 2.0', A11: 'Daniel J. Graham · CC BY-SA 3.0', A12: '摄于 1991 · Rolf Kickuth · CC BY-SA 4.0',
    A13: '博物馆藏品 · Joe Mabel · CC BY-SA 3.0', A14: '摄于 2017 · ITU Pictures · CC BY 2.0', A15: 'Fritzchens Fritz · CC0', A16: 'J. 拉克尼茨 1789 · 公有领域',
    A17: '摄于 2022 · Dietmar Rabich · CC BY-SA 4.0', A18: '摄于 2013 · Austin McKinley · CC BY 3.0', A19: 'dvgodoy · CC BY 4.0', A20: '2024 诺贝尔周 · Arthur Petron · CC BY-SA 4.0',
    A21: '2024 诺贝尔讲座 · Jay Dixit · CC BY-SA 4.0', A22: '摄于 2024 · Arthur Petron · CC BY-SA 4.0', A23: '1907 年版画 · 公有领域', A24: '公有领域',
    A25: '摄于 2021 · Numenta · CC BY 3.0', A26: '公有领域', A33: '摄于 2014 · Steve Jurvetson · CC BY 2.0', A35: 'Gwern · 公有领域',
    A36: '摄于 2018 · Jérémy Barande · CC BY-SA 2.0', A37: '摄于 2014 · Petar Milošević · CC BY-SA 4.0', A38: '今日 · GoginkLobabi · CC BY-SA 4.0', A39: '今日 · Dmitry Tonkonog · CC BY-SA 3.0',
    A40: '今日 · Chrysi Chrysochou · CC BY-SA 3.0', A41: 'Smallbones · CC0', A42: '今日 · DestinationFearFan · CC BY-SA 4.0', A43: '摄于 2025 · Gabriel Hutchinson · CC BY-SA 4.0',
    A44: '摄于 2022 · Blake Everett Carroll · CC BY-SA 4.0',
  };
  ['A27', 'A28', 'A29', 'A30', 'A31', 'A32', 'A34'].forEach(k => CR[k] = 'Unsplash · CC0');
  const full = S => ({ x: 0, y: 0, w: S.W, h: S.H });
  /* 主图：默认放在版面的 main 区 */
  function photo(S, a, id, p, o = {}) {
    const G = LAY(S), R = o.R || G.main;
    return PH(S, o.x || S.mid, id, R, Object.assign({ a, p, frame: o.frame ?? SG(p * 8, 0, 1), cred: o.cred === false ? '' : (o.cred || CR[id]) }, o));
  }
  /* 人物照片的指引线：只连到相框边上，绝不点在人脸上（尊重画面里的人） */
  function edge(m, L) {
    const R = m.R, cx = R.x + R.w / 2, cy = R.y + R.h / 2, [lx, ly] = L;
    const dx = lx < R.x ? R.x - lx : lx > R.x + R.w ? lx - R.x - R.w : 0, dy = ly < R.y ? R.y - ly : ly > R.y + R.h ? ly - R.y - R.h : 0;
    if (dx > 0 && dx >= dy) return [lx > cx ? R.x + R.w : R.x, clamp(ly, R.y + R.h * .1, R.y + R.h * .9)];
    return [clamp(lx, R.x + R.w * .12, R.x + R.w * .88), ly > cy ? R.y + R.h : R.y];
  }
  function pco(S, x, m, L, p, title, sub, o) { return m && m.R ? CO(S, x, edge(m, L), L, p, title, sub, o) : null; }
  /* 全屏照片（纪录片式空镜） */
  function fullPhoto(S, a, id, p, o = {}) { return PH(S, S.mid, id, full(S), Object.assign({ a, p, r: 0, vig: .7, credY: S.H * (S.P ? .8 : .78), cred: o.cred === false ? '' : (o.cred || CR[id]) }, o)); }
  /* 闪光（相机闪光灯） */
  function flash(S, t, t0, a = .8) { if (t < t0 || t > t0 + .6) return; const q = Math.exp(-(t - t0) * 9) * a; const x = S.hud; x.save(); x.fillStyle = col('#ffffff', q); x.fillRect(0, 0, S.W, S.H); x.restore(); }
  /* 侧栏里第 i 个标签的位置 */
  function sideB(S, i, n = 3, o = {}) {
    const G = LAY(S), s = G.side;
    if (!G.P) return [s.x + (o.dx || 0), s.y + s.h * (n === 1 ? .3 : .12 + i * (.76 / Math.max(1, n - 1)) * (o.sp ?? 1))];
    const cols = o.cols ?? 1; return [s.x + (cols > 1 ? (i % cols) * s.w / cols : 0) + (o.dx || 0), s.y + S.v * 3.2 + Math.floor(i / cols) * S.v * 8.2];
  }
  /* 20×20 字母点阵（读一次离屏画布） */
  const _sh = {};
  function letter(ch) {
    if (_sh[ch]) return _sh[ch]; const n = 20, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.font = '900 19px "AI8Sans","PingFang SC",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, n / 2, n / 2 + 1);
    const d = x.getImageData(0, 0, n, n).data, m = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) m[j * n + i] = d[(j * n + i) * 4 + 3] > 110 ? 1 : 0;
    return (_sh[ch] = (i, j) => m[j * n + i] || 0);
  }
  /* 时间轴：years [[年, 标签, 颜色]]，p 画到哪，o.y0/o.y1 范围 */
  function timeline(S, x, X1, X2, Y, years, p, o = {}) {
    const v = S.v, a = o.a ?? 1, y0 = o.y0 ?? 1958, y1 = o.y1 ?? 2024, X = yy => lerp(X1, X2, (yy - y0) / (y1 - y0)), xe = lerp(X1, X2, clamp(p));
    if (a <= 0) return X;
    x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .22); x.lineWidth = 1; x.setLineDash([2, 5]); x.beginPath(); x.moveTo(X1, Y); x.lineTo(X2, Y); x.stroke(); x.setLineDash([]);
    const g = x.createLinearGradient(X1, 0, X2, 0); g.addColorStop(0, col(o.c0 || C.pri, .95)); g.addColorStop(1, col(o.c1 || C.acc, .95));
    x.strokeStyle = g; x.lineWidth = v * .3; x.beginPath(); x.moveTo(X1, Y); x.lineTo(xe, Y); x.stroke(); x.restore();
    const gl = S.glow; gl.save(); gl.globalAlpha = a; gl.strokeStyle = col(C.pri, .8); gl.lineWidth = 4; gl.beginPath(); gl.moveTo(X1, Y); gl.lineTo(xe, Y); gl.stroke(); gl.restore();
    years.forEach(([yy, lab, c], i) => {
      const xx = X(yy), on = xe >= xx - 1; if (!on && !o.ghost) return; const end = i === 0 || i === years.length - 1;
      H.node(S, xx, Y, v * (end ? 1.05 : .7), { lit: on ? 1 : .1, c: c || C.pri, a: a * (on ? 1 : .35) });
      const up = o.alt ? i % 2 === 1 : false, al = i === 0 ? 'left' : i === years.length - 1 ? 'right' : 'center', ox = i === 0 ? -v * .6 : i === years.length - 1 ? v * .6 : 0;
      const fy = fsz(v * (end ? 1.5 : 1.25)), fl = fsz(v * (S.P ? 1.3 : 1.5)), d1 = Math.max(v * 2.6, v * 1.2 + fy * .5), d2 = Math.max(up ? v * 5 : v * 5.1, d1 + fy * .5 + fl * .5 + 1.5);   /* 矮屏上字被放大，年份和标签按字号拉开 */
      T(x, String(yy), xx + ox, Y + (up ? -d1 : d1), { f: 'mono', size: v * (end ? 1.5 : 1.25), w: 500, c: end ? C.ink : C.mute, al, a: a * (on ? 1 : .4) });
      if (lab && on) T(x, lab, xx + ox, Y + (up ? -d2 : d2), { f: 'sans', size: v * (S.P ? 1.3 : 1.5), w: 500, c: c === C.acc ? C.accHi : C.priHi, al, a });
    });
    return X;
  }
  /* 夜窗（旅馆窗户剪影） */
  function nightWindow(S, x, R, a, t) {
    if (a <= 0) return; const v = S.v;
    x.save(); x.globalAlpha = a; const g = x.createLinearGradient(0, R.y, 0, R.y + R.h); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#130a26'); x.fillStyle = g; x.fillRect(R.x, R.y, R.w, R.h);
    const r = rng(9); for (let i = 0; i < 14; i++) { const bx = R.x + r() * R.w, by = R.y + R.h * (.45 + r() * .5), br = v * (1.2 + r() * 3.5), c = r() < .5 ? C.acc : (r() < .5 ? C.pri : C.gold); haze(x, bx, by, br, c, (.12 + .1 * Math.sin(t * 1.3 + i)) * a); }
    x.fillStyle = 'rgba(2,3,8,.92)'; const bw = Math.max(3, v * .9); x.fillRect(R.x + R.w / 2 - bw / 2, R.y, bw, R.h); x.fillRect(R.x, R.y + R.h * .45 - bw / 2, R.w, bw);
    x.lineWidth = v * 1.4; x.strokeStyle = 'rgba(2,3,8,.95)'; x.strokeRect(R.x, R.y, R.w, R.h);
    x.restore();
  }
  /* 床头手机 */
  function phone(S, x, cx, cy, h, lit, t, a) {
    if (a <= 0) return; const v = S.v, w = h * .5;
    x.save(); x.globalAlpha = a; rrect(x, cx - w / 2, cy - h / 2, w, h, w * .18); x.fillStyle = '#05070d'; x.fill(); x.strokeStyle = col(C.pri, .35 + .5 * lit); x.lineWidth = 1.2; x.stroke();
    if (lit > 0) { rrect(x, cx - w / 2 + v * .4, cy - h / 2 + v * .9, w - v * .8, h - v * 1.8, w * .12); const g = x.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); g.addColorStop(0, col('#1b3a6b', lit)); g.addColorStop(1, col('#4a1d5c', lit)); x.fillStyle = g; x.fill(); }
    x.restore();
    if (lit > 0) {
      T(x, '+46', cx, cy - h * .14, { f: 'mono', size: w * .2, w: 500, c: C.ink, al: 'center', a: a * lit });
      T(x, '瑞典', cx, cy + h * .1, { f: 'sans', size: w * .2, w: 700, c: C.ink, al: 'center', a: a * lit });
      H.rings(S, cx, cy, h * .4, h * 1.1, t, { n: 3, a: a * lit * .8, speed: 1.2, c: C.pri });
      haze(S.glow, cx, cy, h * .8, C.pri, .5 * lit * a);
    }
  }
  /* 声波条 */
  function wave(S, x, X, Y, w, h, t, a, amp = 1) {
    if (a <= 0) return; const n = 48, bw = w / n * .55;
    x.save(); x.globalAlpha = a;
    for (let i = 0; i < n; i++) { const q = i / (n - 1), env = Math.sin(Math.PI * q), hh = h * (.08 + .92 * env * amp * Math.abs(Math.sin(t * 7 + i * .7) * Math.sin(t * 3.1 + i * .23))); x.fillStyle = col(i % 9 === 0 ? C.acc : C.pri, .85); x.fillRect(X + q * w - bw / 2, Y - hh / 2, bw, hh); }
    x.restore();
  }
  /* 日历翻页 */
  function calendar(S, x, cx, cy, s, day, a, o = {}) {
    if (a <= 0) return; const v = S.v, w = s, h = s * 1.1;
    x.save(); x.globalAlpha = a; rrect(x, cx - w / 2, cy - h / 2, w, h, v * .5); x.fillStyle = 'rgba(6,14,30,.85)'; x.fill(); x.strokeStyle = col(C.pri, .5); x.lineWidth = 1; x.stroke();
    x.fillStyle = col(o.hot ? C.acc : C.pri, .25); x.fillRect(cx - w / 2, cy - h / 2, w, h * .24); x.restore();
    T(x, o.top || 'JULY 1958', cx, cy - h / 2 + h * .12, { f: 'mono', size: v * 1.15, w: 500, c: C.ink, al: 'center', tr: .12, a });
    T(x, String(day), cx, cy + h * .1, { f: 'interd', size: s * .46, w: 900, c: o.hot ? C.accHi : C.ink, al: 'center', a, sh: { c: o.hot ? C.acc : C.pri, a: .5 } });
    if (o.sub) T(x, o.sub, cx, cy + h / 2 - h * .1, { f: 'sans', size: v * 1.25, w: 500, c: o.hot ? C.accHi : C.mute, al: 'center', a });
  }
  /* 神经元（生物） */
  function neuron(S, x, cx, cy, s, t, a, sig = 1) {
    if (a <= 0) return; const v = S.v, r = rng(17);
    x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .75); x.lineCap = 'round';
    for (let i = 0; i < 7; i++) {             // 树突
      const ang = Math.PI * (.62 + i * .11), L = s * (.55 + r() * .35), ex = cx + Math.cos(ang) * L, ey = cy - Math.sin(ang) * L * .9;
      x.lineWidth = v * .28; x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + Math.cos(ang) * L * .5 + v * (r() - .5) * 3, cy - Math.sin(ang) * L * .45, ex, ey); x.stroke();
      for (let j = 0; j < 2; j++) { const a2 = ang + (r() - .5) * 1.2, l2 = L * .35; x.lineWidth = v * .16; x.beginPath(); x.moveTo(ex, ey); x.lineTo(ex + Math.cos(a2) * l2, ey - Math.sin(a2) * l2); x.stroke(); }
    }
    const ax = cx + s * 1.9; x.lineWidth = v * .34; x.beginPath(); x.moveTo(cx, cy); x.bezierCurveTo(cx + s * .6, cy + s * .2, cx + s * 1.2, cy - s * .2, ax, cy); x.stroke();
    for (let i = 0; i < 4; i++) { const q = .3 + i * .17, px = lerp(cx, ax, q), py = cy + Math.sin(q * 6) * s * .04; rrect(x, px - s * .07, py - s * .055, s * .14, s * .11, s * .05); x.fillStyle = col(C.pri, .35); x.fill(); }
    for (let i = 0; i < 4; i++) { const a2 = -.6 + i * .4; x.lineWidth = v * .16; x.beginPath(); x.moveTo(ax, cy); x.lineTo(ax + Math.cos(a2) * s * .28, cy + Math.sin(a2) * s * .28); x.stroke(); }
    x.restore();
    H.node(S, cx, cy, s * .2, { lit: .7 + .3 * Math.sin(t * 3), a });
    if (sig > 0) { const q = (t * .55) % 1, px = lerp(cx, ax, q); haze(S.glow, px, cy, v * 3, C.priHi, .9 * a * sig); x.save(); x.globalAlpha = a * sig; x.fillStyle = col(C.priHi, 1); x.beginPath(); x.arc(px, cy + Math.sin(q * 6) * s * .04, v * .55, 0, TAU); x.fill(); x.restore(); }
  }
  /* 感知机示意：三路输入 × 权重 → Σ → 门槛 → 灯；st: {wts, sum, lit, err} */
  function perceptron(S, x, R, st, a, t) {
    if (a <= 0) return; const v = S.v;
    const ins = [.18, .5, .82].map(f => [R.x + R.w * .1, R.y + R.h * f]), sg = [R.x + R.w * .52, R.y + R.h * .5], out = [R.x + R.w * .9, R.y + R.h * .5];
    ins.forEach(([px, py], i) => {
      const w = st.wts[i];
      H.link(S, px, py, sg[0], sg[1], { w: v * .22 * Math.abs(w) * 1.6 + .8, a: a * (st.show ?? 1), p: st.lp ?? 1, flow: st.flow ? .7 : 0, n: 3, dot: v * .3, c: w < 0 ? C.acc : C.pri });
      H.node(S, px, py, v * 1.9, { lit: st.x ? st.x[i] : .6, a });
      T(x, ['天晴', '有人约', '有钱'][i], px - v * 2.6, py, { f: 'sans', size: v * 1.5, w: 500, c: C.mute, al: 'right', a });
      if (st.wa > 0) { const mx = lerp(px, sg[0], .5), my = lerp(py, sg[1], .5) - v * 1.5; H.chip(S, x, '×' + w.toFixed(1), mx, my, { size: v * 1.35, f: 'mono', a: a * st.wa, al: 'center', hot: !!st.hot }); }
    });
    H.link(S, sg[0], sg[1], out[0] - v * 2.4, out[1], { w: 2, a, p: st.lp ?? 1, flow: st.lit > .5 ? .8 : 0, n: 2 });
    H.node(S, sg[0], sg[1], v * 3, { lit: .4 + .6 * clamp(st.sum ?? 0), c: C.sec, a });
    T(x, 'Σ', sg[0], sg[1] + v * .1, { f: 'interd', size: v * 2.8, w: 700, c: C.ink, al: 'center', a });
    if (st.sa > 0) T(x, (st.sumv ?? 0).toFixed(2), sg[0], sg[1] + v * 4.8, { f: 'mono', size: v * 1.4, w: 500, c: C.priHi, al: 'center', a: a * st.sa });
    if (st.ta > 0) { T(x, '门槛 0.5', sg[0], sg[1] - v * 4.6, { f: 'sans', size: v * 1.3, w: 500, c: C.gold, al: 'center', a: a * st.ta }); }
    const lit = clamp(st.lit ?? 0);                         // 灯泡
    x.save(); x.globalAlpha = a; x.beginPath(); x.arc(out[0], out[1] - v * .6, v * 2.2, 0, TAU); x.fillStyle = col(mix('#0b1424', '#ffd98a', lit), 1); x.fill(); x.strokeStyle = col(C.gold, .4 + .6 * lit); x.lineWidth = 1.4; x.stroke();
    x.fillStyle = col(C.mute, .8); x.fillRect(out[0] - v * 1, out[1] + v * 1.4, v * 2, v * 1.2); x.restore();
    if (lit > 0) haze(S.glow, out[0], out[1] - v * .6, v * 7, C.gold, lit * a);
    if (st.err > 0) { T(x, '✗', out[0], out[1] - v * 5.2, { f: 'sans', size: v * 3, w: 900, c: C.red, al: 'center', a: a * st.err, sh: { c: C.red, a: .6 } }); }
    if (st.ok > 0) { T(x, '✓', out[0], out[1] - v * 5.2, { f: 'sans', size: v * 3, w: 900, c: C.ok, al: 'center', a: a * st.ok, sh: { c: C.ok, a: .6 } }); }
    return { ins, sg, out };
  }
  /* XOR 坐标：line {ang, off}，curve: 用两条线围出的区域 */
  function xorPlot(S, x, R, o, a) {
    if (a <= 0) return; const v = S.v, P = [[0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1]];
    const m = v * 3.2, X = u => R.x + m + u * (R.w - 2 * m), Y = w => R.y + R.h - m - w * (R.h - 2 * m);
    x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(4,12,26,.6)'; x.fillRect(R.x, R.y, R.w, R.h); x.strokeStyle = col(C.mute, .4); x.lineWidth = 1; x.strokeRect(R.x, R.y, R.w, R.h); x.restore();
    if (o.region > 0) {                                      // 多层网络：斜带区域
      x.save(); x.globalAlpha = a * o.region * .5; x.beginPath(); x.moveTo(X(-.1), Y(.4)); x.lineTo(X(.6), Y(1.1)); x.lineTo(X(1.1), Y(1.1)); x.lineTo(X(1.1), Y(.6)); x.lineTo(X(.4), Y(-.1)); x.lineTo(X(-.1), Y(-.1)); x.closePath();
      x.fillStyle = col(C.acc, .0); x.fill(); x.restore();
      for (const off of [.5, -.5]) { x.save(); x.beginPath(); x.rect(R.x, R.y, R.w, R.h); x.clip(); x.globalAlpha = a * o.region; x.strokeStyle = col(C.ok, .95); x.lineWidth = v * .3; x.beginPath(); x.moveTo(X(-.05), Y(-.05 + off + .02)); x.lineTo(X(1.05), Y(1.05 + off + .02)); x.stroke(); x.restore(); }
      x.save(); x.beginPath(); x.rect(R.x, R.y, R.w, R.h); x.clip(); x.globalAlpha = a * o.region * .16; x.fillStyle = col(C.ok, 1); x.beginPath(); x.moveTo(X(-.05), Y(.47)); x.lineTo(X(.53), Y(1.05)); x.lineTo(X(1.05), Y(1.05)); x.lineTo(X(1.05), Y(.55)); x.lineTo(X(.47), Y(-.05)); x.lineTo(X(-.05), Y(-.05)); x.closePath(); x.fill(); x.restore();
    }
    P.forEach(([u, w, c], i) => {
      const bad = o.bad ? o.bad.includes(i) : false, cc = c ? C.acc : C.pri;
      H.node(S, X(u), Y(w), v * 1.5, { lit: 1, c: bad ? C.red : cc, a });
      T(x, `(${u},${w})`, X(u), Y(w) + v * 3, { f: 'mono', size: v * 1.15, w: 500, c: C.mute, al: 'center', a });
    });
    if (o.line) {
      const { ang, off } = o.line, cx = X(.5) + off * v * 6, cy = Y(.5), L = R.w; x.save(); x.globalAlpha = a * (o.la ?? 1); x.strokeStyle = col(C.gold, .95); x.lineWidth = v * .3; x.beginPath(); x.moveTo(cx - Math.cos(ang) * L, cy - Math.sin(ang) * L); x.lineTo(cx + Math.cos(ang) * L, cy + Math.sin(ang) * L);
      x.save(); x.beginPath(); x.rect(R.x, R.y, R.w, R.h); x.clip(); x.beginPath(); x.moveTo(cx - Math.cos(ang) * L, cy - Math.sin(ang) * L); x.lineTo(cx + Math.cos(ang) * L, cy + Math.sin(ang) * L); x.stroke(); x.restore(); x.restore();
    }
  }
  /* 多层网络：前向 / 反向脉冲 */
  function mlp(S, x, R, fwd, back, a, t, o = {}) {
    if (a <= 0) return []; const v = S.v, L = o.layers || [3, 4, 2], cols = L.length, pts = L.map((n, i) => Array.from({ length: n }, (_, j) => [R.x + R.w * (.1 + .8 * i / (cols - 1)), R.y + R.h * ((j + 1) / (n + 1))]));
    for (let i = 0; i < cols - 1; i++) for (const p1 of pts[i]) for (const p2 of pts[i + 1]) {
      x.save(); x.globalAlpha = a * .5; x.strokeStyle = col(C.pri, .55); x.lineWidth = 1; x.beginPath(); x.moveTo(p1[0], p1[1]); x.lineTo(p2[0], p2[1]); x.stroke(); x.restore();
      const qf = clamp(fwd * (cols - 1) - i); if (qf > 0 && qf < 1) { const px = lerp(p1[0], p2[0], qf), py = lerp(p1[1], p2[1], qf); x.save(); x.globalAlpha = a; x.fillStyle = col(C.priHi, 1); x.beginPath(); x.arc(px, py, v * .38, 0, TAU); x.fill(); x.restore(); haze(S.glow, px, py, v * 1.6, C.pri, a * .8); }
      const qb = clamp(back * (cols - 1) - (cols - 2 - i)); if (qb > 0 && qb < 1) { const px = lerp(p2[0], p1[0], qb), py = lerp(p2[1], p1[1], qb); x.save(); x.globalAlpha = a; x.fillStyle = col(C.red, 1); x.beginPath(); x.arc(px, py, v * .42, 0, TAU); x.fill(); x.restore(); haze(S.glow, px, py, v * 1.8, C.red, a * .9); }
    }
    pts.forEach((col_, i) => col_.forEach(([px, py]) => H.node(S, px, py, v * 1.35, { lit: .5 + .5 * clamp(fwd * (cols - 1) - i + 1), c: back > 0 && back < 1 && clamp(back * (cols - 1) - (cols - 1 - i)) > 0 ? C.red : C.pri, a })));
    return pts;
  }
  /* ---- 动效小工具（ai8-motion）：弹出、砸入、镜头冲击 ---- */
  /* 以 (cx, cy) 为轴心弹出：从 from 倍弹到 1（t0 之前停在 from） */
  function pop(S, x, t, t0, cx, cy, fn, preset = 'pop', from = .6) { const k = MO.sp(t, t0, preset); return MO.tf(S, x, { x: cx, y: cy, sx: lerp(from, 1, k), sy: lerp(from, 1, k) }, fn); }
  /* 大字砸入：从 from 倍砸到 1，快的那一下带拖影；fn(w) 里 w 是拖影的透明度系数 */
  function slam(S, x, t, t0, cx, cy, fn, from = 2.4) {
    const one = (tt, w) => { const q = MO.slam(tt, t0, from); MO.tf(S, x, { x: cx, y: cy, sx: q.s, sy: q.s }, () => fn(w * q.a)); };
    if (t > t0 && MO.slam(t, t0, from).k < .96 && t < t0 + .15) MO.smear(t, 2, .014, one); else one(t, 1);
  }
  /* 镜头：pu = [[时刻, 推镜量]]，sh = [[时刻, 幅度(×v), 衰减, 种子]] */
  function cam(t, S, pu, sh = [], z0 = 0) {
    let z = 1 + z0, cx = 0, cy = 0; for (const [t0, amt] of pu) z += MO.punch(t, t0, amt);
    for (const [t0, amp, dc, sd] of sh) { const [a1, b1] = MO.shake(t, t0, S.v * amp, dc ?? .15, sd ?? 3); cx += a1; cy += b1; }
    return { z, x: cx, y: cy };
  }
  return { C, SG, BT, CR, full, photo, fullPhoto, edge, pco, flash, sideB, letter, timeline, nightWindow, phone, wave, calendar, neuron, perceptron, xorPlot, mlp, pop, slam, cam };
})();

const L1S = [];
/* ===== 序 · 凌晨两点的电话 ===== */
/* 第 1 课 · 序 · 凌晨两点的电话 —— 动效手感版（第 0 幕，画面元素、配色、位置与原版一致）
   改了什么（全部卡在你的旁白上）：
   · 夜窗像百叶窗一样弹开；“02:00” 四个数字逐个落下、落地压扁
   · 说到“吵醒”：手机连跳三下（挤压拉伸），镜头往前一顶
   · “76 岁”标签弹出
   · 说到“诺贝尔”：硬切 + 推镜冲击 + 轻闪 + 镜头震动；版画从下方弹入，声波整排弹起
   · 问号从天而降，落地压扁再晃几下；引语卡弹入
   · 说到“他叫杰弗里·辛顿”：甩镜，两个镜头同时横向滑过，带运动拖影
   · 年份 2024→1958 带滚动拖影，停住时一顶；说到“66 年”：“66 YEARS”砸进来，镜头一震
   · 片名逐字落下、落地压扁；“AI 八堂课 · 第 1 课”字距收拢落位 */
L1S.push({
  tin: { type: 'fade' }, tdur: .7, mood: 'cold', lead: .9, gap: .4, tail: 1.0,
  /* 关键时刻都从旁白算出来（同一套 DURS，跟原版一样） */
  keys(F) {
    if (this._k && this._k.F === F) return this._k;
    return (this._k = {
      F, tp: F.kw(0, '吵醒') - .2, t76: F.kw(0, '76'), tN: F.kw(1, '诺贝尔') - .35, tPh: F.kw(1, '物理'), tq: F.cue(2) - .1,
      tPr: F.kw(2, '恶作剧'), tH: F.cue(3) - .2, tr: F.kw(3, '诞生'), t66: F.kw(3, '66'), t4: F.cue(4) - .2,
    });
  },
  /* 音效：时间由旁白决定，第一次画这一幕时算好 */
  get sfx() {
    const K = this._k; if (!K) return [[.55, 'tick']];
    return (this._sfx = this._sfx || [[.55, 'tick'], [K.tp - .05, 'phone', .5, 1.8], [K.tN - .03, 'impact'], [K.tq + .26, 'tick'], [K.tH - .12, 'whoosh'], [K.t66 - .05, 'impact'], [K.t4 + .45, 'tick']]);
  },
  camera(t, S, F) {
    const K = this.keys(F), v = S.v;
    const z = 1 + .012 * E.ioS(clamp(t / F.dur)) + MO.punch(t, K.tp, .03) + MO.punch(t, K.tN, .07) + MO.punch(t, K.tH + .1, .035) + MO.punch(t, K.t66 - .04, .05);
    const [a1, b1] = MO.shake(t, K.tN, v * .45, .14, 3), [a2, b2] = MO.shake(t, K.t66 - .04, v * .6, .16, 9);
    return { z, x: a1 + a2, y: b1 + b2 };
  },
  draw(t, S, F) {
    const X = L1X, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid; H.bg(S, t, { cold: .7, neb: .5 });
    const K = this.keys(F);
    /* 时间地点戳：解码照旧，整块从画面边缘弹进来 */
    const ks = MO.sp(t, .3, 'bouncy');
    MO.tf(S, S.hud, { dx: (1 - ks) * v * 9 * (G.stamp.al === 'right' ? 1 : -1) }, () => STAMP(S, t, .3, '2024.10.08 · 02:00 AM', '美国 · 加州', { a: 1 - X.SG(t, K.tH - .4, K.tH) }));

    /* ---------- 镜头 1：凌晨两点 ---------- */
    const shotA = (a) => {
      const R = P ? { x: W * .2, y: h * .22, w: W * .6, h: h * .3 } : { x: W * .55, y: h * .2, w: W * .36, h: h * .58 };
      const wk = MO.sp(t, .12, 'gentle');                                     // 夜窗：百叶窗一样纵向弹开
      if (wk > .002) MO.tf(S, x, { x: R.x + R.w / 2, y: R.y + R.h / 2, sy: wk }, () => {
        X.nightWindow(S, x, R, a * clamp(wk * 1.4), t);
        x.save(); x.beginPath(); x.rect(R.x, R.y, R.w, R.h); x.clip(); ST.neon(S, x, 'MOTEL', R.x + R.w * .7, R.y + R.h * .16, R.w * .085, t, a * clamp(wk * 1.4) * X.SG(t, .7, 1.3)); x.restore();   // 窗外：廉价汽车旅馆的霓虹招牌
      });
      /* 情景再现：床上的剪影被电话吵醒，猛地坐起、开灯、把手机贴到耳边 */
      const rm = a * clamp(wk * 1.4 - .25), wake = Math.min(1.05, E.oB(seg(t, K.tp + .12, K.tp + .62), 1.2)), ear = E.io3(seg(t, K.tp + .64, K.tp + 1.15));
      const lampOn = t < K.tp + .42 ? 0 : t < K.tp + .52 ? (MO.noise(t * 60, 4) > -.1 ? 1 : .25) : 1;
      ST.motel(S, x, R, t, { wake, ear, lamp: lampOn, ring: X.SG(t, K.tp, K.tp + .2) }, rm);
      ST.tag(S, R.x + v * .8, R.y + v * 2.2, rm * X.SG(t, 1, 1.6));
      const big = P ? v * 7 : v * 11, cx = P ? W / 2 : W * .27, cy = P ? h * .62 : h * .42;
      const clk = t < 1.6 || Math.floor(t * 2) % 2 ? '02:00' : '02 00';      // 冒号落定后开始闪
      MO.dropText(S, S.hud, clk, cx, cy, t, .55, { f: 'mono', size: big, w: 500, c: C.priHi, al: 'center', a, sh: { c: C.pri, a: .7 } }, .07);
      const lit = X.SG(t, K.tp, K.tp + .2), px = P ? W * .5 : W * .27, py0 = P ? h * .74 : h * .66, ph = v * (P ? 10 : 9);
      const pk = MO.sp(t, 1.0, 'bouncy');                                     // 手机从下方弹上来
      let hop = 0, sx = 1, sy = 1;
      for (let k = 0; k < 3; k++) {                                           // 来电：连跳三下，一下比一下低
        const t0 = K.tp + k * .4, s = seg(t, t0, t0 + .2);
        if (s > 0 && s < 1) hop += Math.sin(Math.PI * s) * v * (2.4 - k * .7);
        const q = MO.squash(t, t0 + .2, .8 - k * .22); sx *= q.sx; sy *= q.sy;
        if (s > 0 && s < 1) { const st = 1 + .18 * Math.abs(Math.cos(Math.PI * s)); sx /= st; sy *= st; }
      }
      const py = py0 + (1 - pk) * h * .3 - hop;
      if (pk > 0) MO.tf(S, x, { x: px, y: py + ph / 2, sx, sy }, () => X.phone(S, x, px, py, ph, lit, t, a * clamp(pk * 1.5)));
      const k76 = MO.sp(t, K.t76 - .12, 'pop'), tx = P ? W * .5 : W * .27, ty = P ? h * .62 - v * 7.5 : h * .25;
      if (k76 > 0) MO.tf(S, S.hud, { x: tx, y: ty, sx: k76, sy: k76, r: (1 - k76) * .35 }, () => TAG(S, S.hud, '76 岁', tx, ty, a * clamp(k76 * 3), { al: 'center', size: v * 1.6, c: C.gold, f: 'sans', w: 700 }));
    };

    /* ---------- 镜头 2：诺贝尔奖的电话 ---------- */
    const shotB = (a) => {
      const wy = P ? G.top + v * 1.5 : h * .2, wk = MO.sp(t, K.tN, 'bouncy');  // 声波：切镜那一刻整排弹起
      if (wk > .01) MO.tf(S, x, { x: W / 2, y: wy, sy: wk }, () => X.wave(S, x, P ? W * .1 : W * .08, wy, P ? W * .8 : W * .84, v * 4, t, a * (1 - X.SG(t, K.tq, K.tq + .5)), 1));
      const R0 = P ? { x: W * .1, y: h * .27, w: W * .8, h: W * .41 } : { x: W * .14, y: h * .3, w: W * .44, h: W * .225 };
      const pk = MO.sp(t, K.tN + .05, 'bouncy');                              // 版画：从下方弹入，转一点再回正
      if (pk > 0) MO.tf(S, x, { x: R0.x + R0.w / 2, y: R0.y + R0.h / 2, dy: (1 - pk) * h * .45, sx: lerp(.86, 1, pk), sy: lerp(.86, 1, pk), r: (1 - pk) * -.07 },
        () => X.photo(S, a * clamp(pk * 2.5), 'A23', seg(t, K.tN, K.tH + .5), { R: R0, z0: 1, z1: 1.06, scan: seg(t, K.tN + .35, K.tN + 1.6), frame: 1 }));
      const kP = MO.sp(t, K.tPh - .15, 'pop'), gx = P ? W / 2 : W * .36, gy = P ? h * .27 + W * .41 + v * 3 : h * .3 + W * .225 + v * 3;
      if (kP > 0) MO.tf(S, S.hud, { x: gx, y: gy, sx: kP, sy: kP }, () => TAG(S, S.hud, 'THE NOBEL PRIZE IN PHYSICS 2024', gx, gy, a * clamp(kP * 3), { al: 'center', c: C.gold, size: v * 1.3 }));
      if (t > K.tq - .02) {                                                   // 问号：从天而降，落地压扁，再晃几下
        const qx = P ? W * .84 : W * .8, qy = P ? h * .2 : h * .36, qs = v * (P ? 9 : 14), fq = fsz(qs), tl = K.tq + .26;
        const drawQ = (tt, w) => {
          const f = MO.fall(tt, K.tq, qy - h * .55, qy, .26), q = MO.squash(tt, tl, 1.1), st = f.done ? 1 : 1 + .45 * f.v;
          const wob = tt > tl ? .07 * Math.sin((tt - tl) * 20) * Math.exp(-(tt - tl) * 3.5) : 0;
          MO.tf(S, S.hud, { x: qx, y: qy + fq * .45, sx: q.sx / st, sy: q.sy * st, r: wob },
            () => T(S.hud, '?', qx, f.y, { f: 'smiley', size: qs, c: C.acc, al: 'center', a: a * w * clamp((tt - K.tq) / .05), sh: { c: C.acc, a: .7 } }));
        };
        if (t < tl + .02) MO.smear(t, 3, .014, drawQ); else drawQ(t, 1);
        const kQ = MO.sp(t, K.tPr - .45, 'pop');                              // 引语卡：弹入
        if (kQ > 0) {
          const RQ = P ? { x: W * .07, y: h * .55, w: W * .86 } : { x: W * .62, y: h * .48, w: W * .33 };
          MO.tf(S, S.hud, { x: RQ.x + RQ.w / 2, y: RQ.y + v * 4, sx: lerp(.8, 1, kQ), sy: lerp(.8, 1, kQ), dy: (1 - kQ) * v * 3 },
            () => QUOTE(S, S.hud, RQ, '我的第一个念头是：怎么确定这不是{恶作剧电话}？', '辛顿 · 诺贝尔官网电话采访', a * clamp(kQ * 2.5)));
        }
      }
    };

    /* ---------- 镜头 3：辛顿，66 年 ---------- */
    const shotC = (a) => {
      const t4 = K.t4, fo = X.SG(t, t4, t4 + .9);
      const m = X.photo(S, a * (1 - .85 * fo), 'A22', seg(t, K.tH, F.dur), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .4, h: h * .65 }, z0: 1.02, z1: 1.14, f0: [.5, .42], depth: .9 });
      if (m) X.pco(S, x, m, P ? [W * .94, G.main.y + G.main.h + coH(S) * .5 + v * 1.2] : [W * .5, h * .26], X.SG(t, K.tH + .3, K.tH + 1.3) * a * (1 - X.SG(t, t4 - .4, t4)), '杰弗里·辛顿', 'GEOFFREY HINTON · 1947', { side: P ? -1 : 1 });
      const tr = K.tr, t66 = K.t66, rollP = seg(t, tr - .25, t66 - .12), yr = Math.round(lerp(2024, 1958, E.io3(rollP)));
      const yP = Math.max(h * .68, G.main.y + G.main.h + coH(S) + v * 9 + fsz(v * 5) * .5);
      const X1 = lerp(P ? W * .1 : W * .5, W * .14, fo), X2 = lerp(P ? W * .9 : W * .93, W * .86, fo), Yt = lerp(P ? yP : h * .5, P ? h * .62 : h * .66, fo);
      if (t > tr - .4) {
        const ta = X.SG(t, tr - .4, tr) * a;
        X.timeline(S, x, X1, X2, Yt, [[1958, '感知机', C.pri], [2024, '诺贝尔奖', C.acc]], 1, { a: ta });
        const yy = lerp(Yt - v * (P ? 7 : 9), Yt - v * 8, fo), cxT = (X1 + X2) / 2, ys = v * (P ? 5 : 6.5);
        const yearA = ta * (1 - X.SG(t, t66 - .05, t66 + .05));               // 年份：滚动时上下拖影，停在 1958 时一顶
        if (yearA > 0) {
          const speed = rollP > 0 && rollP < 1 ? Math.sin(Math.PI * rollP) : 0, land = MO.punch(t, t66 - .12, .2, 'bouncy');
          const draw = (dy, w) => T(S.hud, String(yr), cxT, yy + dy, { f: 'interd', size: ys, w: 900, c: C.ink, al: 'center', a: yearA * w, sh: { c: C.pri, a: .6 } });
          MO.tf(S, S.hud, { x: cxT, y: yy, sx: 1 + land, sy: 1 + land }, () => { if (speed > .05) { draw(-ys * .5 * speed, .22); draw(ys * .5 * speed, .22); } draw(0, 1); });
        }
        const ca = a * (1 - fo);                                              // 66 YEARS：砸进来，镜头一震
        if (t > t66 - .05 && ca > 0) {
          const [hx, hy] = MO.shake(t, t66 - .05, v * .55, .14, 5);
          const drawS = (tt, w) => {
            const s = MO.slam(tt, t66 - .05, 2.6);
            MO.tf(S, S.hud, { x: cxT, y: yy, sx: s.s, sy: s.s, dx: hx, dy: hy }, () => {
              W3.num(S, S.hud, '66', cxT + v * 1.5, yy, v * (P ? 6 : 8), { al: 'right', a: ca * w * s.a });
              T(S.hud, 'YEARS', cxT + v * 2.5, yy, { f: 'mono', size: v * 1.8, w: 500, c: C.pri, tr: .2, a: ca * w * s.a });
            });
          };
          if (MO.slam(t, t66 - .05).k < .96 && t < t66 + .15) MO.smear(t, 3, .012, drawS); else drawS(t, 1);
        }
      }
      if (t > t4 + .15) {                                                     // 片名：逐字落下、落地压扁
        const sz = v * (P ? 4.6 : 6.4), yy = P ? h * .42 : h * .4, str = '一个被等了 66 年的想法';
        MO.dropText(S, S.hud, str, W / 2, yy, t, t4 + .45, { f: 'smiley', size: fit(S.hud, str, W * .86, { f: 'smiley', size: sz }), c: C.ink, al: 'center', a, sh: { c: C.pri, a: .7 } }, .05);
        const k2 = MO.sp(t, t4 + 1.0, 'gentle');
        if (k2 > 0) T(S.hud, 'AI 八堂课 · 第 1 课', W / 2, yy + v * (P ? 5 : 6.5), { f: 'sans', size: v * 1.8, w: 500, c: C.pri, al: 'center', tr: lerp(.9, .2, clamp(k2)), a: a * .9 * clamp(k2 * 1.6) });
      }
    };

    /* 切镜卡在旁白上：“诺贝尔”硬切；“他叫杰弗里·辛顿”甩镜（两个镜头同时在画面里） */
    const half = .13, wb = Math.sin(Math.PI * seg(t, K.tH - half, K.tH + half));
    MO.blur(S, wb * v * 1.1);
    shots(t, [
      [0, K.tN, shotA],
      [K.tN, K.tH + half, (a) => {
        if (t < K.tH - half) return shotB(a);
        MO.smear(t, 1, .02, (tt, w) => MO.shift(S, -W * MO.whip(tt, K.tH, half), 0, () => shotB(a * w)));
      }],
      [K.tH - half, F.dur, (a) => {
        if (t > K.tH + half) return shotC(a);
        MO.smear(t, 1, .02, (tt, w) => MO.shift(S, W * (1 - MO.whip(tt, K.tH, half)), 0, () => shotC(a * w)));
      }],
    ], .04, .04);
    X.flash(S, t, K.tN, .3);
  },
});

/* ===== 第一幕 · 两个少年 ===== */
/* 动效（重音：布朗克斯 / 明斯基 / 只差一届 / 世纪之争） */
L1S.push({
  tin: { type: 'iris', x: .5, y: .5 }, tdur: .8, mood: 'main', lead: .5, gap: .35, tail: .8,
  keys(F) {
    if (this._k && this._k.F === F) return this._k;
    return (this._k = { F, tB: F.kw(0, '布朗克斯') - .25, t1: L1X.BT(F, 0, 1, 3), tC: F.cue(1) - .2, tM: F.kw(1, '明斯基') - .5, tD: Math.max(F.kw(1, '只差'), F.kw(1, '明斯基') + .1), tK: F.kw(2, '康奈尔') - .4, tI: F.kw(2, '人工智能') - .5, tS: F.cue(3) - .2, tW: F.kw(3, '世纪') - .3 });
  },
  get sfx() { const K = this._k; return K ? (K.sx = K.sx || [[K.tB, 'tick'], [K.t1 - .08, 'whoosh', .5], [K.tC + .05, 'blip', .55], [K.tM, 'blip', .55], [K.tD, 'tick', .7], [K.tK, 'tick', .55], [K.tI, 'tick', .55], [K.tS, 'whoosh', .45], [K.tW, 'impact', .75]]) : []; },
  camera(t, S, F) { const K = this.keys(F); return L1X.cam(t, S, [[K.t1, .03], [K.tS + .1, .025], [K.tW, .05]], [[K.tW, .5, .15, 4]]); },
  draw(t, S, F) {
    const X = L1X, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, K = this.keys(F); H.bg(S, t, {});
    STAMP(S, t, .2, '1940s · NEW YORK', '纽约 · 布朗克斯');
    const t1 = X.BT(F, 0, 1, 3), tC = F.cue(1) - .2, tS = F.cue(3) - .2;
    shots(t, [
      [0, t1, (a) => {
        const cx = P ? W / 2 : W * .5, cy = P ? h * .45 : h * .48, R0 = v * (P ? 9 : 12);
        H.rings(S, cx, cy, R0 * .3, R0 * 2.2, t, { n: 4, a: a * .8, speed: .7 });
        for (let i = 0; i < 3; i++) { x.save(); x.globalAlpha = a * .6; x.strokeStyle = col(C.pri, .5); x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, R0 * (.5 + i * .5), 0, TAU); x.stroke(); x.restore(); }
        x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .6); x.beginPath(); x.moveTo(cx - R0 * 2, cy); x.lineTo(cx + R0 * 2, cy); x.moveTo(cx, cy - R0 * 2); x.lineTo(cx, cy + R0 * 2); x.stroke(); x.restore();
        H.node(S, cx, cy, v * 1.2, { lit: 1, c: C.acc, a });
        T(S.hud, decode('40.878°N  73.891°W', seg(t, .3, 1.4), 3), cx, cy + R0 * 1.4, { f: 'mono', size: v * 1.5, w: 500, c: C.pri, al: 'center', tr: .1, a });
        X.pop(S, S.hud, t, K.tB, cx, cy - R0 * 1.4, () => T(S.hud, '布朗克斯科学高中', cx, cy - R0 * 1.4, { f: 'sans', size: v * 2.6, w: 700, c: C.ink, al: 'center', a: a * X.SG(t, K.tB, K.tB + .2), sh: { c: C.pri, a: .4 } }));
      }],
      [t1, tC, (a) => {
        const m = X.photo(S, a, 'A09', seg(t, t1, tC + .5), { R: P ? G.main : G.wide, z0: 1.04, z1: 1.14, f0: [.4, .5], f1: [.62, .5] });
        if (m) CO(S, x, m.map(.72, .6), P ? [W * .1, G.main.y + G.main.h + coH(S) * .5 + v * 1.2] : [W * .62, h * .3], X.SG(t, t1 + .4, t1 + 1.3) * a, '布朗克斯科学高中', 'BRONX HIGH SCHOOL OF SCIENCE · 今日校舍', { side: P ? 1 : 1 });
      }],
      [tC, F.dur, (a) => {
        const sep = X.SG(t, tS, tS + .9), k2 = F.cue(2) - .2, shr = P ? X.SG(t, tC, tC + .7) : 0;   /* 竖屏：卡片一开始就收窄，给下面走路的两个少年留出地方 */
        const cw = P ? W * .86 : W * .41, chh = P ? h * lerp(.2, .15, shr) : h * .28;
        const R1 = P ? { x: W * .07, y: h * .2, w: cw, h: chh } : { x: lerp(W * .065, W * .02, sep), y: h * .24, w: cw, h: chh };
        const R2 = P ? { x: W * .07, y: h * .2 + chh + v * 9, w: cw, h: chh } : { x: lerp(W * .525, W * .57, sep), y: h * .24, w: cw, h: chh };
        const l1 = t > k2 ? ['康奈尔 · 学士 1950 · 博士 1956', '心理学家'] : ['1928 年生 · 1946 届'], l2 = t > k2 ? ['MIT · 1956 年达特茅斯会议发起人之一', '人工智能奠基人'] : ['1927 年生'];
        const pa = X.SG(t, tC, tC + .7) * a, pb = X.SG(t, F.kw(1, '明斯基') - .5, F.kw(1, '明斯基') + .2) * a;
        X.pop(S, x, t, K.tC, R1.x + R1.w / 2, R1.y + R1.h / 2, () => IDC(S, x, R1, { img: 'A01', name: '弗兰克·罗森布拉特', en: 'FRANK ROSENBLATT', lines: l1, f: [.5, .35] }, pa * (1 - sep * .4)), 'bouncy', .88);
        X.pop(S, x, t, K.tM, R2.x + R2.w / 2, R2.y + R2.h / 2, () => IDC(S, x, R2, { img: 'A07', name: '马文·明斯基', en: 'MARVIN MINSKY', lines: l2, f: [.6, .4], c: C.acc }, pb * (1 - sep * .4)), 'bouncy', .88);
        if (pb > 0) TAG(S, S.hud, '照片摄于 2012', R2.x + R2.w - v, R2.y + R2.h + v * 1.8, pb, { al: 'right', size: v * 1, c: C.mute });
        const la = X.SG(t, Math.max(F.kw(1, '只差'), F.kw(1, '明斯基') + .1), Math.max(F.kw(1, '只差'), F.kw(1, '明斯基') + .1) + .5) * a * (1 - sep);
        if (la > 0) {
          const ax = P ? W / 2 : R1.x + R1.w, ay = P ? R1.y + R1.h : R1.y + R1.h / 2, bx = P ? W / 2 : R2.x, by = P ? R2.y : ay;
          x.save(); x.globalAlpha = la; x.setLineDash([4, 4]); x.strokeStyle = col(C.gold, .9); x.lineWidth = 1.5; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]); x.restore();
          X.pop(S, S.hud, t, K.tD, (ax + bx) / 2, (ay + by) / 2, () => TAG(S, S.hud, '只差一届', (ax + bx) / 2, (ay + by) / 2, la, { al: 'center', c: C.gold, f: 'sans', w: 700, size: v * 1.5 }));
        }
        /* 情景再现：两个少年并肩走 → 一个往康奈尔、一个往 MIT → 停在两端，转身对望 */
        const gY = P ? G.bot - v * .6 : h * .8, fh = P ? Math.min(h * .13, gY - (R2.y + R2.h) - v * 4.5) : Math.min(h * .3, gY - (R1.y + R1.h) - v * 7);
        const ta = X.SG(t, tC + .3, tC + 1) * a;
        if (ta > 0 && fh > 10) {
          const xs = W * .12, xm = W * .4, xa = W * (P ? .36 : .2), xb = W * (P ? .64 : .8), gap = fh * .5;
          const pA = tt => tt < k2 ? lerp(xs, xm, E.ioS(seg(tt, tC + .2, k2))) : lerp(xm, xa, E.ioS(seg(tt, k2 + .15, tS + .1)));
          const pB = tt => tt < k2 ? lerp(xs, xm, E.ioS(seg(tt, tC + .2, k2))) + gap : lerp(xm + gap, xb, E.ioS(seg(tt, k2 + .15, tS + .1)));
          const walker = (pf, i, c, label) => {
            const x0 = pf(t), vel = (pf(t + .04) - pf(t - .04)) / .08, spd = Math.abs(vel), amt = clamp(spd / (fh * .5)), dist = Math.abs(pf(t) - pf(tC)) + Math.abs(pf(t) - pf(k2)) * (t > k2 ? 1 : 0);
            const f = t > tS + .2 ? (i ? -1 : 1) : (vel < -1 ? -1 : vel > 1 ? 1 : (t < k2 + .2 ? 1 : (i ? 1 : -1)));
            const ph = (t < k2 ? pf(t) - xs : xm - xs + Math.abs(pf(t) - (i ? xm + gap : xm))) / (ST.STRIDE * fh) * TAU + i * 1.3;
            const pose = ST.mixP({ tr: .02, hd: .05, sh1: .05, el1: .5, sh2: -.05, el2: .15 }, ST.walk(ph, 1, { lean: .07 }), amt);
            ST.fig(S, x, { x: x0, y: gY, h: fh, f, pose, mode: 'holo', c, a: ta, hold: (g, R) => { const w = R.w1; g.save(); g.translate(w[0], w[1]); g.rotate(R.fa1); g.fillStyle = '#0b1424'; g.strokeStyle = col(c, .8); g.lineWidth = 1; rrect(g, -fh * .02, -fh * .06, fh * .05, fh * .11, fh * .008); g.fill(); g.stroke(); g.restore(); } });
            if (label && !P) H.chip(S, S.hud, label, x0, gY - fh * 1.15, { size: v * 1.5, al: 'center', a: sep * a, hot: i === 1, c });
          };
          ST.floor(S, x, W * .04, W * .96, gY + 1, ta * .8);
          walker(pA, 0, C.pri, '神经网络'); walker(pB, 1, C.acc, '符号主义');
          const sa1 = X.SG(t, F.kw(2, '康奈尔') - .4, F.kw(2, '康奈尔') + .2) * a, sa2 = X.SG(t, F.kw(2, '人工智能') - .5, F.kw(2, '人工智能') + .1) * a;
          ST.sign(S, x, W * .07, gY, fh * .95 * Math.max(.05, MO.sp(t, K.tK, 'bouncy')), '康奈尔', 'CORNELL', sa1, C.pri, 1); ST.sign(S, x, W * .93, gY, fh * .95 * Math.max(.05, MO.sp(t, K.tI, 'bouncy')), 'MIT', 'M.I.T.', sa2, C.acc, -1);   /* 路牌从地面弹起 */
          ST.tag(S, R1.x, (P ? R2.y + R2.h : R1.y + R1.h) + Math.max(v * 2.4, fsz(v * 1.15) * 1.1), ta * (1 - sep));   /* 标签放在卡片下面，不进字幕区 */
        }
        if (sep > 0) {
          const cx = W / 2, top = P ? h * .2 : h * .2, bot = P ? h * .78 : h * .82, ga = sep * a;
          x.save(); x.globalAlpha = ga; const g = x.createLinearGradient(0, top, 0, bot); g.addColorStop(0, col(C.pri, 0)); g.addColorStop(.5, col(C.priHi, 1)); g.addColorStop(1, col(C.acc, 0)); x.strokeStyle = g; x.lineWidth = v * .35;
          x.beginPath(); const n = 18; for (let i = 0; i <= n; i++) { const yy = lerp(top, bot, i / n), xx = cx + (i % 2 ? 1 : -1) * v * .9 * Math.sin(t * 3 + i); i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); x.restore();
          haze(S.glow, cx, (top + bot) / 2, v * 14, C.pri, .5 * ga);
          if (!P) T(S.hud, 'VS', cx, h * .8 - h * .3 * .55, { f: 'interd', size: v * 3, w: 900, c: C.ink, al: 'center', a: ga, sh: { c: C.pri, a: .6 } });
          else { TAG(S, S.hud, '神经网络  VS  符号主义', W / 2, h * .2 + chh + v * 4.5, ga, { al: 'center', f: 'sans', w: 700, size: v * 1.6 }); }
          const wy = P ? R2.y + R2.h + v * 2.6 : h * .2;
          if (t > K.tW) X.slam(S, S.hud, t, K.tW, cx, wy, w => T(S.hud, '世纪之争', cx, wy, { f: 'sans', size: v * 2.2, w: 700, c: C.gold, al: 'center', tr: .3, a: a * w, sh: { c: C.gold, a: .5 } }), 2.4);
        }
      }],
    ]);
  },
});

/* ===== 第二幕 · 华盛顿，1958 ===== */
/* 动效（重音：徽章落地 / 记者闪光 / IBM 704 / 它自己学会了 / 30 岁生日） */
L1S.push({
  tin: { type: 'wipe', ang: -.35 }, tdur: .7, mood: 'main', lead: .5, gap: .35, tail: .8,
  keys(F) {
    if (this._k && this._k.F === F) return this._k;
    const pA = F.kw(0, '记者') - .1, tk = F.kw(4, '还差');
    return (this._k = { F, pA, pB: pA + .45, pC: F.kw(0, '演示'), t1: F.cue(1) - .2, t1b: L1X.BT(F, 1, 1, 3), t2: F.cue(2) - .2, t3: F.cue(3) - .2, t4: F.cue(4) - .2, tR: F.kw(2, '规则') - .3, tL: F.kw(3, '自己学会') - .2, tk });
  },
  get sfx() {
    const K = this._k; if (!K) return [];
    return (K.sx = K.sx || [[.88, 'impact', .65], [K.pA - 1.1, 'snappers', .3, 3.8], [K.pA, 'flash', .7], [K.pA + .2, 'shutter', .4], [K.pB, 'flash', .55], [K.pB + .28, 'shutter', .4], [K.pC - .45, 'shutter', .35], [K.pC, 'flash', .7], [K.pC + .32, 'shutter', .4],
      [K.t1 - .08, 'whoosh', .5], [K.t1b + .2, 'tick', .5], [K.t2 + .25, 'cards', .45, K.t3 - K.t2 - .1], [K.tR, 'tick', .55], [K.tL, 'correct', .55], [K.tk - .5, 'paper', .45], [K.tk + .28, 'tick', .4], [K.tk + .56, 'tick', .4], [K.tk + .84, 'tick', .4], [K.tk + 1.12, 'ding', .55]]);
  },
  camera(t, S, F) { const K = this.keys(F); return L1X.cam(t, S, [[.9, .05], [K.t1, .03], [K.tL, .04], [K.tk + 1.12, .02]], [[.9, .45, .14, 6]]); },
  draw(t, S, F) {
    const X = L1X, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, K = this.keys(F); H.bg(S, t, {});
    STAMP(S, t, .2, '1958.07.07 · WASHINGTON D.C.', '华盛顿 · 美国气象局');
    const t1 = F.cue(1) - .2, t1b = X.BT(F, 1, 1, 3), t2 = F.cue(2) - .2, t3 = F.cue(3) - .2, t4 = F.cue(4) - .2;
    shots(t, [
      [0, t1, (a) => {
        const r = P ? W * .3 : h * .26, cx = W / 2, cy = P ? h * .42 : h * .48, k = E.oB(seg(t, .5, 1.1), 2), sc = lerp(1.7, 1, Math.min(1, k));
        x.save(); x.globalAlpha = a * clamp((t - .5) * 4); x.translate(cx, cy); x.rotate(-.06 * (1 - seg(t, .5, 1))); x.scale(sc, sc); const im = IMG.get('A26');
        if (im) x.drawImage(im.im, -r, -r, r * 2, r * 2); x.restore();
        haze(S.glow, cx, cy, r * 1.2, C.pri, .35 * a * clamp((t - .5) * 3));
        TAG(S, S.hud, 'OFFICE OF NAVAL RESEARCH · 美国海军研究办公室', cx, cy + r + v * 3, X.SG(t, 1.1, 1.6) * a, { al: 'center', size: v * 1.2 });
        /* 情景再现：记者们举着闪光灯相机，对着台上一阵猛拍 */
        const pA = F.kw(0, '记者') - .1, pB = F.kw(0, '记者') + .35, pC = F.kw(0, '演示'), ra = a * X.SG(t, pA - 1.1, pA - .5), rise = (1 - MO.sp(t, pA - 1.1, 'gentle')) * v * 6;
        if (ra > 0) {
          if (P) ST.reporters(S, x, W * .1, W * .9, h * .8 + rise, h * .15, t, [[pA, 1], [pA + .2, 3], [pB, 4], [pB + .28, 0], [pC, 2], [pC + .32, 3], [pC - .45, 4]], ra, { n: 5, kneel: 2 });
          else {
            const Y = (shortLand(S) ? h * .9 : h * .86) + rise, hh = h * (shortLand(S) ? .46 : .42);
            ST.reporters(S, x, W * .06, W * .27, Y, hh, t, [[pA, 1], [pB + .28, 0], [pC, 2]], ra, { n: 3, mid: W / 2, kneel: 2, seed: 3 });
            ST.reporters(S, x, W * .73, W * .94, Y, hh, t, [[pA + .2, 0], [pB, 1], [pC + .32, 2], [pC - .45, 1]], ra, { n: 3, mid: W / 2, seed: 11 });
          }
          if (P) ST.tag(S, W * .94, cy - r - v * 2.4, ra, 'right'); else ST.tag(S, W * .06, (shortLand(S) ? h * .9 : h * .86) - h * (shortLand(S) ? .46 : .42) - v * 3.4, ra);   /* 竖屏：标签放在徽章右上方，不和下面的机构名重叠 */
        }
        X.flash(S, t, pA); X.flash(S, t, pB, .5); X.flash(S, t, pC, .6);
      }],
      [t1, t1b, (a) => { X.photo(S, a, 'A06', seg(t, t1, t1b + .3), { R: P ? G.main : G.wide, z0: 1.05, z1: 1.12, f0: [.3, .5], f1: [.7, .5] }); TAG(S, S.hud, 'IBM 704 · 同型机', P ? W * .08 : W * .075, P ? G.main.y + G.main.h + v * 3 : G.wide.y + fsz(v * 1.25) * .95 + v * 1.4, a, { size: v * 1.25 }); }],
      [t1b, t2, (a) => {
        const m = X.photo(S, a, 'A05', seg(t, t1b, t2 + .3), { z0: 1.02, z1: 1.1, f0: [.5, .5], f1: [.55, .45], depth: .9 });
        if (m) {
          CO(S, x, m.map(.62, .3), X.sideB(S, 0, 3), X.SG(t, t1b + .2, t1b + 1) * a, 'IBM 704 · 5 吨重', 'ROOM-SIZED COMPUTER');
          CO(S, x, m.map(.78, .55), X.sideB(S, 1, 3), X.SG(t, t1b + .8, t1b + 1.6) * a, '每秒约 1.2 万次运算', '≈ 12,000 FLOPS', { ph: .3 });
          CO(S, x, m.map(.3, .7), X.sideB(S, 2, 3), X.SG(t, t1b + 1.4, t1b + 2.2) * a, '气象局这台：200 万美元', '1958 年报道', { c: C.gold, ph: .6 });
        }
      }],
      [t2, t3, (a) => {
        const lt = t - t2, R = G.main;
        const cy = P ? R.y + R.h * .82 : R.y + R.h * .78, mx = R.x + R.w * .78;
        let cw0 = R.w * .84, ch0 = cw0 * .45; const chMax = cy - v * 4.6 - (R.y + R.h * .12); if (ch0 > chMax) { ch0 = chMax; cw0 = ch0 / .45; }   /* 屏幕很宽很矮时卡片缩小，别压到下面的记号卡 */
        PH(S, x, 'A35', { x: R.x + (R.w - cw0) / 2, y: R.y + R.h * .12, w: cw0, h: ch0 }, { a: a * X.SG(t, t2, t2 + .5), p: seg(t, t2, t3), z0: 1, z1: 1.08, r: v * .8, vig: .15, cred: X.CR.A35, frame: 1 });
        x.save(); x.globalAlpha = a; rrect(x, mx - v * 5, cy - v * 4, v * 10, v * 8, v); x.fillStyle = 'rgba(6,14,30,.85)'; x.fill(); x.strokeStyle = col(C.pri, .6); x.stroke(); x.restore();
        T(x, '704', mx, cy, { f: 'mono', size: v * 2.2, w: 500, c: C.priHi, al: 'center', a });
        for (let i = 0; i < 5; i++) {
          const q = ((lt * .55) - i * .45); if (q < 0 || q > 1) continue; const cx = lerp(R.x + R.w * .06, mx - v * 6, E.ioS(q)), left = i % 2 === 0, cw = v * 6, ch = v * 3.6;
          x.save(); x.globalAlpha = a * (q < .9 ? 1 : (1 - q) * 10); x.fillStyle = '#e8e2d4'; x.fillRect(cx - cw / 2, cy - ch / 2, cw, ch); x.fillStyle = '#1b1710'; x.fillRect(left ? cx - cw * .38 : cx + cw * .12, cy - ch * .25, cw * .26, ch * .5); x.restore();
        }
        const ra = X.SG(t, F.kw(2, '规则') - .3, F.kw(2, '规则') + .2) * a, S2 = G.P ? [W / 2, G.side.y + v * 3] : [G.side.x + G.side.w / 2, G.side.y + G.side.h * .4];
        if (ra > 0) { T(S.hud, '规则：', S2[0] - v * 4, S2[1], { f: 'sans', size: v * 2.4, w: 700, c: C.ink, al: 'right', a: ra }); for (let i = 0; i < 3; i++) { S.hud.save(); S.hud.globalAlpha = ra; S.hud.fillStyle = col(C.acc, .85); S.hud.fillRect(S2[0] - v * 3.6 + i * v * 3.6, S2[1] - v * 1.3, v * 3, v * 2.6); S.hud.restore(); } T(S.hud, '没人告诉它', S2[0], S2[1] + v * 4, { f: 'sans', size: v * 1.6, w: 500, c: C.accHi, al: 'center', a: ra }); }
        TAG(S, S.hud, '打孔卡 · 左边有记号 / 右边有记号', R.x, R.y + v * 1.2, X.SG(t, t2 + .5, t2 + 1) * a, { size: v * 1.15 });
      }],
      [t3, t4, (a) => {
        const lt = t - t3, R = G.P ? G.wide : G.wide, n = 60, cols = P ? 10 : 20, cell = P ? R.w / 12 : Math.min(R.w / 24, R.h * .105), X0 = R.x + (R.w - cols * cell) / 2, Y0 = P ? R.y + v * 2 : R.y + v * 3;
        const tl = F.kw(3, '50 次之后'), k = Math.floor(clamp((t - t3) / Math.max(.5, tl - t3 + .9)) * n), r = rng(58);
        for (let i = 0; i < n; i++) { const ok = i < 50 ? r() < .5 : r() < .95; if (i >= k) continue; const cx = X0 + (i % cols + .5) * cell, cy = Y0 + Math.floor(i / cols) * cell * 1.05 + cell / 2; H.node(S, cx, cy, cell * (ok ? .3 : .2), { lit: ok ? 1 : .08, c: ok ? C.ok : C.red, a: a * (i >= 50 ? 1 : .85) }); }   /* 对错不只靠红绿：分对的大而亮，分错的小而暗（照顾色弱） */
        T(S.hud, '第 ' + Math.max(1, k) + ' 次', X0, Y0 - v * 2.2, { f: 'sans', size: v * 1.8, w: 700, c: C.ink, a });
        const CR2 = P ? { x: R.x + v * 3, y: R.y + R.h * .5, w: R.w - v * 5, h: R.h * .36 } : { x: R.x + R.w * .12, y: R.y + R.h * .46, w: R.w * .76, h: R.h * .4 };
        W3.axes(S, x, CR2, a, '尝试次数', '分对的比例（示意）');
        const fn = q => q < .82 ? .48 + .06 * Math.sin(q * 40) * (1 - q) : .48 + .45 * E.o3(clamp((q - .82) / .18));
        const end = W3.curve(S, x, CR2, fn, clamp(k / n), C.pri, { a });
        const x50 = CR2.x + CR2.w * .82; x.save(); x.globalAlpha = a * .7; x.setLineDash([3, 4]); x.strokeStyle = col(C.gold, .8); x.beginPath(); x.moveTo(x50, CR2.y); x.lineTo(x50, CR2.y + CR2.h); x.stroke(); x.setLineDash([]); x.restore();
        T(x, '50', x50, P ? CR2.y - v * 1.4 : CR2.y + CR2.h + v * 1.8, { f: 'mono', size: v * 1.25, c: C.gold, al: 'center', a });   /* 竖屏：放到虚线顶上，免得和横轴标签挤在一起 */
        const ka = X.SG(t, F.kw(3, '自己学会') - .2, F.kw(3, '自己学会') + .4) * a;
        if (ka > 0) { const kx = P ? W / 2 : CR2.x + CR2.w * .55, ky = CR2.y + v * 2; X.slam(S, S.hud, t, K.tL, kx, ky, w => H.chip(S, S.hud, '它自己学会了', kx, ky, { size: v * 2.2, hot: true, a: ka * w, al: 'center' }), 2.2); }
      }],
      [t4, F.dur, (a) => {
        const m = X.photo(S, a, 'A01', seg(t, t4, F.dur), { R: P ? G.main : { x: W * .1, y: h * .19, w: W * .3, h: h * .6 }, z0: 1.02, z1: 1.12, f0: [.5, .4], depth: .8 });
        if (m) X.pco(S, x, m, P ? [W * .08, G.main.y + G.main.h + coH(S) * .5 + v * 1.2] : [W * .45, h * .27], X.SG(t, t4 + .3, t4 + 1.1) * a, '罗森布拉特 · 29 岁', '康奈尔航空实验室 · 研究心理学家', { side: 1 });
        const tk = F.kw(4, '还差'), day = 7 + Math.min(4, Math.floor(clamp((t - tk) / 1.4) * 4.999)), hot = day === 11;
        const clx = P ? W * .72 : W * .74, cly = P ? G.side.y + G.side.h * .55 : h * .52, flip = MO.punch(t, tk + .28 * Math.max(0, day - 7), .06, 'bouncy');   /* 每翻一页轻轻一顶 */
        X.pop(S, S.hud, t, tk - .5, clx, cly, () => MO.tf(S, S.hud, { x: clx, y: cly, sx: 1 + flip, sy: 1 + flip }, () => X.calendar(S, S.hud, clx, cly, v * (P ? 11 : 16), day, X.SG(t, tk - .5, tk) * a, { hot, sub: hot ? '30 岁生日' : '演示当天', top: 'JULY 1958' })), 'bouncy', .7);
      }],
    ]);
  },
});

/* ===== 第三幕 · 感知机 ===== */
/* 动效（重音：感知机 / 亮灯 / 再猜再调 / 从错误里学习） */
L1S.push({
  tin: { type: 'fade' }, tdur: .6, mood: 'main', lead: .5, gap: .35, tail: .9,
  keys(F) {
    if (this._k && this._k.F === F) return this._k;
    const k2 = F.cue(2), e2 = F.end(2);
    return (this._k = { F, tk: F.kw(0, '感知机') - .2, tn: F.kw(0, '神经元') + .3, tw: F.kw(1, '权重') - .2, tl: F.kw(1, '亮灯') - .3, xs: [0, 1, 2].map(i => k2 + .3 + i * (e2 - k2) * .3), tE: F.kw(3, '错误') - .3 });
  },
  get sfx() { const K = this._k; return K ? (K.sx = K.sx || [[K.tk, 'impact', .65], [K.tn, 'blip', .45], [K.tw, 'tick', .45], [K.tl, 'ding', .5], [K.xs[0], 'wrong', .3], [K.xs[1], 'wrong', .3], [K.xs[2], 'correct', .5], [K.tE, 'hit', .6]]) : []; },
  camera(t, S, F) { const K = this.keys(F); return L1X.cam(t, S, [[K.tk, .05], [K.tl, .02], [K.xs[2], .02], [K.tE, .04]], [[K.tk, .4, .14, 2]]); },
  draw(t, S, F) {
    const X = L1X, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, K = this.keys(F); H.bg(S, t, {});
    const t1 = F.cue(1) - .2;
    shots(t, [
      [0, t1, (a) => {
        const tk = F.kw(0, '感知机'), tb = F.kw(0, '大脑') - .2, tn = F.kw(0, '神经元');
        const fig = IMG.get('A04'); if (fig) { const fw = P ? W * .86 : W * .5, fh = fw * fig.h / fig.w, fx = P ? W * .07 : W * .45, fy = P ? h * .52 : h * .22; x.save(); x.globalAlpha = a * .55 * X.SG(t, tk - .3, tk + .4) * (1 - .6 * X.SG(t, tb, tb + .6)); x.drawImage(fig.im, fx, fy, fw, fh); x.restore(); T(S.hud, X.CR.A04, fx + fw, fy + fh + v * 1.6, { f: 'mono', size: v * .95, c: C.mute, al: 'right', a: a * .7 * X.SG(t, tk, tk + .5) * (1 - X.SG(t, tb, tb + .6)) }); }
        if (t > K.tk) X.slam(S, S.hud, t, K.tk, P ? W / 2 : W * .27, P ? h * .3 : h * .4, w => T(S.hud, 'PERCEPTRON', P ? W / 2 : W * .27, P ? h * .3 : h * .4, { f: 'interd', size: v * (P ? 4.6 : 6), w: 900, c: C.ink, al: 'center', tr: .06, a: a * w, sh: { c: C.pri, a: .7 } }), 2.3);
        T(S.hud, '感知机', P ? W / 2 : W * .27, P ? h * .3 + v * 5 : h * .4 + v * 7, { f: 'smiley', size: v * (P ? 3.4 : 4.4), c: C.priHi, al: 'center', a: a * X.SG(t, tk, tk + .5) });
        const na = X.SG(t, tb, tb + .7) * a, sim = X.SG(t, tn + .3, tn + 1.2);
        if (na > 0) { X.neuron(S, x, P ? W * .3 : W * .55, P ? h * .62 : h * .52, v * (P ? 9 : 11), t, na * (1 - sim * .7), 1); T(S.hud, '大脑里的神经元', P ? W / 2 : W * .7, P ? h * .76 : h * .74, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, al: 'center', a: na }); }
        if (sim > 0) { const cx = P ? W * .72 : W * .86, cy = P ? h * .62 : h * .52; H.node(S, cx, cy, v * 3 * sim, { lit: 1, c: C.sec, a: a * sim }); T(x, 'Σ', cx, cy, { f: 'interd', size: v * 2.6 * sim, w: 700, c: C.ink, al: 'center', a: a * sim }); T(S.hud, '→', (P ? W * .52 : W * .74), cy, { f: 'sans', size: v * 3, c: C.pri, al: 'center', a: a * sim }); }
      }],
      [t1, F.dur, (a) => {
        const k1 = F.cue(1), tw = F.kw(1, '权重'), ts = F.kw(1, '加起来'), tl = F.kw(1, '亮灯'), k2 = F.cue(2), k3 = F.cue(3);
        const R = P ? { x: W * .14, y: h * .24, w: W * .82, h: h * .34 } : { x: W * .12, y: h * .2, w: W * .66, h: h * .58 };
        const tries = [[0, 0, 0], [1, 0, 0], [0, 0, 1]];
        const w0 = [.8, -.4, .3], w1 = [.9, .6, .1];
        const adj = E.io3(seg(t, F.kw(2, '调大') - .2, F.kw(2, '再调') + .4)), wts = w0.map((w, i) => lerp(w, w1[i], adj));
        const xin = [1, 1, 0], sumv = xin.reduce((s, xi, i) => s + xi * wts[i], 0), sumP = X.SG(t, ts - .2, ts + .6);
        const litP = t > k2 - .2 && t < k3 - .3 ? (adj > .9 ? X.SG(t, F.kw(2, '再调'), F.kw(2, '再调') + .3) : 0) : X.SG(t, tl - .3, tl + .1);
        const errA = t > k2 - .2 && t < F.kw(2, '再调') ? X.SG(t, k2 - .2, k2 + .2) * (1 - adj) : 0;
        X.perceptron(S, x, R, { wts, lp: X.SG(t, k1 - .2, k1 + .6), flow: t > F.kw(1, '信号'), wa: X.SG(t, tw - .2, tw + .4), hot: adj > 0 && adj < 1, sum: sumP * clamp(sumv), sumv: sumv * sumP, sa: sumP, ta: X.SG(t, tl - .8, tl - .3), lit: t < k2 - .2 ? (sumv > .5 ? X.SG(t, tl - .3, tl + .1) : 0) : litP, err: errA, ok: adj > .95 && t < k3 ? X.SG(t, F.kw(2, '再调'), F.kw(2, '再调') + .3) : 0, x: xin.map(q => q ? 1 : .15) }, a * (1 - X.SG(t, k3 - .3, k3 + .3)), t);
        const ra = X.SG(t, k2, k2 + .4) * a * (1 - X.SG(t, k3 - .3, k3 + .2));
        if (ra > 0) { const row = P ? [W * .5, h * .64] : [W * .84, h * .3]; ['✗', '✗', '✓'].forEach((s, i) => { const t0 = K.xs[i], on = X.SG(t, t0, t0 + .3), q = MO.squash(t, t0 + .12, .9), sk = MO.sp(t, t0, 'pop'), cx = row[0] + (i - 1) * v * 4.5; if (on <= 0) return; MO.tf(S, S.hud, { x: cx, y: row[1] + v * 1.2, sx: q.sx * lerp(.4, 1, sk), sy: q.sy * lerp(.4, 1, sk) }, () => T(S.hud, s, cx, row[1], { f: 'sans', size: v * 3, w: 900, c: s === '✓' ? C.ok : C.red, al: 'center', a: ra * on })); }); T(S.hud, '再猜 · 再调', row[0], row[1] + v * 4, { f: 'sans', size: v * 1.6, w: 500, c: C.mute, al: 'center', a: ra }); }
        const ca = X.SG(t, k3 - .2, k3 + .5) * a;
        if (ca > 0) {
          const LR = P ? { x: W * .07, y: h * .6, w: W * .4, h: h * .16 } : { x: W * .1, y: h * .3, w: W * .36, h: h * .42 }, RR = P ? { x: W * .53, y: h * .6, w: W * .4, h: h * .16 } : { x: W * .56, y: h * .3, w: W * .36, h: h * .42 };
          H.panel(S, x, LR.x, LR.y, LR.w, LR.h, { a: ca, head: 'RULES' });
          ['if 天晴 and 有人约:', '    出门()', 'else:', '    在家()'].forEach((s, i) => T(x, s, LR.x + v * 1.4, LR.y + v * (P ? 3.4 : 5) + i * v * (P ? 2.2 : 3), { f: 'mono', size: v * (P ? 1.15 : 1.5), c: C.mute, a: ca }));
          const cr = X.SG(t, k3 + .3, k3 + 1); x.save(); x.globalAlpha = ca * cr; x.strokeStyle = col(C.red, .9); x.lineWidth = v * .35; x.beginPath(); x.moveTo(LR.x + v, LR.y + v); x.lineTo(LR.x + LR.w - v, LR.y + LR.h - v); x.moveTo(LR.x + LR.w - v, LR.y + v); x.lineTo(LR.x + v, LR.y + LR.h - v); x.stroke(); x.restore();
          H.panel(S, x, RR.x, RR.y, RR.w, RR.h, { a: ca, head: 'LEARNING', c: C.ok });
          W3.curve(S, x, { x: RR.x + v * 2, y: RR.y + v * 4, w: RR.w - v * 4, h: RR.h - v * 6 }, q => .1 + .8 * (1 - Math.exp(-q * 3.2)) + .04 * Math.sin(q * 22) * (1 - q), X.SG(t, k3 + .4, k3 + 2.2), C.ok, { a: ca });
          if (t > K.tE) X.slam(S, S.hud, t, K.tE, W / 2, P ? h * .55 : h * .8, w => H.chip(S, S.hud, '从错误里学习', W / 2, P ? h * .55 : h * .8, { size: v * 2.3, hot: true, a: a * w, al: 'center' }), 2.2);
        }
      }],
    ]);
  },
});

/* ===== 第四幕 · 报纸沸腾 ===== */
/* 动效（重音：标题 / 走路说话看写字自我复制 / 意识 / 会思考） */
L1S.push({
  tin: { type: 'wipe', ang: .4 }, tdur: .7, mood: 'main', lead: .5, gap: .35, tail: .9,
  keys(F) {
    if (this._k && this._k.F === F) return this._k; const kw = w => F.kw(1, w);
    return (this._k = { F, tH: F.kw(0, '标题') - .3, tw: kw('走路'), tt: kw('说话'), tl: kw('看'), twr: kw('写字'), tc: kw('自我复制'), tA: kw('意识'), tG: F.kw(2, '会思考') - .4, k2: F.cue(2) });
  },
  get sfx() {
    const K = this._k; if (!K) return [];
    return (K.sx = K.sx || [[0, 'press', .4, 2.3], [.3, 'paper', .55], [.4, 'whoosh', .45], [K.tH, 'tick', .55], [K.tw - .5, 'blip', .45], [K.tw, 'tick', .35], [K.tw + .22, 'tick', .35], [K.tt - .1, 'blip', .45], [K.tl - .05, 'scan', .4], [K.twr - .05, 'pencil', .45, .9], [K.tc - .1, 'scan', .5], [K.tA - .25, 'ding', .5], [K.tG, 'rise', .45]]);
  },
  camera(t, S, F) { const K = this.keys(F); return L1X.cam(t, S, [[.95, .03], [K.tH, .03], [K.tc, .02], [K.tA, .03], [K.k2, .02]]); },
  draw(t, S, F) {
    const X = L1X, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, K = this.keys(F); H.bg(S, t, { hue: 'gold', neb: .8 });
    STAMP(S, t, .4, '1958.07.08 · THE NEW YORK TIMES', '《纽约时报》第二天的报道');
    const fly = E.o3(seg(t, .15, 1.1)), k1 = F.cue(1), k2 = F.cue(2);
    /* 竖屏：时间戳 → 复原示意标签 → 报纸 → 下方标注，自上而下排开，矮屏时报纸自动缩小 */
    const rph = fsz(v * 1.15) * 1.85, recY = G.top + rph / 2 + v * .4, ptop = recY + rph / 2 + v * 1.2;
    const lTop = h * .19 + rph / 2 + v * .9, pw = P ? Math.min(W * .6, (G.side.y + v * 3 - ptop) / 1.375) : shortLand(S) ? Math.min(W * .34, (h * .8 - lTop) / 1.3) : W * .34, cx = P ? W * .5 : W * .27, cy = P ? ptop + pw * .625 : shortLand(S) ? lTop + pw * .625 : h * .55;
    const zq = X.SG(t, F.kw(0, '登出') - .2, F.kw(0, '登出') + .6) * (1 - X.SG(t, k1 - .3, k1 + .5)), sc = lerp(1, P ? 1.1 : shortLand(S) ? 1.04 : 1.12, zq);
    const D = DOC.draw(S, x, 'nyt', cx + (1 - fly) * W * .1, cy + (1 - fly) * h * .6 + zq * (P ? h * .02 : shortLand(S) ? 0 : h * .04), pw, { rot: lerp(.35, -.04, fly), sc, a: clamp(fly * 2),
      hl: [{ k: 'q', p: seg(t, F.kw(1, '走路') - .3, F.kw(1, '存在') + .3) }, { k: 'cost', p: seg(t, k2 + .3, k2 + 1.6), c: 'rgba(255,200,107,.45)' }] });
    if (!D) return;
    RECON(S, S.hud, P ? cx - pw / 2 : W * .055, P ? recY : h * .19, X.SG(t, .9, 1.4), '复原示意 · 标题与引文为原文');
    const hb = D.box('head'); if (hb) BOX(S, x, hb.x - v * .6, hb.y - v * .4, hb.w + v * 1.2, hb.h + v * .8, X.SG(t, F.kw(0, '标题') - .3, F.kw(0, '标题') + .5) * (1 - X.SG(t, k1 - .2, k1 + .3)));
    if (hb) CO(S, x, hb.r, P ? [W * .52, G.side.y + v * 1] : [W * .55, h * .3], X.SG(t, F.kw(0, '标题'), F.kw(0, '标题') + 1) * (1 - X.SG(t, k1 - .2, k1 + .3)), '海军新装置，边做边学', 'NEW NAVY DEVICE LEARNS BY DOING', { side: P ? -1 : 1, size: v * (P ? 1.9 : 2.5) });
    const qb = D.box('q'), q1 = X.SG(t, k1 - .1, k1 + .6) * (1 - X.SG(t, k2 - .2, k2 + .3));
    if (qb && q1 > 0) {
      CO(S, x, qb.r, P ? [W * .94, G.side.y + v * 1] : [W * .55, h * .22], q1, '能走路、说话、看、写字、自我复制', 'WALK · TALK · SEE · WRITE · REPRODUCE', { side: P ? -1 : 1 });
      /* 示意：报道里想象的“会思考的机器”，念到哪个能力就演哪个 */
      const kw = w => F.kw(1, w), tw = kw('走路'), tt = kw('说话'), tl = kw('看'), twr = kw('写字'), tc = kw('自我复制'), tA = kw('意识');
      const RX = P ? W * .4 : W * .7, RY = P ? G.side.y + v * 21 : h * .7, RH = P ? v * 11.5 : h * .32, cp = X.SG(t, tc - .1, tc + .9);
      const A = { walk: seg(t, tw - .15, tt - .1), talk: seg(t, tt - .1, tl - .05), look: seg(t, tl - .05, twr - .05), write: seg(t, twr - .05, tc - .1), copy: cp, aware: seg(t, tA - .25, tA + 1.4) };
      const ra = X.SG(t, tw - .5, tw - .1) * q1, pop = MO.sp(t, tw - .5, 'pop');
      if (ra > 0) {
        MO.tf(S, x, { x: RX, y: RY, sx: lerp(.6, 1, pop), sy: lerp(.6, 1, pop) }, () => ST.robot(S, x, RX, RY, RH, t, A, ra, C.pri, { bubbleSide: -1 }));
        if (cp > 0) {   /* 自我复制：旁边一台从下往上扫描成形 */
          const X2 = RX + RH * .62, top = RY - RH * 1.05, yb = lerp(RY + 2, top, E.io3(cp));
          x.save(); x.beginPath(); x.rect(X2 - RH * .5, yb, RH, RY - yb + 4); x.clip(); ST.robot(S, x, X2, RY, RH, t + 1.3, { aware: A.aware * .5 }, ra * .85, C.acc, { noBubble: true }); x.restore();
          if (cp < 1) { x.save(); x.globalAlpha = ra; x.fillStyle = col(C.accHi, .9); x.fillRect(X2 - RH * .3, yb - 1, RH * .6, 2); x.restore(); haze(S.glow, X2, yb, RH * .3, C.acc, .8 * ra); }
        }
        const words = ['走路', '说话', '看', '写字', '自我复制', '意识'], wt = [tw, tt, tl, twr, tc, tA], wy = RY + Math.max(v * 2.4, fsz(v * 1.3) * 1.1), ws = words.map(w => TW(S.hud, w, { f: 'sans', size: v * 1.3, w: 700 }) + v * 1.6), tot = ws.reduce((p, q) => p + q, 0);
        let wx = (P ? W * .5 : RX + RH * .3) - tot / 2;
        words.forEach((w, i) => { const on = X.SG(t, wt[i] - .15, wt[i] + .15), cur = t > wt[i] - .15 && (i === 5 || t < wt[i + 1] - .15); T(S.hud, w, wx + ws[i] / 2, wy, { f: 'sans', size: v * 1.3, w: 700, c: cur ? (i === 5 ? C.accHi : C.priHi) : C.mute, al: 'center', a: ra * (.25 + .75 * on) }); wx += ws[i]; });
        RECON(S, S.hud, P ? W * .07 : RX - RH * .55, P ? RY - RH * 1.12 : RY - RH * 1.22, ra, '示意 · 1958 年的想象');
      }
      const ba = X.SG(t, F.kw(1, '意识') - .1, F.kw(1, '意识') + .5) * q1;
      if (ba > 0) { const bx = P ? W / 2 : RX + RH * .3, by = P ? RY + v * 6.4 : RY + Math.max(v * 6.5, fsz(v * 1.3) * 1.1 + fsz(v * 3.6) * .9); X.pop(S, S.hud, t, F.kw(1, '意识') - .1, bx, by, () => T(S.hud, '意识到自己的存在', bx, by, { f: 'smiley', size: v * (P ? 3.2 : 3.6), c: C.accHi, al: 'center', a: ba, sh: { c: C.acc, a: .7 } }), 'pop', .5); }
    }
    const q2 = X.SG(t, k2, k2 + .6);
    if (q2 > 0) {
      const cb = D.box('cost'); if (cb) CO(S, x, cb.r, P ? [W * .94, G.side.y + v * 1] : [W * .55, h * .25], q2, '预计一年内完成，造价 10 万美元', 'IN ABOUT A YEAR · $100,000', { side: P ? -1 : 1, c: C.gold });
      QUOTE(S, S.hud, P ? { x: W * .07, y: G.side.y + v * 7.5, w: W * .86 } : { x: W * .55, y: h * .4, w: W * .38 }, '感知机将来可以送上别的星球，当{机械探险家}。', '罗森布拉特 · 1958 年报道', X.SG(t, k2 + .8, k2 + 1.5));
      const ga = X.SG(t, F.kw(2, '会思考') - .4, F.kw(2, '会思考')) * q2, gx = P ? W * .5 : W * .74, gy = P ? h * .76 : h * .76, gr = v * (P ? 4.6 : 5.2);
      if (ga > 0) {
        x.save(); x.globalAlpha = ga; x.lineWidth = v * .6; for (let i = 0; i < 20; i++) { const a0 = Math.PI * (1 + i / 20), a1 = Math.PI * (1 + (i + .8) / 20); x.strokeStyle = col(mix(C.pri, C.red, i / 19), .9); x.beginPath(); x.arc(gx, gy, gr, a0, a1); x.stroke(); } x.restore();
        const nd = Math.PI * (1 + .98 * E.oB(seg(t, F.kw(2, '会思考') - .2, F.kw(2, '眼前') + .2), 1.4)); x.save(); x.globalAlpha = ga; x.strokeStyle = col(C.ink, 1); x.lineWidth = v * .3; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + Math.cos(nd) * gr * .9, gy + Math.sin(nd) * gr * .9); x.stroke(); x.restore();
        T(S.hud, 'HYPE', gx, gy + v * 1.8, { f: 'mono', size: v * 1.2, w: 500, c: C.red, al: 'center', tr: .3, a: ga });
      }
    }
  },
});

/* ===== 第五幕 · Mark I ===== */
/* 动效（重音：Mark I / 400 个光电管 / 随机相连 / 小电机 / 认字母） */
L1S.push({
  tin: { type: 'iris', x: .35, y: .5 }, tdur: .8, mood: 'main', lead: .5, gap: .35, tail: .9,
  keys(F) {
    if (this._k && this._k.F === F) return this._k;
    const tL = F.kw(4, '认字母');
    return (this._k = { F, tM: F.kw(0, 'Mark') - .2, t400: F.kw(1, '400') - .3, tR: F.kw(2, '随机') - .3, k2: F.cue(2) - .2, k3: F.cue(3), k4: F.cue(4) - .2, tL, lt: [0, 1, 2].map(i => tL - .3 + 1.1 / 3 * i) });
  },
  get sfx() { const K = this._k; return K ? (K.sx = K.sx || [[.5, 'rise', .5], [K.tM, 'hit', .55], [K.t400, 'data', .4, 1.5], [K.tR, 'relay', .4, 1.7], [K.k3, 'motor', .38, 2.2], ...K.lt.map(q => [q, 'tick', .5]), [K.k4 + 1.2, 'blip', .45]]) : []; },
  camera(t, S, F) { const K = this.keys(F); return L1X.cam(t, S, [[K.tM, .04], [K.k2, .02], [K.k4, .03], ...K.lt.map(q => [q, .012])]); },
  draw(t, S, F) {
    const X = L1X, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, K = this.keys(F); H.bg(S, t, {});
    const k1 = F.cue(1), k2 = F.cue(2) - .2, k3 = F.cue(3), k4 = F.cue(4) - .2;
    STAMP(S, t, .3, t < k4 + .3 ? '1960 · BUFFALO, NY' : '1960.06.23 · BUFFALO, NY', t < k4 + .3 ? '布法罗 · 康奈尔航空实验室' : '首次公开演示');
    const C_SHAPE = X.letter('C');
    shots(t, [
      [0, k2, (a) => {
        const push = X.SG(t, k1 - .3, k1 + 1.4);
        const m = X.photo(S, a, 'A02', seg(t, 0, k1 + .5), { z0: 1.02, z1: 1.08 + .32 * push, f0: [.45, .5], f1: push > 0 ? [.56, .55] : [.45, .5], depth: .7, scan: seg(t, .4, 2) });
        if (!m) return;
        const bc = [m.map(.073, .366), m.map(.229, .70)], bm = [m.map(.458, .43), m.map(.667, .69)];
        BOX(S, x, bc[0][0], bc[0][1], bc[1][0] - bc[0][0], bc[1][1] - bc[0][1], X.SG(t, F.kw(0, 'Mark') - .2, F.kw(0, 'Mark') + .6) * (1 - push));
        BOX(S, x, bm[0][0], bm[0][1], bm[1][0] - bm[0][0], bm[1][1] - bm[0][1], X.SG(t, F.kw(0, 'Mark') + .3, F.kw(0, 'Mark') + 1.1) * a, { c: C.acc });
        CO(S, x, [bc[1][0], (bc[0][1] + bc[1][1]) / 2], X.sideB(S, 0, 2), X.SG(t, F.kw(0, 'Mark'), F.kw(0, 'Mark') + 1) * (1 - push) * a, '字母卡片「C」', 'STIMULUS CARD');
        CO(S, x, [bm[1][0], (bm[0][1] + bm[1][1]) / 2], X.sideB(S, P ? 0 : 0, 2, { dx: 0 }), X.SG(t, k1 - .1, k1 + .7) * a, '摄像头 = 它的“眼睛”', 'S-UNITS · 400 PHOTOCELLS', { c: C.acc });
        const gy = P ? G.side.y + v * 3.2 + coH(S) * .5 + v * 1.4 : G.side.y + G.side.h * .28, gs = P ? Math.min(W * .5, G.bot - gy - v * 3.4) : Math.min(G.side.w * .82, G.bot - gy - v * 3.6), gx = P ? W / 2 - gs / 2 : G.side.x;   /* 方阵和下面的标签都要在字幕上方 */
        const ga = X.SG(t, F.kw(1, '400') - .3, F.kw(1, '400') + .3) * a;
        if (ga > 0) { W3.grid(S, x, gx, gy, gs, C_SHAPE, seg(t, F.kw(1, '400'), F.kw(1, '方阵') + .4), { a: ga }); TAG(S, S.hud, '400 PHOTOCELLS · 20 × 20', gx, gy + gs + v * 2, ga, { size: v * 1.15 }); }
      }],
      [k2, k4, (a) => {
        const z = X.SG(t, k3 - .3, k3 + 1.2);
        const R = P ? G.main : { x: W * .055, y: h * .18, w: W * .48, h: h * .63 };
        const m = X.photo(S, a, 'A03', seg(t, k2, k4), { R, z0: 1.0 + .0, z1: 1.04 + .7 * z, f0: [.5, .5], f1: z > 0 ? [.72, .45] : [.5, .5], contain: false, vig: .25 });
        if (!m) return;
        const lab = [[.62, .9, '插线板：随机接线', 'S→A PLUGBOARD', 0], [.86, .78, '联想单元', '512 ASSOCIATION UNITS', 1], [.84, .14, '响应面板', 'RESPONSE PANEL', 2]];
        const naP = P ? X.SG(t, F.kw(2, '512') - .2, F.kw(2, '512') + .3) : 0;   /* 竖屏：网络图出来时标签让位 */
        lab.forEach(([u, w, a1, b1, i]) => CO(S, x, m.map(u, w), P ? X.sideB(S, i, 3, { cols: 1 }) : [W * .58, h * .25 + i * Math.max(h * .09, coH(S) + v * 1.2)], X.SG(t, k2 + .5 + i * .45, k2 + 1.3 + i * .45) * a * (1 - z) * (1 - naP), a1, b1, { ph: i * .3 }));
        const NR = P ? { x: W * .07, y: G.side.y + v * 1, w: W * .86, h: G.side.h - v * 2 } : { x: W * .57, y: shortLand(S) ? h * .47 : h * .52, w: W * .38, h: shortLand(S) ? h * .25 : h * .28 };
        const na = X.SG(t, F.kw(2, '512') - .2, F.kw(2, '512') + .5) * a * (P ? 1 - .75 * X.SG(t, k3, k3 + .5) : 1);   /* 竖屏：旋钮出来时网络退后 */
        if (na > 0 && !(P && z < .01 && t < F.kw(2, '512') - .2)) {
          const cols = [6, 9, 3], r = rng(512), pts = cols.map((n, i) => Array.from({ length: n }, (_, j) => [NR.x + NR.w * (.08 + .84 * i / 2), NR.y + NR.h * ((j + .5) / n)]));
          const wp = X.SG(t, F.kw(2, '随机') - .3, F.kw(2, '相连') + .4);
          x.save(); x.globalAlpha = na * .55; x.strokeStyle = col(C.pri, .6); x.lineWidth = 1;
          for (const p1 of pts[0]) for (const p2 of pts[1]) if (r() < .45 * wp) { x.beginPath(); x.moveTo(p1[0], p1[1]); x.lineTo(p2[0], p2[1]); x.stroke(); }
          for (const p1 of pts[1]) for (const p2 of pts[2]) if (r() < .7 * wp) { x.beginPath(); x.moveTo(p1[0], p1[1]); x.lineTo(p2[0], p2[1]); x.stroke(); }
          x.restore();
          pts.forEach((c, i) => c.forEach(([px, py]) => H.node(S, px, py, v * (i === 1 ? .5 : .7), { lit: .7, c: [C.pri, C.sec, C.acc][i], a: na })));
          ['400', '512', '8'].forEach((s, i) => T(S.hud, s, NR.x + NR.w * (.08 + .84 * i / 2), NR.y + NR.h + v * 1.8, { f: 'mono', size: v * 1.3, w: 500, c: C.ink, al: 'center', a: na }));
        }
        const pa = X.SG(t, k3, k3 + .5) * a;
        if (pa > 0) {
          const kr = v * (P ? 3.6 : 5), mo = kr * (P ? 2.8 : 2.2), kx = P ? W / 2 - mo / 2 : W * .66, ky = P ? G.side.y + G.side.h * .42 : h * .4, ang = Math.sin(t * 2.4) * 1.6;
          x.save(); x.globalAlpha = pa; x.beginPath(); x.arc(kx, ky, kr, 0, TAU); x.fillStyle = 'rgba(10,20,40,.9)'; x.fill(); x.strokeStyle = col(C.pri, .8); x.lineWidth = 1.5; x.stroke();
          x.strokeStyle = col(C.priHi, 1); x.lineWidth = v * .4; x.beginPath(); x.moveTo(kx, ky); x.lineTo(kx + Math.cos(ang - Math.PI / 2) * kr * .8, ky + Math.sin(ang - Math.PI / 2) * kr * .8); x.stroke();
          for (let i = 0; i < 12; i++) { const aa = i / 12 * TAU + t * 1.6; x.fillStyle = col(C.gold, .9); x.fillRect(kx + mo + Math.cos(aa) * kr * .7 - 1.5, ky + Math.sin(aa) * kr * .7 - 1.5, 3, 3); }
          x.beginPath(); x.arc(kx + mo, ky, kr * .55, 0, TAU); x.strokeStyle = col(C.gold, .8); x.stroke(); x.restore();
          T(S.hud, '电位器 = 记忆', kx, ky + kr + v * 2, { f: 'sans', size: v * 1.6, w: 700, c: C.ink, al: 'center', a: pa });
          T(S.hud, '小电机', kx + mo + kr * .85 + v * .8, ky, { f: 'sans', size: v * 1.4, w: 500, c: C.gold, al: 'left', a: pa });
          T(S.hud, 'w = ' + (.42 + .15 * (.5 + .5 * Math.sin(t * 2.4))).toFixed(2), kx, ky - kr - v * 1.6, { f: 'mono', size: v * 1.4, w: 500, c: C.priHi, al: 'center', a: pa });
        }
      }],
      [k4, F.dur, (a) => {
        const PR = P ? { x: G.main.x, y: G.main.y, w: G.main.w, h: G.main.h * .62 } : null;   /* 竖屏：照片压成一条，给方阵和引语留位 */
        const m = X.photo(S, a, 'A02', seg(t, k4, F.dur), { R: PR || undefined, z0: 1.06, z1: 1.12, f0: [.4, .5], depth: .7 });
        const L = ['A', 'B', 'C'], tl = F.kw(4, '认字母'), li = Math.min(2, Math.floor(clamp((t - tl + .3) / 1.1) * 3));
        const qs = v * (P ? 1.8 : 2), qh = fsz(qs) * 1.5 + v * 2 * 2.4 + v * 2.6, gx = P ? W * .08 : G.side.x, gy = P ? PR.y + PR.h + v * 2.2 : G.side.y + G.side.h * .12;
        const gs = P ? Math.min(W * .42, G.bot - gy - qh - v * 6.1) : Math.min(G.side.w * .62, G.side.y + G.side.h - qh - v * 4.6 - gy);   /* 横屏：方阵下面要留出引语卡的位置 */
        const ga = X.SG(t, k4 + .3, k4 + .9) * a;
        if (ga > 0) {
          W3.grid(S, x, gx, gy, gs, X.letter(L[Math.max(0, li)]), t > tl - .3 ? 1 : seg(t, k4 + .3, k4 + 1.2), { a: ga });
          for (let i = 0; i < 8; i++) { const lit = t > tl - .3 && i === [0, 3, 6][Math.max(0, li)]; H.node(S, gx + gs + v * 4, gy + v * 1.5 + i * (gs - v * 3) / 7, v * .8, { lit: lit ? 1 : .08, c: lit ? C.acc : C.pri, a: ga }); }
          T(S.hud, '8 个输出', gx + gs + v * 4, gy + gs + v * 2, { f: 'sans', size: v * 1.25, w: 500, c: C.mute, al: 'center', a: ga });
        }
        const qa = X.SG(t, k4 + 1.2, k4 + 1.9) * a;
        if (qa > 0) QUOTE(S, S.hud, P ? { x: W * .07, y: gy + gs + v * 4.6, w: W * .86 } : { x: G.side.x, y: gy + gs + v * 4.6, w: G.side.w }, '海军发布：能识别{字母}的实验机器', '档案照片原始说明 · 美国海军', qa, { c: C.pri, size: qs });
      }],
    ]);
  },
});
