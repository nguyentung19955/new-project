"""Bước 1 – gạch nền: tách từng ô từ nguon/gach-nen.png → ô 32 px logic (64 px ở 2x), ghép liền, atlas + JSON.

ChatGPT vẽ mọi ô như một KHỐI RỜI có viền đen cả 4 cạnh → đặt cạnh nhau sẽ thấy vạch đen giữa các ô.
Cách xử lý (theo vai trò ô):
  • cạnh "giữ"  (mép ngoài của khối đất: mặt trên, cạnh trái của mép trái…): giữ nguyên viền đen;
  • cạnh "cắt"  (giáp ô đặc khác): cắt bỏ viền đen (lùi vào LE px nguồn) rồi THAY dải sát cạnh bằng dải của ô
    tham chiếu qua đường cắt nhỏ nhất (image quilting) → mép ô = đúng mép ô kề → liền;
  • ô thân / mặt-trên-giữa / ván-giữa… được làm LẶP liền (cắt nối đầu–cuối) để xếp dài bao nhiêu cũng được.
Làm ở độ phân giải làm việc R = 192 px/ô (≈ cỡ nguồn), cuối cùng thu về 64 px (LANCZOS, có đệm nội dung ô kề
để mép không bị nhoè trong suốt)."""
import numpy as np

from chung import (GACH, T2, T_LOGIC, doc_rgb, doi_co, lap_doc, lap_ngang, luu_json, luu_png, tach_vung,
                   thay_le, xep_atlas)

R = 192          # cỡ ô khi làm việc
P = 24           # đệm quanh ô (cho phần rêu/viền thò ra ngoài ô)
B_LAP = 56       # dải dùng làm lặp liền
B_KHOP = 48      # dải thay để khớp ô kề
LE = 13          # lùi vào khỏi viền đen khi cắt (viền nguồn dày ~9 px + bóng)
DS = 3           # R / 64
HM = (P, P + R - 1)   # hàng/cột mép ô thật trong canvas có đệm: đường cắt phải đi qua đúng điểm giữa dải ở đây
CAO_VAN_NGUON = 200   # px nguồn tương ứng 1 ô theo chiều đứng (dùng cho ván)

# hộp bao từng ô trên gach-nen.png (đo bằng tách thành phần liên thông)
H = {
    'r1c1': (25, 27, 238, 257), 'r1c2': (276, 29, 500, 257), 'r1c3': (535, 26, 754, 257), 'r1c4': (792, 50, 1005, 257),
    'r1c5': (1037, 27, 1217, 257), 'r1c6': (1333, 27, 1512, 257),
    'r2c1': (31, 287, 245, 493), 'r2c2': (275, 381, 501, 494), 'r2c3': (529, 287, 747, 494), 'r2c4': (790, 290, 992, 493),
    'r2c5': (1048, 290, 1248, 493), 'r2c6': (1296, 292, 1504, 493),
    'r3c1': (25, 525, 240, 757), 'r3c2': (271, 531, 504, 757), 'r3c3': (531, 528, 750, 757), 'r3c4': (793, 551, 1001, 753),
    'r3c5': (1046, 536, 1213, 753), 'r3c6': (1346, 536, 1506, 753),
    'r4c1': (30, 843, 239, 969), 'r4c2': (272, 846, 504, 899), 'r4c3': (534, 843, 745, 969),
    'r4c4': (770, 791, 1001, 982), 'r4c5': (1039, 792, 1264, 982), 'r4c6': (1291, 825, 1504, 989),
}

