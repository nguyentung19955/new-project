#!/usr/bin/env python3
"""KIẾM VUÔNG THEO HỆ + "GÂN" (17/10 tối, docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/bao-cao.md).

Ảnh chủ game gen (nền #00FF00):
  moi/vk-kiem-vuong-he.png   3 hàng (Lửa / Độc / Băng) × 3 cột (Mầm, Thành hình, Thức tỉnh) kiếm vuông theo hệ
  moi/vk-kiem-vuong-gan.png  1 hàng 3 kiếm "gân" (Trắng, Mầm, Thành hình)
Gốc so: moi/vk-kiem-vuong-gif/vk-kiem-vuong/khung-01..04.png (khung dùng dựng mục "kiem_vuong" của zed-vk, dung-kiem-vuong.py).

Cách làm mỗi kiếm:
  1. bỏ nền: chỉ xanh GẦN THUẦN (g > 190, r < 95, b < 95) + viền ám xanh của nét đen (g − max(r, b) > 60 và max(r, b) < 70) → giữ được
     màu Độc #72C943 / #C8F169 (cat-diem-anh.py bỏ mất các màu này); tách 3×3 / 1×3 theo dải trống, giữ mọi mảnh (tàn lửa, giọt, mảnh băng).
  2. ĐO như dung-kiem-vuong.do_nguon: hàng tâm cán (phần quấn đỏ), cột đốc chắn; mũi = điểm đục xa nhất trên hàng tâm cán (lửa / băng
     bay quanh mũi không tính). Tỉ lệ k: lưỡi (đốc → mũi) dài ĐÚNG bằng lưỡi kiếm vuông gốc cùng cấp trong ô game.
  3. Đặt vào ô CÙNG CỠ ô kiếm vuông cấp đó (zed-vk "kiem_vuong".vk): đốc chắn và tâm cán trùng chỗ của kiếm gốc → điểm cầm, nắm tay,
     chặn đất, mũi vệt giữ nguyên. Thu nhỏ kiểu nét (do-net/cong-cu/thu_net.thu). Phần lửa / băng tràn ra ngoài ô bị cắt (in %).
     Ảnh gân: cùng cách (đốc + tâm cán + độ dài lưỡi khớp kiếm gốc); in % điểm ảnh khác dáng gốc.
Ra:
  game/art/custom/zed-vk-he.sprite.json  (MỚI, tải sau)  vk.kiem_vuong[hệ] = [null, ô Mầm, ô Thành hình, ô Thức tỉnh]
  game/art/custom/zed-vk-gan.sprite.json (thêm)          vk.kiem_vuong = [ô Trắng, ô Mầm, ô Thành hình, null]  (ảnh dán dưới tấm cũ,
                                                          các ô cũ không đổi)
  docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi/kiem-vuong-he-x4.png (ảnh soát: gốc | Lửa | Độc | Băng | gân, ×4)
Chạy (từ gốc repo):  python3 docs/anh-goc/zed/dung-kiem-vuong-he.py   rồi   cd game && python3 build.py (+ --hai-tep)."""
import base64, io, json, os, sys
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/do-net/cong-cu'))
sys.path.insert(0, DAY)
import thu_net as TN  # noqa: E402
import importlib.util  # noqa: E402
_s = importlib.util.spec_from_file_location('dkv', os.path.join(DAY, 'dung-kiem-vuong.py'))
DKV = importlib.util.module_from_spec(_s); _s.loader.exec_module(DKV)

ANH_HE = os.path.join(DAY, 'moi', 'vk-kiem-vuong-he.png')
ANH_GAN = os.path.join(DAY, 'moi', 'vk-kiem-vuong-gan.png')
GOC = os.path.join(DAY, 'moi', 'vk-kiem-vuong-gif', 'vk-kiem-vuong')
TEP_VK = os.path.join(ROOT, 'game/art/custom/zed-vk.sprite.json')
TEP_HE = os.path.join(ROOT, 'game/art/custom/zed-vk-he.sprite.json')
TEP_GAN = os.path.join(ROOT, 'game/art/custom/zed-vk-gan.sprite.json')
RA_XEM = os.path.join(ROOT, 'docs/review/ke-hoach-cai-thien/gan-anh-17-10-toi')
HE = ['fire', 'poison', 'ice']


