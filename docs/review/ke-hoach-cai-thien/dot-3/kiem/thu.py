"""Đợt 3: lưới 8 hàng Cu Tí (mũ + đồ lưng + kiếm) và số đo lệch. Chạy: python3 thu.py <cổng> <thư mục ra> [tệp ghep json]"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = '/home/claude/new-project'
PORT = sys.argv[1]
OUT = sys.argv[2]
GHEP = sys.argv[3] if len(sys.argv) > 3 else None
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
ROWS = ['idle', 'move', 'tele', 'atk', 'hit', 'die', 'ne', 'noi']
TEN = {'idle': 'idle · đứng', 'move': 'move · chạy', 'tele': 'tele · lấy đà', 'atk': 'atk · đánh', 'hit': 'hit · trúng đòn', 'die': 'die · ngã', 'ne': 'ne · lăn', 'noi': 'noi · (không có,\ngame dùng idle)'}
W, H, FX, FY, Z = 56, 52, 26, 46, 4


def font(n):
    return ImageFont.truetype(FONT, n)


def img(data):
    return Image.open(io.BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGBA')


JS_GRID = r"""
(cfg) => {
  const SC = G.spriteCustom, O = G.outfit, sv = G.save;
  const look = O.look(sv);
  const w0 = sv.weapons.find((w) => w.id === sv.carry[0]);
  const weapon = cfg.vk ? Object.assign({}, w0, { coat: null }) : null;
  const out = { rows: [], look: { hat: look.hat, robe: look.robe, back: look.back, hand: look.hand, wing: look.wing, fx: look.fx }, wear: sv.outfit.wear, vk: weapon && { type: weapon.type, family: weapon.family, rarity: weapon.rarity } };
  for (const ten of cfg.rows) {
    const o0 = { key: 'smith', outfit: look };
    const sp = SC.cuaEmBe('smith', o0);
    out.than = sp.ma;
    const co = !!sp.dt[ten], a = sp.dt[ten] || sp.dt.idle, n = a.so, row = { ten, co, n, cells: [] };
    for (let i = 0; i < n; i++) {
      const mk = (lk, wp) => { const o = K.args(ten, i, n, sp, lk, wp); const tn = K.chon0.call(SC, sp, o); o.__khung = { ten: co ? ten : 'idle', i, u: (i + 0.5) / n }; return { o, tn }; };
      const A = mk(look, weapon);
      const cv = K.cell(A.o, cfg.W, cfg.H, cfg.FX, cfg.FY, cfg.Z, null);
      const lop = K.lop;
      const cell = { i, png: K.png(cv), tuNhien: A.tn, khop: lop && lop.khop, an: lop && lop.an, of: lop && { hat: lop.of.hat, back: lop.of.back, wing: lop.of.wing && lop.of.wing.kind } };
      cell.sau = lop ? K.hopLop(lop.r.sau) : null; cell.truoc = lop ? K.hopLop(lop.r.truoc) : null;
      // từng món riêng: chỉ mũ, chỉ đồ lưng (để đo hộp bao của từng món)
      for (const k of ['hat', 'back', 'wing']) {
        if (!look[k]) continue;
        const lk = { rar: look.rar, fx: look.fx, hat: null, robe: null, back: null, hand: null, wing: null }; lk[k] = look[k];
        const B = mk(lk, null); K.cell(B.o, cfg.W, cfg.H, cfg.FX, cfg.FY, 1, null);
        const l2 = K.lop; cell[k] = l2 ? { sau: K.hopLop(l2.r.sau), truoc: K.hopLop(l2.r.truoc) } : null;
      }
      // thân trần (không đồ, không vũ khí) nét 2 để đo đầu, và có vũ khí để đo kiếm
      const C = mk({ rar: {}, fx: { glow: null, els: [], aura: null }, hat: null, robe: null, back: null, hand: null, wing: null }, null);
      const cb = K.cell(C.o, cfg.W, cfg.H, cfg.FX, cfg.FY, 2, null);
      cell.than = K.png(cb);
      { const o = K.args('idle', 0, 6, sp, C.o.outfit, null); o.t = 0; o.__khung = { ten: co ? ten : 'idle', i, u: (i + 0.5) / n }; cell.sach = K.png(K.cell(o, cfg.W, cfg.H, cfg.FX, cfg.FY, 2, null)); }
      if (weapon) { const D = mk({ rar: {}, fx: { glow: null, els: [], aura: null }, hat: null, robe: null, back: null, hand: null, wing: null }, weapon); cell.thanVk = K.png(K.cell(D.o, cfg.W, cfg.H, cfg.FX, cfg.FY, 2, null)); }
      row.cells.push(cell);
    }
    out.rows.push(row);
  }
  return out;
}
"""


def head(mask_img):
    """Đầu trên thân trần (ảnh nét 2): hàng trên cùng và tâm ngang của 40% phía trên. Trả về (x, y_top) theo điểm ảnh game, gốc ở chân."""
    a = mask_img.split()[3].load(); w, h = mask_img.size
    ys = [y for y in range(h) if any(a[x, y] > 40 for x in range(w))]
    if not ys:
        return None
    y0, y1 = ys[0], ys[-1]
    yc = y0 + int(0.4 * (y1 - y0 + 1))
    sx = n = 0
    for y in range(y0, yc):
        for x in range(w):
            if a[x, y] > 40:
                sx += x + 0.5; n += 1
    return (sx / n / 2 - FX, y0 / 2 - FY, (y1 + 1) / 2 - FY)


def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 960, 'height': 540})
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
        url = 'http://localhost:%s/linh-khi.html?cloud=0' % PORT
        pg.goto(url); pg.wait_for_timeout(1500)
        pg.add_script_tag(path=os.path.join(REPO, 'game', 'tests', 'setup.js'))
        ev = pg.evaluate
        ev(open(os.path.join(HERE, 'lib.js'), encoding='utf-8').read())
        # BẢN LƯU THỬ: Cu Tí, kiếm bậc Tím, mũ sừng gỗ + gùi tre (ảnh AI), ghi qua đường lưu thật rồi mở lại game
        ev("""() => { G.testSave({ hero: 'smith', lvl: 12, tier: 2, melee: 'sword' }); K.wear(%s); G.persist(); }""" % os.environ.get('WEAR', "[['mu_sung', 2], ['gui_tre', 2]]"))
        raw = ev("() => localStorage.getItem('linhkhi_save_v1')")
        open(os.path.join(OUT, 'ban-luu-thu.json'), 'w').write(raw)
        pg.goto(url); pg.wait_for_timeout(1500)
        ev(open(os.path.join(HERE, 'lib.js'), encoding='utf-8').read())
        print('wear sau khi mở lại:', ev("() => JSON.stringify(G.save.outfit.wear) + ' hero=' + G.save.hero"))
        if GHEP:
            ev("(t) => { G.spriteCustom.add(JSON.parse(t)); }", open(GHEP, encoding='utf-8').read())
        r = ev(JS_GRID, {'rows': ROWS, 'W': W, 'H': H, 'FX': FX, 'FY': FY, 'Z': Z, 'vk': True})
        b.close()
    print('thân:', r['than'], 'look:', json.dumps(r['look'], ensure_ascii=False), 'vk:', r['vk'])
    # ---- lưới ----
    cols = max(x['n'] for x in r['rows']); lw, pad, top = 150, 6, 64
    cw, ch = W * Z, H * Z
    im = Image.new('RGB', (lw + cols * (cw + pad) + pad, top + len(ROWS) * (ch + pad) + pad), (24, 34, 36))
    d = ImageDraw.Draw(im)
    d.text((pad, 8), 'Cu Tí (thân AI em-be-smith) · mũ sừng gỗ + gùi tre + kiếm · 8 hàng động tác, từng khung' + (' · ' + os.environ.get('NHAN', '')), fill=(246, 220, 146), font=font(18))
    d.text((pad, 34), 'Mỗi ô 56×52 điểm ảnh game, phóng 4 lần. Vạch ngang mờ là mặt đất (chân). Hàng hit: thân chớp trắng là hiệu ứng trúng đòn của game.', fill=(169, 194, 180), font=font(13))
    for c in range(cols):
        d.text((lw + c * (cw + pad) + pad + 4, top - 18), 'khung %d' % c, fill=(200, 220, 210), font=font(12))
    ref = None; bang = []; soi = []
    for ri, row in enumerate(r['rows']):
        y = top + ri * (ch + pad) + pad
        for k, line in enumerate(TEN[row['ten']].split('\n')):
            d.text((pad, y + ch // 2 - 16 + k * 16), line, fill=(241, 230, 198), font=font(13))
        for cell in row['cells']:
            x = lw + cell['i'] * (cw + pad) + pad
            d.rectangle([x - 1, y - 1, x + cw, y + ch], outline=(90, 70, 40))
            d.rectangle([x, y, x + cw - 1, y + ch - 1], fill=(43, 58, 46))
            d.line([x, y + FY * Z, x + cw - 1, y + FY * Z], fill=(60, 80, 64))
            ci = img(cell['png']); im.paste(ci, (x, y), ci)
            hd = head(img(cell['than']))
            hat = cell.get('hat'); back = cell.get('back')
            hb = hat and (hat['truoc'] or hat['sau']); bb = back and (back['sau'] or back['truoc'])
            rec = {'hang': row['ten'], 'khung': cell['i'], 'tu_nhien': cell['tuNhien'], 'khop': cell['khop'], 'dau': hd, 'mu': hb, 'lung': bb, 'an': cell['of']}
            bang.append(rec)
            soi.append({'hang': row['ten'], 'khung': cell['i'], 'png': cell['than'], 'sach': cell['sach'], 'vk': cell.get('thanVk'), 'full': cell['png'], 'mu': hb, 'lung': bb})
            if r['look'].get('hat') and not hb:
                d.text((x + 4, y + 4), 'cuộn tròn: game ẩn mũ, đồ lưng', fill=(255, 190, 120), font=font(11))
            if row['ten'] == 'tele' and cell['i'] < row['n'] - 1:
                d.text((x + 4, y + 4), 'trong game chỉ dùng khung cuối', fill=(150, 170, 160), font=font(11))
    im.save(os.path.join(OUT, 'luoi.png'))
    json.dump({'look': r['look'], 'wear': r['wear'], 'vk': r['vk'], 'than': r['than'], 'bang': bang}, open(os.path.join(OUT, 'so-do.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(soi, open(os.path.join(OUT, 'o.json'), 'w'))
    print('lỗi trang:', errs[:5])


main()