# (tên, ô nguồn, cạnh giữ viền, trục lặp, {cạnh cắt: ô tham chiếu}, kiểu khối, mô tả)
#  kiểu khối: 'vuong' (khối vuông, đo trực tiếp), 'reu' (mặt rêu: đỉnh = đáy − rộng), 'van' (ván), 'phu' (trang trí, giữ nguyên)
def bo(pre, src_than, tren3, cot1, cot2, kieu_tren='reu'):
    """Bộ ô cho 1 chất liệu. Ô tên bắt đầu '_' là ô phụ (chỉ để lấy mép viền, không xuất).
    Mọi ô hàng thân (cạnh, đáy, cột) DỰNG TỪ ô thân rồi thay đúng dải mép có viền → mép cắt của chúng = mép ô thân,
    nên ghép kiểu gì (kể cả chữ T, góc trong) cũng liền phần ruột."""
    t = pre
    return [
        (f'{t}-than', src_than, '', 'xy', {}, 'vuong', 'thân (đặc bên trong) – lặp liền 2 chiều'),
        (f'_{t}-vien-L', src_than, 'L', 'y', {}, 'vuong', ''),
        (f'_{t}-vien-R', src_than, 'R', 'y', {}, 'vuong', ''),
        (f'_{t}-vien-B', src_than, 'B', 'x', {}, 'vuong', ''),
        (f'_{t}-goc-LB', src_than, 'LB', '', {'tren': f'_{t}-vien-L', 'phai': f'_{t}-vien-B'}, 'vuong', ''),
        (f'_{t}-goc-RB', src_than, 'RB', '', {'tren': f'_{t}-vien-R', 'trai': f'_{t}-vien-B'}, 'vuong', ''),
        (f'{t}-canh-trai', f'={t}-than', 'L', 'y', {'trai': f'_{t}-vien-L'}, 'vuong', 'cạnh trái (tường) – lặp dọc'),
        (f'{t}-canh-phai', f'={t}-than', 'R', 'y', {'phai': f'_{t}-vien-R'}, 'vuong', 'cạnh phải (tường) – lặp dọc'),
        (f'{t}-day-giua', f'={t}-than', 'B', 'x', {'duoi': f'_{t}-vien-B'}, 'vuong', 'mặt dưới (trần) – lặp ngang'),
        (f'{t}-day-trai', f'={t}-day-giua', 'LB', '', {'trai': f'_{t}-goc-LB'}, 'vuong', 'góc dưới trái'),
        (f'{t}-day-phai', f'={t}-day-giua', 'RB', '', {'phai': f'_{t}-goc-RB'}, 'vuong', 'góc dưới phải'),
        (f'{t}-cot-than', f'={t}-than', 'LR', 'y', {'trai': f'_{t}-vien-L', 'phai': f'_{t}-vien-R'}, 'vuong',
         'cột rộng 1 ô – thân, lặp dọc'),
        (f'{t}-cot-day', f'={t}-cot-than', 'LRB', '', {'duoi': f'_{t}-vien-B', 'trai': f'_{t}-goc-LB', 'phai': f'_{t}-goc-RB'},
         'vuong', 'cột rộng 1 ô – đáy (cột treo)'),
        (f'{t}-tren-giua', tren3[1], 'T', 'x', {'duoi': f'{t}-than'}, kieu_tren, 'mặt trên giữa – lặp ngang'),
        (f'{t}-tren-trai', tren3[0], 'LT', '', {'phai': f'{t}-tren-giua', 'duoi': f'{t}-canh-trai'}, kieu_tren, 'góc trên trái'),
        (f'{t}-tren-phai', tren3[2], 'RT', '', {'trai': f'{t}-tren-giua', 'duoi': f'{t}-canh-phai'}, kieu_tren, 'góc trên phải'),
        (f'{t}-cot-tren', cot1, 'LRT', '', {'duoi': f'{t}-cot-than'}, kieu_tren, 'cột rộng 1 ô – đỉnh'),
        (f'{t}-cot-tren-2', cot2, 'LRT', '', {'duoi': f'{t}-cot-than'}, kieu_tren, 'cột rộng 1 ô – đỉnh (biến thể)'),
        (f'{t}-noi-giua', tren3[1], 'TB', 'x', {}, kieu_tren, 'gờ nổi cao 1 ô – giữa, lặp ngang'),
        (f'{t}-noi-trai', tren3[0], 'LTB', '', {'phai': f'{t}-noi-giua'}, kieu_tren, 'gờ nổi cao 1 ô – đầu trái'),
        (f'{t}-noi-phai', tren3[2], 'RTB', '', {'trai': f'{t}-noi-giua'}, kieu_tren, 'gờ nổi cao 1 ô – đầu phải'),
        (f'{t}-khoi', src_than, 'LRTB', '', {}, 'vuong', 'khối rời 1 ô (đủ 4 viền)'),
    ]


