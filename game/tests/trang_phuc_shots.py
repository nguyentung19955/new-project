"""Bảng tiếp xúc (contact sheet) trang phục: mỗi món mặc lên 4 em bé thân gốc ở 4 tư thế (đứng, chạy, đánh, lộn) + 1 lượt thân theo bộ.
Chạy từ thư mục gốc repo:  python3 -m http.server 8782 &   rồi
  python3 game/tests/trang_phuc_shots.py <thư mục ra> [tiền tố] [JS đặt cờ trước khi chụp]
Ra: <tiền tố>-<ô>.png (mỗi ô đồ một tấm, nén < 1 MB), <tiền tố>-bo.png (thân theo bộ), <tiền tố>-do.json (số đo từng món)."""
import os, sys, json, base64, io
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
PRE = sys.argv[2] if len(sys.argv) > 2 else 'tp'
CO = sys.argv[3] if len(sys.argv) > 3 else ''
os.makedirs(OUT, exist_ok=True)
URL = 'http://localhost:8782/game/dist/linh-khi.html?cloud=0'

# Vẽ một tấm: hàng = món, cột = 4 em bé x 4 tư thế. rows: [[nhãn, outfit], ...]
JS = r"""
async ([rows, S, tieuDe]) => {
  const keys = ['smith', 'hunter', 'healer', 'wrestler'];
  // đứng, chạy, lộn: cất vũ khí (vk: null) cho dễ nhìn đồ; đánh: cầm kiếm như trong trận
  const VK = { type: 'sword', family: 0, tier: 0, rarity: 0, stage: 0 };
  const poses = [['đứng', { weapon: null }], ['chạy', { move: true, t: 0.37, weapon: null }], ['đánh', { atk: 0.45, weapon: VK }], ['lộn', { dodge: 0.3, weapon: null }]];
  const CW = 56, CH = 60, LW = 74, TH = 22, cv = document.createElement('canvas');
  cv.width = (LW + CW * keys.length * poses.length) * S; cv.height = (TH + CH * rows.length) * S;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  c.fillStyle = '#26303a'; c.fillRect(0, 0, cv.width, cv.height);
  const sm = document.createElement('canvas'); sm.width = CW; sm.height = CH; const s = sm.getContext('2d'); s.imageSmoothingEnabled = false;
  c.fillStyle = '#fff'; c.font = 'bold ' + (7 * S) + 'px sans-serif'; c.fillText(tieuDe, 2 * S, 8 * S);
  c.font = (5.5 * S) + 'px sans-serif';
  keys.forEach((k, ki) => poses.forEach((p, j) => { const x = LW + (ki * poses.length + j) * CW; c.fillText(k + ' · ' + p[0], (x + 2) * S, 18 * S); }));
  rows.forEach((r, i) => {
    c.fillStyle = '#fff'; c.font = (6 * S) + 'px sans-serif';
    String(r[0]).split('|').forEach((ln, q) => c.fillText(ln, 2 * S, (TH + i * CH + 20 + q * 8) * S));
    keys.forEach((k, ki) => poses.forEach((p, j) => {
      s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, CW, CH);
      s.fillStyle = (ki + j + i) % 2 ? '#4a6b3c' : '#55744a'; s.fillRect(0, 0, CW, CH);
      s.fillStyle = 'rgba(255,255,255,0.25)'; s.fillRect(8, CH - 8 - 29, 1, 29); // vạch cao thân 29
      const of = Object.assign({}, r[1]);
      if (G.outfit && G.outfit.fxThanBo) of.fx = Object.assign({ els: [] }, G.outfit.fxThanBo(of), r[2] || {});
      const o = Object.assign({ x: 28, y: CH - 8, face: 1, key: k, move: false, t: 0.3, atk: -1, dodge: -1, helm: null, armor: null, outfit: of }, p[1]);
      try { G.art.hero(s, o); } catch (e) { s.fillStyle = 'red'; s.fillRect(0, 0, 10, 10); console.error(e); }
      c.drawImage(sm, (LW + (ki * poses.length + j) * CW) * S, (TH + i * CH) * S, CW * S, CH * S);
    }));
  });
  return cv.toDataURL('image/png');
}
"""

