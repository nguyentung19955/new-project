"""Bước 3: dựng 13 mảnh rig trong HỆ TOẠ ĐỘ ẢNH ĐÃ CHỐT (1254×1254) → ../manh/<ten>.png + ../manh/manh.json

Nguyên tắc (để dáng nghỉ TRÙNG ảnh chốt mà mảnh vẫn đủ phần bị che):
  • Phần NHÌN THẤY của mỗi mảnh lấy đúng điểm ảnh của ảnh chốt (đã khử viền trắng) → ráp lại = ảnh chốt.
  • Phần BỊ CHE (dưới mảnh khác) được lấp: mũ, dao (chuôi), găng xa, 2 ủng lấy từ BẢNG MẢNH (đã đo cỡ/khớp vị trí);
    vải (thân, vạt, áo choàng vai, tay áo) lấp bằng inpaint từ chính vải nhìn thấy, tối đi 12 % (đọc như bóng bên trong).
  • Đường ráp không có nét mực trong ảnh chốt (chân chóp mũ, mép trên/trái vạt trước, mép thân trên vạt sau) làm MỀM
    (alpha giảm dần ~14–20 px) để khi mảnh xoay không lộ vết cắt.
  • Mảnh chia vùng bằng màu (mắt hổ phách, chuông đồng, dao, áo choàng vai xanh xám) + đa giác tay (vẽ từ lưới toạ độ).
Thứ tự vẽ (sau → trước): găng xa, ủng xa, vạt sau, thân, ủng gần, vạt trước, áo choàng vai, mũ, chóp, mắt, chuông, dao, găng gần.
"""
import os
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage as nd
from chung import (SRC_CHOT, SRC_BANG, MANH, KIEM, load_rgb, background, unmix_white, doc_json, luu_json, font)

THU_TU = ['gang-xa', 'ung-xa', 'vat-sau', 'than', 'ung-gan', 'vat-truoc', 'ao-vai', 'mu', 'chop', 'mat', 'chuong', 'dao',
          'gang-gan']
TEN_VIET = {'gang-xa': 'găng xa', 'ung-xa': 'ủng xa', 'vat-sau': 'vạt sau', 'than': 'thân áo', 'ung-gan': 'ủng gần',
            'vat-truoc': 'vạt trước', 'ao-vai': 'áo choàng vai', 'mu': 'mũ', 'chop': 'chóp mũ', 'mat': 'mắt',
            'chuong': 'chuông (có dây)', 'dao': 'dao', 'gang-gan': 'găng gần + tay áo'}
H = W = 1254

# đa giác tay gần (tay áo + găng), toạ độ ảnh chốt, đo trên lưới 20 px
TAY_GAN = [(612, 698), (598, 712), (588, 740), (578, 780), (568, 820), (560, 860), (555, 900), (552, 930), (560, 948),
           (600, 952), (640, 958), (690, 962), (722, 955), (730, 920), (730, 880), (722, 852), (706, 825), (690, 798),
           (668, 760), (646, 722), (632, 704)]
# đường ráp vạt sau | thân (nếp gấp có sẵn ở x≈395)
VAT_SAU_X = lambda y: 400 - (y - 975) * 8 / 185
VAT_SAU_Y0 = 975
VAT_TRUOC_X0, VAT_TRUOC_Y0 = 598, 1000
LAM_TOI_LAP = 0.08


def poly_mask(pts):
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m.astype(bool)


def box(x0, y0, x1, y1):
    m = np.zeros((H, W), bool)
    m[y0:y1, x0:x1] = True
    return m


def largest(m):
    lab, n = nd.label(m)
    if n == 0:
        return m
    s = nd.sum(m, lab, range(1, n + 1))
    return lab == (1 + int(np.argmax(s)))


def warp_sheet(ten, M):
    img = np.array(Image.open(os.path.join(MANH, 'goc', ten + '.png'))).astype(np.float32)
    pm = img.copy()
    pm[..., :3] *= pm[..., 3:4] / 255
    out = cv2.warpAffine(pm, np.array(M, np.float32), (W, H), flags=cv2.INTER_CUBIC)
    a = np.clip(out[..., 3:4], 0, 255)
    rgb = np.where(a > 1, out[..., :3] / np.maximum(a, 1) * 255, 0)
    return np.clip(np.concatenate([rgb, a], -1), 0, 255)


