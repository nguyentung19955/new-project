"""Bước 4 (v3): ảnh duyệt → ../tu-the/  (mọi ảnh cùng khung cố định với GIF: cùng gốc, canvas, đường đất)
00-nghi-so-sanh.png     dáng nghỉ v3 so với ảnh mẫu nhìn ngang (+ v1) – vùng lệch bóng, IoU
01-bang-duyet.png       4 tư thế mới: màu lớn, bóng lớn, 112 px 1:1 (màu|bóng), 112 px ×4 màu, ×4 bóng
02-so-sanh-v1-v3.png    cùng 4 tư thế: v1 (hàng trên) ↔ v3 (hàng dưới) – lớn + 112 px ×4 + bóng ×4
03-sua-gay-mu.png       gáy mũ/chóp phóng to: ảnh mẫu | v1 | v3, vùng lệch, 112 px ×4
04-chop-mu-lac.png      chóp lắc −10…+10° (dải dùng trong chu kỳ v3 −3…+3,5°) có lớp gáy mũ
05-ung-chuan-hoa.png    hai ủng v1 (×0,934 / ×0,971) ↔ v3 (cùng cỡ), chồng lên nhau, điểm neo
06-thu-toi-10.png       thử tối tay sau + ủng xa 10 %: không tối | tối, lớn và 112 px ×4
07-tay-sau-duong-di.png đường đi nắm tay sau cả chu kỳ v1 ↔ v3 trên bóng thân + % còn thấy ở 112 px
08-manh.png             các mảnh v3, chấm đỏ = pivot
tu-the-<ten>-lon.png / -112px.png / -112px-x4.png"""
import os
import json
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from chung import TU_THE, RIG, MANH, SRC_NGANG, V1_DIR, SO_LIEU, font, load_json, background, load_rgb
from rig import render, world_mats, piece_matrix
from khung import khung_co_dinh, nen, ghep, bong, thu_nho, KHUNG_VIEN
from chu_ky import TEN_TU_THE, NHAN, PHA_TU_THE, make_pose, chuan_bi_ung
from phan_tich import tai_v1

K_LON = 0.36


def khung_anh(doc, K, pose, rig=None, v1=None, toi=None, scale=1.0):
    """nhân vật (RGBA) trong khung cố định ở tỉ lệ scale (v1: (module, doc) để vẽ bằng rig-v1)."""
    if v1:
        m, d1 = v1
        return m.render(d1['rig'], pose, K['khung'], scale, rig_dir=V1_DIR)[0]
    return render(rig or doc['rig'], pose, K['khung'], scale, toi=toi)


def bo_anh(doc, K, nv1):
    """từ ảnh 1:1 → (lớn màu, lớn bóng, 112 màu, 112 bóng) đã dán nền + đất."""
    bg1 = nen(K, 1.0, None, vach=False)
    s112 = K['co_112']
    full = ghep(bg1, nv1)
    sil = ghep(bg1, bong(nv1))
    lw, lh = int(full.width * K_LON), int(full.height * K_LON)
    return (full.resize((lw, lh), Image.LANCZOS), sil.resize((lw, lh), Image.LANCZOS),
            full.resize(s112, Image.LANCZOS), sil.resize(s112, Image.LANCZOS))


def x4(im):
    return im.resize((im.width * 4, im.height * 4), Image.NEAREST)


def vien(im):
    im = im.copy()
    ImageDraw.Draw(im).rectangle([0, 0, im.width - 1, im.height - 1], outline=KHUNG_VIEN)
    return im


def bang_luoi(path, tieu_de, phu, cot, hang, o):
    """o[(r, c)] = ảnh; hang = [(nhãn, cao)], cot = [nhãn]."""
    LBL = 230
    cw = max(im.width for im in o.values()) + 24
    T = 130
    H = T + sum(h + 26 for _, h in hang) + 30
    B = Image.new('RGB', (LBL + cw * len(cot) + 10, H), 'white')
    d = ImageDraw.Draw(B)
    d.text((16, 14), tieu_de, fill='black', font=font(32, True))
    d.text((16, 58), phu, fill=(70, 70, 70), font=font(18))
    for i, c in enumerate(cot):
        d.text((LBL + i * cw + 6, T - 34), c, fill='black', font=font(24, True))
    y = T
    for r, (lab, h) in enumerate(hang):
        d.multiline_text((12, y + 8), lab, fill='black', font=font(19, True))
        for c in range(len(cot)):
            if (r, c) in o:
                B.paste(o[(r, c)], (LBL + c * cw, y))
        y += h + 26
    B.save(path)


