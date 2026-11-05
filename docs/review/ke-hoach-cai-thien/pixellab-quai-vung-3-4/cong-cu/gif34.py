"""GIF xem trước từng hàng của tấm quái trong game (phóng ×3 NEAREST, nền xám, ảnh đứng → hàng → ảnh đứng; đọc thẳng tệp game).
  python3 gif34.py <thư mục ra> <mã tấm> ...      → gif-<tên PixelLab>-<hàng>.gif"""
import base64, io, json, os, sys
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
for ma in sys.argv[2:]:
    d = json.load(open(os.path.join(ROOT, 'game', 'art', 'custom', ma + '.sprite.json'), encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
    n = d['net']; fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    def k(h, i):
        bg = Image.new('RGBA', (fw, fh), (74, 70, 82, 255)); bg.alpha_composite(im.crop((i * fw, h * fh, (i + 1) * fw, (h + 1) * fh)))
        return bg.convert('RGB').resize((fw * 3, fh * 3), Image.NEAREST)
    dung = k(d['dong_tac']['idle']['hang'], 0)
    for ten, a in d['dong_tac'].items():
        fs = [k(a['hang'], i) for i in range(a['so'])]
        dt = max(60, int(a['giay'] * 1000 / a['so']))
        seq = fs * (2 if a.get('lap') else 1) if ten.startswith(('idle', 'move')) else [dung] + fs + [dung]
        du = [dt] * len(seq)
        if not ten.startswith(('idle', 'move')): du[0] = du[-1] = 400
        seq[0].save(os.path.join(OUT, 'gif-%s-%s.gif' % (d.get('ten_pl') or ma, ten)), save_all=True, append_images=seq[1:], duration=du, loop=0)
    print(ma, len(d['dong_tac']), 'GIF')
