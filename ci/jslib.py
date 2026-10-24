"""Shared page-side snippets for the WebKit / Safari checks of the AI 八堂课 preview.
Each constant is a JS *expression*; Selenium callers prefix it with 'return '."""
import io, os
from PIL import Image, ImageDraw

HOOK = r"""(() => { if (window.__hooked) return 'already'; window.__hooked = 1;
 window.__errs = window.__errs || [];
 addEventListener('error', e => __errs.push(String(e.message) + ' @' + String(e.filename || '').split('/').pop() + ':' + e.lineno));
 addEventListener('unhandledrejection', e => __errs.push('rej ' + String(e.reason && e.reason.message || e.reason)));
 window.__dt = []; window.__gap = []; window.__av = [];
 const o = Player.render.bind(Player);
 Player.render = function () { const r = o(); if (Player.playing && typeof r === 'number') __dt.push(r); return r; };
 let last = 0; const f = t => { if (last && Player.playing) __gap.push(t - last); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f);
 let lastAv = 0; const fa = t => { requestAnimationFrame(fa); if (t - lastAv < 240) return; const vo = document.getElementById('vo'), F = Player.film, c = F && F.cues[Player.cueI]; if (!c || vo.paused || !Player.playing || Player.g < c.g + .4 || Player.g > c.g + c.dur - .3) return; lastAv = t; __av.push(vo.currentTime - (Player.g - c.g) * Store.d.set.speed); }; requestAnimationFrame(fa);
 window.__ctu = []; let lv = -1, lt = 0; setInterval(() => { const vo = document.getElementById('vo'); if (vo.paused) { lv = -1; return; } const n = performance.now(); if (vo.currentTime !== lv) { if (lv >= 0 && __ctu.length < 400) __ctu.push(n - lt); lv = vo.currentTime; lt = n; } }, 4);
 window.__subL = []; setInterval(() => { const ln = document.getElementById('subLn'), b = document.getElementById('subs'); if (Player.playing && b.classList.contains('show') && ln.textContent) __subL.push(ln.getClientRects().length); }, 500);
 return 'ok'; })()"""

HOOKX = r"""(() => { if (window.__hx) return 'already'; window.__hx = 1; window.__pass = window.__pass || 'land0'; window.__avx = []; window.__evx = [];
 const vo = document.getElementById('vo');
 const tag = () => { const F = Player.film, c = F && F.cues[Player.cueI]; return { t: +(performance.now() / 1000).toFixed(3), p: __pass, g: +Player.g.toFixed(3), ci: Player.cueI, cg: c ? +c.g.toFixed(3) : null, cd: c ? +c.dur.toFixed(2) : null, vt: +vo.currentTime.toFixed(3), rs: vo.readyState, pa: vo.paused, pl: Player.playing, src: (vo.currentSrc || '').split('/').pop() }; };
 ['loadstart', 'loadedmetadata', 'canplay', 'playing', 'seeking', 'seeked', 'waiting', 'stalled', 'pause', 'ended', 'abort', 'emptied', 'error'].forEach(n => vo.addEventListener(n, () => { if (__evx.length < 5000) __evx.push({ e: n, ...tag() }); }));
 let last = 0; const f = t => { requestAnimationFrame(f); if (t - last < 240) return; const F = Player.film, c = F && F.cues[Player.cueI]; if (!c || vo.paused || !Player.playing || Player.g < c.g + .4 || Player.g > c.g + c.dur - .3) return; last = t; if (__avx.length < 4000) __avx.push({ v: +(vo.currentTime - (Player.g - c.g) * Store.d.set.speed).toFixed(3), ...tag() }); }; requestAnimationFrame(f);
 return 'ok'; })()"""

STATS = r"""(() => { const q = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2); };
 const r = { frames: __gap.length, gap50: q(__gap, .5), gap95: q(__gap, .95), gapMax: q(__gap, 1), over50: __gap.filter(x => x > 50).length, ms50: q(__dt, .5), ms95: q(__dt, .95), msMax: q(__dt, 1), dq: Player.dq };
 __gap.length = 0; __dt.length = 0; return r; })()"""

AV = r"""(() => { const a = __av.map(Math.abs).sort((x, y) => x - y), sg = [...__av].sort((x, y) => x - y); const r = a.length ? { n: a.length, med: +a[a.length >> 1].toFixed(3), p90: +a[Math.floor(a.length * .9)].toFixed(3), max: +a[a.length - 1].toFixed(3), signedMed: +sg[sg.length >> 1].toFixed(3), note: 'audio minus film, s' } : { n: 0 }; __av.length = 0; return r; })()"""

STATE = r"""(() => { const vo = document.getElementById('vo'); return { g: +Player.g.toFixed(2), playing: Player.playing, voPaused: vo.paused, voT: +vo.currentTime.toFixed(2), voErr: vo.error ? vo.error.code : null, voReady: vo.readyState, voSrc: (vo.currentSrc || '').split('/').pop(), sub: document.getElementById('subLn').textContent.slice(0, 60), dq: Player.dq, actx: AudioCtl.ctx ? AudioCtl.ctx.state : null, cls: document.getElementById('stage').className, errs: (window.__errs || []).slice(0, 6) }; })()"""

POSTER = r"""(() => ({ ver: typeof VER !== 'undefined' ? VER : null, pLen: document.getElementById('pLen').textContent, total: +Player.film.total.toFixed(1), quizzes: Player.quizzes.map(q => +q.at.toFixed(1)), scenes: Player.film.scenes.length, imgsOk: Object.values(IMG.R).filter(r => r.ok).length, imgsAll: Object.keys(IMG.R).length, sw: !!(navigator.serviceWorker && navigator.serviceWorker.controller) }))()"""

CTU = r"""(() => { const s = [...__ctu].sort((a, b) => a - b); return s.length ? { n: s.length, med: +s[s.length >> 1].toFixed(1), p90: +s[Math.floor(s.length * .9)].toFixed(1), note: 'ms between audio currentTime changes' } : { n: 0 }; })()"""
SUBL = r"""(() => { const r = { n: __subL.length, max: Math.max(0, ...__subL), lines: [1, 2, 3].map(k => __subL.filter(x => x === k).length) }; __subL.length = 0; return r; })()"""

SCENES = "Player.film.scenes.map(s => ({ n: s.n, name: s.name, start: s.start, dur: s.dur }))"
ENV = "({ ua: navigator.userAgent, inner: [innerWidth, innerHeight, devicePixelRatio], ver: typeof VER !== 'undefined' ? VER : null })"
QUIZ_AFTER = "({ quizOpen: !document.getElementById('quizOv').hidden, playing: Player.playing, g: +Player.g.toFixed(1) })"


def save_img(png, path, max_edge=1600, q=80):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    if max_edge and max(im.size) > max_edge:
        s = max_edge / max(im.size); im = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
    im.save(path, quality=q); return path


def contact(items, out, cols=6, edge=300):
    ims = [(Image.open(f).convert('RGB'), lab) for f, lab in items if os.path.exists(f)]
    if not ims: return
    w0, h0 = ims[0][0].size; s = edge / max(w0, h0); tw, th = round(w0 * s), round(h0 * s)
    cols = min(cols, len(ims)); rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 22) + 6), (18, 18, 22)); d = ImageDraw.Draw(sheet)
    for i, (im, lab) in enumerate(ims):
        x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 22)
        d.text((x, y), lab, fill=(220, 220, 220)); sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 16))
    sheet.save(out, quality=82)
