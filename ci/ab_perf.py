"""Same-runner A/B of frame pacing in real Safari: two builds served locally, measured alternately (A B A B),
so a slow or noisy runner affects both equally. Usage: python ci/ab_perf.py A=http://localhost:8801/ B=http://localhost:8802/"""
import json, os, sys, time
from selenium import webdriver
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jslib import HOOK, STATS, AV

BUILDS = dict(a.split('=', 1) for a in sys.argv[1:])
OUT = 'out/abperf'; os.makedirs(OUT, exist_ok=True)
d = webdriver.Safari(); d.set_script_timeout(30)


def ev(js):
    for k in range(4):
        try: return d.execute_script('return ' + js)
        except Exception as e:
            if k < 3 and any(w in str(e) for w in ('Connection reset', 'Connection aborted', 'RemoteDisconnected', 'Broken pipe')): time.sleep(.6); continue
            raise


def nap(sec):
    end = time.time() + sec
    while time.time() < end:
        time.sleep(min(4, max(0, end - time.time())))
        try: ev('1')
        except Exception: pass


def wait_js(js, timeout):
    t = time.time()
    while time.time() - t < timeout:
        try:
            if ev(js): return round(time.time() - t, 1)
        except Exception: pass
        time.sleep(.5)
    return None


def measure(name, url, size):
    d.set_window_rect(0, 0, *size)
    d.get(url + 'index.html'); time.sleep(2)
    wait_js("navigator.serviceWorker && navigator.serviceWorker.controller !== null", 90)
    d.get(url + 'index.html#/l/1')
    r = {'build': name, 'url': url, 'size': size, 'ver': ev("typeof VER !== 'undefined' ? VER : null")}
    r['imgReadyS'] = wait_js("typeof Player !== 'undefined' && Player.imgReady === true", 150)
    time.sleep(.8); ev(HOOK); ev("(Player.resumeAt = 0, 1)")
    d.find_element('css selector', '#bBig').click(); nap(25)
    r['play25'] = ev(STATS); r['av25'] = ev(AV)
    ev("(Player.quizzes.forEach(q => q.shown = true), 1)")
    sc = []
    for g in (62.0, 130.0, 190.0, 252.0, 329.0, 434.0):
        ev(f"(Player.seek({g}), Player.play(), 1)"); time.sleep(4)
        sc.append(ev(STATS))
    r['scenes'] = sc; r['av_scenes'] = ev(AV)
    r['errs'] = ev("(window.__errs || []).slice(0, 6)")
    ev("(Player.pause(), 1)")
    return r


res = []
order = [k for _ in range(2) for k in sorted(BUILDS)]
for size in ((1280, 900), (430, 932)):
    for name in order:
        try: res.append(measure(name, BUILDS[name], size))
        except Exception as e: res.append({'build': name, 'size': size, 'error': str(e)[:400]})
        json.dump(res, open(f'{OUT}/abperf.json', 'w'), indent=1)
try: d.quit()
except Exception: pass
for r in res:
    if 'error' in r: print(r['build'], r['size'], 'ERROR', r['error'][:200]); continue
    p = r['play25']; s = r['scenes']
    print(r['build'], r['ver'], r['size'], '| play over50', p['over50'], 'gap95', p['gap95'], 'ms95', p['ms95'], '| scenes over50', sum(x['over50'] for x in s), 'gap95max', max(x['gap95'] for x in s), 'ms95max', max(x['ms95'] for x in s), '| av', r['av_scenes'].get('max'), r['errs'])
