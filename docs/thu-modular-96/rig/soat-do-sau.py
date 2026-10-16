#!/usr/bin/env python3
"""Ảnh soát "che theo độ sâu" (chạy sau tao-rig.py). Cần playwright + Chromium.

Ghi vào rig/soat/:
  do-sau-<động tác>.png   4 khung tiêu biểu × 3 cách che (Tắt / Tách trước-sau / Che bằng lớp người) × 2 bộ, phóng ×6
                          quanh cổ–vai–tay (khung cắt theo khớp cổ, vai, khuỷu, cổ tay của khung đó).
  do-sau-tong.png         mọi động tác, khung 1 tiêu biểu, toàn thân ×3: 3 cách che cạnh nhau (bộ Gen).
  do-sau.gif              mọi động tác lần lượt, 3 cách che cạnh nhau (bộ Gen, ×3, toàn thân).
  do-sau-chay.gif         hàng chạy, 3 cách che × 2 bộ (×3).
  dien-thoai-390-sau-*.png  chụp trang trên điện thoại 390×844, DPR 3.
"""
import base64, io, json, os
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

RIG = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(RIG, 'soat')
EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
URL = 'file://' + os.path.join(RIG, 'kiem-tra-rig.html')
MODES = [('tat', 'Tắt'), ('tach', 'Tách trước-sau'), ('lop', 'Che bằng lớp người')]
SETS = [('may', 'Máy vẽ'), ('gen', 'Gen')]
BG = (201, 209, 216, 255)


def font(n):
    for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(f):
            return ImageFont.truetype(f, n)
    return ImageFont.load_default()


F = font(15)
FS = font(13)


def img(u):
    return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA')


