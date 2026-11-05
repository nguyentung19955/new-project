import sys, json, os, threading, requests
sys.path.insert(0, '/tmp/claude-0/pl')
from pl import *
from vfx_spec import V, ST
def run(ma, seed=os.environ.get('SUF','')):
    out = 'vfx/%s%s' % (ma, seed)
    if os.path.exists(out + '/ok'): return
    os.makedirs(out, exist_ok=True)
    j = post('/vfx', {'description': V[ma] + ST, 'name': 'tw-' + ma[3:] + seed, 'artist': os.environ.get('ART','lite')}, tag='vfx-' + ma)
    r = wait(j['background_job_id'])
    if r['status'] != 'completed': print(ma, 'FAIL', str(r)[:300], flush=True); return
    lr = r['last_response']
    for k, u in lr['files'].items():
        if k.endswith(('.png', '.json', '.gif')) and 'normals' not in k:
            open(out + '/' + ('strip' + k[-5:] if k.endswith(('.png', '.json')) else 'a.gif'), 'wb').write(requests.get(u, timeout=60).content)
    json.dump({k: v for k, v in lr.items() if k not in ('conversation',)}, open(out + '/ok', 'w'))
    json.dump({'conversation': lr.get('conversation'), 'effect_id': lr.get('effect_id')}, open(out + '/conv.json', 'w'))
    print(ma, 'ok', lr.get('frames'), lr.get('canvas'), lr.get('anchor'), flush=True)
ids = sys.argv[1:] or list(V)
ts = [threading.Thread(target=run, args=(m,)) for m in ids]
for t in ts: t.start(); time.sleep(1)
for t in ts: t.join()