def similarity(p_src, q_src, p_dst, q_dst):
    """Ma trận 2×3 đồng dạng đưa đoạn (p_src→q_src) trùng (p_dst→q_dst)."""
    vs = np.subtract(q_src, p_src)
    vd = np.subtract(q_dst, p_dst)
    s = np.hypot(*vd) / np.hypot(*vs)
    th = np.arctan2(vd[1], vd[0]) - np.arctan2(vs[1], vs[0])
    c, si = s * np.cos(th), s * np.sin(th)
    A = np.array([[c, -si], [si, c]])
    t = np.array(p_dst) - A @ np.array(p_src)
    return np.hstack([A, t[:, None]]), float(s), float(np.degrees(th))


CUNG = {'mat', 'chuong', 'dao', 'gang-gan', 'ao-vai', 'mu', 'ung-gan', 'gang-xa', 'ung-xa'}


def keo_doc(RGB, known, todo):
    """lấp điểm `todo` bằng điểm `known` gần nhất CÙNG CỘT (vân/nếp áo dọc giữ nguyên); cột không có → điểm gần nhất."""
    out = np.zeros_like(RGB)
    con = todo.copy()
    for x in np.nonzero(todo.any(0))[0]:
        yk = np.nonzero(known[:, x])[0]
        if len(yk) == 0:
            continue
        yt = np.nonzero(todo[:, x])[0]
        i = np.clip(np.searchsorted(yk, yt), 1, len(yk) - 1) if len(yk) > 1 else np.zeros(len(yt), int)
        if len(yk) > 1:
            lo, hi = yk[i - 1], yk[i]
            pick = np.where(np.abs(yt - lo) <= np.abs(hi - yt), lo, hi)
        else:
            pick = np.full(len(yt), yk[0])
        out[yt, x] = RGB[pick, x]
        con[yt, x] = False
    if con.any():
        _, (iy, ix) = nd.distance_transform_edt(~known, return_indices=True)
        out[con] = RGB[iy[con], ix[con]]
    return out


def color_match(src_rgb, src_sel, ref_rgb, ref_sel):
    """chỉnh trung bình/độ lệch từng kênh của ảnh bảng mảnh về đúng vải ảnh chốt."""
    out = src_rgb.copy()
    for c in range(3):
        ms, ss = src_rgb[..., c][src_sel].mean(), src_rgb[..., c][src_sel].std() + 1e-3
        mr, sr = ref_rgb[..., c][ref_sel].mean(), ref_rgb[..., c][ref_sel].std() + 1e-3
        out[..., c] = (src_rgb[..., c] - ms) * (sr / ss) + mr
    return np.clip(out, 0, 255)


