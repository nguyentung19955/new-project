"""9 hiệu ứng kỹ năng (15/10, YEU-CAU.md thư mục cha): docs/anh-goc/hieu-ung-ky-nang/<tệp>.png (nền xanh #00FF00, dải khung ngang)
-> game/art/custom/<mã>.sprite.json (doi_tuong "hieu-ung", js/fx_anh.js).   python3 dung-hieu-ung.py [--ghi]
Cùng cách dung-hieu-ung-them.py (phiên trum-moi): khử nền xanh, bỏ đốm lẻ, khử ánh xanh ở mép, tách khung theo khe cột trống,
thu nhỏ hộp (alpha trước nhân, ngưỡng 110 → viền sắc), net 2, lượng tử 128 màu, bảng màu kiểm lại khớp từng điểm.
Neo: 'dat' = giữa lõi ngang, đáy = đường đất chung (trung vị đáy các khung); 'giua' = tâm lõi (cột / hàng dày đặc, bỏ tia lẻ);
'giay' = 'giua' nhưng hàng neo là đáy khung 1 (lá bùa: vòng lửa khung 4–6 thấp hơn chân bùa).
Cỡ: (khung mẫu, chiều 'w'/'h', số điểm game khi co = 1) — lấy từ hình vẽ tạm trong js/ky_nang_quai.js, js/chieu_trum.js (xem bao-cao.md)."""
import sys, os, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/hieu-ung-ky-nang')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
# tệp, mã, tên, số khung, neo, (khung mẫu, chiều, cỡ game), giây, lặp, xoay, vùng
HU = [
    ('cau-dat-lan', 'hu-cau-dat-lan', 'Bọ Hung · cục đất lăn (đường kính 18 khi co 1, lăn sang phải)', 8, 'dat', (0, 'w', 18), 0.8, True, False, 'rung'),
    ('vet-nhot', 'hu-vet-nhot', 'Ốc Mượn Hồn · vệt nhớt (rộng 24 = 2 × nhotR 12 khi co 1)', 6, 'giua', (0, 'w', 24), 0.9, True, False, 'bien'),
    ('vung-dien', 'hu-vung-dien', 'Sứa Bom · vũng điện (lòng rộng 52 = 2 × r 26 khi co 1; 1–5 âm ỉ, 6–8 bùng)', 8, 'giua', (0, 'w', 54), 0.8, True, False, 'bien'),
    ('bua-tam-giac', 'hu-bua-tam-giac', 'Tiểu Yêu · lá bùa (cao 12 khi co 1; 4–6 vòng lửa chân)', 6, 'giay', (0, 'h', 12), 0.6, False, False, 'laudai'),
    ('vo-oc', 'hu-vo-oc', 'Ốc Mượn Hồn · rút vỏ (rộng 48 ≈ thân ốc 46 ở oc.sprite.json; 1–2 yên, 3–4 rung, 5–6 ló ra)', 6, 'dat', (0, 'w', 48), 1.5, False, False, 'bien'),
    ('manh-san-ho', 'hu-manh-san-ho', 'Ngư Tinh · mảnh san hô văng (dài 14 khi co 1, bay sang phải; khung 6 vỡ)', 6, 'giua', (0, 'w', 14), 0.6, False, True, 'bien'),
    ('tuong-tinh-the', 'hu-tuong-tinh-the', 'Cua Đá · khúc tường tinh thể (rộng 16 khi co 1; 1–3 trồi, 5 rạn, 6 vỡ)', 6, 'dat', (3, 'w', 16), 3.0, False, False, 'bien'),
    ('vet-dau', 'hu-vet-dau', 'Hũ Chúa · vệt dầu (rộng 18 = bề rộng vệt khi co 1; 1–2 loang, 4–6 ánh cam)', 6, 'giua', (3, 'w', 18), 1.0, False, False, 'laudai'),
    ('nam-con', 'hu-nam-con', 'Nấm Chúa · nấm con (cao 18 ở khung 4 khi co 1; 1–2 trồi, 5–6 phồng)', 6, 'dat', (3, 'h', 18), 2.5, False, False, 'rung'),
]


