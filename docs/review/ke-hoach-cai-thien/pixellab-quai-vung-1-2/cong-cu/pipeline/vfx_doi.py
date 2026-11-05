import sys, json, os, requests
sys.path.insert(0, '/tmp/claude-0/pl')
from pl import *
src, dst, txt = sys.argv[1], sys.argv[2], sys.argv[3]
c = json.load(open('vfx/%s/conv.json' % src)); ok = json.load(open('vfx/%s/ok' % src))
art = os.environ.get('ART', 'pro')
j = post('/vfx', {'description': txt, 'effect_id': c['effect_id'], 'conversation': c['conversation'], 'artist': art}, tag='vfxdoi-' + dst)
r = wait(j['background_job_id'])
if r['status'] != 'completed': print(dst, 'FAIL', str(r)[:300]); sys.exit()
lr = r['last_response']; out = 'vfx/' + dst; os.makedirs(out, exist_ok=True)
for k, u in lr['files'].items():
    if k.endswith(('.png', '.json')) and 'normals' not in k: open(out + '/strip' + k[-5:], 'wb').write(requests.get(u, timeout=60).content)
json.dump({k: v for k, v in lr.items() if k != 'conversation'}, open(out + '/ok', 'w'))
json.dump({'conversation': lr.get('conversation'), 'effect_id': lr.get('effect_id')}, open(out + '/conv.json', 'w'))
print(dst, 'ok', lr.get('frames'), lr.get('canvas'), lr.get('billing_usage'))
