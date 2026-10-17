"""Nền phòng Hang biển + Lâu đài cổ: ảnh 9 mảng (docs/anh-goc/nen-phong/<lau-dai|hang-bien>-9-mang.png, nền hồng tím #FF00FF)
và tấm sàn liền hang-bien-san-lien.png -> game/art/custom/gd-nen-<lau|bien>-<mảng>.sprite.json (cùng chuẩn bộ Rừng: dot-6/PROMPT.md).
python3 cat-nen-bien-lau.py [--ghi]
- Tìm 9 mảng: vùng không phải nền hồng (mở hình 9x9 để bỏ đường lưới), xếp theo hàng / cột.
- Sàn Lâu đài (ô 1-3) và điểm nhấn (ô 4): cắt đúng 4 chu kỳ lưới ron (từ giữa ron trong thứ nhất lùi một chu kỳ tới giữa ron thứ ba
  tiến một chu kỳ) nên lát lặp ron nối đều; mảng hơi bẹt (351x280) được co vuông 64x64.
- Sàn Hang biển: ô sàn trong tấm 9 mảng có viền đá -> KHÔNG dùng. Lấy 3 vùng khác nhau của hang-bien-san-lien.png (512 điểm ảnh gốc ~ 64
  điểm game, cùng cỡ đá với tấm 9 mảng). san0 làm liền mép bằng trộn mép (cắt rộng thêm 64 điểm, trộn dần phần thừa vào mép đối diện).
  san1, san2: nội dung vùng khác đặt vào giữa, viền ngoài (mép mờ dần 18%) lấy đúng của san0 -> mọi mảng ghép với nhau (kể cả lật ngang)
  đều liền. san-nhan: lòng ô 4 (vũng nước + san hô, đã bỏ viền đá), giữ cỡ đá, đặt giữa san0 cùng cách.
- Tường sau 64x49: Lâu đài cắt từ giữa cột đỏ 1 tới giữa cột đỏ 3 (bỏ hai đầu mái cong) nên lặp ngang liền; Hang biển bỏ góc bo rồi trộn mép.
- Tường trước 64x12, mép 64x12 (nền trong suốt), tường bên 14x64: cắt khung, co về cỡ game, trộn mép theo chiều lặp.
  Lan can Lâu đài (tường trước) có lỗ hở: lót màu nóc tường #241c1d dưới (tường trước phải kín).
- Ảnh nét x2, PNG <= 64 màu."""
import sys, os, json, io, base64
import numpy as np
from PIL import Image
from scipy import ndimage as nd
DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/nen-phong')
# NÉT CAO — NỀN (17/10): bản chép của trum-moi/cong-cu/cat-nen-bien-lau.py, thêm hai tham số (mọi chỗ cắt / trộn mép giữ nguyên):
#   --net N      độ nét (2 = như game hiện tại; 3, 4 = bản nét cao)      --cach box|net   cách thu nhỏ: box = như cũ (BOX/LANCZOS),
#   net = do-net/cong-cu/thu_net.thu (mỗi điểm một màu có thật, không pha) — trộn mép (lặp liền) vẫn trộn như cũ, rồi giảm màu.
# Ảnh ra: ra/net<N>-<cách>/<mã>.png (không ghi vào game; dung_net.py đóng gói).
sys.path.insert(0, os.path.join(DAY, 'docs/review/ke-hoach-cai-thien/do-net/cong-cu'))
import thu_net
def _arg(k, d):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
N = int(_arg('--net', '2')); CACH = _arg('--cach', 'net')
GHI = False
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra', 'net%d-%s' % (N, CACH)); os.makedirs(RA, exist_ok=True)
CO = {'san0': (64, 64), 'san1': (64, 64), 'san2': (64, 64), 'san-nhan': (64, 64), 'ngoai': (64, 64), 'tuong-sau': (64, 49),
      'tuong-truoc': (64, 12), 'mep': (64, 12), 'tuong-ben': (14, 64)}
TEN = {'san0': 'Sàn A', 'san1': 'Sàn B', 'san2': 'Sàn C', 'san-nhan': 'Sàn điểm nhấn', 'ngoai': 'Nền ngoài phòng', 'tuong-sau': 'Tường sau',
       'tuong-truoc': 'Tường trước', 'mep': 'Phủ mép dưới', 'tuong-ben': 'Tường bên (trái)'}
