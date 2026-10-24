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
 setInterval(() => { const vo = document.getElementById('vo'), F = Player.film, c = F && F.cues[Player.cueI]; if (!c || vo.paused || !Player.playing) return; __av.push(vo.currentTime - (Player.g - c.g) * Store.d.set.speed); }, 250);
 return 'ok'; })()"""

STATS = r"""(() => { const q = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2); };
 const r = { frames: __gap.length, gap50: q(__gap, .5), gap95: q(__gap, .95), gapMax: q(__gap, 1), over50: __gap.filter(x => x > 50).length, ms50: q(__dt, .5), ms95: q(__dt, .95), msMax: q(__dt, 1), dq: Player.dq };
 __gap.length = 0; __dt.length = 0; return r; })()"""

AV = r"""(() => { const a = __av.map(Math.abs).sort((x, y) => x - y), sg = [...__av].sort((x, y) => x - y); const r = a.length ? { n: a.length, med: +a[a.length >> 1].toFixed(3), p90: +a[Math.floor(a.length * .9)].toFixed(3), max: +a[a.length - 1].toFixed(3), signedMed: +sg[sg.length >> 1].toFixed(3), note: 'audio minus film, s' } : { n: 0 }; __av.length = 0; return r; })()"""

STATE = r"""(() => { const vo = document.getElementById('vo'); return { g: +Player.g.toFixed(2), playing: Player.playing, voPaused: vo.paused, voT: +vo.currentTime.toFixed(2), voErr: vo.error ? vo.error.code : null, voReady: vo.readyState, voSrc: (vo.currentSrc || '').split('/').pop(), sub: document.getElementById('subLn').textContent.slice(0, 60), dq: Player.dq, actx: AudioCtl.ctx ? AudioCtl.ctx.state : null, cls: document.getElementById('stage').className, errs: (window.__errs || []).slice(0, 6) }; })()"""

POSTER = r"""(() => ({ ver: typeof VER !== 'undefined' ? VER : null, pLen: document.getElementById('pLen').textContent, total: +Player.film.total.toFixed(1), quizzes: Player.quizzes.map(q => +q.at.toFixed(1)), scenes: Player.film.scenes.length, imgsOk: Object.values(IMG.R).filter(r => r.ok).length, imgsAll: Object.keys(IMG.R).length, sw: !!(navigator.serviceWorker && navigator.serviceWorker.controller) }))()"""

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
