#!/usr/bin/env python3
"""THƯƠNG / BÚA / PHI TIÊU THEO HỆ (22/10, docs/review/ke-hoach-cai-thien/vk-he-3-loai/bao-cao.md).

Ảnh chủ game gen (nền xanh lá #00FF00, commit 4a600f6c):
  moi/vk-thuong-he.png, moi/vk-bua-he.png, moi/vk-phi-tieu-he.png
  mỗi tấm 3 hàng (Lửa / Độc / Băng, trên xuống) × 3 cột (Mầm / Thành hình / Thức tỉnh, trái sang phải)
Gốc so: khung đã cắt mà dung-zed-game.py dùng dựng tấm zed-vk: moi/<thư mục>-gif/<thư mục>/khung-02..04.png
  (ô zed-vk = khung cắt sát bbox rồi co Image.BOX theo zed-vk "ti_le" = q).

Cách làm mỗi ô (như dung-kiem-vuong-he.py cho kiếm vuông, nhưng thương / búa / phi tiêu không có "đốc chắn + hàng tâm cán" để đo
nên CĂN BẰNG MẶT NẠ như gan-vk/dung_zed_vk_gan.py):
  1. bỏ nền: chỉ xanh GẦN THUẦN (g > 190, r < 95, b < 95) + viền ám xanh của nét đen → giữ được lá / giọt Độc (xanh lá nhưng r cao);
     tách 3×3 theo dải trống, giữ mọi mảnh (tàn lửa, giọt độc, mảnh băng).
  2. CĂN với khung gốc cùng cấp: tìm tỉ lệ (một tỉ lệ cho cả hai chiều, rồi chỉnh riêng rộng / cao ±4 %) + dời x, y sao cho mặt nạ
     ảnh hệ chồng khít nhất lên mặt nạ gốc (IoU = chung / hợp, tích chập FFT). Ghi IoU, % gốc được phủ, % ảnh hệ nằm ngoài gốc
     (= phần trang trí lửa / lá / băng thò ra).
  3. Đặt vào ô CÙNG CỠ ô zed-vk vk[loại][cấp] (PHẢI cùng rộng × cao, js/vien_vk.js G.vkHeAnh so cỡ ô): cùng phép co / dời đã căn ở
     bước 2 nhân q → thân vũ khí trùng chỗ thân gốc → điểm cầm, nắm tay, mũi giữ nguyên. Thu nhỏ kiểu nét (do-net/cong-cu/thu_net.thu).
     Phần trang trí tràn ra ngoài ô bị cắt (ghi %).
Ra:
  game/art/custom/zed-vk-he.sprite.json: THÊM vk.thuong / vk.bua / vk.phitieu [hệ] = [null, ô Mầm, ô Thành hình, ô Thức tỉnh] (dán dưới
    phần kiếm vuông; các ô kiếm vuông + mui_kv GIỮ NGUYÊN điểm ảnh, chỉ dời toạ độ nếu tấm rộng ra — ở đây không dời).
  docs/review/ke-hoach-cai-thien/vk-he-3-loai/vk-he-3-loai-x3.png  ảnh ghép xem: mỗi loại × cấp một hàng: gốc | Lửa | Độc | Băng, ×3
  docs/review/ke-hoach-cai-thien/vk-he-3-loai/can-<loại>.png        ảnh soát căn ở cỡ nguồn: gốc | hệ đã căn | chồng (đỏ = chỉ gốc, lam = chỉ hệ)
  docs/review/ke-hoach-cai-thien/vk-he-3-loai/so-lieu.json          số đo từng ô
Chạy (từ gốc repo):  python3 docs/anh-goc/zed/dung-vk-he-3-loai.py   rồi   cd game && python3 build.py (+ --hai-tep)."""
import base64, io, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy.signal import fftconvolve

DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/do-net/cong-cu'))
import thu_net as TN  # noqa: E402

MOI = os.path.join(DAY, 'moi')
TEP_VK = os.path.join(ROOT, 'game/art/custom/zed-vk.sprite.json')
TEP_HE = os.path.join(ROOT, 'game/art/custom/zed-vk-he.sprite.json')
RA_XEM = os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/vk-he-3-loai')
HE = ['fire', 'poison', 'ice']
TEN_HE = {'fire': 'Lua', 'poison': 'Doc', 'ice': 'Bang'}
CAP = ['Trang', 'Mam', 'Thanh hinh', 'Thuc tinh']
# loại trong game → (ảnh hệ, thư mục khung gốc của zed-vk: y như VK trong dung-zed-game.py)
LOAI = [('thuong', 'vk-thuong-he', 'vk-thuong'), ('bua', 'vk-bua-he', 'vk-bua'), ('phitieu', 'vk-phi-tieu-he', 'vk-phi-tieu')]


