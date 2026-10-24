'use strict';
/* 第 1 课（纪录片版）· 第十一幕 ~ 尾声 + 片尾 + 组装 */

/* ===== 第十一幕 · 卧室里的显卡 ===== */
L1S.push({
  tin: { type: 'wipe', ang: .35 }, tdur: .7, mood: 'main', lead: .5, gap: .35, tail: 1.0, sfx: [[.3, 'whoosh']],
  camera: (t, S, F) => { const tk = F.kw(3, '15.3') ; const sh = t > tk && t < tk + .35 ? (1 - (t - tk) / .35) * S.v * .5 : 0; return { z: 1, x: sh * Math.sin(t * 80), y: sh * Math.cos(t * 70) }; },
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k = i => F.cue(i) - .2;
    H.bg(S, t, {});
    if (t < k(3)) STAMP(S, t, .2, '2012 · TORONTO', '多伦多', { a: 1 - X.SG(t, k(3) - .3, k(3)) });
    else if (t < k(4)) STAMP(S, t, k(3) + .2, '2012.09.30 · ILSVRC 2012', '图像识别大赛 · 成绩公布', { a: 1 - X.SG(t, k(4) - .3, k(4)) });
    else STAMP(S, t, k(4) + .2, '2012.10 · FIRENZE', '佛罗伦萨 · 计算机视觉研讨会');
    shots(t, [
      [0, k(1), (a) => {
        const cw = P ? W * .86 : W * .41, ch = P ? h * .13 : h * .27;
        const R1 = P ? { x: W * .07, y: h * .24, w: cw, h: ch } : { x: W * .06, y: h * .25, w: cw, h: ch }, R2 = P ? { x: W * .07, y: h * .24 + ch + v * 4, w: cw, h: ch } : { x: W * .53, y: h * .25, w: cw, h: ch };
        IDC(S, x, R1, { img: 'A33', name: '伊利亚·苏茨克维', en: 'ILYA SUTSKEVER', lines: ['辛顿的学生 · 2014 年照片'], f: [.5, .3] }, X.SG(t, F.kw(0, '伊利亚') - .4, F.kw(0, '伊利亚') + .3) * a);
        IDC(S, x, R2, { noimg: '无授权照片', name: '亚历克斯·克里泽夫斯基', en: 'ALEX KRIZHEVSKY', lines: ['辛顿的学生'], c: C.acc }, X.SG(t, F.kw(0, '亚历克斯') - .4, F.kw(0, '亚历克斯') + .3) * a);
        const ba = X.SG(t, F.kw(0, '我们去') - .3, F.kw(0, '我们去') + .3) * a;
        L1Y.bubble(S, x, P ? W * .14 : W * .2, P ? R2.y + ch + v * 5 : h * .6, P ? W * .72 : W * .34, '我们去{参赛}！', '伊利亚', ba);
      }],
      [k(1), k(2), (a) => {
        const gp = X.SG(t, F.kw(1, 'GTX') - .4, F.kw(1, 'GTX') + .3);
        const R = P ? { x: W * .1, y: h * .22, w: W * .8, h: h * .3 } : { x: W * .07, y: h * .22, w: W * .36, h: h * .56 }, day = (t - k(1)) * .6;
        x.save(); x.globalAlpha = a; rrect(x, R.x, R.y, R.w, R.h, v * .6); x.fillStyle = 'rgba(8,14,28,.85)'; x.fill(); x.strokeStyle = col(C.pri, .35); x.stroke();
        const wx = R.x + R.w * .58, wy = R.y + R.h * .1, ww = R.w * .34, wh = R.h * .34, dl = .5 + .5 * Math.sin(day * TAU); const sky = x.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, col(mix('#071026', '#7fb8ff', dl), 1)); sky.addColorStop(1, col(mix('#160c2a', '#ffd9a0', dl), 1)); x.fillStyle = sky; x.fillRect(wx, wy, ww, wh); x.strokeStyle = 'rgba(0,0,0,.8)'; x.lineWidth = v * .5; x.strokeRect(wx, wy, ww, wh); x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.stroke();
        x.fillStyle = '#121a2c'; x.fillRect(R.x + R.w * .08, R.y + R.h * .62, R.w * .84, R.h * .05); x.fillStyle = '#0b1120'; x.fillRect(R.x + R.w * .14, R.y + R.h * .67, R.w * .05, R.h * .3); x.fillRect(R.x + R.w * .81, R.y + R.h * .67, R.w * .05, R.h * .3);
        const tx = R.x + R.w * .18, ty = R.y + R.h * .3, tw = R.w * .22, th = R.h * .32; x.fillStyle = '#0d1426'; x.fillRect(tx, ty, tw, th); x.strokeStyle = col(C.pri, .6); x.strokeRect(tx, ty, tw, th); x.restore();
        for (let i = 0; i < 2; i++) { const yy = ty + th * (.35 + i * .3); x.save(); x.globalAlpha = a; x.fillStyle = col(C.ok, .6 + .4 * Math.sin(t * 6 + i)); x.fillRect(tx + tw * .15, yy, tw * .7, th * .1); x.restore(); haze(S.glow, tx + tw / 2, yy, v * 4, C.ok, .5 * a); }
        T(S.hud, '父母家的卧室（示意）', R.x + R.w / 2, R.y + R.h + v * 2, { f: 'sans', size: v * 1.3, w: 500, c: C.mute, al: 'center', a });
        if (gp > 0) {
          const GR = P ? { x: W * .08, y: G.side.y + v * 2, w: W * .84, h: W * .84 * .65 } : { x: W * .48, y: h * .2, w: W * .46, h: W * .46 * .65 };
          const m = PH(S, x, 'A15', GR, { a: a * gp, p: seg(t, F.kw(1, 'GTX') - .4, k(2) + .3), z0: .96, z1: 1.04, contain: true, vig: 0, r: 0, flick: false, cred: X.CR.A15 });
          if (m) CO(S, x, m.map(.42, .48), P ? [W * .94, GR.y + GR.h + coH(S) * .5 + v * 1.2] : [W * .9, h * .22], X.SG(t, F.kw(1, 'GTX'), F.kw(1, 'GTX') + .8) * a, 'GTX 580 × 2', '打游戏用的显卡', { side: -1 });
          const da = X.SG(t, F.kw(1, '五六天') - .3, F.kw(1, '五六天') + .3) * a;
          if (da > 0) { const d = Math.min(6, 1 + Math.floor((t - F.kw(1, '五六天') + .3) * 3.5)); TAG(S, S.hud, '第 ' + d + ' 天 · 日夜不停', P ? W * .5 : W * .71, P ? GR.y + GR.h + v * 9 : h * .8, da, { al: 'center', f: 'sans', w: 700, size: v * 1.5, c: C.gold }); }
        }
      }],
      [k(2), k(3), (a) => {
        const MR = P ? { x: W * .1, y: h * .26, w: W * .8 } : { x: W * .1, y: h * .3, w: W * .36 }, mp = X.SG(t, k(2) + .2, F.kw(2, '装不下') + .2), over = t > F.kw(2, '装不下') - .1;
        x.save(); x.globalAlpha = a; x.strokeStyle = col(C.pri, .6); x.lineWidth = 1.2; x.strokeRect(MR.x, MR.y, MR.w, v * 3); x.fillStyle = col(over ? C.red : C.pri, .85); x.fillRect(MR.x + 2, MR.y + 2, (MR.w - 4) * Math.min(1, mp * 1.25), v * 3 - 4); x.restore();
        T(S.hud, '一块显卡的显存：3GB', MR.x, MR.y - v * 1.6, { f: 'sans', size: v * 1.5, w: 700, c: C.ink, a });
        if (over) T(S.hud, '装不下！', MR.x + MR.w, MR.y + v * 5.2, { f: 'sans', size: v * 2, w: 900, c: C.red, al: 'right', a: a * (.6 + .4 * Math.sin(t * 12)) });
        const sp = X.SG(t, F.kw(2, '劈成两半') - .3, F.kw(2, '劈成两半') + .6), NR = P ? { x: W * .1, y: h * .4, w: W * .8, h: h * .24 } : { x: W * .52, y: h * .24, w: W * .4, h: h * .4 };
        const half = (side) => { const off = (side ? 1 : -1) * sp * (P ? v * 2 : v * 3), pts = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) pts.push([NR.x + NR.w * (side ? .55 : .05) + (j / 3) * NR.w * .4 + off, NR.y + NR.h * (.12 + i * .25)]); return pts; };
        [0, 1].forEach(sd => { const pts = half(sd); x.save(); x.globalAlpha = a * .5; x.strokeStyle = col(sd ? C.acc : C.pri, .6); for (let i = 0; i < pts.length - 4; i++) { x.beginPath(); x.moveTo(pts[i][0], pts[i][1]); x.lineTo(pts[i + 4][0], pts[i + 4][1]); x.stroke(); } x.restore(); pts.forEach(([px, py]) => H.node(S, px, py, v * .7, { lit: .8, c: sd ? C.acc : C.pri, a })); });
        if (sp > 0) { [0, 1].forEach(sd => { const bx = NR.x + NR.w * (sd ? .57 : .07) + (sd ? 1 : -1) * sp * v * 3, by = NR.y + NR.h + v * 2.5; x.save(); x.globalAlpha = a * sp; rrect(x, bx, by, NR.w * .36, v * 4, v * .5); x.fillStyle = 'rgba(6,20,16,.85)'; x.fill(); x.strokeStyle = col(C.ok, .8); x.stroke(); x.restore(); T(S.hud, 'GPU ' + (sd + 1), bx + NR.w * .18, by + v * 2, { f: 'mono', size: v * 1.6, w: 500, c: C.ok, al: 'center', a: a * sp }); }); }
        TAG(S, S.hud, '把网络劈成两半，一块显卡跑一半', P ? W / 2 : NR.x + NR.w / 2, P ? NR.y - v * 2.5 : NR.y - v * 2, sp * a, { al: 'center', f: 'sans', w: 700, size: v * 1.4, c: C.ok });
      }],
      [k(3), k(4), (a) => {
        const R = P ? { x: W * .1, y: h * .24, w: W * .8, h: h * .5 } : { x: W * .22, y: h * .2, w: W * .5, h: h * .62 };
        const bp = X.SG(t, F.kw(3, '26.2') - .5, F.kw(3, '15.3') + .5);
        const B = W3.bars(S, x, R, [['第二名', 26.2, C.mute], ['AlexNet', 15.3, C.pri]], bp, { a, max: 30, ticks: [10, 20, 30], fmt: v0 => v0 + '%', vfmt: q => q.toFixed(1) + '%' });
        const ga = X.SG(t, F.kw(3, '15.3') + .2, F.kw(3, '15.3') + .8) * a;
        if (ga > 0 && B) { const y1 = B.ay - B.ah * 26.2 / 30, y2 = B.ay - B.ah * 15.3 / 30, gx = R.x + R.w * .93; x.save(); x.globalAlpha = ga; x.strokeStyle = col(C.acc, .95); x.lineWidth = 1.5; x.beginPath(); x.moveTo(gx - v, y1); x.lineTo(gx, y1); x.lineTo(gx, y2); x.lineTo(gx - v, y2); x.stroke(); x.restore(); T(S.hud, '−10.9', gx + v * .8, (y1 + y2) / 2 - v, { f: 'interd', size: v * 2.2, w: 900, c: C.accHi, a: ga }); T(S.hud, '个百分点', gx + v * .8, (y1 + y2) / 2 + v * 1.6, { f: 'sans', size: v * 1.2, w: 500, c: C.acc, a: ga }); }
        TAG(S, S.hud, 'TOP-5 错误率 · 越低越好 · 数据：AlexNet 论文', R.x, R.y - v * 1.2, a, { size: v * 1.05 });
      }],
      [k(4), k(5), (a) => {
        X.fullPhoto(S, a, 'A37', seg(t, k(4), k(5) + .4), { z0: 1.03, z1: 1.1, f0: [.6, .5] });
        const ca = X.SG(t, F.kw(4, '水泄不通') - .4, F.kw(4, '水泄不通') + .2) * a, r = rng(12);
        if (ca > 0) { for (let row = 0; row < 3; row++) for (let i = 0; i < 22; i++) { const px = (i + (row % 2) * .5) / 21 * W, py = h * (.86 + row * .05), s = v * (2.2 + row * .5); x.save(); x.globalAlpha = ca * .95; x.fillStyle = '#04060c'; x.beginPath(); x.arc(px, py - s * .8, s * .55, 0, TAU); x.fill(); x.fillRect(px - s * .8, py - s * .25, s * 1.6, s * 1.6); x.restore(); } TAG(S, S.hud, '座无虚席（示意）', W / 2, h * .78, ca, { al: 'center', f: 'sans', w: 700, size: v * 1.4 }); }
      }],
      [k(5), k(6), (a) => {
        const m = X.photo(S, a, 'A36', seg(t, k(5), k(6) + .4), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .36, h: h * .64 }, z0: 1.02, z1: 1.1, f0: [.5, .35], depth: .8 });
        if (m) CO(S, x, m.map(.5, .25), P ? [W * .55, G.main.y + G.main.h + coH(S) * .5 + v * 1.2] : [W * .45, h * .25], X.SG(t, k(5) + .2, k(5) + 1) * a, '杨立昆', 'YANN LECUN · 2018 年照片', { side: 1 });
        QUOTE(S, S.hud, P ? { x: W * .07, y: G.side.y + v * 8, w: W * .86 } : { x: W * .45, y: h * .36, w: W * .48 }, '这是计算机视觉史上，一个{毫无疑问的转折点}。', '杨立昆 · 2012 年（见李飞飞回忆录）', X.SG(t, F.kw(5, '计算机视觉') - .4, F.kw(5, '计算机视觉') + .2) * a);
      }],
      [k(6), F.dur, (a) => {
        const lt = t - k(6), mg = X.SG(t, F.kw(6, '数据') - .2, F.kw(6, '算力') + .6), cx = W / 2, cy = P ? h * .45 : h * .48, s = v * (P ? 14 : 19);
        const tiles = [['想法', '1958', 'A02'], ['数据', 'ImageNet', 'A27'], ['算力', 'GPU', 'A15']];
        tiles.forEach(([n1, n2, id], i) => {
          const ta = X.SG(t, k(6) + i * .35, k(6) + .5 + i * .35) * a, px0 = cx + (i - 1) * s * 1.35, py0 = cy, px = lerp(px0, cx + (i - 1) * s * .52, mg), sc = lerp(1, .5, mg);
          if (ta <= 0) return; const R = { x: px - s * sc / 2, y: py0 - s * sc / 2, w: s * sc, h: s * sc };
          PH(S, x, id, R, { a: ta, p: .5, z0: 1.1, z1: 1.1, contain: id === 'A15', r: v * .5, vig: .2, frame: ta, flick: false, scratch: false, bgc: 'rgba(6,12,26,.9)' });
          T(S.hud, n1, px, R.y + R.h + v * 2.2, { f: 'smiley', size: v * 2.4 * (1 - mg * .3), c: C.ink, al: 'center', a: ta * (1 - mg * .8) });
          T(S.hud, n2, px, R.y - v * 1.4, { f: 'mono', size: v * 1.2, w: 500, c: C.pri, al: 'center', a: ta * (1 - mg * .8) });
        });
        const ba = X.SG(t, F.kw(6, '算力') + .2, F.kw(6, '算力') + .8) * a;
        if (ba > 0) { haze(S.glow, cx, cy, s * 2.4 * ba, C.priHi, .9 * ba); T(S.hud, '深度学习', cx, cy + s * .62, { f: 'smiley', size: v * (P ? 4 : 5), c: C.ink, al: 'center', a: ba, sh: { c: C.pri, a: .8 } }); }
      }],
    ]);
  },
});

