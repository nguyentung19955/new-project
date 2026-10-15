"""Con vẽ tay đợt 3 (15/10, YEU-CAU-3.md thư mục cha): 10 ảnh hiệu ứng nhỏ docs/anh-goc/hieu-ung-ky-nang/dot3/<tệp>.png
(nền xanh #00FF00, một hàng khung ngang) -> game/art/custom/<mã>.sprite.json (doi_tuong "hieu-ung", js/fx_anh.js).
    python3 dung-dot3.py [--ghi]
Cùng cách dung-dot2.py / hieu-ung-ky-nang/cong-cu/dung-hieu-ung.py: khử nền xanh, bỏ đốm lẻ, tách khung theo khe cột trống, thu nhỏ hộp
(alpha trước nhân, ngưỡng 110 → viền sắc), net 2, lượng tử 128 màu, kiểm khớp từng điểm. Khác:
 - Khử nền theo từng ảnh (KHU):
   'tach'  vật không xanh lục (trắng, be, xanh lam, đỏ, hồng): tách trộn với nền a = 1 − (lục − max(đỏ, lam)) / 245, màu = (điểm − (1 − a)·nền) / a
           → điểm lẫn nền (mép, quầng) thành trắng / màu thật, không ám xanh (tia-mom: "quầng mờ ám xanh → trắng").
   'chat'  vật cũng xanh lục (bot-doc): chỉ bỏ điểm gần đúng màu nền (khoảng cách < 48) và điểm lục chói sát nền; viền đen giữ nguyên.
   'sang'  vòng xanh nhạt trên nền xanh (vong-hoi-quai): tách theo ĐỘ SÁNG kênh đỏ / lam + viền tối, không theo màu thuần: điểm tối hơn nền
           (lục < 215: viền tối) giữ đặc; điểm sáng a = (min(đỏ, lam) − 8) / 120, màu tách trộn như 'tach' (giữ màu xanh nhạt của vòng).
   'thuong' như dung-dot2.py (nền = lục > 140 và lục − max(đỏ, lam) > 70, khử ánh xanh ở mép): khoi-doc-nho (đốm vàng lục không bị ăn).
 - Ảnh có quầng mờ (MO: tia-mom, vong-hoi-quai, tam-giac-bua) giữ alpha nhiều nấc (0 / 80 / 140 / 200 / 255) thay vì cắt 0 / 255.
 - Khung: tách theo khe cột (gai-toa: vòng gai rỗng ở giữa có khe → biên cố định đo tay ở BIEN).
 - Neo (NEO, mọi khung chung một hàng neo trong ảnh gốc vì các khung cùng một hàng):
   'hop' x = giữa hộp khung, y = trung vị giữa hộp các khung (tâm: gai toả, tia, vệt cào)
   'rong' x = giữa hàng RỘNG nhất của khung (vũng / vòng elip), y = trung vị hàng đó các khung; khung không có vòng (vong-hoi-quai 6)
          dùng giữa hộp
   'day' x = giữa phần đáy (25% dưới) của khung, y = trung vị đáy (khói bốc lên từ một chỗ)
   'trai-dat' x = mép trái (đuôi vạch tốc độ = phía sau), y = trung vị đáy (lao-bui)
   'phai-dat' x = mép phải (mép trước con sóng), y = trung vị đáy (tuong-song)
   'khop' khung dời cho khớp khung mẫu (tương quan mặt nạ) rồi neo ở trọng tâm tam giác của khung mẫu (tam-giac-bua)
 - Cỡ (CO): ('hop', W, H) hộp chung vừa W×H điểm game (bảng mục 4 bao-cao.md); ('rong', khung, w) hàng rộng nhất của các khung đó
   (trung vị) = w điểm game; ('khung', i, w) bề rộng khung i = w.
 - tam-giac-bua: in tọa độ 3 đỉnh tam giác (khung mẫu 3, đo tay trên ảnh gốc ở DINH_TG) theo điểm game so với điểm neo → hằng số
   TG_DINH trong js/ky_nang_quai.js (ánh xạ affine 3 đỉnh ảnh → 3 đỉnh vùng va chạm thật)."""
