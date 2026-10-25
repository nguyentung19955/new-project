"""Bài thử Lam cutout v3 – đọc lam-v3.json + manh/*.png (như runtime). Ghi ảnh/số vào ../kiem-thu/.
Chạy: python3 thu3.py            (tất cả)
      python3 thu3.py chi nghi   (chọn mục: nghi chi dai 112 lean chop dientich cang net slot)
"""
import os, sys, json, math, copy
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

import rap3, khung, do_mau, v2ref
import khuon3 as K

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'kiem-thu'))
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
F = ImageFont.truetype(FONT, 14)
Fs = ImageFont.truetype(FONT, 11)
INK = np.array(K.PAL['ink'])
CHECK = (255, 120, 220)
RIG = None


def rig():
    global RIG
    if RIG is None:
        RIG = rap3.load_default()
    return RIG


def save(img, name):
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, name); img.save(p); print('  ', name)
    return p


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
    else:
        o = Image.new('RGBA', cv.size, (236, 232, 220, 255))
    o.alpha_composite(cv); return o


# ---------------- tư thế ----------------
def pose_world(spec, lean=0.0, extra=None):
    """spec: {chuoi: [góc thế giới đoạn 1, 2, 3]} (như REST v2) → pose v3 (delta cục bộ).
    Gốc chuỗi đo so với hướng thân (thân xoay lean)."""
    r = rig()
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


def rest_world():
    """Góc thế giới của các chuỗi ở dáng nghỉ v3."""
    r = rig(); out = {}
    _, ang = r.matrices()
    for ch, names in khung.CHAIN.items():
        out[ch] = [r.bien('the_gioi:' + n, ang) + 0 for n in names]
        # bien the_gioi cộng góc cục bộ (hướng); chuỗi tay/chân: hướng = hướng xương
    return out


def limb_angles(kind, b):
    """Cùng công thức thu2.py v2: tay [95, 95−b, 95−b]; chân up=90−0,45b, lo=up+b, ủng 90+(lo−90)·0,5."""
    if kind == 'tay':
        return [95, 95 - b, 95 - b]
    up = 90 - b * 0.45; lo = up + b
    return [up, lo, 90 + (lo - 90) * 0.5]


V2KEY = {'tay-gan': 'armA', 'tay-xa': 'armB', 'chan-gan': 'legA', 'chan-xa': 'legB'}
KEEP = {'tay-gan': ['than', 'vat-sau', 'vat-truoc', 'dai', 'tay-tren-gan', 'cang-tay-gan', 'gang-gan', 'capelet-truoc'],
        'tay-xa': ['than', 'vat-sau', 'dai', 'tay-tren-xa', 'cang-tay-xa', 'gang-xa', 'capelet-sau'],
        'chan-gan': ['than', 'vat-sau', 'vat-truoc', 'dai', 'dui-gan', 'cang-chan-gan', 'ung-gan'],
        'chan-xa': ['than', 'vat-sau', 'vat-truoc', 'dai', 'dui-xa', 'cang-chan-xa', 'ung-xa']}


# ---------------- đo lỗi mask trên ảnh ráp ----------------
def is_ink(a, tol=30):
    return (np.abs(a[..., :3].astype(int) - INK).max(-1) <= tol)


def mask_errors(cv, joints=(), r_joint=18, t_line=K.T_LINE):
    """cv: ảnh RGBA đã ráp. Trả dict + ảnh đánh dấu.
    - vien_ho: điểm màu (không phải viền) nằm sát nền (4 lân cận) → silhouette không có viền.
    - khe_nen: điểm nền bị bao kín trong hình → lỗ hở.
    - net_trong_khop: điểm viền nằm sâu trong hình (> t_line+3 px từ nền) trong bán kính r quanh khớp
      → vành ống / khớp cầu / nét kép ở khớp (nếp gấp trong khuỷu cũng bị đếm – xem ảnh)."""
    a = np.array(cv); A = a[..., 3] > 127
    ink = is_ink(a) & A
    nb = np.zeros_like(A)
    nb[1:] |= ~A[:-1]; nb[:-1] |= ~A[1:]; nb[:, 1:] |= ~A[:, :-1]; nb[:, :-1] |= ~A[:, 1:]
    ho = A & ~ink & nb
    bgl, n = ndimage.label(~A)
    border = set(np.unique(np.concatenate([bgl[0], bgl[-1], bgl[:, 0], bgl[:, -1]]))) - {0}
    khe = (~A) & ~np.isin(bgl, list(border)) & (bgl > 0)
    dt = ndimage.distance_transform_edt(A)
    deep = ink & (dt > t_line + 3)
    near = np.zeros_like(A)
    yy, xx = np.mgrid[:A.shape[0], :A.shape[1]]
    for (jx, jy) in joints:
        near |= (xx - jx) ** 2 + (yy - jy) ** 2 <= r_joint ** 2
    trong = deep & near
    near2 = np.zeros_like(A)
    for (jx, jy) in joints:
        near2 |= (xx - jx) ** 2 + (yy - jy) ** 2 <= (r_joint + 12) ** 2
    return dict(vien_ho=int(ho.sum()), khe_nen=int(khe.sum()), khe_gan_khop=int((khe & near2).sum()),
                net_trong_khop=int(trong.sum())), (ho, khe, trong)