O9 = ['san0', 'san1', 'san2', 'san-nhan', 'ngoai', 'tuong-sau', 'tuong-truoc', 'mep', 'tuong-ben']


def la_nen(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 150) & (b > 150) & (r - g > 80) & (b - g > 80)


def chin_mang(f):
    a = np.array(Image.open(f).convert('RGB'))
    m = nd.binary_opening(~la_nen(a), structure=np.ones((9, 9)))
    lab, n = nd.label(m); sz = nd.sum(m, lab, range(1, n + 1)); idx = np.argsort(sz)[::-1][:9] + 1
    bs = []
    for k in idx:
        sl = nd.find_objects((lab == k).astype(int))[0]; bs.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop))
    bs.sort(key=lambda b: (round((b[1] + b[3]) / 2 / 300), b[0]))
    return a, dict(zip(O9, bs))


def rgba(a):
    al = (~la_nen(a)).astype(np.uint8) * 255
    return np.dstack([a, al])


def co_ve(x, w, h, alpha=False):
    """thu RGBA về w x h (điểm ảnh ảnh, đã nhân N), nhân alpha trước"""
    if CACH == 'net':
        y = thu_net.thu(np.clip(x, 0, 255).astype(np.uint8), w, h)
        if not alpha:
            y[..., 3] = 255
        return y
    x = x.astype(np.float32); al = x[..., 3:4] / 255
    pre = np.concatenate([x[..., :3] * al, x[..., 3:4]], 2)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((w, h), Image.BOX if w < x.shape[1] else Image.LANCZOS)) for k in range(4)]
    A = np.clip(ch[3], 0, 255); o = np.zeros((h, w, 4), np.float32)
    for k in range(3): o[..., k] = np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0)
    o[..., 3] = (A >= 128) * 255 if alpha else 255
    return np.clip(o, 0, 255).astype(np.uint8)


def tron_ngang(x, b):
    """lặp ngang liền: trộn b cột cuối vào b cột đầu rồi bỏ b cột cuối"""
    w = x.shape[1] - b; o = x[:, :w].astype(np.float32).copy()
    for i in range(b):
        k = (i + 0.5) / b; o[:, i] = x[:, w + i] * (1 - k) + x[:, i] * k
    return o


def tron_doc(x, b):
    return np.transpose(tron_ngang(np.transpose(x, (1, 0, 2)), b), (1, 0, 2))


def tron_alpha(o):
    o = o.copy(); o[..., 3] = np.where(o[..., 3] >= 128, 255, 0); return o