/* ===== 第十二幕 · 太浩湖拍卖 ===== */
L1S.push({
  tin: { type: 'fade' }, tdur: .7, mood: 'main', lead: .5, gap: .35, tail: .9,
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k = i => F.cue(i) - .2;
    H.bg(S, t, { hue: t > k(3) ? 'gold' : '' });
    STAMP(S, t, .3, '2012.12 · LAKE TAHOE', '太浩湖 · NIPS 大会期间');
    const bid = [['谷歌', C.pri], ['微软', C.sec], ['百度', C.acc], ['DeepMind', C.gold]];
    shots(t, [
      [0, k(1), (a) => {
        const th = F.kw(0, '哈拉斯') - .5;
        X.fullPhoto(S, a * (1 - X.SG(t, th, th + .5)), 'A44', seg(t, 0, th + .5), { z0: 1.02, z1: 1.08, f0: [.4, .5], f1: [.55, .5] });
        const pa = X.SG(t, th, th + .5) * a; if (pa > 0) { const m = X.photo(S, pa, 'A17', seg(t, th, k(1) + .6), { R: P ? G.main : G.wide, z0: 1.03, z1: 1.12, f0: [.5, .4] }); if (m) CO(S, x, m.map(.55, .25), P ? [W * .55, G.main.y + G.main.h + coH(S) * .5 + v * 1.2] : [W * .7, h * .3], X.SG(t, th + .4, th + 1.2) * a, '哈拉斯赌场酒店', "HARRAH'S · 2022 年照片", { side: 1 }); }
      }],
      [k(1), k(2), (a) => {
        const R = P ? { x: W * .08, y: h * .24, w: W * .84, h: h * .3 } : { x: W * .2, y: h * .22, w: W * .6, h: h * .5 };
        H.panel(S, x, R.x, R.y, R.w, R.h, { a, head: 'COMPANY CARD · 示意' });
        T(S.hud, 'DNNresearch Inc.', R.x + R.w / 2, R.y + R.h * .26, { f: 'interd', size: v * (P ? 3 : 4), w: 900, c: C.ink, al: 'center', a, sh: { c: C.pri, a: .6 } });
        T(S.hud, '2012 · 多伦多', R.x + R.w / 2, R.y + R.h * .26 + v * 4.2, { f: 'sans', size: v * 1.5, w: 500, c: C.mute, al: 'center', a });
        const ppl = [['A22', '辛顿'], ['A33', '伊利亚'], [null, '亚历克斯']];
        ppl.forEach(([id, n], i) => {
          const pa = X.SG(t, F.kw(1, '三个人') - .5 + i * .2, F.kw(1, '三个人') + i * .2) * a, s = v * (P ? 6 : 8), px = R.x + R.w * (.25 + i * .25) - s / 2, py = R.y + R.h * .52;
          if (pa <= 0) return; if (id) PH(S, x, id, { x: px, y: py, w: s, h: s }, { a: pa, p: .5, z0: 1.15, z1: 1.15, f0: [.5, .3], r: s / 2, vig: .1, scratch: false, flick: false }); else { x.save(); x.globalAlpha = pa; x.beginPath(); x.arc(px + s / 2, py + s / 2, s / 2, 0, TAU); x.fillStyle = 'rgba(69,227,255,.06)'; x.fill(); x.setLineDash([3, 4]); x.strokeStyle = col(C.mute, .6); x.stroke(); x.setLineDash([]); x.restore(); H.icon(x, 'person', px + s * .22, py + s * .2, s * .56, C.mute, pa); }
          T(S.hud, n, px + s / 2, py + s + v * 1.8, { f: 'sans', size: v * 1.5, w: 700, c: C.ink, al: 'center', a: pa });
        });
        H.chip(S, S.hud, '员工：3 人', R.x + R.w / 2, R.y + R.h - v * 2, { size: v * 1.6, al: 'center', a: X.SG(t, F.kw(1, '三个人'), F.kw(1, '三个人') + .4) * a, hot: true });
      }],
      [k(2), k(4), (a) => {
        const cx = W / 2, cy = P ? h * .42 : h * .48, rr = P ? W * .33 : h * .3, out = { 1: F.kw(3, '涨到') + .1, 3: k(2) + 2.2 };
        x.save(); x.globalAlpha = a; x.beginPath(); x.arc(cx, cy, v * 5, 0, TAU); x.fillStyle = 'rgba(30,20,4,.85)'; x.fill(); x.strokeStyle = col(C.gold, .8); x.lineWidth = 1.5; x.stroke(); x.restore();
        const price = t < k(3) ? 0 : Math.min(44, Math.floor(lerp(0, 44, E.io3(seg(t, F.kw(3, '涨到'), F.kw(3, '万美元') + .2)))));
        W3.num(S, S.hud, price ? '$' + price + 'M' : '拍卖', cx, cy, v * (price ? 2.6 : 2), { al: 'center', f: price ? 'interd' : 'sans', c: C.gold, sc: C.gold, a });
        bid.forEach(([n, c], i) => {
          const ang = -Math.PI / 2 + i * TAU / 4 + Math.PI / 4, bx = cx + Math.cos(ang) * rr, by = cy + Math.sin(ang) * rr * (P ? .9 : .85), ba = X.SG(t, k(2) + i * .25, k(2) + .5 + i * .25) * a, gone = out[i] && t > out[i] ? X.SG(t, out[i], out[i] + .5) : 0;
          if (ba <= 0) return; H.chip(S, x, n, bx, by, { size: v * (P ? 1.7 : 2), al: 'center', a: ba * (1 - gone * .7), c });
          if (gone > 0) T(S.hud, i === 1 ? '2200 万时退出' : '早早退出', bx, by + v * 3, { f: 'sans', size: v * 1.2, w: 500, c: C.mute, al: 'center', a: gone * a });
          if (!gone) for (let m = 0; m < 2; m++) { const q = ((t - k(2)) * .9 + m * .5 + i * .23) % 1, px = lerp(bx, cx, q), py = lerp(by, cy, q); x.save(); x.globalAlpha = ba * (1 - q) ; x.strokeStyle = col(c, .9); x.lineWidth = 1; x.strokeRect(px - v * .9, py - v * .6, v * 1.8, v * 1.2); x.beginPath(); x.moveTo(px - v * .9, py - v * .6); x.lineTo(px, py + v * .1); x.lineTo(px + v * .9, py - v * .6); x.stroke(); x.restore(); }
        });
        TAG(S, S.hud, '邮件竞价 · 每轮 1 小时 · 至少加 100 万美元', cx, P ? h * .74 : h * .82, X.SG(t, F.kw(2, '每轮') - .3, F.kw(2, '每轮') + .3) * a, { al: 'center', f: 'sans', w: 700, size: v * 1.3 });
        const fa = X.SG(t, F.kw(3, '万美元') - .1, F.kw(3, '万美元') + .5) * a; if (fa > 0) T(S.hud, '$44,000,000', cx, P ? h * .22 : h * .2, { f: 'interd', size: v * (P ? 4.2 : 5.4), w: 900, c: C.ink, al: 'center', a: fa, sh: { c: C.gold, a: .8 } });
      }],
      [k(4), k(5), (a) => {
        const tg = F.kw(4, '谷歌') - .4, ca = 1 - X.SG(t, tg, tg + .5);
        if (ca > 0) { const cx = W / 2, cy = P ? h * .42 : h * .48, r = v * (P ? 9 : 12), mm = lerp(50, 59.9, seg(t, k(4), tg)); x.save(); x.globalAlpha = a * ca; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fillStyle = 'rgba(6,12,26,.85)'; x.fill(); x.strokeStyle = col(C.gold, .8); x.lineWidth = 2; x.stroke(); for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; x.fillStyle = col(C.mute, .8); x.fillRect(cx + Math.cos(an) * r * .85 - 1, cy + Math.sin(an) * r * .85 - 1, 2, 2); } const am = mm / 60 * TAU - Math.PI / 2, ah = (11 + mm / 60) / 12 * TAU - Math.PI / 2; x.strokeStyle = col(C.ink, 1); x.lineWidth = v * .3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(ah) * r * .5, cy + Math.sin(ah) * r * .5); x.stroke(); x.lineWidth = v * .2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(am) * r * .78, cy + Math.sin(am) * r * .78); x.stroke(); x.restore(); T(S.hud, '快到午夜', cx, cy + r + v * 3, { f: 'sans', size: v * 1.8, w: 700, c: C.gold, al: 'center', a: a * ca }); TAG(S, S.hud, '辛顿 65 岁', cx, cy - r - v * 2.5, a * ca, { al: 'center', f: 'sans', size: v * 1.3 }); }
        const pa = X.SG(t, tg, tg + .5) * a; if (pa > 0) { X.photo(S, pa, 'A18', seg(t, tg, k(5) + .5), { R: P ? G.main : G.wide, z0: 1.04, z1: 1.12, f0: [.5, .5] }); H.chip(S, S.hud, '成交 · 谷歌', P ? W / 2 : W * .5, P ? G.main.y + G.main.h + v * 4 : h * .3, { size: v * 2.4, al: 'center', a: X.SG(t, tg + .3, tg + .8) * a, hot: true }); }
      }],
      [k(5), F.dur, (a) => {
        const R = P ? { x: W * .08, y: h * .24, w: W * .84, h: h * .38 } : { x: W * .18, y: h * .22, w: W * .64, h: h * .52 }, gp = X.SG(t, F.kw(5, '值钱') - .5, F.kw(5, '值钱') + .5);
        const pts = X.mlp(S, x, R, (t * .4) % 1, 0, a, t, { layers: [4, 6, 6, 3] });
        pts.forEach((c, i) => c.forEach(([px, py], j) => { const q = clamp(gp * 3 - (i + j * .2) * .3); if (q > 0) H.node(S, px, py, S.v * 1.4, { lit: 1, c: C.gold, a: a * q }); }));
        const r = rng(44); if (gp > 0) for (let i = 0; i < 26; i++) { const px = r() * W, py = ((r() + (t - k(5)) * .35) % 1) * h; T(S.hud, '$', px, py, { f: 'interd', size: v * (1.2 + r() * 1.5), w: 900, c: C.gold, al: 'center', a: a * gp * .5 }); }
        TAG(S, S.hud, '2013.03 · 谷歌完成收购', W / 2, P ? R.y + R.h + v * 4 : h * .8, X.SG(t, F.kw(5, '值钱'), F.kw(5, '值钱') + .5) * a, { al: 'center', size: v * 1.3, c: C.gold });
      }],
    ]);
  },
});

