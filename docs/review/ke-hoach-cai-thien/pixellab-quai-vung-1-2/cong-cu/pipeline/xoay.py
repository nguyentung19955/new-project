import sys, os, json, threading
sys.path.insert(0, '/tmp/claude-0/pl')
from pl import *
from hoso import ALL
D = ['south','south-east','east','north-east','north','north-west','west','south-west']
def run(mid, pick, seed):
    h = ALL[mid]
    os.makedirs('xoay/%s' % mid, exist_ok=True)
    body = {'first_frame': img('goc/%s/%s.png' % (mid, pick)), 'description': h['desc'], 'no_background': True, 'seed': seed}
    j = post('/generate-8-rotations-v3', body, tag='xoay-' + mid)
    r = wait(j['background_job_id'])
    if r['status'] != 'completed': print(mid, 'FAIL', str(r)[:300], flush=True); return
    ims = r['last_response']['images']
    for i, x in enumerate(ims): open('xoay/%s/r%d-%d-%s.png' % (mid, seed, i, D[i]), 'wb').write(b64png(x))
    print(mid, seed, 'ok', flush=True)
args = sys.argv[1:]; seed = int(args[0])
ts = [threading.Thread(target=run, args=(a.split(':')[0], a.split(':')[1], seed)) for a in args[1:]]
for t in ts: t.start()
for t in ts: t.join()