# Số đo: cỡ ảnh món so với đầu/thân, chỗ đặt ở 4 tư thế (datDo), mép dưới mũ so với mắt.
DO = r"""
() => {
  const SC = G.spriteCustom, out = {};
  const keys = ['smith', 'hunter', 'healer', 'wrestler'], dt = [['idle', 0], ['move', 2], ['atk', 2], ['dodge', 2]];
  for (const ma in SC.do) {
    if (!/^tp-/.test(ma)) continue;
    const sp = SC.do[ma], r = { rong: sp.rong, cao: sp.cao, net: sp.net || 1, khung: {} };
    for (const k of keys) for (const d of dt) {
      try {
        const p = SC.datDo(k, ma, d[0], d[1]), n = SC.diemNhanVat(k, d[0], d[1]);
        if (!p) continue;
        const e = { x: p.x, y: p.y, sx: p.sx, sy: p.sy, xoay: p.xoay, hien: p.hien, an: p.an, lop: p.lop, khong_khoac: p.khong_khoac };
        if (n && p.y != null) { e.mat = n.diem.mat; e.dinh = n.diem.dinh_dau; e.day = p.y + p.cao * p.sy; }
        r.khung[k + ':' + d[0]] = e;
      } catch (err) { r.khung[k + ':' + d[0]] = { loi: String(err) }; }
    }
    out[ma] = r;
  }
  // cỡ đầu, thân thật từng em bé (đo trên ảnh khung đứng 0)
  out._than = {};
  for (const k of keys) {
    const sp = SC.get('em-be-' + k), N = sp.net || 1, a = sp.dt.idle, cv = document.createElement('canvas'); cv.width = sp.fw * N; cv.height = sp.fh * N;
    const x = cv.getContext('2d'); x.drawImage(sp.img, 0, a.hang * sp.fh * N, sp.fw * N, sp.fh * N, 0, 0, sp.fw * N, sp.fh * N);
    const d = x.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
    let y0 = -1, y1 = -1; const rw = [];
    for (let y = 0; y < H; y++) { let a0 = -1, a1 = -1; for (let i = 0; i < W; i++) if (d[(y * W + i) * 4 + 3] > 127) { if (a0 < 0) a0 = i; a1 = i; } rw.push(a0 < 0 ? 0 : a1 - a0 + 1); if (a0 >= 0) { if (y0 < 0) y0 = y; y1 = y; } }
    const hh = Math.round((y1 - y0 + 1) * 0.45); let dr = 0; for (let y = y0; y < y0 + hh; y++) dr = Math.max(dr, rw[y]);
    out._than[k] = { cao: (y1 - y0 + 1) / N, dau_rong: dr / N, net: N };
  }
  return out;
}
"""

