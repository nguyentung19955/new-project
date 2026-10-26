"""Bước 4: ảnh duyệt → ../tu-the/
00-nghi-so-sanh.png   dáng nghỉ: ảnh mẫu nhìn ngang | bản ráp | chồng 50 % (cùng scale) | vùng lệch
01-bang-duyet.png     4 tư thế cạnh nhau: màu lớn, silhouette lớn, 112 px 1:1 (màu + silhouette),
                      112 px ×4 màu, 112 px ×4 silhouette. Khung và đường đất cố định cho cả 4.
02-so-sanh-v5.png     bảng mới cạnh bảng duyệt v5 cũ (nếu có file v5)
03-chop-mu-lac.png    chóp mũ lắc −10° / 0 / +10° quanh pivot: gốc chóp có lộ ra không
04-manh.png           10 mảnh đã chuẩn hoá cỡ, chấm đỏ = pivot
tu-the-<ten>-lon.png / -112px.png / -112px-x4.png   từng tư thế riêng
so-lieu.json          số đo (cao nhân vật, hệ số 112 px, đế so với đất, chồng dao–ủng, chóp…)"""
import os
import json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from chung import (TU_THE, RIG, MANH, SRC_NGANG, V5_BANG, CAO_LOGIC, HE_SO_THIET_BI, font, load_json, save_json)
from rig import render
from tu_the import TEN_TU_THE, NHAN

BG = (238, 240, 244)
GROUND = (196, 60, 60)
FRAME = (150, 155, 165)


def alpha_box(im, thr=8):
    a = np.array(im)[..., 3]
    ys, xs = np.nonzero(a > thr)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def silhouette(im):
    a = np.array(im)
    out = np.zeros_like(a)
    out[..., 3] = a[..., 3]
    return Image.fromarray(out, 'RGBA')


def down(im, size):
    return im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def on_bg(im, bg=BG):
    c = Image.new('RGBA', im.size, bg + (255,))
    c.alpha_composite(im)
    return c.convert('RGB')


