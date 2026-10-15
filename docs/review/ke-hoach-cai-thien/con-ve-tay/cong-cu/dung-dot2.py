"""Con vẽ tay đợt 2 (15/10, YEU-CAU-2.md thư mục cha): 4 ảnh hiệu ứng sàn docs/anh-goc/hieu-ung-ky-nang/dot2/<tệp>.png
(nền xanh #00FF00, dải khung ngang) -> game/art/custom/<mã>.sprite.json (doi_tuong "hieu-ung", js/fx_anh.js).
    python3 dung-dot2.py [--ghi]
Cùng cách docs/review/ke-hoach-cai-thien/hieu-ung-ky-nang/cong-cu/dung-hieu-ung.py: khử nền xanh, bỏ đốm lẻ, khử ánh xanh ở mép,
tách khung theo khe cột trống, thu nhỏ hộp (alpha trước nhân, ngưỡng 110 → viền sắc), net 2, lượng tử 128 màu, kiểm khớp từng điểm.
Khác:
 - Cỡ: bề RỘNG hộp chung mọi khung (cùng đường đất) = bề rộng ở bao-cao.md mục 4 (dấu trên sàn); bề cao được tới 2× số ghi
   (khung có giọt / mảnh còn đang rơi, nảy trên không — hạt code cũ cũng bay cao tới ~27 điểm).
 - ray-bang: khói xanh lục nhạt AI tô (lục trội hơn lam/đỏ > 18) coi như nền → BỎ; điểm còn hơi lục thì kéo lục về bằng max(đỏ, lam)
   (sương trắng / xanh băng, không ám xanh lục).
 - Neo: x = giữa hộp khung; 'dat' y = đường đất chung (trung vị đáy các khung); 'dat-giua' y = đường đất − nửa bề cao vũng
   (trung vị bề cao các khung phẳng) → tâm vũng / vết nằm đúng chỗ hạt rơi chạm sàn.
 - Khung rất nhỏ (manh-da khung 1 và 6): đốm lẻ giữ từ 3 điểm (không phải 10), ngưỡng alpha khi thu nhỏ hạ còn 60 cho khung có ít điểm
   để khung không rỗng."""
import sys, os, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/hieu-ung-ky-nang/dot2')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
# tệp, mã, tên, số khung, neo, (rộng, cao) hộp điểm game, giây, lặp, khung phẳng (đo bề cao vũng), khử (khói / lục), đốm lẻ tối thiểu
# khử: 'chat' = chỉ bỏ đúng nền #00FF00 (khoảng cách màu < 60) vì chất độc cũng xanh lục; 'luc' = kéo lục thừa về max(đỏ, lam)
# (bụi be ám nền); 'khoi' = bỏ khói xanh lục nhạt + kéo lục thừa.
HU = [
    ('giot-doc-san', 'hu-giot-doc-san', 'Giọt độc rơi đọng trên sàn (16×8, thay vệt 3×1 vẽ code: js/fx.js hạt loại 5 độc)', 5, 'dat-giua', (16, 8), 0.6, False, [1, 2, 3, 4], 'chat', 10),
    ('manh-da', 'hu-manh-da', 'Mảnh đá / vụn nảy rồi nằm (24×16, thay ô vuông có bóng: js/fx.js hạt loại 8)', 6, 'dat', (24, 16), 0.7, False, None, 'luc', 3),
    ('vet-chay', 'hu-vet-chay', 'Vết cháy đen dưới vùng lửa nổ (32×16, thay elip scorch vẽ code; than hồng tắt dần)', 4, 'dat-giua', (32, 16), 1.6, False, [0, 1, 2, 3], '', 10),
    ('ray-bang', 'hu-ray-bang', 'Mảnh băng / sương rơi đọng (16×16, thay mảnh băng vẽ code: vùng băng nổ, băng vỡ, quái đóng băng rụng hạt)', 5, 'dat', (16, 16), 0.6, False, None, 'khoi', 3),
]