/* ===== 第十三幕 · 注意力 ===== */
L1S.push({
  tin: { type: 'iris', x: .5, y: .5 }, tdur: .8, mood: 'main', lead: .5, gap: .35, tail: 1.0, sfx: [[.4, 'rise']],
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k = i => F.cue(i) - .2;
    H.bg(S, t, {});
    if (t < k(5)) STAMP(S, t, .3, '2017.06 · GOOGLE', '谷歌 · 八位研究者的论文', { a: 1 - X.SG(t, k(5) - .3, k(5)) });
    else STAMP(S, t, k(5) + .2, '2022.11.30 · CHATGPT', '大模型时代');
    const toks = (s, R, kwT) => { const n = s.length, gap = R.w / n; return s.map((w, i) => [R.x + gap * (i + .5), R.y + R.h / 2, w]); };
    shots(t, [
      [0, k(2), (a) => {
        const top0 = headGeo(S).bottom + v * 1.5, pw = P ? W * .5 : Math.min(W * .3, (h * .93 - top0) / 1.3), cx = P ? W * .5 : W * .24, cy = P ? h * .38 : top0 + pw * .65;   /* 横屏：论文页从标题下方开始 */
        const D = DOC.draw(S, x, 'attn', cx, cy, pw, { rot: lerp(.08, -.03, X.SG(t, 0, .9)), a: X.SG(t, 0, .6) * a, hl: [{ k: 'title', p: seg(t, F.kw(0, '注意力') - .3, F.kw(0, '一切') + .3) }, { k: 'gomez', p: seg(t, k(1) + .2, k(1) + .9), c: 'rgba(255,79,216,.35)' }] });
        if (!D) return; RECON(S, S.hud, P ? cx - pw / 2 : cx + pw / 2 + v * .8, P ? cy - D.d.h / 2 - v * 2 : cy - D.d.h / 2 + fsz(v * 1.15) * .95, X.SG(t, .5, 1) * a);   /* 横屏：标在页面右上角外侧，不挡刊头 */
        const tb = D.box('title'); if (tb) CO(S, x, tb.r, P ? [W * .94, G.side.y + v * 6] : [W * .52, h * .28], X.SG(t, F.kw(0, '注意力') - .2, F.kw(0, '注意力') + .8) * a * (1 - X.SG(t, k(1) - .2, k(1) + .2)), '注意力就是你所需要的一切', 'ATTENTION IS ALL YOU NEED', { side: P ? -1 : 1 });
        TAG(S, S.hud, '化用披头士 · All You Need Is Love', P ? W / 2 : W * .7, P ? G.side.y + v * 13 : h * .46, X.SG(t, F.kw(0, '披头士') - .2, F.kw(0, '披头士') + .4) * a * (1 - X.SG(t, k(1) - .2, k(1) + .2)), { al: 'center', f: 'sans', w: 700, size: v * 1.4, c: C.gold });
        const ga = X.SG(t, k(1), k(1) + .6) * a;
        if (ga > 0) { const R = P ? { x: W * .2, y: G.side.y + v * 3, w: W * .6, h: h * .22 } : { x: W * .55, y: h * .2, w: W * .36, h: h * .5 }; const m = PH(S, x, 'A43', R, { a: ga, p: seg(t, k(1), k(2)), z0: 1.03, z1: 1.1, f0: [.5, .35], depth: .8, frame: ga, cred: X.CR.A43 }); if (m) CO(S, x, m.map(.55, .2), P ? [W * .94, R.y + R.h + coH(S) * .5 + v * 1.2] : [W * .55, h * .76], X.SG(t, k(1) + .4, k(1) + 1.2) * a, '艾丹·戈麦斯', '2017 年 20 岁 · 谷歌大脑实习生', { side: P ? -1 : 1 }); }
      }],
      [k(2), k(4), (a) => {
        const s1 = ['每', '个', '词', '都', '去', '注', '意', '其', '他', '词'], s2 = ['猫', '没', '吃', '鱼', '，', '因为', '它', '不', '饿'];
        const two = t > k(3), arr = two ? s2 : s1, R = P ? { x: W * .04, y: h * .3, w: W * .92, h: v * 6 } : { x: W * .08, y: h * .5, w: W * .84, h: v * 8 }, T2 = toks(arr, R);
        const tA = X.SG(t, (two ? k(3) : k(2)) + .1, (two ? k(3) : k(2)) + .6) * a;
        T2.forEach(([px, py, w], i) => { x.save(); x.globalAlpha = tA; rrect(x, px - v * 2.6, py - v * 2.4, v * 5.2, v * 4.8, v * .6); x.fillStyle = (two && w === '它') ? 'rgba(60,8,58,.85)' : 'rgba(6,16,34,.85)'; x.fill(); x.strokeStyle = col((two && w === '它') ? C.acc : (two && w === '猫') ? C.ok : C.pri, .7); x.stroke(); x.restore(); T(S.hud, w, px, py, { f: 'sans', size: v * (P ? 2 : 2.6), w: 700, c: C.ink, al: 'center', a: tA }); });
        const src = two ? 6 : Math.floor((t * 1.2) % arr.length), r = rng(two ? 7 : src + 3), wts = arr.map((w, i) => two ? (w === '猫' ? 1 : w === '鱼' ? .35 : w === '饿' ? .25 : .08) : (i === src ? 0 : .15 + r() * .6));
        const aa = X.SG(t, (two ? F.kw(3, '它') : F.kw(2, '注意')) - .2, (two ? F.kw(3, '它') : F.kw(2, '注意')) + .4) * tA;
        if (aa > 0) T2.forEach(([px, py], i) => { if (i === src || arr[i] === '，') return; const [sx, sy] = T2[src], hgt = Math.abs(px - sx) * .45 + v * 3, w = wts[i]; x.save(); x.globalAlpha = aa * (.25 + .75 * w); x.strokeStyle = col(two && arr[i] === '猫' ? C.ok : C.pri, .95); x.lineWidth = v * (.12 + w * .6); x.beginPath(); x.moveTo(sx, sy - v * 2.6); x.quadraticCurveTo((sx + px) / 2, sy - v * 2.6 - hgt, px, py - v * 2.6); x.stroke(); x.restore(); if (two && arr[i] === '猫') { const g = S.glow; g.save(); g.globalAlpha = aa; g.strokeStyle = col(C.ok, .9); g.lineWidth = v * 1.2; g.beginPath(); g.moveTo(sx, sy - v * 2.6); g.quadraticCurveTo((sx + px) / 2, sy - v * 2.6 - hgt, px, py - v * 2.6); g.stroke(); g.restore(); } });
        if (!two) { const MR = P ? { x: W * .2, y: h * .5, w: W * .6, h: W * .6 } : { x: W * .38, y: h * .2, w: h * .24, h: h * .24 }, ma = X.SG(t, F.kw(2, '最相关') - .5, F.kw(2, '最相关')) * a, n = 8, cs = MR.w / n, rr = rng(5); if (ma > 0) { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const q = i === j ? .9 : rr() * .7; x.save(); x.globalAlpha = ma; x.fillStyle = col(C.pri, .1 + q * .85); x.fillRect(MR.x + i * cs + 1, MR.y + j * cs + 1, cs - 2, cs - 2); x.restore(); } TAG(S, S.hud, '注意力矩阵', MR.x + MR.w / 2, MR.y + MR.h + v * 2, ma, { al: 'center', size: v * 1.1 }); } }
        else { const ca = X.SG(t, F.kw(3, '最在意') - .2, F.kw(3, '最在意') + .5) * a, [px, py] = T2[0], s = v * (P ? 8 : 10); if (ca > 0) PH(S, x, 'A27', { x: px - s / 2, y: py - v * 4 - s * 1.1 - (P ? v * 2 : v * 6), w: s, h: s * .75 }, { a: ca, p: .5, z0: 1.15, z1: 1.15, f0: [.55, .4], r: v * .4, vig: .1, frame: ca, scratch: false, flick: false }); T(S.hud, '“它” 最在意 “猫”', W / 2, R.y + R.h + v * (P ? 6 : 7), { f: 'sans', size: v * (P ? 2 : 2.4), w: 700, c: C.ok, al: 'center', a: ca }); }
      }],
      [k(4), k(5), (a) => {
        const R = P ? G.main : { x: W * .055, y: h * .17, w: W * .4, h: h * .64 };
        const m = PH(S, x, 'A19', R, { a, p: seg(t, k(4), k(5)), z0: 1, z1: 1.05, contain: true, vig: 0, frame: X.SG(t, k(4), k(4) + .6), cred: X.CR.A19, bgc: '#000000' });
        if (m) { CO(S, x, m.map(.6, .32), X.sideB(S, 0, 3, { dx: P ? 0 : W * .04 }), X.SG(t, k(4) + .3, k(4) + 1) * a, '多头注意力', 'MULTI-HEAD ATTENTION'); CO(S, x, m.map(.6, .17), X.sideB(S, 1, 3, { dx: P ? 0 : W * .04 }), X.SG(t, k(4) + .7, k(4) + 1.4) * a, '前馈网络', 'FEED-FORWARD', { ph: .3 }); }
        T(S.hud, 'Transformer', P ? W / 2 : W * .73, P ? G.side.y + G.side.h * .7 : h * .74, { f: 'interd', size: v * (P ? 4 : 5), w: 900, c: C.ink, al: 'center', a: X.SG(t, F.kw(4, 'Transformer') - .2, F.kw(4, 'Transformer') + .4) * a, sh: { c: C.pri, a: .8 } });
        TAG(S, S.hud, '8 位作者后来全部离开了谷歌', P ? W / 2 : W * .73, P ? G.side.y + G.side.h * .7 + v * 5 : h * .8, X.SG(t, k(4) + 1.2, k(4) + 1.8) * a, { al: 'center', f: 'sans', size: v * 1.25, c: C.mute });
      }],
      [k(5), F.dur, (a) => {
        const R = P ? { x: W * .12, y: h * .26, w: W * .76, h: h * .2 } : { x: W * .1, y: h * .26, w: W * .38, h: h * .44 }, up = X.SG(t, F.kw(5, '两个月') - .3, F.kw(5, '破亿') + .4);
        W3.axes(S, x, R, a, '上线后的天数', '用户（据估算）');
        const end = W3.curve(S, x, R, q => Math.pow(q, 2.2) * .95, up, C.acc, { a });
        if (up > .02) T(S.hud, H.count(0, 100, up) + ' 百万', end[0] - v, end[1] - v * 2, { f: 'interd', size: v * (P ? 2 : 2.6), w: 900, c: C.accHi, al: 'right', a, sh: { c: C.acc, a: .6 } });
        T(x, '0', R.x, R.y + R.h + v * 1.8, { f: 'mono', size: v * 1.1, c: C.mute, al: 'center', a }); T(x, '60 天', R.x + R.w, R.y + R.h + v * 1.8, { f: 'mono', size: v * 1.1, c: C.mute, al: 'right', a });
        const ba = X.SG(t, F.kw(5, '它和') - .3, F.kw(5, '它和') + .4) * a, bx = P ? W * .5 : W * .74, by = P ? h * .62 : h * .38;
        if (ba > 0) {
          [['ChatGPT', -1], ['Claude', 1]].forEach(([n, sd], i) => { const px = bx + sd * v * (P ? 9 : 10), py = by; x.save(); x.globalAlpha = ba; rrect(x, px - v * 7, py - v * 2.6, v * 14, v * 5.2, v * 2.6); x.fillStyle = 'rgba(6,16,34,.88)'; x.fill(); x.strokeStyle = col(i ? C.acc : C.pri, .8); x.stroke(); x.restore(); T(S.hud, n, px, py, { f: 'interd', size: v * 2, w: 700, c: C.ink, al: 'center', a: ba }); x.save(); x.globalAlpha = ba; x.strokeStyle = col(C.pri, .5); x.setLineDash([3, 4]); x.beginPath(); x.moveTo(px, py + v * 2.6); x.lineTo(bx, by + v * 9); x.stroke(); x.setLineDash([]); x.restore(); });
          x.save(); x.globalAlpha = ba; rrect(x, bx - v * 13, by + v * 9, v * 26, v * 5, v * .6); x.fillStyle = 'rgba(30,16,60,.85)'; x.fill(); x.strokeStyle = col(C.sec, .9); x.stroke(); x.restore();
          T(S.hud, 'Transformer', bx, by + v * 11.5, { f: 'interd', size: v * 2.2, w: 900, c: C.ink, al: 'center', a: ba, sh: { c: C.sec, a: .7 } });
        }
      }],
    ]);
  },
});