import sys, os, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/hieu-ung-ky-nang/dot3')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra3'); os.makedirs(RA, exist_ok=True)
N = 2
NEN = np.array([3, 248, 3])
# tệp, mã, tên, số khung, khử, neo, cỡ, giây, lặp, xoay, vùng, đốm lẻ tối thiểu
HU = [
    ('bot-doc', 'hu-bot-doc', 'Bọt độc nổi lên từ vũng rồi vỡ (vũng rộng ~12; thay bọt 2×2 vẽ code: js/fx.js hạt loại 11 ở vũng / vùng độc nổ)',
     6, 'chat', 'rong', ('hop', 12, 16), 0.7, False, False, None, 12),
    ('cao-quai', 'hu-cao-quai', 'Vệt cào cận chiến của quái (trắng → game nhuộm theo màu quái; quay theo hướng đòn; DON chem)',
     5, 'tach', 'hop', ('hop', 48, 32), 0.3, False, True, None, 8),
    ('lao-bui', 'hu-lao-bui', 'Bụi + vạch tốc độ khi quái lao (vạch trắng bên trái = phía sau; lật theo hướng lao; DON lao)',
     5, 'tach', 'trai-dat', ('hop', 40, 16), 0.4, False, False, None, 8),
    ('gai-toa', 'hu-gai-toa', 'Vòng gai toả của quái (trắng → nhuộm; khung 4 bán kính 32 khi co 1; DON gai)',
     6, 'tach', 'hop', ('khung', 3, 64), 0.5, False, False, None, 4),
    ('tia-mom', 'hu-tia-mom', 'Tia sáng ở miệng lúc lấy đà bắn / ném / phun (trắng → nhuộm)',
     5, 'tach', 'hop', ('hop', 16, 16), 0.5, False, False, None, 3),
    ('vong-hoi-quai', 'hu-vong-hoi-quai', 'Vòng hồi máu của quái khiên (vòng khung 4 rộng 90 khi co 1 → co 2 = bán kính hồi 90; mobs.js healFx)',
     6, 'sang', 'rong', ('rong', [3], 90), 0.6, False, False, None, 4),
    ('tuong-song', 'hu-tuong-song', 'Tường sóng Ngư Tinh (neo mép trước, đáy; js/fx.js wave)',
     6, 'tach', 'phai-dat', ('hop', 64, 48), 0.5, True, False, 'bien', 10),
    ('khoi-doc-nho', 'hu-khoi-doc-nho', 'Làn khói độc nhỏ quanh thân Nấm / Mộc Tinh (lặp; neo gốc khói; monster_art.js khiDoc)',
     6, 'thuong', 'day', ('hop', 24, 24), 0.6, True, False, 'rung', 6),
    ('hao-quang-gian', 'hu-hao-quang-gian', 'Quầng nổi giận dưới chân (lặp; vòng rộng 40 khi co 1; js/noi_gian.js)',
     6, 'tach', 'rong', ('rong', [0, 1, 2, 3, 4, 5], 40), 0.6, True, False, None, 6),
    ('tam-giac-bua', 'hu-tam-giac-bua', 'Tam giác ấn của Tiểu Yêu (khớp 3 đỉnh vùng va chạm bằng ánh xạ affine; js/ky_nang_quai.js)',
     6, 'tach', 'khop', ('khung', 2, 64), 1.0, False, False, 'laudai', 4),
]
MO = {'tia-mom', 'vong-hoi-quai', 'tam-giac-bua'}
BIEN = {'gai-toa': [285, 630, 1030, 1478, 1840]}  # khe giữa các khung (vòng gai khung 4 rỗng ở giữa → khe tự đo bị lẫn)
BO_VONG = {'vong-hoi-quai': [5]}  # khung không có vòng: neo x = giữa hộp
# quầng mờ hồng trên nền xanh: phép tách trộn 'tach' coi lục của màu thật = max(đỏ, lam) nên quầng hồng (lục thấp) ra màu kaki → điểm mờ
# (a < 0,95) của ảnh này tô lại hồng nhạt (cùng màu lõi tia).
QUANG = {'tam-giac-bua': (255, 190, 235)}
DINH_TG = [(904.5, 233.0), (787.0, 426.0), (1022.0, 426.0)]  # đỉnh trên, trái dưới, phải dưới (ảnh gốc tam-giac-bua, khung 3, đo tay)


def khu_nen(rgb, khu, toi_thieu, quang=None):
    f = rgb.astype(np.float32); r, g, b = f[..., 0], f[..., 1], f[..., 2]
    mx = np.maximum(r, b)
    if khu == 'thuong':
        a = (~((g > 140) & (g - mx > 70))).astype(np.float32)
        mep = (a > 0) & ~ndimage.binary_erosion(a > 0, iterations=3)
        lan = mep & (g - mx > 45) & (r < 160)
        f[..., 1] = np.where(lan, mx + (g - mx) / 4, g)
    elif khu == 'chat':
        d = np.sqrt(((f - NEN) ** 2).sum(2))
        a = (~((d < 48) | ((g > 232) & (r < 110) & (b < 70)))).astype(np.float32)
    else:
        if khu == 'tach':
            a = np.clip(1 - (g - mx) / 245.0, 0, 1)
        else:  # 'sang'
            a = np.where(g < 215, 1.0, np.clip((np.minimum(r, b) - 8) / 120.0, 0, 1)).astype(np.float32)
        aa = np.maximum(a, 1e-3)[..., None]
        f = np.where(a[..., None] > 0, (f - (1 - a[..., None]) * NEN) / aa, 0)
        if quang: f = np.where(((a > 0) & (a < 0.95))[..., None], np.array(quang, np.float32), f)
    vat = a > 0.35
    lab, n = ndimage.label(vat)
    if n:
        sz = ndimage.sum(vat, lab, range(1, n + 1))
        giu = np.isin(lab, 1 + np.nonzero(sz >= toi_thieu)[0])
        # điểm mờ quanh đốm giữ lại: chỉ khi sát một đốm được giữ
        a = np.where(ndimage.binary_dilation(giu, iterations=2), a, 0)
    return np.dstack([np.clip(f, 0, 255), a * 255]).astype(np.float32)


