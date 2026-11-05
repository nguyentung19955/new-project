# Chạy động tác: python3 anim.py viec.json   (danh sách [mid, hang, mô tả, số khung, seed])
import sys, os, json, threading, time
sys.path.insert(0, '/tmp/claude-0/pl')
from pl import *
SEM = threading.Semaphore(int(os.environ.get('SONG', '7')))
TAIL = ' Nothing else appears: no extra limbs, no extra heads, no effects, no particles, no dust, no smoke, no motion blur. The creature stays one solid body.'
def run(mid, row, act, n, seed):
    st = json.load(open('trangthai.json'))
    cid = st[mid]['cid']
    out = 'anim/%s/%s-s%d' % (mid, row, seed)
    if os.path.exists(out + '/ok'): return
    with SEM:
        body = {'character_id': cid, 'mode': 'skeleton-v3', 'action_description': act + TAIL, 'frame_count': n,
                'directions': ['south-east'], 'seed': seed, 'animation_name': '%s-s%d' % (row, seed)}
        try:
            j = post('/characters/animations', body, tag='anim-%s-%s' % (mid, row))
        except Exception as e:
            print(mid, row, seed, 'POSTFAIL', str(e)[:300], flush=True); return
        jobs = j.get('background_job_ids') or ([j['background_job_id']] if j.get('background_job_id') else [])
        if not jobs and j.get('jobs'): jobs = [x.get('background_job_id') or x.get('job_id') for x in j['jobs']]
        res = None
        for jb in jobs:
            r = wait(jb)
            if r['status'] != 'completed': print(mid, row, seed, 'FAIL', str(r)[:300], flush=True); return
            res = r
    os.makedirs(out, exist_ok=True)
    lr = res['last_response']
    ims = lr.get('images') or (lr.get('frames'))
    if ims is None:
        json.dump(lr, open(out + '/raw.json', 'w')); print(mid, row, 'no images keys', list(lr.keys()), flush=True); return
    for i, x in enumerate(ims): open('%s/%02d.png' % (out, i), 'wb').write(b64png(x))
    json.dump({'gid': j.get('animation_group_id'), 'act': act, 'n': n}, open(out + '/ok', 'w'))
    print(mid, row, seed, 'ok', len(ims), flush=True)
viec = json.load(open(sys.argv[1]))
ts = [threading.Thread(target=run, args=tuple(v)) for v in viec]
for t in ts: t.start(); time.sleep(1)
for t in ts: t.join()
print('XONG', flush=True)