def nen(png_bytes, path):
    from PIL import Image
    im = Image.open(io.BytesIO(png_bytes)).convert('RGB')
    im.save(path, optimize=True)
    if os.path.getsize(path) > 1_000_000:
        im.quantize(colors=128, method=Image.Quantize.MEDIANCUT).save(path, optimize=True)
    if os.path.getsize(path) > 1_000_000:
        im = im.resize((im.width * 3 // 4, im.height * 3 // 4), Image.NEAREST)
        im.quantize(colors=96).save(path, optimize=True)

def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function("window.G && G.scene && G.spriteCustom && G.spriteCustom.ds && G.spriteCustom.ds['em-be-smith'] && G.spriteCustom.do && Object.keys(G.spriteCustom.do).filter(k => /^tp-/.test(k)).every(k => G.spriteCustom.do[k].ready !== false)", timeout=90000)
        pg.wait_for_timeout(1200)
        if CO:
            pg.evaluate(CO)
            pg.wait_for_timeout(300)
        L = pg.evaluate("() => { const L = G.heroLooks, I = G.outfit.ITEMS, ten = {}; for (const id in I) ten[I[id].slot + ':' + I[id].look] = I[id].name + (I[id].set ? ' (bộ ' + I[id].set + ')' : ''); const ds = {}; for (const o of ['hats','robes','backs','hands','masks','wings']) ds[o] = Object.keys(L[o]); return { ds, ten }; }")
        ten = L['ten']
        SLOT = {'hats': 'hat', 'robes': 'robe', 'backs': 'back', 'hands': 'hand', 'masks': 'mask', 'wings': 'wing'}
        S = 3
        for o, looks in L['ds'].items():
            rows = []
            for lk in looks:
                nm = ten.get(SLOT[o] + ':' + lk, '(đồ khởi đầu, code)')
                if o == 'wings':
                    for lv in (1, 2, 3):
                        rows.append(['%s cấp %d|%s' % (lk, lv, nm), {'wing': {'kind': lk, 'level': lv}}])
                else:
                    rows.append(['%s|%s' % (lk, nm), {SLOT[o]: lk}])
            for k0 in range(0, len(rows), 13):
                part = rows[k0:k0 + 13]
                d = pg.evaluate(JS, [part, S, 'Ô ' + o + (' (tiếp)' if k0 else '') + ' — mỗi món trên 4 em bé x 4 tư thế'])
                fn = '%s-%s%s.png' % (PRE, o, '-2' if k0 else '')
                nen(base64.b64decode(d.split(',')[1]), os.path.join(OUT, fn))
                print(fn, os.path.getsize(os.path.join(OUT, fn)))
        # thân theo bộ: áo bộ + từng món cùng bộ, và đủ bộ; thêm món khác bộ đội lên thân bộ
        B = [('rung', 'mu_sung', 'ao_vo_cay', 'gui_tre', 'bua_nanh', 'la'), ('bien', 'mu_vay_ca', 'ao_vay', 'khan_bang', 'bua_oc', 'bang'), ('lau', 'mu_tai_cao', 'ao_long', 'trong_nho', 'bua_lua', 'lua')]
        rows = []
        for bo, h, r, bk, hd, w in B:
            rows.append(['bộ %s: chỉ áo|%s' % (bo, r), {'robe': r}])
            rows.append(['bộ %s: đủ 4 món|+ cánh cấp 3' % bo, {'hat': h, 'robe': r, 'back': bk, 'hand': hd, 'wing': {'kind': w, 'level': 3}}])
            rows.append(['bộ %s + mũ khác bộ|mu_rom, ao_choang' % bo, {'hat': 'mu_rom', 'robe': r, 'back': 'ao_choang'}])
        d = pg.evaluate(JS, [rows, S, 'Thân theo bộ — áo bộ đổi thân, món cùng bộ ẩn, món khác bộ khoác rời'])
        nen(base64.b64decode(d.split(',')[1]), os.path.join(OUT, PRE + '-bo.png'))
        # áo lẻ + đủ món lẻ (như người chơi thật mặc)
        rows = [['đủ đồ lẻ 1|non_la ao_vai ao_choang', {'hat': 'non_la', 'robe': 'ao_vai', 'back': 'ao_choang', 'hand': 'bua_hut', 'rar': {'robe': 0}}],
                ['đủ đồ lẻ 2|khan_xep ao_the ong_ten', {'hat': 'khan_xep', 'robe': 'ao_the', 'back': 'ong_ten', 'hand': 'bua_linh', 'wing': {'kind': 'chuon', 'level': 2}, 'rar': {'robe': 2}}],
                ['đủ đồ lẻ 3|mu_da_ca giap_da ho_lo', {'hat': 'mu_da_ca', 'robe': 'giap_da', 'back': 'ho_lo', 'hand': 'bua_tan', 'wing': {'kind': 'lua', 'level': 3}, 'rar': {'robe': 3}}]]
        d = pg.evaluate(JS, [rows, S, 'Mặc đủ món lẻ (không phải bộ)'])
        nen(base64.b64decode(d.split(',')[1]), os.path.join(OUT, PRE + '-du-do.png'))
        so = pg.evaluate(DO)
        json.dump(so, open(os.path.join(OUT, PRE + '-do.json'), 'w'), ensure_ascii=False, indent=0)
        b.close()
    print('pageerror:', errs[:5] if errs else 'không có')

main()
