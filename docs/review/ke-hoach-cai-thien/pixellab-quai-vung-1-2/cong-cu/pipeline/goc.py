import sys, os, json, threading
from PIL import Image
sys.path.insert(0, '/tmp/claude-0/pl')
from pl import *
from hoso import ALL, STYLE
def run(mid, seed):
    h = ALL[mid]; s = h['size']
    ref = Image.open('cu/%s.png' % mid)
    body = {'description': h['desc'] + '. ' + STYLE + '. Seen from a high top-down three-quarter camera, the creature faces the viewer (south). Fairy-tale redesign of the reference creature, keep its pose idea and silhouette size.',
            'image_size': {'width': s, 'height': s}, 'seed': seed, 'no_background': True,
            'reference_images': [{'image': img(pilb(ref)), 'size': {'width': ref.width, 'height': ref.height}, 'usage_description': 'the old version of this monster: keep the same creature type, body proportions and colour mood'}]}
    j = post('/generate-image-v2', body, tag='goc-' + mid)
    r = wait(j['background_job_id'])
    os.makedirs('goc/' + mid, exist_ok=True)
    if r['status'] != 'completed': print(mid, 'FAIL', str(r)[:300]); return
    ims = r['last_response'].get('images', [])
    for i, x in enumerate(ims): open('goc/%s/s%d-%d.png' % (mid, seed, i), 'wb').write(b64png(x))
    print(mid, seed, len(ims), 'ok', r.get('usage') or r['last_response'].get('usage'), flush=True)
ids = sys.argv[2:]; seed = int(sys.argv[1])
ts = [threading.Thread(target=run, args=(m, seed)) for m in ids]
for t in ts: t.start()
for t in ts: t.join()
