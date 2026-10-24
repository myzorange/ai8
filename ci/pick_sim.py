"""Pick an iPhone simulator on the newest installed iOS runtime (prefer a non-Max 'Pro'). Prints the UDID; details go to stderr."""
import json, sys
devs = json.load(sys.stdin)['devices']
c = []
for rt, lst in devs.items():
    if '.iOS-' not in rt: continue
    ver = tuple(int(v) for v in rt.split('.iOS-')[-1].split('-') if v.isdigit())
    for x in lst:
        if x.get('isAvailable') and x['name'].startswith('iPhone'):
            c.append((ver, 'Pro' in x['name'] and 'Max' not in x['name'], x['name'], x['udid']))
c.sort()
print('picked', c[-1][:3], file=sys.stderr)
print(c[-1][3])
