'use strict';
/* 课程影片：由旁白时长生成时间轴，提供关键词定时、场景切换与转场 */
function spokenWeights(s) {
  const out = [];
  for (const ch of s) {
    let w = .2;
    if (/[一-鿿]/.test(ch)) w = 1; else if (/[A-Za-z]/.test(ch)) w = .36; else if (/[0-9]/.test(ch)) w = .75;
    else if ('，、'.includes(ch)) w = .85; else if ('。！？'.includes(ch)) w = 1.35; else if ('：；'.includes(ch)) w = 1.0; else if (ch === ' ') w = .12;
    out.push([ch, w]);
  }
  return out;
}
class Film {
  /* lesson: {id, scenes:[{name, caps:[{t, tts}]}]}；code: 每个场景的绘制代码；durs: 旁白时长（秒） */
  constructor(lesson, code, durs, extra = {}) {
    this.lesson = lesson; this.scenes = []; this.cues = []; let T = 0;
    const add = (sc) => { sc.start = T; T += sc.dur; this.scenes.push(sc); };
    if (extra.intro) add({ name: '片头', intro: true, dur: extra.intro.dur || 5, code: extra.intro, cues: [], mood: 'main' });
    lesson.scenes.forEach((s, i) => {
      const c = code[i] || {}; const lead = c.lead ?? .7, gap = c.gap ?? .45, tail = c.tail ?? 1.3;
      let t = lead; const cues = s.caps.map((cp, k) => {
        const id = `${lesson.id}_${i}_${k}`, d = durs[id] ?? Math.max(1.5, cp.t.replace(/[{}]/g, '').length * .24);
        const cue = { id, k, si: i, start: t, dur: d, text: cp.t, tts: cp.tts || cp.t.replace(/[{}]/g, '') }; t += d + gap; return cue;
      });
      const dur = Math.max(c.minDur || 0, t - gap + tail);
      add({ name: s.name, i, dur, code: c, cues, mood: c.mood || 'main' });
    });
    if (extra.outro) add({ name: '片尾', outro: true, dur: extra.outro.dur || 7, code: extra.outro, cues: [], mood: 'main' });
    this.total = T;
    this.scenes.forEach((sc, n) => { sc.n = n; sc.cues.forEach(c => { c.g = sc.start + c.start; c.n = n; this.cues.push(c); }); });
  }
  sceneAt(g) { const s = this.scenes; for (let i = s.length - 1; i >= 0; i--) if (g >= s[i].start) return i; return 0; }
  cueAt(g) { let r = -1; for (let i = 0; i < this.cues.length; i++) if (g >= this.cues[i].g - .05) r = i; return r; }
  /* 场景运行时信息：cue(k) 起点，end(k) 终点，kw(k, 词) 估计该词被念到的时刻 */
  F(sc) {
    if (sc._F) return sc._F;
    const cues = sc.cues;
    const F = {
      dur: sc.dur, n: cues.length,
      cue: k => cues[k] ? cues[k].start : sc.dur, end: k => cues[k] ? cues[k].start + cues[k].dur : sc.dur,
      kw: (k, word, frac = 0) => {
        const c = cues[k]; if (!c) return sc.dur; const src = c.tts; let idx = src.indexOf(word);
        if (idx < 0) { const plain = c.text.replace(/[{}]/g, ''); const j = plain.indexOf(word); idx = j < 0 ? 0 : Math.round(j / plain.length * src.length); }
        const W = spokenWeights(src), tot = W.reduce((a, b) => a + b[1], 0); let acc = 0; for (let i = 0; i < idx; i++) acc += W[i][1];
        let wl = 0; for (let i = idx; i < Math.min(W.length, idx + word.length); i++) wl += W[i][1];
        return c.start + .12 + (c.dur - .3) * ((acc + wl * frac) / tot);
      },
      /* 字幕第 j 个字大约什么时候被念到：先在配音稿里找它后面那几个汉字，找不到再按比例估 */
      at: (k, j) => {
        const c = cues[k]; if (!c) return sc.dur; const src = c.tts, plain = c.text.replace(/[{}]/g, ''); let idx = Math.round(j / Math.max(1, plain.length) * src.length);
        const m = /[\u4e00-\u9fff]{2,4}/.exec(plain.slice(j));
        if (m) { let at = -1, best = -1, bd = 1e9; while ((at = src.indexOf(m[0], at + 1)) >= 0) { const d = Math.abs(at - m.index - idx); if (d < bd) { bd = d; best = at; } } if (best >= 0) idx = Math.max(0, best - m.index); }
        const W = spokenWeights(src), tot = W.reduce((a, b) => a + b[1], 0); let acc = 0; for (let i = 0; i < Math.min(idx, W.length); i++) acc += W[i][1];
        return c.start + .12 + (c.dur - .3) * (acc / tot);
      },
    };
    return (sc._F = F);
  }
  draw(stage, g) {
    const i = this.sceneAt(g), sc = this.scenes[i], lt = g - sc.start, nx = this.scenes[i + 1];
    const tdur = nx ? (nx.code.tdur ?? .8) : 0;
    const A = this.layer(stage, sc, lt);
    if (nx && lt > sc.dur - tdur) { const p = (lt - (sc.dur - tdur)) / tdur; const B = this.layer(stage, nx, lt - sc.dur); stage.frame(A, B, p, nx.code.tin || { type: 'fade' }); }
    else stage.frame(A);
    return { i, lt };
  }
  layer(stage, sc, t) {
    const F = this.F(sc), c = sc.code, self = this;
    return {
      t, cam: c.camera ? c.camera(t, stage.S, F) : { z: 1 + .03 * E.ioS(clamp(t / sc.dur)) },
      draw(S) {
        if (c.draw) c.draw(t, S, F);
        if (!sc.intro && !sc.outro && c.hud !== false) {
          H.head(S, t, c.tag || `LESSON_${String(self.lesson.id).padStart(2, '0')} // ${sc.i === 0 ? 'PROLOGUE' : (sc.name.startsWith('尾声') ? 'EPILOGUE' : 'ACT ' + String(sc.i).padStart(2, '0'))}`, sc.name.replace(/^第.{1,3}幕 · |^尾声 · |^序 · /, ''), {});
          if (c.year) H.year(S, t, c.year, c.yearO || {});
        }
      },
    };
  }
}