/* ===== 第十四幕 · 66 年 ===== */
L1S.push({
  tin: { type: 'iris', x: .5, y: .45, c: '#FFC86B' }, tdur: .9, mood: 'main', lead: .6, gap: .4, tail: 1.2, sfx: [[.4, 'ding']],
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k = i => F.cue(i) - .2;
    H.bg(S, t, { hue: 'gold' });
    if (t < k(1)) STAMP(S, t, .3, '2024.12 · STOCKHOLM', '斯德哥尔摩 · 诺贝尔周', { a: 1 - X.SG(t, k(1) - .3, k(1)) });
    else if (t > k(4)) STAMP(S, t, k(4) + .2, 'SMITHSONIAN · WASHINGTON D.C.', '史密森尼 · 美国国家历史博物馆');
    shots(t, [
      [0, k(1), (a) => {
        const m = X.photo(S, a, 'A20', seg(t, 0, k(1) + .5), { z0: 1.02, z1: 1.1, f0: [.5, .4], depth: .9 });
        if (m) { CO(S, x, m.map(.3, .22), X.sideB(S, 0, 3), X.SG(t, F.kw(0, '辛顿') - .2, F.kw(0, '辛顿') + .6) * a, '杰弗里·辛顿', 'GEOFFREY HINTON'); CO(S, x, m.map(.72, .22), X.sideB(S, 1, 3), X.SG(t, F.kw(0, '霍普菲尔德') - .2, F.kw(0, '霍普菲尔德') + .6) * a, '约翰·霍普菲尔德', 'JOHN HOPFIELD', { ph: .4 }); }
        const ca = X.SG(t, F.kw(0, '诺贝尔') - .3, F.kw(0, '诺贝尔') + .4) * a;
        if (ca > 0) QUOTE(S, S.hud, P ? { x: W * .07, y: G.side.y + v * 17.5, w: W * .86 } : { x: G.side.x, y: G.side.y + G.side.h * .55, w: G.side.w }, '表彰“通过人工神经网络实现{机器学习}的基础性发现和发明”', '2024 年诺贝尔物理学奖 · 颁奖词', ca, { c: C.gold, size: v * (P ? 1.6 : 1.8) });
      }],
      [k(1), k(2), (a) => {
        QUOTE(S, S.hud, P ? { x: W * .07, y: h * .26, w: W * .86 } : { x: W * .08, y: h * .3, w: W * .46 }, '我本来约了今天做核磁共振，{看来得取消了}。', '辛顿 · 获奖当天电话采访', X.SG(t, k(1), k(1) + .6) * a);
        const ca = X.SG(t, F.kw(1, '核磁共振') - .3, F.kw(1, '核磁共振') + .3) * a, cx = P ? W * .5 : W * .76, cy = P ? h * .62 : h * .5;
        if (ca > 0) { H.panel(S, x, cx - v * 11, cy - v * 7, v * 22, v * 14, { a: ca, head: 'OCT 8 · AGENDA' }); T(S.hud, '核磁共振检查', cx, cy, { f: 'sans', size: v * 2.2, w: 700, c: C.ink, al: 'center', a: ca }); const st = X.SG(t, F.kw(1, '取消') - .2, F.kw(1, '取消') + .3); x.save(); x.globalAlpha = ca * st; x.strokeStyle = col(C.red, .95); x.lineWidth = v * .4; x.beginPath(); x.moveTo(cx - v * 8, cy); x.lineTo(cx - v * 8 + v * 16 * st, cy); x.stroke(); x.restore(); TAG(S, S.hud, '取消', cx, cy + v * 4, st * ca, { al: 'center', f: 'sans', w: 700, c: C.red, size: v * 1.5 }); }
      }],
      [k(2), k(3), (a) => {
        const s = v * (P ? 13 : 17), y0 = P ? h * .22 : h * .2, ppl = [['A33', '伊利亚', '觉得该做'], [null, '亚历克斯', '把它做成了'], ['A21', '辛顿', '拿了诺贝尔奖']];
        ppl.forEach(([id, n, d], i) => {
          const pa = X.SG(t, F.kw(2, ['伊利亚', '亚历克斯', '而我'][i]) - .4, F.kw(2, ['伊利亚', '亚历克斯', '而我'][i]) + .2) * a, px = W * (.2 + i * .3) - s / 2;
          if (pa <= 0) return; if (id) PH(S, x, id, { x: px, y: y0, w: s, h: s }, { a: pa, p: .5, z0: id === 'A21' ? 2.6 : 1.15, z1: id === 'A21' ? 2.6 : 1.15, f0: id === 'A21' ? [.52, .3] : [.5, .3], r: s / 2, vig: .1, scratch: false, flick: false, frame: pa });
          else { x.save(); x.globalAlpha = pa; x.beginPath(); x.arc(px + s / 2, y0 + s / 2, s / 2, 0, TAU); x.fillStyle = 'rgba(69,227,255,.06)'; x.fill(); x.setLineDash([3, 4]); x.strokeStyle = col(C.mute, .6); x.stroke(); x.setLineDash([]); x.restore(); H.icon(x, 'person', px + s * .22, y0 + s * .2, s * .56, C.mute, pa); }
          T(S.hud, n, px + s / 2, y0 + s + v * 2, { f: 'sans', size: v * 1.7, w: 700, c: C.ink, al: 'center', a: pa }); T(S.hud, d, px + s / 2, y0 + s + v * 4.6, { f: 'sans', size: v * 1.35, w: 500, c: i === 2 ? C.gold : C.priHi, al: 'center', a: pa });
        });
        QUOTE(S, S.hud, P ? { x: W * .07, y: y0 + s + v * 8, w: W * .86 } : { x: W * .18, y: h * .62, w: W * .64 }, '伊利亚觉得该做，亚历克斯把它做成了，{而我拿了诺贝尔奖}。', '辛顿 · 计算机历史博物馆', X.SG(t, F.kw(2, '而我') + .2, F.kw(2, '而我') + .8) * a, { size: v * (P ? 1.7 : 2) });
      }],
      [k(3), k(4), (a) => {
        const R = P ? { x: W * .08, y: h * .5, w: W * .84, h: h * .16 } : { x: W * .45, y: h * .3, w: W * .48, h: h * .3 };
        const m = X.photo(S, a * X.SG(t, F.kw(3, '罗森布拉特') - .5, F.kw(3, '罗森布拉特') + .2), 'A01', seg(t, k(3), k(4) + .5), { R: P ? { x: W * .25, y: h * .2, w: W * .5, h: h * .26 } : { x: W * .08, y: h * .2, w: W * .3, h: h * .6 }, z0: 1.02, z1: 1.1, f0: [.5, .4], depth: .8 });
        H.panel(S, x, R.x, R.y, R.w, R.h, { a: X.SG(t, k(3), k(3) + .6) * a, head: 'AWARD', c: C.gold });
        T(S.hud, 'IEEE FRANK ROSENBLATT AWARD', R.x + R.w / 2, R.y + R.h * .36, { f: 'interd', size: fit(S.hud, 'IEEE FRANK ROSENBLATT AWARD', R.w * .9, { f: 'interd', size: v * (P ? 2 : 2.6), w: 900 }), w: 900, c: C.ink, al: 'center', a: X.SG(t, k(3) + .2, k(3) + .8) * a, sh: { c: C.gold, a: .7 } });
        T(S.hud, '2014 · GEOFFREY E. HINTON', R.x + R.w / 2, R.y + R.h * .6, { f: 'mono', size: v * 1.5, w: 500, c: C.gold, al: 'center', a: X.SG(t, k(3) + .5, k(3) + 1.1) * a });
        T(S.hud, '以罗森布拉特命名的奖', R.x + R.w / 2, R.y + R.h * .82, { f: 'sans', size: v * 1.5, w: 500, c: C.priHi, al: 'center', a: X.SG(t, F.kw(3, '命名') - .3, F.kw(3, '命名') + .3) * a });
      }],
      [k(4), F.dur, (a) => {
        const tc = F.kw(4, '从') - .2, ta = X.SG(t, tc, tc + .6);
        const m = X.photo(S, a * (1 - .9 * ta), 'A42', seg(t, k(4), tc + .4), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .44, h: h * .5 }, z0: 1.03, z1: 1.1, f0: [.5, .5] });
        const ca = X.SG(t, k(4) + .5, k(4) + 1.1) * a * (1 - .9 * ta), CR = P ? { x: W * .25, y: G.side.y + v * 1, w: W * .5, h: W * .38 } : { x: W * .56, y: h * .2, w: W * .36, h: h * .46 };
        if (ca > 0) { PH(S, x, 'A02', { x: CR.x + v, y: CR.y + v, w: CR.w - v * 2, h: CR.h - v * 2 }, { a: ca, p: .5, z0: 1.05, z1: 1.05, f0: [.45, .5], r: v * .3, vig: .3, scratch: false }); x.save(); x.globalAlpha = ca; x.strokeStyle = col(C.priHi, .6); x.lineWidth = 1.5; x.strokeRect(CR.x, CR.y, CR.w, CR.h); const g = x.createLinearGradient(CR.x, CR.y, CR.x + CR.w, CR.y + CR.h); g.addColorStop(0, 'rgba(200,240,255,.14)'); g.addColorStop(.5, 'rgba(200,240,255,0)'); g.addColorStop(1, 'rgba(200,240,255,.08)'); x.fillStyle = g; x.fillRect(CR.x, CR.y, CR.w, CR.h); x.restore(); TAG(S, S.hud, 'MARK I PERCEPTRON · 收藏于史密森尼', CR.x + CR.w / 2, CR.y + CR.h + v * 2, ca, { al: 'center', size: v * 1.1 }); }
        if (ta > 0) {
          const X1 = W * .08, X2 = W * .92, Yt = P ? h * .7 : h * .72;
          X.timeline(S, x, X1, X2, Yt, P ? [[1958, '感知机', C.pri], [1986, '反向传播', C.pri], [2012, 'AlexNet', C.pri], [2024, '诺贝尔奖', C.acc]] : [[1958, '感知机', C.pri], [1969, '寒冬', C.cold], [1986, '反向传播', C.pri], [2012, 'AlexNet', C.pri], [2017, 'Transformer', C.pri], [2024, '诺贝尔奖', C.acc]], seg(t, tc, tc + 2), { a: ta * a, alt: true });
          W3.num(S, S.hud, H.count(0, 66, seg(t, tc + .2, tc + 2)), W / 2 + v * 1.5, P ? h * .44 : h * .42, v * (P ? 9 : 13), { al: 'right', a: ta * a, c: C.ink, sc: C.gold });
          T(S.hud, '年', W / 2 + v * 2.5, P ? h * .44 : h * .42, { f: 'smiley', size: v * (P ? 4 : 5.4), c: C.gold, a: ta * a });
          T(S.hud, '从 1958 到 2024', W / 2, P ? h * .52 : h * .55, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, al: 'center', a: ta * a });
        }
      }],
    ]);
  },
});

