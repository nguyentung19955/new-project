import base64, json, time, requests, sys, os, io
K = open('/root/.plk').read().strip(); B = 'https://api.pixellab.ai/v2'
H = {'Authorization': 'Bearer ' + K}
LOG = '/tmp/claude-0/pl/usage.jsonl'
def img(p):
    if not isinstance(p, (bytes, bytearray)): p = open(p, 'rb').read()
    return {'type': 'base64', 'base64': base64.b64encode(p).decode(), 'format': 'png'}
def pilb(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()
def _req(f, *a, **k):
    for i in range(60):
        try:
            r = f(*a, timeout=180, **k)
            if r.status_code in (429, 502, 503, 504):
                time.sleep(30); continue
            if r.status_code >= 400:
                raise RuntimeError('%s %s' % (r.status_code, r.text[:500]))
            return r.json()
        except requests.exceptions.RequestException as e:
            time.sleep(15)
    raise RuntimeError('request failed')
def post(path, body, tag=''):
    j = _req(requests.post, B + path, json=body, headers=H)
    with open(LOG, 'a') as f: f.write(json.dumps({'t': time.time(), 'path': path, 'tag': tag, 'usage': j.get('usage'), 'q': j.get('quoted_generations')}) + '\n')
    return j
def get(path): return _req(requests.get, B + path, headers=H)
def delete(path): return _req(requests.delete, B + path, headers=H)
def wait(job, maxs=1500):
    t0 = time.time()
    while True:
        j = get('/background-jobs/' + job)
        if j['status'] not in ('processing', 'pending', 'queued'):
            u = j.get('usage') or (j.get('last_response') or {}).get('usage')
            with open(LOG, 'a') as f: f.write(json.dumps({'t': time.time(), 'job': job, 'status': j['status'], 'usage': u}) + '\n')
            return j
        if time.time() - t0 > maxs: return {'status': 'timeout', 'id': job}
        time.sleep(8)
def b64png(x):
    if isinstance(x, dict):
        x = x.get('base64') or x.get('image', {}).get('base64')
    if x.startswith('data:'): x = x.split(',', 1)[1]
    return base64.b64decode(x)
def balance(): return get('/balance')