def bo_nen(p):
    """Bỏ nền xanh. Khác dung-kiem-vuong-he.bo_nen: hệ Độc ở 3 tấm này vẽ gân / vân / nhuỵ bằng xanh lá RẤT gần màu nền (vd (46,225,1),
    (30,210,0)) — luật cũ (g > 190, r < 95, b < 95) xoá mất → vân Độc thủng lỗ. Luật mới: nền = xanh THUẦN (g > 225, r < 45, b < 45);
    viền ám xanh (g − max(r,b) > 60, max(r,b) < 70) hoặc xanh gần thuần chỉ bị bỏ khi nằm SÁT nền (≤ 2 điểm) — vân Độc nằm trong
    thân vũ khí (xa nền) được giữ; lá / giọt Độc nhỏ ngoài thân chỉ mất 1–2 điểm mép."""
    from scipy import ndimage
    a = np.array(Image.open(p).convert('RGBA'))
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    thuan = (g > 225) & (r < 45) & (b < 45)
    vien = ((g > 190) & (r < 95) & (b < 95)) | ((g - np.maximum(r, b) > 60) & (np.maximum(r, b) < 70))
    nen = thuan | (vien & ndimage.binary_dilation(thuan, iterations=2))
    a[..., 3] = np.where(nen, 0, 255).astype(np.uint8)
    a[nen] = 0
    return a


def dai(v, khe=1):
    xs = np.nonzero(v)[0]
    out, s, p = [], xs[0], xs[0]
    for x in xs[1:]:
        if x - p > khe:
            out.append((s, p + 1)); s = x
        p = x
    out.append((s, p + 1))
    return out


def gop(ds, n):
    while len(ds) > n:  # gộp khe nhỏ nhất
        i = int(np.argmin([ds[j + 1][0] - ds[j][1] for j in range(len(ds) - 1)])); ds[i] = (ds[i][0], ds[i + 1][1]); del ds[i + 1]
    assert len(ds) == n, ds
    return ds


