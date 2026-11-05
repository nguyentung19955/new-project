# Nhập nhân vật: python3 nhap.py mid:pick ...  (pick = rN seed của bộ xoay)
import sys, os, json, threading, glob
sys.path.insert(0, '/tmp/claude-0/pl')
from pl import *
from hoso import ALL
D = ['south','south-east','east','north-east','north','north-west','west','south-west']
def run(mid, r):
    h = ALL[mid]
    fs = {d: 'xoay/%s/%s-%d-%s.png' % (mid, r, i, d) for i, d in enumerate(D)}
    body = {'description': h['desc'], 'reference_image': img(fs['south']), 'direction_images': {d: img(fs[d]) for d in D[1:]},
            'n_directions': 8, 'view': 'low top-down', 'template_id': h.get('tpl', 'mannequin'), 'name': 'Talesworn ' + h['ten']}
    j = post('/create-character-v3', body, tag='nhap-' + mid)
    cid = j.get('character_id')
    if j.get('background_job_id'):
        rr = wait(j['background_job_id'])
        cid = cid or (rr.get('last_response') or {}).get('character_id')
        if rr['status'] != 'completed': print(mid, 'FAIL', str(rr)[:400], flush=True); return
    st = json.load(open('trangthai.json')) if os.path.exists('trangthai.json') else {}
    st.setdefault(mid, {})['cid'] = cid; st[mid]['xoay'] = r
    json.dump(st, open('trangthai.json', 'w'), indent=1)
    print(mid, 'cid', cid, flush=True)
lock = threading.Lock()
for a in sys.argv[1:]:
    m, r = a.split(':'); run(m, r)
