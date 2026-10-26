"""Bước 5 – ảnh/GIF xem thử (xem-thu/). Đọc lại đúng sprite sheet đã xuất (không vẽ lại) để xem đúng thứ game dùng,
trừ ảnh dáng nghỉ / bảng mảnh / GIF lớn của quái (vẽ trực tiếp từ rig ở 4×, mượt, KHÔNG phóng nearest).

- <nv>-<clip>-1x.gif   : cỡ chơi thật 1:1 (1 px = 1 px logic), thu từ sheet 2× (trung bình 2×2, nhân-trước-alpha)
- <nv>-<clip>-lon.gif  : cỡ lớn (quái 4×, boss 2×) + đường đất, điểm neo, hitbox thân (xanh), hộp đòn ở khung chạm (đỏ)
- <nv>-contact-sheet.png : mọi khung mọi clip, ghi số khung / ms / pha, khung chạm viền đỏ
- <nv>-nghi-so-sanh.png  : ảnh nguồn | rig ráp lại | chồng (đỏ = chỉ nguồn có, xanh = chỉ rig có) + IoU
- <nv>-manh.png          : bảng mảnh + pivot; chỗ bù (quả lắc) / chỗ cắt (xích)
- so-co-voi-Lam-1x.png / -3x.png : Lam (rig-v2) + quái + boss đứng cạnh nhau trên cùng đường đất, lưới ô 32 px
- so-co-man-hinh-960x540.png : cả ba trong khung màn hình game 960×540, đất ở FLOOR = 448"""
import os
import numpy as np
from PIL import Image, ImageDraw
from chung import (SPRITE, XEM, MANH, RIG_JSON, SRC, LAM_PNG, LAM_JSON, SHEET_X, font, load_json, load_rgb,
                   background)
import rig as R
from dong_tac import NgCanh, tinh_clip
from xuat import THU_TU_CLIP, TEN_CLIP, MOD

NEN = (236, 230, 214)
NEN_TOI = (206, 198, 178)
DAT = (150, 110, 70)
F = font(13)
FB = font(15, True)


def doc_khung(nv, clip):
    meta = load_json(os.path.join(SPRITE, f'{nv}-{clip}-2x.json'))
    pages = [Image.open(os.path.join(SPRITE, t['anh'])).convert('RGBA') for t in meta['trang']]
    fr = [pages[f['trang']].crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for f in meta['frames']]
    return meta, fr