def main():
    os.makedirs(KIEM, exist_ok=True)
    a = load_rgb(SRC_CHOT)
    bg = background(a)
    FG = ~bg
    chot = unmix_white(a, FG).astype(np.float32)          # RGBA, khử viền trắng
    A0 = chot[..., 3] / 255.0
    RGB = chot[..., :3]
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    L = a.mean(-1)
    dark = L < 75
    brass = (R > 140) & (R - B > 50)
    K = doc_json(os.path.join(MANH, 'goc', 'khop.json'))

    # ---------- vị trí mảnh bảng (đo cỡ) ----------
    sheet = {}
    sheet['mu'] = (np.array(K['mu']['M']), K['mu']['co'][0], K['mu']['co'][1], K['mu']['xoay'])
    # dao: khớp 2 điểm (giữa chắn tay → mũi dao)
    Md, s_dao, r_dao = similarity((101.5, 29.8), (293, 54), (738.0, 899.2), (939, 949))
    sheet['dao'] = (Md, s_dao, s_dao, r_dao)
    # găng xa: sau thân, lùi sau và thấp hơn găng gần một chút (bị che hẳn trong ảnh chốt) – cỡ như găng gần
    sheet['gang-xa'] = (cv2.getRotationMatrix2D((52, 54), 8, 0.92) + np.array([[0, 0, 575 - 52], [0, 0, 868 - 54]]),
                        0.92, 0.92, -8)
    # 2 ủng: khớp hộp phần tối nhìn thấy dưới vạt
    def ung(ten, bx, scale):
        vis = FG & box(*bx) & (L < 60) & (np.arange(H)[:, None] > bx[1])
        vis = largest(nd.binary_opening(vis, iterations=2))
        ys, xs = np.nonzero(vis)
        img = Image.open(os.path.join(MANH, 'goc', ten + '.png'))
        w, h = img.size
        # mũi ủng (phải) trùng mép phải phần tối, đế trùng mặt đất
        M = np.array([[scale, 0, xs.max() - (w - 6) * scale], [0, scale, ys.max() - (h - 5) * scale]])
        return M, vis
    Mug, vis_ug = ung('ung-gan', (668, 1146, 752, 1192), 1.0)
    Mux, vis_ux = ung('ung-xa', (522, 1138, 612, 1192), 1.25)
    sheet['ung-gan'] = (Mug, 1.0, 1.0, 0)
    sheet['ung-xa'] = (Mux, 1.25, 1.25, 0)
    W_SHEET = {k: warp_sheet(k, v[0]) for k, v in sheet.items()}

    # ---------- vùng từng mảnh (bool, toạ độ ảnh chốt) ----------
    V = {}
    soft = {}       # alpha mềm ở đường ráp (0..1), mặc định 1
    eye = FG & box(762, 425, 808, 515) & (R > 150) & (G > 95) & (B < 160)
    eye = nd.binary_dilation(largest(eye), iterations=2)
    V['mat'] = eye

    bz = box(690, 595, 848, 810)
    bell = bz & (R - B > 28) & (R > 85) & (np.arange(W)[None, :] >= 716)     # đồng (cả phần tối) + đoạn dây ngắn
    bell = nd.binary_closing(bell, iterations=3)
    bell = bell | (nd.binary_dilation(bell, iterations=4) & dark & bz & (np.arange(W)[None, :] >= 712))
    bell = nd.binary_fill_holes(nd.binary_closing(bell, iterations=2)) & FG
    # thân chuông gần lồi → lấy bao lồi phần dưới vòng treo (lấp chỗ đồng tối bị sót), giữ nguyên đoạn dây phía trên
    body_b = largest(bell) & (np.arange(H)[:, None] >= 632)
    ys, xs = np.nonzero(body_b)
    hull = cv2.convexHull(np.stack([xs, ys], 1).astype(np.int32))
    hm = np.zeros((H, W), np.uint8)
    cv2.fillPoly(hm, [hull.reshape(-1, 2)], 1)
    hb = hm.astype(bool)
    bell = (bell | (nd.binary_dilation(hb, iterations=13) & FG & (np.arange(H)[:, None] > 700) & (dark | (R - B > 20) | (np.arange(W)[None, :] > 782)))
            | hb) & FG
    bell |= box(752, 760, 802, 808) & FG & ((R - B > 15) | dark)          # quả lắc dưới miệng chuông
    V['chuong'] = nd.binary_fill_holes(bell & nd.binary_dilation(largest(bell), iterations=14))

    dz = box(712, 858, 975, 1000)
    sheet_dao = W_SHEET['dao'][..., 3] > 100
    blue = (B > R + 12) & (L > 38)                                  # vải áo xanh → không phải dao
    dao = nd.binary_dilation(sheet_dao, iterations=7) & FG & dz & ~blue
    dao = nd.binary_opening(dao, iterations=2)
    dao = nd.binary_fill_holes(nd.binary_closing(dao, iterations=3)) & FG
    dao |= box(708, 860, 772, 978) & FG & (R - B > 20) & ~poly_mask(TAY_GAN)   # chắn tay (đồng) trọn vẹn
    dao_hidden = (W_SHEET['dao'][..., 3] > 128) & poly_mask(TAY_GAN)   # chuôi dưới nắm tay (từ bảng mảnh)
    V['dao'] = largest(dao) | dao_hidden

    arm = poly_mask(TAY_GAN) & FG & ~largest(dao)

    cape_box = box(392, 590, 724, 802) & ~(box(550, 772, 724, 802))
    teal = (G >= B - 3) & (L > 42)                 # xanh xám của áo choàng (thân áo: B > G rõ)
    ropec = (R - B > 35) & (np.arange(H)[:, None] < 652)
    cape = cape_box & (teal | ropec) & ~V['chuong']
    cape = nd.binary_opening(cape, iterations=2)
    cape = largest(cape)
    cape = cape | (nd.binary_dilation(cape, iterations=3) & dark & cape_box)
    cape = nd.binary_closing(cape, iterations=4)
    cape = nd.binary_fill_holes(cape) & FG & ~V['chuong']
    cape = largest(cape)
    # phần khuất dưới mũ (để mũ trễ nhịp không hở khe): kéo áo choàng lên tới cổ
    V['ao-vai'] = cape | (nd.binary_dilation(cape, iterations=30) & FG & box(440, 560, 760, 640))
    V['gang-gan'] = arm & ~V['ao-vai']

    mu_sheet = W_SHEET['mu'][..., 3] > 128
    V['mu'] = (mu_sheet & FG) | (V['mat'])                        # mũ lót dưới mắt
    tip_out = FG & box(280, 60, 600, 480) & ~mu_sheet
    tip_out = largest(nd.binary_opening(tip_out, iterations=2))
    band = nd.binary_dilation(tip_out, iterations=34) & mu_sheet & FG & box(280, 60, 600, 420)
    V['chop'] = tip_out | band
    d_in = nd.distance_transform_edt(~tip_out)                    # khoảng cách vào trong mũ
    soft['chop'] = np.clip((34 - d_in) / 20.0, 0, 1)              # đặc tới 14 px trong mũ, mờ dần tới 34 px

    yy, xx = np.mgrid[0:H, 0:W]
    vt = FG & (xx >= VAT_TRUOC_X0 - 16) & (yy >= VAT_TRUOC_Y0 - 16) & ~V['dao'] & ~vis_ug & ~arm
    V['vat-truoc'] = vt
    dseam = np.minimum(xx - (VAT_TRUOC_X0 - 16), yy - (VAT_TRUOC_Y0 - 16)).astype(np.float32)
    soft["vat-truoc"] = np.clip(dseam / 30.0, 0, 1)

    V['ung-gan'] = (W_SHEET['ung-gan'][..., 3] > 128) | vis_ug
    V['ung-xa'] = (W_SHEET['ung-xa'][..., 3] > 128) | vis_ux

    vs_vis = FG & (yy >= VAT_SAU_Y0) & (xx < VAT_SAU_X(yy))
    vs_ext = (yy >= VAT_SAU_Y0 - 30) & (xx < VAT_SAU_X(yy) + 70) & (yy < 1150) & (xx > 330) & FG  # phần khuất dưới thân
    V['vat-sau'] = vs_vis | vs_ext
    V['gang-xa'] = W_SHEET['gang-xa'][..., 3] > 128

    # thân: bao hết phần còn lại từ cổ xuống (cổ hẹp để mũ trễ không lộ vai thân)
    than = FG & (yy >= 548) & ~vs_vis & ~vis_ux & ~vis_ug
    than &= ~((yy < 625) & ((xx < 470) | (xx > 770)))
    than &= ~(V['dao'] & (xx > 780)) & ~(V['chuong'] & (xx > 782))
    than = nd.binary_fill_holes(than)
    V['than'] = than
    # mép thân đè lên vạt sau (đường ráp y = 975, phía trái) làm mềm
    d_than = (VAT_SAU_X(yy) - xx).astype(np.float32)
    soft['than'] = np.where((yy > VAT_SAU_Y0 - 22) & (xx < VAT_SAU_X(yy) + 2) & (yy < VAT_SAU_Y0 + 20),
                            np.clip((VAT_SAU_Y0 + 20 - yy) / 22.0, 0, 1), 1.0)

    # ---------- điểm ảnh bóng chưa thuộc mảnh nào (chủ yếu nét viền ngoài mũ) → mảnh gần nhất ----------
    nhan = np.zeros((H, W), np.int32)
    for i, ten in enumerate(THU_TU):
        nhan[V[ten]] = i + 1
    con = FG & (nhan == 0)
    _, (iy, ix) = nd.distance_transform_edt(nhan == 0, return_indices=True)
    gan = nhan[iy, ix]
    for i, ten in enumerate(THU_TU):
        V[ten] = V[ten] | (con & (gan == i + 1))
    print('điểm ảnh sót gán cho mảnh gần nhất:', int(con.sum()))

    # ---------- phủ từ trên xuống: phần nhìn thấy = ảnh chốt, phần khuất = lấp ----------
    C = np.zeros((H, W), np.float32)              # độ che tích luỹ của các mảnh phía trên
    Ch = np.zeros((H, W), np.float32)             # … chỉ tính mảnh mép CỨNG (có nét mực): mép mềm vẫn để lộ ảnh chốt
    sach = (A0 > 0.95) & (L > 32) & (B >= R - 4)   # điểm vải "sạch" (xanh/xanh xám; không nét mực, không đồng/da)
    out = {}
    thong_ke = {}
    for ten in reversed(THU_TU):
        reg = V[ten]
        al = reg.astype(np.float32) * soft.get(ten, 1.0)
        al = np.where(reg, np.maximum(al, 0), 0)
        vis = reg & (C < 0.985) & (Ch < 0.5) & (A0 > 0.02)   # lộ ra ở dáng nghỉ → giữ đúng ảnh chốt
        if ten in W_SHEET and ten != 'mu':
            hid = reg & ~vis                       # hình lấy nguyên bảng mảnh: phần ngoài bóng ảnh chốt vẫn giữ
        else:
            hid = reg & ~vis & ((A0 > 0.02) | (C >= 0.985))
        rgb = np.zeros((H, W, 3), np.float32)
        alpha = np.zeros((H, W), np.float32)
        rgb[vis] = RGB[vis]
        alpha[vis] = (al * A0)[vis]
        if hid.any():
            rest = hid
            if ten in W_SHEET:                      # hình lấy nguyên từ bảng mảnh (mũ, chuôi dao, găng xa, ủng)
                S = W_SHEET[ten]
                ok = hid & (S[..., 3] > 8)
                srgb = S[..., :3]
                ref = vis & (S[..., 3] > 200) & (A0 > 0.9)
                if ten == 'mu' and ref.sum() > 200:   # chỉ mũ trùng chỗ đủ để chỉnh màu theo ảnh chốt
                    srgb = color_match(srgb, ref, RGB, ref)
                rgb[ok] = srgb[ok]
                alpha[ok] = (S[..., 3] / 255.0 * al)[ok]
                rest = hid & ~ok
            if rest.any():                          # vải: kéo dài vân THEO CỘT (nếp áo chạy dọc) từ điểm sạch gần nhất
                known = vis & sach
                if known.sum() < 50:
                    known = FG & sach & ~rest
                fill = keo_doc(RGB, known, rest)
                m = rest.astype(np.float32)
                num = np.stack([nd.gaussian_filter(fill[..., c] * m, (7, 1.5)) for c in range(3)], -1)
                den = nd.gaussian_filter(m, (7, 1.5))[..., None]
                fill = np.where(den > 1e-3, num / np.maximum(den, 1e-3), fill) * (1 - LAM_TOI_LAP)
                rgb[rest] = fill[rest]
                alpha[rest] = al[rest]
            if ten not in W_SHEET:                  # viền mực mỏng ở mép phần khuất (khi lộ ra vẫn có mép)
                edge = reg & ~nd.binary_erosion(reg, iterations=3) & hid
                rgb[edge] = rgb[edge] * 0.5 + np.array([18, 20, 26]) * 0.5
        C = C + (1 - C) * alpha
        if ten in CUNG:
            Ch = Ch + (1 - Ch) * alpha
        out[ten] = (rgb, alpha)
        thong_ke[ten] = {'px_nhin_thay': int((vis & (alpha > 0.5)).sum()), 'px_khuat_lap': int((hid & (alpha > 0.5)).sum())}

    # ---------- lưu mảnh (cắt hộp) ----------
    meta = {}
    for ten in THU_TU:
        rgb, alpha = out[ten]
        ys, xs = np.nonzero(alpha > 0.004)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        img = np.dstack([rgb, alpha * 255])[y0:y1, x0:x1]
        img[img[..., 3] < 1] = 0
        Image.fromarray(img.round().clip(0, 255).astype(np.uint8), 'RGBA').save(os.path.join(MANH, ten + '.png'))
        meta[ten] = {'ten_viet': TEN_VIET[ten], 'goc_tren_trai': [int(x0), int(y0)], 'co': [int(x1 - x0), int(y1 - y0)],
                     **thong_ke[ten]}
        if ten in sheet:
            M, sx, sy, rot = sheet[ten]
            meta[ten]['tu_bang_manh'] = {'co_so_voi_anh_chot': [round(sx, 3), round(sy, 3)], 'xoay_do': round(rot, 2),
                                         'M_bang_sang_anh_chot': np.round(M, 5).tolist()}
    meta['_thu_tu_ve'] = THU_TU
    meta['_he_toa_do'] = 'điểm ảnh của art/huong-moi/nguon/lam-moi-chuong-tan.png (1254×1254)'
    luu_json(os.path.join(MANH, 'manh.json'), meta)
    for ten in THU_TU:
        print(f"{ten:10s} {meta[ten]['co']}  thấy {thong_ke[ten]['px_nhin_thay']:6d}  lấp {thong_ke[ten]['px_khuat_lap']:6d}")


if __name__ == '__main__':
    main()