def khu_nen(rgb, khoi, toi_thieu):
    r, g, b = (rgb[..., k].astype(np.int32) for k in range(3))
    mx = np.maximum(r, b)
    if khoi == 'chat': nen = (r - 4) ** 2 + (g - 249) ** 2 + (b - 2) ** 2 < 60 ** 2
    else: nen = (g > 140) & (g - mx > 70)
    if khoi == 'khoi': nen |= (g - mx > 18)  # khói xanh lục nhạt (AI tô) → bỏ
    vat = ~nen
    lab, n = ndimage.label(vat)
    if n:
        sz = ndimage.sum(vat, lab, range(1, n + 1))
        vat &= np.isin(lab, 1 + np.nonzero(sz >= toi_thieu)[0])
    mep = vat & ~ndimage.binary_erosion(vat, iterations=3)
    out = rgb.astype(np.int32).copy()
    if khoi != 'chat':
        lan = mep & (g - mx > 45) & (r < 160)
        out[..., 1] = np.where(lan, mx + (g - mx) // 4, g)
    if khoi in ('khoi', 'luc'):  # còn hơi lục: kéo về trắng / xanh băng (băng), be (bụi đá)
        g2 = out[..., 1]
        out[..., 1] = np.where(vat & (g2 > mx), mx, g2)
    return np.dstack([np.clip(out, 0, 255).astype(np.uint8), (vat * 255).astype(np.uint8)])


def tach(a, so):
    cot = (a[..., 3] > 0).any(0)
    xs = np.nonzero(cot)[0]
    khe = []
    for i in range(len(xs) - 1):
        if xs[i + 1] - xs[i] > 1: khe.append((xs[i + 1] - xs[i] - 1, xs[i] + 1, xs[i + 1]))
    khe = sorted(sorted(khe, reverse=True)[:so - 1], key=lambda k: k[1])
    assert len(khe) == so - 1, len(khe)
    bien = [xs[0]] + [k[2] for k in khe]
    cuoi = [k[1] for k in khe] + [xs[-1] + 1]
    ks = []
    for x0, x1 in zip(bien, cuoi):
        sub = a[:, x0:x1]
        rows = np.nonzero((sub[..., 3] > 0).any(1))[0]
        y0, y1 = rows[0], rows[-1] + 1
        cols = np.nonzero((sub[y0:y1, :, 3] > 0).any(0))[0]
        ks.append((a[y0:y1, x0 + cols[0]:x0 + cols[-1] + 1].copy(), (x0 + cols[0], y0, x0 + cols[-1] + 1, y1)))
    return ks


def thu(a, z, nguong=110):
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = (A >= nguong) * 255
    if not o[..., 3].any():  # khung rất nhỏ: giữ ít nhất các điểm đậm nhất
        o[..., 3] = (A >= max(1, A.max() * 0.5)) * 255
    return o


def png(sh, so_mau=128):
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:3 * so_mau]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]; sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist()))); flat = sh.reshape(-1, 4).astype(np.int64)
    key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    km = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    im = Image.fromarray(np.searchsorted(km, key).astype(np.uint8).reshape(sh.shape[:2]), 'P'); im.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue()


so_do = {}
for tep, ma, ten, so, neo, (bw, bh), giay, lap, phang, khoi, toi_thieu in HU:
    a = khu_nen(np.array(Image.open(os.path.join(GOC, tep + '.png')).convert('RGB')), khoi, toi_thieu)
    ks = tach(a, so)
    dat = float(np.median([k[1][3] for k in ks]))
    # hộp chung mọi khung (neo x giữa khung, y đường đất): rộng = max bề rộng, cao = từ đỉnh cao nhất tới đáy thấp nhất so với đường đất
    rong = max(k[1][2] - k[1][0] for k in ks)
    cao = max(dat - k[1][1] for k in ks) + max(0.0, max(k[1][3] - dat for k in ks))
    z0 = min(bw / rong, 2 * bh / cao)  # bề RỘNG khớp hộp (dấu trên sàn); bề cao cho phép tới 2× (đoạn rơi / nảy trên không, như hạt code bay cao ~27)
    lech = 0.0
    if neo == 'dat-giua':
        lech = 0.5 * float(np.median([ks[i][1][3] - ks[i][1][1] for i in phang]))
    z = z0 * N; kh = []
    for b0, (x0, y0, x1, y1) in ks:
        H, W = b0.shape[:2]
        ax, ay = W / 2, (dat - lech) - y0
        nguong = 60 if (b0[..., 3] > 0).sum() * z * z < 40 else 110
        b = thu(b0, z, nguong); kh.append((b, ax * z, ay * z))
    trai = max(x for b, x, y in kh); phai = max(b.shape[1] - x for b, x, y in kh)
    tren = max(y for b, x, y in kh); duoi = max(b.shape[0] - y for b, x, y in kh)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
    sh = np.zeros((FH * N, len(kh) * FW * N, 4), np.uint8)
    for i, (b, x, y) in enumerate(kh):
        X = int(round(GX * N - x)) + i * FW * N; Y = int(round(GY * N - y))
        assert Y >= 0 and Y + b.shape[0] <= FH * N and X >= i * FW * N and X + b.shape[1] <= (i + 1) * FW * N, ma
        sub = sh[Y:Y + b.shape[0], X:X + b.shape[1]]; sub[:] = np.where(b[..., 3:4] > 0, b, sub)
    for i in range(len(kh)):
        assert sh[:, i * FW * N:(i + 1) * FW * N, 3].any(), (ma, 'khung rỗng', i + 1)
    data = png(sh)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten, 'net': N, 'khung_rong': FW, 'khung_cao': FH,
         'goc': [GX, GY], 'so': len(kh), 'giay': giay, 'lap': lap, 'xoay': False, 'co': 1, 'tron': 'thuong', 'thu': round(z0, 5),
         'tam': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    hop = [round(rong * z0, 1), round(cao * z0, 1)]
    so_do[ma] = {'o': [FW, FH], 'goc': [GX, GY], 'so': len(kh), 'thu': round(z0, 4), 'hop_game': hop, 'png': len(data), 'byte': os.path.getsize(ra)}
    print(ma, so_do[ma])
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w'), ensure_ascii=False, indent=1)
