"""Lấy số game tự đo cho 4 em bé (không dùng tệp ghép): điểm khung xương ở idle:0, độ dời đầu / thân từng khung (SC.khopEmBe). python3 layso.py <cổng> <tệp ra>"""
from chung import *
JS = r"""
(keys) => {
  const SC = G.spriteCustom, out = {};
  for (const k of keys) SC.remove('ghep-' + k);
  for (const key of keys) {
    const sp = SC.cuaEmBe(key, { key }), r = { neo: sp.neo && sp.neo.goc, diem0: SC.diemNhanVat(key, 'idle', 0).diem, khop: {} };
    for (const ten of ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne']) for (let i = 0; i < sp.dt[ten].so; i++) r.khop[ten + ':' + i] = SC.khopEmBe(sp, ten, i);
    out[key] = r;
  }
  return out;
}
"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = page(b, int(sys.argv[1])); r = pg.evaluate(JS, KEYS); b.close()
json.dump(r, open(sys.argv[2], 'w'), indent=1)
for k in r:
    print(k, r[k]['neo'], {n: r[k]['diem0'][n] for n in ('dinh_dau', 'lung', 'goc_canh', 'eo', 'tay_truoc')})
    print('  ', {f: (v and v.get('dau')) for f, v in r[k]['khop'].items() if f.split(':')[0] in ('move', 'tele', 'atk', 'hit')})
