#!/usr/bin/env python3
"""Xuất prototype Lam 3/4 bằng Chromium headless (SwiftShader), ghi vào proto-lam/out/:
  lam-proto-36.png, lam-proto-44.png  sprite sheet nền trong suốt, mỗi hàng một animation (idle, run, slash)
  lam-proto.json                      frames x,y,w,h, hold (ms), hit, hitbox lưỡi kiếm, pivot chân; fps danh nghĩa
  xem-truoc-x4.png                    lưới 3 animation ×4 có nhãn + thời lượng (cả 2 cỡ)
  silhouette.png                      bóng đen từng khung ×4 (duyệt hình dáng)
  trong-game.png                      cảnh 480×270 nền Làng Chuông + gạch + Lam 36/44 cạnh Quái Chuông Gỗ, phóng ×2
  idle-36.gif, run-36.gif, slash-36.gif, idle-44.gif, …   GIF ×4, thời lượng từng khung theo hold
Chạy:  python3 proto-lam/xuat.py          (không cần "playwright install"; dùng /opt/pw-browsers/chromium)
Không đụng gì ngoài proto-lam/out/.
"""
import base64, json, os, sys, time
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(HERE, 'out')
CAOS = [36, 44]
FPS = 12
NEN = (42, 36, 51, 255)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


def chu(cO):
    try: return ImageFont.truetype(FONT, cO)
    except Exception: return ImageFont.load_default()


def dung():
    from playwright.sync_api import sync_playwright
    args = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']
    with sync_playwright() as pw:
        kw = {'args': args}
        if os.path.isfile('/opt/pw-browsers/chromium'): kw['executable_path'] = '/opt/pw-browsers/chromium'
        br = pw.chromium.launch(**kw)
        page = br.new_page()
        loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        page.goto('file://' + os.path.join(HERE, 'proto.html'))
        page.wait_for_function('window.PROTO && window.THREE', timeout=30000)
        t0 = time.time()
        data = page.evaluate('(caos) => PROTO.xuat(caos)', CAOS)
        br.close()
    if loi: sys.exit('Lỗi JS: ' + '; '.join(loi))
    print('render %d cỡ × 3 animation: %.1fs' % (len(CAOS), time.time() - t0))
    return data


def anh(f, n):
    return Image.frombytes('RGBA', (n, n), base64.b64decode(f['px']))


def ghep(data):
    meta = {'fps': FPS, 'camera': data['cam'], 'thuTu': data['thuTu'], 'co': {}}
    sheets, frames = {}, {}
    for cao in CAOS:
        d = data['co'][str(cao)]
        n = d['cell']; names = data['thuTu']
        cols = max(len(d['anims'][k]['frames']) for k in names)
        sh = Image.new('RGBA', (cols * n, len(names) * n), (0, 0, 0, 0))
        m = {'anh': 'lam-proto-%d.png' % cao, 'cao': cao, 'w': n, 'h': n, 'cols': cols, 'rows': len(names), 'ppu': d['ppu'],
             'pivot': {'x': d['anims']['idle']['frames'][0]['pivot'][0], 'y': d['anims']['idle']['frames'][0]['pivot'][1]}, 'anims': {}}
        frames[cao] = {}
        for r, k in enumerate(names):
            A = d['anims'][k]; fr = []; frames[cao][k] = []
            for c, f in enumerate(A['frames']):
                im = anh(f, n); sh.paste(im, (c * n, r * n))
                fr.append({'x': c * n, 'y': r * n, 'w': n, 'h': n, 'hold': f['hold'], 'hit': f['hit'], 'name': f['ten'], 'hitbox': f['hitbox'], 'pivot': f['pivot']})
                frames[cao][k].append((im, f))
            m['anims'][k] = {'row': r, 'loop': A['loop'], 'label': A['label'], 'tongMs': sum(x['hold'] for x in fr), 'lechVongPx': round(A['lechVong'] * d['ppu'], 3), 'frames': fr}
        meta['co'][str(cao)] = m; sheets[cao] = sh
        print('cỡ %d: ô %d, %d khung, sheet %s' % (cao, n, sum(len(v) for v in frames[cao].values()), sh.size))
    return meta, sheets, frames


