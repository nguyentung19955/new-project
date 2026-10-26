"""Attachment duỗi/gập v5:  python3 attachment.py
→ ../manh/attachment/<chi>-<goc>.png  + khoá "attachment" trong ../lam-v5.json

Ý tưởng (theo review-v4/YEU-CAU-V5.md mục 4–5):
- Ở v4 mỗi đoạn tay/chân là một mảnh cứng có viền đen riêng + nắp tròn ở khớp → khi gập, nắp tròn nhô ra và
  viền của mảnh con kẻ ngang qua ống tay áo → tay chân "đọc thành mảnh ghép".
- v5: với mỗi chi (tay gần/xa, chân gần/xa) dựng sẵn một số MẢNH THAY THẾ theo góc gập (0°, 15°, 30°, … ).
  Mỗi attachment = tay trên + cẳng tay (hoặc đùi + cẳng chân) GỘP thành MỘT hình, MỘT đường viền ngoài liên tục.
  Găng và ủng vẫn là mảnh riêng có viền riêng (giữ ranh giới vật liệu vải ↔ da).
- Dựng hoàn toàn bằng code từ chính PNG mảnh v4 + palette v4: KHÔNG gen AI, KHÔNG vẽ lại thiết kế.

Cách dựng một attachment (hàm dung_mot):
 1) Đặt mảnh cha (tay trên/đùi) ở toạ độ ảnh của chính nó; đặt mảnh con (cẳng) sao cho P con trùng D cha,
    xoay đúng góc gập (giống hệt FK của rig → găng/ủng gắn vào vẫn đúng chỗ).
 2) Bỏ vùng nắp tròn: cắt mảnh cha trong đoạn CAT_CHA px cuối, cắt mảnh con trong đoạn CAT_CON px đầu.
    Thay bằng ống thuôn đo từ chính bề rộng mảnh (đo hai bên xương riêng) + đĩa khớp bán kính = bề rộng ống
    (không lớn hơn ống → không nhô).
 3) Hợp hai hình, làm mềm (đóng hình thái học + làm mịn) → một đường bao ngoài liền.
 4) Tô màu lại theo MỘT quy tắc cho cả chi: dải tối (xanh_bong) ở PHÍA NGOÀI khớp, phần còn lại xanh;
    phía xa tối 18 % như v4 (tay xa giữ toàn bộ tông tối như v4).
 5) Kẻ viền ngoài 8 px (giống v4) trên hình hợp; thêm MỘT nếp gấp ngắn ở phía trong khớp khi gập ≥ 30°.

Quy ước góc như lam-v5.json: tay gập về phía trước → góc cục bộ cẳng tay = −gập; chân gập gối ra sau →
góc cục bộ cẳng chân = +gập.
"""
import os, json, math
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
MANH = os.path.join(ROOT, 'manh')
OUTD = os.path.join(MANH, 'attachment')
JSON = os.path.join(ROOT, 'lam-v5.json')

PAL = {'ink': (12, 10, 14), 'xanh': (25, 67, 157), 'xanh_bong': (16, 41, 100)}
FAR = 0.82
T_LINE = 8            # viền ngoài, px thế giới (như v4)
CAT_CHA = 26          # px cuối mảnh cha bị thay (nắp tròn bán kính 25–27.5 ở v4)
CAT_CON = 26          # px đầu mảnh con bị thay (nắp ẩn của con)
DONG_R = 8            # bán kính đóng hình thái học (lấp khía nhọn phía trong khớp)
MIN_SIGMA = 1.6       # làm mịn đường bao
NGUONG_TOI = 3.5      # px: điểm có khoảng cách phía-ngoài tới xương > ngưỡng → tông tối
NEP_TU = 30           # độ: từ góc gập này mới kẻ nếp gấp
NEP_DAI = (6.0, 14.0)  # px: độ dài nếp gấp (kẹp)
NEP_RONG = 4.0        # px: bề rộng nếp ở mép, thuôn về 1.5