O = (bo('dat', 'r1c4', ('r1c1', 'r1c2', 'r1c3'), 'r1c5', 'r1c6') +
     [(f'dat-than-{i}', src, '', '', {'trai': 'dat-than', 'phai': 'dat-than', 'tren': 'dat-than', 'duoi': 'dat-than'},
       'vuong', f'thân biến thể {i} ({mt}) – 4 mép khớp dat-than, xen kẽ cho đỡ lặp')
      for i, src, mt in [(2, 'r2c6', 'ô thân thứ 2 của bảng'), (3, 'r1c4|lat', 'thân lật ngang'),
                         (4, 'r2c6|lat', 'thân 2 lật ngang'), (5, 'r1c4|xoay', 'thân xoay 180°')]] +
     bo('da', 'r3c4', ('r3c1', 'r3c2', 'r3c3'), 'r3c5', 'r3c6') +
     [(f'da-than-{i}', src, '', '', {'trai': 'da-than', 'phai': 'da-than', 'tren': 'da-than', 'duoi': 'da-than'},
       'vuong', f'thân đá biến thể {i} ({mt})') for i, src, mt in [(2, 'r3c4|lat', 'lật ngang'), (3, 'r3c4|xoay', 'xoay 180°')]] +
     [('da-day-co', 'r4c6', 'B', 'x', {'tren': 'da-than'}, 'vuong', 'đáy đá có cỏ mọc (trần đá/chân tường) – lặp ngang'),
      ('doc-len', 'r4c4', 'LT', '', {'phai': 'dat-tren-giua', 'duoi': 'dat-than'}, 'doc', 'dốc 45° đi lên sang phải (1×1 ô)'),
      ('doc-xuong', 'r4c5', 'RT', '', {'trai': 'dat-tren-giua', 'duoi': 'dat-than'}, 'doc', 'dốc 45° đi xuống sang phải (1×1 ô)'),
      ('van-giua', 'r4c2', 'TB', 'x', {}, 'van', 'ván một chiều – giữa, lặp ngang'),
      ('van-trai', 'r4c1', 'LTB', '', {'phai': 'van-giua'}, 'van', 'ván một chiều – đầu trái (có giá đỡ)'),
      ('van-phai', 'r4c3', 'RTB', '', {'trai': 'van-giua'}, 'van', 'ván một chiều – đầu phải (có giá đỡ)'),
      ('phu-goc-tuong-trai', 'r2c1', 'LRTB', '', {}, 'phu', 'trang trí: rễ dựng bên trái + rêu nửa ô (chưa khớp lưới)'),
      ('phu-ria-reu', 'r2c2', 'LRTB', '', {}, 'phu', 'trang trí: gờ rêu mỏng nửa ô'),
      ('phu-goc-tuong-phai', 'r2c3', 'LRTB', '', {}, 'phu', 'trang trí: rễ dựng bên phải + rêu nửa ô'),
      ('phu-bac-xuong', 'r2c4', 'LRTB', '', {}, 'phu', 'trang trí: bậc rễ cao trái thấp phải'),
      ('phu-bac-len', 'r2c5', 'LRTB', '', {}, 'phu', 'trang trí: bậc rễ thấp trái cao phải')])

CANH = {'L': 'trai', 'R': 'phai', 'T': 'tren', 'B': 'duoi'}
DOI = {'trai': 'phai', 'phai': 'trai', 'tren': 'duoi', 'duoi': 'tren'}


