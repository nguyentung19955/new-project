#!/usr/bin/env python3
"""In sẵn Lam 3D → pixel: dựng mô hình 3D (tools/lam3d-core.js + lam3d-anim.js) trong Chromium headless
(WebGL phần mềm SwiftShader), render 26 animation ở HAI CỠ rồi ghi:
  art/sprite/lam3d.png       — Lam cao ~46 px, ô 64×64, pivot giữa chân (32,59)   → khóa "lam3d"
  art/sprite/lam3d36.png     — Lam cao ~36 px, ô 48×48, pivot giữa chân (24,44)   → khóa "lam3d36"
  art/sprite/atlas.json      — thêm/cập nhật 2 khóa trên (cùng định dạng lam/lam48, đọc bởi game/lib/atlas-in-san.js)
Tùy chọn:
  --xem        ghi thêm art/nhan-vat/lam-3d/: xem-truoc.png (46), xem-truoc-36.png, so-sanh.png,
               GIF ×6 (idle, run, jump, land, attack-combo, echoCast — mỗi GIF đặt cỡ 36 cạnh cỡ 46)
  --ss 1       render thẳng (mặc định 2 = render ×2 rồi gộp màu đa số — nét mũ/kiếm sạch hơn)
  --ra THƯ_MỤC ghi mọi ảnh vào thư mục khác (không đụng atlas.json; thêm atlas-thu.json + bong-x1.png để soát silhouette)
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
CO = {46: {'key': 'lam3d', 'anh': 'lam3d.png', 'cell': 64, 'piv': (32, 59)},
      36: {'key': 'lam3d36', 'anh': 'lam3d36.png', 'cell': 48, 'piv': (24, 44)}}
CELL, PIV = 64, (32, 59)   # cỡ đang xử lý (đặt lại theo từng cỡ)
NEN = (42, 36, 51, 255)


def three_src():
    for p in (os.environ.get('THREE_JS'), os.path.join(ROOT, 'game', 'tools', 'node_modules', 'three', 'build', 'three.min.js')):
        if p and os.path.isfile(p):
            return {'path': p}
    return {'url': CDN}


JS = """([ss, cao, chi]) => {
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true });
  R.setPixelRatio(1);
  const lam = LAM3D.tao(THREE, { ss, cao });
  const n = lam.O.o;
  const out = { thuTu: LAM3D.THU_TU, combo: LAM3D.COMBO, fps: LAM3D.FPS, anims: {} };
  if (chi) out.thuTu = LAM3D.THU_TU.filter(t => chi.includes(t));
  for (const ten of out.thuTu) {
    const A = LAM3D.ANIMS[ten], fr = lam.chayAnim(R, ten);
    out.anims[ten] = { loop: A.loop, label: A.label, lechVong: fr.lechVong, lechPhan: fr.lechPhan, frames: fr.map(f => {
      let s = ''; const b = f.px; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192));
      let x0 = 99, y0 = 99, x1 = -1, y1 = -1;
      if (f.hit) for (let q = 0; q < f.id.length; q++) { const v = f.id[q]; if (v === LAM3D.ID.luoi || v === LAM3D.ID.chem) { const x = q % n, y = (q / n) | 0;
        if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; } }
      let ids = ''; for (let i = 0; i < f.id.length; i += 8192) ids += String.fromCharCode.apply(null, f.id.subarray(i, i + 8192));
      return { name: f.ten, hold: f.hold, hit: f.hit, comboWindow: f.comboWindow, px: btoa(s), id: btoa(ids),
               kiem: x1 >= 0 ? { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null };
    }) };
  }
  return out;
}"""


def dung(ss, cac_co):
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
        chi = sys.argv[sys.argv.index('--chi') + 1].split(',') if '--chi' in sys.argv else None   # chỉ in vài hoạt cảnh (thử nhanh, kèm --ra)
        out = {c: page.evaluate(JS, [ss, c, chi]) for c in cac_co}
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


def dat_co(c):
    global CELL, PIV
    CELL, PIV = CO[c]['cell'], CO[c]['piv']


def dong_goi(out, c, ss):
    """Ghép khung của một cỡ thành atlas + meta; trả về (sheet, meta, frames_img, ids)."""
    dat_co(c)
    names = out['thuTu']
    cols = max(len(out['anims'][k]['frames']) for k in names)
    sheet = Image.new('RGBA', (cols * CELL, len(names) * CELL), (0, 0, 0, 0))
    meta = {'w': CELL, 'h': CELL, 'cols': cols, 'rows': len(names), 'fps': out['fps'], 'cao': c,
            'pivot': {'x': PIV[0], 'y': PIV[1]}, 'combo': out['combo'], 'anims': {}, 'kiemTra': [], 'anh': CO[c]['anh']}
    frames_img, ids = {}, {}
    for r, k in enumerate(names):
        a = out['anims'][k]
        fr, hb = [], None
        for col, f in enumerate(a['frames']):
            im = o_anh(f['px'])
            sheet.paste(im, (col * CELL, r * CELL))
            fr.append({'x': col * CELL, 'y': r * CELL, 'hold': f['hold'], 'hit': f['hit'], 'comboWindow': f['comboWindow'], 'name': f['name']})
            if f['hit'] and f['kiem'] and hb is None:
                hb = f['kiem']
            loi = kiem_tra(im)
            if loi:
                meta['kiemTra'].append({'anim': k, 'frame': col, 'loi': loi})
            frames_img.setdefault(k, []).append((im, f['hold'], f['name']))
            ids.setdefault(k, []).append(base64.b64decode(f['id']))
        meta['anims'][k] = {'row': r, 'loop': a['loop'], 'label': a['label'], 'frames': fr}
        if hb:
            meta['anims'][k]['hitbox'] = hb   # vùng lưỡi kiếm + vệt chém ở khung HIT (tọa độ trong ô)
    lv = {k: (round(out['anims'][k]['lechVong'], 2), out['anims'][k]['lechPhan']) for k in names if out['anims'][k].get('lechVong') is not None}
    print('Cỡ %d: %s %s · ss %d · %d khung · sát mép: %d · lệch khép vòng (px): %s' % (
        c, CO[c]['anh'], sheet.size, ss, sum(len(meta['anims'][k]['frames']) for k in names), len(meta['kiemTra']), lv))
    return sheet, meta, frames_img, ids


def main():
    xem = '--xem' in sys.argv
    ss = int(sys.argv[sys.argv.index('--ss') + 1]) if '--ss' in sys.argv else 2
    ra = sys.argv[sys.argv.index('--ra') + 1] if '--ra' in sys.argv else None
    cac_co = (46, 36)
    outs = dung(ss, cac_co)
    dich = ra or SPRITE
    os.makedirs(dich, exist_ok=True)
    goi = {}
    for c in cac_co:
        sheet, meta, frames_img, ids = dong_goi(outs[c], c, ss)
        sheet.save(os.path.join(dich, CO[c]['anh']), optimize=True)
        goi[c] = (meta, frames_img, ids)
    jp = os.path.join(SPRITE, 'atlas.json') if not ra else os.path.join(ra, 'atlas-thu.json')
    atlas = json.load(open(jp, encoding='utf-8')) if os.path.isfile(jp) else {}
    for c in cac_co:
        atlas[CO[c]['key']] = goi[c][0]
    with open(jp, 'w', encoding='utf-8') as fh:
        json.dump(atlas, fh, ensure_ascii=False, separators=(',', ':'))
    if not ra:
        dung_studio()
    elif '--chi' not in sys.argv:
        bong(outs[cac_co[0]]['thuTu'], goi, ra)
    if xem:
        xem_truoc(outs[46]['thuTu'], goi, ra or LAM3D)


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


ID_MU, ID_MAT2, ID_VIENMU, ID_MAT, ID_LUOI, ID_CHUOI, ID_CHUONG = 1, 18, 3, 2, 14, 15, 16
NHOM_MAU = {}   # tô theo nhóm để soát silhouette: mũ đỏ, kiếm vàng, chuông cam, mắt trắng, còn lại xám
for i_ in (1, 3, 2): NHOM_MAU[i_] = (200, 70, 70)
for i_ in (14, 15): NHOM_MAU[i_] = (240, 220, 80)
NHOM_MAU[16] = (255, 140, 30); NHOM_MAU[18] = (255, 255, 255)


def soat(im, idb):
    """Đếm pixel chi tiết nhỏ ở ×1 & chỗ chuông dính thẳng vào mũ (không có viền tối xen giữa)."""
    w = im.width; px = im.load()
    VIEN = (12, 15, 20)
    def vien(x, y): return px[x, y][:3] == VIEN
    dem = {'mat': 0, 'chuong': 0, 'kiem': 0, 'dinh': 0}
    for y in range(w):
        for x in range(w):
            v = idb[y * w + x]
            if v == ID_MAT2 and px[x, y][3] and not vien(x, y): dem['mat'] += 1
            elif v == ID_CHUONG and not vien(x, y):
                dem['chuong'] += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    X, Y = x + dx, y + dy
                    if 0 <= X < w and 0 <= Y < w and idb[Y * w + X] in (ID_MU, ID_VIENMU) and not vien(X, Y): dem['dinh'] += 1
            elif v in (ID_LUOI, ID_CHUOI) and not vien(x, y): dem['kiem'] += 1
    return dem


def bong(names, goi, dich):
    """bong-x1.png: mỗi cỡ, mỗi khung — ảnh ×1 thật | ×3 | bản đồ nhóm ×3 (soát mũ/kiếm/chuông có dính khối không)."""
    for c, (meta, frames_img, ids) in goi.items():
        dat_co(c)
        S = 3; cw = CELL * S * 2 + CELL + 12
        cols = meta['cols']
        g = Image.new('RGBA', (110 + cols * cw, len(names) * (CELL * S + 18) + 6), (24, 22, 30, 255))
        d = ImageDraw.Draw(g); f2 = phong(11)
        canh = []
        for r, k in enumerate(names):
            y = 4 + r * (CELL * S + 18)
            d.text((6, y + 4), k, fill=(230, 226, 240), font=f2)
            for col, (im, hold, ten) in enumerate(frames_img[k]):
                x = 110 + col * cw
                idb = ids[k][col]
                g.paste(tren_nen(im, (54, 46, 64, 255)), (x, y))
                g.paste(tren_nen(phong_to(im, S), (54, 46, 64, 255)), (x + CELL + 4, y))
                m = Image.new('RGBA', (CELL, CELL), (54, 46, 64, 255)); mp = m.load(); ip = im.load()
                for q in range(CELL * CELL):
                    X, Y = q % CELL, q // CELL
                    if ip[X, Y][3]:
                        mp[X, Y] = NHOM_MAU.get(idb[q], (20, 20, 24) if ip[X, Y][:3] == (12, 15, 20) else (120, 120, 130)) + (255,)
                g.paste(phong_to(m, S), (x + CELL + 8 + CELL * S, y))
                sm = soat(im, idb)
                d.text((x, y + CELL * S + 2), 'h%d m%d c%d k%d d%d' % (hold, sm['mat'], sm['chuong'], sm['kiem'], sm['dinh']),
                       fill=(255, 120, 120) if (sm['dinh'] > 2 or (k in ('idle', 'run') and sm['mat'] < 2)) else (150, 146, 165), font=f2)
                if sm['dinh'] > 2: canh.append((k, col, 'chuông dính mũ %d' % sm['dinh']))
        g.save(os.path.join(dich, 'bong-x1-%d.png' % c))
        print('Soát cỡ %d:' % c, canh or 'ổn')


def xem_truoc(names, goi, dich):
    os.makedirs(dich, exist_ok=True)
    for c, (meta, frames_img, ids) in goi.items():
        dat_co(c)
        S, LW = (3 if c == 46 else 4), 150
        cols = meta['cols']
        W, H = LW + cols * (CELL * S + 4), len(names) * (CELL * S + 6) + 8
        g = Image.new('RGBA', (W, H), (24, 22, 30, 255))
        d = ImageDraw.Draw(g)
        f1, f2 = phong(15), phong(11)
        for r, k in enumerate(names):
            y = 4 + r * (CELL * S + 6)
            d.text((8, y + 6), k, fill=(230, 226, 240), font=f1)
            d.text((8, y + 26), '%d khung' % len(frames_img[k]), fill=(150, 146, 165), font=f2)
            for col, (im, hold, ten) in enumerate(frames_img[k]):
                x = LW + col * (CELL * S + 4)
                fr = meta['anims'][k]['frames'][col]
                nen = (54, 46, 64, 255) if not fr['hit'] else (78, 60, 52, 255)
                g.paste(tren_nen(phong_to(im, S), nen), (x, y))
                if fr['comboWindow']:
                    d.rectangle([x, y, x + CELL * S - 1, y + CELL * S - 1], outline=(131, 204, 147))
                d.line([x, y + PIV[1] * S, x + CELL * S - 1, y + PIV[1] * S], fill=(90, 80, 100))
                if hold > 1:
                    d.text((x + 4, y + 3), '×%d' % hold, fill=(225, 184, 90), font=f2)
        g.save(os.path.join(dich, 'xem-truoc.png' if c == 46 else 'xem-truoc-%d.png' % c), optimize=True)
    # GIF ×6: cỡ 36 (trái) cạnh cỡ 46 (phải), cùng phóng ×5, canh theo chân, thời lượng theo "hold"
    K = 5
    def o(c, im):
        dat_co(c)
        b = Image.new('RGBA', (64 * K, 64 * K), NEN)
        b.alpha_composite(phong_to(im, K), (int(32 * K - PIV[0] * K), int(59 * K - PIV[1] * K)))
        return b
    def gif(ten, ds36, ds46):
        anh, tg = [], []
        for (a36, h), (a46, _) in zip(ds36, ds46):
            fr = Image.new('RGBA', (128 * K + 8, 64 * K), (24, 22, 30, 255))
            fr.paste(o(36, a36), (0, 0)); fr.paste(o(46, a46), (64 * K + 8, 0))
            anh.append(fr.convert('RGB').quantize(colors=64, method=Image.MEDIANCUT))
            tg.append(int(1000 / 12 * h))
        anh[0].save(os.path.join(dich, ten), save_all=True, append_images=anh[1:], duration=tg, loop=0, disposal=2)
    def ds(c, k, n=1):
        x = [(im, h) for im, h, _ in goi[c][1][k]] * n
        return x
    for k in ('idle', 'run', 'jump', 'land', 'echoCast'):
        n = 2 if goi[46][0]['anims'][k]['loop'] else 1
        a, b = ds(36, k, n), ds(46, k, n)
        if not goi[46][0]['anims'][k]['loop']:
            a[-1] = (a[-1][0], 8); b[-1] = (b[-1][0], 8)
        gif(k + '.gif', a, b)
    a = [x for k in ('attack', 'attack2', 'attack3') for x in ds(36, k)]
    b = [x for k in ('attack', 'attack2', 'attack3') for x in ds(46, k)]
    a[-1] = (a[-1][0], 8); b[-1] = (b[-1][0], 8)
    gif('attack-combo.gif', a, b)
    so_sanh(goi, dich)
    print('Đã ghi xem-truoc.png, xem-truoc-36.png, so-sanh.png, 6 GIF vào', dich)


def so_sanh(goi, dich):
    """Cùng 4 tư thế: bản 24 cũ | rig 2D 48 | 3D cỡ 36 | 3D cỡ 46 — phóng ×4, canh theo chân."""
    atlas = json.load(open(os.path.join(SPRITE, 'atlas.json'), encoding='utf-8'))
    nguon = []
    for key, f in (('lam', 'lam.png'), ('lam48', 'lam48.png')):
        if key in atlas:
            nguon.append((key, atlas[key], Image.open(os.path.join(SPRITE, f)).convert('RGBA')))
    TU = [('idle', 0, 'Đứng'), ('run', 3, 'Chạy'), ('jump', 3, 'Nhảy'), ('attack', None, 'Chém (HIT)')]
    S, CW, RH = 4, 70 * 4, 70 * 4
    cot = ['Bản 24 cũ', 'Rig 2D 48', '3D cỡ 36', '3D cỡ 46']
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
            a = m['anims'][an]
            j = fi if fi is not None else max(0, next((q for q, f in enumerate(a['frames']) if f.get('hit')), 0))
            f = a['frames'][min(j, len(a['frames']) - 1)]
            o.append((im.crop((f['x'], f['y'], f['x'] + m['w'], f['y'] + m['h'])), m['pivot']))
        for c in (36, 46):
            meta, fimg, _ = goi[c]
            a = meta['anims'][an]
            j = fi if fi is not None else next(q for q, f in enumerate(a['frames']) if f['hit'])
            o.append((fimg[an][min(j, len(fimg[an]) - 1)][0], meta['pivot']))
        for col, (im, pv) in enumerate(o):
            x = 120 + col * (CW + 10)
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