def thu_nho_2(im):
    """2× → 1×: trung bình 2×2 trong không gian nhân-trước-alpha (đúng như game vẽ ở ½ cỡ)."""
    a = np.array(im).astype(np.float64)
    h, w = a.shape[0] // 2 * 2, a.shape[1] // 2 * 2
    a = a[:h, :w]
    al = a[..., 3:4] / 255.0
    pm = np.dstack([a[..., :3] * al, a[..., 3:4]])
    pm = pm.reshape(h // 2, 2, w // 2, 2, 4).mean((1, 3))
    A = pm[..., 3:4]
    rgb = np.where(A > 0.5, pm[..., :3] / np.maximum(A / 255.0, 1e-6), 0)
    return Image.fromarray(np.dstack([rgb, A]).clip(0, 255).round().astype(np.uint8), 'RGBA')


def len_nen(im, mau=NEN):
    b = Image.new('RGBA', im.size, mau + (255,))
    b.alpha_composite(im)
    return b


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


def ve_dat(d, w, y, ax, z):
    d.line([(0, y), (w, y)], fill=DAT, width=max(1, int(z // 2)))
    d.polygon([(ax, y), (ax - 3 * z / 2, y + 4 * z / 2), (ax + 3 * z / 2, y + 4 * z / 2)], fill=(40, 120, 220))


def gif_clip(nv, clip, C):
    meta, fr = doc_khung(nv, clip)
    ax, ay = meta['diem_neo']['x'], meta['diem_neo']['y']
    ms = [f['ms'] for f in meta['frames']]
    if meta['giu_khung_cuoi']:
        ms[-1] = 800.0                                  # giữ khung cuối 0,8 s trong GIF cho dễ xem
    # 1:1
    out = []
    for im in fr:
        s = thu_nho_2(im)
        b = Image.new('RGBA', (s.width, s.height + 6), NEN + (255,))
        b.alpha_composite(s, (0, 0))
        d = ImageDraw.Draw(b)
        d.line([(0, ay // 2), (b.width, ay // 2)], fill=DAT)
        out.append(b)
    luu_gif(out, ms, os.path.join(XEM, f'{nv}-{clip}-1x.gif'))
    # lớn
    hb = meta['hitbox_than_gameplay']
    hop = meta.get('hop_don_gameplay') or {}
    if nv == 'quai':
        z = 4.0                                         # px / px logic
        cl, ts, frames, _ = [None] * 4
        cl = MOD[nv].tao(C)[clip]
        ts, frames, _ = tinh_clip(C, cl)
        s_src = C.k * z
        K = load_json(RIG_JSON[nv])['sprite']
        box = K['hop_the_gioi_px_nguon']
        imgs = [R.render(C.rig, p, box, s_src, ss=2) for p in frames]
        axz, ayz = ax * z / SHEET_X, ay * z / SHEET_X
    else:
        z = 2.0
        imgs = fr
        axz, ayz = ax, ay
    out = []
    for i, im in enumerate(imgs):
        f = meta['frames'][i]
        pad_b = int(10 * z / 2) + 24
        b = Image.new('RGBA', (im.width, im.height + pad_b), NEN + (255,))
        d = ImageDraw.Draw(b)
        # hitbox thân (gameplay)
        d.rectangle([axz - hb['w'] / 2 * z, ayz - hb['h'] * z, axz + hb['w'] / 2 * z, ayz], outline=(90, 150, 230),
                    width=1)
        b.alpha_composite(im, (0, 0))
        d = ImageDraw.Draw(b, 'RGBA')
        ve_dat(d, b.width, ayz, axz, z)
        if f['cham']:
            lop = Image.new('RGBA', b.size, (0, 0, 0, 0))
            dl = ImageDraw.Draw(lop)
            if hop.get('dung_hitbox_than'):
                r = [axz - hb['w'] / 2 * z, ayz - hb['h'] * z, axz + hb['w'] / 2 * z, ayz]
            else:
                x0, y0 = axz + hop['dx'] * z, ayz + hop['dy'] * z
                r = [x0, y0, x0 + hop['w'] * z, y0 + hop['h'] * z]
            dl.rectangle(r, fill=(230, 30, 30, 45), outline=(230, 30, 30, 255), width=3)
            b.alpha_composite(lop)
            d = ImageDraw.Draw(b)
        txt = f'{TEN_CLIP[clip]}  khung {i}  {f["t_ms"]:.0f} ms  {f["pha"]}' + ('   CHẠM' if f['cham'] else '')
        d.text((6, b.height - 20), txt, fill=(200, 20, 20) if f['cham'] else (40, 40, 40), font=F)
        out.append(b)
    luu_gif(out, ms, os.path.join(XEM, f'{nv}-{clip}-lon.gif'))


def contact(nv):
    rows = []
    hdr_h = 22
    chia = 4 if nv == 'boss' else 2                    # boss: ½× cho vừa ảnh; quái: 1× (cỡ chơi thật)
    for clip in THU_TU_CLIP[nv]:
        meta, fr = doc_khung(nv, clip)
        ax, ay = meta['diem_neo']['x'], meta['diem_neo']['y']
        cells = []
        for i, im in enumerate(fr):
            f = meta['frames'][i]
            s = thu_nho_2(im) if chia == 2 else thu_nho_2(thu_nho_2(im))
            ayc, axc = ay / chia, ax / chia
            c = Image.new('RGBA', (max(s.width, 90), s.height + 32), NEN + (255,))
            c.alpha_composite(s)
            d = ImageDraw.Draw(c)
            d.line([(0, ayc), (c.width, ayc)], fill=DAT)
            d.polygon([(axc, ayc), (axc - 3, ayc + 5), (axc + 3, ayc + 5)], fill=(40, 120, 220))
            d.text((4, s.height + 8), f'{i} {f["t_ms"]:.0f}ms', fill=(30, 30, 30), font=F)
            d.text((4, s.height + 18), f['pha'], fill=(90, 90, 90), font=font(10))
            if f['cham']:
                d.rectangle([0, 0, c.width - 1, c.height - 1], outline=(220, 20, 20), width=3)
                d.text((4, 4), 'CHẠM', fill=(220, 20, 20), font=FB)
            cells.append(c)
        cot = min(len(cells), 12)
        w, h = cells[0].size
        hang = (len(cells) + cot - 1) // cot
        R_ = Image.new('RGBA', (cot * (w + 4), hdr_h + hang * (h + 4)), (255, 255, 255, 255))
        ImageDraw.Draw(R_).text((4, 3), f'{nv} {clip} – {TEN_CLIP[clip]}: {len(cells)} khung × {meta["buoc_ms"]:.1f} ms'
                                         f'{" (lặp)" if meta["lap"] else ""}; khung chạm {meta["khung_cham"]}',
                                font=FB, fill=(0, 0, 0))
        for j, c in enumerate(cells):
            R_.paste(c, ((j % cot) * (w + 4), hdr_h + (j // cot) * (h + 4)))
        rows.append(R_)
    W = max(r.width for r in rows)
    out = Image.new('RGB', (W, sum(r.height + 10 for r in rows)), (255, 255, 255))
    y = 0
    for r in rows:
        out.paste(r, (0, y))
        y += r.height + 10
    out.save(os.path.join(XEM, f'{nv}-contact-sheet.png'), optimize=True)


def nghi_so_sanh(nv):
    doc = load_json(RIG_JSON[nv])
    a = load_rgb(SRC[nv])
    bg, _ = background(a)
    fg = ~bg
    im = R.render(doc['rig'], {}, (0, 0, 1254, 1254), 1.0)
    r = np.array(im)[..., 3] > 128
    iou = (r & fg).sum() / (r | fg).sum()
    src = Image.fromarray(a.astype(np.uint8))
    rap = len_nen(im, (255, 255, 255))
    ov = np.full(a.shape, 255, np.uint8)
    ov[r & fg] = (a[r & fg] * 0.35 + 150).astype(np.uint8)
    ov[fg & ~r] = (230, 30, 30)
    ov[r & ~fg] = (30, 90, 230)
    W = 1254 // 2
    out = Image.new('RGB', (W * 3 + 20, W + 40), (255, 255, 255))
    for j, (p, t) in enumerate(((src, 'ảnh nguồn'), (rap.convert('RGB'), 'rig ráp lại (dáng nghỉ)'),
                                (Image.fromarray(ov), f'chồng: đỏ = chỉ nguồn, xanh = chỉ rig; IoU {iou:.4f}'))):
        out.paste(p.resize((W, W), Image.LANCZOS), (j * (W + 10), 36))
        ImageDraw.Draw(out).text((j * (W + 10) + 6, 8), t, fill=(0, 0, 0), font=FB)
    out.save(os.path.join(XEM, f'{nv}-nghi-so-sanh.png'), optimize=True)
    return float(iou)


def bang_manh(nv):
    doc = load_json(RIG_JSON[nv])
    nodes = doc['rig']['nut']
    names = [n for n in doc['rig']['thu_tu_ve']]
    cells = []
    for n in names:
        nd_ = nodes[n]
        im = Image.open(os.path.join(os.path.dirname(MANH), nd_['anh'])).convert('RGBA')
        z = 0.5
        im = im.resize((max(1, int(im.width * z)), max(1, int(im.height * z))), Image.LANCZOS)
        c = Image.new('RGBA', (im.width + 20, im.height + 40), (225, 232, 240, 255))
        c.alpha_composite(im, (10, 30))
        d = ImageDraw.Draw(c)
        px, py = nd_['pivot'][0] * z + 10, nd_['pivot'][1] * z + 30
        d.ellipse([px - 5, py - 5, px + 5, py + 5], outline=(220, 0, 0), width=2)
        d.line([(px - 9, py), (px + 9, py)], fill=(220, 0, 0))
        d.line([(px, py - 9), (px, py + 9)], fill=(220, 0, 0))
        d.text((6, 6), n + ('' if nd_.get('hien', True) else ' (chỉ clip chết)'), fill=(0, 0, 0), font=FB)
        cells.append(c)
    W = sum(c.width + 8 for c in cells)
    H = max(c.height for c in cells) + 30
    out = Image.new('RGB', (W, H), (255, 255, 255))
    x = 0
    for c in cells:
        out.paste(c, (x, 0))
        x += c.width + 8
    ImageDraw.Draw(out).text((6, H - 22), 'tỉ lệ ½ ảnh nguồn; dấu đỏ = pivot (điểm xoay). Thứ tự = thứ tự vẽ (sau → trước).',
                             fill=(0, 0, 0), font=F)
    out.save(os.path.join(XEM, f'{nv}-manh.png'), optimize=True)


def chi_tiet_bu():
    """Phóng to chỗ bù quả lắc (quái) và chỗ cắt xích (boss): nguồn | thân sau tách | mảnh tách | ráp lệch góc."""
    out = []
    for nv, hop, n_manh, pose in (('quai', (470, 780, 700, 1000), 'qua-lac', {'qua-lac': {'goc': 14}}),
                                 ('boss', (820, 760, 1180, 1160), 'xich', {'xich': {'goc': -10}})):
        doc = load_json(RIG_JSON[nv])
        a = Image.open(SRC[nv]).convert('RGBA').crop(hop)
        than = R.render(doc['rig'], {}, hop, 1.0, an=(n_manh,) + tuple(n for n in doc['rig']['thu_tu_ve']
                                                                         if n not in ('than',)))
        manh = R.render(doc['rig'], {}, hop, 1.0, an=tuple(n for n in doc['rig']['thu_tu_ve'] if n != n_manh))
        lech = R.render(doc['rig'], pose, hop, 1.0)
        imgs = [len_nen(a, (255, 255, 255)), len_nen(than, (150, 205, 255)), len_nen(manh, (150, 205, 255)),
                len_nen(lech, (255, 255, 255))]
        tit = ['ảnh nguồn', 'thân sau khi tách (đã bù)', f'mảnh {n_manh}', f'ráp, {n_manh} xoay {list(pose.values())[0]["goc"]}°']
        z = 1.4 if nv == 'quai' else 1.0
        w, h = int(imgs[0].width * z), int(imgs[0].height * z)
        row = Image.new('RGB', (4 * (w + 10), h + 30), (255, 255, 255))
        for j, (im, t) in enumerate(zip(imgs, tit)):
            row.paste(im.resize((w, h), Image.LANCZOS).convert('RGB'), (j * (w + 10), 28))
            ImageDraw.Draw(row).text((j * (w + 10) + 4, 6), t, fill=(0, 0, 0), font=FB)
        out.append(row)
    W = max(r.width for r in out)
    img = Image.new('RGB', (W, sum(r.height + 12 for r in out)), (255, 255, 255))
    y = 0
    for r in out:
        img.paste(r, (0, y))
        y += r.height + 12
    img.save(os.path.join(XEM, 'chi-tiet-bu-va-cat.png'), optimize=True)


def nhan_vat_1x(nv):
    """khung đứng (khung 0 clip đứng) ở 1× + điểm neo (x, y) trong ảnh."""
    meta, fr = doc_khung(nv, 'dung')
    im = thu_nho_2(fr[0])
    return im, meta['diem_neo']['x'] / 2, meta['diem_neo']['y'] / 2


def so_co():
    lam = Image.open(LAM_PNG).convert('RGBA')
    lm = load_json(LAM_JSON)
    lam1 = thu_nho_2(thu_nho_2(lam))                      # 4× → 1×
    L = (lam1, lm['neo'][0] / 4, lm['neo'][1] / 4)
    Q = nhan_vat_1x('quai')
    B = nhan_vat_1x('boss')
    cao = {'Lam': 112, 'quái': load_json(RIG_JSON['quai'])['ty_le']['cao_dang_nghi_px_logic'],
           'boss': load_json(RIG_JSON['boss'])['ty_le']['cao_dang_nghi_px_logic']}
    hb = {'quái': MOD['quai'].HITBOX_THAN, 'boss': MOD['boss'].HITBOX_THAN, 'Lam': {'w': 40, 'h': 120}}
    for z in (1, 3):
        W, H = 900, 420
        img = Image.new('RGBA', (W * z, H * z), NEN + (255,))
        d = ImageDraw.Draw(img)
        gy = 375
        for x in range(0, W, 32):                         # lưới ô 32 px logic
            d.line([(x * z, 0), (x * z, gy * z)], fill=(222, 214, 196))
        for y in range(gy, 0, -32):
            d.line([(0, y * z), (W * z, y * z)], fill=(222, 214, 196))
        xs = {'Lam': 110, 'quái': 300, 'boss': 640}
        for ten, (im, ax, ay) in (('Lam', L), ('quái', Q), ('boss', B)):
            imz = im.resize((im.width * z, im.height * z), Image.LANCZOS) if z > 1 else im
            x0 = int(round((xs[ten] - ax) * z))
            y0 = int(round((gy - ay) * z))
            h = hb[ten]
            d.rectangle([(xs[ten] - h['w'] / 2) * z, (gy - h['h']) * z, (xs[ten] + h['w'] / 2) * z, gy * z],
                        outline=(90, 150, 230))
            img.alpha_composite(imz, (x0, y0))
            d = ImageDraw.Draw(img)
            top = gy - cao[ten]
            d.line([((xs[ten] + 75 if ten == 'boss' else xs[ten] + 34) * z, top * z),
                    ((xs[ten] + 95 if ten == 'boss' else xs[ten] + 48) * z, top * z)], fill=(200, 30, 30), width=z)
            d.text(((xs[ten] - 40) * z, (gy + 10) * z), f'{ten}: cao {cao[ten]:.0f} px logic',
                   fill=(30, 30, 30), font=font(12 * z, True))
            d.text(((xs[ten] - 40) * z, (gy + 24) * z), f'hitbox {hb[ten]["w"]}×{hb[ten]["h"]}',
                   fill=(60, 100, 170), font=font(11 * z))
        d.line([(0, gy * z), (W * z, gy * z)], fill=DAT, width=2 * z)
        d.text((6 * z, 6 * z), f'Cùng đường đất, cùng tỉ lệ ({z}× px logic). Lưới = ô 32 px.',
               fill=(30, 30, 30), font=font(11 * z))
        d.text((6 * z, 20 * z), 'Khung xanh = hitbox gameplay (Lam: vùng ăn đòn 40×120). Vạch đỏ = đỉnh dáng nghỉ.',
               fill=(30, 30, 30), font=font(11 * z))
        img.convert('RGB').save(os.path.join(XEM, f'so-co-voi-Lam-{z}x.png'), optimize=True)
    # màn hình game
    W, H, FLOOR = 960, 540, 448
    img = Image.new('RGBA', (W, H), (60, 66, 84, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([0, FLOOR, W, H], fill=(96, 78, 60))
    for x in range(0, W, 32):
        d.line([(x, FLOOR), (x, H)], fill=(80, 64, 50))
    for y in range(FLOOR, H, 32):
        d.line([(0, y), (W, y)], fill=(80, 64, 50))
    for ten, (im, ax, ay), x in (('Lam', L, 200), ('quái', Q, 360), ('boss', B, 700)):
        img.alpha_composite(im, (int(round(x - ax)), int(round(FLOOR - ay))))
    d = ImageDraw.Draw(img)
    d.text((8, 8), 'Khung màn hình game 960×540 px logic, đất ở FLOOR = 448 (14 ô × 32). Lam – quái – boss, cỡ thật.',
           fill=(240, 240, 240), font=F)
    img.convert('RGB').save(os.path.join(XEM, 'so-co-man-hinh-960x540.png'), optimize=True)


def main():
    os.makedirs(XEM, exist_ok=True)
    iou = {}
    for nv in ('quai', 'boss'):
        C = NgCanh(nv)
        iou[nv] = nghi_so_sanh(nv)
        bang_manh(nv)
        contact(nv)
        for clip in THU_TU_CLIP[nv]:
            gif_clip(nv, clip, C)
            print(nv, clip, 'gif xong')
    chi_tiet_bu()
    so_co()
    print('IoU dáng nghỉ', iou)


if __name__ == '__main__':
    main()
