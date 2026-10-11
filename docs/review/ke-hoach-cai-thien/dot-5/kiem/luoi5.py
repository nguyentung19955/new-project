"""Đợt 5: lưới 7 hàng × từng em bé (mũ + đồ lưng + bùa + cánh + vũ khí quen tay), ảnh 16 bộ vũ khí, và bảng độ lệch vũ khí với tay.
python3 luoi5.py <cổng> <thư mục ra> [nhãn] [tệp ghép thêm ...]"""
from chung import *
PORT = int(sys.argv[1]); OUT = sys.argv[2]; NHAN = sys.argv[3] if len(sys.argv) > 3 else ''
Z = 4; WV, HV = 84, 66
DO = {
    'smith': ('sword', [['mu_sung', 2], ['gui_tre', 2], ['bua_nanh', 2], ['canh_la', 2, 2]], 'mũ sừng + gùi tre + bùa nanh + cánh lá + kiếm'),
    'hunter': ('bow', [['non_la', 1], ['ong_ten', 1], ['bua_hut', 1], ['canh_chuon', 1, 2]], 'nón lá + ống tên + bùa hút + cánh chuồn + cung'),
    'healer': ('spear', [['khan_xep', 1], ['ho_lo', 1], ['bua_linh', 1], ['canh_bang', 2, 2]], 'khăn xếp + hồ lô + bùa linh + cánh băng + giáo'),
    'wrestler': ('hammer', [['mu_rom', 1], ['gui_tre', 2], ['bua_lua', 2], ['canh_lua', 2, 2]], 'mũ rơm + gùi tre + bùa lửa + cánh lửa + búa'),
}
JS_LUOI = r"""
(a) => {
  const out = {};
  for (const key in a.doo) {
    const D = K.dung(key, a.doo[key][0], a.doo[key][1]), rows = [];
    for (const ten of a.rows) { const n = D.sp.dt[ten].so, cells = []; for (let i = 0; i < n; i++) cells.push(K.ve5(D, ten, i, {}, a.cfg)); rows.push(cells); }
    out[key] = { rows, look: [D.look.hat, D.look.back, D.look.hand, D.look.wing && D.look.wing.kind], than: D.sp.ma, ghep: !!G.spriteCustom.ghep[key] };
  }
  return out;
}
"""
JS_VK = r"""
(a) => {
  const out = { anh: {}, lech: {} };
  for (const key of a.keys) for (const vk of a.vk) {
    const D = K.dung(key, vk, []), k = key + '|' + vk;
    out.anh[k] = [['tele', 3, {}], ['atk', 0, {}], ['atk', 1, {}], ['atk', 3, {}], ['hit', 0, {}]].map((q) => K.ve5(D, q[0], q[1], Object.assign({ tran: 1 }, q[2]), a.cfg));
    const L = { tele: 0, atk01: 0, atk25: 0, hit: 0 }, mx = (n, v) => { if (v != null && v > L[n]) L[n] = v; };
    for (const c of [0, 0.25, 0.5, 0.75, 1]) mx('tele', K.lechTay(D, vk, 'tele', 3, { charge: c }));
    for (let i = 0; i < 6; i++) for (const cb of [0, 1, 2]) for (const u of [0.1, 0.3, 0.5, 0.7, 0.9]) for (const aim of [null, -45, 45]) mx(i < 2 ? 'atk01' : 'atk25', K.lechTay(D, vk, 'atk', i, { combo: cb, u, aim }));
    for (let i = 0; i < 4; i++) mx('hit', K.lechTay(D, vk, 'hit', i, {}));
    for (const n in L) L[n] = Math.round(L[n] * 100) / 100;
    out.lech[k] = L;
  }
  return out;
}
"""
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []; pg = page(b, PORT, errs)
    for f in sys.argv[4:]:
        pg.evaluate("(t) => { G.spriteCustom.add(JSON.parse(t)); }", open(f, encoding='utf-8').read())
    if os.environ.get('DIEM'): pg.evaluate('(d) => { K.diemNgoai = d; }', json.load(open(os.environ['DIEM'])))
    cfg = {'W': W, 'H': H, 'FX': FX, 'FY': FY, 'Z': Z}
    R = pg.evaluate(JS_LUOI, {'doo': DO, 'rows': ROWS, 'cfg': cfg})
    V = pg.evaluate(JS_VK, {'keys': KEYS, 'vk': VK, 'cfg': {'W': WV, 'H': HV, 'FX': 34, 'FY': 54, 'Z': 3}}); b.close()