def main(doc=None, K=None):
    os.makedirs(TU_THE, exist_ok=True)
    doc = doc or load_json()
    rig = doc['rig']
    chuan_bi_ung(rig)
    K = K or khung_co_dinh(doc)
    sl = json.load(open(SO_LIEU, encoding='utf-8')) if os.path.isfile(SO_LIEU) else {}
    v1 = tai_v1()
    poses = {n: doc['tu_the'][n] for n in TEN_TU_THE}
    g112 = K['dat_112']

    # ---------------- 01 bảng duyệt + từng tư thế
    imgs = {}
    for n in TEN_TU_THE:
        nv = khung_anh(doc, K, poses[n])
        imgs[n] = bo_anh(doc, K, nv)
        lon, sil, s112, sil112 = imgs[n]
        vien(lon).save(os.path.join(TU_THE, f'tu-the-{n}-lon.png'))
        s112.save(os.path.join(TU_THE, f'tu-the-{n}-112px.png'))
        vien(x4(s112)).save(os.path.join(TU_THE, f'tu-the-{n}-112px-x4.png'))
    lon0 = imgs[TEN_TU_THE[0]][0]
    W112, H112 = K['co_112']
    o = {}
    for c, n in enumerate(TEN_TU_THE):
        lon, sil, s112, sil112 = imgs[n]
        o[(0, c)] = vien(lon)
        o[(1, c)] = vien(sil)
        pair = Image.new('RGB', (W112 * 2 + 12, H112), 'white')
        pair.paste(vien(s112), (0, 0))
        pair.paste(vien(sil112), (W112 + 12, 0))
        o[(2, c)] = pair
        o[(3, c)] = vien(x4(s112))
        o[(4, c)] = vien(x4(sil112))
    hang = [('Màu – lớn', lon0.height), ('Bóng – lớn', lon0.height), ('112 px logic 1:1\n(màu | bóng)', H112),
            ('112 px ×4 – màu', H112 * 4), ('112 px ×4 – bóng', H112 * 4)]
    cot = [f'{i + 1}. {NHAN[n]} (khung {int(round(PHA_TU_THE[n] * len(doc['chu_ky']['khung'])))})' for i, n in enumerate(TEN_TU_THE)]
    bang_luoi(os.path.join(TU_THE, '01-bang-duyet.png'), 'Lam – rig-v4 (chạy nhanh) – 4 tư thế chạy (lấy từ chu kỳ liên tục)',
              f'Khung + đường đất (đỏ) + gốc (tam giác xanh) cố định, giống GIF · 112 px = cao dáng nghỉ '
              f'({K["cao_nghi"]:.0f} px ảnh ngang × {K["k112"]:.4f}) · ×4 = phóng điểm-ảnh (nearest) · '
              f'tay sau/ủng xa KHÔNG làm tối', cot, hang, o)

    # ---------------- 02 so sánh v1 ↔ v3
    o = {}
    for c, n in enumerate(TEN_TU_THE):
        nv1 = khung_anh(doc, K, v1[1]['tu_the'][n], v1=v1)
        a1 = bo_anh(doc, K, nv1)
        a2 = imgs[n]
        o[(0, c)] = vien(a1[0])
        o[(1, c)] = vien(a2[0])
        o[(2, c)] = vien(x4(a1[2]))
        o[(3, c)] = vien(x4(a2[2]))
        o[(4, c)] = vien(x4(a1[3]))
        o[(5, c)] = vien(x4(a2[3]))
    hang = [('rig-v1 – lớn', lon0.height), ('rig-v3 – lớn', lon0.height), ('rig-v1 – 112 px ×4', H112 * 4),
            ('rig-v3 – 112 px ×4', H112 * 4), ('rig-v1 – bóng ×4', H112 * 4), ('rig-v3 – bóng ×4', H112 * 4)]
    bang_luoi(os.path.join(TU_THE, '02-so-sanh-v1-v3.png'), 'So sánh rig-v1 ↔ rig-v3 (cùng khung, cùng đất)',
              'v3: gáy mũ liền · 2 ủng cùng cỡ · tay sau đi vòng phía sau (luôn ló) · bay: 1 ủng thu sau, 1 ủng đưa '
              'trước, cả hai rời đất · chịu lực lăn đế không trượt', [NHAN[n] for n in TEN_TU_THE], hang, o)

    # ---------------- 00 + 03: dáng nghỉ & gáy mũ
    ref = Image.open(SRC_NGANG).convert('RGBA')
    bgr, _ = background(load_rgb(SRC_NGANG))
    fa = ~bgr
    box = (0, 0, ref.width, ref.height)
    rap2 = render(rig, doc['tu_the_nghi'], box, 1.0)
    rap1 = v1[0].render(v1[1]['rig'], {}, box, 1.0, rig_dir=V1_DIR)[0]

    def tren_trang(im):
        w = Image.new('RGBA', im.size, (255, 255, 255, 255))
        w.alpha_composite(im)
        return w.convert('RGB')

    def lech(im):
        ra = np.array(im)[..., 3] > 128
        L = np.full(ra.shape + (3,), 255, np.uint8)
        L[fa & ra] = (200, 200, 200)
        L[fa & ~ra] = (220, 40, 40)
        L[~fa & ra] = (40, 90, 220)
        iou = float((fa & ra).sum() / (fa | ra).sum())
        return Image.fromarray(L), iou, int((fa & ~ra).sum()), int((~fa & ra).sum())
    l1, iou1, m1, x1_ = lech(rap1)
    l2, iou2, m2, x2_ = lech(rap2)
    S = 0.5
    tiles = [('Ảnh mẫu 2-nhin-ngang', ref.convert('RGB')), ('rig-v3 dáng nghỉ', tren_trang(rap2)),
             (f'Lệch v1 (IoU {iou1:.3f})', l1), (f'Lệch v3 (IoU {iou2:.3f})', l2)]
    tw, th = int(ref.width * S), int(ref.height * S)
    C = Image.new('RGB', (tw * 4 + 50, th + 90), 'white')
    dc = ImageDraw.Draw(C)
    for i, (t, im) in enumerate(tiles):
        C.paste(im.resize((tw, th), Image.LANCZOS), (10 + i * (tw + 10), 50))
        dc.text((10 + i * (tw + 10), 14), t, fill='black', font=font(18, True))
    dc.text((10, th + 60), 'Đỏ = mẫu có / rig không · xanh = rig có / mẫu không · xám = trùng', fill=(80, 80, 80),
            font=font(15))
    C.save(os.path.join(TU_THE, '00-nghi-so-sanh.png'))
    so_nghi = {'iou_v1': round(iou1, 4), 'iou_v3': round(iou2, 4), 'px_mau_co_rap_khong_v1': m1,
               'px_mau_co_rap_khong_v3': m2, 'px_rap_co_mau_khong_v1': x1_, 'px_rap_co_mau_khong_v3': x2_}
    # vùng mũ (y < 600): đếm riêng
    mu_box = (120, 40, 900, 600)

    def dem_mu(im):
        ra = np.array(im)[..., 3] > 128
        sub = (slice(mu_box[1], mu_box[3]), slice(mu_box[0], mu_box[2]))
        return int((fa & ~ra)[sub].sum()), int((~fa & ra)[sub].sum())
    so_nghi['vung_mu_px_lech_v1'] = dem_mu(rap1)
    so_nghi['vung_mu_px_lech_v3'] = dem_mu(rap2)
    hb = (140, 30, 720, 470)                                   # gáy + chóp
    Z = 1.2
    crops = [('Ảnh mẫu', ref.convert('RGB').crop(hb)), ('rig-v1 (hai bướu)', tren_trang(rap1).crop(hb)),
             ('rig-v3 (đã sửa)', tren_trang(rap2).crop(hb)), ('Lệch v1', l1.crop(hb)), ('Lệch v3', l2.crop(hb))]
    cw, chh = int((hb[2] - hb[0]) * Z), int((hb[3] - hb[1]) * Z)
    # 112 px ×4 vùng đầu
    k = K['k112']

    def dau112(im):
        sm = thu_nho(im, (int(round(im.width * k)), int(round(im.height * k))))
        w = Image.new('RGBA', sm.size, (238, 240, 244, 255))
        w.alpha_composite(sm)
        bb = tuple(int(round(v * k)) for v in hb)
        return x4(w.convert('RGB').crop(bb))
    refa = ref.copy()
    sm = [('Ảnh mẫu 112 px ×4', dau112(refa)), ('v1 112 px ×4', dau112(rap1)), ('v3 112 px ×4', dau112(rap2))]
    C = Image.new('RGB', (cw * 3 + 40, 60 + chh * 2 + 60 + sm[0][1].height + 60), 'white')
    dc = ImageDraw.Draw(C)
    dc.text((10, 10), 'Sửa gáy mũ / chóp (phóng to ×1,2 so với ảnh ngang; dáng nghỉ)', fill='black',
            font=font(26, True))
    for i, (t, im) in enumerate(crops):
        r, c = divmod(i, 3)
        x = 10 + c * (cw + 10)
        y = 60 + r * (chh + 30)
        C.paste(im.resize((cw, chh), Image.LANCZOS), (x, y + 24))
        dc.text((x, y), t, fill='black', font=font(18, True))
    dc.text((10 + 2 * (cw + 10), 60 + chh + 60),
            'v1: nét viền gáy mũ vắt qua chóp →\n"hai bướu", đỉnh thấp hơn mẫu.\nv3: gáy/đỉnh lấy đúng điểm ảnh của\n'
            'ảnh ngang, cắt theo nếp gấp đen\ncó sẵn; lớp "gáy mũ" nằm sau chóp\nđỡ khi chóp lắc.\n\n'
            f'Px lệch vùng mũ (mẫu có/rig không):\n v1 {so_nghi["vung_mu_px_lech_v1"][0]}  →  v3 '
            f'{so_nghi["vung_mu_px_lech_v3"][0]}\nPx lệch (rig có/mẫu không):\n v1 {so_nghi["vung_mu_px_lech_v1"][1]}'
            f'  →  v3 {so_nghi["vung_mu_px_lech_v3"][1]}', fill=(40, 40, 40), font=font(17))
    y = 60 + 2 * (chh + 30) + 10
    for i, (t, im) in enumerate(sm):
        x = 10 + i * (cw + 10)
        dc.text((x, y), t, fill='black', font=font(18, True))
        C.paste(im, (x, y + 26))
    C.save(os.path.join(TU_THE, '03-sua-gay-mu.png'))

    # ---------------- 04 chóp lắc
    tiles = []
    lac = {}
    for gc in (-10, -6, 0, 7, 10):
        p = {'chop-mu': {'goc': gc}}
        b = (120, 20, 920, 720)
        im = render(rig, p, b, 1.0, only=['mu', 'mu-gay', 'chop-mu', 'mat-gan'])
        a = np.array(im)[..., 3] > 128
        holes = nd.binary_fill_holes(a) & ~a
        arr = np.array(tren_trang(im))
        arr[holes] = (255, 0, 0)
        lac[str(gc)] = {'lo_thung_px': int(holes.sum())}
        tiles.append((f'chóp {gc:+d}°  (lỗ {int(holes.sum())} px)', Image.fromarray(arr)))
    C = Image.new('RGB', (5 * 410 + 20, 470), 'white')
    dc = ImageDraw.Draw(C)
    for i, (t, im) in enumerate(tiles):
        C.paste(im.resize((400, 350), Image.LANCZOS), (10 + i * 410, 50))
        dc.text((10 + i * 410, 14), t, fill='black', font=font(18, True))
    dc.text((10, 415), 'Chỉ vẽ mũ + gáy mũ + chóp + mắt. Chu kỳ chạy v3 dùng −3…+3,5° (v2: −6…+7°); v3 dời pivot chóp lên giữa nếp gấp. Đỏ = lỗ thủng (nếu có). '
                       'Khi chóp hất lên, khe dưới chóp rộng ra (gáy mũ có viền đỡ phía sau).',
            fill=(80, 80, 80), font=font(15))
    C.save(os.path.join(TU_THE, '04-chop-mu-lac.png'))

    # ---------------- 05 ủng chuẩn hoá
    def ung_img(dirp, ten):
        return Image.open(os.path.join(dirp, 'manh', ten + '.png')).convert('RGBA')
    S = 1.5
    C = Image.new('RGB', (1060, 520), 'white')
    dc = ImageDraw.Draw(C)
    dc.text((10, 10), 'Hai ủng: v1 (đo riêng từng chỗ) ↔ v3 (cùng cỡ, cùng điểm neo giữa đế)', fill='black',
            font=font(24, True))
    ch = json.load(open(os.path.join(MANH, 'goc', 'chuan-hoa.json'), encoding='utf-8'))
    info = {}
    for col, (lab, dirp) in enumerate((('rig-v1', V1_DIR), ('rig-v3', RIG))):
        x0 = 20 + col * 520
        dc.text((x0, 50), lab, fill='black', font=font(20, True))
        canvas = Image.new('RGBA', (480, 330), (255, 255, 255, 255))
        for ten, mau in (('ung-xa', (235, 104, 52)), ('ung-gan', (42, 120, 214))):
            im = ung_img(dirp, ten)
            a = np.array(im)[..., 3] > 128
            ys, xs = np.nonzero(a)
            bx = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
            info[f'{lab}_{ten}'] = [int(bx[2] - bx[0]), int(bx[3] - bx[1])]
            sc = im.resize((int(im.width * S), int(im.height * S)), Image.LANCZOS)
            # đặt giữa đế trùng nhau
            px = (bx[0] + bx[2]) / 2 * S
            py = bx[3] * S
            ov = np.array(sc).astype(float)
            ov[..., :3] = ov[..., :3] * 0.35 + np.array(mau) * 0.65
            ov[..., 3] *= 0.55
            canvas.alpha_composite(Image.fromarray(ov.astype(np.uint8)), (int(240 - px), int(300 - py)))
        d2 = ImageDraw.Draw(canvas)
        d2.ellipse([234, 294, 246, 306], fill=(220, 0, 0))
        C.paste(canvas.convert('RGB'), (x0, 80))
        g_ = info[f'{lab}_ung-gan']
        x_ = info[f'{lab}_ung-xa']
        hs = ('×0,934 / ×0,971' if lab == 'rig-v1' else
              f'×{ch["ung-gan"]["he_so"]:.3f} / ×{ch["ung-xa"]["he_so"]:.3f} (cùng diện tích)')
        dc.text((x0, 420), f'xanh = ủng gần {g_[0]}×{g_[1]} px · cam = ủng xa {x_[0]}×{x_[1]} px', fill=(40, 40, 40),
                font=font(16))
        dc.text((x0, 444), f'hệ số phóng {hs}', fill=(40, 40, 40), font=font(16))
    dc.text((20, 480), 'Hai ủng chồng nhau, căn giữa đế (chấm đỏ = điểm neo). Hình vẽ mỗi ủng giữ nguyên bảng mảnh.',
            fill=(80, 80, 80), font=font(15))
    C.save(os.path.join(TU_THE, '05-ung-chuan-hoa.png'))

    # ---------------- 06 tối 10 % (v3: BẬT mặc định) – so với không tối
    o = {}
    for c, n in enumerate(TEN_TU_THE):
        a0 = bo_anh(doc, K, khung_anh(doc, K, poses[n], toi={}))
        a1 = imgs[n]
        o[(0, c)] = vien(a0[0])
        o[(1, c)] = vien(a1[0])
        o[(2, c)] = vien(a0[2])
        o[(3, c)] = vien(a1[2])
        o[(4, c)] = vien(x4(a0[2]))
        o[(5, c)] = vien(x4(a1[2]))
    hang = [('Không tối – lớn', lon0.height), ('Tối 10 % (v3) – lớn', lon0.height), ('Không tối\n112 px 1:1', H112),
            ('Tối 10 % (v3)\n112 px 1:1', H112), ('Không tối\n112 px ×4', H112 * 4), ('Tối 10 % (v3)\n112 px ×4', H112 * 4)]
    bang_luoi(os.path.join(TU_THE, '06-toi-10.png'), 'Tối tay sau + ủng xa 10 % (×0,90 màu) – v3 BẬT mặc định',
              'Kiểm ở đúng 112 px: số đo độ sáng trong so-lieu.json → toi_10_112px. Mọi GIF/sprite v3 đều tối.',
              [NHAN[n] for n in TEN_TU_THE], hang, o)

    # ---------------- 07 đường đi tay sau
    S = 0.5
    b = (100, 500, 1100, 1060)
    C = Image.new('RGB', (2 * 520 + 30, 450), 'white')
    dc = ImageDraw.Draw(C)
    dc.text((10, 10), 'Đường đi nắm tay sau cả chu kỳ (32 khung) trên bóng thân + mũ (dáng chịu lực)', fill='black',
            font=font(22, True))
    vs = sl.get('tay_sau_thay_phan_tram_112px', {})
    for col, lab in enumerate(('rig-v1', 'rig-v3')):
        if lab == 'rig-v1':
            m, d1 = v1
            base = m.render(d1['rig'], d1['tu_the']['chiu-luc'], b, S, rig_dir=V1_DIR,
                            only=['than', 'mu', 'chop-mu', 'chuong'])[0]
            pts = []
            # v1 chỉ có 4 tư thế; nửa sau = đổi dấu góc vung → vẽ cung ±20° quanh vai ẩn
            for i in range(SO := 32):
                phi = i / SO
                pz = {'than': d1['tu_the']['chiu-luc']['than'], 'vai-sau': {'goc': -20 * np.cos(2 * np.pi * phi)}}
                W = m.world_mats(d1['rig'], pz)['tay-sau']
                pts.append((W[0, 2], W[1, 2]))
            vv = vs.get('v1_tu_the', {})
            note = '±20° quanh vai ẩn → ra trước lẩn sau thân.'
        else:
            base = render(rig, doc['tu_the']['chiu-luc'], b, S, only=['than', 'mu', 'mu-gay', 'chop-mu', 'chuong'])
            pts = []
            for i in range(32):
                p, _ = make_pose(rig, i / 32)
                W = world_mats(rig, p)['tay-sau']
                pts.append((W[0, 2], W[1, 2]))
            vv = vs.get('tu_the', {})
            note = 'vòng elip phía sau lưng (ra trước tới mép thân, về sau cao hơn).'
        it = list(vv.items())
        note += '\nCòn thấy ở 112 px: ' + ' · '.join(f'{NHAN[n]} {v:g} %' for n, v in it[:2])
        note += '\n' + ' · '.join(f'{NHAN[n]} {v:g} %' for n, v in it[2:])
        x0 = 10 + col * 530
        w = Image.new('RGBA', base.size, (255, 255, 255, 255))
        sil = bong(base)
        arr = np.array(sil).astype(float)
        arr[..., :3] = 200
        w.alpha_composite(Image.fromarray(arr.astype(np.uint8)))
        dd = ImageDraw.Draw(w)
        P = [((x - b[0]) * S, (y - b[1]) * S) for x, y in pts]
        dd.line(P + [P[0]], fill=(98, 80, 214), width=2)
        for i, (x, y) in enumerate(P):
            r = 6 if i % 8 == 0 else 3
            dd.ellipse([x - r, y - r, x + r, y + r], fill=(235, 104, 52) if i == 0 else (98, 80, 214))
        C.paste(w.convert('RGB'), (x0, 50))
        dc.text((x0, 52 + w.height + 4), lab, fill='black', font=font(18, True))
        dc.multiline_text((x0, 52 + w.height + 28), note, fill=(40, 40, 40), font=font(15))
    C.save(os.path.join(TU_THE, '07-tay-sau-duong-di.png'))

    # ---------------- 08 mảnh
    nut = rig['nut']
    names = list(rig['thu_tu_ve'])
    ims = [Image.open(os.path.join(RIG, nut[n]['anh'])) for n in names]
    S = 0.45
    Wt = sum(max(int(i.width * S), 120) + 20 for i in ims) + 20
    Ht = max(int(i.height * S) for i in ims) + 70
    C = Image.new('RGB', (Wt, Ht), (230, 232, 236))
    dc = ImageDraw.Draw(C)
    x = 20
    for n, im in zip(names, ims):
        t = Image.new('RGBA', (int(im.width * S), int(im.height * S)), (255, 255, 255, 255))
        t.alpha_composite(thu_nho(im, t.size))
        C.paste(t.convert('RGB'), (x, 50))
        px, py = nut[n]['pivot']
        cx, cy = x + px * S, 50 + py * S
        dc.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(230, 0, 0))
        dc.text((x, 12), n, fill='black', font=font(16, True))
        dc.text((x, 30), f'{im.width}×{im.height}', fill=(80, 80, 80), font=font(13))
        x += max(t.width, 120) + 20
    C.save(os.path.join(TU_THE, '08-manh.png'))

    # số liệu bổ sung
    if sl:
        sl['nghi_so_voi_anh_ngang'] = so_nghi
        sl['chop_mu_lac'] = lac
        sl['ung_bong_rong_cao_px'] = info
        sl['tu_the_112'] = {}
        for n in TEN_TU_THE:
            a = np.array(imgs[n][3].convert('L')) < 128
            yy = np.nonzero(a[:g112].any(1))[0]
            sl['tu_the_112'][n] = {'cao_px': int(yy.max() - yy.min() + 1)}
        from chung import save_json
        save_json(sl, SO_LIEU)
    print('duyệt xong:', sorted(os.listdir(TU_THE)), so_nghi)


if __name__ == '__main__':
    main()
