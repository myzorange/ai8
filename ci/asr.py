"""Transcribe every narration clip of the live preview with Whisper large-v3-turbo (faster-whisper, CPU int8), to check the cloned voice reads the script correctly."""
import json, os, time, urllib.request
from faster_whisper import WhisperModel

URL = os.environ.get('URL', 'https://myzorange.github.io/ai8/next/')
OUT = 'out/asr'; os.makedirs(OUT, exist_ok=True); os.makedirs('vo', exist_ok=True)
rows = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vo_ids.json')))
t0 = time.time(); m = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8', cpu_threads=4); print('model %.0fs' % (time.time() - t0), flush=True)
res = []
for cid, text, tts in rows:
    f = f'vo/{cid}.mp3'
    try:
        urllib.request.urlretrieve(URL + f, f)
        segs, info = m.transcribe(f, language='zh', beam_size=5, vad_filter=False, condition_on_previous_text=False, initial_prompt='以下是普通话的句子。')
        hyp = ''.join(s.text for s in segs).strip()
    except Exception as e:
        hyp = 'ERROR ' + str(e)[:200]
    res.append({'id': cid, 'ref': text, 'tts': tts, 'hyp': hyp})
    print(cid, '|', text, '|', hyp, flush=True)
json.dump(res, open(f'{OUT}/asr.json', 'w'), ensure_ascii=False, indent=1)
print('done %.0fs' % (time.time() - t0))
import sys
if sum(r['hyp'].startswith('ERROR') for r in res) > len(res) // 2: sys.exit('most clips failed to transcribe')
