'use strict';
/* 第 1 课（纪录片版）· 第六幕 ~ 第十幕 */
const L1Y = (() => {
  const C = K.c;
  /* 图片墙：用示例图拼满一个区域 */
  const WALL = ['A27', 'A28', 'A29', 'A30', 'A31', 'A32', 'A34'];
  function wall(S, x, R, p, a, o = {}) {
    if (a <= 0) return; const v = S.v, cell = o.cell || v * (S.P ? 5.2 : 6.2), cols = Math.ceil(R.w / cell), rows = Math.ceil(R.h / cell), r = rng(o.seed || 3), n = cols * rows;
    x.save(); x.beginPath(); x.rect(R.x, R.y, R.w, R.h); x.clip();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * cols + i, q = clamp(p * 1.6 - r() * .6), id = WALL[(k * 7 + j) % WALL.length]; if (q <= 0) continue;
      const im = IMG.get(id); if (!im) continue; const s = Math.min(im.w, im.h), px = R.x + i * cell, py = R.y + j * cell;
      x.globalAlpha = a * q * (o.dim ?? .85); x.drawImage(im.im, (im.w - s) / 2, (im.h - s) / 2, s, s, px + 1, py + 1, cell - 2, cell - 2);
    }
    x.restore();
  }
  /* 线框地球 + 光点 */
  function globe(S, x, cx, cy, r, t, n, a) {
    if (a <= 0) return; const rot = t * .35;
    x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .35); x.lineWidth = 1;
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke();
    for (let i = -2; i <= 2; i++) { const yy = cy + r * i / 3, rr = Math.sqrt(Math.max(0, r * r - (r * i / 3) ** 2)); x.beginPath(); x.ellipse(cx, yy, rr, rr * .22, 0, 0, TAU); x.stroke(); }
    for (let i = 0; i < 6; i++) { const ph = rot + i / 6 * Math.PI, w = Math.abs(Math.cos(ph)) * r; x.beginPath(); x.ellipse(cx, cy, Math.max(.5, w), r, 0, 0, TAU); x.stroke(); }
    x.restore();
    const rr = rng(167);
    for (let i = 0; i < n; i++) {
      const lon = rr() * TAU, lat = (rr() - .5) * 2.2, cl = Math.cos(lat), px = Math.sin(lon + rot) * cl, pz = Math.cos(lon + rot) * cl, py = Math.sin(lat); if (pz < -.1) continue;
      H.node(S, cx + px * r, cy - py * r * .98, S.v * .32, { lit: 1, c: i % 5 ? C.pri : C.acc, a: a * (.4 + .6 * clamp(pz + .2)) });
    }
  }
  /* 对话气泡 */
  function bubble(S, x, X, Y, w, s, who, a, right = false, c) {
    if (a <= 0) return; const v = S.v, size = v * (S.P ? 1.75 : 2), lines = richLines(x, s, w - v * 3, { f: 'sans', size, w: 700 }), lh = fsz(size) * 1.45, hh = lines.length * lh + v * 3.2, cc = c || (right ? C.acc : C.pri), dy = (1 - a) * v * 1.5;
    x.save(); x.globalAlpha = a; rrect(x, X, Y + dy, w, hh, v * 1.2); x.fillStyle = right ? 'rgba(40,8,40,.85)' : 'rgba(6,16,34,.88)'; x.fill(); x.strokeStyle = col(cc, .6); x.lineWidth = 1.2; x.stroke(); x.restore();
    T(x, who, X + (right ? w - v * 1.2 : v * 1.2), Y + dy - v * 1.3, { f: 'sans', size: v * 1.25, w: 500, c: cc, al: right ? 'right' : 'left', a });
    rich(x, s, X + v * 1.5, Y + dy + v * 1.6 + lh * .5, w - v * 3, { f: 'sans', size, w: 700, c: C.ink, kc: right ? C.accHi : C.priHi, lh, a });
    return hh;
  }
  /* 倒计时环 */
  function ring(S, x, cx, cy, r, p, label, sub, a, c) {
    if (a <= 0) return; const v = S.v, cc = c || C.pri;
    x.save(); x.globalAlpha = a; x.lineWidth = v * .6; x.strokeStyle = col(cc, .18); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke();
    x.strokeStyle = col(cc, .95); x.beginPath(); x.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p)); x.stroke(); x.restore();
    const g = S.glow; g.save(); g.globalAlpha = a; g.strokeStyle = col(cc, .8); g.lineWidth = v; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p)); g.stroke(); g.restore();
    T(x, label, cx, cy - v * .4, { f: 'interd', size: r * .52, w: 900, c: C.ink, al: 'center', a, sh: { c: cc, a: .5 } });
    if (sub) T(x, sub, cx, cy + r * .42, { f: 'sans', size: v * 1.3, w: 500, c: C.mute, al: 'center', a });
  }
  /* 去饱和（让画面变冷、变灰） */
  function desat(S, amt) { if (amt <= 0) return; const x = S.mid; x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'saturation'; x.fillStyle = col('#808080', clamp(amt)); x.fillRect(0, 0, x.canvas.width, x.canvas.height); x.restore(); }
  /* 碎裂的印章 */
  function shatter(S, x, cx, cy, r, s, p, a) {
    if (a <= 0 || p >= 1) return; const v = S.v, rr = rng(99);
    if (p <= 0) { W3.seal(S, x, cx, cy, r, s, 1, { a }); return; }
    for (let i = 0; i < 14; i++) { const ang = rr() * TAU, d = E.o2(p) * r * (2 + rr() * 3), px = cx + Math.cos(ang) * d, py = cy + Math.sin(ang) * d + p * p * r * 3, sz = r * (.25 + rr() * .3); x.save(); x.globalAlpha = a * (1 - p); x.translate(px, py); x.rotate(rr() * 3 * p); x.strokeStyle = col(C.red, .9); x.lineWidth = r * .06; x.strokeRect(-sz / 2, -sz / 2, sz, sz * .5); x.restore(); }
  }
  return { wall, globe, bubble, ring, desat, shatter, WALL };
})();

