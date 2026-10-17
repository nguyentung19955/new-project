#!/usr/bin/env python3
"""In sẵn Lam 3D → pixel: dựng mô hình 3D (tools/lam3d-core.js + lam3d-anim.js) trong Chromium headless
(WebGL phần mềm SwiftShader), render 26 animation thành ô 64×64 rồi ghi:
  art/sprite/lam3d.png       — atlas (9 cột × 26 hàng, ô 64×64, pivot giữa chân (32,59))
  art/sprite/atlas.json      — thêm/cập nhật khóa "lam3d" (cùng định dạng lam/lam48, đọc bởi game/lib/atlas-in-san.js)
Tùy chọn:
  --xem        ghi thêm art/nhan-vat/lam-3d/: xem-truoc.png, so-sanh.png, GIF ×6 (idle, run, jump, attack-combo, echoCast)
  --ss 1       render thẳng 64×64 (mặc định 2 = render 128×128 rồi gộp màu đa số — nét mũ/kiếm sạch hơn)
  --ra THƯ_MỤC ghi mọi ảnh vào thư mục khác (không đụng atlas.json) — để so sánh thử
Three.js r128: biến môi trường THREE_JS, game/tools/node_modules/three/build/three.min.js, hoặc cdnjs.
Chạy:  python3 tools/in-lam3d.py --xem      (KHÔNG cần "playwright install"; dùng Chromium có sẵn)
"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
SPRITE = os.path.join(ROOT, 'art', 'sprite')
LAM3D = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-3d')
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
CELL, PIV = 64, (32, 59)
NEN = (42, 36, 51, 255)


def three_src():
    for p in (os.environ.get('THREE_JS'), os.path.join(ROOT, 'game', 'tools', 'node_modules', 'three', 'build', 'three.min.js')):
        if p and os.path.isfile(p):
            return {'path': p}
    return {'url': CDN}


JS = """([ss]) => {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true });
  R.setPixelRatio(1);
  const lam = LAM3D.tao(THREE, { ss });
  const out = { thuTu: LAM3D.THU_TU, combo: LAM3D.COMBO, fps: LAM3D.FPS, anims: {} };
  for (const ten of LAM3D.THU_TU) {
    const A = LAM3D.ANIMS[ten], fr = lam.chayAnim(R, ten);
    out.anims[ten] = { loop: A.loop, label: A.label, frames: fr.map(f => {
      let s = ''; const b = f.px; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
      let x0 = 99, y0 = 99, x1 = -1, y1 = -1;
      if (f.hit) for (let q = 0; q < f.id.length; q++) { const v = f.id[q]; if (v === LAM3D.ID.luoi || v === LAM3D.ID.chem) { const x = q % 64, y = (q / 64) | 0;
        if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } }
      return { name: f.ten, hold: f.hold, hit: f.hit, comboWindow: f.comboWindow, px: btoa(s),
               kiem: x1 >= 0 ? { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null };
    }) };
  }
  return out;
}"""


def dung(ss):
    from playwright.sync_api import sync_playwright
    args = ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl']
    with sync_playwright() as pw:
        kw = {'args': args}
        if os.path.isfile('/opt/pw-browsers/chromium'):
            kw['executable_path'] = '/opt/pw-browsers/chromium'
        br = pw.chromium.launch(**kw)
        page = br.new_page()
        loi = []
        page.on('pageerror', lambda e: loi.append(str(e)))
        page.set_content('<!doctype html><meta charset="utf-8"><body></body>')
        try:
            page.add_script_tag(**three_src())
        except Exception as e:
            br.close()
            sys.exit('Không nạp được Three.js r128 (' + str(e).splitlines()[0] + '). Đặt THREE_JS=/đường/dẫn/three.min.js')
        page.add_script_tag(path=os.path.join(HERE, 'lam3d-core.js'))
        page.add_script_tag(path=os.path.join(HERE, 'lam3d-anim.js'))
        out = page.evaluate(JS, [ss])
        br.close()
    if loi:
        sys.exit('Lỗi JS: ' + '; '.join(loi))
    return out


def o_anh(b64):
    return Image.frombytes('RGBA', (CELL, CELL), base64.b64decode(b64))


def kiem_tra(im):
    a = im.getchannel('A').load()
    loi = []
    if any(a[x, 0] for x in range(CELL)): loi.append('sát mép trên')
    if any(a[x, CELL - 1] for x in range(CELL)): loi.append('sát mép dưới')
    if any(a[0, y] for y in range(CELL)): loi.append('sát mép trái')
    if any(a[CELL - 1, y] for y in range(CELL)): loi.append('sát mép phải')
    return loi


def main():
    xem = '--xem' in sys.argv
    ss = int(sys.argv[sys.argv.index('--ss') + 1]) if '--ss' in sys.argv else 2
    ra = sys.argv[sys.argv.index('--ra') + 1] if '--ra' in sys.argv else None
    out = dung(ss)
    names = out['thuTu']
    cols = max(len(out['anims'][k]['frames']) for k in names)
    sheet = Image.new('RGBA', (cols * CELL, len(names) * CELL), (0, 0, 0, 0))
    meta = {'w': CELL, 'h': CELL, 'cols': cols, 'rows': len(names), 'fps': out['fps'],
            'pivot': {'x': PIV[0], 'y': PIV[1]}, 'combo': out['combo'], 'anims': {}, 'kiemTra': [], 'anh': 'lam3d.png'}
    frames_img = {}
    for r, k in enumerate(names):
        a = out['anims'][k]
        fr, hb = [], None
        for c, f in enumerate(a['frames']):
            im = o_anh(f['px'])
            sheet.paste(im, (c * CELL, r * CELL))
            fr.append({'x': c * CELL, 'y': r * CELL, 'hold': f['hold'], 'hit': f['hit'], 'comboWindow': f['comboWindow'], 'name': f['name']})
            if f['hit'] and f['kiem'] and hb is None:
                hb = f['kiem']
            loi = kiem_tra(im)
            if loi:
                meta['kiemTra'].append({'anim': k, 'frame': c, 'loi': loi})
            frames_img.setdefault(k, []).append((im, f['hold'], f['name']))
        meta['anims'][k] = {'row': r, 'loop': a['loop'], 'label': a['label'], 'frames': fr}
        if hb:
            meta['anims'][k]['hitbox'] = hb   # vùng lưỡi kiếm + vệt chém ở khung HIT (tọa độ trong ô)
    dich = ra or SPRITE
    os.makedirs(dich, exist_ok=True)
    sheet.save(os.path.join(dich, 'lam3d.png'), optimize=True)
    if not ra:
        jp = os.path.join(SPRITE, 'atlas.json')
        atlas = json.load(open(jp, encoding='utf-8')) if os.path.isfile(jp) else {}
        atlas['lam3d'] = meta
        with open(jp, 'w', encoding='utf-8') as fh:
            json.dump(atlas, fh, ensure_ascii=False, separators=(',', ':'))
    print('Đã ghi lam3d.png', sheet.size, '· ss', ss, '·', len(names), 'animation ·',
          sum(len(meta['anims'][k]['frames']) for k in names), 'khung · sát mép:', meta['kiemTra'])
    if not ra:
        dung_studio()
    if xem:
        xem_truoc(names, meta, frames_img, ra or LAM3D)


def nen_lang():
    """Nền Làng Chuông 64×64 cho ô pixel (cắt từ lớp xa + giữa, mặt đất ở y = pivot)."""
    d = os.path.join(ROOT, 'art', 'nen', 'lang-chuong', 'game')
    nen = Image.new('RGBA', (64, 64), (40, 36, 50, 255))
    try:
        nen.alpha_composite(Image.open(os.path.join(d, 'xa.png')).convert('RGBA').crop((210, 130, 274, 194)))
        nen.alpha_composite(Image.open(os.path.join(d, 'giua.png')).convert('RGBA').crop((300, 200, 364, 264)))
    except OSError:
        pass
    g = ImageDraw.Draw(nen)
    g.rectangle([0, PIV[1], 63, 63], fill=(33, 40, 53, 255))
    g.line([0, PIV[1], 63, PIV[1]], fill=(74, 90, 110, 255))
    for x in range(0, 64, 8):
        g.point((x + 3, PIV[1] + 2), fill=(44, 53, 70, 255))
    b = io.BytesIO(); nen.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def dung_studio():
    """Ghép tools/studio-3d.html (MỘT file): mẫu studio-3d.mau.html + lam3d-core.js + lam3d-anim.js + nền; Three.js r128 từ cdnjs."""
    def doc(f): return open(os.path.join(HERE, f), encoding='utf-8').read().replace('</script', '<\\/script')
    m = open(os.path.join(HERE, 'studio-3d.mau.html'), encoding='utf-8').read()
    m = m.replace('/*LAM3D_CORE*/', doc('lam3d-core.js')).replace('/*LAM3D_ANIM*/', doc('lam3d-anim.js')).replace('/*NEN_LANG*/', nen_lang())
    html = ('<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n'
            + m + '\n</body>\n</html>\n')
    open(os.path.join(HERE, 'studio-3d.html'), 'w', encoding='utf-8').write(html)
    print('Đã ghi tools/studio-3d.html', round(len(html) / 1024), 'KB')


def phong(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.isfile(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def phong_to(im, k):
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def tren_nen(im, mau=NEN):
    bg = Image.new('RGBA', im.size, mau); bg.alpha_composite(im); return bg


def xem_truoc(names, meta, frames_img, dich):
    os.makedirs(dich, exist_ok=True)
    S, LW = 3, 150
    cols = meta['cols']
    W, H = LW + cols * (CELL * S + 4), len(names) * (CELL * S + 6) + 8
    g = Image.new('RGBA', (W, H), (24, 22, 30, 255))
    d = ImageDraw.Draw(g)
    f1, f2 = phong(15), phong(11)
    for r, k in enumerate(names):
        y = 4 + r * (CELL * S + 6)
        d.text((8, y + 6), k, fill=(230, 226, 240), font=f1)
        d.text((8, y + 26), '%d khung' % len(frames_img[k]), fill=(150, 146, 165), font=f2)
        for c, (im, hold, ten) in enumerate(frames_img[k]):
            x = LW + c * (CELL * S + 4)
            fr = meta['anims'][k]['frames'][c]
            nen = (54, 46, 64, 255) if not fr['hit'] else (78, 60, 52, 255)
            o = tren_nen(phong_to(im, S), nen)
            g.paste(o, (x, y))
            if fr['comboWindow']:
                d.rectangle([x, y, x + CELL * S - 1, y + CELL * S - 1], outline=(131, 204, 147))
            # đường đất
            d.line([x, y + PIV[1] * S, x + CELL * S - 1, y + PIV[1] * S], fill=(90, 80, 100))
    g.save(os.path.join(dich, 'xem-truoc.png'), optimize=True)
    # GIF ×6
    def gif(ten, ds):
        anh, tg = [], []
        for im, hold in ds:
            anh.append(tren_nen(phong_to(im, 6)).convert('RGB').quantize(colors=64, method=Image.MEDIANCUT))
            tg.append(int(1000 / 12 * hold))
        anh[0].save(os.path.join(dich, ten), save_all=True, append_images=anh[1:], duration=tg, loop=0, disposal=2)
    for k in ('idle', 'run', 'jump', 'echoCast'):
        n = 2 if meta['anims'][k]['loop'] else 1
        ds = [(im, h) for im, h, _ in frames_img[k]] * n
        if not meta['anims'][k]['loop']:
            ds[-1] = (ds[-1][0], 6)
        gif(k + '.gif', ds)
    combo = [(im, h) for k in ('attack', 'attack2', 'attack3') for im, h, _ in frames_img[k]]
    combo[-1] = (combo[-1][0], 8)
    gif('attack-combo.gif', combo)
    so_sanh(frames_img, dich)
    print('Đã ghi xem-truoc.png, so-sanh.png, 5 GIF vào', dich)


def so_sanh(frames_img, dich):
    """Cùng 4 tư thế: bản 24 cũ | rig 2D 48 | 3D mới — phóng ×4, canh theo chân."""
    atlas = json.load(open(os.path.join(SPRITE, 'atlas.json'), encoding='utf-8'))
    nguon = []
    for key, f in (('lam', 'lam.png'), ('lam48', 'lam48.png')):
        if key in atlas:
            nguon.append((key, atlas[key], Image.open(os.path.join(SPRITE, f)).convert('RGBA')))
    TU = [('idle', 0, 'Đứng'), ('run', 3, 'Chạy'), ('jump', 3, 'Nhảy'), ('attack', 4, 'Chém (HIT)')]
    S, CW, RH = 4, 70 * 4, 70 * 4
    cot = ['Bản 24 cũ', 'Rig 2D 48', '3D mới']
    W, H = 120 + len(cot) * (CW + 10), 40 + len(TU) * (RH + 10)
    g = Image.new('RGBA', (W, H), (24, 22, 30, 255))
    d = ImageDraw.Draw(g)
    f1 = phong(18)
    for i, t in enumerate(cot):
        d.text((120 + i * (CW + 10) + 10, 10), t, fill=(230, 226, 240), font=f1)
    for r, (an, fi, nhan) in enumerate(TU):
        y = 40 + r * (RH + 10)
        d.text((10, y + RH // 2 - 10), nhan, fill=(230, 226, 240), font=f1)
        o = []
        for key, m, im in nguon:
            a = m['anims'][an]; f = a['frames'][min(fi, len(a['frames']) - 1)]
            o.append((im.crop((f['x'], f['y'], f['x'] + m['w'], f['y'] + m['h'])), m['pivot']))
        o.append((frames_img[an][min(fi, len(frames_img[an]) - 1)][0], {'x': PIV[0], 'y': PIV[1]}))
        for c, (im, pv) in enumerate(o):
            x = 120 + c * (CW + 10)
            box = Image.new('RGBA', (CW, RH), NEN)
            big = phong_to(im, S)
            px, py = int(CW / 2 - pv['x'] * S), int(RH - 12 - pv['y'] * S)
            box.alpha_composite(big, (max(0, px), max(0, py)) if px >= 0 and py >= 0 else (0, 0))
            dd = ImageDraw.Draw(box)
            dd.line([0, RH - 12, CW, RH - 12], fill=(90, 80, 100))
            g.paste(box, (x, y))
    g.save(os.path.join(dich, 'so-sanh.png'), optimize=True)


if __name__ == '__main__':
    main()