def on_bg(im):
    b = Image.new('RGBA', im.size, BG)
    b.alpha_composite(im)
    return b


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
        pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        pg.goto(URL)
        pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=180000)
        acts = pg.evaluate('RIG_TEST.acts()')
        fr = lambda f, sk, act, d: img(pg.evaluate('RIG_TEST.frame(%d,0,false,"%s",false,"%s","%s")' % (f, sk, act, d)))
        # khớp để cắt vùng cổ–vai–tay
        J = pg.evaluate('''() => { const o = {}; for (const a of RIG_TEST.acts()) o[a.key] = RIG_TEST.joints(a.key); return o; }''')
        tong, gif_all = [], []
        for a in acts:
            key, N = a['key'], a['N']
            fs = sorted({round(i * N / 4) for i in range(4)})
            k = 6
            cols = []
            for f in fs:
                jj = J[key][f]
                pts = [jj[n] for n in ('neck', 'chin', 'shoulderFront', 'shoulderBack', 'elbowFront', 'elbowBack', 'wristFront', 'wristBack')
                       if isinstance(jj.get(n), list)]
                x0 = max(0, int(min(q[0] for q in pts)) - 4); x1 = min(96, int(max(q[0] for q in pts)) + 5)
                y0 = max(0, int(min(q[1] for q in pts)) - 10); y1 = min(96, int(max(q[1] for q in pts)) + 4)
                cols.append((f, (x0, y0, x1, y1)))
            cw = max(c[1][2] - c[1][0] for c in cols) * k
            chh = max(c[1][3] - c[1][1] for c in cols) * k
            lab = 150
            sheet = Image.new('RGBA', (lab + len(cols) * (cw + 6), 46 + 6 * (chh + 6)), (255, 255, 255, 255))
            dr = ImageDraw.Draw(sheet)
            dr.text((4, 6), '%s — cổ / vai / tay, ×%d' % (a['name'], k), fill=(0, 0, 0), font=F)
            r = 0
            for sk, skn in SETS:
                for d, dn in MODES:
                    y = 46 + r * (chh + 6)
                    dr.text((4, y + 4), skn, fill=(90, 90, 90), font=FS)
                    dr.text((4, y + 22), dn, fill=(0, 0, 0), font=FS)
                    for i, (f, box) in enumerate(cols):
                        c = on_bg(fr(f, sk, key, d)).crop(box).resize(((box[2] - box[0]) * k, (box[3] - box[1]) * k), Image.NEAREST)
                        sheet.paste(c, (lab + i * (cw + 6), y))
                        if r == 0:
                            pass
                    r += 1
            for i, (f, box) in enumerate(cols):
                dr.text((lab + i * (cw + 6) + 4, 26), 'khung %d' % (f + 1), fill=(0, 0, 0), font=FS)
            sheet.convert('RGB').save(os.path.join(OUT, 'do-sau-%s.png' % key), optimize=True)
            # tổng: khung đầu tiêu biểu (khung giữa), toàn thân ×3, bộ gen
            fm = fs[1] if len(fs) > 1 else 0
            row = [on_bg(fr(fm, 'gen', key, d)).crop((14, 18, 82, 94)).resize((68 * 3, 76 * 3), Image.NEAREST) for d, _ in MODES]
            tong.append((a['name'], fm, row))
            frames = []
            for f in range(N):
                im = Image.new('RGBA', (3 * 68 * 3 + 8, 76 * 3 + 22), (255, 255, 255, 255))
                dd = ImageDraw.Draw(im)
                for i, (d, dn) in enumerate(MODES):
                    im.paste(on_bg(fr(f, 'gen', key, d)).crop((14, 18, 82, 94)).resize((68 * 3, 76 * 3), Image.NEAREST), (i * (68 * 3 + 4), 20))
                    dd.text((i * (68 * 3 + 4) + 3, 2), dn, fill=(0, 0, 0), font=FS)
                dd.text((3 * 68 * 3 - 70, 2), a['name'][:12], fill=(176, 96, 44), font=FS)
                frames.append(im)
            gif_all += frames * (2 if N < 8 else 1)
            if key == 'chay':
                cf = []
                for f in range(N):
                    im = Image.new('RGBA', (3 * 68 * 3 + 8, 2 * (76 * 3) + 44), (255, 255, 255, 255))
                    dd = ImageDraw.Draw(im)
                    for j, (sk, skn) in enumerate(SETS):
                        for i, (d, dn) in enumerate(MODES):
                            im.paste(on_bg(fr(f, sk, key, d)).crop((14, 18, 82, 94)).resize((68 * 3, 76 * 3), Image.NEAREST), (i * (68 * 3 + 4), 20 + j * (76 * 3 + 22)))
                            dd.text((i * (68 * 3 + 4) + 3, 2 + j * (76 * 3 + 22)), skn + ' · ' + dn, fill=(0, 0, 0), font=FS)
                    cf.append(im)
                cf[0].convert('RGB').save(os.path.join(OUT, 'do-sau-chay.gif'), save_all=True, append_images=[c.convert('RGB') for c in cf[1:]], duration=110, loop=0)
        # tổng
        w = 3 * (68 * 3 + 4) + 130
        T = Image.new('RGBA', (w, 26 + len(tong) * (76 * 3 + 6)), (255, 255, 255, 255))
        dr = ImageDraw.Draw(T)
        for i, (d, dn) in enumerate(MODES):
            dr.text((130 + i * (68 * 3 + 4) + 4, 4), dn, fill=(0, 0, 0), font=FS)
        for r, (nm, fm, row) in enumerate(tong):
            y = 26 + r * (76 * 3 + 6)
            dr.text((4, y + 6), nm, fill=(0, 0, 0), font=FS)
            dr.text((4, y + 24), 'khung %d · Gen' % (fm + 1), fill=(90, 90, 90), font=FS)
            for i, c in enumerate(row):
                T.paste(c, (130 + i * (68 * 3 + 4), y))
        T.convert('RGB').save(os.path.join(OUT, 'do-sau-tong.png'), optimize=True)
        gif_all[0].convert('RGB').save(os.path.join(OUT, 'do-sau.gif'), save_all=True, append_images=[g.convert('RGB') for g in gif_all[1:]], duration=120, loop=0)
        b.close()

        # chụp trang điện thoại 390×844 DPR 3
        for ten, q, act in (('lop-chay-gen', '?bo=gen&sau=lop', 'chay'), ('tat-chay-gen', '?bo=gen&sau=tat', 'chay'),
                            ('tach-chay-gen', '?bo=gen&sau=tach', 'chay'), ('lop-dung-gen', '?bo=gen&sau=lop&dt=dung', 'dung'),
                            ('tat-dung-gen', '?bo=gen&sau=tat&dt=dung', 'dung'), ('lop-dung-may', '?sau=lop&dt=dung', 'dung')):
            b = p.chromium.launch(executable_path=EXE if os.path.exists(EXE) else None)
            pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=3)
            pg.goto(URL + q)
            pg.wait_for_function('window.RIG_TEST && window.RIG_TEST.ready', timeout=180000)
            pg.evaluate('RIG_TEST.stop(1)')
            pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-sau-%s.png' % ten))
            if ten == 'lop-chay-gen':
                pg.evaluate("document.getElementById('secSau').scrollIntoView()")
                pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-sau-bang.png'))
                pg.evaluate("document.getElementById('secGian').scrollIntoView()")
                pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-sau-gian.png'))
                pg.evaluate("document.getElementById('dNhan').click(); window.scrollTo(0,0)")
                pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-sau-nhan.png'))
                # tràn chữ: phần tử nào rộng hơn khung?
                tran = pg.evaluate('''() => { const W = document.documentElement.clientWidth; const bad = [];
                  for (const e of document.querySelectorAll('main *')) { const r = e.getBoundingClientRect(); if (r.width && r.right > W + 0.5) bad.push(e.tagName + '#' + e.id + '.' + e.className + ' ' + Math.round(r.right)); }
                  return {W, scrollW: document.documentElement.scrollWidth, bad: bad.slice(0, 10)}; }''')
                print('tràn ngang:', tran)
                cv = pg.evaluate('''() => { const c = document.getElementById('c0'); return {w: c.width, cssw: c.style.width, dpr: devicePixelRatio, K: RIG_TEST.K()}; }''')
                print('canvas:', cv)
                pg.screenshot(path=os.path.join(OUT, 'dien-thoai-390-sau-ca-trang.png'), full_page=True)
            b.close()
    print('xong soát che theo độ sâu')


if __name__ == '__main__':
    main()