/* ===== 第六幕 · 判决 ===== */
L1S.push({
  tin: { type: 'fade' }, tdur: .8, mood: 'cold', lead: .5, gap: .35, tail: 1.0, sfx: [[.3, 'impact']],
  camera: (t, S, F) => { const tk = F.kw(4, '判决'); const sh = t > tk && t < tk + .4 ? (1 - (t - tk) / .4) * S.v * .6 : 0; return { z: 1, x: sh * Math.sin(t * 90), y: sh * Math.cos(t * 77) }; },
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k1 = F.cue(1) - .2, k2 = F.cue(2) - .2, k3 = F.cue(3) - .2, k4 = F.cue(4) - .2;
    H.bg(S, t, { cold: .5 + .5 * X.SG(t, k4, F.dur) });
    STAMP(S, t, k1 + .2, '1969 · CAMBRIDGE, MA', '麻省理工学院');
    shots(t, [
      [0, k1, (a) => {
        const m = X.photo(S, a, 'A07', seg(t, 0, k1 + .4), { z0: 1.03, z1: 1.14, f0: [.62, .4], depth: .9 });
        if (m) { x.save(); x.globalAlpha = a * .22; x.fillStyle = '#16304e'; x.fillRect(G.main.x, G.main.y, G.main.w, G.main.h); x.restore(); CO(S, x, m.map(.62, .32), X.sideB(S, 0, 2), X.SG(t, .5, 1.4) * a, '马文·明斯基', 'MARVIN MINSKY · MIT'); }
        const fa = X.SG(t, F.kw(0, '老校友') - .3, F.kw(0, '老校友') + .3) * a;
        if (fa > 0) { const R = P ? { x: W * .07, y: G.side.y + v * 9, w: W * .86, h: h * .1 } : { x: G.side.x, y: G.side.y + G.side.h * .5, w: G.side.w, h: h * .17 }; IDC(S, x, R, { img: 'A01', name: '老校友：罗森布拉特', en: 'BRONX SCIENCE · 只差一届', f: [.5, .35] }, fa); }
      }],
      [k1, k2, (a) => {
        const bw = P ? W * .4 : W * .2, bx = P ? W * .5 : W * .72, by = P ? h * .37 : h * .5;
        const D = DOC.draw(S, x, 'book', bx, by, bw, { rot: lerp(.12, -.04, X.SG(t, k1, k1 + 1)), a: X.SG(t, F.kw(1, '一本书') - .3, F.kw(1, '一本书') + .3) * a });
        if (D) RECON(S, S.hud, bx - bw / 2, by + bw * .71 + v * 2.2, X.SG(t, F.kw(1, '一本书'), F.kw(1, '一本书') + .5) * a, '示意 · 非原书封面');
        const cw = P ? W * .86 : W * .4, ch = P ? h * .1 : h * .2;
        IDC(S, x, P ? { x: W * .07, y: G.side.y + v * 3, w: cw, h: ch } : { x: W * .06, y: h * .22, w: cw, h: ch }, { img: 'A07', name: '马文·明斯基', en: 'MARVIN MINSKY', lines: ['1969 年度图灵奖'], f: [.62, .4] }, X.SG(t, k1, k1 + .6) * a);
        IDC(S, x, P ? { x: W * .07, y: G.side.y + v * 4 + ch + v * 2, w: cw, h: ch } : { x: W * .06, y: h * .22 + ch + v * 3, w: cw, h: ch }, { img: 'A08', name: '西摩·派珀特', en: 'SEYMOUR PAPERT', lines: ['MIT 数学家'], f: [.5, .3] }, X.SG(t, F.kw(1, '派珀特') - .3, F.kw(1, '派珀特') + .3) * a);
        if (!P) T(S.hud, '《感知机》', bx, by - bw * .71 - v * 2.4, { f: 'smiley', size: v * 3.4, c: C.ink, al: 'center', a: X.SG(t, F.kw(1, '书名') - .2, F.kw(1, '书名') + .4) * a, sh: { c: C.pri, a: .5 } });
      }],
      [k2, k3, (a) => {
        const R = P ? { x: W * .1, y: h * .24, w: W * .8, h: W * .8 } : { x: W * .1, y: h * .22, w: h * .56, h: h * .56 }, r = rng(4);
        x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(4,12,26,.6)'; x.fillRect(R.x, R.y, R.w, R.h); x.strokeStyle = col(C.mute, .4); x.strokeRect(R.x, R.y, R.w, R.h); x.restore();
        for (let i = 0; i < 26; i++) { const g1 = i % 2, u = g1 ? .62 + r() * .3 : .08 + r() * .3, w = g1 ? .55 + r() * .38 : .08 + r() * .38; H.node(S, R.x + u * R.w, R.y + (1 - w) * R.h, v * .8, { lit: 1, c: g1 ? C.acc : C.pri, a: a * X.SG(t, k2 + i * .03, k2 + .4 + i * .03) }); }
        const lp = X.SG(t, F.kw(2, '一条直线') - .3, F.kw(2, '一条直线') + .5); if (lp > 0) { x.save(); x.globalAlpha = a; x.beginPath(); x.rect(R.x, R.y, R.w, R.h); x.clip(); x.strokeStyle = col(C.gold, .95); x.lineWidth = v * .3; x.beginPath(); x.moveTo(R.x + R.w * lerp(.2, .05, lp), R.y + R.h * 1.05); x.lineTo(R.x + R.w * lerp(.8, .98, lp), R.y - R.h * .05); x.stroke(); x.restore(); }
        TAG(S, S.hud, '线性可分 · LINEAR SEPARABILITY', R.x, R.y + R.h + v * 2.2, lp * a, { size: v * 1.2 });
        const fx = P ? W / 2 : W * .7, fy = P ? h * .24 + W * .8 + v * 8 : h * .38;
        T(S.hud, 'w₁x₁ + w₂x₂ > θ', fx, fy, { f: 'interd', size: v * (P ? 2.6 : 3.4), w: 700, c: C.ink, al: 'center', a: X.SG(t, k2 + .2, k2 + .8) * a, sh: { c: C.pri, a: .5 } });
        T(S.hud, '单层感知机 = 只能画一条直线', fx, fy + v * (P ? 4 : 5), { f: 'sans', size: v * (P ? 1.7 : 2), w: 500, c: C.mute, al: 'center', a: X.SG(t, k2 + .5, k2 + 1.1) * a });
        const ya = X.SG(t, F.kw(2, '永远') - .3, F.kw(2, '永远') + .3) * a;
        if (ya > 0) H.chip(S, S.hud, '有些简单问题，永远学不会', fx, fy + v * (P ? 9 : 11), { size: v * (P ? 1.8 : 2.2), hot: true, a: ya, al: 'center' });
      }],
      [k3, F.dur, (a) => {
        const R = P ? { x: W * .12, y: h * .22, w: W * .76, h: W * .76 } : { x: W * .1, y: h * .2, w: h * .58, h: h * .58 };
        const tl = F.kw(3, '一条直线'), tries = [[-.6, -.4, [0]], [.9, .6, [2]], [-1.2, .1, [3]]], ti = Math.min(2, Math.max(0, Math.floor((t - tl) / .7)));
        const ln = t > tl - .2 ? tries[ti] : null, k4t = F.kw(4, '判决');
        X.xorPlot(S, x, R, { line: ln && t < k4t + .2 ? { ang: ln[0], off: ln[1] } : null, bad: ln && t < k4t + .2 ? ln[2] : [], la: X.SG(t, tl - .2, tl + .1) }, a);
        T(S.hud, '异或 · XOR', R.x + R.w / 2, R.y - v * 1.8, { f: 'sans', size: v * 1.9, w: 700, c: C.ink, al: 'center', a: X.SG(t, F.kw(3, '异或') - .3, F.kw(3, '异或') + .3) * a });
        const TR = P ? { x: W * .12, y: R.y + R.h + v * 5, w: W * .76 } : { x: W * .6, y: h * .28, w: W * .3 }, ta = X.SG(t, F.kw(3, '异或'), F.kw(3, '异或') + .6) * a;
        if (ta > 0) {
          const rows = [['0', '0', '0'], ['0', '1', '1'], ['1', '0', '1'], ['1', '1', '0']], rh = v * (P ? 3 : 3.8);
          H.panel(S, x, TR.x, TR.y, TR.w, rh * 5.2, { a: ta, head: 'TRUTH TABLE' });
          rows.forEach((rw, i) => { const yy = TR.y + rh * (1.6 + i); T(x, `${rw[0]}  ⊕  ${rw[1]}  =  ${rw[2]}`, TR.x + TR.w / 2, yy, { f: 'mono', size: v * (P ? 1.6 : 1.9), w: 500, c: rw[2] === '1' ? C.accHi : C.priHi, al: 'center', a: ta * X.SG(t, F.kw(3, '异或') + i * .15, F.kw(3, '异或') + .4 + i * .15) }); });
        }
        const sa = X.SG(t, k4t - .1, k4t + .25);
        if (sa > 0) W3.seal(S, S.hud, R.x + R.w / 2, R.y + R.h / 2, v * (P ? 6 : 7.5), '此路不通', sa, { a });
        if (t > k4) { const cw = X.SG(t, k4t, k4t + 1.2); S.hud.save(); S.hud.fillStyle = col('#9cc4ff', .07 * cw); S.hud.fillRect(0, 0, W, h); S.hud.restore(); W3.snow(S, t, .8 * X.SG(t, k4t, k4t + 1.5)); }
        TAG(S, S.hud, '同年 · 明斯基获 1969 年度图灵奖', P ? W / 2 : W * .75, P ? G.side.y + G.side.h - v * 2 : h * .74, X.SG(t, k4t + .8, k4t + 1.4) * a, { al: 'center', size: v * 1.15, c: C.mute });
      }],
    ]);
  },
});

