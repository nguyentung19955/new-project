"""Bài thử Lam cutout v4 – đọc lam-v4.json + manh/*.png (như runtime). Ghi ảnh/số vào ../kiem-thu/.
Đối chứng v3: nếu có ../../cutout-v3/lam-v3.json + manh/ thì vẽ thêm cột v3 (đọc bằng cùng rap4.Rig);
không có thì chỉ vẽ v4.
Chạy: python3 thu4.py                 (tất cả)
      python3 thu4.py nghi chi ...    (chọn mục: nghi chi dai khuyu lean an chop 112 slot)
"""
import os, sys, json, math, copy
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

import rap4, khung, do_mau
import khuon4 as K
from chung import font

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'kiem-thu'))
V3DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'cutout-v3'))
FB = font(20, bold=True)
F = font(14)
Fs = font(11)
INK = np.array(K.PAL['ink'])
CHECK = (255, 120, 220)
K112 = 112 / 470.0
DEV = 2.17                    # giả định devicePixelRatio cho bài thử (KHÔNG đo trên máy thật)
_R = {}


def rig(ver='v4'):
    if ver not in _R:
        if ver == 'v4':
            _R[ver] = rap4.load_default()
        else:
            j = os.path.join(V3DIR, 'lam-v3.json')
            _R[ver] = rap4.Rig(j, os.path.join(V3DIR, 'manh')) if os.path.isfile(j) else None
    return _R[ver]


def versions():
    return [v for v in ('v3', 'v4') if rig(v) is not None]


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, name); img.save(p); print('  ', name)
    return p


