"""THÂN NỀN "GEN SỬA" — lấy màu thân/tay/chân từ ảnh gen Cu Tí thân trần (chủ game gen bằng cách SỬA ảnh hàng chạy gốc).
Được tao-bo.py gọi (chỉ đọc ảnh gen, không sửa ảnh nguồn).

Ảnh gen: anh-gen/cu-ti-than-tran-sua-chay-12.png (2172×724, nền #00FF00, cùng cỡ & bố cục tấm gốc docs/anh-goc/zed/moi/03-chay-v4.png).
Cách làm mỗi khung i:
1. Cắt đúng khung_bao của khung i trên tấm gốc (docs/anh-goc/zed/moi/03-chay-v4-gif/bao-cao.json) → cùng cỡ ảnh nguồn khung-XX.png.
2. Tách nền xanh (cả viền xanh lẫn: điểm ngả xanh sát nền cũng bỏ; điểm còn lại khử ánh xanh), bỏ mẩu rời không chạm hình nhân vật.
3. Thu về ô 96 ĐÚNG như sprite game (tao-bo.py / dung-zed-game.py): co BOX theo tach_lop.SK, đặt ở tach_lop.DAT[i]
   (co trên ảnh nhân alpha trước để viền không ám xanh; alpha ≥ 50% mới tính là có hình).
4. Căn: dời cả khung ±3 điểm ảnh (ô 96) sao cho hình bóng gen trùng hình bóng nền tô da (= sprite game trừ dải đai bay) nhiều nhất.
5. Ghép lớp: mặt nạ (alpha) của từng lớp nền GIỮ NGUYÊN như nền tô da → hình bóng trùng game 100%, đồ phủ kín như tô da.
   Chỉ đổi MÀU ở điểm ảnh lớp body / frontLeg / rearLeg / frontArm / rearArm đang nhìn thấy (nằm trên cùng khi chỉ có nền)
   và ảnh gen có hình ở đó. Điểm gen lố ra ngoài hình bóng → cắt. Điểm hụt (gen không có hình) → giữ màu tô da / sprite gốc.
   Đầu, tóc, mặt: giữ nguyên điểm ảnh sprite gốc (mặt không đổi).
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage
import tach_lop as T
import trang_phuc as TP

O = 96
DAY = os.path.dirname(os.path.abspath(__file__))
ANH = os.path.join(DAY, 'anh-gen', 'cu-ti-than-tran-sua-chay-12.png')
BAO_CAO_KHUNG = os.path.join(T.REPO, 'docs', 'anh-goc', 'zed', 'moi', '03-chay-v4-gif', 'bao-cao.json')
LOP_GEN = ['rearLeg', 'rearArm', 'body', 'frontLeg', 'frontArm']      # lấy màu từ ảnh gen
R_DOI = 3
NG_HINH = 128       # alpha (sau co) ≥ 50% → tính là có hình (đo trùng hình bóng, lố)
NG_MAU = 48         # alpha ≥ ~20% → đủ để lấy màu (điểm viền: màu đã chia lại theo alpha nên không ám xanh / nhạt)


def co_anh():
    return os.path.exists(ANH)


def khung_bao():
    d = json.load(open(BAO_CAO_KHUNG, encoding='utf-8'))
    return [k['khung_bao'] for k in d['hang'][0]['khung']]


def tach_nen(rgb):
    """RGB → RGBA: nền #00FF00 (và viền ngả xanh sát nền) trong suốt; điểm còn lại khử ánh xanh."""
    c = rgb.astype(int); r, g, b = c[:, :, 0], c[:, :, 1], c[:, :, 2]
    mx = np.maximum(r, b)
    nen = (g > 90) & (g > mx + 45)
    ngai = (g > mx + 18) & (g > 70)                       # ngả xanh: chỉ bỏ khi sát nền (viền trộn màu nền)
    nen |= ngai & ndimage.binary_dilation(nen, iterations=2)
    out = np.dstack([c, np.where(nen, 0, 255)]).astype(np.uint8)
    out[:, :, 1] = np.where(~nen & (g > mx + 6), mx + 6, g).clip(0, 255)
    return out, ~nen


def cat_khung(G, i, box, src_a):
    x0, y0, x1, y1 = box
    a, op = tach_nen(G[y0:y1, x0:x1])
    # chỉ giữ mảng chạm hình nhân vật nguồn (bỏ mẩu khung bên cạnh lấn vào khung_bao, chấm nhiễu)
    lab, n = ndimage.label(op)
    if n:
        cham = np.unique(lab[op & ndimage.binary_dilation(src_a > 0, iterations=6)])
        giu = np.isin(lab, cham[cham > 0])
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        giu &= np.isin(lab, [j + 1 for j in range(n) if sz[j] >= 30])
        a[~giu, 3] = 0
    return a