def bo_nen(p):
    a = np.array(Image.open(p).convert('RGBA'))
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    nen = ((g > 190) & (r < 95) & (b < 95)) | ((g - np.maximum(r, b) > 60) & (np.maximum(r, b) < 70))
    a[..., 3] = np.where(nen, 0, 255).astype(np.uint8)
    a[nen] = 0
    return a


def dai(v, khe=6):
    """các đoạn liền của mảng bool (gộp khe nhỏ hơn khe)"""
    xs = np.nonzero(v)[0]
    out, s, p = [], xs[0], xs[0]
    for x in xs[1:]:
        if x - p > khe:
            out.append((s, p + 1)); s = x
        p = x
    out.append((s, p + 1))
    return out


def tach(a, hang, cot):
    A = a[..., 3] > 0
    hs = dai(A.any(1), 1)
    while len(hs) > hang:  # gộp khe nhỏ nhất
        i = int(np.argmin([hs[j + 1][0] - hs[j][1] for j in range(len(hs) - 1)])); hs[i] = (hs[i][0], hs[i + 1][1]); del hs[i + 1]
    assert len(hs) == hang, hs
    out = []
    for y0, y1 in hs:
        cs = dai(A[y0:y1].any(0), 1)
        while len(cs) > cot:
            i = int(np.argmin([cs[j + 1][0] - cs[j][1] for j in range(len(cs) - 1)])); cs[i] = (cs[i][0], cs[i + 1][1]); del cs[i + 1]
        assert len(cs) == cot, cs
        for x0, x1 in cs:
            m = a[y0:y1, x0:x1]
            bb = Image.fromarray(m).getbbox()
            out.append(m[bb[1]:bb[3], bb[0]:bb[2]])
    return out


def do(a):
    """(hàng tâm cán, cột đốc chắn, cột mũi trên hàng tâm cán)"""
    cy, xg, _t = DKV.do_nguon(a)
    A = a[..., 3] > 0
    row = A[max(0, cy - 1):cy + 2].any(0)
    xm = int(np.nonzero(row)[0].max()) + 1
    return cy, xg, xm


def dat_o(a, W, H, xg_o, cy_o, luoi_o):
    """Ảnh nguồn a → ô W×H: đốc chắn ở cột xg_o, tâm cán ở hàng cy_o, lưỡi dài luoi_o (điểm ảnh ô). Trả (ô RGBA, % điểm đục bị cắt)."""
    cy, xg, xm = do(a)
    k = luoi_o / (xm - xg)
    sx0, sy0 = xg - xg_o / k, cy - cy_o / k
    sw, sh = W / k, H / k
    ix0, iy0 = int(np.floor(sx0)), int(np.floor(sy0))
    ix1, iy1 = int(np.ceil(sx0 + sw)), int(np.ceil(sy0 + sh))
    P = np.zeros((iy1 - iy0, ix1 - ix0, 4), np.uint8)
    hs, ws = a.shape[:2]
    X0, Y0, X1, Y1 = max(0, ix0), max(0, iy0), min(ws, ix1), min(hs, iy1)
    P[Y0 - iy0:Y1 - iy0, X0 - ix0:X1 - ix0] = a[Y0:Y1, X0:X1]
    # bù phần lẻ (≤ 1 điểm nguồn) bằng cách co đúng khung sx0..sx0+sw: thêm cột / hàng ở đầu để tâm khớp
    o = TN.thu(P, int(round((ix1 - ix0) * k)), int(round((iy1 - iy0) * k)))
    ox, oy = int(round((sx0 - ix0) * k)), int(round((sy0 - iy0) * k))
    o = o[oy:oy + H, ox:ox + W]
    if o.shape[0] < H or o.shape[1] < W:
        o = np.pad(o, ((0, H - o.shape[0]), (0, W - o.shape[1]), (0, 0)))
    tong = (a[..., 3] > 0).sum() * k * k
    return o, 100.0 * max(0.0, 1 - (o[..., 3] > 0).sum() / max(1.0, tong)), round(k, 5)


