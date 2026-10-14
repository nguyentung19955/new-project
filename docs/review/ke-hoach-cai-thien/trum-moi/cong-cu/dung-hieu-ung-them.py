"""7 hiệu ứng thêm (đợt trùm nhỏ 14/10): khung đã cắt (docs/anh-goc/trum-moi/hieu-ung/<mã>-cat/<mã>/khung-NN.png)
-> game/art/custom/<mã>.sprite.json (doi_tuong "hieu-ung", js/fx_anh.js). python3 dung-hieu-ung-them.py [--ghi]
Dựng từ dung-hieu-ung-trum.py. Neo: 'dat' = giữa ngang, đáy = đường đất chung; 'vong:R' = tâm vòng sóng sát đất (hàng rộng nhất của khung
rộng nhất), hệ số thu chọn cho bán kính vòng = R điểm game khi co = 1; 'mui:L' = mép trái (gốc phun), dài L khi co 1;
'giua:Wd' = tâm khung, rộng Wd khi co 1; 'dau' = giữa đầu hạt (hạt bay sang phải, đuôi bên trái).
Vết nứt sàn: chỉ khung 1 (khung 2, 3 ảnh AI bị pha xanh); game tự mờ dần."""
import sys, os, json, glob, io, base64
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/trum-moi/hieu-ung')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2
HU = [  # mã, tên, hệ số thu, neo, giây, lặp, xoay, chỉ dùng các khung (None = đủ)
    ('hu-dap-san', 'Cua Đá · đập sàn (vòng r 80 khi co 1)', None, 'vong:80', 0.6, False, False, None),
    ('hu-nam-moc', 'Nấm Chúa · nấm độc trồi', 0.11, 'dat', 0.6, False, False, None),
    ('hu-phun-lua-quat', 'Hổ Lửa · phun lửa quạt (dài 94 khi co 1)', None, 'mui:94', 0.6, False, True, None),
    ('hu-hat-linh-khi', 'Hạt linh khí bay về thanh (trắng, game nhuộm)', 0.1, 'dau', 0.3, True, True, None),
    ('hu-nut-san', 'Vết nứt sàn (chỉ khung 1, game mờ dần)', None, 'giua:60', 1.5, False, False, [0]),
    ('hu-quai-hien', 'Quái xuất hiện', 0.17, 'dat', 0.9, False, False, None),
    ('hu-quai-dap', 'Quái thường đập đất (vòng r 28 khi co 1)', None, 'vong:28', 0.5, False, False, None),
]
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
    im = Image.fromarray(sh, 'RGBA').quantize(colors=so_mau + 1, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    if not (np.array(im.convert('RGBA')) == sh).all():  # bảng màu tự dựng (như dung-moc-ho.py)
        mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist()))); flat = sh.reshape(-1, 4).astype(np.int64)
        key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
        km = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
        im = Image.fromarray(np.searchsorted(km, key).astype(np.uint8).reshape(sh.shape[:2]), 'P'); im.putpalette([v for c in mau for v in c[:3]])
        buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    else:
        buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue()
so_do = {}
for ma, ten, z0, neo, giay, lap, xoay, chi in HU:
    d = os.path.join(GOC, ma + '-cat')
    ks = json.load(open(os.path.join(d, 'bao-cao.json'), encoding='utf-8'))['hang'][0]['khung']
    fs = sorted(glob.glob(os.path.join(d, ma, 'khung-*.png'))); assert len(fs) == len(ks)
    if chi is not None: fs = [fs[k] for k in chi]; ks = [ks[k] for k in chi]
    dat = float(np.median([k['khung_bao'][3] for k in ks]))
    A = [np.array(Image.open(f).convert('RGBA')) for f in fs]
    neo, _, co_dich = neo.partition(':')
    # vòng (sóng / bụi sát đất, nhìn chếch): xích đạo = hàng rộng nhất của khung rộng nhất (toạ độ tấm gốc); z0 theo bán kính đích
    if neo == 'vong':
        rong = [((a[..., 3] > 100).sum(1)) for a in A]; kk = int(np.argmax([r.max() for r in rong]))
        m = A[kk][..., 3] > 100; hang_rong = [(np.nonzero(r)[0]) for r in m]
        w = np.array([(h[-1] - h[0] + 1) if len(h) else 0 for h in hang_rong]); yq = int(np.argmax(w))
        xich = ks[kk]['khung_bao'][1] + yq
        if z0 is None: z0 = 2 * float(co_dich) / float(w[yq])
    if neo == 'mui' and z0 is None: z0 = float(co_dich) / max(a.shape[1] for a in A)
    if neo == 'giua' and z0 is None: z0 = float(co_dich) / max(a.shape[1] for a in A)
    z = z0 * N; kh = []
    for a, k in zip(A, ks):
        m = a[..., 3] > 100
        x0, y0, x1, y1 = k['khung_bao']; H, W = a.shape[:2]
        if neo == 'dat': ax, ay = W / 2, H + (dat - y1)
        elif neo == 'vong': ax, ay = W / 2, xich - y0
        elif neo == 'giua': ax, ay = W / 2, H / 2
        elif neo == 'dau':  # đầu hạt (bên phải, đuôi kéo sang trái): giữa khối sáng ở 40% bên phải
            sub = m[:, int(W * 0.6):]; ys, xs = np.nonzero(sub); ax, ay = float(xs.mean() + int(W * 0.6)), float(ys.mean())
        else:
            cols = np.nonzero(m.any(0))[0]; c0 = cols[0]; band = m[:, c0:c0 + max(3, W // 25)]
            ax, ay = float(c0), float(np.nonzero(band.any(1))[0].mean())
        b = thu(a, z); kh.append((b, ax * z, ay * z))
    trai = max(x for b, x, y in kh); phai = max(b.shape[1] - x for b, x, y in kh)
    tren = max(y for b, x, y in kh); duoi = max(b.shape[0] - y for b, x, y in kh)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
    assert FW <= 512 and FH <= 512, ma
    sh = np.zeros((FH * N, len(kh) * FW * N, 4), np.uint8)
    for i, (b, x, y) in enumerate(kh):
        X = int(round(GX * N - x)) + i * FW * N; Y = int(round(GY * N - y))
        assert Y >= 0 and Y + b.shape[0] <= FH * N
        sub = sh[Y:Y + b.shape[0], X:X + b.shape[1]]; sub[:] = np.where(b[..., 3:4] > 0, b, sub)
    data = png(sh)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten, 'net': N, 'khung_rong': FW, 'khung_cao': FH,
         'goc': [GX, GY], 'so': len(kh), 'giay': giay, 'lap': lap, 'xoay': xoay, 'co': 1, 'tron': 'thuong', 'thu': round(z0, 5),
         'tam': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[ma] = {'o': [FW, FH], 'goc': [GX, GY], 'so': len(kh), 'thu': round(z0, 4), 'byte': os.path.getsize(ra)}
    print(ma, so_do[ma])
json.dump(so_do, open(os.path.join(RA, 'so-do-hieu-ung-them.json'), 'w'), ensure_ascii=False, indent=1)
