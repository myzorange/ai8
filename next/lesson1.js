'use strict';
/* 第 1 课 · 一个被等了 66 年的想法（深空全息） */
const L1 = (() => {
  const C = K.c;
  const box = S => S.P ? { x: S.W * .07, y: S.H * .2, w: S.W * .86, h: S.H * .56 } : { x: S.W * .06, y: S.H * .25, w: S.W * .88, h: S.H * .57 };
  const r1 = rng(1234), SNOW = Array.from({ length: 160 }, () => [r1(), r1(), r1(), r1()]);
  const r2 = rng(4321), GAL = Array.from({ length: 1400 }, (_, i) => { const arm = i % 3, d = Math.pow(r2(), .6), a = arm / 3 * TAU + d * 5.2 + (r2() - .5) * .9 * (1 - d * .5); return [Math.cos(a) * d, Math.sin(a) * d, r2(), r2()]; });
  const yrs = [1958, 1969, 1986, 2012, 2017, 2024];

  /* ---------- 公用小部件 ---------- */
  function snow(S, t, amt) {
    if (amt <= 0) return; const x = S.near, { W, H: h, v } = S;
    for (const s of SNOW) {
      const y = ((s[1] + t * (.025 + .05 * s[2])) % 1) * h * 1.1 - h * .05, xx = (s[0] + Math.sin(t * .6 + s[3] * 6) * .015) * W, r = (.5 + s[2] * 1.8) * v * .13;
      x.fillStyle = col('#e4f1ff', amt * (.25 + .55 * s[2])); x.beginPath(); x.arc(xx, y, r, 0, TAU); x.fill();
    }
  }
  function idCard(S, X, Y, w, h, o, a) {
    if (a <= 0) return; const x = S.mid, v = S.v, dy = (1 - a) * v * 2;
    H.panel(S, x, X, Y + dy, w, h, { a, head: o.head });
    const ic = Math.min(h * .5, w * .28), cx = X + v * 1.8 + ic / 2, cy = Y + dy + h * .57;
    x.save(); x.globalAlpha = a; x.beginPath(); x.arc(cx, cy, ic / 2, 0, TAU); x.fillStyle = 'rgba(69,227,255,.08)'; x.fill(); x.strokeStyle = col(C.pri, .6); x.lineWidth = 1; x.stroke(); x.restore();
    H.icon(x, o.icon || 'person', cx - ic * .32, cy - ic * .34, ic * .64, C.priHi, a);
    const tx = cx + ic / 2 + v * 1.6, n1 = v * (S.P ? 2.5 : 2.9), n2 = v * 1.25, n3 = v * 1.6, g1 = fsz(n1), g2 = fsz(n2), g3 = fsz(n3), tot = g1 + g2 + g3 + v * 1.2, y0 = cy - tot / 2;
    T(x, o.name, tx, y0 + g1 / 2, { f: 'sans', size: n1, w: 700, c: C.ink, a });
    T(x, o.en, tx, y0 + g1 + v * .5 + g2 / 2, { f: 'inter', size: n2, w: 600, c: C.mute, a, tr: .04 });
    if (o.sub) T(x, o.sub, tx, y0 + g1 + g2 + v * 1.1 + g3 / 2, { f: 'sans', size: n3, w: 500, c: C.pri, a });
  }
  function timeline(S, x1, x2, y, p, o = {}) {
    const x = S.mid, v = S.v, a = o.a ?? 1, X = yy => lerp(x1, x2, (yy - 1958) / (2024 - 1958)), xe = lerp(x1, x2, p);
    if (a <= 0) return;
    x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .25); x.lineWidth = 1; x.setLineDash([2, 5]); x.beginPath(); x.moveTo(x1, y); x.lineTo(x2, y); x.stroke(); x.setLineDash([]);
    const g = x.createLinearGradient(x1, 0, x2, 0); g.addColorStop(0, col(C.pri, .9)); g.addColorStop(1, col(C.acc, .9));
    x.strokeStyle = g; x.lineWidth = 2; x.beginPath(); x.moveTo(x1, y); x.lineTo(xe, y); x.stroke(); x.restore();
    S.glow.save(); S.glow.globalAlpha = a; S.glow.strokeStyle = col(C.pri, .8); S.glow.lineWidth = 3; S.glow.beginPath(); S.glow.moveTo(x1, y); S.glow.lineTo(xe, y); S.glow.stroke(); S.glow.restore();
    for (const yy of (o.years || (S.P ? [1958, 1986, 2012, 2024] : yrs))) {
      const xx = X(yy), on = xe >= xx - 1, q = on ? 1 : 0, end = yy === 1958 || yy === 2024;
      if (!on && !o.ghost) continue;
      H.node(S, xx, y, v * (end ? 1.1 : .7), { lit: on ? (end ? 1 : .6) : .1, c: yy === 2024 ? C.acc : C.pri, a: a * (on ? 1 : .35) });
      T(x, String(yy), xx + (yy === 1958 ? -v * .6 : yy === 2024 ? v * .6 : 0), y + v * 2.8, { f: 'mono', size: v * (end ? 1.6 : 1.3), w: 500, c: end ? C.ink : C.mute, al: yy === 1958 ? 'left' : yy === 2024 ? 'right' : 'center', a: a * (on ? 1 : .4) });
      if (o.labels && o.labels[yy] && on) T(x, o.labels[yy], xx + (yy === 1958 ? -v * .6 : yy === 2024 ? v * .6 : 0), y - v * 3, { f: 'sans', size: v * 1.8, w: 500, c: yy === 2024 ? C.accHi : C.priHi, al: yy === 1958 ? 'left' : yy === 2024 ? 'right' : 'center', a });
    }
  }
  function perceptron(S, R, t, F) {
    const x = S.mid, v = S.v, t0 = F.cue(1) - .4;
    const ins = [.18, .5, .82].map(f => [R.x + R.w * .14, R.y + R.h * f]), sg = [R.x + R.w * .5, R.y + R.h * .5], out = [R.x + R.w * .87, R.y + R.h * .5];
    const tw = F.kw(1, '权重'), tf = F.kw(1, '几路信号'), ts = F.kw(1, '加起来'), tl = F.kw(1, '灯就亮'), tx = F.kw(1, '猜错了'), ta = F.kw(1, '调粗');
    const wA = [.8, .35, 1.2], wB = [1.25, .15, .9], am = E.io3(seg(t, ta, ta + 1.4)), wts = wA.map((w, i) => lerp(w, wB[i], am));
    const show = i => E.oB(seg(t, t0 + i * .12, t0 + .5 + i * .12), 1.8);
    ins.forEach(([px, py], i) => {
      const a = show(i); if (a <= 0) return;
      H.link(S, px, py, sg[0], sg[1], { w: v * .38 * wts[i] + .8, a: a * .9, p: E.o3(seg(t, t0 + .3, t0 + 1)), flow: t > tf ? .55 : 0, n: 3, dot: v * .32, c: C.pri });
      H.node(S, px, py, v * 2.2, { lit: .55 + .45 * Math.sin(t * 3 + i), a });
      T(x, '信号 ' + (i + 1), px - v * 3.2, py, { f: 'sans', size: v * 1.55, w: 500, c: C.mute, al: 'right', a: a * .9 });
      const wa = E.o3(seg(t, tw + i * .15, tw + .5 + i * .15));
      if (wa > 0) { const fr = S.P ? .32 : .55, mx = lerp(px, sg[0], fr), my = lerp(py, sg[1], fr) - v * (S.P ? 2 : 1.4); H.chip(S, x, '×' + wts[i].toFixed(1), mx, my, { size: v * (S.P ? 1.3 : 1.55), f: 'mono', a: wa, al: 'center', hot: am > 0 && am < 1 }); }
    });
    const sa = show(3); if (sa <= 0) return;
    const sum = E.o3(seg(t, ts, tl)) * (1 - .55 * pulse(t, tx, tx + 1.6)) + .0;
    H.link(S, sg[0], sg[1], out[0], out[1], { w: 2, a: sa, p: E.o3(seg(t, t0 + .5, t0 + 1.1)), flow: t > tl && !(t > tx && t < tx + 1.2) ? .7 : 0, n: 2, dot: v * .35 });
    H.node(S, sg[0], sg[1], v * 4, { lit: .3 + .7 * sum, a: sa });
    T(x, 'Σ', sg[0], sg[1] + v * .1, { f: 'interd', size: v * 3.8, w: 700, c: '#ffffff', al: 'center', a: sa });
    T(x, '加起来', sg[0], sg[1] + v * 6, { f: 'sans', size: v * 1.6, w: 500, c: C.mute, al: 'center', a: sa * .9 });
    // 门槛小表
    const mX = sg[0] + v * 5.6, mY = sg[1] - v * 4, mH = v * 8;
    x.save(); x.globalAlpha = sa; x.strokeStyle = col(C.pri, .5); x.lineWidth = 1; x.strokeRect(mX, mY, v * .9, mH);
    x.fillStyle = col(sum > .62 ? C.ok : C.pri, .85); x.fillRect(mX + 1, mY + mH * (1 - sum), v * .9 - 2, mH * sum);
    x.fillStyle = col(C.acc, .95); x.fillRect(mX - v * .5, mY + mH * .38, v * 1.9, 1.5); x.restore();
    T(x, '门槛', mX + v * 1.5, mY + mH * .38 - v * 1.6, { f: 'sans', size: v * 1.4, w: 500, c: C.accHi, a: sa * .9 });
    // 灯
    const lit = E.o3(seg(t, tl, tl + .25)) * (t > tx && t < tx + 1.2 ? 0 : 1), wrong = pulse(t, tx, tx + 1.2);
    H.node(S, out[0], out[1], v * 3.2, { lit: lit, a: sa, c: wrong > .05 ? C.red : C.gold });
    if (lit > .5) H.rings(S, out[0], out[1], v * 3.2, v * 8, t - tl, { c: C.gold, n: 2, speed: .7 });
    H.icon(x, 'dot', out[0] - v, out[1] - v, v * 2, '#ffffff', lit * .9);
    if (wrong > .05) { T(x, '✕', out[0], out[1], { f: 'interd', size: v * 3.8, w: 900, c: C.red, al: 'center', a: wrong }); T(x, '猜错了', out[0], out[1] - v * 5.6, { f: 'sans', size: v * 1.9, w: 700, c: C.red, al: 'center', a: wrong }); }
    T(x, lit > .5 ? '亮！' : '输出', out[0], out[1] + v * (S.P ? 6.8 : 5.6), { f: 'sans', size: v * 1.7, w: lit > .5 ? 700 : 500, c: lit > .5 ? C.gold : C.mute, al: 'center', a: sa });
    if (am > 0) T(x, '调整权重', sg[0], R.y - v * 1.5, { f: 'sans', size: v * 1.9, w: 700, c: C.accHi, al: 'center', a: Math.min(am * 3, 1) * (1 - seg(t, ta + 2.5, ta + 3)) });
  }
  function xorPlot(S, X, Y, s, t, o) {
    const x = S.mid, v = S.v, a = o.a ?? 1; if (a <= 0) return;
    H.panel(S, x, X, Y, s, s, { a, head: 'XOR · 斜对角', r: 4 });
    const pad = s * .2, px = q => X + pad + q * (s - 2 * pad), py = q => Y + s - pad - q * (s - 2 * pad);
    if (o.line) {
      const ang = o.ang, cx = X + s / 2, cy = Y + s / 2, L = s, dx = Math.cos(ang) * L, dy = Math.sin(ang) * L;
      x.save(); x.globalAlpha = a * o.line; x.beginPath(); x.rect(X, Y, s, s); x.clip();
      x.beginPath(); x.moveTo(cx - dx, cy - dy); x.lineTo(cx + dx, cy + dy); x.lineTo(cx + dx - dy, cy + dy + dx); x.lineTo(cx - dx - dy, cy - dy + dx); x.closePath(); x.fillStyle = col(C.pri, .1); x.fill();
      x.beginPath(); x.moveTo(cx - dx, cy - dy); x.lineTo(cx + dx, cy + dy); x.lineTo(cx + dx + dy, cy + dy - dx); x.lineTo(cx - dx + dy, cy - dy - dx); x.closePath(); x.fillStyle = col(C.acc, .1); x.fill();
      x.beginPath(); x.moveTo(cx - dx, cy - dy); x.lineTo(cx + dx, cy + dy); x.strokeStyle = col('#ffffff', .9); x.lineWidth = 2; x.stroke(); x.restore();
      S.glow.save(); S.glow.globalAlpha = a * o.line; S.glow.beginPath(); S.glow.rect(X, Y, s, s); S.glow.clip(); S.glow.beginPath(); S.glow.moveTo(cx - dx, cy - dy); S.glow.lineTo(cx + dx, cy + dy); S.glow.strokeStyle = col(C.priHi, .8); S.glow.lineWidth = 3; S.glow.stroke(); S.glow.restore();
    }
    if (o.curve) {
      x.save(); x.globalAlpha = a * o.curve; x.strokeStyle = col(C.ok, .95); x.lineWidth = 2; x.setLineDash([]);
      for (const k of [-1, 1]) { x.beginPath(); x.moveTo(px(-.05), py(.5 + k * .38)); x.quadraticCurveTo(px(.5), py(.5 + k * .02), px(1.05), py(.5 - k * .38)); x.stroke(); }
      x.fillStyle = col(C.ok, .07); x.beginPath(); x.moveTo(px(-.05), py(.88)); x.quadraticCurveTo(px(.5), py(.52), px(1.05), py(.12)); x.lineTo(px(1.05), py(.88 - .76)); x.restore();
    }
    [[0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1]].forEach(([qx, qy, k], i) => {
      const cx = px(qx), cy = py(qy), r = v * 1.15, ap = a * E.oB(seg(t, (o.t0 || 0) + i * .1, (o.t0 || 0) + .4 + i * .1), 2);
      x.save(); x.globalAlpha = ap; x.beginPath(); if (k) { x.moveTo(cx, cy - r * 1.2); x.lineTo(cx + r * 1.2, cy); x.lineTo(cx, cy + r * 1.2); x.lineTo(cx - r * 1.2, cy); x.closePath(); } else x.arc(cx, cy, r, 0, TAU);
      x.fillStyle = col(k ? C.acc : C.pri, .9); x.fill(); x.restore();
      S.glow.save(); S.glow.globalAlpha = ap; S.glow.beginPath(); S.glow.arc(cx, cy, r * 1.4, 0, TAU); S.glow.fillStyle = col(k ? C.acc : C.pri, .8); S.glow.fill(); S.glow.restore();
    });
    if (o.fail > 0) T(x, '✕', X + s - v * 2.4, Y + v * 2.4, { f: 'interd', size: v * 2.6, w: 900, c: C.red, al: 'center', a: a * o.fail });
    if (o.ok > 0) T(x, '✓', X + s - v * 2.4, Y + v * 2.4, { f: 'interd', size: v * 2.6, w: 900, c: C.ok, al: 'center', a: a * o.ok });
  }
  function bar(S, X, Y0, w, hMax, val, max, p, o) {
    const x = S.mid, v = S.v, hh = hMax * (val / max) * E.o3(p), c = o.c || C.pri; if (o.a <= 0) return;
    x.save(); x.globalAlpha = o.a ?? 1; const g = x.createLinearGradient(0, Y0 - hh, 0, Y0); g.addColorStop(0, col(c, .95)); g.addColorStop(1, col(c, .25));
    x.fillStyle = g; x.fillRect(X, Y0 - hh, w, hh); x.strokeStyle = col(c, .9); x.lineWidth = 1; x.strokeRect(X, Y0 - hh, w, hh); x.restore();
    S.glow.save(); S.glow.globalAlpha = (o.a ?? 1) * .7; S.glow.fillStyle = col(c, .6); S.glow.fillRect(X, Y0 - hh, w, 3); S.glow.restore();
    T(x, (val * E.o3(p)).toFixed(1) + '%', X + w / 2, Y0 - hh - v * 2.2, { f: 'interd', size: v * 3, w: 700, c: o.hot ? C.accHi : C.ink, al: 'center', a: (o.a ?? 1) * seg(p, .2, .6) });
    T(x, o.label, X + w / 2, Y0 + v * 2.3, { f: 'sans', size: v * 1.8, w: o.hot ? 700 : 500, c: o.hot ? C.accHi : C.mute, al: 'center', a: o.a ?? 1 });
  }
  const shake = (t, t0, amp) => { const q = 1 - seg(t, t0, t0 + .7); return q <= 0 || t < t0 ? [0, 0] : [Math.sin(t * 71) * amp * q, Math.cos(t * 53) * amp * q]; };

  /* ---------- 片头 ---------- */
  const intro = {
    dur: 5.2, tdur: .9, sfx: [[0, 'rise'], [1.45, 'impact']],
    camera: t => ({ z: 1 + .05 * E.ioS(clamp(t / 5.2)) }),
    draw(t, S) {
      const { W, H: h, P, v } = S, cx = W / 2, cy = h * (P ? .46 : .5), m = S.mid, gx = S.glow;
      H.bg(S, t, { neb: .55 + .45 * seg(t, 1.4, 2.4) });
      const pin = seg(t, 0, 1.45);
      if (pin < 1) for (let i = 0; i < 90; i++) {
        const an = i / 90 * TAU + i * .37, d = (P ? W * .95 : W * .62) * (.55 + .45 * ((i * 53) % 17) / 17) * (1 - E.i3(pin)), px = cx + Math.cos(an) * d, py = cy + Math.sin(an) * d * .62;
        m.fillStyle = col(i % 5 ? C.pri : C.acc, .8 * seg(t, 0, .4)); m.beginPath(); m.arc(px, py, 1.3, 0, TAU); m.fill();
        gx.fillStyle = col(i % 5 ? C.pri : C.acc, .7); gx.beginPath(); gx.arc(px, py, 2.5, 0, TAU); gx.fill();
      }
      if (t > 1.45) { H.rings(S, cx, cy, v * 2, P ? W * .75 : W * .5, t - 1.45, { n: 3, speed: .45, tilt: .35, a: 1 - seg(t, 3.6, 5) }); haze(gx, cx, cy, v * 5 + v * 18 * (1 - seg(t, 1.5, 2.6)), C.priHi, .55 * (1 - seg(t, 1.5, 3.0))); }
      const st = pulse(t, 1.4, 3.6); if (st > 0) { const g = gx.createLinearGradient(cx - W * .5, 0, cx + W * .5, 0); g.addColorStop(0, col(C.pri, 0)); g.addColorStop(.5, col(C.priHi, .9 * st)); g.addColorStop(1, col(C.pri, 0)); gx.fillStyle = g; gx.fillRect(cx - W * .5, cy - 1.5, W, 3); }
      const x = S.hud, ta = E.o3(seg(t, .3, 1.0));
      T(x, decode('LESSON 01  ·  AI 简史', seg(t, .3, 1.3) * 1.2, 3), cx, cy - (P ? W * .22 : h * .14), { f: 'mono', size: v * (P ? 1.8 : 1.9), w: 500, c: C.pri, al: 'center', tr: .22, a: ta });
      const lines = P ? ['一个被等了', '66 年的想法'] : ['一个被等了 66 年的想法'], sz = P ? W * .125 : h * .1, p = seg(t, 1.5, 2.5);
      lines.forEach((s, i) => {
        const yy = cy + (i - (lines.length - 1) / 2) * sz * 1.18, q = clamp(p * 1.4 - i * .3);
        TReveal(x, s, cx - 2, yy, { f: 'smiley', size: sz, c: C.acc, a: .55, al: 'center' }, q); TReveal(x, s, cx + 2, yy, { f: 'smiley', size: sz, c: C.pri, a: .55, al: 'center' }, q);
        TReveal(x, s, cx, yy, { f: 'smiley', size: sz, c: C.ink, al: 'center', sh: { c: C.pri, a: .6, b: 24 } }, q);
      });
      const la = E.o3(seg(t, 2.3, 3.0)), lw = (P ? W * .32 : W * .2) * la, ly = cy + (lines.length * sz * .59) + v * 3;
      x.save(); x.fillStyle = col(C.pri, .7 * la); x.fillRect(cx - lw, ly, lw * 2, 1); x.restore();
      const subS = '感知机 · AI 寒冬 · AlexNet · Transformer'; T(x, subS, cx, ly + v * 3, { f: 'sans', size: fit(x, subS, W * .86, { f: 'sans', size: v * (P ? 1.7 : 1.9), w: 500, tr: .08 }), w: 500, c: C.mute, al: 'center', tr: .08, a: la });
    },
  };

  /* ---------- 各幕 ---------- */
  const code = [
    { // 序
      tin: { type: 'fade' }, lead: .9, tail: 1.4, mood: 'main',
      camera: (t, S, F) => ({ z: 1 + .045 * E.ioS(clamp(t / F.dur)) }),
      draw(t, S, F) {
        H.bg(S, t, {}); const { W, H: h, P, v } = S, b = box(S), x = S.mid, cx = W / 2, cy = P ? h * .4 : h * .47;
        const lit = .12 + .88 * E.o3(seg(t, F.kw(1, '认可'), F.end(1) + .3)), oy = P ? h * .36 : h * .41, orR = v * (P ? 4.6 : 5.0);
        // 等待之环
        const wp = seg(t, .4, F.dur), ra = orR * 2.0;
        for (const [rr, sp] of [[ra * 1.32, .12], [ra * 1.62, -.07]]) { x.save(); x.translate(cx, oy); x.rotate(t * sp); x.setLineDash([2, 7]); x.strokeStyle = col(C.pri, .2); x.lineWidth = 1; x.beginPath(); x.arc(0, 0, rr, 0, TAU); x.stroke(); x.restore(); }
        x.save(); x.strokeStyle = col(C.pri, .18); x.lineWidth = 1; x.beginPath(); x.arc(cx, oy, ra, 0, TAU); x.stroke();
        x.strokeStyle = col(C.priHi, .9); x.lineWidth = 2; x.beginPath(); x.arc(cx, oy, ra, -Math.PI / 2, -Math.PI / 2 + TAU * wp); x.stroke(); x.restore();
        S.glow.save(); S.glow.strokeStyle = col(C.pri, .8); S.glow.lineWidth = 3; S.glow.beginPath(); S.glow.arc(cx, oy, ra, -Math.PI / 2, -Math.PI / 2 + TAU * wp); S.glow.stroke(); S.glow.restore();
        for (let i = 0; i < 60; i++) { const an = -Math.PI / 2 + i / 60 * TAU, r0 = ra + v * (i % 5 ? .5 : 1.1); x.strokeStyle = col(C.pri, i / 60 <= wp ? .6 : .15); x.lineWidth = 1; x.beginPath(); x.moveTo(cx + Math.cos(an) * ra * 1.04, oy + Math.sin(an) * ra * 1.04); x.lineTo(cx + Math.cos(an) * r0 * 1.04, oy + Math.sin(an) * r0 * 1.04); x.stroke(); }
        H.node(S, cx, oy, orR, { lit });
        T(S.mid, '一个想法', cx, oy + ra * 1.62 + v * 2.4, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, al: 'center', tr: .2, a: E.o3(seg(t, .6, 1.4)) });
        // 时间线
        const ty = P ? h * .7 : h * .79, x1 = b.x + b.w * .04, x2 = b.x + b.w * .96, p = E.io3(seg(t, F.cue(1) + .2, F.kw(1, '六十六年') + .2));
        timeline(S, x1, x2, ty, p, { a: E.o3(seg(t, F.cue(1) - .2, F.cue(1) + .4)), ghost: true });
        const ca = E.o3(seg(t, F.cue(1), F.cue(1) + .6)), nYear = Math.round(66 * E.io3(seg(t, F.cue(1) + .2, F.kw(1, '六十六年') + .2)));
        T(S.hud, String(nYear), W * .5, ty - v * (P ? 7 : 7.4), { f: 'interd', size: v * (P ? 6.4 : 7), w: 700, c: nYear >= 66 ? C.accHi : C.ink, al: 'center', a: ca, sh: { c: nYear >= 66 ? C.acc : C.pri, a: .6, b: 20 } });
        T(S.hud, '年', W * .5 + v * (P ? 5.6 : 6), ty - v * (P ? 6 : 6.3), { f: 'sans', size: v * 2, w: 500, c: C.mute, a: ca });
      },
    },
    { // 第一幕 · 感知机
      tin: { type: 'iris', x: .5, y: .44 }, year: 1958, mood: 'main',
      camera: (t, S, F) => ({ z: 1 + .03 * E.ioS(clamp(t / F.dur)), x: lerp(-.006, .006, E.ioS(clamp(t / F.dur))) * S.W }),
      draw(t, S, F) {
        H.bg(S, t, {}); const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        const ca = E.o3(seg(t, .4, 1.1)) * (P ? 1 - .0 * seg(t, F.cue(1) - .5, F.cue(1)) : 1);
        const card = P ? { x: b.x, y: b.y - v * 2, w: b.w, h: v * 13 } : { x: b.x, y: b.y + v * 1, w: b.w * .37, h: v * 18 };
        idCard(S, card.x, card.y, card.w, card.h, { name: '罗森布拉特', en: 'FRANK ROSENBLATT', sub: '心理学家 · 30 岁', head: 'PROFILE // 1958' }, ca);
        const ka = E.oB(seg(t, F.kw(0, '感知机') - .1, F.kw(0, '感知机') + .5), 1.8);
        if (ka > 0) H.chip(S, x, '感知机 Perceptron', card.x + (P ? card.w / 2 : 0), card.y + card.h + v * 3.6, { size: v * 2.2, hot: true, a: Math.min(1, ka), al: P ? 'center' : 'left' });
        // Mark I 光电管阵列（第一句时）
        const R = P ? { x: b.x, y: b.y + b.h * .42, w: b.w, h: b.h * .58 } : { x: b.x + b.w * .42, y: b.y, w: b.w * .58, h: b.h };
        const ga = E.o3(seg(t, 1.0, 1.8)) * (1 - E.o3(seg(t, F.cue(1) - .9, F.cue(1) - .2)));
        if (ga > 0) {
          const n = 12, s = Math.min(R.w, R.h) * (P ? .8 : .86), gx0 = R.x + R.w / 2 - s / 2, gy0 = R.y + R.h / 2 - s / 2 - (P ? v * 0 : 0), st = s / n;
          H.panel(S, x, gx0 - v, gy0 - v * 2.6, s + 2 * v, s + v * 3.6, { a: ga, head: 'MARK I · 400 个光电管' });
          const scan = seg(t, 1.6, F.cue(1) - 1);
          for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
            const inTri = j >= 2 && j <= 9 && Math.abs(i - 5.5) <= (j - 2) * .62 + .3, on = inTri && (i + j) / (2 * n) < scan * 1.2;
            x.fillStyle = col(on ? C.priHi : C.pri, ga * (on ? .95 : .14)); x.beginPath(); x.arc(gx0 + st * (i + .5), gy0 + st * (j + .5) + v * .2, st * (on ? .3 : .2), 0, TAU); x.fill();
            if (on) { S.glow.fillStyle = col(C.pri, ga * .7); S.glow.beginPath(); S.glow.arc(gx0 + st * (i + .5), gy0 + st * (j + .5), st * .45, 0, TAU); S.glow.fill(); }
          }
        }
        perceptron(S, P ? { x: b.x + b.w * .02, y: b.y + b.h * .5, w: b.w * 1.0, h: b.h * .52 } : { x: b.x + b.w * .43, y: b.y + b.h * .08, w: b.w * .57, h: b.h * .86 }, t, F);
      },
    },
    { // 第二幕 · 报纸沸腾
      tin: { type: 'wipe', ang: -.4 }, year: 1958, yearO: { at: 9 }, mood: 'main',
      camera: (t, S, F) => ({ z: 1.02 + .03 * E.ioS(clamp(t / F.dur)), r: -.004 + .008 * E.ioS(clamp(t / F.dur)) }),
      draw(t, S, F) {
        H.bg(S, t, {}); const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        const pa = E.o3(seg(t, .3, 1.1)), np = P ? { x: b.x, y: b.y - v * 2, w: b.w, h: b.h * .52 } : { x: b.x, y: b.y - v, w: b.w * .54, h: b.h * 1.02 };
        x.save(); x.translate(np.x + np.w / 2, np.y + np.h / 2); x.rotate(-.025 * (1 - pa * .3)); x.translate(-(np.x + np.w / 2), -(np.y + np.h / 2) + (1 - pa) * v * 3);
        H.panel(S, x, np.x, np.y, np.w, np.h, { a: pa, head: 'NEWS // 1958.07.08' });
        const ix = np.x + v * 1.6, iw = np.w - v * 3.2;
        T(x, '《纽约时报》', np.x + np.w / 2, np.y + v * 5.4, { f: 'sans', size: v * (P ? 2.6 : 3), w: 900, c: C.ink, al: 'center', a: pa, tr: .1 });
        x.save(); x.globalAlpha = pa; x.fillStyle = col(C.pri, .6); x.fillRect(ix, np.y + v * 8.2, iw, 1.2); x.fillRect(ix, np.y + v * 8.7, iw, .6); x.restore();
        const hl = 'NEW NAVY DEVICE LEARNS BY DOING', hs = fit(x, hl, iw * .96, { f: 'interd', size: v * (P ? 2.4 : 3.2), w: 900 });
        TReveal(x, hl, np.x + np.w / 2, np.y + v * 11.6, { f: 'interd', size: hs, w: 900, c: C.priHi, al: 'center', sh: { c: C.pri, a: .6, b: 14 } }, seg(t, .9, 2.2));
        T(x, '海军新装置：边做边学', np.x + np.w / 2, np.y + v * 15, { f: 'sans', size: v * 1.9, w: 500, c: C.mute, al: 'center', a: E.o3(seg(t, 1.8, 2.5)) });
        const rows = P ? 3 : 7; for (let r = 0; r < rows; r++) for (let cI = 0; cI < 2; cI++) {
          const cx0 = ix + cI * (iw / 2 + v * .5), cw = iw / 2 - v * .5, yy = np.y + v * 18.5 + r * v * 2.6, ln = (r * 7 + cI * 3) % 5 === 0 ? .6 : 1;
          if (yy > np.y + np.h - v * 1.5) continue; x.save(); x.globalAlpha = pa * .35 * E.o3(seg(t, 1.6 + r * .08, 2.2 + r * .08)); x.fillStyle = col(C.pri, .7); x.fillRect(cx0, yy, cw * ln, v * .7); x.restore();
        }
        x.restore();
        // 预言
        const chips = [['会走路', F.kw(0, '走路')], ['会说话', F.kw(0, '说话')], ['意识到自己的存在', F.kw(0, '意识到')]];
        chips.forEach(([s, tt], i) => {
          const a = E.oB(seg(t, tt - .1, tt + .45), 2); if (a <= 0) return;
          const X = P ? b.x + b.w / 2 : b.x + b.w * .62, Y = P ? b.y + b.h * .6 + i * v * 6.2 : b.y + b.h * .1 + i * v * 7;
          H.chip(S, x, s, X, Y, { size: v * (P ? 2.1 : 2.5), hot: i === 2, a: Math.min(1, a), al: P ? 'center' : 'left' });
        });
        // 期望表
        const ga = E.o3(seg(t, F.cue(1) - .3, F.cue(1) + .4)); if (ga > 0) {
          const gcx = P ? b.x + b.w / 2 : b.x + b.w * .8, gcy = P ? b.y + b.h * 1.04 : b.y + b.h * .95, gr = P ? v * 8.5 : v * 11, val = E.oB(seg(t, F.cue(1), F.kw(1, '眼前') + .3), 1.2);
          x.save(); x.globalAlpha = ga; x.lineCap = 'round'; x.lineWidth = v * .9; x.strokeStyle = col(C.pri, .15); x.beginPath(); x.arc(gcx, gcy, gr, Math.PI, TAU); x.stroke();
          const g = x.createLinearGradient(gcx - gr, 0, gcx + gr, 0); g.addColorStop(0, col(C.pri, 1)); g.addColorStop(1, col(C.acc, 1));
          x.strokeStyle = g; x.beginPath(); x.arc(gcx, gcy, gr, Math.PI, Math.PI + Math.PI * clamp(val, 0, 1.04)); x.stroke(); x.restore();
          const na = Math.PI + Math.PI * clamp(val, 0, 1.04); x.save(); x.globalAlpha = ga; x.strokeStyle = '#ffffff'; x.lineWidth = 2; x.beginPath(); x.moveTo(gcx, gcy); x.lineTo(gcx + Math.cos(na) * gr * .85, gcy + Math.sin(na) * gr * .85); x.stroke(); x.restore();
          T(x, Math.round(clamp(val, 0, 1) * 100) + '%', gcx, gcy - gr * .36, { f: 'interd', size: v * 3.4, w: 700, c: val > .95 ? C.accHi : C.ink, al: 'center', a: ga });
          T(x, '大家的期望', gcx, gcy + v * 2.2, { f: 'sans', size: v * 1.7, w: 500, c: C.mute, al: 'center', a: ga });
          if (val > .97) H.rings(S, gcx, gcy - gr * .35, v * 3, v * 9, t - F.kw(1, '眼前'), { c: C.acc, n: 2, speed: .8 });
        }
      },
    },
    { // 第三幕 · 寒冬
      tin: { type: 'fade' }, year: 1969, mood: 'cold',
      camera: (t, S, F) => { const [sx, sy] = shake(t, F.kw(0, '致命'), S.v * .5); return { z: 1 + .03 * E.ioS(clamp(t / F.dur)), x: sx, y: sy }; },
      draw(t, S, F) {
        const cold = E.io3(seg(t, F.cue(2) - .2, F.cue(2) + 2.2)); H.bg(S, t, { cold });
        const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        const ba = E.o3(seg(t, .3, 1.0)) * (P ? 1 - E.o3(seg(t, F.cue(1) - .4, F.cue(1) + .2)) : 1 - .55 * seg(t, F.cue(2), F.cue(2) + 1));
        const bk = P ? { x: b.x, y: b.y - v * 2, w: b.w, h: v * 14 } : { x: b.x, y: b.y + v * 1, w: b.w * .4, h: v * 20 };
        if (ba > 0) {
          H.panel(S, x, bk.x, bk.y, bk.w, bk.h, { a: ba, head: 'BOOK // MIT 1969' });
          const ic = Math.min(bk.h * .5, v * 9); H.icon(x, 'book', bk.x + v * 1.8, bk.y + bk.h * .56 - ic / 2, ic, C.priHi, ba);
          const tx = bk.x + v * 3.4 + ic, g1 = fsz(v * (P ? 2.5 : 2.9)), g2 = fsz(v * 1.25), g3 = fsz(v * 1.6), y0 = bk.y + bk.h * .57 - (g1 + g2 + g3 + v * 1.2) / 2;
          T(x, '《感知机》', tx, y0 + g1 / 2, { f: 'sans', size: v * (P ? 2.5 : 2.9), w: 700, c: C.ink, a: ba });
          T(x, 'PERCEPTRONS', tx, y0 + g1 + v * .5 + g2 / 2, { f: 'inter', size: v * 1.25, w: 600, c: C.mute, a: ba, tr: .12 });
          T(x, '明斯基 & 佩珀特', tx, y0 + g1 + g2 + v * 1.1 + g3 / 2, { f: 'sans', size: v * 1.6, w: 500, c: C.pri, a: ba });
          const ka = E.oB(seg(t, F.kw(0, '致命') - .1, F.kw(0, '致命') + .4), 2);
          if (ka > 0) H.chip(S, x, '⚠ 致命的问题', bk.x + (P ? bk.w / 2 : bk.w * .0), bk.y + bk.h + v * 3.6, { size: v * 2.1, hot: true, a: Math.min(1, ka) * (1 - seg(t, F.cue(2), F.cue(2) + .8)), al: P ? 'center' : 'left' });
        }
        const s = P ? Math.min(b.w * .78, b.h * .62) : Math.min(b.h * .98, b.w * .44), X = P ? b.x + b.w / 2 - s / 2 : b.x + b.w * .56, Y = P ? b.y + b.h * .3 : b.y;
        const t1 = F.cue(1), tl = F.kw(1, '一条直线'), td = F.kw(1, '斜对角');
        const angs = [-.5, .75, 0, 1.57, -.5], step = Math.max(.9, (F.end(1) - td) / 4.2), ai = clamp((t - td) / step, 0, 4), k0 = Math.floor(ai), fr = E.io3(ai - k0);
        const ang = t < td ? -.5 : lerp(angs[k0], angs[Math.min(4, k0 + 1)], fr), fail = t > td + step * .7 && t < F.end(1) + 1.5 ? .6 + .4 * Math.abs(Math.sin((t - td) / step * Math.PI)) : 0;
        const xa = E.o3(seg(t, t1 - .4, t1 + .3)) * (1 - .78 * seg(t, F.cue(2) + .5, F.cue(2) + 1.5));
        xorPlot(S, X, Y, s, t, { a: xa, t0: t1, line: E.o3(seg(t, tl - .1, tl + .4)), ang, fail: fail * xa });
        if (t > td) T(x, '试了 ' + Math.min(4, Math.floor((t - td) / step) + 1) + ' 次 · 分不开', X + s / 2, Y + s + v * 2.8, { f: 'sans', size: v * 1.9, w: 700, c: C.red, al: 'center', a: xa * seg(t, td + step * .7, td + step * .9) });
        // 寒冬
        snow(S, t, cold); const wa = E.o3(seg(t, F.kw(2, '寒冬') - .3, F.kw(2, '寒冬') + .5));
        const fa = E.o3(seg(t, F.cue(2), F.cue(2) + .6));
        if (fa > 0) {
          const fx = b.x, fy = P ? b.y - v * 1 : b.y + b.h * .58, fw = P ? b.w : b.w * .4, fund = 1 - .88 * E.io3(seg(t, F.cue(2) + .2, F.kw(2, '研究者')));
          H.panel(S, x, fx, fy, fw, v * 10, { a: fa, head: 'FUNDING // 经费', c: C.cold });
          x.save(); x.globalAlpha = fa; x.fillStyle = col(C.cold, .15); x.fillRect(fx + v * 1.6, fy + v * 4.6, fw - v * 3.2, v * 2.2); x.fillStyle = col(fund < .3 ? C.red : C.cold, .9); x.fillRect(fx + v * 1.6, fy + v * 4.6, (fw - v * 3.2) * fund, v * 2.2); x.restore();
          T(x, Math.round(fund * 100) + '%', fx + fw - v * 1.6, fy + v * 1.8, { f: 'mono', size: v * 1.5, w: 500, c: fund < .3 ? C.red : C.cold, al: 'right', a: fa });
          for (let i = 0; i < 5; i++) { const lv = seg(t, F.kw(2, '研究者') + i * .25, F.kw(2, '研究者') + .9 + i * .25); H.icon(x, 'person', fx + v * 1.6 + i * v * 4.4 + lv * v * 8, fy + v * 11.5, v * 3.4, C.cold, fa * (1 - lv) * .8); }
        }
        if (wa > 0) {
          const wx = P ? W / 2 : b.x + b.w * .56 + s / 2, wy = P ? b.y + b.h * .62 : b.y + b.h * .45;
          T(S.hud, 'AI WINTER', wx, wy, { f: 'interd', size: v * (P ? 5 : 6.6), w: 900, c: '#e9f4ff', al: 'center', tr: .18, a: wa, sh: { c: '#9fd8ff', a: .8, b: 26 } });
          T(S.hud, '第一个寒冬', wx, wy + v * (P ? 5.2 : 6.4), { f: 'sans', size: v * 2.5, w: 700, c: C.cold, al: 'center', tr: .3, a: wa });
        }
      },
    },
    { // 第四幕 · 告别
      tin: { type: 'fade' }, tdur: 1.1, year: 1971, mood: 'cold', lead: 1.0, tail: 1.8,
      camera: (t, S, F) => ({ z: 1.07 - .07 * E.ioS(clamp(t / F.dur)), y: lerp(-.01, .01, E.ioS(clamp(t / F.dur))) * S.H }),
      draw(t, S, F) {
        H.bg(S, t, { cold: 1, neb: .55, starA: .8 }); const { W, H: h, P, v } = S, x = S.mid, fx = S.far, hy = P ? h * .6 : h * .64;
        // 月亮与倒影
        const mx = P ? W * .2 : W * .24, my = hy - v * (P ? 15 : 12), mr = v * (P ? 2.8 : 4.2);
        haze(fx, mx, my, mr * 7, '#9fc4ff', .2); const mg = fx.createRadialGradient(mx - mr * .3, my - mr * .3, mr * .1, mx, my, mr); mg.addColorStop(0, '#ffffff'); mg.addColorStop(1, '#cfe2ff'); fx.beginPath(); fx.arc(mx, my, mr, 0, TAU); fx.fillStyle = mg; fx.fill(); S.glow.beginPath(); S.glow.arc(mx, my, mr * 1.2, 0, TAU); S.glow.fillStyle = 'rgba(220,235,255,.32)'; S.glow.fill();
        for (let i = 0; i < 18; i++) { const yy = hy + v * .8 + i * v * (P ? .9 : 1.0), ww = mr * (1.6 - i * .06) * (1 + .3 * Math.sin(t * 1.3 + i * 1.7)); x.fillStyle = col('#dcebff', .32 * (1 - i / 18)); x.fillRect(mx - ww / 2, yy, ww, Math.max(1, v * .18)); }
        const g = x.createLinearGradient(0, hy - v * 10, 0, hy); g.addColorStop(0, 'rgba(120,150,190,0)'); g.addColorStop(1, 'rgba(120,150,190,.16)'); x.fillStyle = g; x.fillRect(-W * .1, hy - v * 10, W * 1.2, v * 10);
        const gw = x.createLinearGradient(0, hy, 0, h); gw.addColorStop(0, 'rgba(10,18,32,.55)'); gw.addColorStop(1, 'rgba(2,4,9,.9)'); x.fillStyle = gw; x.fillRect(-W * .1, hy, W * 1.2, h - hy);
        x.fillStyle = col(C.cold, .55); x.fillRect(-W * .1, hy, W * 1.2, 1);
        for (let i = 1; i < 16; i++) { const yy = hy + i * i * v * .15, off = Math.sin(t * .6 + i) * v * 5; x.fillStyle = col(C.cold, .12 * (1 - i / 16)); x.fillRect(W * .05 + off, yy, W * .9, .8); }
        // 小船
        const bx = lerp(W * (P ? .58 : .62), W * (P ? .7 : .74), seg(t, 0, F.dur)), ba = (1 - seg(t, F.cue(0) + 3.5, F.dur - .5)) * E.o3(seg(t, .3, 1.5)), bs = v * (P ? 6 : 7);
        H.icon(x, 'boat', bx - bs / 2, hy - bs * .92, bs, '#cfe0f2', ba * .9, 1.3);
        x.save(); x.translate(0, hy * 2); x.scale(1, -1); H.icon(x, 'boat', bx - bs / 2, hy - bs * .92, bs, '#cfe0f2', ba * .22, 1.3); x.restore();
        // 文字
        const ta = E.o3(seg(t, F.cue(0) + .6, F.cue(0) + 1.8)), ty = P ? h * .27 : h * .28;
        T(S.hud, 'FRANK ROSENBLATT', W / 2, ty, { f: 'inter', size: v * 1.7, w: 600, c: C.cold, al: 'center', tr: .32, a: ta });
        T(S.hud, '1928 — 1971', W / 2, ty + v * 5.6, { f: 'interd', size: v * (P ? 5.6 : 6.8), w: 700, c: '#eef6ff', al: 'center', tr: .05, a: ta, sh: { c: '#9fd8ff', a: .45, b: 22 } });
        const oa = E.o3(seg(t, F.cue(1) - .4, F.cue(1) + 1.2)); if (oa > 0) {
          const ox = W / 2, oy = hy - v * (P ? 6 : 6.5); H.node(S, ox, oy, v * 1.9, { lit: .4 + .25 * Math.sin(t * 2.2), a: oa, c: C.priHi });
          H.rings(S, ox, oy, v * 2, v * 7, t, { c: C.priHi, n: 2, speed: .3, a: oa * .6 });
          T(S.hud, '他是对的', ox, oy - v * 4.4, { f: 'sans', size: v * 2.3, w: 500, c: C.priHi, al: 'center', tr: .45, a: oa * E.o3(seg(t, F.end(1) - .6, F.end(1) + .4)) });
        }
        // 薄雾
        const nx = S.near; for (let i = 0; i < 3; i++) { const yy = hy + v * (-3 + i * 3), off = ((t * (.012 + i * .006) + i * .3) % 1.4 - .2) * W; const gg = nx.createLinearGradient(off - W * .4, 0, off + W * .4, 0); gg.addColorStop(0, 'rgba(180,205,235,0)'); gg.addColorStop(.5, 'rgba(180,205,235,.06)'); gg.addColorStop(1, 'rgba(180,205,235,0)'); nx.fillStyle = gg; nx.fillRect(off - W * .4, yy - v * 1.5, W * .8, v * 3); }
        snow(S, t, .3);
      },
    },
    { // 第五幕 · 冷板凳
      tin: { type: 'fade' }, mood: 'cold', hud: true,
      camera: (t, S, F) => ({ z: 1 + .035 * E.ioS(clamp(t / F.dur)) }),
      draw(t, S, F) {
        const cold = 1 - .7 * E.io3(seg(t, F.cue(1), F.cue(1) + 3)); H.bg(S, t, { cold }); const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        H.year(S, t, 1986, { from: 1971, at: .4 });
        const L0 = P ? { x: b.x + b.w * .5, y: b.y + b.h * .3 } : { x: b.x + b.w * .2, y: b.y + b.h * .58 };
        const ka = E.o3(seg(t, .3, 1.2)) * (1 - (P ? E.o3(seg(t, F.cue(1) - .4, F.cue(1) + .3)) : .45 * seg(t, F.cue(1), F.cue(1) + 1) + .35 * seg(t, F.cue(2) - .4, F.cue(2) + .4)));
        if (ka > 0) {
          const bs = v * (P ? 13 : 15); H.icon(x, 'bench', L0.x - bs / 2, L0.y - bs * .2, bs, C.cold, ka * .9, 1.2);
          H.icon(x, 'person', L0.x - bs * .24, L0.y - bs * .62, bs * .5, C.priHi, ka); H.node(S, L0.x - bs * .0, L0.y - bs * .66, v * .4, { lit: 1, a: ka, c: C.priHi });
          for (let i = 0; i < 6; i++) { const lv = seg(t, F.kw(0, '都走了') - .6 + i * .18, F.kw(0, '都走了') + 1.2 + i * .18); H.icon(x, 'person', L0.x + bs * (.6 + i * .32) + lv * W * .25, L0.y - bs * .5, bs * .42, C.cold, ka * (1 - lv) * (lv > 0 ? .7 : .35)); }
          const ia = E.oB(seg(t, F.kw(0, '辛顿') - .1, F.kw(0, '辛顿') + .45), 1.8);
          if (ia > 0) H.chip(S, x, '辛顿 Geoffrey Hinton · 英国', L0.x, L0.y + bs * .82, { size: v * 1.9, a: Math.min(1, ia) * ka * (1 - seg(t, F.cue(2) - .5, F.cue(2) + .2)), al: 'center' });
          const ya = E.o3(seg(t, F.kw(0, '几十年') - .2, F.kw(0, '几十年') + .5)); if (ya > 0) T(x, '冷板凳 · 几十年', L0.x, L0.y - bs * .9, { f: 'sans', size: v * 1.9, w: 500, c: C.cold, al: 'center', tr: .25, a: ya * ka });
        }
        // 多层网络
        const na = E.o3(seg(t, F.cue(1) - .3, F.cue(1) + .5)) * (1 - .55 * seg(t, F.cue(2) + .4, F.cue(2) + 1.6));
        if (na > 0) {
          const R = P ? { x: b.x + b.w * .04, y: b.y + b.h * .04, w: b.w * .92, h: b.h * .6 } : { x: b.x + b.w * .44, y: b.y - b.h * .02, w: b.w * .56, h: b.h * .74 };
          const lay = [2, 3, 1], pos = lay.map((n, li) => Array.from({ length: n }, (_, j) => [R.x + R.w * (.1 + li * .4), R.y + R.h * ((j + 1) / (n + 1))]));
          const tm = F.kw(1, '多层'), back = seg(t, tm + .4, tm + 2.2), fwd = seg(t, tm + 2.2, tm + 3.8);
          for (let li = 0; li < 2; li++) pos[li].forEach(p0 => pos[li + 1].forEach(p1 => {
            H.link(S, p0[0], p0[1], p1[0], p1[1], { w: 1.2, a: na * .8, p: E.o3(seg(t, F.cue(1), F.cue(1) + .8)), c: C.pri });
            if (back > 0 && back < 1) { const q = 1 - (back * 2 - (1 - li)) ; if (q >= 0 && q <= 1) { const px = lerp(p0[0], p1[0], q), py = lerp(p0[1], p1[1], q); x.fillStyle = col(C.acc, .95); x.beginPath(); x.arc(px, py, v * .45, 0, TAU); x.fill(); S.glow.fillStyle = col(C.acc, .9); S.glow.beginPath(); S.glow.arc(px, py, v, 0, TAU); S.glow.fill(); } }
            if (fwd > 0 && fwd < 1) { const q = fwd * 2 - li; if (q >= 0 && q <= 1) { const px = lerp(p0[0], p1[0], q), py = lerp(p0[1], p1[1], q); x.fillStyle = col(C.priHi, .95); x.beginPath(); x.arc(px, py, v * .45, 0, TAU); x.fill(); S.glow.fillStyle = col(C.pri, .9); S.glow.beginPath(); S.glow.arc(px, py, v, 0, TAU); S.glow.fill(); } }
          }));
          pos.forEach((ly, li) => ly.forEach(([px, py], j) => H.node(S, px, py, v * (li === 1 ? 2.4 : 2.1), { lit: .4 + .6 * E.o3(seg(t, tm + li * .2, tm + .5 + li * .2)), a: na * E.oB(seg(t, F.cue(1) + li * .15, F.cue(1) + .5 + li * .15), 1.8) })));
          const la = E.o3(seg(t, tm, tm + .5)); ['输入层', '隐藏层', '输出层'].forEach((s, li) => T(x, s, R.x + R.w * (.1 + li * .4), R.y + R.h * 1.02, { f: 'sans', size: v * 1.6, w: li === 1 ? 700 : 500, c: li === 1 ? C.accHi : C.mute, al: 'center', a: la * na }));
          if (back > 0) H.chip(S, x, '反向传播：把错误往回传', R.x + R.w / 2, R.y - v * 1, { size: v * 1.8, a: na * E.o3(seg(t, tm + .4, tm + .9)), hot: true, al: 'center' });
          const ok = E.o3(seg(t, F.kw(1, '一群神经元'), F.kw(1, '一群神经元') + .6));
          if (ok > 0) { const s2 = P ? b.w * .4 : b.h * .42, X2 = b.x + b.w - s2, Y2 = P ? b.y + b.h * .72 : b.y + b.h * .62; xorPlot(S, X2, Y2, s2, t, { a: ok * na, t0: F.kw(1, '一群神经元') - .4, curve: ok, ok }); }
        }
        // 慢电脑
        const pa = E.o3(seg(t, F.cue(2) - .2, F.cue(2) + .5)); if (pa > 0) {
          const px0 = b.x, py0 = P ? b.y + b.h * .74 : b.y + b.h * .76, pw = P ? b.w * .55 : b.w * .38;
          H.panel(S, x, px0, py0, pw, v * 9, { a: pa, head: 'COMPUTER // 1986', c: C.cold });
          const pr = .01 + .03 * seg(t, F.cue(2), F.dur); x.save(); x.globalAlpha = pa; x.fillStyle = col(C.cold, .15); x.fillRect(px0 + v * 1.6, py0 + v * 4.6, pw - v * 3.2, v * 1.9); x.fillStyle = col(C.pri, .9); x.fillRect(px0 + v * 1.6, py0 + v * 4.6, (pw - v * 3.2) * pr, v * 1.9); x.restore();
          T(x, '训练中… ' + (pr * 100).toFixed(0) + '%', px0 + pw - v * 1.6, py0 + v * 1.8, { f: 'mono', size: v * 1.45, w: 500, c: C.cold, al: 'right', a: pa });
          const da = E.oB(seg(t, F.kw(2, '数据') - .1, F.kw(2, '数据') + .4), 2); if (da > 0) H.chip(S, x, '数据：太少', P ? px0 : px0 + pw + v * 1.6, P ? py0 + v * 12 : py0 + v * 4.5, { size: v * 1.8, a: Math.min(1, da) * pa, c: C.cold });
        }
      },
    },
    { // 第六幕 · 课本
      tin: { type: 'iris', x: .5, y: .5 }, year: 2007, mood: 'main',
      camera: (t, S, F) => ({ z: 1 + .03 * E.ioS(clamp(t / F.dur)) }),
      draw(t, S, F) {
        H.bg(S, t, {}); const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        const ia = E.oB(seg(t, F.kw(0, '李飞飞') - .1, F.kw(0, '李飞飞') + .45), 1.8);
        const G = P ? { x: b.x, y: b.y + v * 2, w: b.w, h: b.h * .52, cols: 5, rows: 4 } : { x: b.x, y: b.y, w: b.w * .58, h: b.h * .95, cols: 6, rows: 4 };
        if (ia > 0) H.chip(S, x, '李飞飞 Fei-Fei Li', P ? b.x + b.w / 2 : b.x + b.w * .8, P ? b.y - v * 1.4 : b.y + v * 1.5, { size: v * 2.1, a: Math.min(1, ia), al: 'center' });
        const icons = ['cat', 'dog', 'car', 'flower', 'bird', 'cup', 'house', 'tree'], names = ['猫', '狗', '汽车', '花', '鸟', '杯子', '房子', '树'];
        const tw = G.w / G.cols, th = G.h / G.rows, open = E.o3(seg(t, F.kw(0, '课本') - .3, F.kw(0, '课本') + .8)), fill = seg(t, F.cue(1) + .2, F.kw(1, '标签') + .6);
        for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
          const i = r * G.cols + c, X = G.x + c * tw + tw * .08, Y = G.y + r * th + th * .08, ww = tw * .84, hh = th * .84, ap = E.o3(seg(open, i / (G.rows * G.cols) * .6, i / (G.rows * G.cols) * .6 + .4));
          if (ap <= 0) continue; x.save(); x.globalAlpha = ap; rrect(x, X, Y, ww, hh, 3); x.fillStyle = 'rgba(10,22,44,.55)'; x.fill(); x.setLineDash([3, 3]); x.strokeStyle = col(C.pri, .4); x.lineWidth = 1; x.stroke(); x.setLineDash([]); x.restore();
          const fi = clamp(fill * (G.rows * G.cols + 4) - i * 1.0, 0, 1);
          if (fi > 0) {
            const k = (i * 5 + Math.floor(t * (fill < 1 ? 6 : 0))) % 8, is = Math.min(ww, hh) * .5;
            H.icon(x, icons[k], X + ww / 2 - is / 2, Y + hh * .42 - is / 2, is, fi > .99 ? C.priHi : C.pri, ap * fi);
            if (fi > .6) { x.save(); x.globalAlpha = ap * seg(fi, .6, 1); rrect(x, X + ww * .18, Y + hh * .74, ww * .64, hh * .2, hh * .1); x.fillStyle = col(C.acc, .28); x.fill(); x.restore(); T(x, names[k], X + ww / 2, Y + hh * .84, { f: 'sans', size: Math.min(v * 1.3, hh * .14), w: 700, c: C.accHi, al: 'center', a: ap * seg(fi, .6, 1) }); }
          }
        }
        const ba = E.o3(seg(t, F.kw(0, '同事') - .2, F.kw(0, '同事') + .4)) * (1 - seg(t, F.cue(1) - .3, F.cue(1) + .3));
        if (ba > 0) ['别浪费时间了', '太难了吧'].forEach((s, i) => H.chip(S, x, s, P ? b.x + b.w * (.28 + i * .44) : b.x + b.w * (.7 + i * .12), P ? b.y + b.h * .68 : b.y + b.h * (.38 + i * .16), { size: v * 1.8, a: ba * .85, c: C.mute, tc: C.mute, al: 'center' }));
        const ca = E.o3(seg(t, F.cue(1), F.cue(1) + .6)); if (ca > 0) {
          const cx = P ? b.x + b.w / 2 : b.x + b.w * .8, cy = P ? b.y + b.h * .74 : b.y + b.h * .42;
          T(S.hud, H.count(0, 14000000, seg(t, F.cue(1) + .2, F.kw(1, '标签') + .4)) + '+', cx, cy, { f: 'interd', size: v * (P ? 4.4 : 5), w: 700, c: C.ink, al: 'center', a: ca, sh: { c: C.pri, a: .6, b: 18 } });
          T(S.hud, '张图片，人工贴标签', cx, cy + v * 4, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, al: 'center', a: ca });
          const ga = E.o3(seg(t, F.kw(1, '几万人') - .2, F.kw(1, '几万人') + .5)), gs = v * (P ? 6.5 : 8), gx0 = cx - gs / 2, gy0 = cy + v * (P ? 6.4 : 7.4);
          if (ga > 0) { H.icon(x, 'globe', gx0, gy0, gs, C.pri, ga * .9, 1); const rr = rng(77); for (let i = 0; i < 30; i++) { const a0 = rr() * TAU, d = Math.sqrt(rr()) * gs * .42, on = rr() < seg(t, F.kw(1, '几万人'), F.kw(1, '几万人') + 2.5); if (!on) continue; x.fillStyle = col(C.acc, .9 * ga); x.beginPath(); x.arc(gx0 + gs / 2 + Math.cos(a0) * d, gy0 + gs / 2 + Math.sin(a0) * d * .9, 1.6, 0, TAU); x.fill(); } T(x, '几万人 · 167 个国家', cx, gy0 + gs + v * 2.2, { f: 'sans', size: v * 1.7, w: 500, c: C.mute, al: 'center', a: ga }); }
        }
        const na = E.oB(seg(t, F.kw(1, 'ImageNet') - .1, F.kw(1, 'ImageNet') + .5), 1.5); if (na > 0) {
          const cx = P ? W / 2 : b.x + b.w * .29, cy = P ? b.y + b.h * .26 : b.y + b.h * .48;
          x.save(); x.globalAlpha = Math.min(1, na) * .85; rrect(x, cx - v * 17, cy - v * 4.6, v * 34, v * 9.2, v * 1.4); x.fillStyle = 'rgba(3,8,20,.84)'; x.fill(); x.restore();
          T(S.hud, 'ImageNet', cx, cy, { f: 'interd', size: v * 6.6 * Math.min(1.1, na), w: 900, c: '#ffffff', al: 'center', a: Math.min(1, na), sh: { c: C.pri, a: .9, b: 28 } });
        }
      },
    },
    { // 第七幕 · 卧室
      tin: { type: 'wipe', ang: .4 }, year: 2012, mood: 'main',
      camera: (t, S, F) => { const [sx, sy] = shake(t, F.kw(1, '全场震惊'), S.v * .8); return { z: 1 + .035 * E.ioS(clamp(t / F.dur)), x: sx, y: sy }; },
      draw(t, S, F) {
        H.bg(S, t, {}); const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        const gA = E.o3(seg(t, .3, 1.1)) * (1 - (P ? 1 : .45) * seg(t, F.cue(1) - .3, F.cue(1) + .5)) * (1 - .8 * seg(t, F.cue(2) - .3, F.cue(2) + .5));
        const R = P ? { x: b.x, y: b.y, w: b.w, h: b.h * .42 } : { x: b.x, y: b.y + b.h * .08, w: b.w * .44, h: b.h * .8 };
        if (gA > 0) {
          H.icon(x, 'house', R.x, R.y - v * 1, v * 4, C.mute, gA * .9); T(x, '父母家的卧室', R.x + v * 5, R.y + v * 1, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, a: gA });
          const gs = Math.min(R.w * .47, R.h * .66); [0, 1].forEach(i => {
            const gx0 = R.x + i * (gs + v * 1.6), gy0 = R.y + R.h * .2, ap = E.oB(seg(t, F.kw(0, '显卡') - .3 + i * .15, F.kw(0, '显卡') + .3 + i * .15), 1.8);
            if (ap <= 0) return; const a = Math.min(1, ap) * gA;
            haze(S.glow, gx0 + gs / 2, gy0 + gs / 2, gs * .6, C.acc, .25 * a);
            H.icon(x, 'gpu', gx0, gy0, gs, C.priHi, a, 1.2);
            for (const fx of [8, 16]) { const fcx = gx0 + gs * fx / 24, fcy = gy0 + gs * 12 / 24, fr = gs * 2.6 / 24; x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .9); x.lineWidth = 1.2; for (let k = 0; k < 3; k++) { const an = t * 9 + k * TAU / 3; x.beginPath(); x.arc(fcx, fcy, fr * .8, an, an + 1.1); x.stroke(); } x.restore(); }
          });
          const ca = E.o3(seg(t, F.kw(0, '显卡') + .4, F.kw(0, '显卡') + 1)); H.chip(S, x, '2 × GTX 580', R.x + gs + v * .8, R.y + R.h * .2 + gs + v * 3.4, { size: v * 1.8, f: 'mono', a: ca * gA, al: 'center' });
          const sa = E.oB(seg(t, F.kw(0, '亚历克斯') - .1, F.kw(0, '亚历克斯') + .45), 1.8); if (sa > 0) H.chip(S, x, '亚历克斯 · 辛顿的学生', R.x + gs + v * .8, R.y + R.h * .2 - v * 3.4, { size: v * 1.8, a: Math.min(1, sa) * gA, al: 'center' });
        }
        // 比赛柱状图
        const ca = E.o3(seg(t, F.cue(1) - .3, F.cue(1) + .4)) * (1 - (P ? 1 : .85) * seg(t, F.cue(2) - .3, F.cue(2) + .5));
        if (ca > 0) {
          const Rc = P ? { x: b.x + b.w * .1, y: b.y + b.h * .36, w: b.w * .8, h: b.h * .5 } : { x: b.x + b.w * .52, y: b.y + b.h * .04, w: b.w * .46, h: b.h * .78 };
          H.panel(S, x, Rc.x - v, Rc.y - v * 2.4, Rc.w + 2 * v, Rc.h + v * 6.4, { a: ca, head: 'ILSVRC 2012 · 图像识别大赛' });
          const y0 = Rc.y + Rc.h, bw = Rc.w * .24;
          T(x, '错误率（越低越好）', Rc.x + Rc.w / 2, Rc.y + v * 1.8, { f: 'sans', size: v * 1.6, w: 500, c: C.mute, al: 'center', a: ca });
          bar(S, Rc.x + Rc.w * .18, y0, bw, Rc.h * .72, 26.2, 26.2, seg(t, F.kw(1, '二十六') - .5, F.kw(1, '二十六') + .5), { label: '第二名', a: ca, c: C.pri });
          bar(S, Rc.x + Rc.w * .58, y0, bw, Rc.h * .72, 15.3, 26.2, seg(t, F.kw(1, '十五') - .5, F.kw(1, '十五') + .5), { label: 'AlexNet', a: ca, c: C.acc, hot: true });
          const sh = F.kw(1, '全场震惊'); if (t > sh) { H.rings(S, Rc.x + Rc.w * .58 + bw / 2, y0 - Rc.h * .72 * 15.3 / 26.2 - v * 2, v * 2, v * 12, t - sh, { c: C.acc, n: 3, speed: .6, a: 1 - seg(t, sh + 2, sh + 3) }); H.chip(S, x, '全场震惊', Rc.x + Rc.w * .58 + bw / 2, Rc.y + v * 5.2, { size: v * 2, hot: true, a: E.oB(seg(t, sh, sh + .4), 2) * ca, al: 'center' }); }
        }
        // 方程
        const ea = E.o3(seg(t, F.cue(2) - .2, F.cue(2) + .4)); if (ea > 0) {
          const items = [['1958 的想法', F.cue(2) + .2, false], ['+', F.cue(2) + .5, null], ['数据', F.kw(2, '数据'), false], ['+', F.kw(2, '数据') + .3, null], ['算力', F.kw(2, '算力'), false], ['=', F.kw(2, '算力') + .4, null], ['深度学习时代', F.kw(2, '算力') + .7, true]];
          const ey = P ? b.y + b.h * .5 : b.y + b.h * .45, sz = v * (P ? 1.7 : 2.4);
          const rowsI = P ? [[0, 1, 2, 3, 4], [5, 6]] : [[0, 1, 2, 3, 4, 5, 6]];
          rowsI.forEach((ri, rowN) => {
            const ws = ri.map(j => items[j][2] === null ? sz * 1.6 : TW(x, items[j][0], { f: 'sans', size: sz, w: 500 }) + fsz(sz) * 1.3 + sz * .5), tot = ws.reduce((a, c) => a + c, 0); let ex = W / 2 - tot / 2; const yy = ey + rowN * v * 6;
            ri.forEach((j, q) => { const [s0, tt, k] = items[j], a = E.oB(seg(t, tt - .1, tt + .35), 1.8) * ea; if (a > 0) { if (k === null) T(x, s0, ex + ws[q] / 2, yy, { f: 'interd', size: sz * 1.3, w: 700, c: C.mute, al: 'center', a: Math.min(1, a) }); else H.chip(S, x, s0, ex + sz * .25, yy, { size: sz, hot: k, a: Math.min(1, a) }); } ex += ws[q]; });
          });
        }
      },
    },
    { // 第八幕 · 注意力
      tin: { type: 'fade' }, year: 2017, mood: 'main',
      camera: (t, S, F) => ({ z: 1 + .03 * E.ioS(clamp(t / F.dur)) }),
      draw(t, S, F) {
        H.bg(S, t, {}); const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        const pa = E.o3(seg(t, .3, 1.1)) * (1 - E.o3(seg(t, F.cue(1) - .5, F.cue(1) + .2)));
        if (pa > 0) {
          const R = P ? { x: b.x, y: b.y + b.h * .05, w: b.w, h: b.h * .7 } : { x: b.x + b.w * .16, y: b.y + b.h * .05, w: b.w * .68, h: b.h * .8 };
          H.panel(S, x, R.x, R.y, R.w, R.h, { a: pa, head: 'PAPER // GOOGLE 2017' });
          const ts = fit(x, 'Attention Is All You Need', R.w * .9, { f: 'interd', size: v * (P ? 3 : 4.4), w: 700 });
          TReveal(x, 'Attention Is All You Need', R.x + R.w / 2, R.y + R.h * .3, { f: 'interd', size: ts, w: 700, c: '#ffffff', al: 'center', sh: { c: C.pri, a: .7, b: 18 } }, seg(t, .8, 2.4));
          const ka = E.o3(seg(t, F.kw(0, '注意力') - .2, F.kw(0, '注意力') + .5));
          T(x, '《注意力就是你所需要的一切》', R.x + R.w / 2, R.y + R.h * .3 + fsz(ts) * 1.3, { f: 'sans', size: Math.min(v * 2.4, R.w / 16), w: 700, c: C.accHi, al: 'center', a: ka * pa });
          for (let i = 0; i < 8; i++) { const ap = E.oB(seg(t, F.kw(0, '八个') + i * .07, F.kw(0, '八个') + .4 + i * .07), 2); if (ap > 0) H.icon(x, 'person', R.x + R.w / 2 + (i - 3.5) * v * (P ? 4 : 5) - v * 1.6, R.y + R.h * .6, v * 3.2, C.pri, Math.min(1, ap) * pa); }
          T(x, '8 位作者', R.x + R.w / 2, R.y + R.h * .6 + v * 5.2, { f: 'sans', size: v * 1.7, w: 500, c: C.mute, al: 'center', a: E.o3(seg(t, F.kw(0, '八个') + .5, F.kw(0, '八个') + 1)) * pa });
          T(x, '♪ 化用披头士《All You Need Is Love》', R.x + R.w / 2, R.y + R.h * .87, { f: 'sans', size: v * 1.6, w: 500, c: C.mute, al: 'center', a: E.o3(seg(t, F.kw(0, '披头士') - .2, F.kw(0, '披头士') + .5)) * pa });
        }
        // 注意力弧线
        const ta = E.o3(seg(t, F.cue(1) - .3, F.cue(1) + .4)) * (1 - E.o3(seg(t, F.cue(2) - .4, F.cue(2) + .3)));
        if (ta > 0) {
          const toks = ['猫', '坐在', '垫子', '上', '，因为', '它', '很', '累'], wts = [.55, .07, .12, .03, .05, 0, .07, .11], it = 5;
          const rows = P ? [[0, 1, 2, 3], [4, 5, 6, 7]] : [[0, 1, 2, 3, 4, 5, 6, 7]], sz = v * (P ? 2.3 : 2.9), ry0 = P ? b.y + b.h * .45 : b.y + b.h * .66;
          const posT = []; rows.forEach((rw, ri) => { const ws = rw.map(i => TW(x, toks[i], { f: 'sans', size: sz, w: 700 }) + sz * 1.3), gap = v * (P ? 1.2 : 1.8), tot = ws.reduce((a, c) => a + c, 0) + gap * (rw.length - 1); let xx = W / 2 - tot / 2; rw.forEach((i, k) => { posT[i] = [xx + ws[k] / 2, ry0 + ri * v * (P ? 8.5 : 0), ws[k]]; xx += ws[k] + gap; }); });
          const kc = F.kw(1, '猫', .5), aw = seg(t, F.kw(1, '注意'), F.kw(1, '注意') + 1.2);
          toks.forEach((s, i) => {
            if (i === it) return; const [x0, y0] = posT[it], [x1, y1] = posT[i], hot = i === 0 && t > kc, w = (hot ? 1 : .7) * (1 + wts[i] * 14), ar = (y0 === y1 ? -1 : -.6);
            const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - Math.abs(x1 - x0) * .32 - v * 2.5 - (y0 !== y1 ? v * 3 : 0);
            const p = E.o3(clamp(aw * 1.4 - Math.abs(i - it) * .08));
            if (p <= 0) return; x.save(); x.globalAlpha = ta * (hot ? 1 : .35 + wts[i] * 3); x.strokeStyle = col(hot ? C.acc : C.pri, 1); x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(x0, y0 - sz); const steps = 20; for (let k = 1; k <= steps; k++) { const q = k / steps * p, u = 1 - q; x.lineTo(u * u * x0 + 2 * u * q * mx + q * q * x1, u * u * (y0 - sz) + 2 * u * q * my + q * q * (y1 - sz)); } x.stroke(); x.restore();
            if (hot) { S.glow.save(); S.glow.globalAlpha = ta; S.glow.strokeStyle = col(C.acc, .9); S.glow.lineWidth = w + 3; S.glow.beginPath(); S.glow.moveTo(x0, y0 - sz); S.glow.quadraticCurveTo(mx, my, x1, y1 - sz); S.glow.stroke(); S.glow.restore(); T(x, '最在意：' + Math.round(wts[0] * 100) + '%', mx, my - v * 1.8, { f: 'sans', size: v * 1.9, w: 700, c: C.accHi, al: 'center', a: ta * E.o3(seg(t, kc, kc + .4)) }); }
          });
          toks.forEach((s, i) => { const [px, py] = posT[i], ap = E.oB(seg(t, F.cue(1) + i * .06, F.cue(1) + .4 + i * .06), 1.8); if (ap > 0) H.chip(S, x, s, px, py, { size: sz, w: 700, hot: i === it || (i === 0 && t > kc), a: Math.min(1, ap) * ta, al: 'center' }); });
        }
        // Transformer 积木
        const ba = E.o3(seg(t, F.cue(2) - .2, F.cue(2) + .5)); if (ba > 0) {
          const cx = W / 2, by0 = P ? b.y + b.h * .98 : b.y + b.h * 1.0, bw = P ? b.w * .66 : b.w * .34, lh = v * (P ? 3.2 : 3.6);
          for (let i = 0; i < 6; i++) { const ap = E.oB(seg(t, F.cue(2) + i * .1, F.cue(2) + .5 + i * .1), 1.6); if (ap <= 0) continue; const yy = by0 - (i + 1) * (lh + v * .5) - (1 - Math.min(1, ap)) * v * 3; H.panel(S, x, cx - bw / 2, yy, bw, lh, { a: Math.min(1, ap) * ba, r: 3, c: i % 2 ? C.sec : C.pri, glow: i === 5 }); T(x, i % 2 ? '前馈层' : '注意力层', cx, yy + lh / 2, { f: 'sans', size: v * 1.5, w: 500, c: C.ink, al: 'center', a: Math.min(1, ap) * ba }); }
          const top = by0 - 6 * (lh + v * .5); T(S.hud, 'Transformer', cx, top - v * 3.6, { f: 'interd', size: v * (P ? 4.2 : 5), w: 700, c: '#ffffff', al: 'center', a: E.o3(seg(t, F.kw(2, 'Transformer') - .2, F.kw(2, 'Transformer') + .4)) * ba, sh: { c: C.pri, a: .8, b: 22 } });
          const c1 = E.oB(seg(t, F.kw(2, 'ChatGPT') - .1, F.kw(2, 'ChatGPT') + .4), 2), c2 = E.oB(seg(t, F.kw(2, 'Claude') - .1, F.kw(2, 'Claude') + .4), 2);
          if (c1 > 0) H.chip(S, x, 'ChatGPT', P ? cx - v * 1 : cx - bw / 2 - v * 2, top - v * (P ? 10 : 3.6), { size: v * 2, a: Math.min(1, c1) * ba, al: 'right' });
          if (c2 > 0) H.chip(S, x, 'Claude', P ? cx + v * 1 : cx + bw / 2 + v * 2, top - v * (P ? 10 : 3.6), { size: v * 2, a: Math.min(1, c2) * ba, al: 'left' });
        }
      },
    },
    { // 第九幕 · 诺贝尔
      tin: { type: 'iris', x: .5, y: .45, c: '#FFC86B' }, year: 2024, yearO: { c: '#FFC86B' }, mood: 'main',
      camera: (t, S, F) => ({ z: 1 + .04 * E.ioS(clamp(t / F.dur)) }),
      draw(t, S, F) {
        H.bg(S, t, { hue: 'gold' }); const { W, H: h, P, v } = S, b = box(S), x = S.mid, cx = W / 2, cy = P ? h * .36 : h * .4;
        const ma = E.oB(seg(t, .3, 1.2), 1.4), ms = v * (P ? 17 : 21);
        if (ma > 0) {
          haze(S.glow, cx, cy, ms * .9, C.gold, .4 * Math.min(1, ma)); H.rings(S, cx, cy + ms * .12, ms * .42, ms * 1.0, t, { c: C.gold, n: 3, speed: .3, tilt: 1, a: Math.min(1, ma) * .7 });
          H.icon(x, 'medal', cx - ms / 2, cy - ms / 2, ms, C.gold, Math.min(1, ma), 1.1);
        }
        const ka = E.o3(seg(t, F.kw(0, '诺贝尔') - .2, F.kw(0, '诺贝尔') + .5));
        T(S.hud, '诺贝尔物理学奖', cx, cy + ms * .62 + v * 2.4, { f: 'smiley', size: v * (P ? 4.4 : 5), c: '#fff4dc', al: 'center', a: ka, sh: { c: C.gold, a: .8, b: 22 } });
        T(S.hud, '辛顿 与 霍普菲尔德 共同获奖', cx, cy + ms * .62 + v * 6.6, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, al: 'center', a: ka * .9, tr: .1 });
        const ta = E.o3(seg(t, F.cue(1) - .3, F.cue(1) + .3)), ty = P ? h * .76 : h * .81, x1 = b.x + b.w * .06, x2 = b.x + b.w * .94;
        timeline(S, x1, x2, ty, E.io3(seg(t, F.cue(1), F.kw(1, '六十六年'))), { a: ta, years: [1958, 2024], labels: { 1958: '感知机诞生', 2024: '诺贝尔奖' } });
        const n = Math.round(66 * E.io3(seg(t, F.cue(1), F.kw(1, '六十六年')))); if (ta > 0) T(S.hud, n + ' 年', W / 2, ty - v * 3.6, { f: 'interd', size: v * 3.8, w: 700, c: n >= 66 ? C.gold : C.ink, al: 'center', a: ta, sh: { c: C.gold, a: .6, b: 16 } });
      },
    },
    { // 尾声 · 苦涩的教训
      tin: { type: 'fade' }, mood: 'main', tail: 2.2,
      camera: (t, S, F) => { const tz = F.cue(1); return { z: t < tz ? 1 + .02 * E.ioS(clamp(t / tz)) : 1.02 }; },
      draw(t, S, F) {
        H.bg(S, t, {}); const { W, H: h, P, v } = S, b = box(S), x = S.mid;
        const ca = E.o3(seg(t, .3, 1.0)) * (1 - E.o3(seg(t, F.cue(1) - .4, F.cue(1) + .3)));
        if (ca > 0) {
          const R = P ? { x: b.x, y: b.y + v * 2, w: b.w, h: b.h * .78 } : { x: b.x + b.w * .12, y: b.y, w: b.w * .76, h: b.h * .92 };
          H.panel(S, x, R.x, R.y, R.w, R.h, { a: ca, head: 'THE BITTER LESSON // RICH SUTTON 2019' });
          const px = R.x + v * 4, pw = R.w - v * 7, py = R.y + R.h - v * 4, ph = R.h - v * 9;
          x.save(); x.globalAlpha = ca; x.strokeStyle = col(C.mute, .5); x.lineWidth = 1; x.beginPath(); x.moveTo(px, py - ph); x.lineTo(px, py); x.lineTo(px + pw, py); x.stroke(); x.restore();
          T(x, '效果', px - v * .8, py - ph + v * .4, { f: 'sans', size: v * 1.5, w: 500, c: C.mute, al: 'right', a: ca });
          ['1960', '1990', '2020'].forEach((s, i) => T(x, s, px + pw * (i / 2), py + v * 2, { f: 'mono', size: v * 1.4, c: C.mute, al: 'center', a: ca }));
          const p1 = seg(t, .8, F.kw(0, '聪明') + .5), p2 = seg(t, F.kw(0, '简单'), F.kw(0, '算力') + .6);
          const fA = q => py - ph * (.18 + .3 * (1 - Math.exp(-q * 4))), fB = q => py - ph * (.05 + .9 * Math.pow(q, 3.2));
          for (const [f, p, c, w, lab] of [[fA, p1, C.pri, 2, '人类精心设计的规则'], [fB, p2, C.acc, 3, '简单方法 + 海量算力']]) {
            if (p <= 0) continue; x.save(); x.globalAlpha = ca; x.strokeStyle = col(c, .95); x.lineWidth = w; x.beginPath(); for (let i = 0; i <= 60; i++) { const q = i / 60 * p; const xx = px + pw * q, yy = f(q); if (i) x.lineTo(xx, yy); else x.moveTo(xx, yy); } x.stroke(); x.restore();
            S.glow.save(); S.glow.globalAlpha = ca * .8; S.glow.strokeStyle = col(c, .8); S.glow.lineWidth = w + 2; S.glow.beginPath(); for (let i = 0; i <= 60; i++) { const q = i / 60 * p; if (i) S.glow.lineTo(px + pw * q, f(q)); else S.glow.moveTo(px + pw * q, f(q)); } S.glow.stroke(); S.glow.restore();
            const lw = TW(x, lab, { f: 'sans', size: v * 1.8, w: 700 }); T(x, lab, Math.max(px + lw + v, px + pw * p - v * .5), f(p) - v * 2.2, { f: 'sans', size: v * 1.8, w: 700, c: c === C.acc ? C.accHi : C.priHi, al: 'right', a: ca * seg(p, .55, .85) });
          }
          const kA = E.oB(seg(t, F.kw(0, '苦涩') - .1, F.kw(0, '苦涩') + .5), 1.8); if (kA > 0) H.chip(S, x, '苦涩的教训', R.x + R.w / 2, R.y + v * 6.6, { size: v * 2.3, hot: true, a: Math.min(1, kA) * ca, al: 'center' });
        }
        // 从一个神经元到几千亿
        const ga = E.o3(seg(t, F.cue(1) - .3, F.cue(1) + .4)); if (ga > 0) {
          const cx = W / 2, cy = P ? h * .42 : h * .47, zp = E.io3(seg(t, F.cue(1), F.kw(1, '参数') + .4)), sc = lerp(.02, 1, zp) * (P ? W * .48 : h * .42), rot = t * .05;
          for (let i = 0; i < GAL.length; i++) {
            const [gx, gy, s1, s2] = GAL[i], show = i === 0 ? 1 : seg(zp, (i / GAL.length) * .7, (i / GAL.length) * .7 + .25); if (show <= 0) continue;
            const xr = gx * Math.cos(rot) - gy * Math.sin(rot), yr = (gx * Math.sin(rot) + gy * Math.cos(rot)) * .62, px = cx + xr * sc, py = cy + yr * sc, r = i === 0 ? v * 1.2 * (1 - zp * .7) : .7 + s1 * 1.2;
            x.fillStyle = col(s2 < .78 ? C.pri : C.acc, ga * show * (.35 + s1 * .6)); x.fillRect(px - r / 2, py - r / 2, r, r);
          }
          H.node(S, cx, cy, v * 1.2 * (1 - zp * .6), { lit: 1, a: ga });
          haze(S.glow, cx, cy, sc * .6, C.pri, .25 * ga * zp);
          T(S.hud, zp < .99 ? H.count(1, 300000000000, Math.pow(zp, 3)) : '几千亿', cx, P ? h * .2 : h * .2, { f: zp < .99 ? 'interd' : 'smiley', size: v * (P ? 4.4 : 5.4), w: 700, c: C.ink, al: 'center', a: ga * (1 - seg(t, F.kw(1, '今天') - .2, F.kw(1, '今天') + .4)), sh: { c: C.pri, a: .6, b: 18 } });
          T(S.hud, '个参数', cx, h * .2 + v * 4.2, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, al: 'center', a: ga * (1 - seg(t, F.kw(1, '今天') - .2, F.kw(1, '今天') + .4)) });
          const ka = E.oB(seg(t, F.kw(1, '你正在') - .2, F.kw(1, '你正在') + .4), 1.6); if (ka > 0) {
            const bw = v * (P ? 30 : 36), bh = v * (P ? 7.4 : 8.4), bx = cx - bw / 2, by = cy - bh / 2; x.save(); x.globalAlpha = Math.min(1, ka); rrect(x, bx, by, bw, bh, bh * .3); x.fillStyle = 'rgba(30,5,34,.88)'; x.fill(); x.strokeStyle = col(C.acc, .95); x.lineWidth = 1.4; x.stroke(); x.beginPath(); x.moveTo(bx + bw * .15, by + bh); x.lineTo(bx + bw * .1, by + bh + v * 1.6); x.lineTo(bx + bw * .25, by + bh); x.closePath(); x.fillStyle = 'rgba(30,5,34,.88)'; x.fill(); x.stroke(); x.restore();
            const cur = Math.floor(t * 2.2) % 2 ? '▍' : ' ';
            T(S.hud, '你正在和它说话' + cur, bx + v * 2.6, cy, { f: 'sans', size: v * (P ? 2.8 : 3.3), w: 700, c: C.accHi, a: Math.min(1, ka) });
            S.glow.save(); S.glow.globalAlpha = Math.min(1, ka); rrect(S.glow, bx, by, bw, bh, bh * .3); S.glow.strokeStyle = col(C.acc, .8); S.glow.lineWidth = 3; S.glow.stroke(); S.glow.restore();
          }
        }
      },
    },
  ];

  /* ---------- 片尾总结卡 ---------- */
  const POINTS = [['1958', '感知机：第一台会学习的机器'], ['1969', '一条直线分不开斜对角，AI 进入寒冬'], ['2012', 'AlexNet：数据 + 算力，深度学习爆发'], ['2017', 'Transformer：今天大模型的地基']];
  const outro = {
    dur: 8, tin: { type: 'fade' }, sfx: [[.3, 'rise'], [1.6, 'ding']],
    camera: t => ({ z: 1 + .02 * E.ioS(clamp(t / 8)) }),
    draw(t, S) {
      H.bg(S, t, {}); const { W, H: h, P, v } = S, x = S.mid, pa = E.o3(seg(t, .3, 1.1));
      const R = P ? { x: W * .07, y: h * .13, w: W * .86, h: h * .64 } : { x: W * .16, y: h * .12, w: W * .68, h: h * .72 };
      H.panel(S, x, R.x, R.y + (1 - pa) * v * 3, R.w, R.h, { a: pa, head: 'SUMMARY // LESSON 01' });
      T(S.hud, '本课要点', R.x + R.w / 2, R.y + v * 7, { f: 'smiley', size: v * (P ? 4.4 : 5), c: C.ink, al: 'center', a: pa, sh: { c: C.pri, a: .6, b: 18 } });
      POINTS.forEach(([y, s], i) => {
        const a = E.o3(seg(t, .9 + i * .3, 1.4 + i * .3)), yy = R.y + v * (P ? 15 : 16) + i * v * (P ? 8 : 8.6);
        H.chip(S, x, y, R.x + v * 2.6, yy, { size: v * 1.6, f: 'mono', a, hot: i === 3 });
        const tx0 = R.x + v * (P ? 12.5 : 13.5); T(x, s, tx0, yy, { f: 'sans', size: fit(x, s, R.x + R.w - v * 2 - tx0, { f: 'sans', size: v * (P ? 1.9 : 2.4), w: 500 }), w: 500, c: C.ink, a });
      });
      const na = E.o3(seg(t, 2.6, 3.3));
      T(S.hud, '下一课 · 一台猜下一个字的机器', R.x + R.w / 2, R.y + R.h - v * 3.8, { f: 'sans', size: v * 1.9, w: 500, c: C.pri, al: 'center', tr: .1, a: na });
    },
  };

  return { code, intro, outro, points: POINTS };
})();
