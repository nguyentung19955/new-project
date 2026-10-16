#!/usr/bin/env python3
"""Soát rig-do-sau bằng Chromium headless (chạy sau tao-rig.py).

Ra soat/:
  dien-thoai-390*.png      chụp màn hình 390×844, DPR 3 (thường / tô màu lượt / debug / cả trang)
  may-tinh-1280.png        chụp 1280×800
  bao-loi-*.png            thử 5 kiểu lỗi (khớp, ảnh, neo, mask, lớp) — trang phải hiện khung đỏ
  luoi-12-khung.png        12 khung × (Máy vẽ, Gen) × (liên tục, 8 hướng), phóng ×4
  luoi-luot.png            như trên nhưng tô màu lượt (đỏ back / xanh front)
  soi-x6-lien-tuc.png      ảnh soát ×6 quanh cổ / vai / khuỷu / gối, 4 khung tiêu biểu
  soi-x6-8-huong.png       như trên, chế độ 8 hướng
  chay-rig.gif             liên tục | 8 hướng (bộ Gen)
  tu-kiem.json, bang-khe.md  số liệu tự kiểm + bảng khe trước/sau theo khung × chế độ
Dừng mã 1 nếu: lỗi JS, trang báo lỗi với dữ liệu thật, tràn ngang, giả lập lỗi mà không báo,
thứ tự vẽ sai, giãn ngoài 0,85–1,15, mask lỗi, hoặc còn khe r=2 ở cấu hình đang chọn.
"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

FP = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT = ImageFont.truetype(FP, 16) if os.path.exists(FP) else None
RIG = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(RIG, 'soat')
os.makedirs(OUT, exist_ok=True)
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
EXE = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
N = 12
KHUNG_SOI = [0, 3, 7, 9]           # khung 1, 4, 8, 10 (1 và 8 có quy tắc "tay vung ra sau")
KHOP_SOI = [('cổ', 'neck'), ('vai T', 'shoulderFront'), ('khuỷu T', 'elbowFront'), ('gối T', 'kneeFront'),
            ('vai S', 'shoulderBack'), ('khuỷu S', 'elbowBack'), ('gối S', 'kneeBack')]


def du(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


loi = []


def mo(b, w, h, dpr, q=''):
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    msgs = []
    pg.on('pageerror', lambda e: msgs.append(str(e)))
    pg.on('requestfailed', lambda r: msgs.append('tải hỏng ' + r.url[:80]))
    pg.goto(URL + q)
    pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=60000)
    if msgs:
        loi.append('lỗi JS/tải %s: %s' % (q, msgs))
    return pg


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
    pg = mo(b, 390, 844, 3)
    pg.evaluate('RIG_TEST.stop(0)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390.png'))
    pg.evaluate("RIG_TEST.setSet('gen'); RIG_TEST.setView('to')")
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-to-luot.png'))
    pg.evaluate("RIG_TEST.setView('thuong'); RIG_TEST.debug(true)")
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-debug.png'))
    pg.evaluate("RIG_TEST.debug(false)")
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-ca-trang.png'), full_page=True)
    if pg.evaluate('document.documentElement.scrollWidth > window.innerWidth'):
        loi.append('trang điện thoại bị tràn ngang')
    canv = pg.evaluate("[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height,c.getBoundingClientRect().width])")
    K = pg.evaluate('RIG_TEST.K()')
    errs, warns = pg.evaluate('RIG_TEST.errors'), pg.evaluate('RIG_TEST.warns')
    rep = pg.evaluate('RIG_TEST.reports()')
    crop = pg.evaluate('RIG_TEST.crop()')
    joints = [pg.evaluate('RIG_TEST.joints(%d)' % f) for f in range(N)]
    plans = {sk: [pg.evaluate("RIG_TEST.plan(%d,'%s')" % (f, sk)) for f in range(N)] for sk in ('may', 'gen')}
    fr = {}
    for sk in ('may', 'gen'):
        for m in (0, 1):
            for view in ('thuong', 'to'):
                fr[(sk, m, view)] = [du(pg.evaluate("RIG_TEST.frame(%d,%d,false,'%s',false,'%s')" % (f, m, sk, view))) for f in range(N)]
    pg.close()
    pg = mo(b, 1280, 800, 1)
    pg.evaluate("RIG_TEST.stop(7); RIG_TEST.setSet('gen'); RIG_TEST.debug(true)")
    pg.screenshot(path=os.path.join(OUT, 'may-tinh-1280.png'))
    pg.close()
    for q in ('khop', 'anh', 'neo', 'mask', 'lop'):
        pg = mo(b, 390, 844, 3, '?loi=' + q)
        e = pg.evaluate('RIG_TEST.errors')
        if not e:
            loi.append('giả lập lỗi "%s" nhưng trang không báo' % q)
        print('thử lỗi %-4s: %d dòng báo | %s' % (q, len(e), (e[0] if e else '')[:110]))
        pg.evaluate('RIG_TEST.stop(3)')
        pg.screenshot(path=os.path.join(OUT, 'bao-loi-%s.png' % q))
        pg.close()
    b.close()

if errs:
    loi.append('trang báo lỗi với dữ liệu thật: %s' % errs)
for sk, s in rep.items():
    if s['thuTuOk'] != N:
        loi.append('%s: thứ tự vẽ sai ở %d khung' % (sk, N - s['thuTuOk']))
    if s['gianLoi']:
        loi.append('%s: giãn ngoài 0,85–1,15 ở %d khung' % (sk, s['gianLoi']))
    if s['maskLoi']:
        loi.append('%s: %d lỗi mask' % (sk, s['maskLoi']))
    if s['tongKhe']['0|2'][1] or s['tongKhe']['1|2'][1]:
        loi.append('%s: còn khe r=2 (liên tục %d, 8 hướng %d)' % (sk, s['tongKhe']['0|2'][1], s['tongKhe']['1|2'][1]))

# ---------- lưới 12 khung ----------
S, LB = 4, 26
x0, y0, cw, ch = crop['x'], crop['y'], crop['w'], crop['h']


def luoi(view, ten):
    hang = [(sk, m) for sk in ('may', 'gen') for m in (0, 1)]
    im = Image.new('RGBA', (N * cw * S, len(hang) * (ch * S + LB)), (201, 209, 216, 255))
    d = ImageDraw.Draw(im)
    for r, (sk, m) in enumerate(hang):
        top = r * (ch * S + LB)
        d.rectangle([0, top, im.width, top + LB - 1], fill=(40, 40, 40, 255))
        d.text((6, top + 4), '%s · %s · %s (khung 1..12, ×4)' % ('Máy vẽ' if sk == 'may' else 'Gen', 'liên tục' if m == 0 else '8 hướng',
                                                                 'tô lượt: đỏ back, xanh front' if view == 'to' else 'bình thường'), fill=(255, 255, 255, 255), font=FONT)
        for f in range(N):
            c = fr[(sk, m, view)][f].crop((x0, y0, x0 + cw, y0 + ch)).resize((cw * S, ch * S), Image.NEAREST)
            im.alpha_composite(c, (f * cw * S, top + LB))
            d.text((f * cw * S + 4, top + LB + 2), str(f + 1), fill=(0, 0, 0, 255), font=FONT)
        for f in range(1, N):
            d.line([f * cw * S, top + LB, f * cw * S, top + LB + ch * S], fill=(150, 150, 150, 255))
    im.convert('RGB').save(os.path.join(OUT, ten))


luoi('thuong', 'luoi-12-khung.png')
luoi('to', 'luoi-luot.png')

# ---------- soi ×6 ----------
Z, R = 6, 8            # ô 16×16 điểm ảnh quanh khớp, phóng ×6


def soi(m, ten):
    rows = [(f, sk) for f in KHUNG_SOI for sk in ('may', 'gen')]
    cell = 2 * R * Z
    W2 = 110 + 2 * len(KHOP_SOI) * (cell + 4) + 12
    im = Image.new('RGB', (W2, 30 + len(rows) * (cell + 6)), (235, 232, 225))
    d = ImageDraw.Draw(im)
    d.text((6, 6), ('Liên tục' if m == 0 else '8 hướng') + ' · ×6 · trái: bình thường · phải: tô lượt (đỏ back, xanh front) · chấm trắng = khớp', fill=(0, 0, 0), font=FONT)
    for r, (f, sk) in enumerate(rows):
        top = 30 + r * (cell + 6)
        d.text((4, top + cell // 2 - 18), 'khung %d' % (f + 1), fill=(0, 0, 0), font=FONT)
        d.text((4, top + cell // 2 + 2), 'Máy vẽ' if sk == 'may' else 'Gen', fill=(90, 90, 90), font=FONT)
        for half, view in enumerate(('thuong', 'to')):
            for c, (nm, j) in enumerate(KHOP_SOI):
                J = joints[f][j]
                cx, cy = int(J[0]), int(J[1])
                src = fr[(sk, m, view)][f].crop((cx - R, cy - R, cx + R, cy + R)).resize((cell, cell), Image.NEAREST)
                bg = Image.new('RGBA', src.size, (201, 209, 216, 255))
                bg.alpha_composite(src)
                x = 110 + (half * len(KHOP_SOI) + c) * (cell + 4) + half * 12
                im.paste(bg.convert('RGB'), (x, top))
                px, py = x + (J[0] - (cx - R)) * Z, top + (J[1] - (cy - R)) * Z
                d.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 255, 255), outline=(0, 0, 0))
                if r == 0:
                    pass
                d.text((x + 3, top + 2), nm, fill=(255, 255, 255), font=FONT, stroke_width=2, stroke_fill=(0, 0, 0))
    im.save(os.path.join(OUT, ten))


soi(0, 'soi-x6-lien-tuc.png')
soi(1, 'soi-x6-8-huong.png')

# ---------- GIF ----------
khung = []
for f in range(N):
    g = Image.new('RGB', (2 * cw * S + 8, ch * S), (201, 209, 216))
    for m in (0, 1):
        c = fr[('gen', m, 'thuong')][f].crop((x0, y0, x0 + cw, y0 + ch)).resize((cw * S, ch * S), Image.NEAREST)
        g.paste(c, (m * (cw * S + 8), 0), c)
    ImageDraw.Draw(g).rectangle([cw * S, 0, cw * S + 7, ch * S], fill=(60, 60, 60))
    khung.append(g)
khung[0].save(os.path.join(OUT, 'chay-rig.gif'), save_all=True, append_images=khung[1:], duration=100, loop=0, disposal=2)

# ---------- số liệu + bảng khe ----------
json.dump({'reports': rep, 'crop': crop, 'K': K, 'canvas': canv, 'warns': warns, 'plans': plans}, open(os.path.join(OUT, 'tu-kiem.json'), 'w'),
          ensure_ascii=False, indent=1)
md = ['# Bảng khe ở khớp theo khung (tự sinh bởi soat-rig.py)', '',
      'Số = điểm ảnh thân của chi còn lộ (lớp trên cùng sau khi vẽ đủ lớp) trong đĩa bán kính r quanh 6 khớp vai/khuỷu/gối × trước/sau, cộng lại.',
      '**Trước** = không chụp khớp, không chồng mép. **Sau** = cấu hình đang chọn (chụp %s, chồng mép %s điểm ảnh).' % (rep['may']['co'], rep['may']['ov']), '']
for sk, s in rep.items():
    md += ['## Bộ %s' % ('Máy vẽ' if sk == 'may' else 'Gen'), '',
           '| Khung | Liên tục r2 trước | sau | Liên tục r3 trước | sau | 8 hướng r2 trước | sau | 8 hướng r3 trước | sau |',
           '|---|---|---|---|---|---|---|---|---|']
    tot = [0] * 8
    for r in s['khe']:
        v = [r['truoc|0']['r2'], r['sau|0']['r2'], r['truoc|0']['r3'], r['sau|0']['r3'],
             r['truoc|1']['r2'], r['sau|1']['r2'], r['truoc|1']['r3'], r['sau|1']['r3']]
        tot = [a + b for a, b in zip(tot, v)]
        md.append('| %d | %s |' % (r['frame'], ' | '.join(map(str, v))))
    md.append('| **Tổng** | %s |' % ' | '.join('**%d**' % t for t in tot))
    md += ['', 'Khe r=3 còn lại (sau) theo khớp:', '']
    det = []
    for r in s['khe']:
        for m in ('0', '1'):
            for j, g in r['sau|' + m]['chiTiet'].items():
                if g['r3']:
                    det.append('k%d %s %s=%d' % (r['frame'], 'LT' if m == '0' else '8H', j, g['r3']))
    md += ['- ' + ', '.join(det) if det else '- không còn', '']
    md += ['So cấu hình (tổng 12 khung):', '', '| Cấu hình | LT r2 | LT r3 | 8H r2 | 8H r3 | khung có khe r2 |', '|---|---|---|---|---|---|']
    for k, v in s['soCo'].items():
        md.append('| %s | %d | %d | %d | %d | %d/12 |' % (k, v['lienTucR2'], v['lienTucR3'], v['tamHuongR2'], v['tamHuongR3'], v['khungCoKheR2']))
    md += ['', 'Bám 2 đầu lỗi: ' + ('; '.join('k%d %s %s%s lệch %.2f' % (b_['frame'], 'LT' if b_['mode'] == 0 else '8H', b_['name'],
                                                                      (' đầu' if b_['dau'] else '') + (' cuối' if b_['cuoi'] else ''), b_['endErr'])
                                                 for b_ in s['bamLoi']) or 'không'),
           'Đổi lớp theo khung: ' + json.dumps(s['doiLop'], ensure_ascii=False), '']
open(os.path.join(OUT, 'bang-khe.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')

for sk, s in rep.items():
    print(sk, 'bám', s['bamOk'], '| thứ tự', s['thuTuOk'], '| giãn lỗi', s['gianLoi'], 'kẹp', s['kep'], '| mask lỗi', s['maskLoi'],
          '| khe', s['tongKhe'], '| đổi lớp', s['doiLop'])
print('K =', K, '| canvas:', canv[:2])
if loi:
    print('LỖI:', *loi, sep='\n  ')
    sys.exit(1)
print('xong soát')
