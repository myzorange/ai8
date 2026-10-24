"""Real Safari (macOS runner, safaridriver) against the live preview: load, service-worker launch, playback, perf, A/V sync, every scene in landscape and a narrow portrait window."""
import json, os, sys, time, traceback
from selenium import webdriver
from selenium.webdriver.common.by import By
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jslib import HOOK, STATS, AV, STATE, POSTER, SCENES, ENV, QUIZ_AFTER, save_img, contact

URL = os.environ.get('URL', 'https://myzorange.github.io/ai8/next/')
OUT = 'out/safari'; os.makedirs(OUT, exist_ok=True)
SUM = {}
d = webdriver.Safari()
d.set_script_timeout(30)


def ev(js): return d.execute_script('return ' + js)


def sw_active():
    return d.execute_async_script("const cb = arguments[arguments.length - 1]; if (!navigator.serviceWorker) return cb('no-sw'); navigator.serviceWorker.getRegistration().then(r => cb(!!(r && r.active && r.active.state === 'activated'))).catch(e => cb('err ' + e));")


def wait_js(js, timeout):
    t = time.time()
    while time.time() - t < timeout:
        try:
            if ev(js): return round(time.time() - t, 1)
        except Exception: pass
        time.sleep(.5)
    return None


def shot(name, tag, full_res=False):
    p = f'{OUT}/{name}_{tag}.jpg'; save_img(d.get_screenshot_as_png(), p, None if full_res else 1600, 88 if full_res else 80); return p


def click(sel): d.find_element(By.CSS_SELECTOR, sel).click()


def scenes_pass(name, R):
    scenes = ev(SCENES); ev("(Player.quizzes.forEach(q => q.shown = true), 1)")
    R['scenes'] = []; shots = []
    for s in scenes:
        g = max(s['start'] + .05, s['start'] + s['dur'] * .55 - 2.9)
        ev(f"(Player.seek({g:.2f}), Player.play(), 1)"); time.sleep(2.95)
        p = shot(name, f"s{s['n']:02d}", s['n'] in (5, 9, 12)); st = ev(STATS)
        R['scenes'].append({'n': s['n'], 'name': s['name'], 't': round(g + 2.95, 1), 'perf': st}); shots.append((p, f"{s['n']} @{g + 2.95:.0f}s"))
    contact(shots, f'{OUT}/{name}_sheet.jpg')
    R['av_scenes'] = ev(AV)


def land():
    name = 'mac_land'; R = SUM[name] = {'notes': []}
    d.set_window_rect(0, 0, 1280, 900)
    t0 = time.time(); d.get(URL); time.sleep(3); shot(name, 'home'); R['env'] = ev(ENV)
    for _ in range(180):
        r = sw_active()
        if r is True: break
        if isinstance(r, str): R['notes'].append('sw ' + r); break
        time.sleep(.5)
    R['swActiveS'] = round(time.time() - t0, 1)
    d.refresh(); time.sleep(2)                       # second launch: served by the service worker
    R['swControlled'] = ev("!!(navigator.serviceWorker && navigator.serviceWorker.controller)")
    ev("(location.hash = '#/l/1', 1)")
    R['imgReadyS'] = wait_js("typeof Player !== 'undefined' && Player.imgReady === true", 150)
    time.sleep(.8); shot(name, 'poster', True); R['poster'] = ev(POSTER)
    R['hook'] = ev(HOOK)
    click('#bBig'); time.sleep(9); shot(name, 'play9s', True); R['play9s'] = ev(STATE)
    time.sleep(30)
    R['perf_0_40s'] = ev(STATS); R['av_0_40s'] = ev(AV); R['state40s'] = ev(STATE)
    scenes_pass(name, R)
    ev("(Player.quizzes.forEach(q => q.shown = false), 1)"); R['quiz'] = []
    for qi in range(3):
        qa = ev(f"Player.quizzes[{qi}].at"); ev(f"(Player.seek({qa} - 1.2), Player.play(), 1)"); time.sleep(3.5)
        vis = ev("!document.getElementById('quizOv').hidden"); shot(name, f'quiz{qi}')
        if vis:
            click('#qCard .opt[data-i="1"]'); time.sleep(.6); shot(name, f'quiz{qi}_ans'); click('#qGo'); time.sleep(1)
        R['quiz'].append({'i': qi, 'shown': vis, 'after': ev(QUIZ_AFTER)})
    tot = ev("Player.film.total"); ev(f"(Player.quizzes.forEach(q => q.shown = true), Player.seek({tot} - 2), Player.play(), 1)")
    R['endS'] = wait_js("!document.getElementById('endOv').hidden", 8); shot(name, 'end')
    try:
        click('#eDown'); time.sleep(1.2)
        d.execute_script("const e = document.querySelector('details.cred'); if (e) { e.open = true; e.scrollIntoView(); }"); time.sleep(.6); shot(name, 'cred')
        R['credits'] = ev("document.querySelectorAll('details.cred li').length")
    except Exception as e: R['notes'].append('cred ' + str(e)[:200])
    R['errs_in_page'] = ev("(window.__errs || []).slice(0, 10)")


def port():
    name = 'mac_port'; R = SUM[name] = {'notes': []}
    d.execute_script("window.scrollTo(0, 0)")
    d.set_window_rect(0, 0, 430, 932); time.sleep(2.5)
    R['env'] = ev(ENV)
    ev("(Player.quizzes.forEach(q => q.shown = true), Player.seek(20), Player.play(), 1)"); time.sleep(3); shot(name, 'play')
    scenes_pass(name, R)
    R['errs_in_page'] = ev("(window.__errs || []).slice(0, 10)")


for fn in (land, port):
    try: fn()
    except Exception:
        SUM.setdefault(fn.__name__, {}).setdefault('notes', []).append('FATAL ' + traceback.format_exc()[-1500:])
        try: shot(fn.__name__, 'fatal')
        except Exception: pass
try: d.quit()
except Exception: pass
json.dump(SUM, open(f'{OUT}/summary.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(SUM, ensure_ascii=False, indent=1)[:30000])
