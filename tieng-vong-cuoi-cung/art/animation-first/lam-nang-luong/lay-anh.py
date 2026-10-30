# Pull the newest PNG image from the session transcript (1:1 capture) and save it cropped.
import sys,json,base64,io
from PIL import Image
out,w,h=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
last=None
for line in open('/root/.claude/projects/-home-claude/3d4601ea-c0a0-509d-bac3-ac4c31c5f5c0.jsonl'):
    if '"image"' not in line: continue
    o=json.loads(line)
    def walk(x):
        global last
        if isinstance(x,dict):
            if x.get('type')=='image' and isinstance(x.get('source'),dict) and x['source'].get('media_type')=='image/png': last=x['source']
            for v in x.values(): walk(v)
        elif isinstance(x,list):
            for v in x: walk(v)
    walk(o)
Image.open(io.BytesIO(base64.b64decode(last['data']))).convert('RGB').crop((0,0,w,h)).save(out); print('saved',out)