def thu_96(i, a):
    """Co BOX theo SK, đặt DAT[i] (như sprite game), trên ảnh nhân alpha trước; alpha ≥ 128 → đặc."""
    H, W = a.shape[:2]
    nw, nh = max(1, round(W * T.SK)), max(1, round(H * T.SK))
    im = Image.fromarray(a, 'RGBA')
    r = np.array(im.convert('RGBa').resize((nw, nh), Image.BOX).convert('RGBA'))
    al = np.array(Image.fromarray(a[:, :, 3]).resize((nw, nh), Image.BOX))
    out = np.zeros((O, O, 4), np.uint8)
    dx, dy = T.DAT[i]
    ys, xs = max(0, dy), max(0, dx)
    ye, xe = min(O, dy + nh), min(O, dx + nw)
    blk = r[ys - dy:ye - dy, xs - dx:xe - dx].copy()
    blk[:, :, 3] = al[ys - dy:ye - dy, xs - dx:xe - dx]
    out[ys:ye, xs:xe] = blk
    return out          # alpha thô (0–255): ≥ NG_HINH = có hình; ≥ NG_MAU = đủ để lấy màu


def iou(a, b):
    return float((a & b).sum()) / max(1, int((a | b).sum()))


def doi(k, dx, dy):
    out = np.zeros_like(k)
    ys, yd = (slice(dy, O), slice(0, O - dy)) if dy >= 0 else (slice(0, O + dy), slice(-dy, O))
    xs, xd = (slice(dx, O), slice(0, O - dx)) if dx >= 0 else (slice(0, O + dx), slice(-dx, O))
    out[ys, xs] = k[yd, xd]
    return out


def dung(F, base_sheets, ngoai):
    """F: khung của tao-bo.py (gk, own, src). base_sheets: lớp nền → sheet 1152×96 của bản tô da (lớp nào tô da không có
    thì là sheet nền chung). ngoai[i]: dải đai bay ngoài người (không thuộc nền).
    Trả (sheets cho LOP_GEN, hàng gen đã về 96 + căn, số đo từng khung)."""
    N = len(F)
    G = np.array(Image.open(ANH).convert('RGB'))
    boxes = khung_bao()
    sheets = {l: base_sheets[l].copy() for l in LOP_GEN}
    hang = np.zeros((O, O * N, 4), np.uint8)
    so = []
    for i, f in enumerate(F):
        sl = slice(i * O, (i + 1) * O)
        a_src = f['src'][0]
        a = cat_khung(G, i, boxes[i], a_src[:, :, 3])
        if a.shape[:2] != a_src.shape[:2]:
            raise SystemExit('LỖI: khung %d cắt từ ảnh gen cỡ %s, ảnh nguồn cỡ %s' % (i, a.shape[:2], a_src.shape[:2]))
        k0 = thu_96(i, a)
        dich = (f['gk'][:, :, 3] > 0) & ~ngoai[i]                 # hình bóng nền = sprite game trừ dải đai bay
        g0 = k0[:, :, 3] >= NG_HINH
        best = None
        for dy in range(-R_DOI, R_DOI + 1):
            for dx in range(-R_DOI, R_DOI + 1):
                v = iou(doi(g0, dx, dy), dich)
                if best is None or v > best[0] + 1e-9 or (abs(v - best[0]) <= 1e-9 and abs(dx) + abs(dy) < abs(best[1]) + abs(best[2])):
                    best = (v, dx, dy)
        k = doi(k0, best[1], best[2])
        gm = k[:, :, 3] >= NG_HINH
        gmau = k[:, :, 3] >= NG_MAU
        k[:, :, 3] = np.where(gm, 255, 0)
        hang[:, sl] = k
        k0d = doi(k0, best[1], best[2])
        base = {l: base_sheets[l][:, sl] for l in TP.NEN}
        _, top = TP.ghep(base)
        dung_m = np.zeros((O, O), bool); hut = np.zeros((O, O), bool)
        for l in LOP_GEN:
            thay = top == TP.IDX[l]
            m = thay & gmau
            sheets[l][:, sl][m, :3] = k0d[m, :3]
            dung_m |= m; hut |= thay & ~gmau
        dau = np.isin(top, [TP.IDX['head'], TP.IDX['hair']])
        so.append({'khung': i, 'iouTruocCan': round(iou(g0, dich), 3), 'iouSauCan': round(best[0], 3), 'doi': [best[1], best[2]],
                   'diemLayTuGen': int(dung_m.sum()), 'diemHutLapToDa': int(hut.sum()),
                   'diemGenLoDaCat': int((gm & ~dich).sum()), 'diemGenTrungDauToc': int((gm & dau).sum()),
                   'hut': hut, 'lo': gm & ~dich})
    return sheets, hang, so
