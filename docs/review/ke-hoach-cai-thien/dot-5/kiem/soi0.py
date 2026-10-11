"""Soi hiện trạng: mỗi em bé × mỗi vũ khí: tele (4 mức đà, khung cuối), hit 0..3, atk 0..5 × 3 kiểu chém. Thân trần. python3 soi0.py <cổng> <thư mục ra> [Z]"""
from chung import *
PORT = int(sys.argv[1]); OUT = sys.argv[2]; Z = int(sys.argv[3]) if len(sys.argv) > 3 else 4
JS = r"""
(a) => {
  const out = {};
  for (const key of a.keys) for (const vk of a.vk) {
    const D = K.dung(key, vk, []), cfg = a.cfg, rows = [];
    rows.push(['idle 0,3 · move 0,2,4', [K.ve5(D, 'idle', 0, { tran: 1 }, cfg), K.ve5(D, 'idle', 3, { tran: 1 }, cfg), K.ve5(D, 'move', 0, { tran: 1 }, cfg), K.ve5(D, 'move', 2, { tran: 1 }, cfg), K.ve5(D, 'move', 4, { tran: 1 }, cfg)]]);
    rows.push(['tele:3 đà 0, .5, 1 · hit 0..3', [0, 0.5, 1].map((c) => K.ve5(D, 'tele', 3, { tran: 1, charge: c }, cfg)).concat([0, 1, 2, 3].map((i) => K.ve5(D, 'hit', i, { tran: 1 }, cfg)))]);
    for (const cb of [0, 1, 2]) rows.push(['atk kiểu ' + cb + ' (u .25, .75 mỗi khung)', [0, 1, 2, 3, 4, 5].flatMap((i) => [0.25, 0.75].map((u) => K.ve5(D, 'atk', i, { tran: 1, combo: cb, u }, cfg)))]);
    out[key + '|' + vk] = rows;
  }
  return out;
}
"""
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []; pg = page(b, PORT, errs)
    for f in sys.argv[4:]:
        pg.evaluate("(t) => { G.spriteCustom.add(JSON.parse(t)); }", open(f, encoding='utf-8').read())
    r = pg.evaluate(JS, {'keys': KEYS, 'vk': VK, 'cfg': {'W': W, 'H': H, 'FX': FX, 'FY': FY, 'Z': Z}}); b.close()
print('lỗi trang:', errs[:5])
cw, ch, pad, top = W * Z, H * Z, 4, 20
for k, rows in r.items():
    cols = max(len(x[1]) for x in rows)
    im = Image.new('RGB', (cols * (cw + pad) + pad, len(rows) * (ch + pad + top) + pad), (24, 34, 36)); d = ImageDraw.Draw(im)
    for ri, (ten, cells) in enumerate(rows):
        y = ri * (ch + pad + top) + pad
        d.text((pad, y), k + ' · ' + ten, fill=(241, 230, 198), font=font(12))
        for ci, c in enumerate(cells):
            x = ci * (cw + pad) + pad
            d.rectangle([x, y + top, x + cw - 1, y + top + ch - 1], fill=(43, 58, 46)); d.line([x, y + top + FY * Z, x + cw - 1, y + top + FY * Z], fill=(60, 80, 64))
            t = img(c); im.paste(t, (x, y + top), t)
    im.save('%s/%s.png' % (OUT, k.replace('|', '-')))