CHI = {   # chi: (cha, con, dấu góc cục bộ của con theo gập, góc gập có sẵn)
    'tay-gan': ('tay-tren-gan', 'cang-tay-gan', -1, list(range(15, 136, 15))),
    'tay-xa': ('tay-tren-xa', 'cang-tay-xa', -1, list(range(15, 136, 15))),
    'chan-gan': ('dui-gan', 'cang-chan-gan', +1, list(range(0, 136, 15))),
    'chan-xa': ('dui-xa', 'cang-chan-xa', +1, list(range(0, 136, 15))),
}


def T_(x, y): return np.array([[1, 0, x], [0, 1, y], [0, 0, 1.]])


def R_(a):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.]])


def edt_in(mask):
    return ndimage.distance_transform_edt(np.pad(mask, 2))[2:-2, 2:-2]


def disk(r):
    k = int(math.ceil(r)); yy, xx = np.mgrid[-k:k + 1, -k:k + 1]
    return xx * xx + yy * yy <= r * r + 0.25


def warp(img, M, size):
    Mi = np.linalg.inv(M)
    return img.transform(size, Image.AFFINE, tuple(Mi[:2].flatten()), Image.BICUBIC)


def ban_rong(alpha, P, d, t):
    """Bề rộng mask (alpha>127) đo vuông góc xương tại khoảng t từ P: (phía +n, phía −n), n = d xoay 90° thuận."""
    n = np.array([-d[1], d[0]]); c = np.asarray(P, float) + t * d; out = []
    H, W = alpha.shape
    for sg in (1, -1):
        r = 0.0
        while r < 80:
            q = c + sg * r * n; x, y = int(round(q[0])), int(round(q[1]))
            if not (0 <= y < H and 0 <= x < W) or alpha[y, x] <= 127:
                break
            r += 0.5
        out.append(r)
    return out