def tach(a, so, bien=None):
    m = a[..., 3] > 90
    if bien:
        bs = [0] + bien; cs = bien + [a.shape[1]]
    else:
        xs = np.nonzero(m.any(0))[0]
        khe = [(xs[i + 1] - xs[i] - 1, xs[i] + 1, xs[i + 1]) for i in range(len(xs) - 1) if xs[i + 1] - xs[i] > 1]
        khe = sorted(sorted(khe, reverse=True)[:so - 1], key=lambda k: k[1])
        assert len(khe) == so - 1, len(khe)
        bs = [xs[0]] + [k[2] for k in khe]; cs = [k[1] for k in khe] + [xs[-1] + 1]
    ks = []
    for x0, x1 in zip(bs, cs):
        sub = m[:, x0:x1]
        rows = np.nonzero(sub.any(1))[0]; cols = np.nonzero(sub.any(0))[0]
        X0, X1, Y0, Y1 = x0 + cols[0], x0 + cols[-1] + 1, rows[0], rows[-1] + 1
        ks.append((a[Y0:Y1, X0:X1].copy(), (X0, Y0, X1, Y1)))
    assert len(ks) == so
    return ks


def hang_rong(b):  # hàng có bề rộng (mép trái → mép phải) lớn nhất: (y trong khung, x giữa, bề rộng)
    m = b[..., 3] > 90; best = (0, 0, 0)
    for y in range(m.shape[0]):
        xs = np.nonzero(m[y])[0]
        if len(xs) and xs[-1] - xs[0] + 1 > best[2]: best = (y, (xs[0] + xs[-1] + 1) / 2, xs[-1] - xs[0] + 1)
    return best


def khop(ref, b):  # dời (dx, dy) để mặt nạ b khớp mặt nạ khung mẫu ref nhất (tọa độ ảnh gốc của góc trên trái)
    from scipy.signal import fftconvolve
    A = (ref[0][..., 3] > 90).astype(np.float32); B = (b[0][..., 3] > 90).astype(np.float32)
    cc = fftconvolve(A, B[::-1, ::-1], mode='full')
    iy, ix = np.unravel_index(np.argmax(cc), cc.shape)
    oy, ox = iy - (B.shape[0] - 1), ix - (B.shape[1] - 1)  # vị trí góc trên trái của b trong hệ tọa độ của ref
    return ox, oy


def thu(a, z, mo):
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4] / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    if mo:
        lv = np.array([0, 80, 140, 200, 255]); q = lv[np.argmin(np.abs(A[..., None] - lv), 2)]
        o[..., 3] = np.where(A < 40, 0, np.maximum(q, 80))
    else:
        o[..., 3] = (A >= 110) * 255
        if not o[..., 3].any(): o[..., 3] = (A >= max(1, A.max() * 0.5)) * 255
    return o


def png(sh, so_mau=128):
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:3 * so_mau]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]; sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist()))); assert len(mau) <= 256, len(mau)
    flat = sh.reshape(-1, 4).astype(np.int64)
    key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    km = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    im = Image.fromarray(np.searchsorted(km, key).astype(np.uint8).reshape(sh.shape[:2]), 'P'); im.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue()