/* ===== 尾声 · 苦涩的教训 ===== */
L1S.push({
  tin: { type: 'fade' }, tdur: .8, mood: 'main', lead: .6, gap: .4, tail: 2.2,
  camera: () => ({ z: 1 }),
  draw(t, S, F) {
    const X = L1X, Y = L1Y, C = X.C, { W, H: h, P, v } = S, G = LAY(S), x = S.mid, k = i => F.cue(i) - .2;
    H.bg(S, t, {});
    if (t < k(2)) STAMP(S, t, .3, '2019.03.13', '《苦涩的教训》', { a: 1 - X.SG(t, k(2) - .3, k(2)) });
    shots(t, [
      [0, k(1), (a) => {
        const m = X.photo(S, a, 'A25', seg(t, 0, k(1) + .5), { R: P ? G.main : { x: W * .055, y: h * .17, w: W * .4, h: h * .5 }, z0: 1.02, z1: 1.1, f0: [.5, .4], depth: .8 });
        if (m) CO(S, x, m.map(.5, .25), P ? [W * .55, G.main.y + G.main.h + coH(S) * .5 + v * 1.2] : [W * .2, h * .76], X.SG(t, .5, 1.3) * a, '理查德·萨顿', 'RICHARD SUTTON · 强化学习先驱', { side: 1 });
        const pw = P ? W * .78 : W * .4, D = DOC.draw(S, x, 'web', P ? W * .5 : W * .72, P ? G.side.y + pw * .39 + v * 6 : h * .48, pw, { a: X.SG(t, F.kw(0, '短文') - .4, F.kw(0, '短文') + .2) * a, rot: -.02, hl: [{ k: 'title', p: seg(t, F.kw(0, '苦涩') - .2, F.kw(0, '苦涩') + .6) }] });
        if (D) RECON(S, S.hud, (P ? W * .5 : W * .72) - pw / 2, (P ? G.side.y + pw * .39 + v * 6 : h * .48) - D.d.h / 2 - v * 2, X.SG(t, F.kw(0, '短文'), F.kw(0, '短文') + .5) * a);
      }],
      [k(1), k(2), (a) => {
        const R = P ? { x: W * .12, y: h * .26, w: W * .78, h: h * .34 } : { x: W * .12, y: h * .24, w: W * .56, h: h * .5 };
        W3.axes(S, x, R, a, '算力 →', '效果');
        const p1 = seg(t, F.kw(1, '聪明') - .5, F.kw(1, '输给') + .2), p2 = seg(t, F.kw(1, '简单通用') - .3, F.kw(1, '算力') + .6);
        const e1 = W3.curve(S, x, R, q => .18 + .3 * (1 - Math.exp(-q * 4)), p1, C.pri, { a });
        const e2 = W3.curve(S, x, R, q => .05 + .9 * Math.pow(q, 3.2), p2, C.acc, { a });
        if (p1 > .4) T(S.hud, '人类精心设计的聪明办法', e1[0] - v, e1[1] - v * 2, { f: 'sans', size: v * (P ? 1.4 : 1.7), w: 700, c: C.priHi, al: 'right', a: a * seg(p1, .4, .7) });
        if (p2 > .5) T(S.hud, '简单通用的方法 + 更多算力', e2[0] - v, e2[1] - v * 2, { f: 'sans', size: v * (P ? 1.4 : 1.7), w: 700, c: C.accHi, al: 'right', a: a * seg(p2, .5, .8) });
        H.chip(S, S.hud, '苦涩的教训', P ? W / 2 : W * .82, P ? R.y + R.h + v * 6 : h * .4, { size: v * 2.4, hot: true, a: X.SG(t, F.kw(1, '算力') - .2, F.kw(1, '算力') + .4) * a, al: 'center' });
        TAG(S, S.hud, '70 年 AI 研究的结论', P ? W / 2 : W * .82, P ? R.y + R.h + v * 10 : h * .48, X.SG(t, F.kw(1, '70') - .2, F.kw(1, '70') + .4) * a, { al: 'center', size: v * 1.2 });
      }],
      [k(2), k(3), (a) => {
        const m = X.photo(S, a, 'A01', seg(t, k(2), k(3) + .4), { R: P ? G.main : { x: W * .3, y: h * .17, w: W * .4, h: h * .6 }, z0: 1.05, z1: 1.14, f0: [.5, .38], depth: .9 });
        x.save(); x.globalAlpha = a * .18; x.fillStyle = '#ffb347'; const R = P ? G.main : { x: W * .3, y: h * .17, w: W * .4, h: h * .6 }; x.fillRect(R.x, R.y, R.w, R.h); x.restore();
        T(S.hud, '来得太早', W / 2, P ? G.side.y + v * 8 : h * .86 - v * 6, { f: 'smiley', size: v * (P ? 3.6 : 4.4), c: C.gold, al: 'center', a: X.SG(t, F.kw(2, '太早') - .3, F.kw(2, '太早') + .3) * a, sh: { c: C.gold, a: .7 } });
      }],
      [k(3), F.dur, (a) => {
        const cx = W / 2, cy = P ? h * .42 : h * .47, zp = E.io3(seg(t, k(3) + .2, F.kw(3, '参数') + .4)), sc = lerp(.02, 1, zp) * (P ? W * .48 : h * .42), rot = t * .05, r2 = rng(4321);
        for (let i = 0; i < 1100; i++) {
          const arm = i % 3, d = Math.pow(r2(), .6), an = arm / 3 * TAU + d * 5.2 + (r2() - .5) * .9 * (1 - d * .5), gx = Math.cos(an) * d, gy = Math.sin(an) * d, s1 = r2(), s2 = r2();
          const show = seg(zp, (i / 1100) * .7, (i / 1100) * .7 + .25); if (show <= 0) continue;
          const xr = gx * Math.cos(rot) - gy * Math.sin(rot), yr = (gx * Math.sin(rot) + gy * Math.cos(rot)) * .62, px = cx + xr * sc, py = cy + yr * sc, rr = .7 + s1 * 1.2;
          x.fillStyle = col(s2 < .78 ? C.pri : C.acc, a * show * (.35 + s1 * .6)); x.fillRect(px - rr / 2, py - rr / 2, rr, rr);
        }
        H.node(S, cx, cy, v * 1.2 * (1 - zp * .6), { lit: 1, a }); haze(S.glow, cx, cy, sc * .6, C.pri, .25 * a * zp);
        const fade = 1 - X.SG(t, F.kw(3, '今天') - .2, F.kw(3, '今天') + .4);
        T(S.hud, zp < .99 ? H.count(1, 300000000000, Math.pow(zp, 3)) : '几千亿', cx, P ? h * .2 : h * .2, { f: zp < .99 ? 'interd' : 'smiley', size: v * (P ? 4.4 : 5.4), w: 700, c: C.ink, al: 'center', a: a * fade, sh: { c: C.pri, a: .6 } });
        T(S.hud, '个参数', cx, h * .2 + v * 4.6, { f: 'sans', size: v * 1.8, w: 500, c: C.mute, al: 'center', a: a * fade });
        const ka = E.oB(seg(t, F.kw(3, '你正在') - .2, F.kw(3, '你正在') + .4), 1.6) * a;
        if (ka > 0) {
          const bw = v * (P ? 30 : 36), bh = v * (P ? 7.4 : 8.4), bx = cx - bw / 2, by = cy - bh / 2, kk = Math.min(1, ka);
          x.save(); x.globalAlpha = kk; rrect(x, bx, by, bw, bh, bh * .3); x.fillStyle = 'rgba(30,5,34,.88)'; x.fill(); x.strokeStyle = col(C.acc, .95); x.lineWidth = 1.4; x.stroke(); x.restore();
          T(S.hud, '你正在和它说话' + (Math.floor(t * 2.2) % 2 ? '▍' : ' '), bx + v * 2.6, cy, { f: 'sans', size: v * (P ? 2.8 : 3.3), w: 700, c: C.accHi, a: kk });
        }
      }],
    ]);
  },
});