def khu_nen(rgb):
    r, g, b = (rgb[..., k].astype(np.int32) for k in range(3))
    nen = (g > 140) & (g - np.maximum(r, b) > 70)
    vat = ~nen
    lab, n = ndimage.label(vat)
    if n:
        sz = ndimage.sum(vat, lab, range(1, n + 1))
        vat &= np.isin(lab, 1 + np.nonzero(sz >= 10)[0])
    # khử ánh xanh ở mép (2 điểm ảnh sát nền): lục không vượt quá kênh lớn còn lại (điểm lẫn nền xanh)
    mep = vat & ~ndimage.binary_erosion(vat, iterations=3)
    out = rgb.astype(np.int32).copy()
    mx = np.maximum(r, b)
    lan = mep & (g - mx > 45) & (r < 160)
    out[..., 1] = np.where(lan, mx + (g - mx) // 4, g)
    a = np.dstack([np.clip(out, 0, 255).astype(np.uint8), (vat * 255).astype(np.uint8)])
    return a


def tach(a, so):
    cot = (a[..., 3] > 0).any(0)
    xs = np.nonzero(cot)[0]
    khe = []  # (độ rộng, đầu, cuối) các khe cột trống giữa vật
    i = 0
    while i < len(xs) - 1:
        if xs[i + 1] - xs[i] > 1: khe.append((xs[i + 1] - xs[i] - 1, xs[i] + 1, xs[i + 1]))
        i += 1
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


def loi(m, ax):  # chỉ số giữa của phần lõi dày (cột/hàng có ≥ 45% số điểm của cột/hàng dày nhất)
    s = m.sum(ax); k = np.nonzero(s >= 0.45 * s.max())[0]
    return (k[0] + k[-1] + 1) / 2


def thu(a, z):
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = (A >= 110) * 255
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
for tep, ma, ten, so, neo, (km, chieu, co_dich), giay, lap, xoay, vung in HU:
    a = khu_nen(np.array(Image.open(os.path.join(GOC, tep + '.png')).convert('RGB')))
    ks = tach(a, so)
    m0 = ks[km][0]
    z0 = co_dich / (m0.shape[1] if chieu == 'w' else m0.shape[0])
    dat = float(np.median([k[1][3] for k in ks]))
    day1 = ks[0][1][3]
    z = z0 * N; kh = []
    for b0, (x0, y0, x1, y1) in ks:
        m = b0[..., 3] > 0; H, W = m.shape
        if neo == 'dat': ax, ay = loi(m, 0), H + (dat - y1)
        elif neo == 'giay': ax, ay = loi(m, 0), day1 - y0
        else: ax, ay = loi(m, 0), loi(m, 1)
        b = thu(b0, z); kh.append((b, ax * z, ay * z))
    trai = max(x for b, x, y in kh); phai = max(b.shape[1] - x for b, x, y in kh)
    tren = max(y for b, x, y in kh); duoi = max(b.shape[0] - y for b, x, y in kh)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
    assert FW <= 512 and FH <= 512, ma
    sh = np.zeros((FH * N, len(kh) * FW * N, 4), np.uint8)
    for i, (b, x, y) in enumerate(kh):
        X = int(round(GX * N - x)) + i * FW * N; Y = int(round(GY * N - y))
        assert Y >= 0 and Y + b.shape[0] <= FH * N and X >= i * FW * N and X + b.shape[1] <= (i + 1) * FW * N, ma
        sub = sh[Y:Y + b.shape[0], X:X + b.shape[1]]; sub[:] = np.where(b[..., 3:4] > 0, b, sub)
    data = png(sh)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten, 'vung': vung, 'net': N, 'khung_rong': FW, 'khung_cao': FH,
         'goc': [GX, GY], 'so': len(kh), 'giay': giay, 'lap': lap, 'xoay': xoay, 'co': 1, 'tron': 'thuong', 'thu': round(z0, 5),
         'tam': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[ma] = {'o': [FW, FH], 'goc': [GX, GY], 'so': len(kh), 'thu': round(z0, 4), 'png': len(data), 'byte': os.path.getsize(ra)}
    print(ma, so_do[ma])
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w'), ensure_ascii=False, indent=1)