so_do = {}
for tep, ma, ten, so, khu, neo, co, giay, lap, xoay, vung, toi_thieu in HU:
    a = khu_nen(np.array(Image.open(os.path.join(GOC, tep + '.png')).convert('RGB')), khu, toi_thieu, QUANG.get(tep))
    ks = tach(a, so, BIEN.get(tep))
    # điểm neo (tọa độ ảnh gốc) từng khung
    if neo == 'hop':
        X = [(k[1][0] + k[1][2]) / 2 for k in ks]; Y = [float(np.median([(k[1][1] + k[1][3]) / 2 for k in ks]))] * so
    elif neo == 'rong':
        hr = [hang_rong(k[0]) for k in ks]; bo = BO_VONG.get(tep, [])
        X = [(k[1][0] + k[1][2]) / 2 if i in bo else k[1][0] + hr[i][1] for i, k in enumerate(ks)]
        Y = [float(np.median([k[1][1] + hr[i][0] for i, k in enumerate(ks) if i not in bo]))] * so
    elif neo == 'day':
        X = []
        for b, (x0, y0, x1, y1) in ks:
            m = b[..., 3] > 90; h = m.shape[0]; cs = np.nonzero(m[int(h * 0.75):].any(0))[0]; X.append(x0 + (cs[0] + cs[-1] + 1) / 2)
        Y = [float(np.median([k[1][3] for k in ks]))] * so
    elif neo in ('trai-dat', 'phai-dat'):
        X = [k[1][0] if neo == 'trai-dat' else k[1][2] for k in ks]; Y = [float(np.median([k[1][3] for k in ks]))] * so
    elif neo == 'khop':
        mau_i = 2; ref = ks[mau_i]; cx = sum(p[0] for p in DINH_TG) / 3; cy = sum(p[1] for p in DINH_TG) / 3
        X, Y = [], []
        for i, k in enumerate(ks):
            ox, oy = (0, 0) if i == mau_i else khop(ref, k)
            # góc trên trái của khung i nằm ở (ref.x0 + ox, ref.y0 + oy) trong hệ của khung mẫu → neo = trọng tâm tam giác dời tương ứng
            X.append(cx - (ref[1][0] + ox) + k[1][0]); Y.append(cy - (ref[1][1] + oy) + k[1][1])
    # cỡ
    if co[0] == 'hop':
        trai = max(X[i] - k[1][0] for i, k in enumerate(ks)); phai = max(k[1][2] - X[i] for i, k in enumerate(ks))
        tren = max(Y[i] - k[1][1] for i, k in enumerate(ks)); duoi = max(k[1][3] - Y[i] for i, k in enumerate(ks))
        z0 = min(co[1] / (trai + phai), co[2] / (tren + duoi))
    elif co[0] == 'rong':
        z0 = co[2] / float(np.median([hang_rong(ks[i][0])[2] for i in co[1]]))
    else:
        z0 = co[2] / (ks[co[1]][1][2] - ks[co[1]][1][0])
    z = z0 * N; kh = []
    for i, (b0, (x0, y0, x1, y1)) in enumerate(ks):
        b = thu(b0, z, tep in MO); kh.append((b, (X[i] - x0) * z, (Y[i] - y0) * z))
    trai = max(x for b, x, y in kh); phai = max(b.shape[1] - x for b, x, y in kh)
    tren = max(y for b, x, y in kh); duoi = max(b.shape[0] - y for b, x, y in kh)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
    assert FW <= 512 and FH <= 512, ma
    sh = np.zeros((FH * N, len(kh) * FW * N, 4), np.uint8)
    for i, (b, x, y) in enumerate(kh):
        X0 = int(round(GX * N - x)) + i * FW * N; Y0 = int(round(GY * N - y))
        assert Y0 >= 0 and Y0 + b.shape[0] <= FH * N and X0 >= i * FW * N and X0 + b.shape[1] <= (i + 1) * FW * N, ma
        sub = sh[Y0:Y0 + b.shape[0], X0:X0 + b.shape[1]]; sub[:] = np.where(b[..., 3:4] > 0, b, sub)
    for i in range(len(kh)):
        assert sh[:, i * FW * N:(i + 1) * FW * N, 3].any(), (ma, 'khung rỗng', i + 1)
    data = png(sh, 48 if tep in MO else 128)  # nhiều nấc alpha: 48 màu × ≤ 5 nấc ≤ 256 mục bảng màu
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'doi_tuong': 'hieu-ung', 'ma': ma, 'ten': ten, 'net': N, 'khung_rong': FW, 'khung_cao': FH,
         'goc': [GX, GY], 'so': len(kh), 'giay': giay, 'lap': lap, 'xoay': xoay, 'co': 1, 'tron': 'thuong', 'thu': round(z0, 5),
         'tam': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    if vung: t['vung'] = vung
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[ma] = {'o': [FW, FH], 'goc': [GX, GY], 'so': len(kh), 'thu': round(z0, 4), 'vung': vung, 'png': len(data), 'byte': os.path.getsize(ra)}
    if neo == 'rong':
        so_do[ma]['vong'] = [round(hang_rong(k[0])[2] * z0, 1) for k in ks]
    if tep == 'tam-giac-bua':
        mau_i = 2; cx = sum(p[0] for p in DINH_TG) / 3; cy = sum(p[1] for p in DINH_TG) / 3
        so_do[ma]['dinh'] = [[round((p[0] - cx) * z0, 2), round((p[1] - cy) * z0, 2)] for p in DINH_TG]  # so với điểm neo, điểm game
    print(ma, so_do[ma])
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w'), ensure_ascii=False, indent=1)
