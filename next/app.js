'use strict';
/* AI 八堂课 · 应用逻辑（课程地图、播放器、测验、闯关、资料库、设置、更新） */
const $ = id => document.getElementById(id);
const fmtT = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const dstr = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const YT = 'https://www.youtube.com/watch?v=KjKlBvX9G7w&t=';
const LCODE = { 1: L1 };

/* ---------- 学习进度（兼容旧版 ai8） ---------- */
const Store = {
  key: 'ai8v2', d: null,
  load() {
    let d = null; try { d = JSON.parse(localStorage.getItem(this.key) || 'null'); } catch (e) { }
    if (!d) {
      d = { v: 2, lessons: {}, xp: 0, streak: { last: '', n: 0 }, set: {} };
      try {
        const old = JSON.parse(localStorage.getItem('ai8') || '{}') || {};
        for (const k in old) { const i = +k + 1; if (!(i >= 1 && i <= 8)) continue; const o = old[k] || {}, L = d.lessons[i] = {}; if (o.f) { L.film = 1; d.xp += 60; } if (o.g) { L.game = 1; L.stars = 2; d.xp += 70; } }
        if (localStorage.getItem('ai8n') === '0') d.set.voice = 0;
      } catch (e) { }
    }
    d.set = Object.assign({ music: 1, sfx: 1, subs: 1, voice: 1, speed: 1 }, d.set || {}); d.lessons = d.lessons || {}; d.streak = d.streak || { last: '', n: 0 };
    this.d = d; this.save(); return d;
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { } },
  L(i) { return this.d.lessons[i] || (this.d.lessons[i] = {}); },
  touch() { const t = dstr(new Date()), s = this.d.streak; if (s.last === t) return; s.n = s.last === dstr(new Date(Date.now() - 864e5)) ? s.n + 1 : 1; s.last = t; this.save(); },
  xp(n) { this.d.xp += n; this.touch(); this.save(); },
  streak() { const s = this.d.streak, t = dstr(new Date()), y = dstr(new Date(Date.now() - 864e5)); return s.last === t || s.last === y ? s.n : 0; },
  stars() { let n = 0; for (const k in this.d.lessons) n += this.d.lessons[k].stars || 0; return n; },
  done(i) { const L = this.d.lessons[i] || {}; return !!(L.film && L.game); },
};

/* ---------- 声音：旁白（保留音调变速）、配乐（交叉淡入的循环 + 自动压低）、音效 ---------- */
const AudioCtl = {
  ctx: null, buf: {}, moods: {}, mood: 'main', on: false, duck: 0,
  unlock() {
    // 必须在点击的同一时刻同步执行（iOS 的要求）
    const vo = $('vo'); if (!this._u) { this._u = 1; try { vo.src = SILENT; const p = vo.play(); if (p) p.then(() => vo.pause()).catch(() => { }); } catch (e) { } }
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { this.ctx = new AC(); this.mGain = this.ctx.createGain(); this.mGain.gain.value = 0; this.mGain.connect(this.ctx.destination); this.sGain = this.ctx.createGain(); this.sGain.gain.value = .85; this.sGain.connect(this.ctx.destination); this.preload(); }
    }
    if (this.ctx) { try { const b = this.ctx.createBuffer(1, 1, 22050), s = this.ctx.createBufferSource(); s.buffer = b; s.connect(this.ctx.destination); s.start(0); } catch (e) { } if (this.ctx.state !== 'running') this.ctx.resume().catch(() => { }); }
  },
  preload() { ['main', 'cold'].forEach(n => this.get('bgm/' + n + '.mp3')); ['whoosh', 'rise', 'impact', 'tick', 'blip', 'correct', 'wrong', 'star', 'levelup', 'ding'].forEach(n => this.get('sfx/' + n + '.mp3')); },
  get(u) {
    if (this.buf[u]) return this.buf[u];
    return (this.buf[u] = fetch(u).then(r => r.arrayBuffer()).then(a => new Promise((res, rej) => this.ctx.decodeAudioData(a, res, rej))).catch(() => null));
  },
  async sfx(n, vol = 1) {
    if (!Store.d.set.sfx || !this.ctx) return; const b = await this.get('sfx/' + n + '.mp3'); if (!b) return;
    const s = this.ctx.createBufferSource(); s.buffer = b; const g = this.ctx.createGain(); g.gain.value = vol; s.connect(g); g.connect(this.sGain); s.start();
  },
  node(m) { if (!this.moods[m]) { const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.mGain); this.moods[m] = { g, cur: null, endAt: 0 }; } return this.moods[m]; },
  async loop(m) {
    if (!this.ctx) return; const M = this.node(m), b = await this.get('bgm/' + m + '.mp3'); if (!b) return;
    const now = this.ctx.currentTime;
    if (M.cur && now < M.endAt - 4) return;
    const s = this.ctx.createBufferSource(), g = this.ctx.createGain(); s.buffer = b; s.connect(g); g.connect(M.g);
    const fade = M.cur ? 3 : .05; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(1, now + fade);
    if (M.cur) { const o = M.cur; try { o.g.gain.cancelScheduledValues(now); o.g.gain.setValueAtTime(o.g.gain.value, now); o.g.gain.linearRampToValueAtTime(0, now + fade); o.s.stop(now + fade + .2); } catch (e) { } }
    s.start(now); M.cur = { s, g }; M.endAt = now + b.duration;
  },
  setMood(m) {
    if (!this.ctx) { this.mood = m; return; } this.mood = m; const now = this.ctx.currentTime;
    for (const k in this.moods) this.moods[k].g.gain.setTargetAtTime(k === m ? 1 : 0, now, .8);
    this.node(m).g.gain.setTargetAtTime(1, now, .8); this.loop(m);
  },
  level() {
    if (!this.ctx) return; const v = !Store.d.set.music || !this.on ? 0 : (this.duck ? .14 : .3);
    this.mGain.gain.setTargetAtTime(v, this.ctx.currentTime, this.duck ? .12 : .5);
  },
  tick() { if (this.ctx && this.on) this.loop(this.mood); },
};

