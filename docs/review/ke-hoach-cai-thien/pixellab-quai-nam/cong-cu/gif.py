"""GIF soát từng động tác (phóng ×3, NEAREST): đứng → động tác → đứng, cắt đúng từ tấm trong game/art/custom (đúng thứ game vẽ).
Vạch đỏ mảnh = điểm neo chân (goc) để soát chân không trượt / hình không lệch giữa các khung. Kèm tấm tổng quan tam-<mã>-x2.png."""
import base64, io, json, os, sys
from PIL import Image, ImageDraw
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'anh')
os.makedirs(OUT, exist_ok=True)
NEN = (58, 86, 52, 255)
for ma in ('thorncapGoblin', 'sporePuff', 'toadstoolKing'):
    t = json.load(open(os.path.join(GOC, 'game', 'art', 'custom', ma + '.sprite.json')))
    tam = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',')[1]))).convert('RGBA')
    n = t['net']; fw, fh = t['khung_rong'] * n, t['khung_cao'] * n; ax, ay = t['goc'][0] * n, t['goc'][1] * n
    def o(h, i, k=3):
        im = Image.new('RGBA', (fw, fh), NEN); im.alpha_composite(tam.crop((i * fw, h * fh, (i + 1) * fw, (h + 1) * fh)))
        d = ImageDraw.Draw(im); d.line((ax - 6, ay, ax + 6, ay), fill=(220, 40, 40, 255)); d.line((ax, ay - 2, ax, ay + 2), fill=(220, 40, 40, 255))
        return im.resize((fw * k, fh * k), Image.NEAREST)
    dt = t['dong_tac']; idle = dt['idle']
    for ten, a in dt.items():
        ds, ms = [], []
        if ten not in ('idle',):
            ds.append(o(idle['hang'], 0)); ms.append(400)
        lap = 2 if a.get('lap') else 1
        for _ in range(lap):
            for i in range(a['so']):
                ds.append(o(a['hang'], i)); ms.append(max(40, int(a['giay'] * 1000 / a['so'])))
        if ten == 'die':
            ms[-1] = 900
        elif ten != 'idle':
            ds.append(o(idle['hang'], 0)); ms.append(400)
        ds = [d.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=255) for d in ds]
        ds[0].save(os.path.join(OUT, 'gif-%s-%s.gif' % (ma, ten)), save_all=True, append_images=ds[1:], duration=ms, loop=0, disposal=2)
    # tổng quan
    S = Image.new('RGBA', tam.size, NEN); S.alpha_composite(tam)
    d = ImageDraw.Draw(S)
    for h in range(tam.height // fh):
        for i in range(tam.width // fw):
            d.rectangle((i * fw, h * fh, (i + 1) * fw - 1, (h + 1) * fh - 1), outline=(80, 110, 74, 255))
            d.line((i * fw + ax - 4, h * fh + ay, i * fw + ax + 4, h * fh + ay), fill=(220, 40, 40, 255))
    S.resize((S.width * 2, S.height * 2), Image.NEAREST).convert('RGB').save(os.path.join(OUT, 'tam-%s-x2.png' % ma))
    print(ma, list(dt))