def cell(im, ground_px, border=True):
    """dán lên nền + đường đất + khung"""
    c = on_bg(im)
    d = ImageDraw.Draw(c)
    d.line([(0, ground_px), (c.width, ground_px)], fill=GROUND, width=max(1, c.height // 300))
    if border:
        d.rectangle([0, 0, c.width - 1, c.height - 1], outline=FRAME)
    return c


def main():
    os.makedirs(TU_THE, exist_ok=True)
    doc = load_json()
    rig = doc['rig']
    ground = rig['mat_dat_y']
    poses = {n: doc['tu_the'][n] for n in TEN_TU_THE}

    # ---- khung cố định: hộp bao của dáng nghỉ + 4 tư thế (ở scale 1) + lề
    big = (-200, -100, 1500, 1300)
    boxes = []
    full = {}
    for n in ['nghi'] + TEN_TU_THE:
        im, snapped = render(rig, {} if n == 'nghi' else poses[n], big, 1.0)
        full[n] = (im, snapped)
        x0, y0, x1, y1 = alpha_box(im)
        boxes.append((x0 + big[0], y0 + big[1], x1 + big[0], y1 + big[1]))
    rest_box = boxes[0]
    H_char = ground - rest_box[1]                      # cao nhân vật (đỉnh mũ → đất) ở dáng nghỉ
    k112 = CAO_LOGIC / H_char
    m = 40
    fx0 = min(b[0] for b in boxes) - m
    fx1 = max(b[2] for b in boxes) + m
    fy0 = min(b[1] for b in boxes) - m
    fy1 = ground + 70
    # căn khung để đường đất rơi đúng hàng px ở 112 px
    fy0 = ground - np.ceil((ground - fy0) * k112) / k112
    fy1 = ground + np.ceil((fy1 - ground) * k112) / k112
    fx1 = fx0 + np.ceil((fx1 - fx0) * k112) / k112
    frame = (float(fx0), float(fy0), float(fx1), float(fy1))
    size112 = (int(round((fx1 - fx0) * k112)), int(round((fy1 - fy0) * k112)))
    g112 = int(round((ground - fy0) * k112))

    def crop_frame(im):
        return im.crop((int(round(fx0 - big[0])), int(round(fy0 - big[1])),
                        int(round(fx1 - big[0])), int(round(fy1 - big[1]))))

    so_lieu = {'cao_nhan_vat_px_anh_ngang': round(float(H_char), 1), 'he_so_112': round(float(k112), 5),
               'khung_the_gioi': [round(v, 1) for v in frame], 'khung_112_px': size112,
               'duong_dat_112_hang': g112, 'cao_logic': CAO_LOGIC,
               'px_thiet_bi_uoc_tinh': round(CAO_LOGIC * HE_SO_THIET_BI), 'tu_the': {}}

    K_BIG = 0.36
    imgs = {}
    for n in ['nghi'] + TEN_TU_THE:
        im = crop_frame(full[n][0])
        lon = down(im, (int(im.width * K_BIG), int(im.height * K_BIG)))
        s112 = down(im, size112)
        imgs[n] = (im, lon, s112)
        # số đo
        a = np.array(im)[..., 3] > 128
        ys, xs = np.nonzero(a)
        so = {'day_px_anh_ngang': round(float(ys.max() + fy0 + 1 - ground), 1),
              'dinh_px_anh_ngang': round(float(ys.min() + fy0), 1),
              'rong_px_anh_ngang': int(xs.max() - xs.min() + 1)}
        if n != 'nghi':
            p = full[n][1]
            only = lambda names: np.array(render(rig, p, frame, 1.0, only=names)[0])[..., 3] > 128
            dao = only(['tay-truoc-dao'])
            ung = only(['ung-gan']) | only(['ung-xa'])
            so['chong_tay_dao_va_ung_px'] = int((dao & ung).sum())
            ug = only(['ung-gan'])
            ux = only(['ung-xa'])
            for tn, um in (('ung_gan', ug), ('ung_xa', ux)):
                yy = np.nonzero(um.any(1))[0]
                so[f'{tn}_cach_dat_px'] = round(float(ground - (yy.max() + 1 + fy0)), 1)
            # điểm xa nhất của dao về phía trước so với mũi ủng xa nhất
            so['dich_than_y'] = p['than']['dich'][1]
            so['nghieng_than'] = p['than']['goc']
            so['chop_mu_goc'] = p['chop-mu']['goc']
            so['vung_tay_truoc'] = p['vai-truoc']['goc']
            so['vung_tay_sau'] = p['vai-sau']['goc']
        a112 = np.array(s112)[..., 3] > 100
        yy = np.nonzero(a112.any(1))[0]
        so['cao_112_px'] = int(yy.max() - yy.min() + 1)
        so_lieu['tu_the'][n] = so
        if n != 'nghi':
            cell(lon, int((ground - fy0) * K_BIG)).save(os.path.join(TU_THE, f'tu-the-{n}-lon.png'))
            s112.save(os.path.join(TU_THE, f'tu-the-{n}-112px.png'))
            cell(s112.resize((size112[0] * 4, size112[1] * 4), Image.NEAREST), g112 * 4).save(
                os.path.join(TU_THE, f'tu-the-{n}-112px-x4.png'))

    # ---- 01 bảng duyệt
    W_l, H_l = imgs['nghi'][1].size
    W4, H4 = size112[0] * 4, size112[1] * 4
    colw = max(W_l, W4) + 30
    LBL = 210
    T = 120
    rows = [('Màu – lớn', H_l), ('Silhouette – lớn', H_l), ('112 px logic 1:1\n(màu | bóng)', size112[1] + 30),
            ('112 px ×4 – màu', H4), ('112 px ×4 – silhouette', H4)]
    Htot = T + sum(h + 30 for _, h in rows) + 60
    B = Image.new('RGB', (LBL + colw * 4 + 20, Htot), 'white')
    d = ImageDraw.Draw(B)
    d.text((20, 18), 'Lam – rig tay chân rời v1 – 4 tư thế chạy (chưa phải GIF)', fill='black', font=font(34, True))
    d.text((20, 64), f'Khung + đường đất (đỏ) cố định cho cả 4 · 112 px = cao dáng nghỉ ({H_char:.0f} px ảnh ngang × '
                     f'{k112:.4f}) · ×4 phóng điểm-ảnh (nearest)', fill=(70, 70, 70), font=font(20))
    for i, n in enumerate(TEN_TU_THE):
        d.text((LBL + i * colw + 10, T - 30), f'{i + 1}. {NHAN[n]}', fill='black', font=font(26, True))
    y = T
    for r, (lab, h) in enumerate(rows):
        d.text((14, y + 10), lab, fill='black', font=font(20, True))
        for i, n in enumerate(TEN_TU_THE):
            im, lon, s112 = imgs[n]
            x = LBL + i * colw
            if r == 0:
                B.paste(cell(lon, int((ground - fy0) * K_BIG)), (x, y))
            elif r == 1:
                B.paste(cell(silhouette(lon), int((ground - fy0) * K_BIG)), (x, y))
            elif r == 2:
                B.paste(cell(s112, g112), (x, y))
                B.paste(cell(silhouette(s112), g112), (x + size112[0] + 12, y))
            elif r == 3:
                B.paste(cell(s112.resize((W4, H4), Image.NEAREST), g112 * 4), (x, y))
            else:
                B.paste(cell(silhouette(s112).resize((W4, H4), Image.NEAREST), g112 * 4), (x, y))
        y += h + 30
    d.text((20, y), 'Thứ tự vẽ (sau→trước): ' + ' → '.join(rig['thu_tu_ve']) +
           '   ·   mắt xa ẩn ở nhìn ngang', fill=(70, 70, 70), font=font(18))
    B.save(os.path.join(TU_THE, '01-bang-duyet.png'))

    # ---- 00 dáng nghỉ so với ảnh mẫu (cùng scale ảnh ngang)
    ref = Image.open(SRC_NGANG).convert('RGBA')
    rap, _ = render(rig, {}, (0, 0, ref.width, ref.height), 1.0)
    rap_w = on_bg(rap, (255, 255, 255)).convert('RGBA')
    chong = Image.blend(ref, rap_w, 0.5)
    ra = np.array(rap)[..., 3] > 128
    from chung import background, load_rgb
    bgr, _ = background(load_rgb(SRC_NGANG))
    fa = ~bgr
    lech = np.full(ra.shape + (3,), 255, np.uint8)
    lech[fa & ra] = (200, 200, 200)
    lech[fa & ~ra] = (220, 40, 40)          # ảnh mẫu có, bản ráp không
    lech[~fa & ra] = (40, 90, 220)          # bản ráp có, ảnh mẫu không
    iou = float((fa & ra).sum() / (fa | ra).sum())
    so_lieu['nghi_iou_silhouette_voi_anh_ngang'] = round(iou, 4)
    so_lieu['nghi_px_mau_co_rap_khong'] = int((fa & ~ra).sum())
    so_lieu['nghi_px_rap_co_mau_khong'] = int((~fa & ra).sum())
    tiles = [('Ảnh mẫu 2-nhin-ngang', ref.convert('RGB')), ('Bản ráp (rig, dáng nghỉ)', rap_w.convert('RGB')),
             ('Chồng 50 %', chong.convert('RGB')),
             (f'Lệch bóng: đỏ = mẫu có/ráp không, xanh = ngược lại (IoU {iou:.3f})', Image.fromarray(lech))]
    S = 0.6
    tw = int(ref.width * S)
    C = Image.new('RGB', (tw * 4 + 50, int(ref.height * S) + 60), 'white')
    dc = ImageDraw.Draw(C)
    for i, (t, im) in enumerate(tiles):
        C.paste(im.resize((tw, int(ref.height * S)), Image.LANCZOS), (10 + i * (tw + 10), 50))
        dc.text((10 + i * (tw + 10), 14), t, fill='black', font=font(18, True))
    C.save(os.path.join(TU_THE, '00-nghi-so-sanh.png'))

    # ---- 03 chóp mũ lắc ±10°
    only = ['mu', 'chop-mu']
    nut = rig['nut']
    tiles = []
    chop_lo = {}
    for g in (-10, 0, 10):
        p = {'chop-mu': {'goc': g}}
        box = (0, 0, 1000, 800)
        im, _ = render(rig, p, box, 1.0, only=only)
        mu_a = np.array(render(rig, p, box, 1.0, only=['mu'])[0])[..., 3] > 128
        # phần gốc chóp (30 % bên phải) – vẽ riêng với alpha chỉ ở phần gốc
        ch_im = np.array(render(rig, p, box, 1.0, only=['chop-mu'])[0])[..., 3] > 128
        un = mu_a | ch_im
        holes = nd.binary_fill_holes(un) & ~un
        clo = nd.binary_closing(un, structure=np.ones((9, 9))) & ~un
        lo_goc = ch_im & ~mu_a
        chop_lo[str(g)] = {'lo_trong_px': int(holes.sum()), 'khe_hep_px': int(clo.sum())}
        vis = on_bg(im, (255, 255, 255))
        arr = np.array(vis)
        arr[holes] = (255, 0, 0)
        arr[clo] = (255, 120, 0)
        tiles.append((f'chóp {g:+d}°  (lỗ {int(holes.sum())} px, khe {int(clo.sum())} px)',
                      Image.fromarray(arr).crop((0, 0, 1000, 800))))
    so_lieu['chop_mu_lac'] = chop_lo
    C = Image.new('RGB', (3 * 510 + 20, 470), 'white')
    dc = ImageDraw.Draw(C)
    for i, (t, im) in enumerate(tiles):
        C.paste(im.resize((500, 400), Image.LANCZOS), (10 + i * 510, 50))
        dc.text((10 + i * 510, 14), t, fill='black', font=font(18, True))
    dc.text((10, 452), 'Chỉ vẽ mũ + chóp. Đỏ = lỗ thủng, cam = khe hẹp giữa mũ và chóp (nếu có).', fill=(80, 80, 80),
            font=font(14))
    C.save(os.path.join(TU_THE, '03-chop-mu-lac.png'))

    # ---- 04 bảng mảnh có pivot
    names = [n for n in rig['thu_tu_ve']]
    ims = [Image.open(os.path.join(RIG, nut[n]['anh'])) for n in names]
    S = 0.5
    Wt = sum(max(int(i.width * S), 125) + 20 for i in ims) + 20
    Ht = max(int(i.height * S) for i in ims) + 70
    C = Image.new('RGB', (Wt, Ht), (230, 232, 236))
    dc = ImageDraw.Draw(C)
    x = 20
    for n, im in zip(names, ims):
        t = on_bg(down(im, (int(im.width * S), int(im.height * S))), (255, 255, 255))
        C.paste(t, (x, 50))
        px, py = nut[n]['pivot']
        cx, cy = x + px * S, 50 + py * S
        dc.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(230, 0, 0))
        dc.text((x, 12), n, fill='black', font=font(16, True))
        dc.text((x, 30), f'{im.width}×{im.height}', fill=(80, 80, 80), font=font(13))
        x += max(t.width, 125) + 20
    C.save(os.path.join(TU_THE, '04-manh.png'))

    # ---- 02 so với v5
    if os.path.isfile(V5_BANG):
        v5 = Image.open(V5_BANG).convert('RGB')
        newb = Image.open(os.path.join(TU_THE, '01-bang-duyet.png'))
        h = newb.height
        v5r = v5.resize((int(v5.width * h / v5.height), h), Image.LANCZOS)
        C = Image.new('RGB', (v5r.width + newb.width + 40, h + 70), 'white')
        dc = ImageDraw.Draw(C)
        C.paste(v5r, (10, 60))
        C.paste(newb, (v5r.width + 30, 60))
        dc.text((10, 14), 'v5 cũ (cutout-v5/tu-the/01-bang-duyet.png) – tay/chân có khuỷu, gối', fill='black',
                font=font(26, True))
        dc.text((v5r.width + 30, 14), 'rig-v1 mới – tay chân rời', fill='black', font=font(26, True))
        C.save(os.path.join(TU_THE, '02-so-sanh-v5.png'))
        so_lieu['so_sanh_v5'] = True
    else:
        so_lieu['so_sanh_v5'] = False
    save_json(so_lieu, os.path.join(TU_THE, 'so-lieu.json'))
    print(json.dumps(so_lieu, ensure_ascii=False, indent=1)[:2500])


if __name__ == '__main__':
    main()
