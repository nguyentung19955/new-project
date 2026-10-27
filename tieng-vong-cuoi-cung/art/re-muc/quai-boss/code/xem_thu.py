"""Bước 4 – ảnh/GIF xem thử (xem-thu/ của từng nhân vật). Vẽ thẳng từ rig (siêu lấy mẫu, mượt – không phóng nearest).

- <nv>-<clip>-lon.gif   : cỡ lớn (nam 4×, doi 6×, menam 2× px logic) + đường đất, điểm neo (tam giác xanh), hitbox thân
                          đề xuất (khung xanh), hộp đòn ở khung chạm (đỏ), chữ: clip / khung / ms / pha
- <nv>-<clip>-1x.gif    : đúng cỡ chơi 1:1 (1 px = 1 px logic)
- <nv>-contact-sheet.png : mọi khung mọi clip (1×; boss ½×), ghi số khung / ms / pha; khung chạm viền đỏ
- <nv>-nghi-so-sanh.png  : ảnh nguồn (đã lật) | rig ráp lại | chồng (đỏ = chỉ nguồn, xanh = chỉ rig) + IoU
- <nv>-manh.png          : bảng mảnh + pivot (dấu đỏ)
- so-co-voi-Lam-3x.png / -1x.png (ở art/re-muc/quai-boss/xem-thu/): Lam + 3 nhân vật mới + quái/boss cũ cùng đường đất
- so-co-man-hinh-960x540.png: cả nhóm trong khung màn hình game (đất ở FLOOR = 448; dơi bay ở độ cao đề xuất)"""
import os
import math
import numpy as np
from PIL import Image, ImageDraw
from chung import (GOC, SRC, LAM_PNG, LAM_JSON, rig_json, xem_dir, duong_manh, font, load_json, load_rgb, background,
                   NV_DS)
import rig as R
from dong_tac import NgCanh, tinh_clip
from xuat import THU_TU_CLIP, TEN_CLIP, MOD

NEN = (236, 230, 214)
DAT = (150, 110, 70)
F = font(13)
FB = font(15, True)
PHONG = {'nam': 4.0, 'doi': 6.0, 'menam': 2.0}


def ss_cho(scale_src):
    return max(1, int(math.ceil(0.8 / scale_src)))


def khung_clip(C, nv, clip, z, box):
    cl = MOD[nv].tao(C)[clip]
    ts, frames, _ = tinh_clip(C, cl)
    s = C.k * z
    imgs = [R.render(C.rig, p, box, s, ss=ss_cho(s)) for p in frames]
    return cl, ts, imgs


def thoi_luong_gif(ms_list):
    out, acc, acc_r = [], 0.0, 0
    for ms in ms_list:
        acc += ms
        r = int(round(acc / 10.0)) * 10
        out.append(max(10, r - acc_r))
        acc_r = r
    return out


def luu_gif(frames, ms, path):
    pal = [f.convert('RGB').quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
           for f in frames]
    pal[0].save(path, save_all=True, append_images=pal[1:], duration=thoi_luong_gif(ms), loop=0, disposal=1)


def pha_tai(cl, t):
    for p in cl.get('pha', []):
        if p[1] - 1e-6 <= t < p[2] - 1e-6:
            return p[0]
    return cl.get('pha', [['', 0, 0]])[-1][0]


def cham(cl, t):
    return bool(cl.get('cham')) and cl['cham'][0] - 1e-6 <= t <= cl['cham'][1] + 1e-6