/* ---------- 播放器 ---------- */
const Player = {
  st: null, film: null, id: 0, g: 0, pg: 0, playing: false, last: 0, cueI: -1, hold: 0, quiz: null, raf: 0, ended: false, dq: 1, perf: { n: 0, s: 0 }, kws: [], subOn: false, curScene: -1, warm: {},
  init() {
    this.st = new Stage($('film')); const st = $('stage');
    window.addEventListener('resize', () => this.resize());
    $('bBig').onclick = () => this.start(this.resumeAt || 0);
    $('bPlay').onclick = e => { e.stopPropagation(); this.toggle(); };
    $('bRe').onclick = e => { e.stopPropagation(); this.replay(); };
    $('bSpd').onclick = e => { e.stopPropagation(); const L = [1, 1.25, 1.5, .75], s = Store.d.set; s.speed = L[(L.indexOf(s.speed) + 1) % L.length]; Store.save(); this.applySpeed(); AudioCtl.sfx('blip', .6); };
    $('bCC').onclick = e => { e.stopPropagation(); Store.d.set.subs = Store.d.set.subs ? 0 : 1; Store.save(); this.applySubs(); AudioCtl.sfx('blip', .6); };
    if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) $('bFS').hidden = true;
    $('bFS').onclick = e => { e.stopPropagation(); const fs = document.fullscreenElement || document.webkitFullscreenElement; if (fs) (document.exitFullscreen || document.webkitExitFullscreen).call(document); else (st.requestFullscreen || st.webkitRequestFullscreen).call(st); };
    $('bBack').onclick = e => { e.stopPropagation(); this.pause(); location.hash = '#/'; };
    $('bSet').onclick = e => { e.stopPropagation(); Settings.open(); };
    st.addEventListener('pointerdown', e => { this.lastPtr = e.pointerType; });
    st.addEventListener('click', e => {
      if (e.target.closest('.bar,.poster,.ov')) return;
      if (st.classList.contains('idle') || (this.lastPtr === 'touch' && this.playing && !this.ctrlShown)) { this.wake(); return; }
      this.toggle();
    });
    st.addEventListener('pointermove', () => this.wake());
    // 进度条
    const pr = $('prog'); let drag = false;
    const at = e => { const r = pr.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width) * this.film.total; };
    pr.addEventListener('pointerdown', e => { e.stopPropagation(); drag = true; pr.classList.add('drag'); pr.setPointerCapture(e.pointerId); this.seek(at(e)); this.tip(at(e)); });
    pr.addEventListener('pointermove', e => { if (!this.film) return; this.tip(at(e)); if (drag) this.seek(at(e)); });
    pr.addEventListener('pointerup', e => { drag = false; pr.classList.remove('drag'); });
    pr.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('keydown', e => {
      if (Router.cur !== 'lesson' || !this.film || e.metaKey || e.ctrlKey || e.altKey) return; if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); if (!$('poster').hidden) this.start(this.resumeAt || 0); else this.toggle(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); e.shiftKey ? this.jumpScene(-1) : this.jumpCue(-1); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); e.shiftKey ? this.jumpScene(1) : this.jumpCue(1); }
      else if (e.key === 'f' || e.key === 'F') $('bFS').click();
      else if (e.key === 'c' || e.key === 'C') $('bCC').click();
      else if (e.key === 'm' || e.key === 'M') { Store.d.set.music = Store.d.set.music ? 0 : 1; Store.save(); AudioCtl.level(); }
      this.wake();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.playing) this.pause(); });
    const vo = $('vo'); vo.addEventListener('playing', () => { AudioCtl.duck = 1; AudioCtl.level(); }); ['pause', 'ended'].forEach(ev => vo.addEventListener(ev, () => { AudioCtl.duck = 0; AudioCtl.level(); }));
  },
  async open(id) {
    this.id = id; const LD = LDATA[id], C = LCODE[id]; this.film = new Film(LD, C.code, DURS, { intro: C.intro, outro: C.outro });
    const qo = this.film.scenes[0] && this.film.scenes[0].intro ? 1 : 0; this.quizzes = (MIDQ[id] || []).map(q => { const sc = this.film.scenes[q.after + qo], nx = this.film.scenes[q.after + qo + 1]; return Object.assign({}, q, { at: sc.start + sc.dur - (nx ? (nx.code.tdur ?? .8) : 0) - .05 }); });
    this.g = 0; this.pg = 0; this.cueI = -1; this.ended = false; this.playing = false; this.curScene = -1; this.quiz = null; this.warm = {};
    const L = Store.L(id); this.filmSig = Math.round(this.film.total); this.resumeAt = L.pos && L.posV === this.filmSig && L.pos > 8 && L.pos < this.film.total - 8 ? L.pos : 0;
    $('lTag').textContent = `LESSON ${String(id).padStart(2, '0')} · ${META[id - 1].topic}`; $('lTitle').textContent = META[id - 1].title;
    $('pTag').textContent = `LESSON ${String(id).padStart(2, '0')} · ${META[id - 1].topic}`;
    const lenTxt = `约 ${Math.round(this.film.total / 60 * 10) / 10} 分钟 · ${LD.scenes.length} 幕 · 中途有 ${this.quizzes.length} 道小题`; $('pLen').textContent = lenTxt;
    this.posterG = C.posterAt ? C.posterAt(this.film) : 3.9; this.imgReady = !(C.imgs && C.imgs.length); this.pendingStart = undefined;
    const sp = new URLSearchParams(location.search); if (sp.has('shot')) { this.posterG = clamp(+sp.get('shot') || 0, 0, this.film.total - .01); this.resumeAt = 0; } document.documentElement.classList.toggle('clean', sp.has('clean'));  /* 自检用：?shot=秒 让封面停在这一帧，&clean 隐藏界面 */
    if (!this.imgReady) { $('stage').classList.add('loading'); IMG.load(C.imgs, p => { if (this.id === id && !this.imgReady) $('pLen').textContent = '正在载入画面 ' + Math.round(p * 100) + '%'; }).then(() => { if (this.id !== id) return; this.imgReady = true; $('stage').classList.remove('loading'); $('pLen').textContent = lenTxt; this.render(); if (this.pendingStart !== undefined) { const at = this.pendingStart; this.pendingStart = undefined; this.start(at); } }); }
    const row = $('pRow'); row.innerHTML = '';
    if (this.resumeAt) { const b1 = document.createElement('button'); b1.className = 'btn pri sm'; b1.textContent = '从 ' + fmtT(this.resumeAt) + ' 继续'; b1.onclick = () => this.start(this.resumeAt); const b2 = document.createElement('button'); b2.className = 'btn ghost sm'; b2.textContent = '从头开始'; b2.onclick = () => this.start(0); row.append(b1, b2); }
    $('poster').hidden = false; $('quizOv').hidden = true; $('endOv').hidden = true; $('stage').classList.remove('playing', 'idle');
    const ticks = $('pTicks'); ticks.innerHTML = this.film.scenes.slice(1).map(s => `<div class="tick" style="left:${s.start / this.film.total * 100}%"></div>`).join('') + this.quizzes.map(q => `<div class="qm" style="left:${q.at / this.film.total * 100}%"></div>`).join('');
    this.applySpeed(); this.applySubs(); this.setSub(null);
    await loadFonts(); this.resize(); this.g = this.resumeAt || this.posterG; this.render(); this.g = this.resumeAt || 0;
    this.updateUI();
    if (!this.raf) this.raf = requestAnimationFrame(t => this.loop(t));
  },
  close() { this.pause(); if (this.film && this.g > 5 && !this.ended) { Store.L(this.id).pos = this.g; Store.L(this.id).posV = this.filmSig; Store.save(); } },
  resize() {
    if (Router.cur !== 'lesson') return; const el = $('stage'), w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1) * this.dq); this.st.q = this.dq; this.st.resize(w, h, dpr); this.render();
  },
  render() { if (!this.film) return; const t0 = performance.now(); const g = !$('poster').hidden ? (this.resumeAt || this.posterG || 3.9) : this.g; this.film.draw(this.st, Math.min(g, this.film.total - .001)); return performance.now() - t0; },
  start(at) {
    AudioCtl.unlock(); if (!this.imgReady) { this.pendingStart = at || 0; $('pLen').textContent = '画面马上就好…'; return; } $('poster').hidden = true; this.seek(at || 0); this.ended = false; this.play(); this.wake();
  },
  play() {
    if (this.quiz || !this.film) return; if (this.ended || this.g >= this.film.total - .05) { this.g = 0; this.ended = false; $('endOv').hidden = true; }
    this.playing = true; this.cueI = -1; $('stage').classList.add('playing'); $('stage').classList.remove('paused'); this.icon(); AudioCtl.on = true; AudioCtl.setMood(this.sceneMood()); AudioCtl.level(); this.wake();
  },
  pause() { this.playing = false; $('vo').pause(); $('stage').classList.remove('playing', 'idle'); if ($('poster').hidden && !this.ended) $('stage').classList.add('paused'); this.icon(); AudioCtl.on = false; AudioCtl.level(); if (this.film && this.g > 5) { Store.L(this.id).pos = this.g; Store.L(this.id).posV = this.filmSig; Store.save(); } },
  toggle() { if (!$('poster').hidden) { this.start(this.resumeAt || 0); return; } this.playing ? this.pause() : this.play(); },
  icon() { $('icPlay').innerHTML = this.playing ? '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>' : '<path d="M8 5v14l11-7z"/>'; },
  seek(g) { this.g = clamp(g, 0, this.film.total); this.pg = this.g; this.cueI = -1; this.hold = 0; this.warm = {}; $('vo').pause(); this.ended = false; $('endOv').hidden = true; this.render(); this.updateUI(); },
  replay() { const c = this.film.cues, i = Math.max(0, this.film.cueAt(this.g)); const j = this.g - (c[i] ? c[i].g : 0) < .8 && i > 0 ? i - 1 : i; if (c[j]) this.seek(c[j].g - .05); if (!this.playing && $('poster').hidden) this.play(); },
  jumpCue(d) { const c = this.film.cues; let i = this.film.cueAt(this.g); i = clamp(i + d, 0, c.length - 1); this.seek(c[i].g - .05); },
  jumpScene(d) { const s = this.film.scenes; const i = clamp(this.film.sceneAt(this.g) + d, 0, s.length - 1); this.seek(s[i].start + .01); },
  applySpeed() { const s = Store.d.set.speed; $('bSpd').textContent = (s % 1 ? s : s.toFixed(1)) + '×'; const vo = $('vo'); vo.playbackRate = s; vo.defaultPlaybackRate = s; try { vo.preservesPitch = true; vo.webkitPreservesPitch = true; } catch (e) { } },
  applySubs() { $('stage').classList.toggle('nosubs', !Store.d.set.subs); $('bCC').style.opacity = Store.d.set.subs ? 1 : .45; },
  wake() { const st = $('stage'); st.classList.remove('idle'); this.ctrlShown = true; clearTimeout(this.idleT); if (this.playing) this.idleT = setTimeout(() => { if (this.playing) { st.classList.add('idle'); this.ctrlShown = false; } }, 2600); },
  sceneMood() { const sc = this.film.scenes[this.film.sceneAt(this.g)]; return sc ? sc.mood || 'main' : 'main'; },
  tip(g) { const s = this.film.scenes[this.film.sceneAt(g)], tp = $('pTip'); tp.textContent = fmtT(g) + ' · ' + (s ? s.name : ''); tp.style.left = (g / this.film.total * 100) + '%'; },
  setSub(cue) {
    const ln = $('subLn'), box = $('subs'); this.kws = [];
    if (!cue) { box.classList.remove('show'); return; }
    const sc = this.film.scenes[cue.n], F = this.film.F(sc); let html = '', kwI = 0;
    cue.text.split(/(\{[^}]*\})/).forEach(p => { if (/^\{.*\}$/.test(p)) { const w = p.slice(1, -1); html += `<span class="kw" data-k="${kwI}">${esc(w)}</span>`; this.kws.push(sc.start + F.kw(cue.k, w, .2)); kwI++; } else html += esc(p); });
    ln.innerHTML = html; box.classList.add('show');
  },
  loop(ts) {
    this.raf = requestAnimationFrame(t => this.loop(t));
    if (Router.cur !== 'lesson' || !this.film) { this.last = ts; return; }
    const dt = Math.min(.25, (ts - (this.last || ts)) / 1000); this.last = ts;
    const F = this.film, vo = $('vo');
    if (this.playing) {
      const c = F.cues[this.cueI]; let adv = dt * Store.d.set.speed;
      if (vo.currentTime !== this.lastVT) { this.lastVT = vo.currentTime; this.voProg = ts; }
      if (c && Store.d.set.voice && !vo.paused && !vo.ended && this.g >= c.g + c.dur - .02 && vo.currentTime < (vo.duration || 99) - .05 && ts - (this.voProg || 0) < 400) { this.hold += dt; if (this.hold < 2) adv = 0; } else this.hold = 0;
      /* 声画同步：旁白真正在走时，画面时间轻轻追着声音走（只放慢或加快，从不倒退） */
      if (c && Store.d.set.voice && !vo.paused && !vo.ended && !this.hold && ts - (this.voProg || 0) < 300 && this.g >= c.g && this.g < c.g + c.dur - .15) {
        const drift = vo.currentTime + (ts - this.voProg) / 1000 * Store.d.set.speed - (this.g - c.g);   /* currentTime 有的浏览器更新得慢，按上次变化的时刻外推 */
        if (Math.abs(drift) > .05 && Math.abs(drift) < .6) adv = Math.max(0, adv + drift * Math.min(1, dt * 3));   /* 差太多（比如声音没能跳到位）就不追，免得画面停住 */
      }
      this.pg = this.g; this.g += adv;
      for (const q of this.quizzes) if (!q.shown && this.pg < q.at && this.g >= q.at) { this.g = q.at; this.showQuiz(q); break; }
      // 音效
      for (const sc of F.scenes) {
        for (const [tt, nm] of (sc.code.sfx || [])) { const g0 = sc.start + tt; if (this.pg < g0 && this.g >= g0) AudioCtl.sfx(nm, .8); }
        const tr = sc.code.tin, td = sc.code.tdur ?? .8, gw = sc.start - td * .6; if (sc.n > 0 && tr && tr.type !== 'fade' && this.pg < gw && this.g >= gw) AudioCtl.sfx('whoosh', .55);
      }
      if (this.g >= F.total) { this.g = F.total; this.finish(); }
    }
    const si = F.sceneAt(this.g); if (si !== this.curScene) { this.curScene = si; if (this.playing) AudioCtl.setMood(F.scenes[si].mood || 'main'); }
    /* 提前几秒在后台解码下一幕的照片（iPhone 内存紧时会丢掉解码好的图，第一次画会顿一下） */
    const sm = this.playing && typeof SIMG !== 'undefined' && SIMG[this.id];
    if (sm) for (const n of [si, F.sceneAt(this.g + 4)]) if (!this.warm[n]) { this.warm[n] = 1; (sm[n] || []).forEach(id => { const r = IMG.R[id]; if (r) [r.im, r.fg, r.bg].forEach(m => { if (m && m.decode) m.decode().catch(() => { }); }); }); }
    // 旁白与字幕
    const ci = F.cueAt(this.g), cue = F.cues[ci];
    if (ci !== this.cueI) {
      this.cueI = ci; vo.pause();
      if (cue && this.g < cue.g + cue.dur + .3) {
        this.setSub(cue);
        if (this.playing && Store.d.set.voice && this.g - cue.g < cue.dur - .25) { const off = this.g - cue.g; vo.src = 'vo/' + cue.id + '.mp3'; vo.playbackRate = Store.d.set.speed; try { vo.preservesPitch = true; } catch (e) { } const go = () => { try { if (off > .25) vo.currentTime = off; } catch (e) { } const p = vo.play(); if (p) p.catch(() => { }); }; if (vo.readyState >= 1) go(); else vo.addEventListener('loadedmetadata', go, { once: true }); }
      } else this.setSub(null);
    }
    if (cue) { const end = cue.g + cue.dur + .5; if (this.g > end && $('subs').classList.contains('show') && !(Store.d.set.voice && !vo.paused)) $('subs').classList.remove('show'); }
    const spans = $('subLn').querySelectorAll('.kw'); spans.forEach((sp, i) => sp.classList.toggle('on', this.g >= (this.kws[i] || 1e9)));
    AudioCtl.tick();
    const ms = this.render();
    if (this.playing && ms !== undefined) { const p = this.perf; p.n++; p.s += ms; if (p.n >= 90) { const avg = p.s / p.n; p.n = 0; p.s = 0; if (avg > 22 && this.dq > .55) { this.dq = Math.max(.55, this.dq - .15); this.resize(); } else if (avg < 8 && this.dq < 1) { this.dq = Math.min(1, this.dq + .1); this.resize(); } } }
    this.updateUI();
    if (this.playing && Math.floor(this.g) % 5 === 0 && Math.floor(this.pg) % 5 !== 0) { Store.L(this.id).pos = this.g; Store.L(this.id).posV = this.filmSig; Store.save(); }
  },
  updateUI() {
    const F = this.film; if (!F) return; const p = this.g / F.total * 100;
    $('pFill').style.width = p + '%'; $('pKnob').style.left = p + '%'; $('tTime').textContent = fmtT(this.g) + ' / ' + fmtT(F.total);
  },
  showQuiz(q) {
    this.pause(); q.shown = true; this.quiz = q; AudioCtl.sfx('ding', .7); const card = $('qCard');
    card.innerHTML = `<span class="hud">QUICK CHECK // 小测验</span><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${'ABC'[i]}</span><span>${esc(o)}</span></button>`).join('')}</div><div id="qFb"></div>`;
    $('quizOv').hidden = false;
    card.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const i = +b.dataset.i, ok = i === q.a; card.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.i === q.a) x.classList.add('ok'); }); if (!ok) b.classList.add('no');
      AudioCtl.sfx(ok ? 'correct' : 'wrong', .8); const L = Store.L(this.id); L.mid = L.mid || {}; const first = L.mid[q.key] === undefined; L.mid[q.key] = ok ? 1 : 0; if (first) Store.xp(ok ? 20 : 5); else Store.save();
      $('qFb').innerHTML = `<p class="fb"><b class="${ok ? '' : 'no'}">${ok ? '答对了！' : '差一点。'}</b>${esc(q.ex)} ${first ? `<span class="xp">+${ok ? 20 : 5} XP</span>` : ''}</p><div class="row"><button class="btn pri sm" id="qGo">继续看 →</button></div>`;
      $('qGo').onclick = () => { $('quizOv').hidden = true; this.quiz = null; this.g = q.at + .02; this.play(); };
    });
  },
  finish() {
    if (this.ended) return; this.ended = true; this.playing = false; $('vo').pause(); this.icon(); $('stage').classList.remove('playing', 'idle', 'paused'); AudioCtl.on = false; AudioCtl.level();
    const L = Store.L(this.id), first = !L.film; L.film = 1; L.pos = 0; if (first) Store.xp(60); else Store.save();
    AudioCtl.sfx('levelup', .7);
    $('endCard').innerHTML = `<span class="hud">LESSON ${String(this.id).padStart(2, '0')} COMPLETE</span><h3>这一课看完了！</h3><p>${first ? '<span class="xp">+60 XP</span> · ' : ''}接下来做做思考题，再去闯关，把知识变成你自己的。</p><div class="row"><button class="btn pri" id="eDown">去答题和闯关 ↓</button><button class="btn ghost" id="eRe">重看一遍</button></div>`;
    $('endOv').hidden = false;
    $('eDown').onclick = () => { $('endOv').hidden = true; document.querySelector('.lbody').scrollIntoView({ behavior: 'smooth' }); };
    $('eRe').onclick = () => { $('endOv').hidden = true; this.quizzes.forEach(q => q.shown = false); this.start(0); };
  },
};

/* ---------- 课程页正文 ---------- */
const LessonPage = {
  render(id) {
    const m = META[id - 1], C = LCODE[id];
    $('points').innerHTML = (C ? C.points : []).map(([y, s]) => `<div class="pt glass"><span class="y">${esc(y)}</span><span>${esc(s)}</span></div>`).join('');
    $('qa').innerHTML = (QUIZ[id] || []).map(([q, a], i) => `<div class="qi glass"><div class="q">${i + 1}. ${esc(q)}</div><button class="btn sm ghost" data-i="${i}">看参考答案</button><div class="a" hidden>${esc(a)}</div></div>`).join('');
    $('qa').querySelectorAll('button').forEach(b => b.onclick = () => { const a = b.nextElementSibling; a.hidden = !a.hidden; b.textContent = a.hidden ? '看参考答案' : '收起'; if (!a.hidden) { AudioCtl.sfx('blip', .5); const L = Store.L(id); L.qa = L.qa || {}; if (!L.qa[b.dataset.i]) { L.qa[b.dataset.i] = 1; Store.xp(5); } } });
    $('gName').textContent = GNAME[id] || '闯关';
    if (GAMES[id]) GAMES[id]($('game'), stars => {
      const L = Store.L(id), prev = L.stars || 0, firstWin = !L.game; L.game = 1; L.stars = Math.max(prev, stars); const gain = (firstWin ? 50 : 0) + Math.max(0, stars - prev) * 10; Store.xp(gain); return { gain, best: L.stars };
    });
    $('res').innerHTML = resHTML(RES[id - 1]) + creditsHTML(C);
    $('bPrev').hidden = id === 1; $('bNext').hidden = id === 8;
    $('bPrev').onclick = () => go(id - 1); $('bNext').onclick = () => go(id + 1);
  },
};
function creditsHTML(C) {
  if (!C || !C.imgs || typeof IMGS === 'undefined') return '';
  const rows = C.imgs.filter(k => IMGS[k] && IMGS[k].page).map(k => { const m = IMGS[k]; return `<li><a href="${esc(m.page)}" target="_blank" rel="noopener"><b>${esc(m.cn || m.title)}</b><small>${esc([m.by, m.lic].filter(Boolean).join(' · '))}</small></a></li>`; }).join('');
  return `<details class="cred glass"><summary>画面里的真实照片与资料 · 来源和授权（${C.imgs.filter(k => IMGS[k] && IMGS[k].page).length} 项）</summary><p>照片来自维基共享资源、美国政府档案等，均为公有领域或允许使用的授权（CC0 / CC BY / CC BY-SA）；画面中经过调色、裁切和抠像。报纸、论文首页、书本和网页是按真实标题与原文措辞做的「复原示意」，不是原件；示例图片不是 ImageNet 原图。</p><ul>${rows}</ul></details>`;
}
function resHTML(list) {
  return list.map(([t, u, k, m, d]) => { const url = u.startsWith('@') ? YT + u.slice(1) + 's' : u; return `<a class="ri glass" href="${esc(url)}" target="_blank" rel="noopener"><span class="ty t-${esc(k)}">${esc(k)}</span><span class="bd"><b>${esc(t)}</b>${(m || d) ? `<small>${esc([m, d].filter(Boolean).join(' · '))}</small>` : ''}</span><span class="go">↗</span></a>`; }).join('');
}
function go(id) {
  if (!META[id - 1]) return;
  if (!LCODE[id]) { toast(`第 ${id} 课正在升级成新版，先在正式版里学`, '去正式版', () => { location.href = '../#l' + id; }); return; }
  location.hash = '#/l/' + id;
}

/* ---------- 第 1 课闯关：训练你的第一个神经元 ---------- */
const GAMES = {
  1(el, onWin) {
    const LV = [
      { n: '第 1 关 · 爱玩的人', g: '目标：天晴或者有人约，有一样就出门', t: [0, 1, 1, 1], s: '我是罗森布拉特。先教我的感知机做个爱玩的人：只要有一样好事就出门。拖动滑块，让四张卡片全部变绿。' },
      { n: '第 2 关 · 挑剔的人', g: '目标：天晴并且有人约，两样都要才出门', t: [0, 0, 0, 1], s: '漂亮！报纸都说我的机器将来会思考呢。这关要个挑剔的人：两样都满足才肯出门。' },
      { n: '第 3 关 · 别扭的人', g: '目标：只占一样才出门，两样都有反而宅家', t: [0, 1, 1, 0], s: '最后一关，一个别扭的人：天晴和有人约只能占一样，两样都有反而不想去。这个应该也不难……吧？' }];
    const CB = [[0, 0], [0, 1], [1, 0], [1, 1]]; let lv = 0, mv = 0, tot = 0, last = '', won = false;
    el.innerHTML = `<div class="gtop"><span class="gpill" id="g1lv"></span><span class="gdots" id="g1dots"><i></i><i></i><i></i></span></div>
      <div class="say"><span class="ava">罗</span><p id="g1say"></p></div>
      <div id="g1ctrl"><div class="sl"><span class="lb">天晴</span><input type="range" min="-5" max="5" step="1" value="1" id="g1w1" aria-label="天晴的权重"><span class="val" id="g1v1">1</span></div>
      <div class="sl"><span class="lb">有人约</span><input type="range" min="-5" max="5" step="1" value="1" id="g1w2" aria-label="有人约的权重"><span class="val" id="g1v2">1</span></div>
      <div class="sl"><span class="lb">门槛</span><input type="range" min="-5" max="8" step="1" value="5" id="g1th" aria-label="门槛"><span class="val" id="g1vt">5</span></div></div>
      <p class="goal" id="g1goal"></p><div class="c4" id="g1cards"></div><div class="gbtns" id="g1btns"></div>`;
    const q = id => el.querySelector('#' + id), v = id => +q(id).value;
    function dots() { q('g1dots').querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i < lv || won)); }
    function render(two) {
      const t = two ? [0, 1, 1, 0] : LV[lv].t; let all = true, h = '';
      CB.forEach(([a, b], i) => { const d = two ? (a ^ b) : (a * v('g1w1') + b * v('g1w2') >= v('g1th') ? 1 : 0), ok = d === t[i]; if (!ok) all = false; h += `<div class="cell ${ok ? 'ok' : ''}">${a ? '晴天' : '下雨'} · ${b ? '有人约' : '没人约'}<b>${d ? '出门' : '宅家'} ${ok ? '✓' : '✕'}</b>目标：${t[i] ? '出门' : '宅家'}</div>`; });
      q('g1cards').innerHTML = h; q('g1v1').textContent = v('g1w1'); q('g1v2').textContent = v('g1w2'); q('g1vt').textContent = v('g1th'); if (two) return;
      const b = q('g1btns'); b.innerHTML = '';
      if (all && lv < 2) { AudioCtl.sfx('correct', .7); const n = document.createElement('button'); n.className = 'btn pri'; n.textContent = '过关，下一关 →'; n.onclick = () => { lv++; setLv(); dots(); }; b.appendChild(n); q('g1say').textContent = lv === 0 ? '成功了！你刚刚训练出了一个会做判断的机器。' : '太棒了，你已经掌握了我毕生的发明。'; }
      else if (lv < 2) q('g1say').textContent = LV[lv].s;
      if (lv === 2 && mv >= 4) { const g = document.createElement('button'); g.className = 'btn'; g.textContent = '怎么调都不行？'; g.onclick = reveal; b.appendChild(g); }
    }
    function setLv() { q('g1lv').textContent = LV[lv].n; q('g1goal').textContent = LV[lv].g; q('g1say').textContent = LV[lv].s; mv = 0; render(); }
    function reveal() {
      q('g1ctrl').hidden = true; q('g1lv').textContent = '真相'; q('g1say').innerHTML = '没错，<b>不可能</b>。1969 年，明斯基用数学证明了：单个神经元只能画一条直线把世界一分为二，而这个别扭的人需要两条线。经费撤走，AI 进入寒冬。'; q('g1goal').textContent = '';
      const b = q('g1btns'); b.innerHTML = ''; const n = document.createElement('button'); n.className = 'btn pri'; n.textContent = '后来呢？';
      n.onclick = () => {
        won = true; dots(); q('g1lv').textContent = '通关'; q('g1say').innerHTML = '后来，辛顿那代人想到：<b>多加一层神经元</b>。一个负责“至少有一样”，一个负责“两样都有”，最后一个把它们组合起来。单个做不到的事，三个连起来就做到了。今天的大模型，就是几千亿个这样连起来的参数。'; render(true);
        const stars = tot <= 14 ? 3 : tot <= 30 ? 2 : 1, r = onWin(stars);
        b.innerHTML = `<div class="win" style="width:100%"><div class="big">${'★'.repeat(stars)}<i>${'★'.repeat(3 - stars)}</i></div><p>一共调了 ${tot} 次滑块${stars < 3 ? '，少于 15 次可以拿满三星' : '，满分！'}${r.gain ? ` · <span class="xp">+${r.gain} XP</span>` : ''}</p><button class="btn ghost sm" id="g1again">再玩一次</button></div>`;
        q('g1again').onclick = () => GAMES[1](el, onWin);
        AudioCtl.sfx('levelup', .7); for (let i = 0; i < stars; i++) setTimeout(() => AudioCtl.sfx('star', .55), 500 + i * 260);
      };
      b.appendChild(n);
    }
    ['g1w1', 'g1w2', 'g1th'].forEach(k => q(k).addEventListener('input', () => { const s = v('g1w1') + ',' + v('g1w2') + ',' + v('g1th'); if (s !== last) { mv++; tot++; last = s; AudioCtl.sfx('tick', .35); } render(); }));
    setLv(); dots();
  },
};

/* ---------- 首页 · 课程地图 ---------- */
const Home = {
  st: null, raf: 0, last: 0,
  render() {
    const d = Store.d; let done = 0; for (let i = 1; i <= 8; i++) if (Store.done(i)) done++;
    $('stats').innerHTML = [[done + '/8', '已完成'], [Store.stars(), '星星'], [d.xp, '经验值'], [Store.streak(), '连续天数']].map(([b, s]) => `<div class="stat glass"><b>${b}</b><span>${s}</span></div>`).join('');
    let nx = 1; for (let i = 1; i <= 8; i++) if (!Store.done(i)) { nx = i; break; } this.nx = nx;
    const L1s = Store.L(1), contId = LCODE[nx] ? nx : 1;
    $('cont').textContent = (Store.L(contId).film || Store.L(contId).pos ? '继续学习：' : '开始学习：') + `第 ${contId} 课 · ${META[contId - 1].title}`;
    $('cont').onclick = () => { AudioCtl.unlock(); go(contId); };
    $('map').innerHTML = META.map((m, k) => {
      const i = k + 1, L = d.lessons[i] || {}, st = Store.done(i) ? 'done' : (i === contId ? 'now' : (L.film || L.game ? 'part' : 'todo')), ready = !!LCODE[i];
      const chips = ready ? `<span class="chip ${L.film ? 'on' : ''}">${L.film ? '✓ ' : ''}动画</span><span class="chip ${L.game ? 'on' : ''}">${L.game ? '✓ ' : ''}闯关</span>` : `<span class="chip hot">新版制作中</span>`;
      const stars = `<span class="stars">${'★'.repeat(L.stars || 0)}<i>${'★'.repeat(3 - (L.stars || 0))}</i></span>`;
      return `<button class="node glass ${st === 'part' ? 'todo' : st}" data-i="${i}"><span class="orb">${String(i).padStart(2, '0')}</span><span class="meta"><span class="t1">LESSON ${String(i).padStart(2, '0')} · ${esc(m.topic)}</span><span class="t2">${esc(m.title)}</span><span class="t3">${esc(m.sub)}</span><span class="st">${chips}${stars}</span></span></button>`;
    }).join('');
    $('map').querySelectorAll('.node').forEach(b => b.onclick = () => { AudioCtl.unlock(); AudioCtl.sfx('blip', .5); go(+b.dataset.i); });
    $('verTxt').textContent = ' 版本 ' + VER;
  },
  start() {
    if (!this.st) { this.st = new Stage($('mapbg'), { single: true }); this.st.k = Object.assign({}, K, { grain: 0, vig: .5 }); this.st.applyLook(); window.addEventListener('resize', () => this.size()); }
    this.size(); if (!this.raf) this.raf = requestAnimationFrame(t => this.loop(t));
  },
  size() { this.st.resize(innerWidth, innerHeight, 1); },
  loop(ts) {
    if (Router.cur !== 'home' && Router.cur !== 'lib') { this.raf = 0; return; }
    this.raf = requestAnimationFrame(t => this.loop(t));
    if (ts - this.last < 33) return; this.last = ts; const t = ts / 1000;
    const orbs = [...document.querySelectorAll('#map .orb')].map(o => { const r = o.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    const nx = this.nx || 1, self = this;
    this.st.frame({ t, cam: { z: 1 }, draw(S) {
      H.bg(S, t, {});
      if (Router.cur !== 'home' || orbs.length < 2) return;
      const x = S.mid, gx = S.glow;
      for (let i = 0; i < orbs.length - 1; i++) {
        const [x1, y1] = orbs[i], [x2, y2] = orbs[i + 1], lit = Store.done(i + 1);
        x.save(); x.setLineDash(lit ? [] : [3, 7]); x.strokeStyle = col(lit ? K.c.pri : '#4a5a76', lit ? .8 : .5); x.lineWidth = lit ? 2 : 1.4; x.beginPath(); x.moveTo(x1, y1);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; x.quadraticCurveTo(mx + (y2 - y1) * .15, my - (x2 - x1) * .15, x2, y2); x.stroke(); x.restore();
        if (lit) { gx.strokeStyle = col(K.c.pri, .7); gx.lineWidth = 3; gx.beginPath(); gx.moveTo(x1, y1); gx.quadraticCurveTo(mx + (y2 - y1) * .15, my - (x2 - x1) * .15, x2, y2); gx.stroke(); }
        if (i === nx - 2 || (i === nx - 1 && false)) { }
      }
      // 流动光点：从第一课流向当前课
      const upto = Math.max(1, nx - 1);
      for (let k = 0; k < 3; k++) { const q = ((t * .12 + k / 3) % 1) * upto, i = Math.min(orbs.length - 2, Math.floor(q)), f = q - i; const [x1, y1] = orbs[i], [x2, y2] = orbs[i + 1]; const mx = (x1 + x2) / 2 + (y2 - y1) * .15, my = (y1 + y2) / 2 - (x2 - x1) * .15, u = 1 - f; const px = u * u * x1 + 2 * u * f * mx + f * f * x2, py = u * u * y1 + 2 * u * f * my + f * f * y2; x.fillStyle = col(K.c.priHi, .95); x.beginPath(); x.arc(px, py, 2.4, 0, TAU); x.fill(); gx.fillStyle = col(K.c.pri, .9); gx.beginPath(); gx.arc(px, py, 6, 0, TAU); gx.fill(); }
      const [cx, cy] = orbs[nx - 1] || orbs[0]; H.rings(S, cx, cy, 30, 70, t, { c: K.c.acc, n: 2, speed: .35 });
    } });
  },
};

/* ---------- 资料库 ---------- */
const Lib = {
  f: '全部',
  render() {
    const kinds = ['全部', '视频', '文章', '工具', '其他'];
    $('filt').innerHTML = kinds.map(k => `<button class="${k === this.f ? 'on' : ''}" data-k="${k}">${k}</button>`).join('');
    $('filt').querySelectorAll('button').forEach(b => b.onclick = () => { this.f = b.dataset.k; this.render(); });
    const ok = k => this.f === '全部' || (this.f === '其他' ? !['视频', '文章', '工具'].includes(k) : k === this.f);
    $('libList').innerHTML = META.map((m, i) => { const list = RES[i].filter(r => ok(r[2]) && !r[1].startsWith('@')); return list.length ? `<div class="lg">LESSON ${String(i + 1).padStart(2, '0')} · ${esc(m.topic)}</div><div class="res">${resHTML(list)}</div>` : ''; }).join('');
  },
};

/* ---------- 设置 ---------- */
const Settings = {
  open() {
    const s = Store.d.set, row = (k, t, sub) => `<div class="sw"><div>${t}${sub ? `<small>${sub}</small>` : ''}</div><button class="tg ${s[k] ? 'on' : ''}" data-k="${k}" aria-label="${t}"></button></div>`;
    $('sheetIn').innerHTML = `<h3>设置</h3>${row('voice', '旁白', '你的克隆声音')}${row('music', '背景音乐', '旁白响起时会自动压低')}${row('sfx', '音效', '转场、答题、通关的提示音')}${row('subs', '字幕', '关键词会跟着旁白亮起')}
      <div class="sw"><div>语速</div><div class="seg">${[.75, 1, 1.25, 1.5].map(v => `<button class="${s.speed === v ? 'on' : ''}" data-v="${v}">${v}×</button>`).join('')}</div></div>
      <div class="sw"><div>学习进度<small>经验值 ${Store.d.xp} · 星星 ${Store.stars()}</small></div><button class="btn sm ghost" id="sReset">清除进度</button></div>
      <div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn pri sm" id="sOk">完成</button></div>`;
    $('sheet').hidden = false;
    $('sheetIn').querySelectorAll('.tg').forEach(b => b.onclick = () => { const k = b.dataset.k; s[k] = s[k] ? 0 : 1; Store.save(); b.classList.toggle('on', !!s[k]); AudioCtl.level(); Player.applySubs(); if (k === 'voice' && !s[k]) $('vo').pause(); AudioCtl.sfx('blip', .5); });
    $('sheetIn').querySelectorAll('.seg button').forEach(b => b.onclick = () => { s.speed = +b.dataset.v; Store.save(); Player.applySpeed(); $('sheetIn').querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); });
    let armed = false; $('sReset').onclick = () => { if (!armed) { armed = true; $('sReset').textContent = '再点一次确认'; return; } localStorage.removeItem(Store.key); localStorage.removeItem('ai8'); Store.load(); this.close(); Home.render(); toast('进度已清除'); };
    $('sOk').onclick = () => this.close(); $('sheet').onclick = e => { if (e.target === $('sheet')) this.close(); };
  },
  close() { $('sheet').hidden = true; },
};

