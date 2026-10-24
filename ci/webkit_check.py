"""Playwright WebKit (iPhone 13 portrait/landscape + Retina desktop) against the live preview."""
import asyncio, json, os, sys, time, traceback
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jslib import HOOK, STATS, AV, STATE, POSTER, SCENES, ENV, QUIZ_AFTER, save_img, contact

URL = os.environ.get('URL', 'https://myzorange.github.io/ai8/next/')
OUT = 'out/webkit'; os.makedirs(OUT, exist_ok=True)
SUM = {}
SW_ACTIVE = "(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!(r && r.active && r.active.state === 'activated'); })()"


async def run(b, name, kw, full):
    R = SUM[name] = {'errors': [], 'bad': [], 'notes': []}
    ctx = await b.new_context(**kw); pg = await ctx.new_page(); pg.set_default_timeout(30000)
    pg.on('pageerror', lambda e: R['errors'].append('PAGEERR ' + str(e)[:300]))
    pg.on('console', lambda m: R['errors'].append('console ' + m.text[:300]) if m.type == 'error' else None)
    pg.on('requestfailed', lambda r: R['bad'].append('FAIL ' + r.url[-90:] + ' ' + str(r.failure)[:80]))
    pg.on('response', lambda r: R['bad'].append(str(r.status) + ' ' + r.url[-90:]) if r.status >= 400 else None)

    async def ev(js): return await pg.evaluate(js)

    async def shot(tag, full_res=False):
        p = f'{OUT}/{name}_{tag}.jpg'; save_img(await pg.screenshot(), p, None if full_res else 1600, 88 if full_res else 80); return p

    try:
        t0 = time.time()
        await pg.goto(URL, wait_until='load', timeout=120000); await pg.wait_for_timeout(3000); await shot('home')
        R['env'] = await ev(ENV)
        for _ in range(180):
            try:
                if await ev(SW_ACTIVE): break
            except Exception as e: R['notes'].append('sw ' + str(e)[:120]); break
            await pg.wait_for_timeout(500)
        await pg.reload(wait_until='load'); await pg.wait_for_timeout(1500)       # second launch: served by the service worker, like the installed app
        R['swControlled'] = await ev("!!(navigator.serviceWorker && navigator.serviceWorker.controller)")
        await ev("location.hash = '#/l/1'")
        await pg.wait_for_function("typeof Player !== 'undefined' && Player.imgReady === true", timeout=150000)
        R['imgReadyS'] = round(time.time() - t0, 1)
        await pg.wait_for_timeout(800); await shot('poster', True)
        R['poster'] = await ev(POSTER)
        R['hook'] = await ev(HOOK)
        await pg.click('#bBig'); await pg.wait_for_timeout(9000); await shot('play9s', True)
        R['play9s'] = await ev(STATE)
        await pg.wait_for_timeout(30000)
        R['perf_0_40s'] = await ev(STATS); R['av_0_40s'] = await ev(AV); R['state40s'] = await ev(STATE)
        scenes = await ev(SCENES); await ev("Player.quizzes.forEach(q => q.shown = true)")
        R['scenes'] = []; shots = []
        for s in scenes:
            g = max(s['start'] + .05, s['start'] + s['dur'] * .55 - 2.9)
            await ev(f"Player.seek({g:.2f}); Player.play()"); await pg.wait_for_timeout(2950)
            p = await shot(f"s{s['n']:02d}", s['n'] in (5, 9, 12)); st = await ev(STATS)
            R['scenes'].append({'n': s['n'], 'name': s['name'], 't': round(g + 2.95, 1), 'perf': st}); shots.append((p, f"{s['n']} @{g + 2.95:.0f}s"))
        contact(shots, f'{OUT}/{name}_sheet.jpg')
        R['av_scenes'] = await ev(AV)
        if full:
            await ev("Player.quizzes.forEach(q => q.shown = false)"); R['quiz'] = []
            for qi in range(3):
                qa = await ev(f"Player.quizzes[{qi}].at"); await ev(f"Player.seek({qa} - 1.2); Player.play()"); await pg.wait_for_timeout(3500)
                vis = await ev("!document.getElementById('quizOv').hidden"); await shot(f'quiz{qi}')
                if vis:
                    await pg.click('#qCard .opt[data-i="1"]'); await pg.wait_for_timeout(600); await shot(f'quiz{qi}_ans')
                    await pg.click('#qGo'); await pg.wait_for_timeout(1000)
                R['quiz'].append({'i': qi, 'shown': vis, 'after': await ev(QUIZ_AFTER)})
            tot = await ev("Player.film.total")
            await ev(f"Player.quizzes.forEach(q => q.shown = true); Player.seek({tot} - 2); Player.play()")
            for _ in range(16):
                await pg.wait_for_timeout(500)
                if await ev("!document.getElementById('endOv').hidden"): break
            R['end'] = await ev("!document.getElementById('endOv').hidden"); await shot('end')
            try:
                await pg.click('#eDown'); await pg.wait_for_timeout(1200)
                el = await pg.query_selector('details.cred')
                if el: await el.scroll_into_view_if_needed(); await el.click(); await pg.wait_for_timeout(500); await shot('cred')
                R['credits'] = await ev("document.querySelectorAll('details.cred li').length")
            except Exception as e: R['notes'].append('cred ' + str(e)[:200])
    except Exception:
        R['notes'].append('FATAL ' + traceback.format_exc()[-1500:])
        try: await shot('fatal')
        except Exception: pass
    try: R['errs_in_page'] = await ev("(window.__errs || []).slice(0, 10)")
    except Exception: pass
    await ctx.close()


async def main():
    async with async_playwright() as p:
        b = await getattr(p, os.environ.get('BROWSER', 'webkit')).launch()
        SUM['browser'] = b.version; only = os.environ.get('ONLY')
        for name, kw, full in [('iphone_port', dict(p.devices['iPhone 13']), True), ('iphone_land', dict(p.devices['iPhone 13 landscape']), False),
                               ('mac', {'viewport': {'width': 1280, 'height': 800}, 'device_scale_factor': 2}, False)]:
            if not only or name == only: await run(b, name, kw, full)
        await b.close()
    json.dump(SUM, open(f'{OUT}/summary.json', 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(SUM, ensure_ascii=False, indent=1)[:30000])

asyncio.run(main())
