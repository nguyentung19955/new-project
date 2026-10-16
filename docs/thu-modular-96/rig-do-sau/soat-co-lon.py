#!/usr/bin/env python3
"""Soát chế độ Độ phân giải cao bằng Chromium headless (chạy sau tao-rig.py).

Ra soat/co-lon/:
  dien-thoai-390-canh-nhau.png   390×844 DPR 3, mặc định: cạnh nhau 96 ↔ 384
  dien-thoai-390-384.png         cỡ 384 (2 chế độ góc)   ·  dien-thoai-390-192.png, -48.png
  dien-thoai-390-to-luot-384.png cỡ 384, tô lượt back/front
  dien-thoai-390-ca-trang.png    cả trang (có bảng "Kiểm mọi cỡ")
  luoi-12-khung-192.png, luoi-12-khung-384.png   12 khung, bộ Gen, che theo độ sâu bật (liên tục + 8 hướng)
  luoi-12-khung-96-vs-384.png   cùng kích thước: 96 phóng ×4 và 384 ×1 xen kẽ
  can-canh-x3-384.png            cận cảnh ×3 quanh cổ / vai / khuỷu / gối (4 khung), trái thường · phải tô lượt
  can-canh-x3-192.png            như trên ở cỡ 192 (×6 để cùng khổ)
  chay-384.gif                   chạy 384 (liên tục | 8 hướng)
  tu-kiem-co-lon.json, bang-khe-co-lon.md
Dừng mã 1 nếu: lỗi JS, trang báo lỗi, tràn ngang, thứ tự sai, giãn ngoài 0,85–1,15, mask lỗi, còn khe r2 ở bất kỳ cỡ nào.
"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

FP = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT = ImageFont.truetype(FP, 16) if os.path.exists(FP) else None
RIG = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(RIG, 'soat', 'co-lon')
os.makedirs(OUT, exist_ok=True)
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
EXE = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
N = 12
KHUNG_SOI = [0, 3, 7, 9]
KHOP_SOI = [('cổ', 'neck'), ('vai T', 'shoulderFront'), ('khuỷu T', 'elbowFront'), ('gối T', 'kneeFront'),
            ('vai S', 'shoulderBack'), ('khuỷu S', 'elbowBack'), ('gối S', 'kneeBack')]
BG = (201, 209, 216, 255)
loi = []


def du(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=3)
    msgs = []
    pg.on('pageerror', lambda e: msgs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=120000)
    pg.evaluate('RIG_TEST.checkAll()')
    pg.evaluate('RIG_TEST.stop(0)')
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-canh-nhau.png'))
    for s in (384, 192, 48):
        pg.evaluate('RIG_TEST.setSize(%d); RIG_TEST.stop(0)' % s)
        pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-%d.png' % s))
    pg.evaluate("RIG_TEST.setSize(384); RIG_TEST.setView('to'); RIG_TEST.stop(0)")
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-to-luot-384.png'))
    pg.evaluate("RIG_TEST.setView('thuong'); RIG_TEST.setCmp(true, 0); RIG_TEST.stop(0)")
    pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-ca-trang.png'), full_page=True)
    if pg.evaluate('document.documentElement.scrollWidth > window.innerWidth'):
        loi.append('trang điện thoại bị tràn ngang')
    canv = pg.evaluate("[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height,c.getBoundingClientRect().width,c.getBoundingClientRect().height])")
    kv = pg.evaluate('RIG_TEST.KV()')
    errs = pg.evaluate('RIG_TEST.errors')
    rep = pg.evaluate('RIG_TEST.reportsAll()')
    crop = pg.evaluate('RIG_TEST.crop()')
    J = {s: [pg.evaluate('RIG_TEST.joints(%d,%d)' % (f, s)) for f in range(N)] for s in (96, 192, 384)}
    fr = {}
    for s in (96, 192, 384):
        for m in (0, 1):
            for view in ('thuong', 'to'):
                fr[(s, m, view)] = [du(pg.evaluate("RIG_TEST.frameAt(%d,%d,'gen',%d,'%s')" % (f, m, s, view))) for f in range(N)]
    size = os.path.getsize(os.path.join(RIG, 'kiem-tra-rig.html'))
    if msgs:
        loi.append('lỗi JS: %s' % msgs)
    b.close()

if errs:
    loi.append('trang báo lỗi: %s' % errs[:3])
for key, s in rep.items():
    if s['thuTuOk'] != N: loi.append('%s: thứ tự vẽ sai %d khung' % (key, N - s['thuTuOk']))
    if s['gianLoi']: loi.append('%s: giãn ngoài 0,85–1,15 ở %d khung' % (key, s['gianLoi']))
    if s['maskLoi']: loi.append('%s: %d lỗi mask' % (key, s['maskLoi']))
    if s['tongKhe']['0|2'][1] or s['tongKhe']['1|2'][1]: loi.append('%s: còn khe r2 %s' % (key, s['tongKhe']))


def cut(im, s):
    k = s / 96
    return im.crop((int(crop['x'] * k), int(crop['y'] * k), int((crop['x'] + crop['w']) * k), int((crop['y'] + crop['h']) * k)))


def hop(im, bg=BG):
    o = Image.new('RGBA', im.size, bg); o.alpha_composite(im); return o


# ---------- lưới 12 khung ----------
LB = 26


def luoi(rows, ten, tieu):
    cells = [[hop(c) for c in r[1]] for r in rows]
    cw, ch = cells[0][0].size
    im = Image.new('RGB', (N * cw, len(rows) * (ch + LB)), BG[:3])
    d = ImageDraw.Draw(im)
    for r, (nhan, _) in enumerate(rows):
        top = r * (ch + LB)
        d.rectangle([0, top, im.width, top + LB - 1], fill=(40, 40, 40))
        d.text((6, top + 4), nhan, fill=(255, 255, 255), font=FONT)
        for f in range(N):
            im.paste(cells[r][f].convert('RGB'), (f * cw, top + LB))
            d.text((f * cw + 4, top + LB + 2), str(f + 1), fill=(0, 0, 0), font=FONT)
            if f: d.line([f * cw, top + LB, f * cw, top + LB + ch], fill=(150, 150, 150))
    im.save(os.path.join(OUT, ten), optimize=True)


for s, z in ((192, 2), (384, 1)):
    rows = []
    for m in (0, 1):
        for view in ('thuong', 'to'):
            rows.append(('Gen · cỡ %d · %s · %s (×%d, khung 1..12)' % (s, 'liên tục' if m == 0 else '8 hướng',
                         'tô lượt: đỏ back, xanh front' if view == 'to' else 'che theo độ sâu bật', z),
                         [cut(c, s).resize((cut(c, s).width * z, cut(c, s).height * z), Image.NEAREST) for c in fr[(s, m, view)]]))
    luoi(rows, 'luoi-12-khung-%d.png' % s, s)
rows = [('Gen · cỡ 96 phóng ×4 (ô game nguồn) · liên tục', [cut(c, 96).resize((crop['w'] * 4, crop['h'] * 4), Image.NEAREST) for c in fr[(96, 0, 'thuong')]]),
        ('Gen · cỡ 384 ×1 (ảnh thật) · liên tục', [cut(c, 384) for c in fr[(384, 0, 'thuong')]])]
luoi(rows, 'luoi-12-khung-96-vs-384.png', 0)

# ---------- cận cảnh ----------


def can_canh(s, Z, ten):
    k = s // 96
    R = 8 * k                       # ô 16×16 điểm ảnh ô 96 quanh khớp
    cell = 2 * R * Z
    W2 = 110 + 2 * len(KHOP_SOI) * (cell + 4) + 12
    im = Image.new('RGB', (W2, 30 + len(KHUNG_SOI) * (cell + 6)), (235, 232, 225))
    d = ImageDraw.Draw(im)
    d.text((6, 6), 'Gen · cỡ %d · liên tục · ×%d · trái: bình thường · phải: tô lượt (đỏ back, xanh front) · chấm trắng = khớp' % (s, Z), fill=(0, 0, 0), font=FONT)
    for r, f in enumerate(KHUNG_SOI):
        top = 30 + r * (cell + 6)
        d.text((4, top + cell // 2 - 8), 'khung %d' % (f + 1), fill=(0, 0, 0), font=FONT)
        for half, view in enumerate(('thuong', 'to')):
            for c, (nm, j) in enumerate(KHOP_SOI):
                P = J[s][f][j]
                cx, cy = int(P[0]), int(P[1])
                src = hop(fr[(s, 0, view)][f].crop((cx - R, cy - R, cx + R, cy + R))).resize((cell, cell), Image.NEAREST)
                x = 110 + (half * len(KHOP_SOI) + c) * (cell + 4) + half * 12
                im.paste(src.convert('RGB'), (x, top))
                px, py = x + (P[0] - (cx - R)) * Z, top + (P[1] - (cy - R)) * Z
                d.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 255, 255), outline=(0, 0, 0))
                d.text((x + 3, top + 2), nm, fill=(255, 255, 255), font=FONT, stroke_width=2, stroke_fill=(0, 0, 0))
    im.save(os.path.join(OUT, ten), optimize=True)


can_canh(384, 3, 'can-canh-x3-384.png')
can_canh(192, 6, 'can-canh-x3-192.png')

# ---------- GIF 384 ----------
khung = []
for f in range(N):
    a, b2 = cut(fr[(384, 0, 'thuong')][f], 384), cut(fr[(384, 1, 'thuong')][f], 384)
    g = Image.new('RGB', (a.width * 2 + 8, a.height), BG[:3])
    g.paste(a, (0, 0), a); g.paste(b2, (a.width + 8, 0), b2)
    ImageDraw.Draw(g).rectangle([a.width, 0, a.width + 7, a.height], fill=(60, 60, 60))
    khung.append(g)
khung[0].save(os.path.join(OUT, 'chay-384.gif'), save_all=True, append_images=khung[1:], duration=50, loop=0, disposal=2)

# ---------- số liệu ----------
json.dump({'reports': rep, 'crop': crop, 'KV': kv, 'canvas': canv, 'trangKB': size // 1024}, open(os.path.join(OUT, 'tu-kiem-co-lon.json'), 'w'), ensure_ascii=False, indent=1)
md = ['# Bảng khe mọi cỡ (tự sinh bởi soat-co-lon.py)', '',
      'Số = điểm ảnh thân của chi còn **thấy được** trong đĩa quanh 6 khớp vai/khuỷu/gối × trước/sau, cộng 12 khung. '
      'r2/r3 = bán kính 2/3 điểm ảnh ô 96, nhân k ở cỡ lớn (192: 4/6, 384: 8/12). "≈96" = chia k² để so các cỡ. '
      'Trước = không chụp, không chồng mép; sau = chụp %s + chồng mép %s điểm ảnh ô 96 (× k).' % (rep['gen|1']['co'], rep['gen|1']['ov']), '',
      '| Cỡ · bộ | LT r2 trước→sau | LT r3 trước→sau | 8H r2 trước→sau | 8H r3 trước→sau | r3 sau ≈96 (LT/8H) | thứ tự | bám 2 đầu | giãn lỗi · kẹp | mask lỗi |',
      '|---|---|---|---|---|---|---|---|---|---|']
for key in sorted(rep, key=lambda q: (int(q.split('|')[1]), q)):
    s = rep[key]; T = s['tongKhe']; k = s['k']
    md.append('| %d · %s | %s | %s | %s | %s | %.1f / %.1f | %d/12 | %d/12 | %d · %d | %d |' % (
        s['size'], 'Gen' if s['set'] == 'gen' else 'Máy vẽ', *('%d→**%d**' % tuple(T[q]) for q in ('0|2', '0|3', '1|2', '1|3')),
        T['0|3'][1] / k / k, T['1|3'][1] / k / k, s['thuTuOk'], s['bamOk'], s['gianLoi'], s['kep'], s['maskLoi']))
for key in ('gen|1', 'gen|2', 'gen|4'):
    s = rep[key]
    md += ['', '## Gen cỡ %d — theo khung' % s['size'], '',
           '| Khung | LT r2 trước | sau | LT r3 trước | sau | 8H r2 trước | sau | 8H r3 trước | sau |', '|---|---|---|---|---|---|---|---|---|']
    for r in s['khe']:
        v = [r[q][R] for q in ('truoc|0', 'sau|0') for R in ('r2',)] + [r[q]['r3'] for q in ('truoc|0', 'sau|0')] + \
            [r[q]['r2'] for q in ('truoc|1', 'sau|1')] + [r[q]['r3'] for q in ('truoc|1', 'sau|1')]
        md.append('| %d | %s |' % (r['frame'], ' | '.join(map(str, v))))
    det = {}
    for r in s['khe']:
        for m in ('0', '1'):
            for j, g in r['sau|' + m]['chiTiet'].items():
                det[j] = det.get(j, 0) + g['r3']
    md += ['', 'Khe r3 (sau) cộng theo khớp, 2 chế độ: ' + ', '.join('%s=%d' % kv_ for kv_ in det.items()),
           'Bám 2 đầu lỗi: ' + ('; '.join('k%d %s %s lệch %.2f đ ô 96' % (b_['frame'], 'LT' if b_['mode'] == 0 else '8H', b_['name'], b_['endErr']) for b_ in s['bamLoi']) or 'không'),
           'Đổi lớp theo khung: ' + json.dumps(s['doiLop'], ensure_ascii=False)]
open(os.path.join(OUT, 'bang-khe-co-lon.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
for key, s in sorted(rep.items()):
    print(key, s['tongKhe'], 'thứ tự', s['thuTuOk'], 'bám', s['bamOk'], 'giãn', s['gianLoi'], 'kẹp', s['kep'], 'mask', s['maskLoi'])
print('KV', kv, 'canvas', canv, 'trang', size // 1024, 'KB')
if loi:
    print('LỖI:', *loi, sep='\n  ')
    sys.exit(1)
print('xong soát cỡ lớn')