def xem_truoc(data, frames):
    S = 4; fnt = chu(13); fnt2 = chu(11)
    khoi = []
    for cao in CAOS:
        n = data['co'][str(cao)]['cell']
        for k in data['thuTu']:
            fr = frames[cao][k]; A = data['co'][str(cao)]['anims'][k]
            W = len(fr) * (n * S + 6) + 6; H = n * S + 44
            im = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(im)
            tong = sum(f['hold'] for _, f in fr)
            dr.text((6, 4), '%s · cỡ %d px (ô %d) · %d khung · %d ms · %s' % (A['label'], cao, n, len(fr), tong, 'lặp' if A['loop'] else 'một lần'), font=fnt, fill=(230, 235, 240, 255))
            for i, (img, f) in enumerate(fr):
                x = 6 + i * (n * S + 6); y = 24
                big = img.resize((n * S, n * S), Image.NEAREST)
                im.alpha_composite(big, (x, y))
                mau = (225, 184, 90, 255) if f['hit'] else (60, 70, 85, 255)
                dr.rectangle([x, y, x + n * S - 1, y + n * S - 1], outline=mau, width=2 if f['hit'] else 1)
                dr.text((x + 3, y + n * S + 3), '%d · %d ms%s' % (i + 1, f['hold'], ' · HIT' if f['hit'] else ''), font=fnt2, fill=(138, 150, 166, 255))
            khoi.append(im)
    W = max(k.width for k in khoi); H = sum(k.height for k in khoi)
    out = Image.new('RGBA', (W, H), NEN); y = 0
    for k in khoi: out.alpha_composite(k, (0, y)); y += k.height
    return out


def silhouette(data, frames):
    S = 4; fnt = chu(12)
    khoi = []
    for cao in CAOS:
        n = data['co'][str(cao)]['cell']
        for k in data['thuTu']:
            fr = frames[cao][k]
            W = len(fr) * (n * S + 4) + 4; H = n * S + 22
            im = Image.new('RGBA', (W, H), (214, 214, 206, 255)); dr = ImageDraw.Draw(im)
            dr.text((4, 3), 'silhouette %s · %d px' % (k, cao), font=fnt, fill=(60, 60, 60, 255))
            for i, (img, f) in enumerate(fr):
                a = img.getchannel('A').point(lambda v: 255 if v > 0 else 0)
                den = Image.new('RGBA', (n, n), (12, 15, 20, 255)); den.putalpha(a)
                im.alpha_composite(den.resize((n * S, n * S), Image.NEAREST), (4 + i * (n * S + 4), 20))
            khoi.append(im)
    W = max(k.width for k in khoi); H = sum(k.height for k in khoi)
    out = Image.new('RGBA', (W, H), (214, 214, 206, 255)); y = 0
    for k in khoi: out.alpha_composite(k, (0, y)); y += k.height
    return out