/* ===== 第七幕 · 7 月 11 日 ===== */
L1S.push({
  tin: { type: 'fade' }, tdur: .9, mood: 'cold', lead: .6, gap: .45, tail: 1.6,
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k1 = F.cue(1) - .2, k2 = F.cue(2) - .2, k3 = F.cue(3) - .2, k4 = F.cue(4) - .2;
    H.bg(S, t, { cold: t < k3 ? .9 : .6, starA: t > k1 && t < k3 ? 1.6 : 1 });
    if (t < k1 + .3) STAMP(S, t, .2, '1970s', '神经网络的寒冬', { a: 1 - X.SG(t, k1 - .3, k1) });
    else if (t > k3) STAMP(S, t, k3 + .2, '1971.07.11 · CHESAPEAKE BAY', '切萨皮克湾');
    shots(t, [
      [0, k1, (a) => {
        const R = P ? { x: W * .1, y: h * .4, w: W * .8, h: h * .3 } : { x: W * .1, y: h * .4, w: W * .5, h: h * .38 };
        W3.bars(S, x, R, [['1965', 10, C.pri], ['1967', 9.2, C.pri], ['1969', 6, C.pri], ['1971', 2.4, C.mute], ['1973', 1.4, C.mute], ['1975', 1, C.mute]], X.SG(t, .2, F.kw(0, '转行') + .4) * 1, { a: a * X.SG(t, .1, .6), max: 11, vfmt: () => '' });
        TAG(S, S.hud, '研究经费（示意）', R.x, R.y - v * 1.6, a, { size: v * 1.15 });
        const wa = X.SG(t, F.kw(0, '寒冬') - .4, F.kw(0, '寒冬') + .3) * a;
        T(S.hud, 'AI WINTER', P ? W / 2 : W * .78, P ? h * .3 : h * .5, { f: 'interd', size: v * (P ? 6 : 8), w: 900, c: '#dff0ff', al: 'center', a: wa, tr: .04, sh: { c: '#9fd8ff', a: .8 } });
        T(S.hud, '寒冬', P ? W / 2 : W * .78, (P ? h * .3 : h * .5) + v * (P ? 6 : 8), { f: 'smiley', size: v * (P ? 3.6 : 4.4), c: C.cold, al: 'center', a: wa });
        W3.snow(S, t, .9 * a);
      }],
      [k1, k2, (a) => {
        const gy = P ? h * .5 : h * .7, R = P ? G.main : G.main;
        x.save(); x.globalAlpha = a; x.fillStyle = '#03050c'; x.beginPath(); x.moveTo(0, gy + v * 6); x.quadraticCurveTo(W * .25, gy - v * 4, W * .5, gy + v * 2); x.quadraticCurveTo(W * .75, gy + v * 7, W, gy + v * 3); x.lineTo(W, h); x.lineTo(0, h); x.closePath(); x.fill();
        const ox = W * .28, oy = gy - v * 1.6; x.fillStyle = '#0a1222'; x.fillRect(ox - v * 2.6, oy - v * 1, v * 5.2, v * 3.4); x.beginPath(); x.arc(ox, oy - v * 1, v * 2.6, Math.PI, 0); x.fill(); x.strokeStyle = col(C.pri, .5); x.lineWidth = 1; x.stroke();
        x.strokeStyle = col(C.gold, .8); x.lineWidth = v * .3; x.beginPath(); x.moveTo(ox, oy - v * 1.6); x.lineTo(ox + v * 2.4, oy - v * 3.4); x.stroke(); x.restore();
        haze(S.glow, ox + v * 2.6, oy - v * 3.6, v * 4, C.gold, .5 * a);
        T(S.hud, '自家后山的天文台', ox, gy + v * 6, { f: 'sans', size: v * 1.4, w: 500, c: C.mute, al: 'center', a });
        const cr = P ? { x: W * .1, y: h * .2, w: W * .8 } : { x: W * .52, y: h * .24, w: W * .4 };
        const ca = X.SG(t, F.kw(1, '论证') - .4, F.kw(1, '论证') + .3) * a;
        if (ca > 0) { const hh = v * (P ? 8 : 9.5); H.panel(S, x, cr.x, cr.y, cr.w, hh, { a: ca, head: 'CITATION' }); T(x, 'Rosenblatt, F. (1971)', cr.x + v * 1.6, cr.y + v * 4.2, { f: 'serif', size: v * (P ? 1.8 : 2.1), w: 700, c: C.ink, a: ca }); T(x, 'Icarus 14, 71–93 · 凌星法找系外行星', cr.x + v * 1.6, cr.y + v * 6.8, { f: 'sans', size: v * (P ? 1.25 : 1.45), w: 500, c: C.priHi, a: ca }); }
        const LR = P ? { x: W * .12, y: h * .62, w: W * .76, h: h * .12 } : { x: W * .55, y: h * .5, w: W * .37, h: h * .2 }, la = X.SG(t, F.kw(1, '凌星') - .3, F.kw(1, '凌星') + .3) * a;
        if (la > 0) {
          const q = ((t - k1) * .25) % 1, fn = u => { const d = Math.abs(u - q); return d < .08 ? .62 : (d < .12 ? .62 + (.92 - .62) * (d - .08) / .04 : .92); };
          W3.axes(S, x, LR, la, '时间', '亮度');
          W3.curve(S, x, LR, u => fn(u), 1, C.gold, { a: la, w: v * .25 });
          const sx = LR.x + LR.w + v * (P ? -3 : 4.5), sy = LR.y - v * 2.2; haze(x, sx, sy, v * 3, C.gold, .9 * la); H.node(S, sx - v * 2 + q * v * 4, sy, v * .45, { lit: 1, c: '#000000', a: la });
          TAG(S, S.hud, '行星经过，星光变暗', LR.x + LR.w / 2, LR.y + LR.h + v * 3.2, la, { al: 'center', f: 'sans', size: v * 1.2, c: C.gold });
        }
      }],
      [k2, k3, (a) => {
        const r = rng(2600), n = Math.floor(900 * X.SG(t, k2 + .1, F.end(2) - .2));
        for (let i = 0; i < n; i++) { const px = r() * W, py = h * (.2 + r() * .6), big = r() < .05; x.save(); x.globalAlpha = a * (.4 + r() * .6); x.strokeStyle = col(big ? C.acc : C.pri, .9); x.lineWidth = 1; x.beginPath(); x.arc(px, py, v * (big ? .7 : .35), 0, TAU); x.stroke(); x.restore(); }
        T(S.hud, '数千颗系外行星', W / 2, P ? h * .45 : h * .45, { f: 'smiley', size: v * (P ? 4.2 : 5.6), c: C.ink, al: 'center', a: X.SG(t, F.kw(2, '几千') - .3, F.kw(2, '几千') + .3) * a, sh: { c: C.pri, a: .7 } });
        TAG(S, S.hud, '开普勒太空望远镜 · 凌星法', W / 2, P ? h * .45 + v * 6 : h * .45 + v * 7.5, X.SG(t, F.kw(2, '开普勒') - .2, F.kw(2, '开普勒') + .4) * a, { al: 'center', size: v * 1.3 });
      }],
      [k3, k4, (a) => {
        X.fullPhoto(S, a * (1 - .5 * X.SG(t, k4 - 1.2, k4)), 'A10', seg(t, k3, k4 + 1), { z0: 1.02, z1: 1.1, f0: [.35, .5], f1: [.6, .5], vig: .8 });
        const ba = X.SG(t, F.kw(3, '生日') - .3, F.kw(3, '生日') + .3) * a;
        X.calendar(S, S.hud, P ? W * .5 : W * .78, P ? h * .62 : h * .5, v * (P ? 10 : 13), 11, ba, { hot: true, top: 'JULY 1971', sub: '43 岁生日' });
      }],
      [k4, F.dur, (a) => {
        const m = X.photo(S, a, 'A11', seg(t, k4, F.dur), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .36, h: h * .65 }, z0: 1.02, z1: 1.16, f0: [.5, .5], f1: [.5, .47], depth: 1, vig: .6 });
        if (m) { const p1 = m.map(.37, .35), p2 = m.map(.63, .62); BOX(S, x, p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1], X.SG(t, k4 + .4, k4 + 1.2), { c: C.gold }); CO(S, x, [p2[0], (p1[1] + p2[1]) / 2], P ? [W * .55, G.main.y + G.main.h + v * 4] : [W * .47, h * .3], X.SG(t, k4 + .8, k4 + 1.8) * a, '生于 7 月 11 日，逝于 7 月 11 日', 'JULY 11, 1928 – 1971', { c: C.gold, side: 1 }); }
        const X1 = P ? W * .1 : W * .47, X2 = P ? W * .9 : W * .93, Yt = P ? h * .71 : h * .62, ta = X.SG(t, k4 + 1.2, k4 + 1.8) * a;
        if (ta > 0) {
          const xx = X.timeline(S, x, X1, X2, Yt, [[1928, '出生', C.pri], [1958, '感知机', C.pri], [1971, '离开', C.gold]], 1, { a: ta, y0: 1928, y1: 2024, c1: C.gold, alt: true });
          const x71 = lerp(X1, X2, (1971 - 1928) / (2024 - 1928)); x.save(); x.globalAlpha = ta; x.setLineDash([3, 6]); x.strokeStyle = col(C.mute, .6); x.beginPath(); x.moveTo(x71 + v, Yt); x.lineTo(X2, Yt); x.stroke(); x.setLineDash([]); x.restore();
          [[2012, 'AlexNet'], [2024, '诺贝尔奖']].forEach(([yy, lab]) => { const px = lerp(X1, X2, (yy - 1928) / (2024 - 1928)); x.save(); x.globalAlpha = ta; x.strokeStyle = col(C.mute, .7); x.beginPath(); x.arc(px, Yt, v * .7, 0, TAU); x.stroke(); x.restore(); T(x, String(yy), px, Yt + v * 2.6, { f: 'mono', size: v * 1.2, c: C.mute, al: 'center', a: ta }); T(x, lab, px, Yt - v * 2.4, { f: 'sans', size: v * 1.3, c: C.mute, al: 'center', a: ta }); });
          T(S.hud, '他没能看到', lerp(x71, X2, .5), Yt + v * 6, { f: 'sans', size: v * 1.5, w: 500, c: C.cold, al: 'center', a: X.SG(t, F.kw(4, '没能') - .2, F.kw(4, '没能') + .4) * a });
        }
      }],
    ]);
  },
});