def dung_mot(meta, chi, gap):
    """Trả (ảnh RGBA, offset (ox,oy) của toạ độ ảnh cha trong ảnh attachment, D con trong attachment, số đo)."""
    cha, con, sg, _ = CHI[chi]
    far = chi.endswith('xa')
    mc, mn = meta['manh'][cha], meta['manh'][con]
    A = Image.open(os.path.join(MANH, mc['anh'])).convert('RGBA')
    B = Image.open(os.path.join(MANH, mn['anh'])).convert('RGBA')
    Pc, Dc = np.array(mc['P']), np.array(mc['D']); Pn, Dn = np.array(mn['P']), np.array(mn['D'])
    local = sg * gap
    rot = mc['huong_anh'] + local - mn['huong_anh']
    Mn = T_(*Dc) @ R_(rot) @ T_(-Pn[0], -Pn[1])          # con → toạ độ ảnh cha (y hệt FK rig)
    # khung chứa
    pts = [(0, 0), (A.width, 0), (0, A.height), (A.width, A.height)]
    pts += [tuple((Mn @ np.array([x, y, 1.]))[:2]) for x, y in ((0, 0), (B.width, 0), (0, B.height), (B.width, B.height))]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    pad = 12
    ox, oy = int(math.ceil(-min(xs))) + pad, int(math.ceil(-min(ys))) + pad
    W, H = int(math.ceil(max(xs))) + ox + pad, int(math.ceil(max(ys))) + oy + pad
    O = T_(ox, oy)
    a_al = np.array(warp(A, O, (W, H)))[..., 3]
    b_al = np.array(warp(B, O @ Mn, (W, H)))[..., 3]
    # xương trong toạ độ attachment
    P1 = Pc + (ox, oy); E = Dc + (ox, oy)
    D2 = (Mn @ np.array([Dn[0], Dn[1], 1.]))[:2] + (ox, oy)
    L1 = float(np.hypot(*(E - P1))); L2 = float(np.hypot(*(D2 - E)))
    d1 = (E - P1) / L1; d2 = (D2 - E) / L2
    n1 = np.array([-d1[1], d1[0]]); n2 = np.array([-d2[1], d2[0]])
    yy, xx = np.mgrid[:H, :W].astype(float)
    t1 = (xx - P1[0]) * d1[0] + (yy - P1[1]) * d1[1]; s1 = (xx - P1[0]) * n1[0] + (yy - P1[1]) * n1[1]
    t2 = (xx - E[0]) * d2[0] + (yy - E[1]) * d2[1]; s2 = (xx - E[0]) * n2[0] + (yy - E[1]) * n2[1]
    # bề rộng ống đo ngay ngoài vùng cắt (trên mảnh gốc, hai bên riêng)
    wa = ban_rong(a_al, P1, d1, L1 - CAT_CHA - 1)           # (+n1, −n1)
    wb = ban_rong(b_al, E, d2, CAT_CON + 1)                 # (+n2, −n2)
    wj = [(wa[0] + wb[0]) / 2.0, (wa[1] + wb[1]) / 2.0]
    rj = (wj[0] + wj[1]) / 2.0
    # 1) mảnh gốc đã cắt nắp
    keepA = (a_al > 127) & (t1 < L1 - CAT_CHA)
    keepB = (b_al > 127) & (t2 > CAT_CON)
    # 2) ống thuôn trong vùng cắt + đĩa khớp
    f1 = np.clip((t1 - (L1 - CAT_CHA)) / CAT_CHA, 0, 1)
    tubeA = (t1 >= L1 - CAT_CHA - 1.5) & (t1 <= L1) & (s1 <= wa[0] + (wj[0] - wa[0]) * f1) & (-s1 <= wa[1] + (wj[1] - wa[1]) * f1)
    f2 = np.clip(t2 / CAT_CON, 0, 1)
    tubeB = (t2 >= 0) & (t2 <= CAT_CON + 1.5) & (s2 <= wj[0] + (wb[0] - wj[0]) * f2) & (-s2 <= wj[1] + (wb[1] - wj[1]) * f2)
    # tâm đĩa khớp: lệch theo bất đối xứng bề rộng để mép đĩa trùng mép ống hai bên
    cj = E + n1 * (wj[0] - wj[1]) / 2.0
    dj = (xx - cj[0]) ** 2 + (yy - cj[1]) ** 2 <= rj * rj
    m = keepA | keepB | tubeA | tubeB | dj
    # 3) làm mềm: đóng (lấp khía trong) rồi làm mịn biên
    m = ndimage.binary_closing(np.pad(m, DONG_R + 2), structure=disk(DONG_R))[DONG_R + 2:-(DONG_R + 2), DONG_R + 2:-(DONG_R + 2)]
    m = ndimage.gaussian_filter(m.astype(float), MIN_SIGMA) > 0.5
    m = ndimage.binary_fill_holes(m)
    # 4) tô màu theo một quy tắc: phía NGOÀI khớp tối
    #    hướng phía trong khớp u_in = chuẩn hoá(d2 − d1); khi gần thẳng dùng dấu theo chiều gập
    out_sign = 1.0 if sg < 0 else -1.0                      # tay: ngoài = +n ; chân: ngoài = −n
    so1 = out_sign * s1; so2 = out_sign * s2
    # mỗi điểm thuộc đoạn gần nhất (khoảng cách tới đoạn thẳng)
    # dải tối của đoạn cha (tới hết khớp) HỢP dải tối của đoạn con (từ khớp) → góc ngoài khớp tối liền,
    # mép dải hai đoạn gặp nhau thành một đường gãy góc theo khớp (không có vệt chéo)
    dark = ((so1 > NGUONG_TOI) & (t1 <= L1 + rj)) | ((so2 > NGUONG_TOI) & (t2 >= -rj))
    if chi == 'tay-xa':           # v4: tay xa toàn tông tối
        dark[:] = True
    col_l = np.array(PAL['xanh'], float); col_d = np.array(PAL['xanh_bong'], float)
    if far:
        col_l = col_l * FAR; col_d = col_d * FAR
    rgb = np.zeros((H, W, 3), float)
    rgb[:] = col_l; rgb[dark] = col_d
    line = m & (edt_in(m) <= T_LINE)
    # 5) nếp gấp phía trong
    nep = None
    if gap >= NEP_TU:
        u = d2 - d1; u = u / (np.hypot(*u) + 1e-9)
        r = 0.0
        while r < 80:
            q = E + r * u; x, y = int(round(q[0])), int(round(q[1]))
            if not (0 <= y < H and 0 <= x < W) or not m[y, x]:
                break
            r += 0.5
        Q = E + r * u                                    # mép trong của khớp
        Ln = float(np.clip(0.45 * r, *NEP_DAI)) + T_LINE   # tính cả phần nằm trong viền
        # nếp đi từ mép vào trong, hơi lệch về phía cẳng (nếp vải dồn về phía con)
        v = -(u * 0.85 + d2 * 0.15 * (1 if True else 0)); v = v / np.hypot(*v)
        tq = (xx - Q[0]) * v[0] + (yy - Q[1]) * v[1]
        sq = np.abs((xx - Q[0]) * (-v[1]) + (yy - Q[1]) * v[0])
        wdt = NEP_RONG / 2.0 - (NEP_RONG / 2.0 - 0.75) * np.clip(tq / Ln, 0, 1)
        stroke = (tq >= -1) & (tq <= Ln) & (sq <= wdt) & m
        line = line | stroke
        nep = dict(mep_trong=[round(float(Q[0] - ox), 2), round(float(Q[1] - oy), 2)],
                   dai_px=round(Ln - T_LINE, 2), sau_khop_px=round(float(r), 2))
    rgb[line] = PAL['ink']
    o = np.zeros((H, W, 4), np.uint8)
    o[..., :3] = np.round(rgb).astype(np.uint8)
    o[..., 3] = np.where(m, 255, 0)
    o[~m, :3] = 0
    so_do = dict(rong_ong_cha=[round(x, 2) for x in wa], rong_ong_con=[round(x, 2) for x in wb],
                 ban_kinh_khop=round(rj, 2), nep=nep)
    return Image.fromarray(o), (ox, oy), so_do


