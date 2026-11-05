import json, glob, sys, os, io, base64
from PIL import Image
sys.path.insert(0, '/tmp/claude-0/pl')
from hu_cu import tai
OUT = '/home/claude/new-project/game/art/custom/'
SRCD = '/home/claude/new-project/docs/anh-goc/pixellab-quai-vung-1-2/hieu-ung/'
Z1 = ['hu-cau-dat-lan', 'hu-gai-re', 'hu-la-chem', 'hu-qua-doc-roi', 'hu-nut-re-moc', 'hu-khoi-doc-nho', 'hu-dan-qua-no']
def frames_vfx(d):
    png = [f for f in glob.glob(d + '/*.png') if 'normals' not in f][0]; js = [f for f in glob.glob(d + '/*.json') if not f.endswith(('ok', 'conv.json'))]
    js = [f for f in js if 'conv' not in f][0]
    im = Image.open(png).convert('RGBA'); m = json.load(open(js))
    return [im.crop((f['frame']['x'], f['frame']['y'], f['frame']['x'] + f['frame']['w'], f['frame']['y'] + f['frame']['h'])) for f in m['frames']]
def ub(fs):
    bs = [f.getbbox() for f in fs if f.getbbox()]
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))
def dung(ma, src=None, chon=None, ghi=False):
    d, im = tai(ma); n0 = d.get('net', 1); fw, fh, so = d['khung_rong'], d['khung_cao'], d['so']
    N = 2; W, H = fw * N, fh * N
    olds = [im.crop((i * fw * n0, 0, (i + 1) * fw * n0, fh * n0)).resize((W, H), Image.NEAREST) for i in range(so)]
    ob = ub(olds)
    fs = frames_vfx(src or 'vfx/' + ma)
    n = len(fs)
    if chon is None:
        chon = [round(i * n / so) % n for i in range(so)] if d.get('lap') else [round(i * (n - 1) / max(1, so - 1)) for i in range(so)]
    pk = [fs[i] for i in chon]
    nb = ub(pk)
    gx, gy = d['goc'][0] / fw, d['goc'][1] / fh
    if gx < 0.2: dx = ob[0] - nb[0]
    elif gx > 0.8: dx = ob[2] - nb[2]
    else: dx = (ob[0] + ob[2]) // 2 - (nb[0] + nb[2]) // 2
    if gy > 0.8: dy = ob[3] - nb[3]
    elif gy < 0.2: dy = ob[1] - nb[1]
    else: dy = (ob[1] + ob[3]) // 2 - (nb[1] + nb[3]) // 2
    tam = Image.new('RGBA', (W * so, H), (0, 0, 0, 0)); cat = 0
    for i, f in enumerate(pk):
        c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.paste(f, (dx, dy), f)
        a0 = sum(1 for p in f.get_flattened_data() if p[3]) if hasattr(f,'get_flattened_data') else sum(1 for p in f.getdata() if p[3]); a1 = sum(1 for p in c.getdata() if p[3]); cat = max(cat, a0 - a1)
        tam.paste(c, (i * W, 0))
    b = io.BytesIO(); tam.save(b, 'PNG', optimize=True)
    t = {k: v for k, v in d.items() if k not in ('tam', 'tam_n3', 'tam_n4', 'o_n3', 'o_n4', 'net_cao', 'net_cao_cua', 'ma', 'ten', 'net', 'vung')}
    t.update({'ma': 'hu-pl-' + ma[3:], 'ten': 'PixelLab · ' + d.get('ten', ma), 'net': N, 'vung': 'rung' if ma in Z1 else 'bien', 'thay_cho': ma,
              'tam': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()})
    print(ma, 'vfx', n, 'khung', chon, 'cat_px', cat, 'cu', ob, 'moi', nb, (dx, dy), '%.0fKB' % (len(b.getvalue()) / 1024))
    if ghi:
        json.dump(t, open(OUT + t['ma'] + '.sprite.json', 'w'), ensure_ascii=False, separators=(',', ':'))
        os.makedirs(SRCD, exist_ok=True); tam.save(SRCD + t['ma'] + '.png')
    return tam, olds
if __name__ == '__main__':
    ghi = '--ghi' in sys.argv
    for a in [a for a in sys.argv[1:] if a.startswith('hu-')]:
        ma, _, src = a.partition('=')
        src, _, ch = src.partition('@')
        tam, olds = dung(ma, src='vfx/' + src if src else None, chon=[int(x) for x in ch.split(',')] if ch else None, ghi=ghi)
        W = olds[0].width; s = Image.new('RGBA', (tam.width, tam.height * 2 + 4), (40, 40, 50, 255))
        for i, o in enumerate(olds): s.alpha_composite(o, (i * W, 0))
        s.alpha_composite(tam, (0, tam.height + 4)); os.makedirs('vfxso', exist_ok=True); s.save('vfxso/%s.png' % ma)