/* ===== 第八幕 · 再给我六个月 ===== */
L1S.push({
  tin: { type: 'iris', x: .5, y: .5, c: '#FFC86B' }, tdur: .9, mood: 'main', lead: .5, gap: .35, tail: .9,
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k1 = F.cue(1) - .2, k2 = F.cue(2) - .2, k3 = F.cue(3) - .2, k4 = F.cue(4) - .2;
    H.bg(S, t, { cold: t < k1 ? .5 : 0, hue: t > k1 ? 'gold' : '' });
    if (t > k2 && t < k3 + .2) STAMP(S, t, k2 + .2, '1970 · CAMBRIDGE, UK', '剑桥 · 实验心理学学士', { a: 1 - X.SG(t, k3 - .2, k3 + .1) });
    else if (t > k3) STAMP(S, t, k3 + .3, '1978 · EDINBURGH', '爱丁堡 · 人工智能博士');
    shots(t, [
      [0, k1, (a) => {
        const tn = F.kw(0, '辛顿') - .4, sa = 1 - X.SG(t, tn, tn + .6);
        if (sa > 0) {
          W3.snow(S, t * 3, 1 * a * sa, 8); W3.snow(S, t * 2.2 + 3, .8 * a * sa, 19); T(S.hud, '寒冬', W / 2, P ? h * .32 : h * .3, { f: 'smiley', size: v * (P ? 5 : 7), c: C.cold, al: 'center', a: a * sa * .7 });
          const r = rng(5); x.save(); x.globalAlpha = a * sa * .5; x.strokeStyle = col('#cfe6ff', .5); x.lineWidth = 1; for (let i = 0; i < 90; i++) { const yy = r() * h, xx = ((r() - t * .9) % 1 + 1) % 1 * W * 1.2 - W * .1; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + v * 6, yy + v * .4); x.stroke(); } x.restore();
          const px = lerp(W * .1, W * .7, E.ioS(seg(t, 0, tn))); haze(S.glow, px, h * .55, v * 8, C.gold, a * sa); H.node(S, px, h * .55, v * 1.4, { lit: 1, c: C.gold, a: a * sa });
          T(S.hud, '逆行', px, h * .55 - v * 4, { f: 'smiley', size: v * 3, c: C.gold, al: 'center', a: a * sa * X.SG(t, .6, 1.2) });
        }
        const pa = X.SG(t, tn, tn + .7) * a;
        if (pa > 0) { const m = X.photo(S, pa, 'A22', seg(t, tn, k1 + .5), { z0: 1.03, z1: 1.12, f0: [.5, .42], depth: .9 }); if (m) CO(S, x, m.map(.5, .3), X.sideB(S, 0, 1), X.SG(t, tn + .4, tn + 1.2) * a, '杰弗里·辛顿', 'GEOFFREY HINTON · 1947 年生于伦敦'); }
      }],
      [k1, k2, (a) => {
        const m = X.photo(S, a, 'A24', seg(t, k1, k2 + .4), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .3, h: h * .64 }, z0: 1.02, z1: 1.1, f0: [.5, .35], depth: .8 });
        if (m) CO(S, x, m.map(.5, .3), P ? [W * .55, G.main.y + G.main.h + v * 3] : [W * .4, h * .26], X.SG(t, k1 + .3, k1 + 1.1) * a, '乔治·布尔', 'GEORGE BOOLE · 1815–1864 · 布尔逻辑', { side: 1 });
        const fx = P ? W * .5 : W * .66, fy = P ? h * .64 : h * .45, fa = X.SG(t, F.kw(1, '高祖父') - .3, F.kw(1, '高祖父') + .4) * a;
        if (fa > 0) {
          const gens = ['乔治·布尔', '·', '·', '·', '杰弗里·辛顿'];
          gens.forEach((g, i) => { const yy = fy - v * (P ? 7 : 10) + i * v * (P ? 3.5 : 5), on = X.SG(t, F.kw(1, '高祖父') + i * .15, F.kw(1, '高祖父') + .4 + i * .15) * fa; if (g === '·') { H.node(S, fx, yy, v * .35, { lit: .5, a: on }); return; } H.chip(S, x, g, fx, yy, { size: v * 1.7, al: 'center', a: on, hot: i === 4 }); });
          TAG(S, S.hud, '高祖父 → 玄孙', fx, fy + v * (P ? 11 : 13.5), fa, { al: 'center', f: 'sans', size: v * 1.25, c: C.gold });
        }
        const ba = X.SG(t, F.kw(1, '布尔逻辑') - .2, F.kw(1, '布尔逻辑') + .5) * a, r = rng(11);
        if (ba > 0) ['AND', 'OR', 'NOT', '0', '1'].forEach((s, i) => { const px = P ? W * (.12 + i * .19) : W * (.46 + i * .1), py = P ? h * .76 : h * .8; T(S.hud, s, px, py + Math.sin(t + i) * v, { f: 'mono', size: v * (1.2 + r() * 1.2), w: 500, c: i % 3 ? C.pri : C.gold, al: 'center', a: ba * .55 }); });
      }],
      [k2, k3, (a) => {
        X.photo(S, a, 'A39', seg(t, k2, k3 + .4), { R: P ? G.main : G.wide, z0: 1.04, z1: 1.12, f0: [.42, .5], f1: [.58, .48] });
        const ia = X.SG(t, F.kw(2, '木匠') - .3, F.kw(2, '木匠') + .3) * a, cx = P ? W * .5 : W * .8, cy = P ? G.side.y + v * 8 : h * .62;
        if (ia > 0) {
          const s = v * (P ? 6 : 7); x.save(); x.globalAlpha = ia; x.beginPath(); x.arc(cx, cy, s, 0, TAU); x.fillStyle = 'rgba(30,18,4,.88)'; x.fill(); x.strokeStyle = col(C.gold, .8); x.lineWidth = 1.5; x.stroke();
          x.strokeStyle = col(C.gold, 1); x.lineWidth = v * .35; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - s * .5, cy + s * .25); x.lineTo(cx + s * .35, cy - s * .4); x.stroke();
          for (let i = 0; i < 6; i++) { const q = i / 5; x.beginPath(); x.moveTo(lerp(cx - s * .5, cx + s * .35, q), lerp(cy + s * .25, cy - s * .4, q)); x.lineTo(lerp(cx - s * .5, cx + s * .35, q) + s * .08, lerp(cy + s * .25, cy - s * .4, q) + s * .1); x.stroke(); }
          x.fillStyle = col('#8a5a2b', 1); x.fillRect(cx - s * .62, cy + s * .2, s * .3, s * .22); x.restore();
          T(S.hud, '木匠学徒 · 1 年', cx, cy + s + v * 2.2, { f: 'sans', size: v * 1.8, w: 700, c: C.gold, al: 'center', a: ia, sh: { c: C.gold, a: .4 } });
        }
      }],
      [k3, k4, (a) => {
        X.photo(S, a, 'A40', seg(t, k3, k4 + .4), { z0: 1.03, z1: 1.1, f0: [.5, .45] });
        const bw = P ? W * .7 : G.side.w, bx = P ? W * .08 : G.side.x, by = P ? G.side.y + v * 2 : G.side.y + v * 2;
        const h1 = Y.bubble(S, x, bx, by, bw, '这个方向{不对}。', '导师', X.SG(t, F.kw(3, '一再劝') - .3, F.kw(3, '一再劝') + .3) * a);
        Y.bubble(S, x, P ? W * .22 : bx, by + (h1 || v * 8) + v * 3.5, bw, '六个月做不出来，我就{改行}。', '辛顿', X.SG(t, F.kw(3, '约好') - .2, F.kw(3, '约好') + .4) * a, true);
        const ra = X.SG(t, F.kw(3, '六个月') - .2, F.kw(3, '六个月') + .3) * a;
        if (!P) Y.ring(S, x, G.side.x + G.side.w * .5, G.side.y + G.side.h * .78, v * 6, 1 - seg(t, F.kw(3, '六个月'), F.end(3) + .6), '6', '个月', ra, C.gold);
      }],
      [k4, F.dur, (a) => {
        const k5 = F.kw(4, '再给我'), k6 = F.kw(4, '五十年'), cx = P ? W / 2 : W * .3, cy = P ? h * .38 : h * .48, r = v * (P ? 8 : 11);
        const n = Math.floor(clamp((t - k5 + .2) / Math.max(.5, k6 - k5 - .4)) * 9);
        Y.ring(S, x, cx, cy, r, ((t - k5) * (1 + n * .4)) % 1, t > k6 - .1 ? '50' : '6', t > k6 - .1 ? '年' : '个月', a * (1 - X.SG(t, k6 + 1.6, k6 + 2.2) * .3), t > k6 - .1 ? C.acc : C.gold);
        for (let i = 0; i < n; i++) { const yy = (P ? h * .58 : h * .22) + (i % 5) * v * 3.2, xx = (P ? W * .14 : W * .56) + Math.floor(i / 5) * v * 13; H.chip(S, S.hud, '+6 个月', xx, yy, { size: v * 1.5, al: 'left', a: a * X.SG(t, k5 + i * .25, k5 + .2 + i * .25) * (1 - X.SG(t, k6 - .2, k6 + .2)) }); }
        const qa = X.SG(t, k6 + .2, k6 + .8) * a;
        if (qa > 0) QUOTE(S, S.hud, P ? { x: W * .07, y: h * .56, w: W * .86 } : { x: W * .5, y: h * .34, w: W * .43 }, '幸好我没告诉他：其实要{ 50 年}。', '辛顿 · 爱丁堡大学口述史访谈', qa);
      }],
    ]);
  },
});