def mark(cv, masks, scale=1):
    ho, khe, trong = masks
    o = on_bg(cv, 'hong')
    a = np.array(o)
    a[trong] = (0, 200, 255, 255); a[ho] = (255, 0, 0, 255); a[khe] = (0, 255, 0, 255)
    im = Image.fromarray(a)
    if scale != 1:
        im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    return im


def joints_v3(pose, names):
    r = rig(); M, _ = r.matrices(pose); out = []
    for n in names:
        d = r.inst[n]
        if d['D'] is not None:
            out.append(tuple(rap3.app(M[n], d['D'])))
    return out


def joints_v2(L, names):
    out = []
    r = v2ref.rap2()
    for n, img, M in L:
        if n in names and r.PC[n].D is not None:
            out.append(tuple(rap3.app(M, r.PC[n].D)))
    return out


def crop_fixed(cv, box):
    return cv.crop(box)


def label(im, text, font=F, pos=(6, 4), col=(0, 0, 0)):
    d = ImageDraw.Draw(im); d.text(pos, text, fill=col, font=font); return im


def grid(cells, cols, pad=8, bg=(255, 255, 255)):
    w = max(c.width for c in cells); h = max(c.height for c in cells)
    rows = (len(cells) + cols - 1) // cols
    o = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + pad) + pad), bg)
    for i, c in enumerate(cells):
        o.paste(c.convert('RGB'), (pad + (i % cols) * (w + pad), pad + (i // cols) * (h + pad)))
    return o


# ================= 02: dáng nghỉ =================
def t_nghi():
    print('02 dáng nghỉ')
    r = rig()
    m = Image.open(os.path.join(HERE, 'master-s.png')).convert('RGBA')
    mrgb = np.array(m.convert('RGB'))
    cv3 = rap3.render(r.layers())
    res = {'v3': do_mau.mask_iou(cv3, mrgb)}
    rows = []
    def trip(cv, name):
        a = Image.new('RGBA', (520, 520), 'white'); a.alpha_composite(m)
        b = Image.new('RGBA', (520, 520), 'white'); b.alpha_composite(cv)
        o = Image.new('RGB', (1560, 540), 'white')
        o.paste(a.convert('RGB'), (0, 20)); o.paste(b.convert('RGB'), (520, 20))
        o.paste(Image.blend(a, b, .5).convert('RGB'), (1040, 20))
        d = ImageDraw.Draw(o)
        q = do_mau.mask_iou(cv, mrgb)
        d.text((4, 2), 'ảnh mẫu 02 (master-s.png)', fill=(0, 0, 0), font=F)
        d.text((524, 2), name, fill=(0, 0, 0), font=F)
        d.text((1044, 2), 'chồng 50 %%  IoU %.3f  khớp họ màu %.3f' % (q['iou'], q['khop_ho_mau']), fill=(0, 0, 0), font=F)
        for x in (0, 520, 1040):
            d.line([(x, 20 + 468), (x + 519, 20 + 468)], fill=(255, 0, 0))   # đất y=468
        return o
    L2 = v2ref.v2_layers({})
    if L2 is not None:
        cv2 = rap3.render(L2)
        res['v2'] = do_mau.mask_iou(cv2, mrgb)
        rows.append(trip(cv2, 'v2 (rap2.REST) – cùng gốc toạ độ'))
    rows.append(trip(cv3, 'v3 (lam-v3.json) – cùng gốc toạ độ, scale 1'))
    o = Image.new('RGB', (1560, 540 * len(rows)), 'white')
    for i, rw in enumerate(rows):
        o.paste(rw, (0, 540 * i))
    save(o, '02-nghi-mau-v2-v3-chong.png')
    json.dump(res, open(os.path.join(OUT, '02-nghi-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('   ', res)
    return res


# ================= 03/04: tay & chân =================
def limb_render_v3(ch, b, full=False):
    kind = 'tay' if ch.startswith('tay') else 'chan'
    pose = pose_world({ch: limb_angles(kind, b)})
    L = rig().layers(pose, None if full else KEEP[ch])
    return rap3.render(L), joints_v3(pose, khung.CHAIN[ch][:2])


def limb_render_v2(ch, b, full=False):
    kind = 'tay' if ch.startswith('tay') else 'chan'
    keep = None if full else [k for k in KEEP[ch]]
    L = v2ref.v2_layers({V2KEY[ch]: limb_angles(kind, b)}, keep)
    if L is None:
        return None, []
    return rap3.render(L), joints_v2(L, khung.CHAIN[ch][:2])


LIMB_BOX = {'tay-gan': (180, 250, 400, 470), 'tay-xa': (20, 250, 240, 470),
            'chan-gan': (150, 300, 370, 520), 'chan-xa': (60, 300, 280, 520)}


def t_chi():
    print('03 tay/chân gần–xa 0/50/105')
    res = {}
    cells = []
    for ch in ('tay-gan', 'tay-xa', 'chan-gan', 'chan-xa'):
        for b in (0, 50, 105):
            for ver in ('v2', 'v3'):
                cv, J = (limb_render_v2 if ver == 'v2' else limb_render_v3)(ch, b)
                if cv is None:
                    continue
                e, mk = mask_errors(cv, J)
                res['%s %s %d' % (ver, ch, b)] = e
                box = LIMB_BOX[ch]
                im = mark(cv, mk).crop(box).resize(((box[2] - box[0]) * 2, (box[3] - box[1]) * 2), Image.NEAREST)
                label(im, '%s %s %d°' % (ver, ch, b), FB)
                label(im, 'viền hở %d · khe %d (gần khớp %d) · nét trong khớp %d' % (e['vien_ho'], e['khe_nen'], e['khe_gan_khop'], e['net_trong_khop']),
                      F, (6, im.height - 20))
                cells.append(im)
    save(grid(cells, 6), '03-tay-chan-gan-xa-0-50-105.png')
    json.dump(res, open(os.path.join(OUT, '03-tay-chan-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    return res


def t_dai():
    print('04 dải góc trung gian')
    res = {}
    for ch in ('tay-gan', 'tay-xa', 'chan-gan', 'chan-xa'):
        cells = []
        for ver in ('v2', 'v3'):
            for b in range(0, 121, 10):
                cv, J = (limb_render_v2 if ver == 'v2' else limb_render_v3)(ch, b)
                if cv is None:
                    continue
                e, mk = mask_errors(cv, J)
                res['%s %s %d' % (ver, ch, b)] = e
                box = LIMB_BOX[ch]
                im = mark(cv, mk).crop(box)
                label(im, '%s %d°' % (ver, b), F)
                label(im, 'hở %d khe %d trong %d' % (e['vien_ho'], e['khe_nen'], e['net_trong_khop']), Fs,
                      (4, im.height - 14))
                cells.append(im)
        save(grid(cells, 13), '04-dai-goc-%s.png' % ch)
    json.dump(res, open(os.path.join(OUT, '04-dai-goc-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    return res


SECTIONS = {'nghi': t_nghi, 'chi': t_chi, 'dai': t_dai}



# ================= 08: diện tích đùi/cẳng còn thấy trên full rig =================
def area_table(pose_fn, layers_fn, names, size=(520, 560)):
    """Trả {mảnh: dict(dien_tich, con_thay, ti_le, bi_che_boi{...})} từ bộ đệm ID."""
    L = layers_fn()
    ids = rap3.render_ids(L, size)
    lname = [x[0] for x in L]
    out = {}
    for n in names:
        if n not in lname:
            continue
        k = lname.index(n)
        own = rap3.render_ids([L[k]], size) == 0
        area = int(own.sum()); vis = int(((ids == k) & own).sum())
        cover = {}
        for j in np.unique(ids[own]):
            if j != k and j >= 0:
                cover[lname[j]] = int(((ids == j) & own).sum())
        out[n] = dict(dien_tich=area, con_thay=vis, ti_le=round(vis / max(area, 1), 3),
                      bi_che_boi=dict(sorted(cover.items(), key=lambda x: -x[1])))
    return out


def leg_pose_v2style(b):
    up = 90 - b * 0.45; lo = up + b
    return [up, lo, 90 + (lo - 90) * 0.5]


def t_dientich():
    print('08 diện tích đùi/cẳng (full rig)')
    res = {}
    names = ['dui-gan', 'cang-chan-gan', 'dui-xa', 'cang-chan-xa']
    for b in (0, 50, 105):
        ang = leg_pose_v2style(b)
        # v3: cả hai chân cùng tư thế như thu2 v2 (thu2 chỉ đổi chân gần; ở đây đo cả gần và xa riêng)
        for ch in ('chan-gan', 'chan-xa'):
            pose = pose_world({ch: ang})
            r = area_table(None, lambda: rig().layers(pose), [n for n in names if n.endswith(ch[-3:]) or n.endswith(ch[-2:])])
            res['v3 %s %d' % (ch, b)] = r
            L2 = v2ref.v2_layers({V2KEY[ch]: ang})
            if L2 is not None:
                r2 = area_table(None, lambda: L2, [n for n in names if n.endswith(ch.split('-')[1])])
                res['v2 %s %d' % (ch, b)] = r2
            # lỗi mask vùng chân (chỉ chuỗi chân + vạt/thân)
            cv = rap3.render(rig().layers(pose, KEEP[ch]))
            e, _ = mask_errors(cv, joints_v3(pose, khung.CHAIN[ch][:2]))
            res['v3 %s %d' % (ch, b)]['loi_mask'] = e
    json.dump(res, open(os.path.join(OUT, '08-dien-tich-dui-cang.json'), 'w'), ensure_ascii=False, indent=1)
    # bảng tóm tắt
    lines = ['| tư thế | mảnh | v2 còn thấy | v3 còn thấy | v3 bị che chủ yếu bởi |', '|---|---|---|---|---|']
    for b in (0, 50, 105):
        for ch in ('chan-gan', 'chan-xa'):
            for n in (khung.CHAIN[ch][0], khung.CHAIN[ch][1]):
                v3 = res['v3 %s %d' % (ch, b)][n]; v2 = res.get('v2 %s %d' % (ch, b), {}).get(n)
                cov = ', '.join('%s %d' % kv for kv in list(v3['bi_che_boi'].items())[:3])
                lines.append('| %d° | %s | %s | %.1f %% (%d/%d px) | %s |' % (
                    b, n, '-' if v2 is None else '%.1f %%' % (100 * v2['ti_le']), 100 * v3['ti_le'], v3['con_thay'],
                    v3['dien_tich'], cov))
    open(os.path.join(OUT, '08-dien-tich-dui-cang.md'), 'w').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))
    return res


SECTIONS['dientich'] = t_dientich


# ================= tiện ích biến thể (dựng mảnh trong bộ nhớ, dùng lại rig JSON) =================
def variant_rig(cfg=None, t_out=None, t_in=None):
    import xuat, meta
    pc, dims, imgs = xuat.build_assets(cfg, t_out, t_in)
    base = rig()
    M = copy.deepcopy(base.meta)
    for n, d in M['manh'].items():
        a = d['anh'][:-4]; dd = dims[a]
        d['kich_thuoc'] = [dd['w'], dd['h']]; d['D'] = dd['D']; d['xuong'] = dd['xuong']; d['huong_anh'] = dd['huong']
        if a.startswith(('dui', 'cang-chan', 'ung')):     # chỉ mảnh chân đổi hình theo biến thể
            d['P'] = dd['P']
        c = d['cha']
        if c and a.startswith(('cang-chan', 'ung')):
            d['gan'] = dims[M['manh'][c]['anh'][:-4]]['D']
    p = os.path.join(OUT, '_tmp_bien_the.json')
    json.dump(M, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    r = rap3.Rig(p, images=imgs)
    os.remove(p)
    return r, pc


def silhouette_pass(cv, t):
    """Viền silhouette ngoài dày t (bên trong hình) vẽ một lần trên ảnh ráp – cho phương án nét trong mỏng."""
    a = np.array(cv).copy(); A = a[..., 3] > 127
    band = A & (ndimage.distance_transform_edt(A) <= t)
    a[band, :3] = INK
    return Image.fromarray(a)


# ================= 05: cỡ 112 px =================
K112 = 112 / 470.0
DEV = 2.17
CAN_W, CAN_H = 600, 520       # khung thế giới cố định cho mọi tư thế: x −40..560, y −20..500
OFF = (40, 20)                # gốc thế giới (0,0) nằm ở (40,20) của khung; đất y=468 → 488 trong khung


def to_px(cv_world, k):
    """Thu đồng nhất hai trục: cả khung 520×480 → round(520k)×round(480k). Gốc/đất cố định."""
    W, H = round(CAN_W * k), round(CAN_H * k)
    c = cv_world.crop((0, 0, CAN_W, CAN_H))
    return c.resize((W, H), Image.LANCZOS)


def poses_112():
    P = [('chuẩn', {})]
    for b in (0, 50, 105):
        P.append(('gập %d°' % b, pose_world({'tay-gan': limb_angles('tay', b), 'chan-gan': limb_angles('chan', b)})))
    P.append(('chóp −10°', {'goc': {'chop-mu': -10}})); P.append(('chóp +10°', {'goc': {'chop-mu': 10}}))
    P.append(('lean −8°', lean_pose(-8))); P.append(('lean +8°', lean_pose(8)))
    return P


def t_112(r=None, tag='', post=None):
    print('05 cỡ 112 px', tag)
    r = r or rig()
    cells_l, cells_d = [], []
    info = dict(px_the_gioi_moi_px_logic=round(1 / K112, 3), he_so_thiet_bi=DEV,
                khung_the_gioi=[CAN_W, CAN_H], khung_logic=[round(CAN_W * K112), round(CAN_H * K112)],
                khung_thiet_bi=[round(CAN_W * K112 * DEV), round(CAN_H * K112 * DEV)],
                dat_logic=round((468 + OFF[1]) * K112, 2), dat_thiet_bi=round((468 + OFF[1]) * K112 * DEV, 2),
                goc_the_gioi_trong_khung=list(OFF), lam_cao_logic=112, lam_cao_thiet_bi=round(112 * DEV, 1),
                vien_logic=round(K.T_LINE * K112, 2), vien_thiet_bi=round(K.T_LINE * K112 * DEV, 2))
    for lab, pose in poses_112():
        cv = rap3.render(r.layers(pose), (CAN_W, CAN_H), offset=OFF)
        if post:
            cv = post(cv)
        g = to_px(cv, K112); d = to_px(cv, K112 * DEV)
        for bgk in ('sang', 'toi', 'caro'):
            big = on_bg(g, bgk).resize((g.width * 4, g.height * 4), Image.NEAREST)
            label(big, '%s · %s' % (lab, bgk), Fs, col=(255, 255, 255) if bgk == 'toi' else (0, 0, 0))
            cells_l.append(big)
            cells_d.append(label(on_bg(d, bgk), lab, Fs, col=(255, 255, 255) if bgk == 'toi' else (0, 0, 0)))
        # 1:1 logic riêng
    # bảng 1:1 logic (không phóng) để nhìn đúng cỡ
    ones = []
    for lab, pose in poses_112():
        cv = rap3.render(r.layers(pose), (CAN_W, CAN_H), offset=OFF)
        if post:
            cv = post(cv)
        g = to_px(cv, K112)
        for bgk in ('sang', 'toi', 'caro'):
            ones.append(on_bg(g, bgk))
    o1 = grid(ones, 24, pad=4)
    hdr = Image.new('RGB', (o1.width, 40), 'white')
    label(hdr, '112 px LOGIC, 1:1 (khung %dx%d, đất y=%.1f). Mỗi tư thế 3 nền: sáng/tối/caro. Thứ tự: %s' % (
        info['khung_logic'][0], info['khung_logic'][1], info['dat_logic'], ', '.join(l for l, _ in poses_112())), Fs)
    o = Image.new('RGB', (o1.width, o1.height + 40), 'white'); o.paste(hdr, (0, 0)); o.paste(o1, (0, 40))
    save(o, '05-112px-logic-1x1%s.png' % tag)
    o = grid(cells_l, 6, pad=6)
    save(o, '05-112px-logic-phong-x4%s.png' % tag)
    o = grid(cells_d, 6, pad=6)
    save(o, '05-112px-thiet-bi-1x1%s.png' % tag)
    json.dump(info, open(os.path.join(OUT, '05-112px-thong-so%s.json' % tag), 'w'), ensure_ascii=False, indent=1)
    return info


# ================= 06: lean =================
def lean_pose(lean):
    """Thân nghiêng; chân bù −lean ở đùi để bàn chân giữ trên đất (đo độ trôi bàn chân)."""
    return {'goc': {'than': lean, 'dui-gan': -lean, 'dui-xa': -lean}}


def t_lean():
    print('06 lean')
    r = rig(); res = {}
    cells = []
    for lean in (-8, 0, 8):
        pose = lean_pose(lean)
        L = r.layers(pose); cv = rap3.render(L)
        M, _ = r.matrices(pose); M0, _ = r.matrices({})
        feet = {n: [round(float(x), 1) for x in rap3.app(M[n], r.inst[n]['P']) - rap3.app(M0[n], r.inst[n]['P'])]
                for n in ('ung-gan', 'ung-xa')}
        neck = (200, 230, 300, 330)
        e, mk = mask_errors(cv.crop((150, 200, 330, 340)))
        res['v3 %+d' % lean] = dict(troi_ban_chan=feet, loi_vung_co=e,
                                    tam_mu=[round(float(x), 1) for x in rap3.app(M['mu'], r.inst['mu']['P'])])
        im = on_bg(cv, 'hong'); label(im, 'v3 lean %+d°' % lean, FB)
        cells.append(im)
        z = on_bg(cv, 'hong').crop((140, 190, 340, 360)).resize((400, 340), Image.NEAREST)
        label(z, 'cổ/capelet ×2 – khe %d, viền hở %d' % (e['khe_nen'], e['vien_ho']), F); cells.append(z)
    L2s = []
    for lean in (-8, 0, 8):
        L2 = v2ref.v2_layers({'lean': lean})
        if L2 is not None:
            cv2 = rap3.render(L2); im = on_bg(cv2, 'hong'); label(im, 'v2 lean %+d° (chi/đầu/capelet không theo)' % lean, F)
            L2s.append(im)
    rows = [grid(cells[i * 2:(i + 1) * 2] , 2) for i in range(3)]
    o = grid(cells, 6, pad=6)
    if L2s:
        o2 = grid(L2s + [Image.new('RGBA', (1, 1))] * 0, 3, pad=6)
        oo = Image.new('RGB', (max(o.width, o2.width), o.height + o2.height), 'white')
        oo.paste(o, (0, 0)); oo.paste(o2, (0, o.height)); o = oo
    save(o, '06-lean-8-0+8.png')
    json.dump(res, open(os.path.join(OUT, '06-lean-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('   ', res)
    return res


# ================= 07: chóp mũ =================
def t_chop():
    print('07 chóp')
    r = rig(); res = {}
    cells = []
    box = (20, 0, 260, 200)
    base3 = np.array(rap3.render(r.layers({})))
    for tip in (0, -6, 6, -10, 10):
        cv = rap3.render(r.layers({'goc': {'chop-mu': tip}}))
        e, mk = mask_errors(cv.crop(box))
        res['v3 %+d' % tip] = e
        im = mark(cv.crop(box), mk, 3); label(im, 'v3 chóp %+d° ×3 · hở %d khe %d' % (tip, e['vien_ho'], e['khe_nen']), FB)
        cells.append(im)
        L2 = v2ref.v2_layers({'tip': tip})
        if L2 is not None:
            cv2 = rap3.render(L2); e2, mk2 = mask_errors(cv2.crop(box)); res['v2 %+d' % tip] = e2
            im = mark(cv2.crop(box), mk2, 3); label(im, 'v2 chóp %+d° ×3 · hở %d khe %d' % (tip, e2['vien_ho'], e2['khe_nen']), FB)
            cells.append(im)
    # góc 0: mũ chính + chóp == mũ gốc (đã bỏ viền nguồn, kẻ lại) ?
    full = K.from_src('mu', 1.0, ['ink', 'den', 'xanh', 'xanh_bong', 'ngoc', 'ngoc_bong']).rgba('mau')
    M, _ = r.matrices({})
    ref = Image.new('RGBA', (520, 520)); rap3.put(ref, full, M['mu'])
    cvh = rap3.render(r.layers({}, ['mu', 'chop-mu']))
    dd = np.abs(np.array(ref).astype(int) - np.array(cvh).astype(int)).max(-1)
    res['goc0_khac_mu_goc_px_gt8'] = int((dd > 8).sum())
    save(grid(cells, 2), '07-chop-0-6-10.png')
    json.dump(res, open(os.path.join(OUT, '07-chop-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('   ', res)
    return res


# ================= 09: đầu dưới cẳng chân (w1/r1) =================
def boot_protrusion(r, side='gan', angles=range(-30, 41, 5)):
    """Số điểm cẳng chân lộ ra ngoài ủng phía dưới mép cổ ủng (đo trong khung ủng), theo góc cổ chân."""
    sh, ub = 'cang-chan-' + side, 'ung-' + side
    out = {}
    for a in angles:
        pose = {'goc': {ub: a}}
        L = r.layers(pose, [sh, ub]); ids = rap3.render_ids(L)
        k = [x[0] for x in L].index(sh)
        M, _ = r.matrices(pose); Mi = np.linalg.inv(M[ub])
        yy, xx = np.nonzero(ids == k)
        loc = Mi @ np.vstack([xx, yy, np.ones_like(xx)])
        below = loc[1] > 3          # dưới mép trên ủng (mép trên mask ủng ở y≈2–3)
        out[a] = int(below.sum())
    return out


def t_cang():
    print('09 đầu dưới cẳng chân')
    res = {}
    m = np.array(Image.open(os.path.join(HERE, 'master-s.png')).convert('RGB'))
    variants = [('v2: w0 46→w1 36, r1 18', {'ho_so_cang': 'v2'}),
                ('REVIEW thẳng: w1 28, r1 14', {'ho_so_cang': 'tuyen'}),
                ('v3: rộng 50 tới cổ ủng, thu 28/r14 trong ủng', {'ho_so_cang': 'v3'})]
    base = rap3.render(rig().layers())
    cells = []
    for lab, cfg in variants:
        rv, pc = variant_rig(cfg)
        cv = rap3.render(rv.layers())
        dd = (np.abs(np.array(cv).astype(int) - np.array(base).astype(int)).max(-1) > 40)
        prot = boot_protrusion(rv)
        # bề rộng cẳng thấy ở mép cổ ủng (đo trên mảnh: mép trên ủng = 16 px trên khớp cổ chân)
        p = pc['cang-chan-gan']; y = int(round(p.D[1] - 16)); xs = np.nonzero(p.mask[y])[0]
        res[lab] = dict(khac_dang_nghi_so_v3_px=int(dd.sum()), iou_mau=do_mau.mask_iou(cv, m),
                        lo_ngoai_ung_theo_goc=prot, lo_tong=int(sum(prot.values())),
                        rong_tai_co_ung=int(xs.max() - xs.min() + 1) if len(xs) else 0)
        z = on_bg(cv, 'hong').crop((180, 360, 340, 480)).resize((480, 360), Image.NEAREST)
        label(z, lab, F); label(z, 'lộ ngoài ủng (−30..40°): %d px · rộng ở cổ ủng %d' % (
            res[lab]['lo_tong'], res[lab]['rong_tai_co_ung']), Fs, (6, 340))
        cells.append(z)
        for a in (-30, 40):
            cvb = rap3.render(rv.layers({'goc': {'ung-gan': a}}, ['dui-gan', 'cang-chan-gan', 'ung-gan']))
            z = on_bg(cvb, 'hong').crop((180, 340, 340, 480)).resize((480, 420), Image.NEAREST)
            label(z, 'cổ chân %+d°: lộ %d px' % (a, prot[a]), F); cells.append(z)
    save(grid(cells, 3), '09-dau-duoi-cang-chan-w1-r1.png')
    json.dump(res, open(os.path.join(OUT, '09-dau-duoi-cang-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    for k, v in res.items():
        print('   ', k, {kk: vv for kk, vv in v.items() if kk != 'lo_ngoai_ung_theo_goc'})
    return res


# ================= 10: nét trong 8 / 6 / 5 =================
def t_net():
    print('10 nét trong')
    rows = []
    for tin in (8, 6, 5):
        if tin == 8:
            r = rig(); post = None; lab = 'T_LINE=8 mọi nét (đối chứng)'
        else:
            r, _ = variant_rig(None, t_out=tin, t_in=tin)
            post = (lambda cv: silhouette_pass(cv, K.T_LINE)); lab = 'nét trong %d + silhouette 8' % tin
        cells = []
        for pose in ({}, pose_world({'tay-gan': limb_angles('tay', 50), 'chan-gan': limb_angles('chan', 50)})):
            cv = rap3.render(r.layers(pose), (CAN_W, CAN_H), offset=OFF)
            if post:
                cv = post(cv)
            z = on_bg(cv, 'sang').crop((150, 260, 510, 500)); label(z, lab + ' – thế giới', F); cells.append(z)
            g = to_px(cv, K112 * DEV)
            gg = on_bg(g, 'sang').resize((g.width * 2, g.height * 2), Image.NEAREST); label(gg, 'thiết bị ×2', Fs)
            cells.append(gg)
            g = to_px(cv, K112)
            gg = on_bg(g, 'sang').resize((g.width * 4, g.height * 4), Image.NEAREST); label(gg, 'logic ×4', Fs)
            cells.append(gg)
        rows.append(grid(cells, 6, pad=6))
    W = max(rw.width for rw in rows); o = Image.new('RGB', (W, sum(rw.height for rw in rows)), 'white')
    y = 0
    for rw in rows:
        o.paste(rw, (0, y)); y += rw.height
    save(o, '10-net-trong-8-6-5.png')


# ================= 11: slot chân gần theo tư thế =================
def t_slot():
    print('11 slot chân gần')
    r = rig(); res = {}
    cells = []
    rules = r.meta['slot_theo_tu_the']
    for up in (40, 31, 29, 15):
        pose = pose_world({'chan-gan': [up, up + 80, 95]})
        r.meta['slot_theo_tu_the'] = []
        a = rap3.render(r.layers(pose))
        r.meta['slot_theo_tu_the'] = rules
        b = rap3.render(r.layers(pose))
        diff = int((np.abs(np.array(a).astype(int) - np.array(b).astype(int)).max(-1) > 40).sum())
        res['dui %d°' % up] = dict(diem_doi_khi_bat_luat=diff, luat_ap_dung=up < 30)
        for im, lab in ((a, 'không luật'), (b, 'có luật')):
            z = on_bg(im, 'hong').crop((150, 280, 370, 480)).resize((330, 300), Image.NEAREST)
            label(z, 'đùi %d° %s' % (up, lab), F); cells.append(z)
    save(grid(cells, 4), '11-slot-chan-gan.png')
    json.dump(res, open(os.path.join(OUT, '11-slot-so-lieu.json'), 'w'), ensure_ascii=False, indent=1)
    print('   ', res)


# ================= 01: ảnh dò mảnh trên ảnh mẫu =================
def t_domau():
    print('01 dò mảnh trên ảnh 02')
    rep = json.load(open(os.path.join(OUT, '01-do-mau-ketqua.json')))
    import xuat
    pc, dims, imgs = xuat.build_assets()
    full = K.from_src('mu', 1.0, ['ink', 'den', 'xanh', 'xanh_bong', 'ngoc', 'ngoc_bong']).rgba('mau')
    mrgb = np.array(Image.open(os.path.join(HERE, 'master-s.png')).convert('RGB'))
    cells = []
    for n, v in rep['manh'].items():
        img = full if n == 'mu' else pc[n].rgba('mau')
        o = do_mau.overlay(mrgb, img, v['goc'], v['tam'][0], v['tam'][1])
        cx, cy = v['tam']
        x0, y0 = int(cx - 100), int(cy - 80)
        t = Image.new('RGBA', (200, 160), 'white'); t.alpha_composite(o.crop((x0, y0, x0 + 200, y0 + 160)))
        t = t.resize((300, 240), Image.NEAREST)
        label(t, '%s điểm %.2f góc %+.0f°' % (n, v['diem'], v['goc']), Fs, col=(200, 0, 0))
        cells.append(t)
    save(grid(cells, 4), '01-do-mau-manh.png')


SECTIONS.update({'112': t_112, 'lean': t_lean, 'chop': t_chop, 'cang': t_cang, 'net': t_net, 'slot': t_slot,
                 'domau': t_domau})

if __name__ == '__main__':
    want = sys.argv[1:] or list(SECTIONS)
    for k in want:
        SECTIONS[k]()