/* ===== 片尾总结 ===== */
const L1POINTS = [['1958', '感知机：第一台会从错误里学习的机器'], ['1969', '《感知机》一书之后，神经网络进入寒冬'], ['1986', '反向传播：多层网络终于能学了'], ['2012', 'ImageNet + 两块显卡：AlexNet 一战成名'], ['2017', 'Transformer：今天大模型的地基'], ['2024', '诺贝尔奖：一个想法等了 66 年']];
const L1OUTRO = {
  dur: 8.5, tin: { type: 'fade' }, sfx: [[.3, 'rise'], [1.6, 'ding']],
  camera: t => ({ z: 1 + .015 * E.ioS(clamp(t / 8.5)) }),
  draw(t, S) {
    const C = K.c; H.bg(S, t, {}); const { W, H: h, P, v } = S, x = S.mid, pa = E.o3(seg(t, .3, 1.1));
    const R = P ? { x: W * .06, y: h * .12, w: W * .88, h: h * .68 } : { x: W * .14, y: h * .1, w: W * .72, h: h * .76 };
    H.panel(S, x, R.x, R.y + (1 - pa) * v * 3, R.w, R.h, { a: pa, head: 'SUMMARY // LESSON 01' });
    T(S.hud, '本课要点', R.x + R.w / 2, R.y + v * 6.5, { f: 'smiley', size: v * (P ? 4 : 4.6), c: C.ink, al: 'center', a: pa, sh: { c: C.pri, a: .6 } });
    L1POINTS.forEach(([y, s], i) => {
      const a = E.o3(seg(t, .9 + i * .28, 1.4 + i * .28)), yy = R.y + v * (P ? 13.5 : 13.5) + i * v * (P ? 6.6 : 7.4);
      H.chip(S, x, y, R.x + v * 2.4, yy, { size: v * 1.5, f: 'mono', a, hot: i === 5 });
      const chipW = TW(x, y, { f: 'mono', size: v * 1.5, w: 500 }) + fsz(v * 1.5) * 1.3, tx0 = R.x + Math.max(v * (P ? 11.5 : 12.5), v * 2.4 + chipW + v * 1.4);   /* 年份胶囊被放大时，正文跟着往右让 */ T(x, s, tx0, yy, { f: 'sans', size: fit(x, s, R.x + R.w - v * 2 - tx0, { f: 'sans', size: v * (P ? 1.8 : 2.2), w: 500 }), w: 500, c: C.ink, a });
    });
    T(S.hud, '下一课 · 一台猜下一个字的机器', R.x + R.w / 2, R.y + R.h - v * 3.4, { f: 'sans', size: v * 1.8, w: 500, c: C.pri, al: 'center', tr: .1, a: E.o3(seg(t, 2.8, 3.5)) });
  },
};
/* 课程用到的图片（按出场顺序） */
const L1IMGS = ['PAPER', 'A23', 'A22', 'A09', 'A01', 'A07', 'A26', 'A06', 'A05', 'A35', 'A04', 'A02', 'A03', 'A08', 'A10', 'A11', 'A24', 'A39', 'A40', 'A12', 'A13', 'A38', 'A27', 'A28', 'A29', 'A30', 'A31', 'A32', 'A34', 'A41', 'A14', 'A16', 'A33', 'A15', 'A37', 'A36', 'A44', 'A17', 'A18', 'A19', 'A43', 'A20', 'A21', 'A42', 'A25'];
const L1 = { code: L1S, intro: null, outro: L1OUTRO, points: L1POINTS, imgs: L1IMGS, posterAt: f => { const s = f.scenes[5]; return s ? s.start + s.cues[1].start + s.cues[1].dur * .8 : 3.9; } };