/* ===== 第九幕 · 反向传播 ===== */
L1S.push({
  tin: { type: 'wipe', ang: -.4 }, tdur: .7, mood: 'main', lead: .5, gap: .35, tail: 1.1,
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k1 = F.cue(1) - .2, k2 = F.cue(2) - .2, k3 = F.cue(3) - .2, k4 = F.cue(4) - .2;
    H.bg(S, t, { cold: t > k3 ? .6 : 0 });
    if (t < k3) STAMP(S, t, .3, '1986.10.09 · NATURE 323', '《自然》杂志', { a: 1 - X.SG(t, k3 - .3, k3) });
    else if (t > k4) STAMP(S, t, k4 + .2, '1987 · TORONTO', '多伦多');
    shots(t, [
      [0, k1, (a) => {
        const pw = P ? W * .56 : W * .34, cx = P ? W * .5 : W * .25, cy = P ? h * .39 : h * .52;
        const D = DOC.draw(S, x, 'nature', cx, cy, pw, { rot: lerp(.1, -.03, X.SG(t, 0, .9)), a: X.SG(t, 0, .6) * a, hl: [{ k: 'title', p: seg(t, F.kw(0, '反向传播') - .4, F.kw(0, '反向传播') + .5) }, { k: 'auth', p: seg(t, F.kw(0, '鲁梅尔哈特') - .3, F.kw(0, '鲁梅尔哈特') + .5), c: 'rgba(255,200,107,.4)' }] });
        if (!D) return; RECON(S, S.hud, cx - pw / 2, cy - D.d.h / 2 - v * 2, X.SG(t, .5, 1) * a);
        const tb = D.box('title'); if (tb) CO(S, x, tb.r, P ? [W * .94, G.side.y + v * 6] : [W * .5, h * .28], X.SG(t, F.kw(0, '反向传播') - .2, F.kw(0, '反向传播') + .8) * a, '通过反向传播误差来学习', 'BACK-PROPAGATING ERRORS', { side: P ? -1 : 1 });
        if (!P) IDC(S, x, { x: W * .5, y: h * .5, w: W * .42, h: h * .22 }, { img: 'A12', name: '戴维·鲁梅尔哈特', en: 'DAVID RUMELHART', lines: ['合作者 · 1991 年照片'], f: [.5, .3] }, X.SG(t, F.kw(0, '鲁梅尔哈特') - .3, F.kw(0, '鲁梅尔哈特') + .4) * a);
      }],
      [k1, k2, (a) => {
        const R = P ? { x: W * .06, y: h * .24, w: W * .88, h: h * .4 } : { x: W * .1, y: h * .22, w: W * .62, h: h * .56 };
        const fw = seg(t, k1 + .2, F.kw(1, '最后一层') - .1), bk = seg(t, F.kw(1, '往回传') - .5, F.kw(1, '告诉') + .2);
        const pts = X.mlp(S, x, R, fw, bk, a, t, { layers: [3, 5, 4, 2] });
        T(S.hud, '猜错了', R.x + R.w * .9, R.y - v * 1.4, { f: 'sans', size: v * 1.7, w: 700, c: C.red, al: 'center', a: X.SG(t, F.kw(1, '猜错') - .2, F.kw(1, '猜错') + .3) * a });
        const da = X.SG(t, F.kw(1, '告诉') - .3, F.kw(1, '告诉') + .3) * a, r = rng(8);
        if (da > 0) for (let i = 0; i < (P ? 5 : 8); i++) { const px = R.x + R.w * (.2 + r() * .6), py = R.y + R.h * (.15 + r() * .7); TAG(S, x, 'Δw ' + (r() < .5 ? '+' : '−') + (r() * .3).toFixed(2), px, py, da * X.SG(t, F.kw(1, '告诉') + i * .08, F.kw(1, '告诉') + .3 + i * .08), { size: v * 1.05, al: 'center', c: i % 2 ? C.red : C.pri }); }
        TAG(S, S.hud, '误差一层层往回传', P ? W / 2 : R.x + R.w / 2, R.y + R.h + v * 2.5, X.SG(t, F.kw(1, '往回传') - .3, F.kw(1, '往回传') + .3) * a, { al: 'center', c: C.red, f: 'sans', w: 700, size: v * 1.5 });
      }],
      [k2, k3, (a) => {
        const R = P ? { x: W * .14, y: h * .24, w: W * .72, h: W * .72 } : { x: W * .12, y: h * .2, w: h * .58, h: h * .58 };
        const sp = X.SG(t, F.kw(2, '迎刃') - .3, F.kw(2, '迎刃') + .6);
        X.xorPlot(S, x, R, { region: X.SG(t, F.kw(2, '多加一层') - .3, F.kw(2, '多加一层') + .6) }, a);
        Y.shatter(S, S.hud, R.x + R.w / 2, R.y + R.h / 2, v * (P ? 6 : 7.5), '此路不通', sp, a * (1 - X.SG(t, k2, k2 + .01) * 0));
        const NR = P ? { x: W * .1, y: R.y + R.h + v * 4, w: W * .8, h: h * .16 } : { x: W * .58, y: h * .3, w: W * .34, h: h * .4 };
        const na = X.SG(t, F.kw(2, '多层') - .3, F.kw(2, '多层') + .3) * a;
        if (na > 0) { X.mlp(S, x, NR, (t * .5) % 1, 0, na, t, { layers: [2, 2, 1] }); T(S.hud, '多加一层', NR.x + NR.w / 2, NR.y - v * 1.4, { f: 'sans', size: v * 1.6, w: 700, c: C.ok, al: 'center', a: na }); }
        if (sp > .5) TAG(S, S.hud, '异或 · 分开了', R.x + R.w / 2, R.y - v * 1.8, a * X.SG(t, F.kw(2, '迎刃'), F.kw(2, '迎刃') + .4), { al: 'center', c: C.ok, f: 'sans', w: 700, size: v * 1.5 });
      }],
      [k3, k4, (a) => {
        const m = X.photo(S, a, 'A13', seg(t, k3, k4 + .4), { z0: 1.03, z1: 1.1, f0: [.45, .5] });
        if (m) CO(S, x, m.map(.48, .3), X.sideB(S, 0, 2), X.SG(t, k3 + .2, k3 + 1) * a, 'VAX-11/780 · 80 年代主力电脑', '≈ 1 MIPS · 每秒约 100 万条指令');
        const BR = P ? { x: W * .1, y: G.side.y + v * 12, w: W * .8 } : { x: G.side.x, y: G.side.y + G.side.h * .6, w: G.side.w }, ba = X.SG(t, F.kw(3, '太慢') - .3, F.kw(3, '太慢') + .3) * a;
        if (ba > 0) { const pr = .02 + .04 * seg(t, k3, k4); x.save(); x.globalAlpha = ba; x.strokeStyle = col(C.pri, .6); x.strokeRect(BR.x, BR.y, BR.w, v * 2); x.fillStyle = col(C.pri, .8); x.fillRect(BR.x + 2, BR.y + 2, (BR.w - 4) * pr, v * 2 - 4); x.restore(); T(S.hud, '训练中… ' + Math.round(pr * 100) + '%（示意）', BR.x, BR.y - v * 1.5, { f: 'mono', size: v * 1.2, w: 500, c: C.mute, a: ba }); }
        const da = X.SG(t, F.kw(3, '数据太少') - .3, F.kw(3, '数据太少') + .3) * a; if (da > 0) H.chip(S, S.hud, '数据太少', P ? W * .5 : G.side.x + G.side.w * .3, P ? G.side.y + v * 20 : G.side.y + G.side.h * .85, { size: v * 1.8, a: da, al: 'center', hot: true });
        const na = X.SG(t, F.kw(3, '没人在乎') - .3, F.kw(3, '没人在乎') + .3) * a; if (na > 0) T(S.hud, '几乎没人在乎', P ? W * .5 : G.side.x + G.side.w * .5, P ? G.side.y + v * 26 : G.side.y + G.side.h * .97, { f: 'smiley', size: v * (P ? 2.6 : 3), c: C.cold, al: 'center', a: na });
      }],
      [k4, F.dur, (a) => {
        X.photo(S, a, 'A38', seg(t, k4, F.dur), { R: P ? G.main : G.wide, z0: 1.04, z1: 1.12, f0: [.3, .5], f1: [.5, .5] });
        TAG(S, S.hud, '不愿接受美国军方的研究经费', P ? W * .06 : W * .07, P ? G.main.y + G.main.h + v * 3 : h * .78, X.SG(t, k4 + .3, k4 + .9) * a, { f: 'sans', w: 700, size: v * 1.4, c: C.gold });
        const ya = X.SG(t, F.kw(4, '冷板凳') - .5, F.kw(4, '冷板凳')) * a;
        if (ya > 0) {
          const cx = P ? W * .5 : W * .74, cy = P ? G.side.y + G.side.h * .55 : h * .45; H.icon(x, 'bench', cx - v * 4, cy - v * 4, v * 8, C.cold, ya, 1.6);
          const yr = Math.round(lerp(1987, 2012, E.io3(seg(t, F.kw(4, '冷板凳') - .3, F.dur - .3))));
          T(S.hud, String(yr), cx, cy + v * 6.5, { f: 'interd', size: v * (P ? 4 : 5), w: 900, c: C.ink, al: 'center', a: ya, sh: { c: C.pri, a: .5 } });
          T(S.hud, '冷板凳 · 二十多年', cx, cy + v * 10.5, { f: 'sans', size: v * 1.6, w: 500, c: C.cold, al: 'center', a: ya });
        }
      }],
    ]);
  },
});