def dump(obj, name):
    json.dump(obj, open(os.path.join(OUT, name), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('  ', name)


def bg_check(size, s=20, col=CHECK):
    im = Image.new('RGBA', size, (255, 255, 255, 255)); d = ImageDraw.Draw(im)
    for y in range(0, size[1], s):
        for x in range(0, size[0], s):
            if (x // s + y // s) % 2:
                d.rectangle([x, y, x + s - 1, y + s - 1], fill=col + (255,))
    return im


def on_bg(cv, kind):
    if kind == 'caro':
        o = bg_check(cv.size, 8, (200, 200, 200))
    elif kind == 'toi':
        o = Image.new('RGBA', cv.size, (28, 30, 44, 255))
    elif kind == 'hong':
        o = bg_check(cv.size)
    elif kind == 'trang':
        o = Image.new('RGBA', cv.size, (255, 255, 255, 255))
    else:
        o = Image.new('RGBA', cv.size, (236, 232, 220, 255))
    o.alpha_composite(cv); return o


def label(im, text, font_=F, pos=(6, 4), col=(0, 0, 0)):
    d = ImageDraw.Draw(im); d.text(pos, text, fill=col, font=font_); return im


def grid(cells, cols, pad=8, bg=(255, 255, 255)):
    w = max(c.width for c in cells); h = max(c.height for c in cells)
    rows = (len(cells) + cols - 1) // cols
    o = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + pad) + pad), bg)
    for i, c in enumerate(cells):
        o.paste(c.convert('RGB'), (pad + (i % cols) * (w + pad), pad + (i // cols) * (h + pad)))
    return o


def stack(rows, bg=(255, 255, 255)):
    W = max(r.width for r in rows); o = Image.new('RGB', (W, sum(r.height for r in rows)), bg); y = 0
    for r in rows:
        o.paste(r.convert('RGB'), (0, y)); y += r.height
    return o


def header(text, w, h=28):
    im = Image.new('RGB', (w, h), 'white'); label(im, text, F); return im


# ---------------- tư thế ----------------
def pose_world(r, spec, lean=0.0, extra=None):
    """spec: {chuoi: [góc thế giới đoạn 1, 2, 3]} → pose (delta cục bộ) cho rig r. Góc thế giới tính cả lean."""
    g = {'than': lean}
    for ch, ws in spec.items():
        names = khung.CHAIN[ch]
        prev = r.inst['than']['goc_nghi'] + lean
        for n, w in zip(names, ws):
            g[n] = (w - prev) - r.inst[n]['goc_nghi']
            prev = w
    if extra:
        for k, v in extra.items():
            g[k] = g.get(k, 0.0) + v
    return {'goc': g}


def limb_angles(kind, b):
    """Như v3: tay [95, 95−b, 95−b]; chân up=90−0,45b, lo=up+b, ủng 90+(lo−90)·0,5."""
    if kind == 'tay':
        return [95, 95 - b, 95 - b]
    up = 90 - b * 0.45; lo = up + b
    return [up, lo, 90 + (lo - 90) * 0.5]


KEEP = {'tay-gan': ['than', 'vat-sau', 'dai', 'tay-tren-gan', 'cang-tay-gan', 'gang-gan'],
        'tay-xa': ['than', 'vat-sau', 'dai', 'tay-tren-xa', 'cang-tay-xa', 'gang-xa', 'capelet-sau'],
        'chan-gan': ['than', 'vat-sau', 'dai', 'dui-gan', 'cang-chan-gan', 'ung-gan'],
        'chan-xa': ['than', 'vat-sau', 'dai', 'dui-xa', 'cang-chan-xa', 'ung-xa']}
LIMB_BOX = {'tay-gan': (180, 250, 400, 470), 'tay-xa': (20, 250, 240, 470),
            'chan-gan': (150, 300, 370, 520), 'chan-xa': (60, 300, 280, 520)}


# ---------------- đo lỗi mask ----------------
def is_ink(a, tol=30):
    return (np.abs(a[..., :3].astype(int) - INK).max(-1) <= tol)


def disc_k(r):
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    return xx * xx + yy * yy <= r * r


def mask_errors(cv, joints=(), r_joint=18, t_line=K.T_LINE, r_mo=3):
    """- vien_ho: điểm màu sát nền (silhouette không viền). - khe_nen: lỗ nền kín.
    - khe_mo_gan_khop (MỚI v4): điểm nền nằm trong bao đóng hình thái r_mo px của hình nhưng ngoài hình, gần khớp
      → khe/ngấn hở THÔNG ra nền ngoài (vien_ho/khe_nen không bắt được). Gồm cả hốc hình hợp lệ hẹp – đọc cùng ảnh.
    - net_trong_khop: điểm viền nằm sâu trong hình gần khớp (gồm cả nếp gấp hợp lệ, KHÔNG phải tỉ lệ lỗi)."""
    a = np.array(cv); A = a[..., 3] > 127
    ink = is_ink(a) & A
    nb = np.zeros_like(A)
    nb[1:] |= ~A[:-1]; nb[:-1] |= ~A[1:]; nb[:, 1:] |= ~A[:, :-1]; nb[:, :-1] |= ~A[:, 1:]
    ho = A & ~ink & nb
    bgl, n = ndimage.label(~A)
    border = set(np.unique(np.concatenate([bgl[0], bgl[-1], bgl[:, 0], bgl[:, -1]]))) - {0}
    khe = (~A) & ~np.isin(bgl, list(border)) & (bgl > 0)
    clo = ndimage.binary_closing(np.pad(A, r_mo + 2), structure=disc_k(r_mo))[r_mo + 2:-r_mo - 2, r_mo + 2:-r_mo - 2]
    mo = clo & ~A & ~khe
    dt = ndimage.distance_transform_edt(A)
    deep = ink & (dt > t_line + 3)
    yy, xx = np.mgrid[:A.shape[0], :A.shape[1]]
    near = np.zeros_like(A); near2 = np.zeros_like(A)
    for (jx, jy) in joints:
        d2 = (xx - jx) ** 2 + (yy - jy) ** 2
        near |= d2 <= r_joint ** 2; near2 |= d2 <= (r_joint + 12) ** 2
    trong = deep & near
    return dict(vien_ho=int(ho.sum()), khe_nen=int(khe.sum()), khe_gan_khop=int((khe & near2).sum()),
                khe_mo_gan_khop=int((mo & near2).sum()), net_trong_khop=int(trong.sum())), (ho, khe, trong, mo & near2)


def mark(cv, masks, scale=1):
    ho, khe, trong, mo = masks
    o = on_bg(cv, 'hong'); a = np.array(o)
    a[trong] = (0, 200, 255, 255); a[mo] = (255, 160, 0, 255); a[ho] = (255, 0, 0, 255); a[khe] = (0, 255, 0, 255)
    im = Image.fromarray(a)
    if scale != 1:
        im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    return im


def joints(r, pose, names):
    M, _ = r.matrices(pose); out = []
    for n in names:
        d = r.inst[n]
        if d['D'] is not None:
            out.append(tuple(rap4.app(M[n], d['D'])))
    return out


def sil(cv, col=(30, 30, 30)):
    """Silhouette đơn sắc (chưa đánh dấu) trên nền trắng."""
    a = np.array(cv)[..., 3] > 127
    o = np.full(a.shape + (3,), 255, np.uint8); o[a] = col
    return Image.fromarray(o)


# ================= 02: dáng nghỉ =================
def t_nghi():
    print('02 dáng nghỉ: mẫu / v3 / v4 / chồng / silhouette')
    m = Image.open(os.path.join(HERE, 'master-s.png')).convert('RGBA')
    mrgb = np.array(m.convert('RGB'))
    res = {}
    cvs = {v: rap4.render(rig(v).layers()) for v in versions()}
    for v, cv in cvs.items():
        res[v] = do_mau.mask_iou(cv, mrgb)

    def wb(c):
        a = Image.new('RGBA', (520, 520), 'white'); a.alpha_composite(c); return a
    cells = [label(wb(m), 'ảnh mẫu 02 (master-s.png)')]
    for v, cv in cvs.items():
        cells.append(label(wb(cv), '%s IoU %.4f họ màu %.4f' % (v, res[v]['iou'], res[v]['khop_ho_mau'])))
    cells.append(label(Image.blend(wb(m), wb(cvs['v4']), .5), 'chồng mẫu + v4 50 %'))
    a = np.zeros((520, 520), bool); a[:mrgb.shape[0], :mrgb.shape[1]] = mrgb.min(-1) < 235
    o = np.full((520, 520, 3), 255, np.uint8)
    b4 = np.array(cvs['v4'])[..., 3] > 127
    if 'v3' in cvs:
        b3 = np.array(cvs['v3'])[..., 3] > 127
        o[b3 & b4] = (170, 170, 170); o[b3 & ~b4] = (230, 40, 40); o[b4 & ~b3] = (40, 90, 230)
        res['silhouette_v3_v4'] = dict(chi_v3=int((b3 & ~b4).sum()), chi_v4=int((b4 & ~b3).sum()), chung=int((b3 & b4).sum()))
        cells.append(label(Image.fromarray(o), 'silhouette: xám chung, đỏ chỉ v3, xanh chỉ v4'))
    o = np.full((520, 520, 3), 255, np.uint8)
    o[a & b4] = (170, 170, 170); o[a & ~b4] = (230, 40, 40); o[b4 & ~a] = (40, 90, 230)
    cells.append(label(Image.fromarray(o), 'silhouette: đỏ chỉ mẫu, xanh chỉ v4'))
    for c in cells:
        ImageDraw.Draw(c).line([(0, 468), (519, 468)], fill=(255, 0, 0))
    o = grid(cells, 3)
    # phóng vùng chân
    zs = []
    for c, lab in ((wb(m), 'mẫu'), *[(wb(cvs[v]), v) for v in cvs]):
        zs.append(label(c.crop((140, 320, 390, 490)).resize((500, 340), Image.LANCZOS), lab + ' – vùng chân ×2'))
    save(stack([header('Dáng nghỉ cùng gốc/scale (gốc P thân (220,350), đất y=468 – vạch đỏ). v4: hông gần [81,45].',
                       o.width), o, grid(zs, 3)]), '02-nghi-mau-v3-v4-chong.png')
    J = json.load(open(os.path.join(HERE, '..', 'lam-v4.json'), encoding='utf-8'))
    res['goc_nghi_chan_gan_v4'] = {n: J['manh'][n]['goc_nghi'] for n in khung.CHAIN['chan-gan']}
    if rig('v3'):
        res['goc_nghi_chan_gan_v3'] = {n: rig('v3').inst[n]['goc_nghi'] for n in khung.CHAIN['chan-gan']}
    # cổ chân gần (P ủng) v3 vs v4 thế giới
    for v in cvs:
        M, _ = rig(v).matrices({})
        res.setdefault('co_chan_gan_the_gioi', {})[v] = [round(float(x), 3) for x in rap4.app(M['ung-gan'], rig(v).inst['ung-gan']['P'])]
        res.setdefault('huong_ung_gan', {})[v] = round(rig(v).world_dir(M, 'ung-gan'), 3)
        res.setdefault('xuong_chan_gan', {})[v] = [rig(v).inst[n]['xuong'] for n in khung.CHAIN['chan-gan'][:2]]
    dump(res, '02-nghi-so-lieu.json')
    print('   ', {k: res[k] for k in cvs})
    return res


# ================= 03/04: tay & chân =================
def limb_render(ver, ch, b, full=False, extra=None):
    r = rig(ver)
    kind = 'tay' if ch.startswith('tay') else 'chan'
    pose = pose_world(r, {ch: limb_angles(kind, b)}, extra=extra)
    L = r.layers(pose, None if full else KEEP[ch])
    return rap4.render(L), joints(r, pose, khung.CHAIN[ch][:2])


def t_chi():
    print('03 tay/chân gần–xa 0/50/105 (silhouette chưa đánh dấu + bản đánh dấu)')
    res = {}
    rows = []
    for ch in ('tay-gan', 'tay-xa', 'chan-gan', 'chan-xa'):
        cells = []
        for b in (0, 50, 105):
            for ver in versions():
                cv, J = limb_render(ver, ch, b)
                e, mk = mask_errors(cv, J)
                res['%s %s %d' % (ver, ch, b)] = e
                box = LIMB_BOX[ch]
                s1 = sil(cv).crop(box)
                label(s1, '%s %s %d° silhouette' % (ver, ch, b), Fs)
                im = mark(cv, mk).crop(box)
                label(im, '%s %d°' % (ver, b), FB)
                label(im, 'hở %d · khe %d · khe mở %d · nét trong %d' % (
                    e['vien_ho'], e['khe_nen'], e['khe_mo_gan_khop'], e['net_trong_khop']), Fs, (4, im.height - 16))
                cells += [s1, im]
        rows.append(grid(cells, 12, pad=4))
    o = stack([header('Đỏ = viền hở, xanh lá = khe nền kín, cam = khe mở thông ra nền gần khớp (bao đóng r3), '
                      'xanh dương = viền sâu gần khớp (gồm nếp gấp hợp lệ).', 1600)] + rows)
    save(o, '03-tay-chan-gan-xa-0-50-105.png')
    dump(res, '03-tay-chan-so-lieu.json')
    return res


def t_dai():
    print('04 dải góc trung gian 0–120 mỗi 10°')
    res = {}
    for ch in ('tay-gan', 'tay-xa', 'chan-gan', 'chan-xa'):
        cells = []
        for ver in versions():
            for b in range(0, 121, 10):
                cv, J = limb_render(ver, ch, b)
                e, mk = mask_errors(cv, J)
                res['%s %s %d' % (ver, ch, b)] = e
                box = LIMB_BOX[ch]
                im = mark(cv, mk).crop(box)
                label(im, '%s %d°' % (ver, b), F)
                label(im, 'hở %d khe %d mở %d trong %d' % (e['vien_ho'], e['khe_nen'], e['khe_mo_gan_khop'],
                                                          e['net_trong_khop']), Fs, (4, im.height - 14))
                cells.append(im)
        save(grid(cells, 13), '04-dai-goc-%s.png' % ch)
    tong = {}
    for ver in versions():
        for ch in ('tay-gan', 'tay-xa', 'chan-gan', 'chan-xa'):
            ks = ['%s %s %d' % (ver, ch, b) for b in range(0, 121, 10)]
            tong['%s %s' % (ver, ch)] = {m: sum(res[k][m] for k in ks) for m in ('vien_ho', 'khe_nen', 'khe_mo_gan_khop')}
    res['tong_13_goc'] = tong
    dump(res, '04-dai-goc-so-lieu.json')
    print('   ', tong)
    return res


# ================= 05: khuỷu duỗi, cổ tay, dao =================
def elbow_variant(Z):
    """Rig v4 với mảnh tay dựng lại theo khuyu_Z = Z (hoặc 'v3'); các số rig giữ nguyên (P/D không đổi)."""
    import xuat
    cfg = {'khuyu': 'v3'} if Z == 'v3' else {'khuyu_Z': float(Z)}
    pc = K.build(cfg)
    base = rig('v4')
    imgs = dict(base.img)
    M = copy.deepcopy(base.meta)
    dims = __import__('meta').dims_of(pc, K.PIECES)
    for n in ('tay-tren-gan', 'cang-tay-gan', 'tay-tren-xa', 'cang-tay-xa'):
        im = pc[n].rgba('mau', far=n.endswith('-xa'))
        imgs[n + '.png'] = im
        d = M['manh'][n]; dd = dims[n]
        d['kich_thuoc'] = [dd['w'], dd['h']]; d['P'] = dd['P']; d['D'] = dd['D']
        assert abs(dd['xuong'] - d['xuong']) < 0.02, 'xương đổi'
    for n, c in (('cang-tay-gan', 'tay-tren-gan'), ('cang-tay-xa', 'tay-tren-xa'),
                 ('gang-gan', 'cang-tay-gan'), ('gang-xa', 'cang-tay-xa')):
        M['manh'][n]['gan'] = M['manh'][c]['D']
    p = os.path.join(OUT, '_tmp_khuyu.json')
    json.dump(M, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    r = rap4.Rig(p, images=imgs); os.remove(p)
    return r, pc.get('_khuyu', {})


def width_profile(cv, P, u, span=18):
    """Bề rộng silhouette (alpha) đo vuông góc trục u tại các điểm s ∈ [−span, span] quanh khớp P."""
    A = np.array(cv)[..., 3] > 127
    n = np.array([-u[1], u[0]]); out = []
    for s in np.arange(-span, span + 0.5, 1.0):
        c = np.array(P) + s * np.array(u); ext = []
        for sg in (1, -1):
            r = 0.0
            while r < 60:
                q = c + sg * (r + 0.5) * n; x, y = int(round(q[0])), int(round(q[1]))
                if not (0 <= y < A.shape[0] and 0 <= x < A.shape[1]) or not A[y, x]:
                    break
                r += 0.5
            ext.append(r)
        out.append(ext)
    return np.array(out)


def t_khuyu():
    print('05 khuỷu duỗi / cổ tay / dao – v3 vs v4 Z 8/10/12')
    res = {}
    variants = [('v3', 'v3')] + [('Z%d' % z, z) for z in (8, 10, 12)]
    rigs = {}
    for lab, z in variants:
        rigs[lab], rep = elbow_variant(z)
        res.setdefault('bao_cao_dung', {})[lab] = rep
    # (a) duỗi thẳng và vài góc gập: phóng ×3 quanh khuỷu + bậc bề rộng
    cells = []
    for s in ('gan', 'xa'):
        ch = 'tay-' + s
        for lab, _ in variants:
            r = rigs[lab]
            for b in (0, 15, 30, 60, 100):
                pose = pose_world(r, {ch: limb_angles('tay', b)})
                M, _ = r.matrices(pose)
                P = rap4.app(M['cang-tay-' + s], r.inst['cang-tay-' + s]['P'])
                cv = rap4.render(r.layers(pose, ['tay-tren-' + s, 'cang-tay-' + s, 'gang-' + s]))
                if b == 0:
                    u = np.array([math.cos(math.radians(95)), math.sin(math.radians(95))])
                    wp = width_profile(cv, P, u)
                    jump = np.abs(wp[4:] - wp[:-4]).max(0)      # bậc: đổi nửa rộng lớn nhất trong 4 px dọc trục
                    res.setdefault('buoc_be_rong_duoi_thang', {})['%s %s' % (lab, ch)] = dict(
                        buoc_lon_nhat_trong_4px=[round(float(x), 2) for x in jump],
                        nua_rong_tren=[round(float(x), 2) for x in wp[0]], nua_rong_duoi=[round(float(x), 2) for x in wp[-1]])
                e, mk = mask_errors(cv, [tuple(P)], r_joint=30)
                res.setdefault('loi_khuyu', {})['%s %s %d' % (lab, ch, b)] = e
                im = on_bg(cv, 'hong')
                x, y = int(P[0]), int(P[1])
                z = im.crop((x - 45, y - 45, x + 45, y + 45)).resize((270, 270), Image.NEAREST)
                label(z, '%s %s %d°' % (lab, s, b), F)
                label(z, 'khe mở %d · hở %d' % (e['khe_mo_gan_khop'], e['vien_ho']), Fs, (4, 252))
                cells.append(z)
    o = grid(cells, 10, pad=4)
    save(stack([header('Khuỷu duỗi (0°) và gập 15/30/60/100°, ×3. Hàng: v3, Z8, Z10, Z12 (gần trên, xa dưới). '
                       'Z = đoạn chuyển tiếp px thế giới; P/D/xương giữ nguyên, nắp R không đổi (27/27,5).', o.width), o]),
         '05-khuyu-duoi-v3-v4-Z.png')
    # (b) cổ tay + dao ở góc chạy/chém thực tế (rig v4 Z10)
    r = rig('v4')
    cells = []
    ARM_POSES = [('chạy: tay trước', [60, -20, -10]), ('chạy: tay sau', [125, 65, 70]),
                 ('chém: giơ', [-60, -120, -140]), ('chém: kết', [70, 40, 30]), ('chém: đâm', [20, 15, 10])]
    for s in ('gan', 'xa'):
        ch = 'tay-' + s
        for lab, ws in ARM_POSES:
            for dw in (-40, 0, 40):
                pose = pose_world(r, {ch: [ws[0], ws[1], ws[2] + dw]})
                M, _ = r.matrices(pose)
                W = rap4.app(M['gang-' + s], r.inst['gang-' + s]['P'])
                Pe = rap4.app(M['cang-tay-' + s], r.inst['cang-tay-' + s]['P'])
                keep = ['tay-tren-' + s, 'cang-tay-' + s, 'gang-' + s] + (['dao'] if s == 'gan' else [])
                cv = rap4.render(r.layers(pose, keep), (700, 700), offset=(90, 90))
                Wc = (W[0] + 90, W[1] + 90); Pc = (Pe[0] + 90, Pe[1] + 90)
                e, mk = mask_errors(cv, [Wc, Pc], r_joint=26)
                res.setdefault('co_tay', {})['%s %s co tay %+d' % (ch, lab, dw)] = e
                im = mark(cv, mk)
                cx, cy = int((Wc[0] + Pc[0]) / 2), int((Wc[1] + Pc[1]) / 2)
                z = im.crop((cx - 110, cy - 110, cx + 110, cy + 110))
                label(z, '%s %s cổ tay %+d' % (s, lab, dw), Fs)
                label(z, 'hở %d khe %d mở %d' % (e['vien_ho'], e['khe_nen'], e['khe_mo_gan_khop']), Fs, (4, 204))
                cells.append(z)
    o = grid(cells, 15, pad=4)
    save(stack([header('Cổ tay −40/0/+40° ở tư thế tay chạy/chém (góc thế giới tay trên/cẳng/găng ghi trong JSON). '
                       'Cam = khe mở gần khớp, đỏ = viền hở.', o.width), o]), '05-co-tay-dao-chay-chem.png')
    res['tu_the_tay'] = {lab: ws for lab, ws in ARM_POSES}
    dump(res, '05-khuyu-co-tay-so-lieu.json')
    print('   bậc duỗi:', {k: v['buoc_lon_nhat_trong_4px'] for k, v in res['buoc_be_rong_duoi_thang'].items()})
    return res


# ================= 06: lean + IK khoá chân =================
def rest_locks(r):
    M, _ = r.matrices({})
    out = {}
    for ch in ('chan-gan', 'chan-xa'):
        b = r.ik[ch]['xuong'][2]
        out[ch] = dict(de=[float(x) for x in r.contact_world(ch, M)], huong_ung=float(r.world_dir(M, b)))
    return out


def lean_ik_pose(r, lean, margin=0.0):
    """Lean + khoá hai chân tại điểm đế dáng nghỉ. Ngoài tầm → hạ root đúng lượng cần (báo số)."""
    locks = rest_locks(r)
    root0 = r.meta['goc']['vi_tri_nghi']
    pose = {'goc': {'than': lean}, 'khoa_chan': locks}
    drop = max(0.0, r.ha_goc_can_thiet(pose, locks, margin))
    pose['goc_toa_do'] = [root0[0], root0[1] + drop]
    return pose, drop


def t_lean():
    print('06 lean −8..+8 + IK khoá chân')
    r = rig('v4'); res = {}
    cells = []
    for lean in (-8, -6, -4, -2, 0, 2, 4, 6, 8):
        pose0 = {'goc': {'than': lean}, 'khoa_chan': rest_locks(r)}
        r.matrices(pose0); raw = copy.deepcopy(r.last_ik)          # không hạ root: báo thiếu tầm
        pose, drop = lean_ik_pose(r, lean)
        M, ang = r.matrices(pose); ik = copy.deepcopy(r.last_ik)
        row = dict(ha_root_px_the_gioi=round(drop, 3), ha_root_px_logic=round(drop * K112, 3))
        for ch in ('chan-gan', 'chan-xa'):
            row[ch] = dict(
                khong_ha_root=dict(thieu_tam_px=round(raw[ch]['thieu_px'], 3), sai_de_px=round(raw[ch]['sai_de_px'], 3),
                                   sai_de_logic=round(raw[ch]['sai_de_px'] * K112, 3)),
                co_ha_root=dict(sai_de_px=round(ik[ch]['sai_de_px'], 4), sai_de_logic=round(ik[ch]['sai_de_px'] * K112, 4),
                                sai_co_chan_px=round(ik[ch]['sai_co_chan_px'], 4),
                                sai_co_chan_logic=round(ik[ch]['sai_co_chan_px'] * K112, 4),
                                goc_goi=round(ik[ch]['goc_goi'], 2), khoang_cach=round(ik[ch]['khoang_cach'], 3),
                                tam=round(ik[ch]['tam'], 3)))
        # v3 (chỉ bù −lean ở đùi) để so độ trôi
        if rig('v3') and lean in (-8, 0, 8):
            r3 = rig('v3'); p3 = {'goc': {'than': lean, 'dui-gan': -lean, 'dui-xa': -lean}}
            M3, _ = r3.matrices(p3); M30, _ = r3.matrices({})
            row['v3_troi_co_chan_px'] = {n: [round(float(x), 2) for x in rap4.app(M3[n], r3.inst[n]['P']) -
                                             rap4.app(M30[n], r3.inst[n]['P'])] for n in ('ung-gan', 'ung-xa')}
        res['lean %+d' % lean] = row
        if lean in (-8, 0, 8):
            for ver, rr, pp in (('v4 IK', r, pose),) + ((('v3 bù đùi', rig('v3'), {'goc': {'than': lean, 'dui-gan': -lean, 'dui-xa': -lean}}),) if rig('v3') else ()):
                cv = rap4.render(rr.layers(pp))
                im = on_bg(cv, 'hong')
                d = ImageDraw.Draw(im); d.line([(0, 468), (519, 468)], fill=(255, 0, 0))
                if ver.startswith('v4'):
                    for ch in ('chan-gan', 'chan-xa'):
                        x, y = pose['khoa_chan'][ch]['de']
                        d.ellipse([x - 4, y - 4, x + 4, y + 4], outline=(0, 160, 0), width=2)
                label(im, '%s lean %+d°' % (ver, lean), FB)
                if ver.startswith('v4'):
                    label(im, 'hạ root %.2f px TG · sai đế %.3f/%.3f px TG' % (
                        drop, ik['chan-gan']['sai_de_px'], ik['chan-xa']['sai_de_px']), Fs, (6, 30))
                cells.append(im)
                z = on_bg(cv, 'hong').crop((110, 400, 330, 480)).resize((660, 240), Image.NEAREST)
                ImageDraw.Draw(z).line([(0, (468 - 400) * 3), (659, (468 - 400) * 3)], fill=(255, 0, 0))
                label(z, '%s lean %+d° – đế ×3 (vạch đỏ = đất 468)' % (ver, lean), Fs)
                cells.append(z)
    n = 4 if rig('v3') else 2
    o = grid(cells, n, pad=6)
    save(stack([header('Lean −8/0/+8. v4: thân xoay quanh P thân, IK hai đoạn khoá điểm đế dáng nghỉ (vòng xanh), '
                       'ngoài tầm → hạ root. v3: chỉ bù −lean ở đùi.', o.width), o]), '06-lean-8-0+8-ik.png')
    dump(res, '06-lean-ik-so-lieu.json')
    for k in ('lean -8', 'lean +0', 'lean +8'):
        print('   ', k, res[k]['ha_root_px_the_gioi'], {c: res[k][c]['co_ha_root']['sai_de_px'] for c in ('chan-gan', 'chan-xa')})
    return res


# ================= 07: mảnh tắt (visible=false) ở nghỉ / đầu ±10 / lean ±8 =================
def t_an():
    print('07 mảnh tắt: nghỉ, đầu ±10, lean ±8')
    res = {}; cells = []
    HID = khung.VISIBLE_FALSE
    cases = [('nghỉ', {}, 0), ('đầu −10', {'mu': -10}, 0), ('đầu +10', {'mu': 10}, 0),
             ('lean −8', {}, -8), ('lean +8', {}, 8), ('lean +8 đầu −10', {'mu': -10}, 8)]
    for lab, g, lean in cases:
        row = {}
        for ver in versions():
            r = rig(ver)
            pose = {'goc': dict(g, than=lean)}
            L = r.layers(pose); ids = rap4.render_ids(L)
            names = [x[0] for x in L]
            row[ver] = {h: int((ids == names.index(h)).sum()) if h in names else 0 for h in HID}
            row[ver]['so_lop_ve'] = len(L)
            cv = rap4.render(L)
            z = on_bg(cv, 'hong').crop((140, 180, 360, 420)).resize((330, 360), Image.NEAREST)
            label(z, '%s %s' % (ver, lab), F)
            label(z, 'px thấy: ' + ', '.join('%s %d' % (h, row[ver][h]) for h in HID), Fs, (4, 340))
            cells.append(z)
        # v4 so với v4 có bật 2 mảnh (minh hoạ vị trí cục bộ v2 nếu bật lại)
        r = rig('v4'); pose = {'goc': dict(g, than=lean), 'hien': {h: True for h in HID}}
        L = r.layers(pose); ids = rap4.render_ids(L); names = [x[0] for x in L]
        row['v4_neu_bat'] = {h: int((ids == names.index(h)).sum()) for h in HID}
        cv = rap4.render(L)
        z = on_bg(cv, 'hong').crop((140, 180, 360, 420)).resize((330, 360), Image.NEAREST)
        label(z, 'v4 %s – NẾU bật (pose.hien)' % lab, F)
        label(z, 'px thấy: ' + ', '.join('%s %d' % (h, row['v4_neu_bat'][h]) for h in HID), Fs, (4, 340))
        cells.append(z)
        # bằng chứng: tắt chỉ bỏ vẽ chính mảnh – ảnh v4 == ảnh ráp từ danh sách lớp bỏ thủ công 2 mảnh
        L_all = rig('v4').layers({'goc': dict(g, than=lean), 'hien': {h: True for h in HID}})
        a = np.array(rap4.render([x for x in L_all if x[0] not in HID]))
        b = np.array(rap4.render(rig('v4').layers({'goc': dict(g, than=lean)})))
        row['v4_khac_khi_bo_thu_cong_px'] = int((np.abs(a.astype(int) - b.astype(int)).max(-1) > 0).sum())
        res[lab] = row
    o = grid(cells, len(versions()) + 1, pad=6)
    save(stack([header('vat-truoc, capelet-truoc: v3 dịch giấu; v4 visible=false (không vẽ). Cột cuối: v4 nếu bật lại '
                       'bằng pose.hien (vị trí cục bộ v2) – chỉ minh hoạ.', o.width), o]), '07-manh-tat-dau-lean.png')
    dump(res, '07-manh-tat-so-lieu.json')
    print('   ', {k: (v.get('v3'), v['v4']) for k, v in res.items()})
    return res


# ================= 08: chóp =================
def spur_count(cv, center, r=14):
    """Điểm viền MẢNH (bị mở hình thái r=2 loại bỏ) trong đĩa r quanh hốc → vạch nhỏ/râu nét."""
    a = np.array(cv); A = a[..., 3] > 127
    ink = is_ink(a) & A
    thin = ink & ~ndimage.binary_opening(ink, structure=disc_k(2))
    yy, xx = np.mgrid[:A.shape[0], :A.shape[1]]
    near = (xx - center[0]) ** 2 + (yy - center[1]) ** 2 <= r * r
    return int((thin & near).sum())


def t_chop():
    print('08 chóp −10/−6/0/+6/+10')
    res = {}; cells = []
    box = (20, 0, 260, 200)
    for tip in (-10, -6, 0, 6, 10):
        for ver in versions():
            r = rig(ver)
            pose = {'goc': {'chop-mu': tip}}
            cv = rap4.render(r.layers(pose))
            M, _ = r.matrices(pose)
            hoc = rap4.app(M['mu'], (69, 126))
            e, mk = mask_errors(cv.crop(box))
            e['vach_manh_hoc'] = spur_count(cv, hoc)
            res['%s %+d' % (ver, tip)] = e
            im = mark(cv.crop(box), mk, 2)
            label(im, '%s chóp %+d° ×2 · hở %d khe %d · vạch mảnh ở hốc %d' % (ver, tip, e['vien_ho'], e['khe_nen'],
                                                                                e['vach_manh_hoc']), F)
            cells.append(im)
            x, y = int(hoc[0]), int(hoc[1])
            z = on_bg(cv, 'hong').crop((x - 25, y - 30, x + 25, y + 20)).resize((300, 300), Image.NEAREST)
            label(z, '%s %+d° hốc ×6' % (ver, tip), Fs)
            cells.append(z)
    n = 2 * len(versions())
    o = grid(cells, n, pad=6)
    save(stack([header('Chóp mũ. v4: mask nét cục bộ ở hốc (chóp bỏ nét trong r16 quanh hốc, mũ bo đầu nếp 3 px). '
                       '"vạch mảnh" = điểm viền mảnh trong r14 quanh hốc.', o.width), o]), '08-chop-hoc.png')
    # 0°: mũ chính + chóp so với mũ gốc (cùng mask nét) – số điểm khác
    full = K.from_src('mu', 1.0, ['ink', 'den', 'xanh', 'xanh_bong', 'ngoc', 'ngoc_bong']).rgba('mau')
    r = rig('v4'); M, _ = r.matrices({})
    ref = Image.new('RGBA', (520, 520)); rap4.put(ref, full, M['mu'])
    cvh = rap4.render(r.layers({}, ['mu', 'chop-mu']))
    dd = np.abs(np.array(ref).astype(int) - np.array(cvh).astype(int)).max(-1)
    res['v4 goc0_khac_mu_goc_from_src_px_gt8'] = int((dd > 8).sum())
    res['ghi_chu'] = ('so với mũ from_src (đã bỏ viền nguồn, kẻ lại) – KHÔNG phải ảnh mẫu nguyên bản; khác do bỏ '
                      'chủ đích gốc nếp ở hốc')
    dump(res, '08-chop-so-lieu.json')
    print('   ', {k: v['vach_manh_hoc'] for k, v in res.items() if isinstance(v, dict)})
    return res


# ================= 09: cỡ 112 px =================
CAN_W, CAN_H = 600, 520
OFF = (40, 20)


def to_px(cv_world, k):
    W, H = round(CAN_W * k), round(CAN_H * k)
    return cv_world.crop((0, 0, CAN_W, CAN_H)).resize((W, H), Image.LANCZOS)


def poses_112(r):
    P = [('nghỉ', {})]
    for b in (0, 50, 105):
        P.append(('gập %d' % b, pose_world(r, {'tay-gan': limb_angles('tay', b), 'chan-gan': limb_angles('chan', b)})))
    P.append(('chóp −10', {'goc': {'chop-mu': -10}})); P.append(('chóp +10', {'goc': {'chop-mu': 10}}))
    P.append(('đầu −10', {'goc': {'mu': -10}}))
    P.append(('lean −8 IK', lean_ik_pose(r, -8)[0])); P.append(('lean +8 IK', lean_ik_pose(r, 8)[0]))
    return P


def t_112():
    print('09 cỡ 112 px')
    r = rig('v4')
    info = dict(world_to_logic=round(K112, 6), px_the_gioi_moi_px_logic=round(1 / K112, 4), he_so_thiet_bi_gia_dinh=DEV,
                khung_the_gioi=[CAN_W, CAN_H], khung_logic=[round(CAN_W * K112), round(CAN_H * K112)],
                khung_thiet_bi=[round(CAN_W * K112 * DEV), round(CAN_H * K112 * DEV)],
                dat_logic=round((468 + OFF[1]) * K112, 2), dat_thiet_bi=round((468 + OFF[1]) * K112 * DEV, 2),
                goc_the_gioi_trong_khung=list(OFF), lam_cao_logic=112, lam_cao_thiet_bi=round(112 * DEV, 1),
                vien_logic=round(K.T_LINE * K112, 2), vien_thiet_bi=round(K.T_LINE * K112 * DEV, 2),
                ghi_chu='scale đồng nhất hai trục, khung/root/đất cố định mọi tư thế; thu bằng Pillow LANCZOS – '
                        'KHÔNG phải Canvas drawImage, chưa chạy Safari/iPhone')
    PS = poses_112(r)
    ones, big, dev = [], [], []
    for lab, pose in PS:
        cv = rap4.render(r.layers(pose), (CAN_W, CAN_H), offset=OFF)
        g = to_px(cv, K112); d = to_px(cv, K112 * DEV)
        for bgk in ('sang', 'toi', 'caro'):
            ones.append(on_bg(g, bgk))
            b = on_bg(g, bgk).resize((g.width * 4, g.height * 4), Image.NEAREST)
            label(b, '%s · %s · logic ×4' % (lab, bgk), Fs, col=(255, 255, 255) if bgk == 'toi' else (0, 0, 0))
            big.append(b)
            dev.append(label(on_bg(d, bgk), '%s · thiết bị 1:1' % lab, Fs, col=(255, 255, 255) if bgk == 'toi' else (0, 0, 0)))
    o1 = grid(ones, 15, pad=4)
    hdr = 'PX LOGIC 1:1 – khung %dx%d logic (= %dx%d thế giới ×%.4f), đất y=%.1f logic. 3 nền/tư thế: %s' % (
        info['khung_logic'][0], info['khung_logic'][1], CAN_W, CAN_H, K112, info['dat_logic'], ', '.join(l for l, _ in PS))
    save(stack([header(hdr, max(o1.width, 1400), 24), o1]), '09-112px-logic-1x1.png')
    save(stack([header('PX LOGIC phóng ×4 (NEAREST) – mỗi ô 1 px logic = 4×4', 1200), grid(big, 6, pad=6)]),
         '09-112px-logic-phong-x4.png')
    save(stack([header('PX THIẾT BỊ 1:1 – giả định devicePixelRatio %.2f (khung %dx%d, Lam cao %.0f px thiết bị). '
                       'CHƯA đo trên máy thật.' % (DEV, info['khung_thiet_bi'][0], info['khung_thiet_bi'][1],
                                                  info['lam_cao_thiet_bi']), 1400), grid(dev, 6, pad=6)]),
         '09-112px-thiet-bi-1x1.png')
    info['tu_the'] = [l for l, _ in PS]
    dump(info, '09-112px-thong-so.json')
    return info


# ================= 10: luật slot 30° – chuyển động liên tục hai chiều =================
def slot_state(r, ang, rule, hyst=None, prev=None):
    v = r.rule_value(rule, ang)
    thr = rule['khi']['nho_hon']
    if hyst is None:
        return v < thr
    lo, hi = hyst                         # vào khi < lo, ra khi > hi, giữa giữ trạng thái trước
    if prev is None:
        return v < thr                    # reset: không có trạng thái trước → dùng ngưỡng gốc
    if prev:
        return not (v > hi)
    return v < lo


def t_slot():
    print('10 luật slot – quét liên tục hai chiều (đùi và gối), nhiều góc gối/lean; so luật v3 và v4')
    r = rig('v4'); rule4 = r.meta['slot_theo_tu_the'][0]
    rule3 = copy.deepcopy(rule4); rule3['khi'].pop('bu', None)
    res = {'luat_v4': rule4, 'luat_v3_tren_rig_v4': rule3, 'quet': {}, 'rung': {}}
    d0 = r.inst['dui-gan']['goc_nghi']; k0 = r.inst['cang-chan-gan']['goc_nghi']
    cache = {}

    def pop_at(th, kn, lean):
        key = (round(th, 2), round(kn, 2), lean)
        if key not in cache:
            pose = {'goc': {'than': lean, 'dui-gan': th - d0, 'cang-chan-gan': kn - k0}}
            on = np.array(rap4.render(r.layers(pose, slot_override=lambda ang: _force(r, ang, rule4, True))))
            off = np.array(rap4.render(r.layers(pose, slot_override=lambda ang: _force(r, ang, rule4, False))))
            cache[key] = (int((np.abs(on.astype(int) - off.astype(int)).max(-1) > 40).sum()), on, off)
        return cache[key]
    cells = []
    sweeps = []
    for kn in (0, 40, 80, 110):
        for lean in (-8, 0, 8):
            for d in ('xuong', 'len'):
                th = np.arange(60, -40.01, -0.5) if d == 'xuong' else np.arange(-40, 60.01, 0.5)
                sweeps.append(('đùi %s | gối %d lean %+d' % (d, kn, lean), [(a, kn, lean) for a in th]))
    for th0 in (0, 15, 25):
        for d in ('mo', 'gap'):
            kk = np.arange(120, -0.01, -0.5) if d == 'mo' else np.arange(0, 120.01, 0.5)
            sweeps.append(('gối %s | đùi %d lean +0' % (d, th0), [(th0, k, 0) for k in kk]))
    for name, rule in (('v3', rule3), ('v4', rule4)):
        pops = []
        for lab, seq in sweeps:
            st = []
            for th, kn, lean in seq:
                ang = r.local_angles({'goc': {'than': lean, 'dui-gan': th - d0, 'cang-chan-gan': kn - k0}})
                st.append(slot_state(r, ang, rule))
            tg = [i for i in range(1, len(st)) if st[i] != st[i - 1]]
            pp = [pop_at(*seq[i])[0] for i in tg]
            pops += pp
            res['quet']['%s %s' % (name, lab)] = dict(so_lan_doi=len(tg), tai=[[round(float(x), 1) for x in seq[i][:2]] for i in tg],
                                                     px_doi_tai_khung_doi=pp)
            if name == 'v4' and lab.startswith('đùi xuong') and lab.endswith('lean +0') or (name == 'v3' and lab == 'đùi xuong | gối 110 lean +0'):
                for i in tg[:1]:
                    pv, on, off = pop_at(*seq[i])
                    for im, l2 in ((off, 'tắt'), (on, 'bật')):
                        z = on_bg(Image.fromarray(im), 'hong').crop((170, 300, 370, 480)).resize((300, 270), Image.NEAREST)
                        label(z, '%s %s đùi %.1f gối %d: %s' % (name, l2, seq[i][0], seq[i][1], pv), Fs); cells.append(z)
        res['%s_px_doi_lop_max' % name] = int(max(pops)) if pops else 0
        res['%s_so_lan_doi_moi_luot_max' % name] = max(v['so_lan_doi'] for k, v in res['quet'].items() if k.startswith(name))
    # lưới nhảy ảnh nếu đổi lớp tại (đùi, gối) – căn cứ chọn hệ số bù gối của luật v4
    res['luoi_px_doi'] = dict(dui=list(range(-30, 61, 10)), goi=list(range(0, 121, 10)),
                              px=[[pop_at(th, kn, 0)[0] for kn in range(0, 121, 10)] for th in range(-30, 61, 10)])
    # rung quanh ngưỡng (mô phỏng biến đầu vào có nhiễu), có/không hysteresis 28/32 (reset = trạng thái theo ngưỡng gốc)
    rng = np.random.default_rng(1)
    for amp in (0.5, 1.5, 3.0, 6.0):
        tt = np.arange(0, 2.0, 1 / 60)
        sig = 30 + amp * np.sin(2 * math.pi * tt / 0.64) + rng.normal(0, 0.3, len(tt))
        for hy in (None, (28, 32)):
            prev = None; st = []
            for a in sig:
                ang = r.local_angles({'goc': {'dui-gan': a - d0}})
                s_ = slot_state(r, ang, rule4, hy, prev); st.append(s_); prev = s_
            res['rung']['bien_do %.1f %s' % (amp, 'hyst 28/32' if hy else 'không hyst')] = dict(
                so_lan_doi_2s=sum(1 for i in range(1, len(st)) if st[i] != st[i - 1]))
    o = grid(cells, 4, pad=4)
    save(stack([header('Khung đổi slot khi quét đùi 60→−40 (lean 0): ảnh tắt/bật luật tại đúng khung đổi; số = px khác. '
                       'Hàng đầu: luật v3 ở gối 110; còn lại: luật v4 ở gối 0/40/80/110.', o.width), o]), '10-slot-quet-lien-tuc.png')
    dump(res, '10-slot-so-lieu.json')
    print('   px đổi lớp max v3/v4:', res['v3_px_doi_lop_max'], res['v4_px_doi_lop_max'],
          '| đổi/lượt max', res['v3_so_lan_doi_moi_luot_max'], res['v4_so_lan_doi_moi_luot_max'],
          '| rung:', {k: v['so_lan_doi_2s'] for k, v in res['rung'].items()})
    return res


def _force(r, ang, rule, on):
    sl = {n: r.inst[n]['slot'] for n in r.inst}
    if on:
        for n in rule['manh']:
            sl[n] = rule['slot']
    return sl


SECTIONS = {'nghi': t_nghi, 'chi': t_chi, 'dai': t_dai, 'khuyu': t_khuyu, 'lean': t_lean, 'an': t_an,
            'chop': t_chop, '112': t_112, 'slot': t_slot}

if __name__ == '__main__':
    want = sys.argv[1:] or list(SECTIONS)
    for k in want:
        SECTIONS[k]()