def tach(a, hang, cot):
    """tách lưới hàng × cột. Các tấm này KHÔNG có dải trống ngang giữa các hàng (tua đỏ / lửa của cột Thức tỉnh hàng trên thò sát hàng
    dưới) nên không cắt theo dải trống như dung-kiem-vuong-he.tach; thay vào đó: mảnh liền lớn (≥ 200 điểm) → tâm → gom thành 3 cột /
    3 hàng (cắt ở 2 khe lớn nhất của toạ độ tâm), rồi MỌI mảnh (tàn lửa, giọt, mảnh băng) gán vào ô có tâm gần nhất; mỗi ô cắt sát bbox.
    Bỏ: mảnh < 6 điểm (bụi fringe, mất khi thu nhỏ) và mảnh nhỏ (< 100) dính mép tấm (vạch nhiễu ở biên ảnh gen)."""
    from scipy import ndimage
    A = a[..., 3] > 0
    lab, n = ndimage.label(A, structure=np.ones((3, 3)))
    idx = np.arange(1, n + 1)
    kich = ndimage.sum(A, lab, idx)
    tam = np.array(ndimage.center_of_mass(A, lab, idx))  # (y, x)
    objs = ndimage.find_objects(lab)
    H_, W_ = A.shape
    giu = np.ones(n, bool)
    for i, o in enumerate(objs):
        if kich[i] < 6 or (kich[i] < 100 and (o[0].start <= 2 or o[1].start <= 2 or o[0].stop >= H_ - 2 or o[1].stop >= W_ - 2)):
            giu[i] = False

    def tam_cum(v, k):
        v = np.sort(v)
        khe = np.diff(v)
        cat = np.sort(np.argsort(khe)[-(k - 1):])
        cum = np.split(v, cat + 1)
        assert len(cum) == k
        return np.array([c.mean() for c in cum])
    lon = giu & (kich >= 200)
    cx, cy = tam_cum(tam[lon, 1], cot), tam_cum(tam[lon, 0], hang)
    o_cua = {}
    for i in range(n):
        if not giu[i]:
            continue
        r, c = int(np.argmin(np.abs(cy - tam[i, 0]))), int(np.argmin(np.abs(cx - tam[i, 1])))
        o_cua.setdefault((r, c), []).append(i + 1)
    out = []
    for r in range(hang):
        for c in range(cot):
            ids = o_cua.get((r, c), [])
            assert ids, (r, c)
            M = np.isin(lab, ids)
            m = np.where(M[..., None], a, 0).astype(np.uint8)
            ys, xs = np.nonzero(M)
            out.append(m[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    return out


def mat_na(im):
    return (np.asarray(im)[..., 3] > 100).astype(np.float32)


def co(a, w, h):
    return np.asarray(Image.fromarray(a).resize((max(1, w), max(1, h)), Image.BOX))


def iou_tot_nhat(O, G):
    """O, G: mặt nạ 0/1. Trả (iou, dy, dx): đặt G tại (dx, dy) trên lưới O."""
    inter = fftconvolve(O, G[::-1, ::-1], mode='full')
    hop = O.sum() + G.sum() - inter
    iou = inter / np.maximum(hop, 1)
    i, j = np.unravel_index(int(np.argmax(iou)), iou.shape)
    return float(iou[i, j]), i - (G.shape[0] - 1), j - (G.shape[1] - 1)


def can(goc, he):
    """Căn ảnh hệ (RGBA, cắt sát) với khung gốc (RGBA, cắt sát): tỉ lệ kx, ky + dời dx, dy (toạ độ gốc) khớp mặt nạ nhất.
    Như gan-vk/dung_zed_vk_gan.can: thô ở 1/4 (một tỉ lệ, ±15 % bước 1 %), rồi chỉnh riêng rộng / cao ±4 % (1/2 bước 0,5 %; cỡ thật bước 0,25 %)."""
    Ob = mat_na(goc)
    hg, wg = goc.shape[:2]; hh, wh = he.shape[:2]
    k0 = wg / wh if wg >= hg else hg / hh
    o4 = mat_na(co(goc, round(wg / 4), round(hg / 4)))
    tot = None
    for kk in k0 * np.arange(0.85, 1.15 + 1e-9, 0.01):
        v = iou_tot_nhat(o4, mat_na(co(he, round(wh * kk / 4), round(hh * kk / 4))))[0]
        if tot is None or v > tot['iou']:
            tot = {'kx': float(kk), 'ky': float(kk), 'iou': v}
    for nho, pv, b in ((2, 0.04, 0.005), (1, 0.005, 0.0025)):
        o = mat_na(co(goc, round(wg / nho), round(hg / nho))) if nho > 1 else Ob
        kx0, ky0, tot = tot['kx'], tot['ky'], None
        for kx in kx0 * np.arange(1 - pv, 1 + pv + 1e-9, b):
            for ky in ky0 * np.arange(1 - pv, 1 + pv + 1e-9, b):
                v = iou_tot_nhat(o, mat_na(co(he, round(wh * kx / nho), round(hh * ky / nho))))[0]
                if tot is None or v > tot['iou']:
                    tot = {'kx': float(kx), 'ky': float(ky), 'iou': v}
    g = co(he, round(wh * tot['kx']), round(hh * tot['ky']))
    v, dy, dx = iou_tot_nhat(Ob, mat_na(g))
    tot.update(iou=v, dx=int(dx), dy=int(dy))
    # ảnh hệ đã căn trên lưới gốc (để soát) + % gốc được phủ / % hệ ngoài gốc
    dat = np.zeros_like(goc)
    y0, x0 = max(0, dy), max(0, dx); sy, sx = max(0, -dy), max(0, -dx)
    hh2, ww2 = min(g.shape[0] - sy, hg - y0), min(g.shape[1] - sx, wg - x0)
    if hh2 > 0 and ww2 > 0:
        dat[y0:y0 + hh2, x0:x0 + ww2] = g[sy:sy + hh2, sx:sx + ww2]
    MO, MH = Ob > 0, mat_na(dat) > 0
    tot['phu_goc'] = float((MO & MH).sum() / max(1, MO.sum()))
    tot['ngoai_goc'] = float((MH & ~MO).sum() / max(1, MH.sum()))
    tot['anh'] = dat
    return tot


def dat_o(a, W, H, K, ox, oy):
    """Ảnh nguồn a → ô W×H với phép: điểm nguồn s ↦ ô (s·K + (ox, oy)). Thu nhỏ kiểu nét (thu_net.thu) trên cửa sổ nguồn đúng ô.
    Trả (ô RGBA, % điểm đục nguồn bị cắt vì ra ngoài ô). Như dung-kiem-vuong-he.dat_o."""
    sx0, sy0 = -ox / K, -oy / K
    sw, sh = W / K, H / K
    ix0, iy0 = int(np.floor(sx0)), int(np.floor(sy0))
    ix1, iy1 = int(np.ceil(sx0 + sw)), int(np.ceil(sy0 + sh))
    P = np.zeros((iy1 - iy0, ix1 - ix0, 4), np.uint8)
    hs, ws = a.shape[:2]
    X0, Y0, X1, Y1 = max(0, ix0), max(0, iy0), min(ws, ix1), min(hs, iy1)
    P[Y0 - iy0:Y1 - iy0, X0 - ix0:X1 - ix0] = a[Y0:Y1, X0:X1]
    o = TN.thu(P, int(round((ix1 - ix0) * K)), int(round((iy1 - iy0) * K)))
    px, py = int(round((sx0 - ix0) * K)), int(round((sy0 - iy0) * K))
    o = o[py:py + H, px:px + W]
    if o.shape[0] < H or o.shape[1] < W:
        o = np.pad(o, ((0, H - o.shape[0]), (0, W - o.shape[1]), (0, 0)))
    tong = (a[..., 3] > 0).sum() * K * K
    return o, 100.0 * max(0.0, 1 - (o[..., 3] > 0).sum() / max(1.0, tong))


def nen_ca_ro(w, h, o=6):
    a = np.zeros((h, w, 4), np.uint8); a[..., 3] = 255
    yy, xx = np.mgrid[:h, :w]
    c = ((yy // o + xx // o) % 2).astype(bool)
    a[..., :3] = np.where(c[..., None], (52, 56, 50), (40, 44, 38))
    return Image.fromarray(a, 'RGBA')


def main():
    V = json.load(open(TEP_VK, encoding='utf-8'))
    q = V['ti_le']
    tam_vk = np.array(Image.open(io.BytesIO(base64.b64decode(V['tam'].split(',', 1)[1]))).convert('RGBA'))
    Ht = json.load(open(TEP_HE, encoding='utf-8'))
    tam_he = np.array(Image.open(io.BytesIO(base64.b64decode(Ht['tam'].split(',', 1)[1]))).convert('RGBA'))
    # phần kiếm vuông giữ nguyên: cắt tấm cũ tới hết hàng cuối của kiem_vuong (chạy lại: bỏ phần 3 loại dán lần trước)
    kv = Ht['vk']['kiem_vuong']
    y_kv = max(r[1] + r[3] for h in HE for r in kv[h] if r)
    cu = tam_he[:y_kv]
    o_ra, so = [], {}
    for loai, ten_he, thu in LOAI:
        o9 = tach(bo_nen(os.path.join(MOI, ten_he + '.png')), 3, 3)
        for i, h in enumerate(HE):
            for j in range(3):
                cap = j + 1
                r = V['vk'][loai][cap]; W, H = r[2], r[3]
                goc = np.array(Image.open(os.path.join(MOI, thu + '-gif', thu, 'khung-%02d.png' % (cap + 1))).convert('RGBA'))
                bb = Image.fromarray(goc).getbbox(); goc = goc[bb[1]:bb[3], bb[0]:bb[2]]
                he = o9[i * 3 + j]
                t = can(goc, he)
                # ô game = gốc (cắt sát) × q; ảnh hệ: nguồn s ↦ gốc (s·k + d) ↦ ô ((s·k + d)·q)
                # kx ≠ ky chút ít: co trước về cùng tỉ lệ rồi thu nét (TN.thu đã làm việc co, nên đưa kx/ky vào cửa sổ: dùng ảnh he đã co
                # riêng hai chiều về đúng tỉ lệ kx/ky tương đối, giữ cỡ ~ nguồn)
                kx, ky = t['kx'], t['ky']
                k = (kx + ky) / 2
                he2 = he if abs(kx - ky) < 1e-9 else co(he, round(he.shape[1] * kx / k), round(he.shape[0] * ky / k))
                o, cat = dat_o(he2, W, H, k * q, t['dx'] * q, t['dy'] * q)
                o_goc = tam_vk[r[1]:r[1] + H, r[0]:r[0] + W]
                MO, MH = o_goc[..., 3] > 0, o[..., 3] > 0
                khop_o = float((MO & MH).sum() / max(1, MO.sum()))  # % ô gốc được ảnh hệ phủ (trong ô game)
                # lệch điểm cầm trong ô game: thương / búa = đầu cán (cột đục trái nhất + tâm dọc của cột đó); phi tiêu = tâm hình
                if loai == 'phitieu':
                    cg, ch_ = [np.array(np.nonzero(M)).mean(1)[::-1] for M in (MO, MH)]
                else:
                    cg, ch_ = [(lambda x: np.array([x, np.nonzero(M[:, x])[0].mean()]))(int(np.nonzero(M.any(0))[0][0])) for M in (MO, MH)]
                lech = (ch_ - cg).round(2).tolist()
                so['%s-%s-%d' % (loai, h, cap)] = {
                    'lech_cam_px_o': lech,
                    'cap': CAP[cap], 'he': TEN_HE[h], 'o': [W, H], 'ti_le_co': [round(kx, 4), round(ky, 4)], 'doi': [t['dx'], t['dy']],
                    'iou': round(t['iou'], 4), 'phu_goc': round(t['phu_goc'], 4), 'ngoai_goc': round(t['ngoai_goc'], 4),
                    'phu_o_game': round(khop_o, 4), 'cat_tran_o': round(cat, 2)}
                print('%-7s %-5s %-10s co ×%.3f (rộng/cao %.3f) dời (%d,%d)  IoU %.1f%%  phủ gốc %.1f%%  ngoài gốc %.1f%%  phủ ô game %.1f%%  cắt tràn ô %.1f%%  lệch cầm (%+.1f,%+.1f) px ô' % (
                    loai, TEN_HE[h], CAP[cap], k, kx / ky, t['dx'], t['dy'], t['iou'] * 100, t['phu_goc'] * 100, t['ngoai_goc'] * 100, khop_o * 100, cat, lech[0], lech[1]))
                o_ra.append((loai, h, cap, o, o_goc, goc, t['anh'], t['iou']))
    # ---- tấm: dưới phần kiếm vuông, mỗi loại × hệ một hàng, ô cùng cỡ ô zed-vk
    meta = {loai: {h: [None, None, None, None] for h in HE} for loai, _, _ in LOAI}
    vi, y, Wt = [], y_kv + 2, cu.shape[1]
    for loai, _, _ in LOAI:
        for h in HE:
            x, hmax = 0, 0
            for (l, hh, cap, o, *_r) in o_ra:
                if l != loai or hh != h:
                    continue
                vi.append((o, x, y)); meta[loai][h][cap] = [x, y, o.shape[1], o.shape[0]]; x += o.shape[1] + 2; hmax = max(hmax, o.shape[0])
            Wt = max(Wt, x - 2); y += hmax + 2
    T = np.zeros((y - 2, Wt, 4), np.uint8)
    T[:cu.shape[0], :cu.shape[1]] = cu
    for o, x, yy in vi:
        T[yy:yy + o.shape[0], x:x + o.shape[1]] = o
    # giảm màu CHỈ phần mới (kiếm vuông giữ nguyên từng điểm ảnh): bảng màu PNG tối đa 256 = trong suốt + màu kiếm vuông + màu phần mới
    n_kv = len(np.unique(cu[cu[..., 3] > 0][:, :3].view(np.dtype((np.void, 3)))))
    moi = TN.giam_mau(T[y_kv:], 255 - n_kv)
    T[y_kv:] = moi
    print('màu: kiếm vuông %d, phần mới ≤ %d' % (n_kv, 255 - n_kv))
    png = TN.png_bang_mau(T)
    Ht['tam'] = 'data:image/png;base64,' + base64.b64encode(png).decode()
    Ht['vk'] = {'kiem_vuong': kv, **meta}
    Ht['ten'] = 'Vũ khí Cu Tí theo hệ: kiếm vuông / thương / búa / phi tiêu × Lửa/Độc/Băng × Mầm/Thành hình/Thức tỉnh'
    Ht['phien_ban'] = 3
    Ht['ghi_chu'] = (Ht.get('ghi_chu', '').split(' | THƯƠNG')[0] +
                     ' | THƯƠNG / BÚA / PHI TIÊU 22/10: vk.thuong / vk.bua / vk.phitieu [hệ][cấp] = [x, y, rộng, cao] (cấp 0 null), cùng cỡ ô zed-vk '
                     'vk[loại][cấp], dán dưới phần kiếm vuông. Dựng: docs/anh-goc/zed/dung-vk-he-3-loai.py (ảnh moi/vk-thuong-he.png, vk-bua-he.png, vk-phi-tieu-he.png).')
    json.dump(Ht, open(TEP_HE, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('zed-vk-he: %d×%d (phần kiếm vuông cũ %d×%d giữ nguyên), %d byte PNG, tệp %d KB' % (T.shape[1], T.shape[0], cu.shape[1], cu.shape[0], len(png), os.path.getsize(TEP_HE) // 1024))
    # kiểm: phần kiếm vuông sau giảm màu có khác tấm cũ không
    kh = int((T[:cu.shape[0], :cu.shape[1]].astype(int) != cu.astype(int)).any(-1).sum())
    print('điểm ảnh phần kiếm vuông đổi sau giảm màu:', kh)
    os.makedirs(RA_XEM, exist_ok=True)
    json.dump(so, open(os.path.join(RA_XEM, 'so-lieu.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    anh_soat(o_ra, V)


def anh_soat(o_ra, V):
    Z = 3
    # 1) lưới ô game ×3: mỗi loại × cấp một hàng: gốc | Lửa | Độc | Băng
    hang = [(l, c) for l, _, _ in LOAI for c in (1, 2, 3)]
    cw = max(r[2] for l, _, _ in LOAI for r in V['vk'][l]) * Z + 12
    chs = [max(V['vk'][l][c][3] * Z, 40) + 10 for l, c in hang]
    L = Image.new('RGBA', (cw * 4 + 130, sum(chs) + 24), (28, 30, 26, 255))
    d = ImageDraw.Draw(L)
    for j, t in enumerate(['GOC (zed-vk)', 'LUA', 'DOC', 'BANG']):
        d.text((130 + j * cw, 4), t, fill=(230, 230, 230, 255))
    for i, (l, c) in enumerate(hang):
        yy = 24 + sum(chs[:i])
        d.text((6, yy + 4), '%s %s' % (l, CAP[c]), fill=(230, 230, 230, 255))
        ds = [r for r in o_ra if r[0] == l and r[2] == c]
        ims = [ds[0][4]] + [r[3] for r in ds]
        for j, im in enumerate(ims):
            im = Image.fromarray(im); big = im.resize((im.width * Z, im.height * Z), Image.NEAREST)
            bg = nen_ca_ro(big.width, big.height); bg.alpha_composite(big); L.alpha_composite(bg, (130 + j * cw, yy))
        for j, r in enumerate(ds):
            d.text((130 + (j + 1) * cw, yy + chs[i] - 12), 'IoU %.0f%%' % (r[7] * 100), fill=(160, 220, 160, 255))
    L.convert('RGB').save(os.path.join(RA_XEM, 'vk-he-3-loai-x3.png'), optimize=True)
    # 2) ảnh căn ở cỡ nguồn (co 1/2): gốc | hệ đã căn | chồng (đỏ = chỉ gốc, lam = chỉ hệ)
    for l, _, _ in LOAI:
        ds = [r for r in o_ra if r[0] == l]
        S = 0.5
        ws = [round(r[5].shape[1] * S) for r in ds]; hs = [round(r[5].shape[0] * S) for r in ds]
        C = Image.new('RGBA', (max(ws) * 3 + 40, sum(hs) + 20 * len(ds)), (28, 30, 26, 255))
        yy = 0
        for (_l, h, c, o, og, goc, anh, iou), w, hh in zip(ds, ws, hs):
            mo = mat_na(goc) > 0; mg = mat_na(anh) > 0
            ch_ = np.zeros(mo.shape + (4,), np.uint8); ch_[..., 3] = 255
            ch_[mo & mg] = (200, 200, 200, 255); ch_[mo & ~mg] = (230, 60, 60, 255); ch_[~mo & mg] = (70, 120, 240, 255)
            ch_[~mo & ~mg] = (28, 30, 26, 255)
            for j, im in enumerate((goc, anh, ch_)):
                C.alpha_composite(Image.fromarray(im).resize((w, hh), Image.BOX), (j * (max(ws) + 20), yy))
            ImageDraw.Draw(C).text((4, yy + hh + 4), '%s %s IoU %.1f%%' % (TEN_HE[h], CAP[c], iou * 100), fill=(255, 255, 255, 255))
            yy += hh + 20
        C.convert('RGB').save(os.path.join(RA_XEM, 'can-%s.png' % l), optimize=True)


if __name__ == '__main__':
    main()