def gach(dr, x0, y0, w, h):
    """Bệ gạch đá: mặt #4A5A6E, mạch #212835, viền #0C0F14."""
    dr.rectangle([x0, y0, x0 + w - 1, y0 + h - 1], fill=(26, 33, 43, 255), outline=(12, 15, 20, 255))
    bw, bh = 12, 6
    for r, y in enumerate(range(y0 + 1, y0 + h - 1, bh)):
        off = (bw // 2) if r % 2 else 0
        for x in range(x0 + 1 - off, x0 + w - 1, bw):
            xa, xb = max(x, x0 + 1), min(x + bw - 2, x0 + w - 2)
            if xb <= xa: continue
            dr.rectangle([xa, y, xb, min(y + bh - 2, y0 + h - 2)], fill=(44, 53, 70, 255))
            dr.line([xa, y, xb, y], fill=(50, 128, 79, 255) if r == 0 else (74, 90, 110, 255))
    dr.line([x0, y0, x0 + w - 1, y0], fill=(12, 15, 20, 255))


def trong_game(data, frames):
    import importlib.util
    spec = importlib.util.spec_from_file_location('build', os.path.join(HERE, 'build.py')); b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
    nen = b.ghep_nen().convert('RGBA')
    dr = ImageDraw.Draw(nen)
    DAT = 241
    # bệ gạch giữa cảnh
    gach(dr, 196, DAT - 20, 150, 22)
    # Quái Chuông Gỗ (atlas: ô 32, pivot 19,29, nhìn trái)
    atlas = json.load(open(os.path.join(ROOT, 'art', 'sprite', 'atlas.json')))
    q = atlas['quaiChuong']; qs = Image.open(os.path.join(ROOT, 'art', 'sprite', 'quai-chuong.png')).convert('RGBA')
    f0 = q['anims']['idle']['frames'][0]; quai = qs.crop((f0['x'], f0['y'], f0['x'] + q['w'], f0['y'] + q['h']))
    qp = q['pivot']

    def dat(im, piv, x, y):
        nen.alpha_composite(im, (x - piv[0], y - piv[1]))
    # trên bệ: Lam 36 – Lam 44 – quái
    y = DAT - 20
    im36, f36 = frames[36]['idle'][0]; im44, f44 = frames[44]['idle'][0]
    dat(im36, f36['pivot'], 222, y); dat(im44, f44['pivot'], 262, y); dat(quai, (qp['x'], qp['y']), 318, y)
    # dưới lối đi: Lam 36 chém + quái, Lam 44 chạy
    ims, fs = frames[36]['slash'][4]; dat(ims, fs['pivot'], 96, DAT); dat(quai, (qp['x'], qp['y']), 140, DAT)
    imr, fr_ = frames[44]['run'][2]; dat(imr, fr_['pivot'], 400, DAT)
    big = nen.resize((960, 540), Image.NEAREST)
    d2 = ImageDraw.Draw(big); fnt = chu(14)
    for x, t in [(222, '36 px'), (262, '44 px'), (318, 'Quái Chuông Gỗ'), (96, '36 – slash hit'), (400, '44 – run')]:
        yy = (y if x in (222, 262, 318) else DAT) * 2 + 8
        d2.text((x * 2 - 20, yy), t, font=fnt, fill=(243, 230, 200, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    d2.text((8, 8), 'trong-game.png · 480×270 phóng ×2 · nền Làng Chuông (xa+giữa+gần) · mặt đất y=241', font=fnt, fill=(230, 235, 240, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
    return big


def gif(fr, duong_dan, S=4):
    n = fr[0][0].width
    ims, durs = [], []
    for im, f in fr:
        bg = Image.new('RGBA', (n, n), NEN); bg.alpha_composite(im)
        ims.append(bg.resize((n * S, n * S), Image.NEAREST).convert('P', palette=Image.ADAPTIVE, colors=32)); durs.append(max(20, f['hold']))
    ims[0].save(duong_dan, save_all=True, append_images=ims[1:], duration=durs, loop=0, disposal=2)


def main():
    os.makedirs(OUT, exist_ok=True)
    data = dung()
    meta, sheets, frames = ghep(data)
    for cao in CAOS: sheets[cao].save(os.path.join(OUT, 'lam-proto-%d.png' % cao), optimize=True)
    json.dump(meta, open(os.path.join(OUT, 'lam-proto.json'), 'w'), ensure_ascii=False, indent=1)
    xem_truoc(data, frames).save(os.path.join(OUT, 'xem-truoc-x4.png'))
    silhouette(data, frames).save(os.path.join(OUT, 'silhouette.png'))
    trong_game(data, frames).save(os.path.join(OUT, 'trong-game.png'))
    for cao in CAOS:
        for k in data['thuTu']: gif(frames[cao][k], os.path.join(OUT, '%s-%d.gif' % (k, cao)))
    for cao in CAOS:
        for k in data['thuTu']:
            A = meta['co'][str(cao)]['anims'][k]
            print('  %d/%s: %d khung, %d ms, lệch khép vòng %.2f px' % (cao, k, len(A['frames']), A['tongMs'], A['lechVongPx']))
    print('đã ghi', OUT)


if __name__ == '__main__':
    main()