def main():
    meta = json.load(open(JSON, encoding='utf-8'))
    os.makedirs(OUTD, exist_ok=True)
    blk = dict(
        ghi_chu='Mảnh thay thế theo góc gập (v5). Khi pose dùng chi X với góc gập g: chọn attachment có goc_gap gần g nhất '
                '(pose v5 đặt đúng bội 15°), VẼ attachment thay cho mảnh cha, KHÔNG vẽ mảnh con (cẳng); găng/ủng/dao vẫn vẽ '
                'như cũ (ma trận tính bằng FK với góc cục bộ cẳng = dau_goc_con × goc_gap). Ma trận attachment = M_cha · T(−ox, −oy).',
        quy_tac_mau='dải tối ở phía NGOÀI khớp (khoảng cách phía-ngoài tới xương > %.1f px), viền ngoài %d px, '
                    'nếp gấp trong khi gập ≥ %d°' % (NGUONG_TOI, T_LINE, NEP_TU),
        chi={})
    for chi, (cha, con, sg, gaps) in CHI.items():
        items = []
        for g in gaps:
            im, (ox, oy), sd = dung_mot(meta, chi, g)
            f = '%s-%03d.png' % (chi, g)
            im.save(os.path.join(OUTD, f))
            items.append(dict(goc_gap=g, anh='attachment/' + f, kich_thuoc=[im.width, im.height], offset=[ox, oy], so_do=sd))
        blk['chi'][chi] = dict(cha=cha, an_manh=[con], dau_goc_con=sg, ds=items)
        print(chi, len(items))
    meta['attachment'] = blk
    json.dump(meta, open(JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
