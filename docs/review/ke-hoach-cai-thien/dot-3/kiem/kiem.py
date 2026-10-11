"""Đợt 3: (D) bản mới không có tệp mới = bản cũ từng điểm ảnh; (C) chỉ số không đổi; (B) mô phỏng thân theo bộ. python3 kiem.py <thư mục ra>"""
import base64, io, json, os, sys, hashlib
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = '/home/claude/new-project'; OUT = sys.argv[1]
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font = lambda n: ImageFont.truetype(FONT, n)
img = lambda data: Image.open(io.BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGBA')
ROWS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne']
CFG = {
    'khong-do': [],
    'mu+lung (rung)': [['mu_sung', 2], ['gui_tre', 2]],
    'du-bo-rung-5-mon': [['mu_sung', 2], ['ao_vo_cay', 2], ['gui_tre', 2], ['bua_nanh', 2], ['canh_la', 2, 2]],
    'chi-ao-bien': [['ao_vay', 3]],
    'do-le': [['mu_rom', 1], ['ao_vai', 0], ['ho_lo', 1], ['bua_hut', 1]],
    '3-mon-rung-khong-ao': [['mu_sung', 2], ['gui_tre', 2], ['bua_nanh', 2]],
}
JS_ALL = r"""
(a) => {
  const SC = G.spriteCustom, O = G.outfit, out = {};
  if (a.boGhep) SC.remove('ghep-smith');
  for (const key of a.keys) for (const cf in a.cfg) {
    G.testSave({ hero: key, lvl: 12, tier: 2, melee: 'sword' }); K.wear(a.cfg[cf]);
    const sv = G.save, look = O.look(sv), w0 = sv.weapons.find((w) => w.id === sv.carry[0]), weapon = Object.assign({}, w0, { coat: null });
    const sp = SC.cuaEmBe(key, { key, outfit: look });
    const P = G.buildPlayer(); const so = {};
    for (const k in P) { const v = P[k]; if (typeof v === 'number' || typeof v === 'boolean' || v === null) so[k] = v; else if (k === 'resist' || k === 'elBonus' || k === 'st') so[k] = JSON.stringify(v); }
    so.sum = JSON.stringify(O.sum(sv).stats);
    const cells = [];
    for (const ten of a.rows) { const n = sp.dt[ten].so; for (let i = 0; i < n; i++) {
      const o = K.args(ten, i, n, sp, look, weapon, key); o.__khung = { ten, i, u: (i + 0.5) / n };
      cells.push(K.png(K.cell(o, 56, 52, 26, 46, 2, null)));
    } }
    out[key + '|' + cf] = { than: sp.ma, so, cells, fx: { aura: look.fx.aura, glow: look.fx.glow } };
  }
  return out;
}
"""
JS_BO = r"""
(a) => {
  const SC = G.spriteCustom, O = G.outfit, out = [];
  if (!a.than) SC.remove('em-be-smith-rung');
  const coTep = !!SC.get('em-be-smith-rung');
  for (const b of a.buoc) {
    G.testSave({ hero: 'smith', lvl: 12, tier: 2, melee: 'sword' }); K.wear(b.mac);
    const sv = G.save, look = O.look(sv), w0 = sv.weapons.find((w) => w.id === sv.carry[0]), weapon = Object.assign({}, w0, { coat: null });
    const sp = SC.cuaEmBe('smith', { key: 'smith', outfit: look });
    const P = G.buildPlayer(); const so = {};
    for (const k in P) { const v = P[k]; if (typeof v === 'number' || typeof v === 'boolean' || v === null) so[k] = v; }
    so.sum = JSON.stringify(O.sum(sv).stats);
    const pngs = [];
    let an = null, lop = null;
    for (const [ten, i] of [['idle', 0], ['move', 2], ['atk', 3]]) { const n = sp.dt[ten].so, o = K.args(ten, i, n, sp, look, weapon, 'smith'); o.__khung = { ten, i, u: (i + 0.5) / n }; pngs.push(K.png(K.cell(o, 56, 52, 26, 46, 4, null))); if (ten === 'idle') { an = K.lop && K.lop.an; lop = K.lop && { sau: !K.lop.r.sau.trong, truoc: !K.lop.r.truoc.trong }; } }
    out.push({ ten: b.ten, than: sp.ma, fx: look.fx, an, lop, so, pngs, wear: JSON.stringify(sv.outfit.wear) });
  }
  SC.remove('em-be-smith-rung');
  return out;
}
"""
BUOC = [
    {'ten': '1. Chưa mặc áo\nmũ + gùi bộ Rừng', 'mac': [['mu_sung', 2], ['gui_tre', 2]]},
    {'ten': '2. Chỉ mặc ÁO\nbộ Rừng', 'mac': [['ao_vo_cay', 2]]},
    {'ten': '3. Áo Rừng\n+ mũ rơm (khác bộ)', 'mac': [['ao_vo_cay', 2], ['mu_rom', 1]]},
    {'ten': '4. Áo Rừng\n+ mũ sừng (cùng bộ)', 'mac': [['ao_vo_cay', 2], ['mu_sung', 2]]},
    {'ten': '5. Áo Rừng + hồ lô,\nbùa hút (khác bộ)\n+ cánh lá', 'mac': [['ao_vo_cay', 2], ['ho_lo', 1], ['bua_hut', 1], ['canh_la', 2, 2]]},
    {'ten': '6. Đủ 5 món\nbộ Rừng', 'mac': [['mu_sung', 2], ['ao_vo_cay', 2], ['gui_tre', 2], ['bua_nanh', 2], ['canh_la', 2, 2]]},
    {'ten': '7. Tháo áo, còn\nmũ+gùi+bùa Rừng', 'mac': [['mu_sung', 2], ['gui_tre', 2], ['bua_nanh', 2]]},
    {'ten': '8. Áo Biển (bộ khác,\nchưa có tệp thân)\n+ mũ sừng', 'mac': [['ao_vay', 2], ['mu_sung', 2]]},
]


def than_tam():
    """Thân mô phỏng: nhân bản em-be-smith, tô quần áo/da ngả xanh lá để nhìn ra là thân khác. Chỉ đưa vào trang thử, KHÔNG ghi vào repo."""
    t = json.load(open(REPO + '/game/art/custom/em-be-smith.sprite.json'))
    im = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and r > 150 and r > g * 1.4: px[x, y] = (int(r * 0.45), int(min(255, g * 1.25 + 40)), int(b * 0.6), a)  # da đỏ -> áo xanh lá
    bio = io.BytesIO(); im.save(bio, 'PNG')
    t['tam'] = 'data:image/png;base64,' + base64.b64encode(bio.getvalue()).decode(); t['ma'] = 'em-be-smith-rung'; t['ten'] = 'Thợ Rèn · Bộ Rừng Già (MÔ PHỎNG)'
    return t


def page(b, port):
    pg = b.new_context(viewport={'width': 960, 'height': 540}).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:%d/linh-khi.html?cloud=0' % port); pg.wait_for_timeout(1500)
    pg.add_script_tag(path=REPO + '/game/tests/setup.js'); pg.evaluate(open(HERE + '/lib.js', encoding='utf-8').read())
    return pg, errs


def main():
    os.makedirs(OUT, exist_ok=True); kq = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        moi, e1 = page(b, 8801); cu, e2 = page(b, 8802)
        arg = {'keys': ['smith', 'hunter', 'healer', 'wrestler'], 'cfg': CFG, 'rows': ROWS}
        A = cu.evaluate(JS_ALL, dict(arg, boGhep=False)); B = moi.evaluate(JS_ALL, dict(arg, boGhep=True))
        # (D) + (C)
        tong = khac = 0; so_khac = []
        for k in A:
            for i, (x, y) in enumerate(zip(A[k]['cells'], B[k]['cells'])):
                tong += 1
                if x != y: khac += 1
            sa, sb = A[k]['so'], B[k]['so']
            if sa != sb: so_khac.append((k, {q: (sa.get(q), sb.get(q)) for q in set(sa) | set(sb) if sa.get(q) != sb.get(q)}))
            if A[k]['than'] != B[k]['than'] or A[k]['fx'] != B[k]['fx']: so_khac.append((k, 'than/fx', A[k]['than'], B[k]['than'], A[k]['fx'], B[k]['fx']))
        kq['D'] = {'so_o': tong, 'o_khac': khac}; kq['C_cu_moi'] = {'so_cau_hinh': len(A), 'khac': so_khac}
        kq['chi_so_mau'] = {k: B[k]['so'] for k in ('smith|khong-do', 'smith|chi-ao-bien', 'smith|du-bo-rung-5-mon')}
        print('(D) ô so:', tong, 'ô khác:', khac, '| (C) cấu hình:', len(A), 'chỉ số khác:', so_khac)
        # (B) mô phỏng
        moi.evaluate("() => { try { G.spriteCustom.add(%s); } catch (e) {} }" % json.dumps(json.load(open(REPO + '/game/art/custom/ghep-smith.sprite.json'))))
        moi.evaluate('(t) => { G.spriteCustom.add(t); }', than_tam()); moi.wait_for_timeout(800)
        print('thân mô phỏng đã nạp:', moi.evaluate("() => { const s = G.spriteCustom.get('em-be-smith-rung'); return s ? [s.ma, s.bo, !!s.img] : null; }"))
        co = moi.evaluate(JS_BO, {'than': True, 'buoc': BUOC}); kh = moi.evaluate(JS_BO, {'than': None, 'buoc': BUOC})
        b.close()
    print('lỗi trang:', e1[:3], e2[:3])
    for ten, R in (('co-tep-than-bo', co), ('khong-co-tep (du-phong)', kh)):
        print('==', ten)
        for r in R: print(' ', r['ten'].replace('\n', ' '), '| thân:', r['than'], '| bo_than:', r['fx'].get('bo_than'), '| du_bo:', r['fx'].get('du_bo'), '| aura:', r['fx'].get('aura'), '| an_bo:', r['fx'].get('an_bo'), '| ẩn khi vẽ:', r['an'], '| lớp:', r['lop'])
    kq['B'] = {t: [{k: v for k, v in r.items() if k != 'pngs'} for r in R] for t, R in (('co_tep', co), ('khong_tep', kh))}
    kq['C_than_bo'] = all(x['so'] == y['so'] for x, y in zip(co, kh))
    print('(C) chỉ số có thân bộ = không có thân bộ:', kq['C_than_bo'])
    json.dump(kq, open(OUT + '/ket-qua.json', 'w'), ensure_ascii=False, indent=1)
    # ảnh từng bước
    cw, ch, pad, lw, top = 56 * 4, 52 * 4, 6, 190, 70
    for ten, R, tit in (('mo-phong-than-bo.png', co, 'CÓ tệp thân bộ (mô phỏng: thân Cu Tí tô xanh lá, KHÔNG nằm trong game)'), ('du-phong-khong-tep.png', kh, 'KHÔNG có tệp thân bộ (đúng như game hôm nay): về thân gốc + đồ rời')):
        im = Image.new('RGB', (lw + 3 * (cw + pad) + pad + 330, top + len(R) * (ch + pad) + pad), (24, 34, 36)); d = ImageDraw.Draw(im)
        d.text((pad, 8), 'Đợt 3 · áo chọn thân · ' + tit, fill=(246, 220, 146), font=font(15))
        for c, t in enumerate(['đứng', 'chạy', 'đánh']): d.text((lw + c * (cw + pad) + pad + 4, top - 18), t, fill=(200, 220, 210), font=font(12))
        for ri, r in enumerate(R):
            y = top + ri * (ch + pad) + pad
            for k, line in enumerate(r['ten'].split('\n')): d.text((pad, y + 60 + k * 17), line, fill=(241, 230, 198), font=font(13))
            for c, pn in enumerate(r['pngs']):
                x = lw + c * (cw + pad) + pad; d.rectangle([x, y, x + cw - 1, y + ch - 1], fill=(43, 58, 46)); ci = img(pn); im.paste(ci, (x, y), ci)
            x = lw + 3 * (cw + pad) + pad + 6
            for k, line in enumerate(['thân: ' + r['than'], 'bộ của áo (bo_than): ' + str(r['fx'].get('bo_than')), 'đủ bộ ≥3 món (du_bo): ' + str(r['fx'].get('du_bo')), 'lớp rời bị ẩn: ' + (', '.join(r['an']) if r['an'] else 'không'), 'máu ' + str(r['so']['maxhp']) + ' · giảm ST ' + str(round(r['so']['dr'], 3))]):
                d.text((x, y + 40 + k * 20), line, fill=(169, 214, 190) if k else (255, 255, 255), font=font(13))
        im.save(OUT + '/' + ten)


main()