/* sticky：一直显示到用户点它（换页也不收起），用于“有新版本了” */
function toast(msg, act, fn, sticky) {
  const t = $('toast'); t.innerHTML = `<span>${esc(msg)}</span>${act ? `<button class="btn pri sm" id="tAct">${esc(act)}</button>` : ''}`; t.hidden = false; t.dataset.sticky = sticky ? '1' : '';
  if (act) $('tAct').onclick = () => { t.hidden = true; t.dataset.sticky = ''; fn && fn(); };
  clearTimeout(toast.h); if (!sticky) toast.h = setTimeout(() => { t.hidden = true; }, act ? 12000 : 3000);
}

/* ---------- 路由 ---------- */
const Router = {
  cur: '',
  async route() {
    const h = location.hash || '#/'; const m = h.match(/^#\/l\/(\d+)/), prev = this.cur;
    if (prev === 'lesson') Player.close();
    ['home', 'lesson', 'lib'].forEach(s => $(s).hidden = true); $('mapbg').hidden = false; if (!$('toast').dataset.sticky) $('toast').hidden = true;
    if (m && LCODE[+m[1]]) { this.cur = 'lesson'; $('lesson').hidden = false; $('mapbg').hidden = true; window.scrollTo(0, 0); LessonPage.render(+m[1]); await Player.open(+m[1]); }
    else if (h.startsWith('#/lib')) { this.cur = 'lib'; $('lib').hidden = false; window.scrollTo(0, 0); Lib.render(); Home.start(); }
    else { this.cur = 'home'; $('home').hidden = false; Home.render(); Home.start(); if (prev) window.scrollTo(0, 0); }
  },
};

/* ---------- 启动 ---------- */
(async () => {
  Store.load(); Player.init();
  $('tLib').onclick = () => { location.hash = '#/lib'; }; $('libBack').onclick = () => { location.hash = '#/'; }; $('tSet').onclick = () => Settings.open();
  window.addEventListener('hashchange', () => Router.route());
  await loadFonts(); Router.route();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const ask = w => toast('有新版本了', '点此更新', () => { window.__wantReload = true; w.postMessage('skip'); }, true);
      if (reg.waiting && navigator.serviceWorker.controller) ask(reg.waiting);
      reg.addEventListener('updatefound', () => { const w = reg.installing; w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) ask(w); }); });
      setInterval(() => reg.update().catch(() => { }), 30 * 60 * 1000);
    }).catch(() => { });
    let reloaded = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded || !window.__wantReload) return; reloaded = true; location.reload(); });
  }
})();