def png(x, so_mau=64):
    x = np.clip(x, 0, 255).astype(np.uint8)
    im = Image.fromarray(x, 'RGBA')
    if (x[..., 3] == 255).all():
        q = Image.fromarray(x[..., :3]).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True); return buf.getvalue(), np.array(q.convert('RGBA'))
    op = x[..., 3] > 0
    q = Image.fromarray(x[..., :3]).quantize(colors=so_mau, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    y = np.array(q.convert('RGBA')); y[..., 3] = np.where(op, 255, 0); y[~op, :3] = 0
    im = Image.fromarray(y, 'RGBA').quantize(colors=so_mau + 1, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    z = np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA'))
    if not (z == y).all():
        buf = io.BytesIO(); Image.fromarray(y, 'RGBA').save(buf, 'PNG', optimize=True)
    return buf.getvalue(), y


def ghi(vung, k, x):
    data, y = png(x)
    w, h = CO[k]; assert y.shape[:2] == (h * N, w * N), (k, y.shape)
    ma = 'gd-nen-%s-%s' % (vung, k)
    t = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': ma, 'ten': TEN[k], 'doi_tuong': 'giao-dien', 'rong': w, 'cao': h, 'net': N,
         'anh': 'data:image/png;base64,' + base64.b64encode(data).decode()}
    Image.fromarray(y).save(os.path.join(RA, ma + '.png'))
    print(ma, w, h, len(data), 'B')


def ron(x, truc):
    """vị trí 3 đường ron trong (tối) theo trục (0: cột x, 1: hàng y) của mảng sàn lưới 4x4"""
    g = x[..., :3].astype(float).mean(2); p = g.mean(0) if truc == 0 else g.mean(1); n = len(p); kq = []
    for f in (0.25, 0.5, 0.75):
        lo, hi = int(n * (f - 0.08)), int(n * (f + 0.08)); kq.append(lo + float(np.argmin(np.convolve(p[lo:hi], np.ones(3) / 3, 'same'))))
    return kq


def cat_luoi(a, b):
    x0, y0, x1, y1 = b; x = a[y0:y1, x0:x1]
    cx = ron(x, 0); cy = ron(x, 1); px = (cx[2] - cx[0]) / 2; py = (cy[2] - cy[0]) / 2
    X0, X1 = cx[0] - px, cx[2] + px; Y0, Y1 = cy[0] - py, cy[2] + py
    X0, Y0 = max(0, int(round(X0))), max(0, int(round(Y0))); X1, Y1 = min(x.shape[1], int(round(X1))), min(x.shape[0], int(round(Y1)))
    return x[Y0:Y1, X0:X1]


def thut(a, b, l, t, r, d):
    x0, y0, x1, y1 = b; w, h = x1 - x0, y1 - y0
    return a[int(y0 + h * t):int(y1 - h * d), int(x0 + w * l):int(x1 - w * r)]


def tuong_ngang(x, w, h, alpha=False, b=6):
    """co về (w + b) x h rồi trộn ngang b cột -> w x h lặp ngang liền"""
    y = co_ve(rgba(x) if x.shape[2] == 3 else x, (w + b) * N, h * N, alpha)
    o = tron_ngang(y, b * N)
    return tron_alpha(o) if alpha else o


def tuong_doc(x, w, h, alpha=False, b=6):
    y = co_ve(rgba(x) if x.shape[2] == 3 else x, w * N, (h + b) * N, alpha)
    o = tron_doc(y, b * N)
    return tron_alpha(o) if alpha else o


def lot(x, mau):
    y = rgba(x).astype(np.float32); al = y[..., 3:4] / 255; c = np.array(mau, np.float32)
    y[..., :3] = y[..., :3] * al + c * (1 - al); y[..., 3] = 255; return y.astype(np.uint8)


def mat_na(S, vao, mep):
    """1 ở giữa, giảm dần về 0 trong dải [vao, vao + mep] tính từ mép (tỉ lệ cạnh)"""
    t = (np.arange(S) + 0.5) / S; d = np.minimum(t, 1 - t)
    k = np.clip((d - vao) / mep, 0, 1); k = k * k * (3 - 2 * k)
    return np.minimum(k[None, :], k[:, None])[..., None]


# ===================== LÂU ĐÀI =====================
a, B = chin_mang(os.path.join(GOC, 'lau-dai-9-mang.png'))
for k in ('san0', 'san1', 'san2', 'san-nhan'):
    ghi('lau', k, co_ve(rgba(cat_luoi(a, B[k])), 64 * N, 64 * N))
ghi('lau', 'ngoai', tron_doc(tron_ngang(co_ve(rgba(thut(a, B['ngoai'], .03, .03, .03, .03)), 70 * N, 70 * N), 6 * N), 6 * N))
# tường sau: giữa cột đỏ 1 -> giữa cột đỏ 3
x0, y0, x1, y1 = B['tuong-sau']; x = a[y0:y1, x0:x1].astype(int)
giua = x[int(x.shape[0] * .35):int(x.shape[0] * .8)]
do = ((giua[..., 0] > 110) & (giua[..., 0] - giua[..., 2] > 45) & (giua[..., 1] < 90)).mean(0)
cot = []
for c in np.argsort(do)[::-1]:
    if do[c] < 0.25: break
    if all(abs(c - q) > 40 for q in cot): cot.append(int(c))
cot = sorted(cot)
# gom tâm từng cột đỏ (dải liền quanh đỉnh)
def tam(c):
    l = c
    while l > 0 and do[l - 1] > 0.25: l -= 1
    r = c
    while r < len(do) - 1 and do[r + 1] > 0.25: r += 1
    return (l + r) / 2
cot = [tam(c) for c in cot]
print('lau tuong-sau cot do', [round(c) for c in cot])
assert len(cot) >= 3
xs = a[y0:y1, x0 + int(round(cot[0])):x0 + int(round(cot[2]))]
ghi('lau', 'tuong-sau', tuong_ngang(xs, 64, 49))
ghi('lau', 'tuong-truoc', tuong_ngang(lot(thut(a, B['tuong-truoc'], .03, .0, .03, .0), (0x24, 0x1c, 0x1d)), 64, 12))
ghi('lau', 'mep', tuong_ngang(rgba(thut(a, B['mep'], .02, 0, .02, 0)), 64, 12, alpha=True))
ghi('lau', 'tuong-ben', tuong_doc(thut(a, B['tuong-ben'], 0, .02, 0, .02), 14, 64))

# ===================== HANG BIỂN =====================
a, B = chin_mang(os.path.join(GOC, 'hang-bien-9-mang.png'))
ghi('bien', 'ngoai', tron_doc(tron_ngang(co_ve(rgba(thut(a, B['ngoai'], .03, .03, .03, .03)), 70 * N, 70 * N), 6 * N), 6 * N))
ghi('bien', 'tuong-sau', tuong_ngang(thut(a, B['tuong-sau'], .03, .02, .03, .0), 64, 49))
ghi('bien', 'tuong-truoc', tuong_ngang(lot(thut(a, B['tuong-truoc'], .02, .05, .02, 0), (0x14, 0x1d, 0x29)), 64, 12))
ghi('bien', 'mep', tuong_ngang(rgba(thut(a, B['mep'], .02, 0, .02, 0)), 64, 12, alpha=True))
ghi('bien', 'tuong-ben', tuong_doc(rgba(thut(a, B['tuong-ben'], 0, .03, 0, .03)), 14, 64, alpha=True))
# sàn: tấm liền
L = np.array(Image.open(os.path.join(GOC, 'hang-bien-san-lien.png')).convert('RGB')).astype(np.float32)
S, M = 512, 64
def vung(x, y): return L[y:y + S + M, x:x + S + M]
T0 = tron_doc(tron_ngang(np.dstack([vung(40, 40), np.full((S + M, S + M, 1), 255, np.float32)]), M)[:, :, :], M)  # S x S, liền 4 mép
assert T0.shape[:2] == (S, S)
MK = mat_na(S, 0.05, 0.13)
def dat_giua(C):
    return C * MK + T0 * (1 - MK)
ghi('bien', 'san0', co_ve(T0.astype(np.uint8), 64 * N, 64 * N))
for k, (x, y) in (('san1', (660, 70)), ('san2', (360, 660))):
    C = np.dstack([L[y:y + S, x:x + S], np.full((S, S, 1), 255, np.float32)])
    ghi('bien', k, co_ve(dat_giua(C).astype(np.uint8), 64 * N, 64 * N))
# điểm nhấn: lòng ô 4 (bỏ viền đá 13%), giữ cỡ (mảng 9-mảng ~340 điểm gốc = 64 game -> trong S = 512 điểm sàn liền)
x0, y0, x1, y1 = B['san-nhan']; w, h = x1 - x0, y1 - y0
inn = a[int(y0 + h * .13):int(y1 - h * .13), int(x0 + w * .13):int(x1 - w * .13)]
kx = int(round(S * inn.shape[1] / w)); ky = int(round(S * inn.shape[0] / h))
I = np.array(Image.fromarray(inn).resize((kx, ky), Image.LANCZOS)).astype(np.float32)
C = T0.copy(); oy, ox = (S - ky) // 2, (S - kx) // 2; C[oy:oy + ky, ox:ox + kx, :3] = I
MK2 = np.zeros((S, S, 1), np.float32); mk = mat_na(max(kx, ky), 0.0, 0.16)[:ky, :kx] if kx == ky else None
if mk is None:
    tx = (np.arange(kx) + .5) / kx; ty = (np.arange(ky) + .5) / ky
    fx = np.clip(np.minimum(tx, 1 - tx) / .16, 0, 1); fy = np.clip(np.minimum(ty, 1 - ty) / .16, 0, 1)
    mk = np.minimum(fx[None, :], fy[:, None])[..., None]; mk = mk * mk * (3 - 2 * mk)
MK2[oy:oy + ky, ox:ox + kx] = mk
ghi('bien', 'san-nhan', co_ve((C * MK2 + T0 * (1 - MK2)).astype(np.uint8), 64 * N, 64 * N))