def do_khoi(rgba, kieu):
    """Tìm hộp khối (x0,y0,x1,y1) trong ảnh vùng: mép ngoài viền đen của phần đất/đá vuông."""
    al = rgba[..., 3] > 128
    rows = np.nonzero(al.sum(1) > 0.3 * al.shape[1] * 0.6)[0]
    y1 = rows.max() + 1
    if kieu == 'van':
        y0 = np.nonzero(al.any(1))[0].min()
        xs = np.nonzero(al[y0 + 20])[0]
        return xs.min(), y0, xs.max() + 1, y0 + CAO_VAN_NGUON
    yp = y1 - 30
    xs = np.nonzero(al[yp])[0]
    x0, x1 = xs.min(), xs.max() + 1
    if kieu == 'doc':
        y0 = y1 - (x1 - x0)
    elif kieu == 'reu':
        # mép trên THẢM rêu (bỏ qua chỏm lá lơ thơ): hàng đầu tiên phủ ≥ 85 % bề rộng khối
        cov = al[:, x0:x1].mean(1)
        y0 = int(np.nonzero(cov >= 0.85)[0].min())
    else:
        cx = al[:, x0 + (x1 - x0) // 4: x1 - (x1 - x0) // 4]
        y0 = np.nonzero(cx.mean(1) > 0.5)[0].min()
    return x0, y0, x1, y1


def lam_o(a, ten, src, giu, lap, kieu, ref):
    if src.startswith('='):
        # dựng từ ô đã làm: lấy canvas ô gốc, thay mép theo ref; cạnh giữ lấy luôn phần đệm (viền thò) của ô ref
        can = REF[src[1:]].copy()
        for canh in ('duoi', 'tren', 'trai', 'phai'):
            if canh not in ref:
                continue
            r = REF[ref[canh]]
            if canh == 'phai':
                can[:, :P + R] = thay_le(can[:, :P + R], r[:, :P + R], 'phai', B_KHOP, HM); can[:, P + R:] = r[:, P + R:]
            elif canh == 'trai':
                can[:, P:] = thay_le(can[:, P:], r[:, P:], 'trai', B_KHOP, HM); can[:, :P] = r[:, :P]
            elif canh == 'duoi':
                can[:P + R] = thay_le(can[:P + R], r[:P + R], 'duoi', B_KHOP, HM); can[P + R:] = r[P + R:]
            else:
                can[P:] = thay_le(can[P:], r[P:], 'tren', B_KHOP, HM); can[:P] = r[:P]
        return can, None, None
    ten_vung, _, bd = src.partition('|')
    rg, _ = tach_vung(a, H[ten_vung])
    if bd == 'lat':
        rg = rg[:, ::-1].copy()
    elif bd == 'xoay':
        rg = rg[::-1, ::-1].copy()
    x0, y0, x1, y1 = do_khoi(rg, kieu)
    if kieu == 'phu':
        # trang trí: chỉ đổi cỡ theo tỉ lệ chung (khối thân 1 ô ≈ 200 px nguồn)
        s = R / 200.0
        h, w = rg.shape[:2]
        im = doi_co(rg, max(1, round(w * s)), max(1, round(h * s)))
        return im, None, (x0, y0, x1, y1)
    cx0 = x0 if 'L' in giu else x0 + LE
    cx1 = x1 if 'R' in giu else x1 - LE
    cy0 = y0 if 'T' in giu else y0 + LE
    cy1 = y1 if 'B' in giu or kieu == 'van' else y1 - LE
    if kieu == 'van':
        cy0, cy1 = y0, y0 + CAO_VAN_NGUON
    Wt = R + (B_LAP if 'x' in lap else 0)
    Ht = R + (B_LAP if 'y' in lap else 0)
    sx, sy = Wt / (cx1 - cx0), Ht / (cy1 - cy0)
    # canvas: ô ở (P,P); phần thò ra (rêu, viền) chỉ ở các cạnh giữ
    cw, chh = Wt + 2 * P, Ht + 2 * P
    big = doi_co(rg, max(1, round(rg.shape[1] * sx)), max(1, round(rg.shape[0] * sy)))
    ox, oy = round(cx0 * sx) - P, round(cy0 * sy) - P
    can = np.zeros((chh, cw, 4), np.uint8)
    ys0, xs0 = max(0, oy), max(0, ox)
    ys1, xs1 = min(big.shape[0], oy + chh), min(big.shape[1], ox + cw)
    can[ys0 - oy:ys1 - oy, xs0 - ox:xs1 - ox] = big[ys0:ys1, xs0:xs1]
    # xoá phần ngoài ô ở các cạnh cắt
    if 'L' not in giu: can[:, :P] = 0
    if 'R' not in giu: can[:, P + Wt:] = 0
    if 'T' not in giu: can[:P] = 0
    if 'B' not in giu and kieu != 'van': can[P + Ht:] = 0
    # lặp liền
    if 'x' in lap:
        can = np.concatenate([can[:, :P], lap_ngang(can[:, P:P + Wt], B_LAP, HM), can[:, P + Wt:]], 1)
    if 'y' in lap:
        can = np.concatenate([can[:P], lap_doc(can[P:P + Ht], B_LAP, HM), can[P + Ht:]], 0)
    assert can.shape[:2] == (R + 2 * P, R + 2 * P), (ten, can.shape)
    # khớp cạnh cắt với ô tham chiếu (ngang trước, dọc sau)
    for canh in ('trai', 'phai', 'tren', 'duoi'):
        if canh not in ref:
            continue
        r = REF[ref[canh]]
        if canh == 'phai':
            can[:, :P + R] = thay_le(can[:, :P + R], r[:, :P + R], 'phai', B_KHOP, HM)
        elif canh == 'trai':
            can[:, P:] = thay_le(can[:, P:], r[:, P:], 'trai', B_KHOP, HM)
        elif canh == 'duoi':
            can[:P + R] = thay_le(can[:P + R], r[:P + R], 'duoi', B_KHOP, HM)
        else:
            can[P:] = thay_le(can[P:], r[P:], 'tren', B_KHOP, HM)
    return can, (sx, sy), (x0, y0, x1, y1)


def ke(ten, canh):
    """Ô kề hợp lệ phía `canh` (cạnh cắt) của ô `ten` – để đệm trước khi thu nhỏ."""
    for t, src, giu, lap, ref, _, _ in O:
        if t != ten:
            continue
        if (canh in ('trai', 'phai') and 'x' in lap) or (canh in ('tren', 'duoi') and 'y' in lap):
            return ten                         # tự lặp
        if src.startswith('='):
            return ke(src[1:], canh)           # ô dựng từ ô khác: mép cắt = mép ô gốc
        if canh in ref:
            return ref[canh]                   # mép đã khớp với ô tham chiếu
    return None


def thu_nho(ten, can, giu):
    """Đệm cạnh cắt bằng nội dung ô kề rồi thu 192 → 64 (cả canvas 240 → 80)."""
    c = can.copy()
    pad = {
        'phai': lambda n: c.__setitem__((slice(None), slice(P + R, None)), n[:, P:2 * P]),
        'trai': lambda n: c.__setitem__((slice(None), slice(0, P)), n[:, R:R + P]),
        'duoi': lambda n: c.__setitem__((slice(P + R, None), slice(None)), n[P:2 * P, :]),
        'tren': lambda n: c.__setitem__((slice(0, P), slice(None)), n[R:R + P, :]),
    }
    for k, canh in CANH.items():
        if k in giu:
            continue
        n = ke(ten, canh)
        if n is None:
            n = ten
        pad[canh](REF[n])
    o = doi_co(c, (R + 2 * P) // DS, (R + 2 * P) // DS)
    p = P // DS
    if 'L' not in giu: o[:, :p] = 0
    if 'R' not in giu: o[:, p + T2:] = 0
    if 'T' not in giu: o[:p] = 0
    if 'B' not in giu: o[p + T2:] = 0
    # mép cắt: điểm gần đặc ở 2 px sát mép → đặc hẳn (góc 4 ô gặp nhau không bị lỗ mờ)
    a = o[..., 3]
    m = np.zeros(a.shape, bool)
    if 'L' not in giu: m[:, p:p + 2] = True
    if 'R' not in giu: m[:, p + T2 - 2:p + T2] = True
    if 'T' not in giu: m[p:p + 2] = True
    if 'B' not in giu: m[p + T2 - 2:p + T2] = True
    a[m & (a >= 150)] = 255
    return o


def chay():
    a = doc_rgb('gach-nen.png')
    global REF
    REF = {}
    ghi = {}
    for ten, src, giu, lap, ref, kieu, mota in O:
        can, s, khoi = lam_o(a, ten, src, giu, lap, kieu, ref)
        REF[ten] = can
        ghi[ten] = (src, giu, lap, ref, kieu, mota, s, khoi)
    items = []
    meta = {}
    for ten, (src, giu, lap, ref, kieu, mota, s, khoi) in ghi.items():
        if ten.startswith('_'):
            continue
        if kieu == 'phu':
            o = REF[ten]
            o = doi_co(o, max(1, round(o.shape[1] / DS)), max(1, round(o.shape[0] / DS)))
            ox = oy = 0
        else:
            o = thu_nho(ten, REF[ten], giu)
            ox = oy = -P // DS     # góc trái-trên ảnh so với góc ô
        al = o[..., 3] > 0
        ys, xs = np.nonzero(al)
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        o = o[y0:y1, x0:x1]
        luu_png(o, f'{GACH}/o/{ten}.png')
        items.append((ten, o))
        meta[ten] = {'mo_ta': mota, 've_lech': [int(ox + x0), int(oy + y0)], 'nguon': src if not src.startswith('=') else 'dựng từ ô ' + src[1:],
                     'vien_giu': giu, 'lap': lap,
                     'khop': ref, 'he_so_nguon_sang_2x': ([round(s[0] / DS, 4), round(s[1] / DS, 4)] if s else None) if kieu != 'phu' else round(R / 200 / DS, 4)}
    at, pos = xep_atlas(items, rong=1024)
    luu_png(at, f'{GACH}/gach-atlas.png')
    for k, v in pos.items():
        meta[k]['khung'] = v
    luu_json({
        'ten': 'Gạch nền thế giới mới (rễ cây / rêu / đá / ván) – phong cách viền đen dày',
        'anh': 'gach-atlas.png',
        'quy_uoc': {
            'o_logic': T_LOGIC, 'boi_so': 2, 'o_anh': T2,
            'khung': '[x, y, rộng, cao] trong atlas (px ảnh 2x)',
            've_lech': '[dx, dy] px ảnh 2x: góc trái-trên khung so với góc trái-trên ô. Vẽ ở logic: '
                       'drawImage(atlas, x,y,w,h, tx*32 + dx/2, ty*32 + dy/2, w/2, h/2). dx/dy âm = phần rêu/viền thò ra ngoài ô.',
            'vien_giu': 'cạnh còn viền đen: L trái, R phải, T trên, B dưới. Cạnh không có chữ đã cắt viền và khớp liền với ô kề.',
            'khop': 'cạnh cắt → tên ô mà mép này khớp liền (đặt ô đó bên cạnh phía này là liền). Ô có "lap" x/y tự lặp liền.',
            'thu_tu_ve': 'vẽ theo hàng từ trên xuống: rêu của ô dưới thò lên đè chân ô trên là đúng ý (giống mép cỏ).',
            'phu': 'ô tên phu-* là trang trí, KHÔNG khớp lưới – đặt tự do.',
        },
        'o': meta,
    }, f'{GACH}/gach-atlas.json')
    print('gạch:', len(meta), 'ô · atlas', at.shape[1], '×', at.shape[0])
    return meta


if __name__ == '__main__':
    chay()