def gif_clip(nv, clip, C, box):
    meta_hb = MOD[nv].HITBOX_THAN
    for z, ten in ((1.0, '1x'), (PHONG[nv], 'lon')):
        cl, ts, imgs = khung_clip(C, nv, clip, z, box)
        ax = (C.root[0] - box[0]) * C.k * z
        ay = (C.root[1] - box[1]) * C.k * z
        ms = [cl['buoc_ms']] * len(ts)
        if cl.get('giu_cuoi'):
            ms[-1] = 800.0
        out = []
        hop = cl.get('hop_don') or {}
        for i, im in enumerate(imgs):
            if z == 1.0:
                b = Image.new('RGBA', (im.width, im.height + 4), NEN + (255,))
                b.alpha_composite(im)
                ImageDraw.Draw(b).line([(0, ay), (b.width, ay)], fill=DAT)
                out.append(b)
                continue
            pad_b = 30
            b = Image.new('RGBA', (im.width, im.height + pad_b), NEN + (255,))
            d = ImageDraw.Draw(b)
            d.rectangle([ax - meta_hb['w'] / 2 * z, ay - meta_hb['h'] * z, ax + meta_hb['w'] / 2 * z, ay],
                        outline=(90, 150, 230), width=1)
            b.alpha_composite(im)
            d = ImageDraw.Draw(b, 'RGBA')
            d.line([(0, ay), (b.width, ay)], fill=DAT, width=max(1, int(z // 2)))
            d.polygon([(ax, ay), (ax - 6, ay + 9), (ax + 6, ay + 9)], fill=(40, 120, 220))
            t = ts[i]
            ch = cham(cl, t)
            if ch and ('dx' in hop or hop.get('dung_hitbox_than')):
                lop = Image.new('RGBA', b.size, (0, 0, 0, 0))
                dl = ImageDraw.Draw(lop)
                if hop.get('dung_hitbox_than'):
                    r = [ax - meta_hb['w'] / 2 * z, ay - meta_hb['h'] * z, ax + meta_hb['w'] / 2 * z, ay]
                else:
                    x0, y0 = ax + hop['dx'] * z, ay + hop['dy'] * z
                    r = [x0, y0, x0 + hop['w'] * z, y0 + hop['h'] * z]
                dl.rectangle(r, fill=(230, 30, 30, 45), outline=(230, 30, 30, 255), width=3)
                b.alpha_composite(lop)
                d = ImageDraw.Draw(b)
            txt = f'{TEN_CLIP[clip]}  khung {i}  {t:.0f} ms  {pha_tai(cl, t)}' + ('   CHẠM' if ch else '')
            d.text((6, b.height - 22), txt, fill=(200, 20, 20) if ch else (40, 40, 40), font=F)
            out.append(b)
        luu_gif(out, ms, os.path.join(xem_dir(nv), f'{nv}-{clip}-{ten}.gif'))


def contact(nv, C, box):
    rows = []
    z = 0.5 if nv == 'menam' else (2.0 if nv == 'doi' else 1.0)
    for clip in THU_TU_CLIP[nv]:
        cl, ts, imgs = khung_clip(C, nv, clip, z, box)
        ax = (C.root[0] - box[0]) * C.k * z
        ay = (C.root[1] - box[1]) * C.k * z
        cells = []
        for i, im in enumerate(imgs):
            c = Image.new('RGBA', (max(im.width, 90), im.height + 32), NEN + (255,))
            c.alpha_composite(im)
            d = ImageDraw.Draw(c)
            d.line([(0, ay), (c.width, ay)], fill=DAT)
            d.polygon([(ax, ay), (ax - 3, ay + 5), (ax + 3, ay + 5)], fill=(40, 120, 220))
            d.text((4, im.height + 6), f'{i} {ts[i]:.0f}ms', fill=(30, 30, 30), font=F)
            d.text((4, im.height + 18), pha_tai(cl, ts[i]), fill=(90, 90, 90), font=font(10))
            if cham(cl, ts[i]):
                d.rectangle([0, 0, c.width - 1, c.height - 1], outline=(220, 20, 20), width=3)
                d.text((4, 4), 'CHẠM', fill=(220, 20, 20), font=FB)
            cells.append(c)
        cot = min(len(cells), 12 if nv != 'menam' else 10)
        w, h = cells[0].size
        hang = (len(cells) + cot - 1) // cot
        R_ = Image.new('RGBA', (cot * (w + 4), 22 + hang * (h + 4)), (255, 255, 255, 255))
        ImageDraw.Draw(R_).text((4, 3), f'{nv} {clip} – {TEN_CLIP[clip]}: {len(cells)} khung × {cl["buoc_ms"]:.1f} ms'
                                         f'{" (lặp)" if cl["lap"] else ""}; tỉ lệ {z}× px logic',
                                font=FB, fill=(0, 0, 0))
        for j, c in enumerate(cells):
            R_.paste(c, ((j % cot) * (w + 4), 22 + (j // cot) * (h + 4)))
        rows.append(R_)
    W = max(r.width for r in rows)
    out = Image.new('RGB', (W, sum(r.height + 10 for r in rows)), (255, 255, 255))
    y = 0
    for r in rows:
        out.paste(r, (0, y))
        y += r.height + 10
    out.save(os.path.join(xem_dir(nv), f'{nv}-contact-sheet.png'), optimize=True)


def ban_nguyen(nv, fg, rig):
    """mặt nạ bản nguyên trên ảnh nguồn đã lật = các vùng liền chạm vào hình rig ráp lại (bỏ phần mảnh rời vẽ lại)"""
    from scipy import ndimage as nd
    H, W = fg.shape
    im = R.render(rig, {}, (0, 0, W, H), 1.0)
    r = np.array(im)[..., 3] > 128
    lab, _ = nd.label(fg)
    keep = np.isin(lab, np.unique(lab[r & fg])) & (lab > 0)
    return r, fg & keep, im


def nghi_so_sanh(nv):
    doc = load_json(rig_json(nv))
    a = load_rgb(SRC[nv], lat=True)
    bg, _ = background(a)
    r, f, im = ban_nguyen(nv, ~bg, doc['rig'])
    iou = float((r & f).sum() / (r | f).sum())
    ys, xs = np.nonzero(r | f)
    x0, y0, x1, y1 = xs.min() - 10, ys.min() - 10, xs.max() + 10, ys.max() + 10
    src = Image.fromarray(np.where(f[..., None], a, 255).astype(np.uint8)).crop((x0, y0, x1, y1))
    rap = Image.new('RGBA', im.size, (255, 255, 255, 255))
    rap.alpha_composite(im)
    rap = rap.crop((x0, y0, x1, y1))
    ov = np.full(a.shape, 255, np.uint8)
    ov[r & f] = (a[r & f] * 0.35 + 150).astype(np.uint8)
    ov[f & ~r] = (230, 30, 30)
    ov[r & ~f] = (30, 90, 230)
    ov = Image.fromarray(ov).crop((x0, y0, x1, y1))
    k = 520 / max(src.size)
    sz = (int(src.width * k), int(src.height * k))
    out = Image.new('RGB', (sz[0] * 3 + 20, sz[1] + 40), (255, 255, 255))
    for j, (p, t) in enumerate(((src, 'bản nguyên (ảnh nguồn đã lật)'), (rap.convert('RGB'), 'rig ráp lại (dáng nghỉ)'),
                                (ov, f'chồng: đỏ chỉ nguồn, xanh chỉ rig; IoU {iou:.4f}'))):
        out.paste(p.resize(sz, Image.LANCZOS), (j * (sz[0] + 10), 36))
        ImageDraw.Draw(out).text((j * (sz[0] + 10) + 6, 8), t, fill=(0, 0, 0), font=FB)
    out.save(os.path.join(xem_dir(nv), f'{nv}-nghi-so-sanh.png'), optimize=True)
    return iou


def bang_manh(nv):
    doc = load_json(rig_json(nv))
    nodes = doc['rig']['nut']
    cells, seen = [], set()
    z = {'nam': 0.5, 'doi': 0.5, 'menam': 0.35}[nv]
    for n in doc['rig']['thu_tu_ve']:
        nd_ = nodes[n]
        if nd_['anh'] in seen:
            continue
        seen.add(nd_['anh'])
        im = Image.open(duong_manh(nd_['anh'])).convert('RGBA')
        im = im.resize((max(1, int(im.width * z)), max(1, int(im.height * z))), Image.LANCZOS)
        c = Image.new('RGBA', (max(im.width + 20, 110), im.height + 40), (225, 232, 240, 255))
        c.alpha_composite(im, (10, 30))
        d = ImageDraw.Draw(c)
        px, py = nd_['pivot'][0] * z + 10, nd_['pivot'][1] * z + 30
        d.ellipse([px - 5, py - 5, px + 5, py + 5], outline=(220, 0, 0), width=2)
        d.line([(px - 9, py), (px + 9, py)], fill=(220, 0, 0))
        d.line([(px, py - 9), (px, py + 9)], fill=(220, 0, 0))
        ten = 'bao-tu (×%d)' % sum(1 for k in nodes if k.startswith('bao-tu')) if n.startswith('bao-tu') else n
        d.text((6, 6), ten + ('' if nd_.get('hien', True) or n.startswith('bao') else ' (chỉ khi chết)'),
               fill=(0, 0, 0), font=FB)
        cells.append(c)
    W = sum(c.width + 8 for c in cells)
    H = max(c.height for c in cells) + 30
    out = Image.new('RGB', (W, H), (255, 255, 255))
    x = 0
    for c in cells:
        out.paste(c, (x, 0))
        x += c.width + 8
    ImageDraw.Draw(out).text((6, H - 22), f'tỉ lệ {z}× ảnh nguồn (đã lật); dấu đỏ = pivot. Thứ tự = thứ tự vẽ (sau → trước).',
                             fill=(0, 0, 0), font=F)
    out.save(os.path.join(xem_dir(nv), f'{nv}-manh.png'), optimize=True)


def nghi_1x(nv, z):
    C = NgCanh(nv)
    doc = load_json(rig_json(nv))
    hb = R.bbox_world(C.rig, {})
    le = 4 / C.k
    box = (hb[0] - le, hb[1] - le, hb[2] + le, max(hb[3], C.ground) + le)
    s = C.k * z
    im = R.render(C.rig, {}, box, s, ss=ss_cho(s))
    return im, (C.root[0] - box[0]) * s, (C.root[1] - box[1]) * s, doc


def cu(z):
    """quái chuông gỗ + boss cũ (đã duyệt) để so cỡ: vẽ từ rig cũ ở art/the-gioi-moi/quai-boss/"""
    import importlib.util
    cu_dir = os.path.normpath(os.path.join(GOC, '..', '..', 'the-gioi-moi', 'quai-boss'))
    res = {}
    for nv in ('quai', 'boss'):
        doc = load_json(os.path.join(cu_dir, nv + '.json'))
        rig = doc['rig']
        k = doc['ty_le']['px_nguon_sang_px_logic']
        # mảnh cũ: đường dẫn 'manh/quai/..' tương đối theo cu_dir → thay tạm
        old = R.piece_img
        def pimg(rel, _o=old):
            p = os.path.join(cu_dir, rel)
            if p not in R._cache:
                a = np.array(Image.open(p).convert('RGBA')).astype(np.float32)
                al = a[..., 3:4] / 255.0
                R._cache[p] = np.dstack([a[..., :3] * al, a[..., 3]])
            return R._cache[p]
        def pedge(rel):
            key = 'cu:' + rel
            if key not in R._edge:
                a = pimg(rel)[..., 3] > 128
                e = a & ~(np.pad(a, 1)[2:, 1:-1] & np.pad(a, 1)[:-2, 1:-1] & np.pad(a, 1)[1:-1, 2:] & np.pad(a, 1)[1:-1, :-2])
                ys, xs = np.nonzero(e)
                R._edge[key] = np.stack([xs + 0.5, ys + 1.0, np.ones(len(xs))])
            return R._edge[key]
        R.piece_img, oe = pimg, R.piece_edge
        R.piece_edge = pedge
        hb = R.bbox_world(rig, {})
        gx, gy = rig['goc_the_gioi']
        le = 4 / k
        box = (hb[0] - le, hb[1] - le, hb[2] + le, gy + le)
        s = k * z
        im = R.render(rig, {}, box, s, ss=ss_cho(s))
        R.piece_img, R.piece_edge = old, oe
        res[nv] = (im, (gx - box[0]) * s, (gy - box[1]) * s, doc['ty_le']['cao_dang_nghi_px_logic'])
    return res


def so_co():
    lm = load_json(LAM_JSON)
    lam = Image.open(LAM_PNG).convert('RGBA')
    hb = {'Lam': {'w': 40, 'h': 120}, 'nam': MOD['nam'].HITBOX_THAN, 'doi': MOD['doi'].HITBOX_THAN,
          'menam': MOD['menam'].HITBOX_THAN, 'quai': {'w': 72, 'h': 108}, 'boss': {'w': 200, 'h': 290}}
    ten = {'Lam': 'Lam', 'quai': 'quái chuông gỗ (cũ)', 'nam': 'Nấm Mốc', 'doi': 'Dơi Chuông (bay)',
           'boss': 'boss Chuông Gác Làng (cũ)', 'menam': 'Mẹ Nấm Mốc'}
    DOI_CAO = 150                                 # độ cao bay đề xuất (đáy hitbox cách đất, px logic) – chỉ để xem
    for z in (1, 3):
        cuu = cu(z)
        items = {'Lam': (lam.resize((round(lam.width * z / 4), round(lam.height * z / 4)), Image.LANCZOS),
                         lm['neo'][0] * z / 4, lm['neo'][1] * z / 4, 112)}
        items['quai'] = cuu['quai']
        items['boss'] = cuu['boss']
        for nv in NV_DS:
            im, ax, ay, doc = nghi_1x(nv, z)
            items[nv] = (im, ax, ay, doc['ty_le']['cao_dang_nghi_px_logic'])
        xs = {'Lam': 60, 'quai': 190, 'nam': 320, 'doi': 450, 'boss': 670, 'menam': 1010}
        W, H, gy = 1200, 440, 395
        img = Image.new('RGBA', (W * z, H * z), NEN + (255,))
        d = ImageDraw.Draw(img)
        for x in range(0, W, 32):
            d.line([(x * z, 0), (x * z, gy * z)], fill=(222, 214, 196))
        for y in range(gy, 0, -32):
            d.line([(0, y * z), (W * z, y * z)], fill=(222, 214, 196))
        for k_, (im, ax, ay, cao) in items.items():
            yb = gy - (DOI_CAO if k_ == 'doi' else 0)
            h = hb[k_]
            d.rectangle([(xs[k_] - h['w'] / 2) * z, (yb - h['h']) * z, (xs[k_] + h['w'] / 2) * z, yb * z],
                        outline=(90, 150, 230))
            img.alpha_composite(im, (int(round(xs[k_] * z - ax)), int(round(yb * z - ay))))
            d = ImageDraw.Draw(img)
            d.text(((xs[k_] - 46) * z, (gy + 8) * z), ten[k_], fill=(30, 30, 30), font=font(10 * z, True))
            d.text(((xs[k_] - 46) * z, (gy + 21) * z), f'cao {cao:.0f} px · hitbox {h["w"]}×{h["h"]}',
                   fill=(60, 100, 170), font=font(9 * z))
        d.line([(0, gy * z), (W * z, gy * z)], fill=DAT, width=2 * z)
        d.text((6 * z, 6 * z), f'Cùng đường đất, cùng tỉ lệ ({z}× px logic), lưới ô 32 px. Khung xanh = hitbox gameplay '
                               f'(Nấm/Dơi/Mẹ Nấm: ĐỀ XUẤT). Dơi vẽ ở độ cao bay {DOI_CAO} px (đề xuất).',
               fill=(30, 30, 30), font=font(10 * z))
        img.convert('RGB').save(os.path.join(xem_dir('nam'), f'so-co-voi-Lam-{z}x.png'), optimize=True)
        if z == 1:
            Wm, Hm, FLOOR = 960, 540, 448
            sc = Image.new('RGBA', (Wm, Hm), (40, 48, 52, 255))
            ds = ImageDraw.Draw(sc)
            ds.rectangle([0, FLOOR, Wm, Hm], fill=(70, 62, 52))
            for x in range(0, Wm, 32):
                ds.line([(x, FLOOR), (x, Hm)], fill=(58, 52, 44))
            pos = {'Lam': 120, 'nam': 260, 'doi': 400, 'menam': 720}
            for k_, x in pos.items():
                im, ax, ay, _ = items[k_]
                yb = FLOOR - (DOI_CAO if k_ == 'doi' else 0)
                sc.alpha_composite(im, (int(round(x - ax)), int(round(yb - ay))))
            ImageDraw.Draw(sc).text((8, 8), 'Khung màn hình 960×540 px logic, đất FLOOR = 448. Lam – Nấm Mốc – Dơi Chuông '
                                            '(bay) – Mẹ Nấm Mốc, cỡ thật.', fill=(240, 240, 240), font=F)
            sc.convert('RGB').save(os.path.join(xem_dir('nam'), 'so-co-man-hinh-960x540.png'), optimize=True)


def main(ds=NV_DS, chi=None):
    iou = {}
    for nv in ds:
        os.makedirs(xem_dir(nv), exist_ok=True)
        C = NgCanh(nv)
        box = load_json(rig_json(nv))['khung_bao_moi_clip_px_nguon']
        iou[nv] = nghi_so_sanh(nv)
        bang_manh(nv)
        contact(nv, C, box)
        for clip in THU_TU_CLIP[nv]:
            if chi and clip not in chi:
                continue
            gif_clip(nv, clip, C, box)
            print(nv, clip, 'gif xong', flush=True)
    if not chi:
        so_co()
    print('IoU dáng nghỉ', iou)


if __name__ == '__main__':
    import sys
    a = sys.argv[1:]
    main([x for x in a if x in NV_DS] or NV_DS, [x for x in a if x not in NV_DS] or None)
