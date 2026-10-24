'use strict';
/* AI 八堂课 · 情景再现（剪影动画库）
   旁白讲故事的段落，用剪影把情景演出来。规矩：
   · 人物一律是无脸的剪影或全息轮廓，不画五官、不仿真人长相；画面角落标「情景再现」。
   · 全部是时间的纯函数（不用 Math.random / Date.now），拖进度条、倒放，同一时刻画面一样。
   · 尺寸都按 S.v 或给定的身高 h 算，横竖屏通用。
   坐标约定：人物的局部坐标里 +x 是“面朝的方向”，+y 向下；角度从“竖直向下”量起，往前转为正。 */
const ST = (() => {
  const C = K.c;
  const dir = a => [Math.sin(a), Math.cos(a)];                 // 从“向下”转 a 弧度后的单位向量
  const add = (p, q, s = 1) => [p[0] + q[0] * s, p[1] + q[1] * s];
  /* 身体比例（身高 = 1） */
  const B = { head: .064, neck: .03, torso: .3, sh: .05, uarm: .158, farm: .146, thigh: .248, shin: .236, ank: .03, foot: .075 };
  const NEUTRAL = { tr: 0, hd: 0, sh1: .06, el1: .14, sh2: -.08, el2: .18, hp1: .03, kn1: 0, hp2: -.03, kn2: 0 };
  /* 两段手臂的反向运动学：肩 S → 目标 T（局部坐标），返回 [上臂角, 肘弯] */
  function ik(Sx, Sy, Tx, Ty, l1, l2, bend = 1) {
    let dx = Tx - Sx, dy = Ty - Sy, D = Math.hypot(dx, dy); const mx = (l1 + l2) * .999;
    if (D > mx) { dx *= mx / D; dy *= mx / D; D = mx; } if (D < 1e-6) return [0, 0];
    const th = Math.atan2(dx, dy), al = Math.acos(clamp((l1 * l1 + D * D - l2 * l2) / (2 * l1 * D), -1, 1));
    const a1 = th - bend * al, e = [Sx + Math.sin(a1) * l1, Sy + Math.cos(a1) * l1], a2 = Math.atan2(Tx - e[0], Ty - e[1]);
    return [a1, a2 - a1];
  }
  /* 姿势混合：两个姿势按 p 插值（缺的键用中性值） */
  function mixP(A, Bp, p) { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(Bp)])) { const a = A[k] ?? NEUTRAL[k] ?? 0, b = Bp[k] ?? NEUTRAL[k] ?? 0; o[k] = typeof a === 'number' && typeof b === 'number' ? lerp(a, b, p) : (p < .5 ? a : b); } return o; }
  /* 关键帧：keys = [[t0, 姿势], [t1, 姿势, 缓动], …] */
  function kf(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) { const [t1, P1, ez] = keys[i]; if (t < t1) { const [t0, P0] = keys[i - 1], q = (t - t0) / Math.max(1e-4, t1 - t0); return mixP(P0, P1, (ez || E.io3)(clamp(q))); } }
    return keys[keys.length - 1][1];
  }
  /* 走路：ph 相位（弧度），amt 幅度 */
  function walk(ph, amt = 1, o = {}) {
    const s = Math.sin(ph), c = Math.cos(ph), A = .42 * amt;
    return { tr: (o.lean ?? .06) * amt, hd: o.hd ?? .04, hp1: A * s, hp2: -A * s, kn1: .75 * amt * Math.max(0, c) ** 1.4 + .08 * amt, kn2: .75 * amt * Math.max(0, -c) ** 1.4 + .08 * amt,
      sh1: -.36 * amt * s, sh2: .36 * amt * s, el1: .22 + .18 * amt * Math.max(0, -s), el2: .22 + .18 * amt * Math.max(0, s), bob: (Math.abs(c) - .5) * amt };
  }
  /* 走路的步幅：每个相位周期（2π）前进多少（以身高计） */
  const STRIDE = .74;
  /* 计算骨架：返回各关节的屏幕坐标 */
  function rig(o, P) {
    const h = o.h, f = o.f || 1, W2 = (p) => [o.x + f * p[0] * h, o.y + p[1] * h];   // 局部（身高单位）→ 屏幕
    const legY = (hp, kn) => B.thigh * Math.cos(hp) + B.shin * Math.cos(hp - kn) + B.ank;
    let pel;
    if (o.pel) pel = [(o.pel[0] - o.x) / h * f, (o.pel[1] - o.y) / h];                    // 指定骨盆位置（坐、躺）
    else pel = [0, -Math.max(legY(P.hp1, P.kn1), legY(P.hp2, P.kn2)) - (P.bob || 0) * .012];   // 站、走：较低的那只脚踩地
    const up = [Math.sin(P.tr), -Math.cos(P.tr)], neck0 = add(pel, up, B.torso), shd = add(pel, up, B.torso - B.sh);
    const hu = [Math.sin(P.tr + P.hd), -Math.cos(P.tr + P.hd)], headC = add(neck0, hu, B.neck + B.head * .9);
    const arm = (sh, el) => { const e = add(shd, dir(sh), B.uarm), w = add(e, dir(sh + el), B.farm); return [e, w]; };
    const leg = (hp, kn) => { const k = add(pel, dir(hp), B.thigh), a = add(k, dir(hp - kn), B.shin), fa = (hp - kn) + Math.PI / 2 - .5 * (hp - kn); const ft = add(a, dir(fa), B.foot); return [k, a, ft]; };
    let a1 = arm(P.sh1, P.el1), a2 = arm(P.sh2, P.el2);
    /* 手伸向目标点（屏幕坐标）；rp 0..1 在原姿势和伸手之间过渡 */
    const reach = (T, bend, p, sh, el) => { const L = [(T[0] - o.x) / h * f, (T[1] - o.y) / h], r = ik(shd[0], shd[1], L[0], L[1], B.uarm, B.farm, bend); return arm(lerp(sh, r[0], p), lerp(el, r[1], p)); };
    if (o.reach1) a1 = reach(o.reach1, o.bend1 ?? 1, o.rp1 ?? 1, P.sh1, P.el1); if (o.reach2) a2 = reach(o.reach2, o.bend2 ?? 1, o.rp2 ?? 1, P.sh2, P.el2);
    const l1 = leg(P.hp1, P.kn1), l2 = leg(P.hp2, P.kn2);
    const J = { pel, neck0, shd, headC, up, hu, a1, a2, l1, l2 };
    const S = {}; for (const k of ['pel', 'neck0', 'shd', 'headC']) S[k] = W2(J[k]);
    S.e1 = W2(a1[0]); S.w1 = W2(a1[1]); S.e2 = W2(a2[0]); S.w2 = W2(a2[1]);
    S.k1 = W2(l1[0]); S.an1 = W2(l1[1]); S.ft1 = W2(l1[2]); S.k2 = W2(l2[0]); S.an2 = W2(l2[1]); S.ft2 = W2(l2[2]);
    S.fa1 = Math.atan2(S.w1[1] - S.e1[1], S.w1[0] - S.e1[0]); S.fa2 = Math.atan2(S.w2[1] - S.e2[1], S.w2[0] - S.e2[0]);
    S.J = J; S.W2 = W2; S.h = h; S.f = f; S.P = P; return S;
  }
  /* 躯干轮廓（侧身）：沿脊柱 [位置, 背后厚度, 前面厚度]（身高单位） */
  const TOR = [[0, -.07, .064], [.22, -.062, .056], [.45, -.058, .054], [.7, -.07, .078], [.88, -.064, .07], [1, -.036, .04]];
  function torsoPath(R, o) {
    const J = R.J, up = J.up, pts1 = [], pts2 = [], L = B.torso, coat = o.coat || 0, fwd = [Math.cos(R.P.tr), Math.sin(R.P.tr)];
    for (const [q, b, fr] of TOR) { const c = add(J.pel, up, q * L); pts1.push(add(c, fwd, fr)); pts2.push(add(c, fwd, b)); }
    if (coat) {   /* 风衣 / 裙摆：从腰往下张开，跟着两膝摆动，下摆在膝盖附近 */
      const k1 = J.l1[0], k2 = J.l2[0], sp = .035 + coat * .03, yy = J.pel[1] + .1 + coat * .17;
      pts1.unshift([Math.max(k1[0], k2[0], J.pel[0] + .05) + sp, yy]); pts2.unshift([Math.min(k1[0], k2[0], J.pel[0] - .06) - sp, yy]);
    }
    return (x, ext) => {   /* ext：向外扩（像素），画轮廓光用 */
      const e = ext / R.h, P1 = pts1.map((p, i) => R.W2([p[0] + e, p[1] + (i === pts1.length - 1 ? -e : 0)])), P2 = pts2.map((p, i) => R.W2([p[0] - e, p[1] + (i === pts2.length - 1 ? -e : i === 0 && coat ? e : 0)]));
      if (coat) { P1[0][1] += ext; }
      x.beginPath(); x.moveTo(P1[0][0], P1[0][1]); for (let i = 1; i < P1.length; i++) x.lineTo(P1[i][0], P1[i][1]); for (let i = P2.length - 1; i >= 0; i--) x.lineTo(P2[i][0], P2[i][1]); x.closePath();
    };
  }
  /* 锥形肢体：p1(半径 r1) → p2(半径 r2)，两端圆头 */
  function limb(g, p1, p2, r1, r2) {
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
    g.beginPath(); g.moveTo(p1[0] + nx * r1, p1[1] + ny * r1); g.lineTo(p2[0] + nx * r2, p2[1] + ny * r2); g.lineTo(p2[0] - nx * r2, p2[1] - ny * r2); g.lineTo(p1[0] - nx * r1, p1[1] - ny * r1); g.closePath(); g.fill();
    g.beginPath(); g.arc(p1[0], p1[1], r1, 0, TAU); g.fill(); g.beginPath(); g.arc(p2[0], p2[1], r2, 0, TAU); g.fill();
  }
  /* 手的目标点（局部坐标的预设）：ear 耳边、face 脸前、chest 胸前 */
  const SPOT = { ear: (J) => add(J.headC, [.02, .015]), face: (J) => add(J.headC, [.085, .03]), chest: (J) => add(J.neck0, [.1, .1]), lap: (J) => add(J.pel, [.14, -.02]) };
  /* 画一个人：o = {x, y, h, f, pose, mode:'holo'|'sil', c, a, hat, hair, coat, hold(x, R), reach1, reach2, pel} */
  function fig(S, x, o) {
    const a = o.a ?? 1; if (a <= 0 || o.h <= 1) return null;
    const P = Object.assign({}, NEUTRAL, o.pose || {}), h = o.h, c = o.c || C.pri, holo = (o.mode || 'holo') === 'holo';
    const o2 = Object.assign({}, o); let R0 = null; for (const k of ['reach1', 'reach2']) { const tg = o[k]; if (typeof tg !== 'string' && typeof tg !== 'function') continue; R0 = R0 || rig(Object.assign({}, o, { reach1: null, reach2: null }), P); o2[k] = typeof tg === 'string' ? R0.W2(SPOT[tg](R0.J)) : tg(R0); }
    const R = rig(o2, P), tp = torsoPath(R, o);
    const top = R.headC[1] - h * .08, bot = Math.max(R.ft1[1], R.ft2[1], R.pel[1]) + h * .02;
    const r = { th: [.054, .041], sn: [.04, .027], ft: .022, ua: [.035, .028], fa: [.028, .022], hd: .026, nk: .027 };
    const parts = (g, ext, which) => {   /* which: 1 远侧肢体，0 身体，2 近侧肢体 */
      const L = (p1, p2, rr) => limb(g, p1, p2, rr[0] * h + ext, rr[1] * h + ext);
      const legD = (k, an, ft) => { L(R.pel, k, r.th); L(k, an, r.sn); L(an, ft, [r.ft, r.ft * .9]); };
      const armD = (e, w) => { L(R.shd, e, r.ua); L(e, w, r.fa); g.beginPath(); g.arc(w[0], w[1], r.hd * h + ext, 0, TAU); g.fill(); };
      if (which === 1) { legD(R.k2, R.an2, R.ft2); armD(R.e2, R.w2); return; }
      if (which === 2) { legD(R.k1, R.an1, R.ft1); armD(R.e1, R.w1); return; }
      tp(g, ext); g.fill();
      L(R.neck0, add(R.neck0, [R.headC[0] - R.neck0[0], R.headC[1] - R.neck0[1]], .55), [r.nk, r.nk]);
      const hc = R.headC, hr = h * B.head, ang = (R.P.tr + R.P.hd) * R.f;
      g.beginPath(); g.ellipse(hc[0], hc[1], hr * .9 + ext, hr + ext, ang * .5, 0, TAU); g.fill();
      if (o.hair === 'bun') { const bp = add(hc, [-R.f * Math.cos(R.P.tr) * hr * .9, -hr * .45]); g.beginPath(); g.arc(bp[0], bp[1], hr * .45 + ext, 0, TAU); g.fill(); }
      if (o.hair === 'long') { g.beginPath(); g.moveTo(hc[0] - R.f * hr * (.85 + ext / hr), hc[1] - hr * .3); g.quadraticCurveTo(hc[0] - R.f * (hr * 1.45 + ext), hc[1] + hr * 1.5, hc[0] - R.f * hr * .15, hc[1] + hr * 2.05 + ext); g.lineTo(hc[0] + R.f * hr * .2, hc[1] + hr * .3); g.closePath(); g.fill(); }
      if (o.hat === 'fedora') { g.save(); g.translate(hc[0], hc[1] - hr * .55); g.rotate(ang); rrect(g, -hr * 1.7 - ext, -h * .009 - ext, hr * 3.4 + ext * 2, h * .018 + ext * 2, h * .009); g.fill(); rrect(g, -hr * .95 - ext, -hr * 1.05 - ext, hr * 1.9 + ext * 2, hr * 1.1 + ext * 2, hr * .32); g.fill(); g.restore(); }
      if (o.hat === 'cap') { g.beginPath(); g.arc(hc[0], hc[1] - hr * .1, hr * 1.02 + ext, Math.PI, 0); g.fill(); g.save(); g.translate(hc[0], hc[1] - hr * .12); rrect(g, R.f > 0 ? -ext : -hr * 1.75 - ext, -h * .008 - ext, hr * 1.75 + ext * 2, h * .016 + ext * 2, h * .008); g.fill(); g.restore(); }
    };
    const fill = holo ? (() => { const g = x.createLinearGradient(0, top, 0, bot); g.addColorStop(0, mix('#08121f', c, .2)); g.addColorStop(1, mix('#04070e', c, .07)); return g; })() : (o.fill || '#04060c');
    const farF = holo ? mix('#050a14', c, .1) : (o.fill || '#03050a');
    const rimW = Math.max(1, h * .0085), rimA = holo ? .92 : (o.rimA ?? .6);
    x.save(); x.globalAlpha = a;
    /* 1 轮廓光：整个人形（远侧肢体弱一些）；2 填色；3 近侧肢体压在身上时描一道淡边，看得出手臂 */
    x.fillStyle = col(c, rimA * .55); parts(x, rimW, 1); x.fillStyle = col(c, rimA); parts(x, rimW, 0); parts(x, rimW, 2);
    x.fillStyle = farF; parts(x, 0, 1); x.fillStyle = fill; parts(x, 0, 0); parts(x, 0, 2);
    x.fillStyle = col(c, rimA * .42); parts(x, rimW * .8, 2); x.fillStyle = fill; parts(x, 0, 2);
    if (o.hold) o.hold(x, R);
    x.restore();
    if (o.glow !== false) {   /* 全息光晕：全息人形整个淡淡发光；剪影只在轮廓上发光，并且挡住身后的光（人站在窗前） */
      const g = x.__g || S.glow; if (x.__gm) x.__gm(); g.save();
      if (holo) { g.globalAlpha = a * .2; g.fillStyle = col(c, 1); for (const fp of [1, 0, 2]) parts(g, h * .006, fp); }
      else { g.globalAlpha = a * .45; g.fillStyle = col(c, 1); for (const fp of [1, 0, 2]) parts(g, rimW * 2.2, fp); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = a; for (const fp of [1, 0, 2]) parts(g, 0, fp); }
      g.restore();
    }
    if (o.shadow !== false && !o.pel) { const fy = Math.max(R.ft1[1], R.ft2[1]) + h * .01; x.save(); x.globalAlpha = a * (holo ? .55 : .7); const sg = x.createRadialGradient(R.pel[0], fy, 0, R.pel[0], fy, h * .24); sg.addColorStop(0, holo ? col(c, .3) : 'rgba(0,0,0,.6)'); sg.addColorStop(1, holo ? col(c, 0) : 'rgba(0,0,0,0)'); x.fillStyle = sg; x.translate(R.pel[0], fy); x.scale(1, .16); x.translate(-R.pel[0], -fy); x.fillRect(R.pel[0] - h * .24, fy - h * .24, h * .48, h * .48); x.restore(); }
    return R;
  }
  /* 「情景再现」标签 */
  function tag(S, X, Y, a, al = 'left', s = '情景再现') { if (a <= 0) return; const v = S.v, f = fsz(v * 1.15), tw = TW(S.hud, s, { f: 'sans', size: v * 1.15, w: 700, tr: .12 }) + f * 1.2; RECON(S, S.hud, al === 'right' ? X - tw : al === 'center' ? X - tw / 2 : X, Y, a, s); }
  /* 地面光线（全息舞台的地平线） */
  function floor(S, x, X1, X2, Y, a, c) {
    if (a <= 0) return; c = c || C.pri; x.save(); x.globalAlpha = a; const g = x.createLinearGradient(X1, 0, X2, 0); g.addColorStop(0, col(c, 0)); g.addColorStop(.2, col(c, .5)); g.addColorStop(.8, col(c, .5)); g.addColorStop(1, col(c, 0)); x.strokeStyle = g; x.lineWidth = 1; x.beginPath(); x.moveTo(X1, Y); x.lineTo(X2, Y); x.stroke(); x.restore();
    const gl = S.glow; gl.save(); gl.globalAlpha = a * .6; gl.strokeStyle = g; gl.lineWidth = 3; gl.beginPath(); gl.moveTo(X1, Y); gl.lineTo(X2, Y); gl.stroke(); gl.restore();
  }
  /* 线描描边（全息线框）：path(x) 画路径，同时描到光晕层 */
  function line(S, x, path, c, a, w = 1.2, fillC) {
    if (a <= 0) return; x.save(); x.globalAlpha = a; x.lineCap = 'round'; x.lineJoin = 'round'; path(x); if (fillC) { x.fillStyle = fillC; x.fill(); } x.strokeStyle = col(c, .9); x.lineWidth = w; x.stroke(); x.restore();
    const g = x.__g || S.glow; if (x.__gm) x.__gm(); g.save(); g.globalAlpha = a * .7; g.lineCap = 'round'; g.lineJoin = 'round'; path(g); g.strokeStyle = col(c, .8); g.lineWidth = w + 2; g.stroke(); g.restore();
  }

  /* ================= 道具与场景 ================= */
  const gl = (S, x) => { const g = x.__g || S.glow; if (x.__gm) x.__gm(); return g; };   // 这一层对应的光晕层
  const ez = (t, a, b) => E.io3(seg(t, a, b));
  /* 霓虹招牌字（个别字母会闪） */
  function neon(S, x, s, X, Y, size, t, a, o = {}) {
    if (a <= 0) return; const c = o.c || C.acc, ch = [...s], g = gl(S, x), sp = size * .14;
    x.save(); x.font = fnt('interd', size, 900); const ws = ch.map(q => x.measureText(q).width); x.restore();
    const tot = ws.reduce((p, q) => p + q, 0) + sp * (ch.length - 1); let xx = X - tot / 2;
    ch.forEach((q, i) => {
      const on = a * ((o.flick || [3]).includes(i) ? (MO.noise(t * 7 + i * 3.7, 11) > .45 ? .18 : 1) : 1), cx = xx + ws[i] / 2;
      T(x, q, cx, Y, { f: 'interd', size, w: 900, c: mix(c, '#ffffff', .6), al: 'center', a: on });
      g.save(); g.globalAlpha = on; g.font = fnt('interd', size, 900); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col(c, 1); g.fillText(q, cx, Y); g.restore();
      xx += ws[i] + sp;
    });
    haze(g, X, Y, tot * .8, c, .2 * a);
    return tot;
  }
  /* 床（侧视，床头在左）：X0 床头，X1 床尾，Y 床垫上沿，u 尺寸单位（≈人的身高）；返回地面 y */
  function bed(S, x, X0, X1, Y, u, a) {
    if (a <= 0) return Y + u * .2; const mh = u * .07, fy = Y + u * .19, rc = col(C.pri, .4);
    x.save(); x.globalAlpha = a; x.lineWidth = 1; x.strokeStyle = rc;
    rrect(x, X0 - u * .07, Y - u * .27, u * .07, fy - (Y - u * .27), u * .02); x.fillStyle = '#070b16'; x.fill(); x.stroke();          // 床头板
    x.fillStyle = '#05080f'; x.fillRect(X0, Y + mh * .8, X1 - X0, fy - Y - mh * .8 - u * .025); x.strokeRect(X0, Y + mh * .8, X1 - X0, fy - Y - mh * .8 - u * .025);   // 床座（挡住窗户下半截）
    x.fillRect(X1 - u * .04, fy - u * .03, u * .03, u * .03); x.fillRect(X0 + u * .01, fy - u * .03, u * .03, u * .03);
    rrect(x, X0, Y, X1 - X0, mh, mh * .45); x.fillStyle = '#0b1322'; x.fill(); x.stroke();                                         // 床垫
    rrect(x, X0 + u * .02, Y - u * .042, u * .17, u * .052, u * .024); x.fillStyle = '#0d1727'; x.fill(); x.strokeStyle = col(C.pri, .3); x.stroke();   // 枕头
    x.restore(); return fy;
  }
  /* 床头柜 + 台灯：on 0..1 */
  function lamp(S, x, X, Y, u, on, a, fy) {
    if (a <= 0) return; const w = u * .2, top = Y - u * .02;
    x.save(); x.globalAlpha = a; x.lineWidth = 1; x.strokeStyle = col(C.pri, .35);
    x.fillStyle = '#060a14'; x.fillRect(X - w / 2, top, w, fy - top); x.strokeRect(X - w / 2, top, w, fy - top); x.beginPath(); x.moveTo(X - w / 2, top + (fy - top) * .45); x.lineTo(X + w / 2, top + (fy - top) * .45); x.stroke();
    x.fillStyle = '#0a1120'; x.fillRect(X - u * .035, top - u * .012, u * .07, u * .012); x.fillRect(X - u * .006, top - u * .12, u * .012, u * .11);   // 灯座、灯杆
    const sy = top - u * .12, shade = q => { q.beginPath(); q.moveTo(X - u * .035, sy - u * .07); q.lineTo(X + u * .035, sy - u * .07); q.lineTo(X + u * .06, sy); q.lineTo(X - u * .06, sy); q.closePath(); };
    shade(x); x.fillStyle = on > 0 ? col(mix('#1a1206', '#ffcf7a', on), 1) : '#0b1222'; x.fill(); x.strokeStyle = col(on > 0 ? C.gold : C.pri, .5); x.stroke();
    if (on > 0) {   /* 暖光：灯罩下的光锥 + 墙上的光晕 */
      const g = x.createRadialGradient(X, sy, 0, X, sy, u * .5); g.addColorStop(0, col('#ffc86b', .3 * on)); g.addColorStop(1, col('#ffc86b', 0)); x.fillStyle = g; x.beginPath(); x.moveTo(X - u * .06, sy); x.lineTo(X + u * .06, sy); x.lineTo(X + u * .32, fy); x.lineTo(X - u * .32, fy); x.closePath(); x.fill();
    }
    x.restore();
    if (on > 0) { const g = gl(S, x); haze(g, X, sy - u * .03, u * .55, C.gold, .55 * on * a); }
  }
  /* 手里的手机（贴在手腕上，顺着前臂方向）*/
  function handPhone(g, R, a, lit) {
    const w = R.w1, s = R.h, ang = R.fa1 + Math.PI / 2;
    g.save(); g.globalAlpha *= a; g.translate(w[0], w[1]); g.rotate(ang); rrect(g, -s * .016, -s * .058, s * .032, s * .07, s * .007); g.fillStyle = '#04060c'; g.fill(); g.strokeStyle = col(C.pri, .6); g.lineWidth = 1; g.stroke();
    if (lit > 0) { rrect(g, -s * .011, -s * .053, s * .022, s * .055, s * .004); g.fillStyle = col('#a8e8ff', .55 * lit); g.fill(); }
    g.restore();
  }
  const LIE = { tr: -1.5, hd: -.06, hp1: 1.57, kn1: 0, hp2: 1.57, kn2: 0, sh1: 1.5, el1: .04, sh2: 1.55, el2: 0 };
  const SIT_BED = { tr: .08, hd: .16, hp1: 1.52, kn1: .1, hp2: 1.5, kn2: .06, sh1: .62, el1: .55, sh2: .42, el2: .5 };
  /* 旅馆房间（序幕；第十四幕回到这个凌晨）：R 窗户；st = {wake 坐起, ear 接电话, lamp 台灯, ring 手机亮}；画床、台灯、剪影、被子 */
  function motel(S, x, R, t, st, a, o = {}) {
    if (a <= 0) return null;
    const X0 = R.x + R.w * (o.x0 ?? .06), X1 = R.x + R.w * (o.x1 ?? 1.02), Y = R.y + R.h * (o.my ?? .8), u = (X1 - X0) / 1.1;
    const fy = bed(S, x, X0, X1, Y, u, a); lamp(S, x, X0 - u * .2, Y, u, st.lamp || 0, a, fy);
    x.save(); x.globalAlpha = a; const fg = x.createLinearGradient(0, fy, 0, fy + u * .06); fg.addColorStop(0, col(C.pri, .22)); fg.addColorStop(1, col(C.pri, 0)); x.fillStyle = fg; x.fillRect(X0 - u * .34, fy, X1 - X0 + u * .4, u * .06); x.restore();   // 地面反光
    const wake = st.wake || 0, P0 = mixP(LIE, SIT_BED, wake); P0.tr += (1 - wake) * .014 * Math.sin(t * 1.6);
    const pel = [X0 + u * .49, lerp(Y - u * .068, Y - u * .055, wake)], ear = st.ear || 0;
    const R1 = fig(S, x, { x: pel[0], y: Y, h: u, f: 1, pel, pose: P0, mode: 'sil', c: o.c || C.pri, a, rimA: .8, shadow: false, glow: true,
      reach1: ear > 0 ? 'ear' : null, rp1: ear, hold: ear > .05 ? (g, R) => handPhone(g, R, clamp(ear * 2), st.ring || 0) : null });
    if (!R1) return null;
    /* 被子：躺着盖到胸口，坐起来只盖腿；上沿顺着膝盖起伏 */
    const xs = lerp(R1.shd[0] + u * .03, R1.pel[0] + u * .07, wake), ty = Y - u * lerp(.085, .07, wake), kx = R1.pel[0] + u * .26, xe = X1 - u * .05;
    const path = q => { q.beginPath(); q.moveTo(xs - u * .02, Y + u * .03); q.quadraticCurveTo(xs - u * .03, ty + u * .01, xs + u * .04, ty); q.quadraticCurveTo(kx - u * .1, ty - u * .005, kx, ty - u * .022 * (1 - wake * .2)); q.quadraticCurveTo(kx + u * .12, ty + u * .012, xe, ty - u * .01); q.quadraticCurveTo(xe + u * .07, ty, xe + u * .06, Y + u * .075); q.closePath(); };
    x.save(); x.globalAlpha = a; path(x); const bg = x.createLinearGradient(0, ty, 0, Y + u * .08); bg.addColorStop(0, '#0e1a2c'); bg.addColorStop(1, '#070c18'); x.fillStyle = bg; x.fill(); x.strokeStyle = col(C.pri, .55); x.lineWidth = Math.max(1, u * .006); x.stroke();
    x.strokeStyle = col(C.pri, .18); x.beginPath(); x.moveTo(kx - u * .05, ty + u * .02); x.quadraticCurveTo(kx + u * .05, ty + u * .05, kx + u * .2, Y + u * .02); x.stroke(); x.restore();
    return R1;
  }
  /* 新闻相机（大画幅 + 闪光灯反光碗），画在两手之间；返回闪光灯位置 */
  function pressCam(g, R, pop) {
    const h = R.h, f = R.f, cx = (R.w1[0] + R.w2[0]) / 2, cy = (R.w1[1] + R.w2[1]) / 2 - h * .012;
    g.save(); g.translate(cx, cy); g.scale(f, 1); g.lineWidth = 1; g.strokeStyle = col(C.pri, .65);
    rrect(g, -h * .05, -h * .045, h * .1, h * .08, h * .01); g.fillStyle = '#05080f'; g.fill(); g.stroke();
    rrect(g, h * .046, -h * .028, h * .034, h * .05, h * .006); g.fill(); g.stroke();                 // 镜头
    g.beginPath(); g.moveTo(-h * .032, -h * .045); g.lineTo(-h * .032, -h * .085); g.stroke();
    g.beginPath(); g.ellipse(-h * .016, -h * .112, h * .017, h * .045, 0, 0, TAU); g.fillStyle = pop > .02 ? col('#ffffff', .5 + .5 * pop) : '#0b1220'; g.fill(); g.stroke();   // 反光碗（侧面看是窄椭圆）
    g.restore(); return [cx - f * h * .01, cy - h * .112];
  }
  /* 闪光：白芯 + 十字星芒 + 光晕 */
  function flashPop(S, x, X, Y, s, p) {
    if (p <= .01) return; const g = gl(S, x);
    haze(g, X, Y, s * 4 * (.6 + .4 * p), '#ffffff', .9 * p); haze(x, X, Y, s * 1.6, '#ffffff', .85 * p);
    x.save(); x.globalAlpha = p; x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = Math.max(1, s * .08); x.lineCap = 'round'; x.beginPath();
    for (const [dx, dy] of [[1, 0], [0, 1], [.7, .7], [.7, -.7]]) { const L = s * (dx && dy ? 1.3 : 2.6) * p; x.moveTo(X - dx * L, Y - dy * L); x.lineTo(X + dx * L, Y + dy * L); } x.stroke(); x.restore();
  }
  /* 记者群：n 个戴礼帽、穿风衣、端相机的剪影，面朝中间，前后错落；o.kneel = 半跪拍照的那一个；pops = [[时刻, 第几个]] 闪光 */
  function reporters(S, x, X1, X2, Y, hh, t, pops, a, o = {}) {
    if (a <= 0) return; const n = o.n || 5, mid = o.mid ?? (X1 + X2) / 2, order = [];
    for (let i = 0; i < n; i++) order.push([MO.hash(i + 3, o.seed || 7) < .5 ? 0 : 1, i]);
    order.sort((p, q) => p[0] - q[0]);   // 后排先画
    for (const [back, i] of order) {
      const q = n === 1 ? .5 : i / (n - 1), d = back ? .9 : 1, px = lerp(X1, X2, q) + (MO.hash(i, 9) - .5) * hh * .12, f = px < mid ? 1 : -1, h = hh * d * (1 + (MO.hash(i, 5) - .5) * .1), Yb = Y - (back ? hh * .05 : 0);
      let up = o.up ? o.up[i] ?? .35 : .35, pop = 0;
      for (const [tp, k] of pops) if (k === i) { up = Math.max(up, seg(t, tp - .5, tp - .18) * (1 - seg(t, tp + .9, tp + 1.5))); if (t >= tp && t < tp + .7) pop = Math.max(pop, Math.exp(-(t - tp) * 8)); }
      const sway = MO.noise(t * .7 + i * 5, 3) * .03, upE = E.io3(up), kneel = o.kneel === i, lean = .03 + MO.hash(i, 13) * .08;
      const pose = kneel ? { tr: .1 + sway, hd: lerp(.12, -.02, upE), hp1: 1.45, kn1: 1.45, hp2: -.2, kn2: 1.37 } : { tr: lean + sway + upE * .03, hd: lerp(.14, -.02, upE), hp1: .14, kn1: .04, hp2: -.12, kn2: .03 };
      const camAt = R0 => { const hc = R0.headC; return [hc[0] + f * h * lerp(.13, .105, upE), hc[1] + h * lerp(.2, .02, upE)]; };
      let fl = null;
      fig(S, x, { x: px, y: Yb, h, f, pose, hat: 'fedora', coat: kneel ? 0 : .75, mode: 'holo', c: o.c || C.pri, a: a * (back ? .72 : 1), pel: kneel ? [px, Yb - h * .266] : null,
        reach1: R0 => { const c = camAt(R0); return [c[0] + f * h * .035, c[1] + h * .04]; }, reach2: R0 => { const c = camAt(R0); return [c[0] - f * h * .045, c[1] + h * .03]; },
        hold: (g, R) => { fl = pressCam(g, R, pop); } });
      if (fl && pop > 0) flashPop(S, x, fl[0], fl[1], h * .055, pop);
    }
  }
  /* 路牌（全息）：杆 + 牌子 + 两行字 */
  function sign(S, x, X, Y, h, l1, l2, a, c = C.pri, side = 1) {
    if (a <= 0) return; const v = S.v, by = Y - h, s1 = Math.max(v * 1.5, h * .14), w = Math.max(TW(S.hud, l1, { f: 'sans', size: s1, w: 700 }), l2 ? TW(S.hud, l2, { f: 'mono', size: s1 * .55, w: 500 }) : 0) + fsz(s1) * 1.2, bh = fsz(s1) * (l2 ? 2.3 : 1.6);
    line(S, x, q => { q.beginPath(); q.moveTo(X, Y); q.lineTo(X, by + bh); }, c, a, 1.4);
    const bx = side > 0 ? X - fsz(s1) * .4 : X - w + fsz(s1) * .4;
    x.save(); x.globalAlpha = a; rrect(x, bx, by, w, bh, bh * .18); x.fillStyle = 'rgba(5,14,30,.88)'; x.fill(); x.strokeStyle = col(c, .8); x.lineWidth = 1.2; x.stroke(); x.restore();
    T(S.hud, l1, bx + w / 2, by + fsz(s1) * (l2 ? .8 : .8), { f: 'sans', size: s1, w: 700, c: C.ink, al: 'center', a });
    if (l2) T(S.hud, l2, bx + w / 2, by + fsz(s1) * 1.7, { f: 'mono', size: s1 * .55, w: 500, c, al: 'center', tr: .08, a });
  }
  /* 复古机器人（报纸想象里的“会思考的机器”，正面）：A = {walk, talk, look, write, copy, aware}，各 0..1 */
  function robot(S, x, X, Y, h, t, A, a, c = C.pri, o = {}) {
    if (a <= 0) return; const g = gl(S, x), w = Math.max(1, h * .012), dk = '#060b16', rc = col(c, .9);
    const step = A.walk > 0 && A.walk < 1 ? Math.sin(A.walk * Math.PI * 6) : 0, bob = Math.abs(step) * h * .015;
    const hipY = Y - h * .42 - bob, tY = Y - h * .8 - bob, hy = tY - h * .2;
    const P = (pf, fillC = dk) => { pf(x); x.fillStyle = fillC; x.fill(); x.strokeStyle = rc; x.lineWidth = w; x.stroke(); g.save(); g.globalAlpha = a * .5; pf(g); g.strokeStyle = col(c, 1); g.lineWidth = w * 2.5; g.stroke(); g.restore(); };
    x.save(); x.globalAlpha = a; x.lineCap = 'round'; x.lineJoin = 'round';
    /* 腿：正面踏步，抬膝 */
    [-1, 1].forEach(sd => {
      const lift = Math.max(0, sd * step) * h * .09, hx = X + sd * h * .075, ky = hipY + h * .19 - lift * .8, fy = Y - lift;
      x.strokeStyle = rc; x.lineWidth = h * .045 + w * 2; x.beginPath(); x.moveTo(hx, hipY); x.lineTo(hx + sd * h * .01, ky); x.lineTo(hx, fy - h * .025); x.stroke();
      x.strokeStyle = dk; x.lineWidth = h * .045; x.stroke();
      rrect(x, hx - h * .055, fy - h * .04, h * .11, h * .04, h * .012); x.fillStyle = dk; x.fill(); x.strokeStyle = rc; x.lineWidth = w; x.stroke();
      x.beginPath(); x.arc(hx + sd * h * .01, ky, h * .026, 0, TAU); x.fillStyle = dk; x.fill(); x.stroke();
    });
    /* 手臂：sh 肩角（0 下垂，正值往外抬），el 肘弯 */
    const arm = (sd, sh, el, claw = .3) => {
      const s0 = [X + sd * h * .17, tY + h * .05], e = [s0[0] + sd * Math.sin(sh) * h * .17, s0[1] + Math.cos(sh) * h * .17], ww = [e[0] + sd * Math.sin(sh + el) * h * .16, e[1] + Math.cos(sh + el) * h * .16];
      x.strokeStyle = rc; x.lineWidth = h * .04 + w * 2; x.beginPath(); x.moveTo(s0[0], s0[1]); x.lineTo(e[0], e[1]); x.lineTo(ww[0], ww[1]); x.stroke(); x.strokeStyle = dk; x.lineWidth = h * .04; x.stroke();
      x.beginPath(); x.arc(e[0], e[1], h * .022, 0, TAU); x.fillStyle = dk; x.fill(); x.strokeStyle = rc; x.lineWidth = w; x.stroke();
      const an = Math.atan2(ww[1] - e[1], ww[0] - e[0]); x.lineWidth = w * 1.5; x.beginPath(); for (const k of [-1, 1]) { x.moveTo(ww[0], ww[1]); x.lineTo(ww[0] + Math.cos(an + k * claw) * h * .045, ww[1] + Math.sin(an + k * claw) * h * .045); } x.stroke();
      return ww;
    };
    const swing = step * .35, wr = A.write > 0 && A.write < 1 ? 1 : 0, aw = E.io3(clamp(A.aware * 2)), wv = A.talk > 0 && A.talk < 1 ? Math.max(0, Math.sin(A.talk * Math.PI * 4)) : 0;
    const L = arm(-1, .25 + swing - aw * .1 + wv * .9, .3 + aw * 1.3 + wv * .6), Rh = arm(1, wr ? .5 : .25 - swing - aw * .1, wr ? 1.2 + .25 * Math.sin(t * 16) : .3 + aw * 1.3);
    /* 躯干 */
    P(q => rrect(q, X - h * .17, tY, h * .34, h * .36, h * .04)); rrect(x, X - h * .1, tY + h * .07, h * .2, h * .13, h * .02); x.fillStyle = 'rgba(8,24,44,.95)'; x.fill(); x.strokeStyle = col(c, .5); x.lineWidth = w; x.stroke();
    x.beginPath(); x.arc(X - h * .045, tY + h * .135, h * .035, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(X - h * .045, tY + h * .135); x.lineTo(X - h * .045 + Math.cos(t * 3) * h * .03, tY + h * .135 + Math.sin(t * 3) * h * .03); x.stroke();
    for (let i = 0; i < 3; i++) { const on = .3 + .7 * (Math.sin(t * 5 + i * 2) > .2 ? 1 : 0); x.fillStyle = col(i === 1 ? C.acc : C.ok, on); x.beginPath(); x.arc(X + h * .035 + (i % 2) * h * .03, tY + h * .1 + i * h * .025, h * .011, 0, TAU); x.fill(); }
    if (aw > 0) { haze(g, X, tY + h * .17, h * .3 * aw, C.acc, .7 * aw); x.fillStyle = col(C.accHi, aw); x.beginPath(); x.arc(X, tY + h * .27, h * .03 * aw, 0, TAU); x.fill(); }
    /* 头：方盒 + 天线 + 两只眼 + 嘴（格栅） */
    x.strokeStyle = rc; x.lineWidth = w; x.beginPath(); x.moveTo(X, tY); x.lineTo(X, tY - h * .03); x.stroke();
    const tilt = aw * .18 * Math.sin(Math.min(1, A.aware * 1.5) * Math.PI) - (A.look > 0 && A.look < 1 ? 0 : 0);
    x.save(); x.translate(X, hy + h * .08); x.rotate(tilt); x.translate(-X, -(hy + h * .08));
    P(q => rrect(q, X - h * .13, hy - h * .07, h * .26, h * .17, h * .035));
    x.beginPath(); x.moveTo(X, hy - h * .07); x.lineTo(X, hy - h * .15); x.stroke(); const ab = .4 + .6 * (Math.sin(t * 6) > 0 ? 1 : 0); x.fillStyle = col(C.acc, ab); x.beginPath(); x.arc(X, hy - h * .16, h * .02, 0, TAU); x.fill(); haze(g, X, hy - h * .16, h * .06, C.acc, .6 * ab);
    const eyeA = .55 + .45 * (A.look > 0 && A.look < 1 ? 1 : 0), sweep = A.look > 0 && A.look < 1 ? Math.sin(A.look * Math.PI * 2) * h * .015 : 0;
    for (const sd of [-1, 1]) { const ex = X + sd * h * .055, ey = hy - h * .005; x.beginPath(); x.arc(ex, ey, h * .03, 0, TAU); x.fillStyle = '#02050c'; x.fill(); x.strokeStyle = rc; x.stroke(); x.fillStyle = col(C.priHi, eyeA); x.beginPath(); x.arc(ex + sweep, ey, h * .015, 0, TAU); x.fill(); haze(g, ex, ey, h * .05, C.pri, eyeA * .8); }
    for (let i = 0; i < 3; i++) { x.strokeStyle = col(wv > .1 || (A.talk > 0 && A.talk < 1 && Math.sin(t * 22 + i) > 0) ? C.priHi : C.mute, .9); x.beginPath(); x.moveTo(X - h * .05, hy + h * .05 + i * h * .014); x.lineTo(X + h * .05, hy + h * .05 + i * h * .014); x.stroke(); }
    x.restore();
    x.restore();
    /* 看：两道扫描光束 */
    if (A.look > 0 && A.look < 1) { const la = Math.sin(A.look * Math.PI), sw = Math.sin(A.look * Math.PI * 2) * .35; x.save(); x.globalAlpha = a * la * .5; for (const sd of [-1, 1]) { const ex = X + sd * h * .055, ey = hy - h * .005, L = h * .9, an = (o.lookDir ?? 1) > 0 ? -.05 + sw : Math.PI + .05 - sw; const gr = x.createLinearGradient(ex, ey, ex + Math.cos(an) * L, ey + Math.sin(an) * L); gr.addColorStop(0, col(C.pri, .55)); gr.addColorStop(1, col(C.pri, 0)); x.fillStyle = gr; x.beginPath(); x.moveTo(ex, ey); x.lineTo(ex + Math.cos(an - .12) * L, ey + Math.sin(an - .12) * L); x.lineTo(ex + Math.cos(an + .12) * L, ey + Math.sin(an + .12) * L); x.closePath(); x.fill(); } x.restore(); }
    /* 说：声波弧 */
    if (A.talk > 0 && A.talk < 1) { const ta = Math.sin(A.talk * Math.PI); for (let i = 0; i < 3; i++) { const q = ((t * 1.6 + i / 3) % 1), rr = h * (.08 + q * .22); x.save(); x.globalAlpha = a * ta * (1 - q); x.strokeStyle = col(C.priHi, .9); x.lineWidth = w * 1.3; x.beginPath(); x.arc(X + h * .1, hy + h * .05, rr, -.6, .6); x.stroke(); x.restore(); } }
    /* 写：右手握笔，在小本子上划出字迹 */
    if (A.write > 0) { const wa = Math.min(1, A.write * 4) * (1 - seg(A.write, .85, 1)), px = X + h * .24, py = tY + h * .3; x.save(); x.globalAlpha = a * wa; x.translate(px, py); x.rotate(-.15); x.fillStyle = '#e9e4d8'; x.fillRect(-h * .06, -h * .04, h * .16, h * .11); x.strokeStyle = '#1b2b45'; x.lineWidth = Math.max(1, h * .006); x.beginPath(); const n = Math.floor(clamp(A.write * 1.3) * 24); for (let i = 0; i <= n; i++) { const xx = -h * .05 + (i % 12) * h * .011, yy = -h * .015 + Math.floor(i / 12) * h * .035 + Math.sin(i * 2.3) * h * .008; i % 12 ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); x.restore(); }
    /* 想：头顶冒出思考泡泡 */
    if (aw > 0 && !o.noBubble) { const ba = E.oB(seg(A.aware, .25, .6), 1.4), bs = o.bubbleSide ?? 1, bx = X + bs * h * .42, by = hy - h * .08; if (ba > 0) { x.save(); x.globalAlpha = a * Math.min(1, ba); for (const [dx, dy, r] of [[-.2, .06, .018], [-.14, .02, .028]]) { x.beginPath(); x.arc(bx + bs * dx * h, by + dy * h, r * h, 0, TAU); x.fillStyle = 'rgba(30,6,34,.9)'; x.fill(); x.strokeStyle = col(C.acc, .9); x.lineWidth = w; x.stroke(); } x.translate(bx, by); x.scale(ba, ba); rrect(x, -h * .14, -h * .08, h * .28, h * .15, h * .07); x.fillStyle = 'rgba(30,6,34,.92)'; x.fill(); x.strokeStyle = col(C.acc, .95); x.stroke(); x.restore(); T(S.hud, '我…？', bx, by, { f: 'sans', size: h * .09, w: 900, c: C.accHi, al: 'center', a: a * clamp(ba) }); } }
  }
  /* 实验楼（侧面立面）：lit(i) 返回第 i 扇窗的亮度 0..1 */
  function lab(S, x, R, lit, a, o = {}) {
    if (a <= 0) return; const cols = o.cols || 5, rows = o.rows || 3, pad = R.w * .08, ww = (R.w - pad * 2) / cols, wh = (R.h * .62) / rows, rc = col(C.pri, .5);
    x.save(); x.globalAlpha = a; x.fillStyle = '#060b16'; x.fillRect(R.x, R.y, R.w, R.h); x.strokeStyle = rc; x.lineWidth = 1; x.strokeRect(R.x, R.y, R.w, R.h);
    x.fillRect(R.x - R.w * .03, R.y - R.h * .05, R.w * 1.06, R.h * .05); x.strokeRect(R.x - R.w * .03, R.y - R.h * .05, R.w * 1.06, R.h * .05);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = j * cols + i, L = lit(k), wx = R.x + pad + i * ww + ww * .14, wy = R.y + R.h * .08 + j * wh + wh * .14, w2 = ww * .72, h2 = wh * .66;
      x.fillStyle = L > .01 ? col(mix('#0b1424', '#ffd58a', L * .85), 1) : '#0a1220'; x.fillRect(wx, wy, w2, h2); x.strokeStyle = col(C.pri, .25); x.strokeRect(wx, wy, w2, h2);
      if (L > .01) haze(gl(S, x), wx + w2 / 2, wy + h2 / 2, ww * .8, C.gold, .45 * L * a);
    }
    const dw = R.w * .14, dh = R.h * .22, dx = R.x + R.w / 2 - dw / 2, dy = R.y + R.h - dh; x.fillStyle = o.door > 0 ? col(mix('#0a1220', '#ffd58a', o.door * .6), 1) : '#0a1220'; x.fillRect(dx, dy, dw, dh); x.strokeStyle = rc; x.strokeRect(dx, dy, dw, dh);
    x.restore();
    if (o.label) T(S.hud, o.label, R.x + R.w / 2, R.y - R.h * .025, { f: 'mono', size: Math.max(S.v * .9, R.h * .045), w: 500, c: C.ink, al: 'center', tr: .2, a: a * .9 });
    return { door: [R.x + R.w / 2, R.y + R.h] };
  }
  /* 手里抱着纸箱 */
  function boxHold(g, R, a = 1) { const h = R.h, cx = (R.w1[0] + R.w2[0]) / 2 + R.f * h * .03, cy = (R.w1[1] + R.w2[1]) / 2 - h * .03; g.save(); g.globalAlpha *= a; rrect(g, cx - h * .08, cy - h * .06, h * .16, h * .11, h * .01); g.fillStyle = '#1a1408'; g.fill(); g.strokeStyle = col(C.gold, .7); g.lineWidth = 1; g.stroke(); g.beginPath(); g.moveTo(cx - h * .08, cy - h * .03); g.lineTo(cx + h * .08, cy - h * .03); g.stroke(); g.restore(); }
  /* 天文台：圆柱底座 + 穹顶，open 0..1 天窗打开、望远镜抬起 */
  function observatory(S, x, X, Y, s, open, t, a) {
    if (a <= 0) return; const g = gl(S, x), r = s * .5, rc = col(C.pri, .6), bw = s, bh = s * .55;
    x.save(); x.globalAlpha = a; x.lineWidth = 1.2;
    x.fillStyle = '#081020'; x.fillRect(X - bw / 2, Y - bh, bw, bh); x.strokeStyle = rc; x.strokeRect(X - bw / 2, Y - bh, bw, bh);
    const dw = s * .16, dh = s * .3; x.fillStyle = col(mix('#0a1220', '#ffd58a', .55 * open), 1); x.fillRect(X - dw / 2, Y - dh, dw, dh); x.strokeRect(X - dw / 2, Y - dh, dw, dh);   // 门（里面亮着灯）
    x.beginPath(); x.arc(X, Y - bh, r, Math.PI, 0); x.closePath(); x.fillStyle = '#0a1426'; x.fill(); x.stroke();
    const sl = s * .07 + open * s * .09, ang = lerp(-1.2, -.75, open);   /* 天窗：一条竖缝从中间张开，里面透出暖光；望远镜伸出来 */
    x.save(); x.beginPath(); x.arc(X, Y - bh, r, Math.PI, 0); x.closePath(); x.clip();
    const gr = x.createLinearGradient(0, Y - bh - r, 0, Y - bh); gr.addColorStop(0, col('#ffd58a', .25 + .5 * open)); gr.addColorStop(1, col('#ffb347', .55 * open)); x.fillStyle = open > .02 ? gr : '#060b16'; x.fillRect(X - sl / 2, Y - bh - r, sl, r); x.restore();
    if (open > .02) {
      const L = s * .62 * open, tx = X + Math.cos(ang) * L, ty = Y - bh - r * .35 + Math.sin(ang) * L;
      x.strokeStyle = col(C.ink, .9); x.lineWidth = s * .06; x.lineCap = 'round'; x.beginPath(); x.moveTo(X, Y - bh - r * .35); x.lineTo(tx, ty); x.stroke();
      x.strokeStyle = col(C.gold, .8); x.lineWidth = s * .02; x.stroke();
      haze(g, X, Y - bh - r * .5, s * .7, C.gold, .45 * open * a);
    }
    x.restore();
  }
  /* 帆船剪影（主帆 + 前帆 + 船身 + 水中倒影） */
  function sailboat(S, x, X, Y, s, t, a, o = {}) {
    if (a <= 0 || s < 2) return; const sw = Math.sin(t * 1.3) * .03, c = o.c || '#ffd9c2';
    const draw = (q, flip) => {
      q.save(); q.translate(X, Y); q.scale(1, flip ? -.55 : 1); q.rotate(sw * (flip ? -1 : 1));
      q.beginPath(); q.moveTo(-s * .55, 0); q.lineTo(s * .55, 0); q.lineTo(s * .4, s * .13); q.lineTo(-s * .42, s * .13); q.closePath(); q.fill();   // 船身
      q.fillRect(-s * .015, -s * 1.15, s * .03, s * 1.15);                                                                                   // 桅杆
      q.beginPath(); q.moveTo(s * .02, -s * 1.1); q.quadraticCurveTo(s * .45, -s * .55, s * .5, -s * .06); q.lineTo(s * .02, -s * .06); q.closePath(); q.fill();   // 主帆
      q.beginPath(); q.moveTo(-s * .03, -s * .95); q.quadraticCurveTo(-s * .28, -s * .5, -s * .48, -s * .04); q.lineTo(-s * .03, -s * .04); q.closePath(); q.fill();   // 前帆
      q.restore();
    };
    x.save(); x.globalAlpha = a * .95; x.fillStyle = '#0d0a14'; draw(x, false); x.globalAlpha = a * .25; x.fillStyle = '#0d0a14'; draw(x, true);
    x.globalAlpha = a * .5; x.strokeStyle = col(c, .6); x.lineWidth = 1; for (let i = 0; i < 3; i++) { const q = ((t * .5 + i / 3) % 1); x.beginPath(); x.moveTo(X + s * (.5 + q * 1.4), Y + s * (.05 + q * .1)); x.lineTo(X + s * (.8 + q * 1.8), Y + s * (.05 + q * .12)); x.stroke(); }   // 船尾的水纹
    x.restore();
  }
  /* 法槌：t0 落下那一刻；(X, Y) 是锤头砸到的点；落下后有冲击圈；o.base 画底座 */
  function gavel(S, x, X, Y, s, t, t0, a, o = {}) {
    if (a <= 0) return; const g = gl(S, x), up = E.io3(seg(t, t0 - .6, t0 - .16)), dn = E.i3(seg(t, t0 - .16, t0)), ang = t < t0 ? -1.0 * up * (1 - dn) : .06 * Math.sin((t - t0) * 30) * Math.exp(-(t - t0) * 9);
    const P = [X + s * .58, Y - s * .2];
    x.save(); x.globalAlpha = a;
    if (o.base) { rrect(x, X - s * .26, Y, s * .52, s * .12, s * .03); x.fillStyle = '#0c1424'; x.fill(); x.strokeStyle = col(C.pri, .6); x.lineWidth = 1.2; x.stroke(); }
    x.translate(P[0], P[1]); x.rotate(ang); x.translate(-P[0], -P[1]);
    x.lineCap = 'round'; x.strokeStyle = col(C.ink, .9); x.lineWidth = s * .07; x.beginPath(); x.moveTo(P[0] + s * .12, P[1]); x.lineTo(X + s * .08, Y - s * .2); x.stroke();   // 柄
    x.strokeStyle = col(C.gold, .7); x.lineWidth = s * .025; x.stroke();
    rrect(x, X - s * .11, Y - s * .4, s * .22, s * .4, s * .05); x.fillStyle = '#1a2436'; x.fill(); x.strokeStyle = col(C.ink, .9); x.lineWidth = 1.5; x.stroke();   // 锤头（落下时底面正好碰到 Y）
    x.strokeStyle = col(C.gold, .8); x.lineWidth = 1.2; for (const yy of [Y - s * .33, Y - s * .07]) { x.beginPath(); x.moveTo(X - s * .11, yy); x.lineTo(X + s * .11, yy); x.stroke(); }
    x.restore();
    if (t > t0 && t < t0 + .8) { const q = (t - t0) / .8; for (let i = 0; i < 2; i++) { const qq = clamp(q * 1.4 - i * .25); if (qq <= 0 || qq >= 1) continue; x.save(); x.globalAlpha = a * (1 - qq); x.strokeStyle = col(C.red, .9); x.lineWidth = 2; x.beginPath(); x.ellipse(X, Y + s * .01, s * (.3 + qq * 1.3), s * (.07 + qq * .3), 0, 0, TAU); x.stroke(); x.restore(); } haze(g, X, Y, s * 1.3 * (1 - q), C.red, .8 * (1 - q) * a); }
  }

  /* 木匠：工作台前推刨子，刨花卷起来飞走（第八幕） */
  function carpenter(S, x, X, Y, h, t, a, c = C.gold) {
    if (a <= 0) return; const g = gl(S, x), bh = h * .43, bw = h * 1.05, bx0 = X - bw * .3, bx1 = X + bw * .62, top = Y - bh;
    const T0 = 1.15, n = Math.floor(t / T0), ph = (t / T0) - n, fwd = ph < .55 ? E.io3(ph / .55) : 1 - E.ioS((ph - .55) / .45);
    const pxl = lerp(X - bw * .1, X + bw * .38, fwd), py = top - h * .03;
    /* 工作台 + 木板 */
    line(S, x, q => { q.beginPath(); q.moveTo(bx0, top); q.lineTo(bx1, top); q.moveTo(bx0 + h * .04, top); q.lineTo(bx0 + h * .02, Y); q.moveTo(bx1 - h * .04, top); q.lineTo(bx1 - h * .02, Y); q.moveTo(bx0 + h * .03, Y - bh * .35); q.lineTo(bx1 - h * .03, Y - bh * .35); }, c, a * .8, Math.max(1.2, h * .012));
    x.save(); x.globalAlpha = a; x.fillStyle = '#2a1a08'; x.fillRect(X - bw * .2, top - h * .03, bw * .7, h * .03); x.strokeStyle = col(c, .7); x.lineWidth = 1; x.strokeRect(X - bw * .2, top - h * .03, bw * .7, h * .03); x.restore();
    /* 刨子：刨身 + 前把手 + 后把手 */
    const pw = h * .16, plane = q => { rrect(q, pxl - pw / 2, py - h * .045, pw, h * .045, h * .01); };
    x.save(); x.globalAlpha = a; plane(x); x.fillStyle = '#1b1206'; x.fill(); x.strokeStyle = col(c, .9); x.lineWidth = 1.2; x.stroke();
    x.beginPath(); x.arc(pxl + pw * .38, py - h * .055, h * .016, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(pxl - pw * .35, py - h * .045); x.quadraticCurveTo(pxl - pw * .42, py - h * .1, pxl - pw * .2, py - h * .095); x.lineTo(pxl - pw * .12, py - h * .045); x.stroke(); x.restore();
    /* 人：俯身推刨，身体跟着前后送 */
    fig(S, x, { x: X - bw * .44 + fwd * h * .07, y: Y, h, f: 1, mode: 'holo', c, a, pose: { tr: .32 + .14 * fwd, hd: .3, hp1: .32 + .1 * fwd, kn1: .2, hp2: -.22, kn2: .04 },
      reach1: [pxl - pw * .25, py - h * .085], reach2: [pxl + pw * .38, py - h * .06] });
    /* 刨花：往前推时在刨口卷起来，推到头就飞出去、旋转着落下 */
    const curl = (cx, cy, r, turns, al, rot) => { x.save(); x.globalAlpha = al; x.translate(cx, cy); x.rotate(rot); x.strokeStyle = col('#ffd58a', .95); x.lineWidth = Math.max(1, h * .008); x.beginPath(); for (let i = 0; i <= 24; i++) { const q = i / 24, an = q * turns * TAU, rr = r * (1 - q * .7); const px2 = Math.cos(an) * rr, py2 = Math.sin(an) * rr - r; i ? x.lineTo(px2, py2) : x.moveTo(px2, py2); } x.stroke(); x.restore(); };
    if (ph < .55) curl(pxl + pw * .5, py - h * .045, h * .035 * (.3 + fwd), .4 + fwd * 1.2, a, 0);
    for (let k = 0; k < 3; k++) {   /* 前几刨的刨花还在空中 */
      const tk = (n - k) * T0 + T0 * .55, q = (t - tk) / 1.1; if (q < 0 || q > 1) continue;
      const sx = X + bw * .38 + pw * .5, sy = py - h * .045, dx = h * (.25 + MO.hash(n - k, 3) * .2) * q, dy = -h * .22 * Math.sin(q * Math.PI * .8) + h * .45 * q * q;
      curl(sx + dx, sy + dy, h * .045, 1.6, a * (1 - q * q), q * 6);
    }
    for (let i = 0; i < 10; i++) { const q = ((t * .6 + MO.hash(i, 17)) % 1), dx = (MO.hash(i, 5) - .3) * h * .6, px2 = X + bw * .3 + dx, py2 = top - h * .06 - q * h * .35; x.save(); x.globalAlpha = a * .6 * (1 - q); x.fillStyle = col('#ffd58a', 1); x.fillRect(px2, py2, 1.5, 1.5); x.restore(); }   // 木屑
  }
  /* 长椅上的人，四季轮转（第九幕 · 冷板凳）：sp 0..1 季节进度（走几轮四季） */
  function benchSeasons(S, x, X, Y, h, t, sp, a, o = {}) {
    if (a <= 0) return; const g = gl(S, x), cyc = sp * (o.cycles ?? 2) * 4, si = Math.floor(cyc) % 4, fr = cyc - Math.floor(cyc), blend = E.ioS(clamp((fr - .7) / .3));
    const wgt = [0, 0, 0, 0]; wgt[si] = 1 - blend; wgt[(si + 1) % 4] += blend;   // 0 春 1 夏 2 秋 3 冬
    const tx = X + h * .95, base = Y;
    /* 树：树干 + 枝条，树冠颜色随季节变 */
    line(S, x, q => { q.beginPath(); q.moveTo(tx, base); q.lineTo(tx, base - h * .75); q.moveTo(tx, base - h * .5); q.lineTo(tx - h * .25, base - h * .85); q.moveTo(tx, base - h * .62); q.lineTo(tx + h * .22, base - h * .92); q.moveTo(tx, base - h * .75); q.lineTo(tx - h * .05, base - h * 1.05); }, C.cold, a * .85, Math.max(1.2, h * .02));
    const leafC = [['#ffb3d9', .9], ['#5cffb0', .8], ['#ffb347', .85], ['#e8f4ff', .35]], rr = rng(77);
    for (let i = 0; i < 26; i++) {
      const an = rr() * TAU, d = Math.sqrt(rr()), lx = tx + Math.cos(an) * h * .38 * d, ly = base - h * .9 + Math.sin(an) * h * .22 * d, sz = h * (.04 + rr() * .04);
      let al = 0; for (let k = 0; k < 4; k++) if (wgt[k] > 0) { al += wgt[k] * leafC[k][1] * (k === 3 ? .4 : 1); }
      const mixc = wgt.reduce((acc, w, k) => w > acc[1] ? [leafC[k][0], w] : acc, ['#ffffff', -1])[0];
      x.save(); x.globalAlpha = a * al; x.fillStyle = col(mixc, .55); x.beginPath(); x.arc(lx, ly, sz, 0, TAU); x.fill(); x.restore();
    }
    haze(g, tx, base - h * .9, h * .5, wgt[1] > .5 ? C.ok : wgt[0] > .5 ? C.accHi : wgt[2] > .5 ? C.gold : C.cold, .25 * a);
    /* 长椅 */
    const sx0 = X - h * .35, sx1 = X + h * .45, seat = base - h * .27;
    line(S, x, q => { q.beginPath(); q.moveTo(sx0, seat); q.lineTo(sx1, seat); q.moveTo(sx0, seat - h * .2); q.lineTo(sx1, seat - h * .2); q.moveTo(sx0 + h * .04, seat); q.lineTo(sx0 + h * .04, base); q.moveTo(sx1 - h * .04, seat); q.lineTo(sx1 - h * .04, base); q.moveTo(sx0 + h * .04, seat); q.lineTo(sx0 + h * .02, seat - h * .2); q.moveTo(sx1 - h * .04, seat); q.lineTo(sx1 - h * .02, seat - h * .2); }, C.cold, a, Math.max(1.2, h * .018));
    /* 人：坐着，低头在本子上写 */
    const wr = Math.sin(t * 7) * .02;
    const R1 = fig(S, x, { x: X, y: base, h, f: 1, pel: [X, seat - h * .02], mode: 'holo', c: o.c || C.pri, a, pose: { tr: .28, hd: .35, hp1: 1.5, kn1: 1.45, hp2: 1.45, kn2: 1.4, sh1: .5, el1: 1.1 + wr * 3, sh2: .4, el2: 1.2 },
      hold: (q, R) => { q.save(); q.translate((R.w1[0] + R.w2[0]) / 2, (R.w1[1] + R.w2[1]) / 2); q.rotate(.25); q.fillStyle = '#e9e4d8'; q.globalAlpha *= .9; q.fillRect(-h * .06, -h * .02, h * .12, h * .035); q.restore(); } });
    if (R1 && wgt[3] > 0) { x.save(); x.globalAlpha = a * wgt[3]; x.fillStyle = '#f2f8ff'; x.beginPath(); x.ellipse(R1.headC[0], R1.headC[1] - h * .055, h * .05, h * .02, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(R1.shd[0] - h * .02, R1.shd[1] - h * .03, h * .055, h * .016, -.3, 0, TAU); x.fill(); x.restore(); }   // 冬天：头上、肩上落了雪
    /* 飘落物：春天花瓣、秋天落叶、冬天雪 */
    for (let i = 0; i < 24; i++) {
      const q = ((t * (.35 + MO.hash(i, 2) * .25) + MO.hash(i, 9)) % 1), fx = tx + (MO.hash(i, 4) - .5) * h * 1.6 + Math.sin(t * 2 + i) * h * .05 - q * h * .2, fy = base - h * 1.05 + q * h * 1.08;
      for (const [k, cc, sz] of [[0, '#ffb3d9', .012], [2, '#ffb347', .016], [3, '#ffffff', .011]]) { if (wgt[k] <= .02) continue; x.save(); x.globalAlpha = a * wgt[k] * .9 * Math.sin(q * Math.PI); x.fillStyle = cc; x.beginPath(); x.ellipse(fx, fy, h * sz * (k === 2 ? 1.4 : 1), h * sz, t * 2 + i, 0, TAU); x.fill(); x.restore(); }
    }
    if (wgt[1] > .02) haze(g, X - h * .6, base - h * 1.1, h * .5, C.gold, .35 * a * wgt[1]);   // 夏天的太阳
    return ['春', '夏', '秋', '冬'][wgt.indexOf(Math.max(...wgt))];
  }
  /* 椅子（侧视，朝右）*/
  function chair(S, x, X, Y, h, a, c = C.pri, f = 1) { line(S, x, q => { q.beginPath(); q.moveTo(X - f * h * .12, Y - h * .27); q.lineTo(X + f * h * .12, Y - h * .27); q.moveTo(X - f * h * .1, Y - h * .27); q.lineTo(X - f * h * .1, Y); q.moveTo(X + f * h * .1, Y - h * .27); q.lineTo(X + f * h * .1, Y); q.moveTo(X - f * h * .12, Y - h * .27); q.lineTo(X - f * h * .15, Y - h * .62); }, c, a * .8, Math.max(1.2, h * .015)); }
  /* 桌子（侧视）*/
  function desk(S, x, X0, X1, Y, top, a, c = C.pri) { line(S, x, q => { q.beginPath(); q.moveTo(X0, top); q.lineTo(X1, top); q.moveTo(X0 + (X1 - X0) * .08, top); q.lineTo(X0 + (X1 - X0) * .08, Y); q.moveTo(X1 - (X1 - X0) * .08, top); q.lineTo(X1 - (X1 - X0) * .08, Y); }, c, a * .8, Math.max(1.2, (Y - top) * .03)); }
  /* 笔记本电脑：lid 0 合上 .. 1 打开；glow 屏幕亮度；返回屏幕中心 */
  function laptop(S, x, X, Y, s, lid, glow, a, f = 1) {
    if (a <= 0) return null; const ang = lerp(0, 1.85, lid), hx = X - f * s * .5, base = q => { q.beginPath(); q.moveTo(hx, Y); q.lineTo(X + f * s * .5, Y); };
    x.save(); x.globalAlpha = a; x.lineCap = 'round'; x.strokeStyle = col(C.pri, .9); x.lineWidth = Math.max(2, s * .06); base(x); x.stroke();
    const ex = hx + f * Math.cos(ang) * s * .95 * 1, ey = Y - Math.sin(ang) * s * .95; x.beginPath(); x.moveTo(hx, Y); x.lineTo(ex, ey); x.stroke(); x.restore();
    if (glow > 0 && lid > .2) { const g = gl(S, x), mx = (hx + ex) / 2, my = (Y + ey) / 2; haze(g, mx + f * s * .3, my, s * 1.2, C.pri, .6 * glow * a); haze(x, mx + f * s * .25, my, s * .9, C.pri, .18 * glow * a); return [mx, my]; }
    return null;
  }

  return { carpenter, benchSeasons, chair, desk, laptop, B, NEUTRAL, ik, mixP, kf, walk, STRIDE, rig, fig, limb, tag, floor, line, dir, add, ez, gl, neon, bed, lamp, handPhone, motel, pressCam, flashPop, reporters, sign, robot, lab, boxHold, observatory, sailboat, gavel, LIE, SIT_BED };
})();