/* ===== 第十幕 · 一套课本 ===== */
L1S.push({
  tin: { type: 'iris', x: .5, y: .5 }, tdur: .8, mood: 'main', lead: .5, gap: .35, tail: .9, sfx: [[.4, 'rise']],
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k = i => F.cue(i) - .2;
    H.bg(S, t, {});
    if (t > k(1) && t < k(4)) STAMP(S, t, k(1) + .2, '2007 · PRINCETON', '普林斯顿大学', { a: 1 - X.SG(t, k(4) - .3, k(4)) });
    else if (t > k(6)) STAMP(S, t, k(6) + .2, '2009 · CVPR · FLORIDA', '计算机视觉大会 · 佛罗里达');
    shots(t, [
      [0, k(1), (a) => {
        Y.wall(S, x, full(S), seg(t, .1, 1.4), a * (1 - .5 * X.SG(t, F.kw(0, '数据') - .3, F.kw(0, '数据') + .3)), { dim: .7 });
        x.save(); x.globalAlpha = a * .55; x.fillStyle = '#02040a'; x.fillRect(0, 0, W, h); x.restore();
        T(S.hud, 'DATA', W / 2, h * .45, { f: 'interd', size: v * (P ? 9 : 14), w: 900, c: C.ink, al: 'center', tr: .1, a: X.SG(t, F.kw(0, '数据') - .3, F.kw(0, '数据') + .3) * a, sh: { c: C.pri, a: .8 } });
        T(S.hud, '数据', W / 2, h * .45 + v * (P ? 7.5 : 11), { f: 'smiley', size: v * (P ? 4 : 5), c: C.priHi, al: 'center', a: X.SG(t, F.kw(0, '数据'), F.kw(0, '数据') + .5) * a });
        TAG(S, S.hud, '示例图片 · Unsplash · CC0', W - v * 2, h * .8, a, { al: 'right', size: v * 1 });
      }],
      [k(1), k(2), (a) => {
        const tl = F.kw(1, '李飞飞') - .3;
        X.photo(S, a * (1 - X.SG(t, tl, tl + .5)), 'A41', seg(t, k(1), tl + .5), { R: P ? G.main : G.wide, z0: 1.04, z1: 1.1, f0: [.5, .5] });
        const pa = X.SG(t, tl, tl + .6) * a;
        if (pa > 0) { const m = X.photo(S, pa, 'A14', seg(t, tl, k(2) + .5), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .4, h: h * .64 }, z0: 1.02, z1: 1.1, f0: [.5, .45], depth: .8 }); if (m) CO(S, x, m.map(.5, .3), P ? [W * .55, G.main.y + G.main.h + v * 3] : [W * .48, h * .26], X.SG(t, tl + .4, tl + 1.2) * a, '李飞飞 · 普林斯顿助理教授', 'FEI-FEI LI · 2017 年照片', { side: 1 }); }
        const ca = X.SG(t, F.kw(1, '看图识字') - .4, F.kw(1, '看图识字') + .3) * a;
        if (ca > 0) {
          const R = P ? { x: W * .2, y: G.side.y + v * 8, w: W * .6, h: W * .4 } : { x: W * .55, y: h * .44, w: W * .3, h: W * .2 };
          PH(S, x, 'A27', { x: R.x, y: R.y, w: R.w * .6, h: R.h }, { a: ca, p: .5, z0: 1.1, z1: 1.1, r: v * .4, vig: .2, frame: ca });
          T(S.hud, '→', R.x + R.w * .7, R.y + R.h / 2, { f: 'sans', size: v * 3, c: C.pri, al: 'center', a: ca });
          T(S.hud, 'cat', R.x + R.w * .88, R.y + R.h / 2, { f: 'interd', size: v * 3.4, w: 900, c: C.ink, al: 'center', a: ca, sh: { c: C.pri, a: .6 } });
          T(S.hud, '看图识字', R.x + R.w / 2, R.y + R.h + v * 2.4, { f: 'sans', size: v * 1.7, w: 700, c: C.gold, al: 'center', a: ca });
        }
      }],
      [k(2), k(3), (a) => {
        QUOTE(S, S.hud, P ? { x: W * .07, y: h * .24, w: W * .86 } : { x: W * .08, y: h * .26, w: W * .42 }, '你把这个想法推得{太远}了。', '李飞飞的导师 · 见李飞飞回忆录', X.SG(t, k(2), k(2) + .6) * a);
        const ca = X.SG(t, F.kw(2, '一算') - .3, F.kw(2, '一算') + .3) * a, cx = P ? W * .5 : W * .74, cy = P ? h * .58 : h * .5;
        if (ca > 0) {
          const rows = ['4 万类 × 每类 1 万张', '每张核对 3 遍', '每秒最多标 2 张'];
          rows.forEach((s, i) => T(S.hud, s, cx, cy - v * 6 + i * v * 3.2, { f: 'sans', size: v * (P ? 1.6 : 1.8), w: 500, c: C.mute, al: 'center', a: ca * X.SG(t, F.kw(2, '一算') + i * .2, F.kw(2, '一算') + .4 + i * .2) }));
          x.save(); x.globalAlpha = ca; x.strokeStyle = col(C.mute, .6); x.beginPath(); x.moveTo(cx - v * 12, cy + v * 3.2); x.lineTo(cx + v * 12, cy + v * 3.2); x.stroke(); x.restore();
          const ya = X.SG(t, F.kw(2, '将近') - .3, F.kw(2, '将近') + .3) * a; W3.num(S, S.hud, '≈ 19 年', cx, cy + v * 7.5, v * (P ? 4.4 : 5.4), { al: 'center', a: ya, c: C.accHi, sc: C.acc });
          TAG(S, S.hud, '不吃不睡 · 一个人干', cx, cy + v * 12, ya, { al: 'center', f: 'sans', size: v * 1.3, c: C.acc });
        }
      }],
      [k(3), k(4), (a) => {
        const R = P ? { x: W * .1, y: h * .24, w: W * .8, h: h * .3 } : { x: W * .1, y: h * .22, w: W * .4, h: h * .55 };
        H.panel(S, x, R.x, R.y, R.w, R.h, { a, head: 'CROWDSOURCING TASK · 示意' });
        PH(S, x, 'A28', { x: R.x + v * 1.5, y: R.y + v * 3.4, w: R.w * .55, h: R.h - v * 5 }, { a, p: .5, z0: 1.05, z1: 1.05, r: v * .3, vig: .15 });
        const opts = ['dog', 'cat', 'car'], tk = k(3) + 1;
        opts.forEach((s, i) => { const bx = R.x + R.w * .62, by = R.y + v * 6 + i * v * (P ? 4.5 : 6), chk = i === 0 && t > tk; x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .8); x.lineWidth = 1.2; x.strokeRect(bx, by - v, v * 2, v * 2); if (chk) { x.strokeStyle = col(C.ok, 1); x.lineWidth = v * .35; x.beginPath(); x.moveTo(bx + v * .4, by); x.lineTo(bx + v * .9, by + v * .6); x.lineTo(bx + v * 1.7, by - v * .7); x.stroke(); } x.restore(); T(x, s, bx + v * 3, by, { f: 'interd', size: v * 1.8, w: 700, c: chk ? C.ok : C.ink, a }); });
        const r = rng(21), n = Math.floor(30 * X.SG(t, tk, k(4)));
        for (let i = 0; i < n; i++) { const sx = r() < .5 ? -v * 5 : W + v * 5, sy = r() * h, ex = R.x + R.w * (.1 + r() * .8), ey = R.y + R.h * (.2 + r() * .7), q = clamp((t - tk) * 1.2 - i * .04); if (q <= 0 || q >= 1) continue; TAG(S, S.hud, ['dog', 'cat', 'car', 'bird', 'cup', 'house', 'flower'][i % 7], lerp(sx, ex, E.io3(q)), lerp(sy, ey, E.io3(q)), a * (1 - q * q), { size: v * 1, al: 'center' }); }
        TAG(S, S.hud, '全世界的人，一张张帮忙标注', P ? W / 2 : W * .73, P ? G.side.y + v * 10 : h * .5, X.SG(t, tk, tk + .5) * a, { al: 'center', f: 'sans', w: 700, size: v * 1.5 });
      }],
      [k(4), k(5), (a) => {
        const pi = X.SG(t, F.kw(4, '里面') - .4, F.kw(4, '真人') + .4);
        const m = X.photo(S, a, 'A16', seg(t, k(4), k(5)), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .5, h: h * .64 }, z0: 1.03 + 1.1 * pi, z1: 1.08 + 1.1 * pi, f0: [.48, .45], f1: pi > 0 ? [.58, .68] : [.48, .45], depth: .8 });
        if (m && pi > .3) { const p1 = m.map(.5, .55), p2 = m.map(.67, .83); BOX(S, x, p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1], X.SG(t, F.kw(4, '真人') - .3, F.kw(4, '真人') + .3), { c: C.acc }); }
        if (m) CO(S, x, pi > .3 ? m.map(.67, .65) : m.map(.5, .2), P ? [W * .55, G.main.y + G.main.h + v * 3] : [W * .6, h * .3], X.SG(t, pi > .3 ? F.kw(4, '真人') : k(4) + .3, (pi > .3 ? F.kw(4, '真人') : k(4) + .3) + .8) * a, pi > .3 ? '柜子里藏着真人棋手' : '“土耳其行棋傀儡”', pi > .3 ? 'HIDDEN HUMAN PLAYER' : 'THE TURK · 1770 · 冯·肯佩伦', { side: 1, c: pi > .3 ? C.acc : C.pri });
        TAG(S, S.hud, 'AI 的课本，也是真人一张张标出来的', P ? W / 2 : W * .78, P ? G.side.y + v * 12 : h * .62, X.SG(t, F.kw(4, '真人') + .4, F.kw(4, '真人') + 1) * a, { al: 'center', f: 'sans', w: 700, size: v * 1.35, c: C.gold });
      }],
      [k(5), k(6), (a) => {
        const gx = P ? W * .5 : W * .27, gy = P ? h * .36 : h * .5, gr = P ? W * .28 : h * .26;
        Y.globe(S, x, gx, gy, gr, t, Math.floor(167 * X.SG(t, k(5), F.kw(5, '国家') + .3)), a);
        const cx = P ? W * .5 : W * .66, cy = P ? h * .62 : h * .3;
        W3.num(S, S.hud, H.count(0, 167, seg(t, k(5), F.kw(5, '国家') + .3)) + ' 个国家', cx, cy, v * (P ? 2.6 : 3.2), { al: 'center', a });
        W3.num(S, S.hud, H.count(0, 49000, seg(t, F.kw(5, '国家'), F.kw(5, '千人') + .3)) + ' 人', cx, cy + v * 5, v * (P ? 2.6 : 3.2), { al: 'center', a: X.SG(t, F.kw(5, '国家'), F.kw(5, '国家') + .3) * a });
        W3.num(S, S.hud, H.count(0, 14197122, seg(t, F.kw(5, '标出') - .2, F.kw(5, 'ImageNet'))) + ' 张图片', cx, cy + v * 10, v * (P ? 2.6 : 3.2), { al: 'center', a: X.SG(t, F.kw(5, '标出') - .2, F.kw(5, '标出') + .2) * a, c: C.accHi, sc: C.acc });
        TAG(S, S.hud, '从 1.6 亿张候选图片里筛出 · 2.1 万多个类别', cx, cy + v * 14, X.SG(t, F.kw(5, '标出'), F.kw(5, '标出') + .5) * a, { al: 'center', size: v * 1.05 });
        const ia = X.SG(t, F.kw(5, 'ImageNet') - .2, F.kw(5, 'ImageNet') + .4) * a;
        if (ia > 0) { Y.wall(S, x, P ? { x: W * .05, y: h * .7, w: W * .9, h: h * .08 } : { x: W * .5, y: h * .62, w: W * .42, h: h * .14 }, 1, ia, { cell: v * 4 }); T(S.hud, 'ImageNet', P ? W / 2 : W * .71, P ? h * .74 : h * .69, { f: 'interd', size: v * (P ? 4 : 4.6), w: 900, c: C.ink, al: 'center', a: ia, sh: { c: C.pri, a: .8 } }); }
      }],
      [k(6), F.dur, (a) => {
        const px = P ? W * .5 : W * .3, py = P ? h * .42 : h * .5, pw = v * (P ? 16 : 20), ph = pw * 1.3;
        x.save(); x.globalAlpha = a; x.strokeStyle = col(C.mute, .7); x.lineWidth = v * .3; x.beginPath(); x.moveTo(px - pw * .35, py + ph * .5); x.lineTo(px - pw * .45, py + ph * .8); x.moveTo(px + pw * .35, py + ph * .5); x.lineTo(px + pw * .45, py + ph * .8); x.stroke();
        x.fillStyle = '#e9e4d8'; x.fillRect(px - pw / 2, py - ph / 2, pw, ph); x.fillStyle = '#1b2b45'; x.fillRect(px - pw / 2, py - ph / 2, pw, ph * .16); x.restore();
        T(x, 'ImageNet', px, py - ph / 2 + ph * .08, { f: 'interd', size: v * 1.6, w: 900, c: '#ffffff', al: 'center', a });
        const r = rng(31); for (let i = 0; i < 12; i++) { const im = IMG.get(L1Y.WALL[i % 7]); if (!im) continue; const cw = pw * .26, cx = px - pw / 2 + pw * .08 + (i % 3) * (cw + pw * .04), cy = py - ph / 2 + ph * .22 + Math.floor(i / 3) * (cw * .8 + pw * .04), s = Math.min(im.w, im.h); x.save(); x.globalAlpha = a; x.drawImage(im.im, (im.w - s) / 2, (im.h - s) / 2, s, s * .8, cx, cy, cw, cw * .8); x.restore(); }
        TAG(S, S.hud, '只是一块海报', px, py + ph / 2 + v * 3, X.SG(t, F.kw(6, '海报板') - .3, F.kw(6, '海报板') + .3) * a, { al: 'center', f: 'sans', w: 700, size: v * 1.5, c: C.gold });
        const ca = X.SG(t, F.kw(6, '比赛') - .4, F.kw(6, '比赛') + .3) * a;
        if (ca > 0) { const cx = P ? W * .5 : W * .72, cy = P ? h * .72 : h * .46; H.panel(S, x, cx - v * (P ? 16 : 14), cy - v * 6, v * (P ? 32 : 28), v * 12, { a: ca, head: 'CHALLENGE' }); T(S.hud, 'ILSVRC 2010', cx, cy - v * .6, { f: 'interd', size: v * (P ? 2.8 : 3.2), w: 900, c: C.ink, al: 'center', a: ca, sh: { c: C.pri, a: .6 } }); T(S.hud, '图像识别大赛 · 1000 类', cx, cy + v * 3.2, { f: 'sans', size: v * 1.6, w: 500, c: C.priHi, al: 'center', a: ca }); }
      }],
    ]);
  },
});
function full(S) { return { x: 0, y: 0, w: S.W, h: S.H }; }