def main():
    V = json.load(open(TEP_VK, encoding='utf-8'))
    K = V['kiem_vuong']
    kv = np.array(Image.open(io.BytesIO(base64.b64decode(K['tam'].split(',', 1)[1]))).convert('RGBA'))
    o_goc = [kv[r[1]:r[1] + r[3], r[0]:r[0] + r[2]] for r in K['vk']]
    # chỗ đốc / tâm cán / mũi của kiếm GỐC trong ô (đo trên khung nguồn, nhân tỉ lệ đã dùng)
    neo = []
    for c in range(4):
        b = np.array(Image.open(os.path.join(GOC, 'khung-%02d.png' % (c + 1))).convert('RGBA'))
        bb = Image.fromarray(b).getbbox(); b = b[bb[1]:bb[3], bb[0]:bb[2]]
        cy, xg, xm = do(b)
        k = K['ti_le'][c]
        neo.append((xg * k, (cy + 0.5) * k - 0.5, (xm - xg) * k))
    he = tach(bo_nen(ANH_HE), 3, 3)
    gan = tach(bo_nen(ANH_GAN), 1, 3)
    bang = []
    # ---- theo hệ: hàng Lửa / Độc / Băng, cột Mầm / Thành hình / Thức tỉnh = cấp 1..3
    o_he = {}
    for i, h in enumerate(HE):
        for j in range(3):
            c = j + 1
            W, H = K['vk'][c][2], K['vk'][c][3]
            o, mat, k = dat_o(he[i * 3 + j], W, H, *neo[c])
            o_he[(h, c)] = o
            bang.append(('he', h, c, W, H, mat, k))
    # ---- gân: Trắng / Mầm / Thành hình = cấp 0..2; độ trong = ô gốc
    o_gan = {}
    for j in range(3):
        W, H = K['vk'][j][2], K['vk'][j][3]
        o, mat, k = dat_o(gan[j], W, H, *neo[j])
        o_gan[j] = o  # độ trong của chính ảnh gân (ghép độ trong ô gốc làm lộ hai lớp mép ở Thành hình — ảnh gân vẽ lệch dáng gốc vài %)
        A = o_goc[j][..., 3] > 0
        bang.append(('gan', '-', j, W, H, 100.0 * (A ^ (o[..., 3] > 0)).sum() / A.sum(), k))
    # ---- zed-vk-he (mới)
    Wt = sum(K['vk'][c][2] + 2 for c in (1, 2, 3)) - 2
    Ht = sum(max(K['vk'][c][3] for c in (1, 2, 3)) + 2 for _ in HE) - 2
    T = np.zeros((Ht, Wt, 4), np.uint8)
    meta = {h: [None, None, None, None] for h in HE}
    y = 0
    for h in HE:
        x = 0
        for c in (1, 2, 3):
            o = o_he[(h, c)]
            T[y:y + o.shape[0], x:x + o.shape[1]] = o
            meta[h][c] = [x, y, o.shape[1], o.shape[0]]
            x += o.shape[1] + 2
        y += max(K['vk'][c][3] for c in (1, 2, 3)) + 2
    # "mui" từng (hệ, cấp): [y trên, y dưới) của MỌI điểm đục ở 60 % lưỡi phía mũi (lửa / dây / mảnh băng thò ra quanh mũi) — game chặn
    # đất theo khung này (js/zed_moi.js muiVk) để phần trang trí theo hệ cũng không lọt xuống dưới vạch đất. Cột: từ đốc + 40 % lưỡi tới hết ô.
    mui = {h: [None, None, None, None] for h in HE}
    for h in HE:
        for c in (1, 2, 3):
            A = o_he[(h, c)][..., 3] > 0
            x0 = int(K['chan'][c] + (A.shape[1] - K['chan'][c]) * 0.4)
            ys = np.nonzero(A[:, x0:].any(1))[0]
            m0 = K['mui'][c]
            mui[h][c] = [min(int(ys.min()), m0[0]), max(int(ys.max()) + 1, m0[1])]
    T = TN.giam_mau(T, 128)
    png = TN.png_bang_mau(T)
    tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk-he', 'ten': 'Kiếm vuông Cu Tí theo hệ (Lửa/Độc/Băng × Mầm/Thành hình/Thức tỉnh)',
           'phien_ban': 2, 'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'vk': {'kiem_vuong': meta}, 'mui_kv': mui,
           'ghi_chu': 'vk.kiem_vuong[hệ][cấp] = [x, y, rộng, cao], cùng cỡ ô kiếm vuông (zed-vk "kiem_vuong"); js/vien_vk.js G.vkHeAnh. '
                      'mui_kv[hệ][cấp] = [y trên, y dưới) phần đục phía mũi (chặn đất, js/zed_moi.js muiVk). '
                      'Dựng: docs/anh-goc/zed/dung-kiem-vuong-he.py (ảnh moi/vk-kiem-vuong-he.png).'}
    json.dump(tep, open(TEP_HE, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('zed-vk-he: %d×%d, %d byte PNG, tệp %d KB' % (Wt, Ht, len(png), os.path.getsize(TEP_HE) // 1024))
    print('mui gốc:', K['mui'], ' mui theo hệ:', mui)
    # ---- zed-vk-gan (thêm hàng kiếm vuông dưới tấm cũ; ô cũ giữ nguyên)
    Gt = json.load(open(TEP_GAN, encoding='utf-8'))
    cu = np.array(Image.open(io.BytesIO(base64.b64decode(Gt['tam'].split(',', 1)[1]))).convert('RGBA'))
    if 'kiem_vuong' in Gt['vk'] and Gt.get('kv_y'):  # chạy lại: bỏ hàng kiếm vuông lần trước
        cu = cu[:Gt['kv_y'] - 2]
    Hc, Wc = cu.shape[:2]
    Wn = max(Wc, sum(K['vk'][c][2] + 2 for c in range(3)) - 2)
    Hn = Hc + 2 + max(K['vk'][c][3] for c in range(3))
    T2 = np.zeros((Hn, Wn, 4), np.uint8)
    T2[:Hc, :Wc] = cu
    x = 0; mg = [None, None, None, None]
    for c in range(3):
        o = o_gan[c]
        T2[Hc + 2:Hc + 2 + o.shape[0], x:x + o.shape[1]] = o
        mg[c] = [x, Hc + 2, o.shape[1], o.shape[0]]; x += o.shape[1] + 2
    # tấm gân cũ là RGBA ~18 000 màu (co Image.BOX) → nén 256 màu (bảng màu có alpha, không chấm nhiễu; sai khác trung bình < 1 mức màu)
    # để bản một tệp giữ dưới trần 30 MB
    q = Image.fromarray(T2).quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    b = io.BytesIO(); q.save(b, 'PNG', optimize=True)
    png2 = b.getvalue()
    Gt['tam'] = 'data:image/png;base64,' + base64.b64encode(png2).decode()
    Gt['vk']['kiem_vuong'] = mg
    Gt['kv_y'] = Hc + 2
    Gt['ghi_chu'] = (Gt.get('ghi_chu', '').split(' | KIẾM VUÔNG')[0] + ' | KIẾM VUÔNG 17/10 tối: vk.kiem_vuong = [Trắng, Mầm, Thành hình, null] cùng cỡ ô '
                     'kiếm vuông (dán dưới tấm cũ từ hàng kv_y), dựng bằng docs/anh-goc/zed/dung-kiem-vuong-he.py.')
    json.dump(Gt, open(TEP_GAN, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('zed-vk-gan: %d×%d (cũ %d×%d), %d byte PNG' % (Wn, Hn, Wc, Hc, len(png2)))
    print('| Bộ | Hệ | Cấp | Ô | Cắt tràn ô / thiếu so gốc | k |')
    print('|---|---|---|---|---|---|')
    for t, h, c, W, H, mat, k in bang:
        print('| %s | %s | %d | %d×%d | %.1f %% | %.4f |' % (t, h, c, W, H, mat, k))
    # ---- ảnh soát ×4: mỗi cấp một hàng: gốc | Lửa | Độc | Băng | gân
    os.makedirs(RA_XEM, exist_ok=True)
    Z = 4; cw = max(r[2] for r in K['vk']) + 8; ch = max(r[3] for r in K['vk']) + 8
    xem = Image.new('RGBA', (cw * 5 * Z, ch * 4 * Z), (44, 48, 56, 255))
    for c in range(4):
        cot = [o_goc[c]] + [o_he.get((h, c)) for h in HE] + [o_gan.get(c)]
        for j, o in enumerate(cot):
            if o is None:
                continue
            im = Image.fromarray(o); im = im.resize((im.width * Z, im.height * Z), Image.NEAREST)
            xem.alpha_composite(im, (j * cw * Z + 4 * Z, c * ch * Z + 4 * Z))
    xem.save(os.path.join(RA_XEM, 'kiem-vuong-he-x4.png'))
    json.dump([list(map(lambda v: v if not isinstance(v, float) else round(v, 2), r)) for r in bang], open(os.path.join(RA_XEM, 'kiem-vuong-he-so.json'), 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