print('lỗi trang:', errs[:5])
cw, ch, pad, lw, top = W * Z, H * Z, 6, 130, 60
for key, r in R.items():
    cols = 8
    im = Image.new('RGB', (lw + cols * (cw + pad) + pad, top + len(ROWS) * (ch + pad) + pad), (24, 34, 36)); d = ImageDraw.Draw(im)
    d.text((pad, 8), '%s (thân AI %s) · %s · 7 hàng động tác, từng khung%s' % (TEN_BE[key], r['than'], DO[key][2], ' · ' + NHAN if NHAN else ''), fill=(246, 220, 146), font=font(17))
    d.text((pad, 32), 'Mỗi ô %d×%d điểm ảnh game, phóng %d lần. Vạch ngang mờ là mặt đất. Hàng hit: thân chớp trắng là hiệu ứng trúng đòn. Hàng tele: game chỉ dùng khung cuối.' % (W, H, Z), fill=(169, 194, 180), font=font(12))
    for ri, cells in enumerate(r['rows']):
        y = top + ri * (ch + pad) + pad
        d.text((pad, y + ch // 2 - 8), TEN_HANG[ROWS[ri]], fill=(241, 230, 198), font=font(13))
        for ci, c in enumerate(cells):
            x = lw + ci * (cw + pad) + pad
            d.rectangle([x, y, x + cw - 1, y + ch - 1], fill=(43, 58, 46)); d.line([x, y + FY * Z, x + cw - 1, y + FY * Z], fill=(60, 80, 64))
            t = img(c); im.paste(t, (x, y), t); d.text((x + 3, y + 2), str(ci), fill=(150, 170, 160), font=font(11))
    im.save('%s/ghep-%s-7-hang.png' % (OUT, key)); print(key, r['look'], 'có tệp ghép:', r['ghep'])
# 16 bộ vũ khí
Zv = 3; cw, ch = WV * Zv, HV * Zv
im = Image.new('RGB', (10 + 2 * (5 * (cw + 2) + 14), 34 + 8 * (ch + 22)), (24, 34, 36)); d = ImageDraw.Draw(im)
d.text((6, 6), '16 bộ vũ khí × em bé (thân trần). Mỗi bộ 5 ô: lấy đà (khung cuối), đánh khung 0, 1, 3, trúng đòn khung 0' + (' · ' + NHAN if NHAN else ''), fill=(246, 220, 146), font=font(16))
for ki, key in enumerate(KEYS):
    for vi, vk in enumerate(VK):
        x0 = 10 + (vi % 2) * (5 * (cw + 2) + 14); y0 = 50 + (ki * 2 + vi // 2) * (ch + 22)
        L = V['lech'][key + '|' + vk]
        d.text((x0, y0 - 16), '%s · %s · vũ khí lệch khỏi tay nhiều nhất (điểm ảnh game): lấy đà %.1f · đánh 0-1 %.1f · đánh 2-5 %.1f · trúng đòn %.1f' % (TEN_BE[key], TEN_VK[vk], L['tele'], L['atk01'], L['atk25'], L['hit']), fill=(200, 220, 210), font=font(12))
        for ci, c in enumerate(V['anh'][key + '|' + vk]):
            x = x0 + ci * (cw + 2); d.rectangle([x, y0, x + cw - 1, y0 + ch - 1], fill=(43, 58, 46)); t = img(c); im.paste(t, (x, y0), t)
im.save(OUT + '/vu-khi-16.png')
json.dump(V['lech'], open(OUT + '/lech-tay.json', 'w'), indent=1)
dat = sum(1 for v in V['lech'].values() if max(v['tele'], v['atk01'], v['hit']) <= 1.0)
print('độ lệch tay:'); [print(' ', k, v) for k, v in V['lech'].items()]
print('bộ đạt (tele, atk 0-1, hit đều ≤ 1):', dat, '/ 16')
